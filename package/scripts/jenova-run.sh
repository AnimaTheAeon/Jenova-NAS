#!/bin/sh
# Runs Jenova on Synology and applies the updates it downloads itself.
# Usage: jenova-run.sh <package var folder> <package folder>
#
# "Update now" in the window unpacks the new program into $UPD/next and exits
# with code 75. This script moves it to $UPD/current and starts it. If an
# update dies within 30 seconds it is moved to $UPD/failed and the program
# from the installed package runs instead. Installing an .spk (by hand or by
# the scheduled task) clears $UPD, so the newest installed version always wins.
VAR="$1"
DEST="$2"
UPD="$VAR/app-update"
export SYNOPKG_PKGVAR="$VAR"
export JENOVA_DATA_DIR="$VAR"
export JENOVA_UPDATE_DIR="$UPD"
# When the package's window folder belongs to this service (set up at install),
# an update also replaces the window's own files, so the screens match the program.
if [ -w "$DEST/ui" ]; then
	export JENOVA_WINDOW_UPDATES=1
fi

mkdir -p "$UPD"

while :; do
	if [ -d "$UPD/next" ]; then
		rm -rf "$UPD/previous"
		[ -d "$UPD/current" ] && mv "$UPD/current" "$UPD/previous"
		mv "$UPD/next" "$UPD/current"
		echo "$(date) jenova-run: switched to the downloaded update"
		if [ -w "$DEST/ui" ] && [ -d "$UPD/current/ui" ]; then
			# Keep the installed window once, so a failed update can put it back.
			[ -d "$UPD/ui-backup" ] || cp -a "$DEST/ui" "$UPD/ui-backup"
			cp -a "$UPD/current/ui/." "$DEST/ui/" && echo "$(date) jenova-run: window files updated"
		fi
	fi

	BIN="$DEST/bin/jenova-nas"
	[ -x "$UPD/current/bin/jenova-nas" ] && BIN="$UPD/current/bin/jenova-nas"

	started=$(date +%s)
	"$BIN" daemon
	rc=$?

	# DSM stopped the service (SIGTERM/SIGINT): leave.
	[ "$rc" = 143 ] || [ "$rc" = 130 ] && exit 0

	# 75 = restart (an update is ready, or a backup was restored).
	if [ "$rc" = 75 ]; then
		sleep 1
		continue
	fi

	if [ "$BIN" != "$DEST/bin/jenova-nas" ] && [ $(( $(date +%s) - started )) -lt 30 ]; then
		echo "$(date) jenova-run: the update stopped within 30 s (exit $rc); going back to the installed version"
		rm -rf "$UPD/failed"
		mv "$UPD/current" "$UPD/failed"
		if [ -d "$UPD/ui-backup" ]; then
			cp -a "$UPD/ui-backup/." "$DEST/ui/" && rm -rf "$UPD/ui-backup"
		fi
		continue
	fi

	# Stopped on purpose (DSM stop, or a clean exit).
	exit "$rc"
done
