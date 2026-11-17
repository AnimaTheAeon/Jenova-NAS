//! Updates from GitHub releases.
//!
//! The service (running as the Jenova user) checks GitHub twice a day so the
//! window can show what's available. Installing needs root, which DSM only
//! gives packages through a Task Scheduler task running `jenova-nas update`.
//!
//! "Update now" in the window needs no task: the service downloads the new
//! package itself, unpacks the program into `<JENOVA_UPDATE_DIR>/next` and exits
//! with RESTART_CODE; jenova-run.sh swaps it in and starts it again. The
//! scheduled task stays for hands-off updates and also refreshes the window's
//! own files, which only a real package install can replace.

use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::config::{var_dir, Config};
use crate::{info, warn};

pub const REPO: &str = "AnimaTheAeon/Jenova-NAS";
const CHECK_EVERY: Duration = Duration::from_secs(12 * 3600);
const SYNOPKG: &str = "/usr/syno/bin/synopkg";
const PACKAGE: &str = "Jenova";

#[derive(Clone, Debug, PartialEq)]
pub struct Release {
    pub version: String,
    pub notes: String,
    pub spk_url: String,
    pub spk_name: String,
    pub sha256: Option<String>,
    pub size: u64,
}

/// What the background check last saw.
#[derive(Default, Clone)]
struct CheckState {
    checking: bool,
    checked_at: u64,
    latest: Option<Release>,
    error: String,
}

/// Written by the root task after each run, read by the window.
#[derive(Serialize, Deserialize, Default, Clone)]
#[serde(default)]
pub struct InstallResult {
    pub time: u64,
    pub ok: bool,
    pub from: String,
    pub to: String,
    pub message: String,
}

fn state() -> &'static Mutex<CheckState> {
    static STATE: OnceLock<Mutex<CheckState>> = OnceLock::new();
    STATE.get_or_init(Default::default)
}

fn trigger() -> &'static Mutex<Option<Sender<()>>> {
    static TX: OnceLock<Mutex<Option<Sender<()>>>> = OnceLock::new();
    TX.get_or_init(Default::default)
}

fn now() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)
}

pub fn current_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

/// `true` when `latest` is a higher x.y.z than `current`.
pub fn is_newer(latest: &str, current: &str) -> bool {
    fn parts(v: &str) -> Vec<u64> {
        v.trim()
            .trim_start_matches(['v', 'V'])
            .split(['-', '+'])
            .next()
            .unwrap_or("")
            .split('.')
            .map(|p| p.parse().unwrap_or(0))
            .collect()
    }
    let (a, b) = (parts(latest), parts(current));
    for i in 0..a.len().max(b.len()) {
        let (x, y) = (a.get(i).copied().unwrap_or(0), b.get(i).copied().unwrap_or(0));
        if x != y {
            return x > y;
        }
    }
    false
}

fn curl(args: &[&str]) -> Result<Vec<u8>, String> {
    let output = Command::new("curl")
        .args(["-fsSL", "--retry", "2", "--connect-timeout", "20", "-A", "Jenova-NAS"])
        .args(args)
        .output()
        .map_err(|e| format!("Couldn't run curl: {e}"))?;
    if output.status.success() {
        Ok(output.stdout)
    } else {
        // curl's own message names the server, so it isn't shown.
        Err(match output.status.code() {
            Some(22) => "The update server answered with an error. Try again later.".into(),
            Some(28) => "The update server took too long to answer. Try again later.".into(),
            _ => "Couldn't reach the update server. Check the internet connection and try again.".into(),
        })
    }
}

pub fn parse_release(json: &Value) -> Result<Release, String> {
    let tag = json["tag_name"].as_str().ok_or("The update server's answer had no version")?;
    let asset = json["assets"]
        .as_array()
        .into_iter()
        .flatten()
        .find(|a| a["name"].as_str().is_some_and(|n| n.ends_with("-x86_64.spk")))
        .ok_or("The latest release has no .spk for this NAS")?;
    Ok(Release {
        version: tag.trim_start_matches(['v', 'V']).to_string(),
        notes: json["body"].as_str().unwrap_or("").to_string(),
        spk_url: asset["browser_download_url"].as_str().ok_or("Missing download link")?.to_string(),
        spk_name: asset["name"].as_str().unwrap_or("Jenova.spk").to_string(),
        sha256: asset["digest"]
            .as_str()
            .and_then(|d| d.strip_prefix("sha256:"))
            .map(|d| d.to_ascii_lowercase()),
        size: asset["size"].as_u64().unwrap_or(0),
    })
}

