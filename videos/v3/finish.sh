FF="$LOCALAPPDATA/Microsoft/WinGet/Links/ffmpeg.exe"
bash v3/render-all.sh 2>&1 | grep -E "^==|I:|Peak|ALLDONE"
for e in the-3am-bug so-basically make-it-better forty-pages; do "$FF" -y -v error -i v3/out/$e.mp4 -c:v libx264 -preset slow -crf 25 -maxrate 3.6M -bufsize 7M -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart v3/out/phone/$e.mp4; echo "-- $e"; tr '\n' ' ' < v3/work/w/$e.txt; echo; done
ls -la v3/out/phone
