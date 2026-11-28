#!/bin/sh
# usage: sh scripts/dev/emu-shot.sh <wait-seconds> [adb shell args...]
# runs the command on the emulator, waits, saves a half-size screenshot to $TMPDIR/emu/s.png
A="$HOME/Library/Android/sdk/platform-tools/adb"; D="${TMPDIR:-/tmp}/emu"; mkdir -p "$D"; W=$1; shift
[ $# -gt 0 ] && "$A" shell "$@" >/dev/null 2>&1
perl -e "select(undef,undef,undef,$W)"
"$A" exec-out screencap -p > "$D/phone.png"; sips -Z 1200 "$D/phone.png" --out "$D/s.png" >/dev/null
echo "$D/s.png"