pub fn latest_release() -> Result<Release, String> {
    let url = std::env::var("JENOVA_RELEASE_URL").unwrap_or_else(|_| format!("https://api.github.com/repos/{REPO}/releases/latest"));
    let body = curl(&["--max-time", "60", "-H", "Accept: application/vnd.github+json", &url])?;
    let json: Value = serde_json::from_slice(&body).map_err(|_| "The update server sent an answer Jenova couldn't read. Try again later.".to_string())?;
    parse_release(&json)
}

// ---------- background check (service) ----------

pub fn start_checker() {
    let (tx, rx) = mpsc::channel();
    *trigger().lock().unwrap_or_else(|e| e.into_inner()) = Some(tx);
    std::thread::Builder::new()
        .name("update-check".into())
        .spawn(move || checker(rx))
        .ok();
}

fn checker(rx: Receiver<()>) {
    // Let the service settle first.
    let mut wait = Duration::from_secs(60);
    loop {
        match rx.recv_timeout(wait) {
            Ok(()) | Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => return,
        }
        check_now_blocking();
        wait = CHECK_EVERY;
    }
}

fn check_now_blocking() {
    state().lock().unwrap_or_else(|e| e.into_inner()).checking = true;
    let result = latest_release();
    let mut s = state().lock().unwrap_or_else(|e| e.into_inner());
    s.checking = false;
    s.checked_at = now();
    match result {
        Ok(release) => {
            if is_newer(&release.version, current_version())
                && s.latest.as_ref().map(|r| &r.version) != Some(&release.version)
            {
                info!("Update available: Jenova {}", release.version);
            }
            s.latest = Some(release);
            s.error.clear();
        }
        Err(error) => {
            warn!("Update check failed: {error}");
            s.error = error;
        }
    }
}

pub fn request_check() {
    state().lock().unwrap_or_else(|e| e.into_inner()).checking = true;
    if let Some(tx) = trigger().lock().unwrap_or_else(|e| e.into_inner()).as_ref() {
        let _ = tx.send(());
    }
}

fn result_path() -> PathBuf {
    var_dir().join("update_result.json")
}

pub fn last_install() -> Option<InstallResult> {
    std::fs::read(result_path()).ok().and_then(|b| serde_json::from_slice(&b).ok())
}

pub fn status_json() -> Value {
    let s = state().lock().unwrap_or_else(|e| e.into_inner()).clone();
    let latest = s.latest.as_ref();
    json!({
        "current": current_version(),
        "latest": latest.map(|r| r.version.clone()),
        "available": latest.is_some_and(|r| is_newer(&r.version, current_version())),
        "notes": latest.map(|r| r.notes.clone()),
        "checking": s.checking,
        "checked_at": s.checked_at,
        "error": s.error,
        "now": now(),
        "last_install": last_install(),
        "command": command_line(),
        "can_install_now": can_install_now(),
        "window_updates": std::env::var("JENOVA_WINDOW_UPDATES").is_ok(),
        "progress": progress().lock().unwrap_or_else(|e| e.into_inner()).clone(),
    })
}

pub fn command_line() -> String {
    std::env::var("SYNOPKG_PKGDEST")
        .map(|d| format!("{d}/bin/jenova-nas update"))
        .unwrap_or_else(|_| format!("/var/packages/{PACKAGE}/target/bin/jenova-nas update"))
}

// ---------- installing from the window (no root) ----------

/// Exit code that tells jenova-run.sh "start me again".
pub const RESTART_CODE: i32 = 75;

static INSTALLING: AtomicBool = AtomicBool::new(false);

