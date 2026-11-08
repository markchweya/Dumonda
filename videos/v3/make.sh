#!/bin/bash
# One command from script to phone-ready video: lint, voices, timeline, render, phone copy, speech check.
# usage: bash v3/make.sh <name>...    (run from the project root)
export PATH="$LOCALAPPDATA/Microsoft/WinGet/Links:$PATH" PYTHONIOENCODING=utf-8
CH="C:/Program Files/Google/Chrome/Application/chrome.exe"
mkdir -p v3/out/phone v3/work/w
# a killed render leaves its Chrome running; close only render browsers whose parent is gone
reap() { powershell -NoProfile -Command "\$ids = (Get-Process).Id; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -match 'allow-pre-commit-input' -and \$_.CommandLine -notmatch '--type=' -and \$ids -notcontains \$_.ParentProcessId } | ForEach-Object { taskkill /PID \$_.ProcessId /T /F | Out-Null }" 2>/dev/null; }
# the upload copy: Instagram re-compresses everything, so hand it the most detail that fits in 29 MB
# (two-pass x264 tuned for animation, 1080x1920 30 fps, 256k AAC at 48 kHz); bash v3/make.sh --upload <name> redoes just this
upload() {
  local d vb; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 v3/out/$1.mp4)
  vb=$(python -c "print(min(12000, int(29 * 8 * 1000 / $d - 256)))")
  ffmpeg -y -v error -i v3/out/$1.mp4 -c:v libx264 -preset slow -tune animation -profile:v high -b:v ${vb}k -pass 1 -passlogfile v3/work/w/$1 -an -f null NUL &&
  ffmpeg -y -v error -i v3/out/$1.mp4 -c:v libx264 -preset slow -tune animation -profile:v high -b:v ${vb}k -maxrate $((vb * 2))k -bufsize $((vb * 3))k -pass 2 -passlogfile v3/work/w/$1 -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart v3/out/phone/$1.mp4
  rm -f v3/work/w/$1-0.log v3/work/w/$1-0.log.mbtree
}
if [ "$1" = --upload ]; then shift; for e in "$@"; do upload $e; echo "== $e $(du -m v3/out/phone/$e.mp4 | cut -f1)MB"; done; exit; fi
for e in "$@"; do
  node v3/tools/lint.js $e || { echo "!! $e fails lint"; continue; }
  node v3/prep.js $e --lines && python voicelab/edge.py $e && node v3/prep.js $e || { echo "!! $e voice/prep failed"; continue; }
  rm -f v3/out/$e.mp4 v3/out/phone/$e.mp4
  # a stalled WebGL render never exits, so cap each try at 75 minutes and retry once
  for try in 1 2; do
    timeout 4500 npx --no-install remotion render v3/src/index.jsx $e v3/out/$e.mp4 --public-dir=v3/public --port=3931 --timeout=120000 --browser-executable="$CH" --gl=angle --concurrency=2 --crf=14 --x264-preset=slow --audio-bitrate=320k --log=error 2>&1 | grep -iE "^.{0,12}error" | cut -c1-300
    [ -f v3/out/$e.mp4 ] && break; echo "!! $e render try $try timed out or failed"; reap
  done
  [ -f v3/out/$e.mp4 ] || { echo "!! $e render failed"; continue; }
  upload $e
  python -m whisper v3/out/phone/$e.mp4 --model base.en --output_dir v3/work/w --output_format txt --fp16 False --verbose False 2>/dev/null
  echo "== $e $(ffprobe -v error -show_entries format=duration -of csv=p=0 v3/out/phone/$e.mp4)s $(du -m v3/out/phone/$e.mp4 | cut -f1)MB"; tr '\n' ' ' < v3/work/w/$e.txt; echo
done
echo MAKEDONE
