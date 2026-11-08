# waits for the voice pass, then rebuilds everything and makes phone copies
until grep -q "aligned" voicelab/redo_run.log 2>/dev/null; do sleep 20; done
grep -E "wps min|aligned" voicelab/redo_run.log
FF="$LOCALAPPDATA/Microsoft/WinGet/Links/ffmpeg.exe"
for e in the-3am-bug so-basically make-it-better forty-pages; do node v3/prep.js $e || exit 1; done
bash v3/render-all.sh 2>&1 | grep -v -i "zod\|mismatch\|breakage\|resolve:\|^.\[33m-*.\[39m$"
mkdir -p v3/out/phone
for e in the-3am-bug so-basically make-it-better forty-pages; do "$FF" -y -v error -i v3/out/$e.mp4 -c:v libx264 -preset slow -crf 25 -maxrate 3.6M -bufsize 7M -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart v3/out/phone/$e.mp4; done
ls -la v3/out/phone; echo PIPEDONE