/// What "Update now" is doing, for the window.
#[derive(Serialize, Clone, Default)]
pub struct Progress {
    pub to: String,
    /// "download", "verify", "restart" or "failed".
    pub phase: String,
    pub done: u64,
    pub total: u64,
    pub message: String,
}

fn progress() -> &'static Mutex<Option<Progress>> {
    static P: OnceLock<Mutex<Option<Progress>>> = OnceLock::new();
    P.get_or_init(Default::default)
}

fn set_progress(to: &str, phase: &str, done: u64, total: u64, message: &str) {
    *progress().lock().unwrap_or_else(|e| e.into_inner()) =
        Some(Progress { to: to.into(), phase: phase.into(), done, total, message: message.into() });
}

fn update_dir() -> Option<PathBuf> {
    std::env::var("JENOVA_UPDATE_DIR").ok().filter(|d| !d.trim().is_empty()).map(PathBuf::from)
}

/// True when the service can install updates by itself (jenova-run.sh runs it).
pub fn can_install_now() -> bool {
    update_dir().is_some()
}

/// "Update now": download, check and unpack in the background, then restart.
pub fn start_install() -> Result<(), String> {
    let dir = update_dir().ok_or("Jenova wasn't started by its package script, so it can't update itself. Install the new Jenova package in Package Center.")?;
    let release = state()
        .lock()
        .unwrap_or_else(|e| e.into_inner())
        .latest
        .clone()
        .filter(|r| is_newer(&r.version, current_version()))
        .ok_or("There's no newer version to install")?;
    if INSTALLING.swap(true, Ordering::SeqCst) {
        return Err("An update is already running".into());
    }
    set_progress(&release.version, "download", 0, release.size, "");
    std::thread::Builder::new()
        .name("update-install".into())
        .spawn(move || {
            let from = current_version().to_string();
            info!("Updating Jenova {from} -> {}", release.version);
            match install_into(&release, &dir) {
                Ok(()) => {
                    record(true, &from, &release.version, &format!("Updated to {}", release.version));
                    set_progress(&release.version, "restart", 1, 1, "");
                    // Give the window a moment to see "restart", then stop the
                    // Subliminal downloads and exit; jenova-run.sh does the swap.
                    std::thread::sleep(Duration::from_secs(2));
                    let _ = Command::new("pkill").args(["-TERM", "-P", &std::process::id().to_string()]).status();
                    let _ = std::fs::remove_file(var_dir().join("jenova.pid"));
                    std::process::exit(RESTART_CODE);
                }
                Err(e) => {
                    warn!("Update failed: {e}");
                    record(false, &from, &release.version, &e);
                    set_progress(&release.version, "failed", 0, 0, &e);
                    INSTALLING.store(false, Ordering::SeqCst);
                }
            }
        })
        .map(|_| ())
        .map_err(|e| e.to_string())
}

fn tar(args: &[&str]) -> Result<(), String> {
    let out = Command::new("tar").args(args).output().map_err(|e| format!("Couldn't run tar: {e}"))?;
    if out.status.success() {
        Ok(())
    } else {
        Err(format!("Couldn't unpack the download: {}", String::from_utf8_lossy(&out.stderr).trim()))
    }
}

