# <img src="./ui/images/jenova_256.png" align="left" width="42" style="padding-right:15px"> Jenova for Synology

Watches your media folders on a Synology NAS and downloads subtitles for new videos automatically, using [Subliminal](https://github.com/Diaoul/subliminal). It runs as a lightweight DSM package and opens in its own window from the DSM main menu, with the same menu-style interface as [Jenova for Windows](https://github.com/AnimaTheAeon/Jenova).

- **Light:** a single ~1 MB service. Idle, it uses no CPU and a few MB of memory, so your disks can sleep. Subliminal only runs (at low priority) while a video is being processed.
- **Live watching, media folders only:** new files are picked up instantly. Jenova watches each media folder individually and never watches `@eaDir`, `#recycle`, `#snapshot` or other DSM system folders (often 80% fewer watches). Config shows how many folders are watched live against DSM's limit. If a library is too big for the limit, that folder switches to a light poll that lists video files only.
- **Waits for copies to finish:** a file copied in over the network is only processed after it stops changing (60 s by default).
- **Never downloads over existing subtitles:** each video is checked again right before downloading.
- **Synology-aware:** skips `@eaDir`, `#recycle`, `#snapshot` and other DSM system folders, and Plex extras folders if you want.
- **Private:** only DSM administrators can open it, it opens no network ports, and it sends no notifications. Results show on the Downloads page and in the Log.
- **Cleanup:** Config → Subtitle backups finds and deletes the `.bak` copies older Windows versions left next to subtitles.

## Install

For x86-64 Synology models such as the DS923+, on DSM 7.2.

1. Download `Jenova-<version>-x86_64.spk` from the [latest release](https://github.com/AnimaTheAeon/Jenova-NAS/releases/latest).
2. **Package Center → Manual Install →** choose the file **→ Next.** DSM will warn that the package is from an unknown publisher (normal for self-built packages). It installs Synology's **Python 3.9** package automatically if you don't have it.
3. Let Jenova into your media folders: **Control Panel → Shared Folder →** select the share (e.g. `video`) **→ Edit → Permissions →** switch to **System internal user →** tick **Read/Write** for **Jenova → Save**.
4. Open **Jenova** from the DSM main menu and **Add Folder**. The first start installs Subliminal into Jenova's own data folder, which takes a few minutes; Config shows the progress.

**Updating:** install the newer .spk the same way. Settings and history are kept.

**Files:** settings, history and logs live in `/var/packages/Jenova/var` (log: `jenova.log`).

## Pages

| Page | What it's for |
| --- | --- |
| **Watch** | Add or remove watched folders, turn watching on or off, check existing files. |
| **Downloads** | What Jenova looked for, newest first: found, none found, already had subtitles, failed. |
| **Language** | Subtitle languages, SDH, embedded subtitles, Plex extras. |
| **Matching** | Providers, refiners, minimum score, OpenSubtitles.com account. |
| **Config** | Subliminal status, settle time, polling, retries, concurrent downloads, subtitle backup cleanup. |
| **Log** | Recent activity. |

## How it fits into DSM

- `bin/jenova-nas daemon` is the service DSM starts and stops. It listens only on `127.0.0.1`.
- The window is a small DSM app (`ui/Jenova.js`) that shows `ui/index.html`. The page talks to the service through `ui/api.cgi`, which DSM runs. Every request is checked against your DSM session with DSM's own `authenticate.cgi`, and only administrators get in.
- Subliminal runs from Synology's Python 3.9. Subliminal 2.6 is the newest version that supports it; it has the same options Jenova uses on Windows.

## Building

```
cargo test
cargo build --release --target x86_64-unknown-linux-musl   # static binary
./build-spk.sh target/x86_64-unknown-linux-musl/release/jenova-nas dist
```

GitHub Actions builds and tests every push. Bumping `version` in `Cargo.toml` and pushing to `main` publishes a release `v<version>` with the `.spk` attached.

## Credits

- [Subliminal](https://github.com/Diaoul/subliminal): subtitle search and download.
- Menu font: [Nunito](https://github.com/googlefonts/nunito) (SIL Open Font License, `ui/fonts/Nunito-OFL.txt`).

## How it works

- Two looks, picked under **Settings → Look**: the FFVII menu, or **Box of X** (green orb home screen; arrow keys and Enter to pick a page, Esc to go back).
- Three pages: **Watch** (folders, Check existing files, Scan a folder once), **Activity** (what Jenova looked at and the result) and **Settings** (languages, watching, downloads, subtitle sites, updates; technical options under **Advanced**; **View Log** at the top).
- New arrivals go to the front of the queue. Up to 3 downloads run at once by default (5 at most).
- When nothing is online yet, the video is tried again after 6 hours, then 1 day, 3 days, and weekly after that.
- Existing files are checked at most once a day, so restarts don't re-search the library.

## Automatic updates

Jenova checks GitHub twice a day and shows what's available on its **Config** page. DSM only lets packages install updates through a root scheduled task, so set this up once:

**Control Panel → Task Scheduler → Create → Scheduled Task → User-defined script**
- General: User **root**
- Schedule: daily
- Run command: `/var/packages/Jenova/target/bin/jenova-nas update`

The task does nothing when Jenova is up to date or when **Install updates from GitHub automatically** is off. Each download is checked against GitHub's SHA-256 before it's installed.


Box of X font: [Orbitron](https://github.com/theleagueof/orbitron) (SIL Open Font License, `ui/fonts/Orbitron-OFL.txt`).
