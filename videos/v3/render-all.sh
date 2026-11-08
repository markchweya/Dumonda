#!/bin/bash
# Renders every episode, then checks the finished speech with Whisper.
export PATH="$LOCALAPPDATA/Microsoft/WinGet/Links:$PATH" PYTHONIOENCODING=utf-8
CH="C:/Program Files/Google/Chrome/Application/chrome.exe"
for e in the-3am-bug so-basically make-it-better forty-pages; do
  npx --no-install remotion render v3/src/index.jsx $e v3/out/$e.mp4 --public-dir=v3/public --browser-executable="$CH" --gl=angle --concurrency=2 --crf=18 --audio-bitrate=192k --log=error 2>&1 | grep -iE "^.{0,12}error" | cut -c1-300
  echo "== $e $(ffprobe -v error -show_entries format=duration -of csv=p=0 v3/out/$e.mp4)s $(du -m v3/out/$e.mp4 | cut -f1)MB"
  ffmpeg -v info -i v3/out/$e.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
  python -m whisper v3/out/$e.mp4 --model base.en --output_dir v3/work/w --output_format txt --fp16 False --verbose False 2>/dev/null
  cat v3/work/w/$e.txt
  ffmpeg -v error -y -i v3/out/$e.mp4 -vf "fps=1/4,scale=260:-1,tile=6x2" -frames:v 1 v3/work/$e.png
done
echo ALLDONE