/// Download the package, check it and leave the new program in `<dir>/next`.
fn install_into(release: &Release, dir: &Path) -> Result<(), String> {
    let work = dir.join("work");
    let _ = std::fs::remove_dir_all(&work);
    std::fs::create_dir_all(&work).map_err(|e| e.to_string())?;
    let result = (|| {
        let spk = work.join("download.spk");
        let spk_str = spk.to_string_lossy().to_string();
        let mut child = Command::new("curl")
            .args(["-fsSL", "--retry", "2", "--connect-timeout", "20", "--max-time", "900", "-A", "Jenova-NAS", "-o", &spk_str, &release.spk_url])
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Download failed: couldn't run curl: {e}"))?;
        let status = loop {
            if let Some(st) = child.try_wait().map_err(|e| e.to_string())? {
                break st;
            }
            let done = std::fs::metadata(&spk).map(|m| m.len()).unwrap_or(0);
            set_progress(&release.version, "download", done, release.size, "");
            std::thread::sleep(Duration::from_millis(400));
        };
        if !status.success() {
            let mut err = String::new();
            if let Some(mut e) = child.stderr.take() {
                use std::io::Read;
                let _ = e.read_to_string(&mut err);
            }
            let _ = err; // curl's message names the server
            return Err("Download failed: couldn't reach the update server. Try again.".into());
        }
        let size = std::fs::metadata(&spk).map(|m| m.len()).unwrap_or(0);
        set_progress(&release.version, "verify", size, size, "");
        if let Some(expected) = &release.sha256 {
            if &sha256_file(&spk)? != expected {
                return Err("The download didn't match its checksum. Nothing was changed.".to_string());
            }
        }
        let outer = work.join("outer");
        std::fs::create_dir_all(&outer).map_err(|e| e.to_string())?;
        tar(&["-xf", &spk_str, "-C", &outer.to_string_lossy()])?;
        let staged = work.join("staged");
        std::fs::create_dir_all(&staged).map_err(|e| e.to_string())?;
        tar(&["-xzf", &outer.join("package.tgz").to_string_lossy(), "-C", &staged.to_string_lossy()])?;
        let exe = staged.join("bin").join("jenova-nas");
        if !exe.is_file() {
            return Err("The download has no Jenova program in it. Nothing was changed.".into());
        }
        {
            use std::os::unix::fs::PermissionsExt;
            let _ = std::fs::set_permissions(&exe, std::fs::Permissions::from_mode(0o755));
        }
        let said = Command::new(&exe).arg("version").output().map_err(|e| format!("The new program won't start: {e}"))?;
        if String::from_utf8_lossy(&said.stdout).trim() != release.version {
            return Err("The downloaded program isn't the version that was offered. Nothing was changed.".into());
        }
        let next = dir.join("next");
        let _ = std::fs::remove_dir_all(&next);
        std::fs::rename(&staged, &next).map_err(|e| format!("Couldn't put the update in place: {e}"))?;
        Ok(())
    })();
    let _ = std::fs::remove_dir_all(&work);
    result
}

// ---------- installing (root, from Task Scheduler) ----------

/// `jenova-nas update [--force]`. Returns the process exit code.
pub fn run_cli(args: &[String]) -> i32 {
    let force = args.iter().any(|a| a == "--force");
    let check_only = args.iter().any(|a| a == "--check");
    if check_only {
        return match latest_release() {
            Ok(r) => {
                println!("Installed {}, latest {}", current_version(), r.version);
                0
            }
            Err(e) => {
                eprintln!("{e}");
                1
            }
        };
    }
    // SAFETY: geteuid has no preconditions.
    if unsafe { libc::geteuid() } != 0 {
        eprintln!("Installing updates needs root. Run this from DSM Task Scheduler with User: root.");
        return 1;
    }
    let config = Config::load(&var_dir().join("config.json"));
    if !config.auto_update && !force {
        println!("Automatic updates are off in Jenova's Config page. Nothing to do.");
        return 0;
    }
    let installed = installed_version().unwrap_or_else(|| current_version().to_string());
    let release = match latest_release() {
        Ok(r) => r,
        Err(e) => {
            // A failed check isn't worth recording over a good install result.
            eprintln!("Update check failed: {e}");
            return 1;
        }
    };
    if !is_newer(&release.version, &installed) {
        println!("Jenova {installed} is up to date.");
        record(true, &installed, &installed, "Up to date");
        return 0;
    }
    println!("Updating Jenova {installed} -> {}", release.version);
    match install(&release) {
        Ok(()) => {
            let msg = format!("Updated to {}", release.version);
            println!("{msg}");
            record(true, &installed, &release.version, &msg);
            0
        }
        Err(e) => {
            eprintln!("Update failed: {e}");
            record(false, &installed, &release.version, &e);
            1
        }
    }
}

/// The version DSM has installed, e.g. "1.0.4" from "1.0.4-0012".
fn installed_version() -> Option<String> {
    let info = std::fs::read_to_string(format!("/var/packages/{PACKAGE}/INFO")).ok()?;
    info.lines()
        .find_map(|l| l.strip_prefix("version="))
        .map(|v| v.trim_matches('"').split('-').next().unwrap_or("").to_string())
        .filter(|v| !v.is_empty())
}

fn record(ok: bool, from: &str, to: &str, message: &str) {
    let result = InstallResult { time: now(), ok, from: from.into(), to: to.into(), message: message.into() };
    if let Ok(bytes) = serde_json::to_vec_pretty(&result) {
        let path = result_path();
        if crate::config::write_atomic(&path, &bytes).is_ok() {
            use std::os::unix::fs::PermissionsExt;
            let _ = std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o644));
        }
    }
}

fn install(release: &Release) -> Result<(), String> {
    let dir = std::env::temp_dir().join(format!("jenova-update-{}", std::process::id()));
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let result = download_and_install(release, &dir);
    let _ = std::fs::remove_dir_all(&dir);
    result
}

fn download_and_install(release: &Release, dir: &Path) -> Result<(), String> {
    let spk = dir.join(&release.spk_name);
    let spk_str = spk.to_string_lossy().to_string();
    curl(&["--max-time", "600", "-o", &spk_str, &release.spk_url]).map_err(|e| format!("Download failed: {e}"))?;
    if let Some(expected) = &release.sha256 {
        let actual = sha256_file(&spk)?;
        if &actual != expected {
            return Err("The download didn't match its checksum".into());
        }
    }
    let was_running = Command::new(SYNOPKG).args(["is_onoff", PACKAGE]).output().ok().map(|o| {
        let out = String::from_utf8_lossy(&o.stdout).to_lowercase();
        o.status.success() && !out.contains("not")
    });
    let output = Command::new(SYNOPKG)
        .args(["install", &spk_str])
        .output()
        .map_err(|e| format!("Couldn't run synopkg: {e}"))?;
    let text = format!("{}{}", String::from_utf8_lossy(&output.stdout), String::from_utf8_lossy(&output.stderr));
    if !output.status.success() || text.contains("\"success\":false") {
        let text = text.trim();
        return Err(if text.is_empty() { "synopkg install failed".into() } else { format!("synopkg: {text}") });
    }
    if was_running != Some(false) {
        let _ = Command::new(SYNOPKG).args(["start", PACKAGE]).output();
    }
    Ok(())
}

fn sha256_file(path: &Path) -> Result<String, String> {
    let output = Command::new("sha256sum").arg(path).output().map_err(|e| format!("Couldn't run sha256sum: {e}"))?;
    String::from_utf8_lossy(&output.stdout)
        .split_whitespace()
        .next()
        .map(|s| s.to_ascii_lowercase())
        .filter(|s| s.len() == 64)
        .ok_or_else(|| "Couldn't verify the download".into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_compare() {
        assert!(is_newer("1.0.5", "1.0.4"));
        assert!(is_newer("v1.1.0", "1.0.9"));
        assert!(is_newer("1.0.10", "1.0.9"));
        assert!(!is_newer("1.0.4", "1.0.4"));
        assert!(!is_newer("1.0.3", "1.0.4"));
        assert!(!is_newer("1.0.4-0012", "1.0.4"));
    }

    #[test]
    fn release_parsing() {
        let json = json!({
            "tag_name": "v1.0.5",
            "html_url": "https://github.com/x/y/releases/tag/v1.0.5",
            "assets": [
                {"name": "notes.txt", "browser_download_url": "https://x/notes.txt"},
                {"name": "Jenova-1.0.5-x86_64.spk", "browser_download_url": "https://x/j.spk", "digest": "sha256:ABCD"}
            ]
        });
        let r = parse_release(&json).unwrap();
        assert_eq!(r.version, "1.0.5");
        assert_eq!(r.spk_url, "https://x/j.spk");
        assert_eq!(r.sha256.as_deref(), Some("abcd"));
        assert!(parse_release(&json!({"tag_name": "v1", "assets": []})).is_err());
    }
}
