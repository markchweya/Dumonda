"""Voices from edge-tts (Microsoft neural voices, free, no account). Natural pacing and exact word timings.
Claude: Andrew. Nia: Ava. Same rate and pitch on every line for a consistent voice.
usage: python voicelab/edge.py <episode>...   writes v3/work/tts_edge/<key>.wav + .json"""
import sys, os, json, asyncio, subprocess
import numpy as np, soundfile as sf
import edge_tts

OUT = "v3/work/tts_edge"; os.makedirs(OUT, exist_ok=True)
FF = os.path.join(os.environ["LOCALAPPDATA"], "Microsoft/WinGet/Links/ffmpeg.exe")
VOICE = {"claude": "en-US-AndrewNeural", "nia": "en-US-AvaNeural"}   # English-only voices: steady accent on every line
# small delivery nudges per emotion: (rate, pitch)
TONE = {}   # one fixed delivery per character: emotion nudges to rate and pitch made lines sound like different people
VIS = {**{c: "open" for c in "a"}, **{c: "wide" for c in "ei"}, **{c: "round" for c in "ouw"}, **{c: "close" for c in "mbp"}, **{c: "teeth" for c in "fv"}}

def sfx_path(name):
    # a real recording (v3/sfx/<name>-real.wav) wins over the synthesized stand-in
    real = f"v3/sfx/{name}-real.wav"; return real if os.path.exists(real) else f"v3/sfx/{name}.wav"

def sfx(name, sr):
    tmp = f"{OUT}/_sfx.wav"; subprocess.run([FF, "-y", "-v", "error", "-i", sfx_path(name), "-ac", "1", "-ar", str(sr), tmp], check=True)
    x, _ = sf.read(tmp); os.remove(tmp)
    x = x / (np.abs(x).max() + 1e-9) * .55   # sits a little under the voice
    return x

def tighten(a, sr, words, longest=.2):
    # the service leaves ~0.4 s at every full stop, which sounds read aloud; people run connected thoughts together,
    # so shrink any pause inside a line to 0.2 s, cutting only true silence with a short crossfade
    peak = np.abs(a).max() + 1e-9; xf = int(.015 * sr)
    for i in range(len(words) - 2, -1, -1):
        e, s = words[i]["e"], words[i + 1]["s"]; gap = s - e
        if gap <= longest + .02: continue
        c0, c1 = int((e + .06) * sr), int((s - .06) * sr); cut = int((gap - longest) * sr)
        if c1 - c0 < cut + 2 * xf or np.sqrt(np.mean(a[c0:c1] ** 2)) > .03 * peak: continue
        mid = (c0 + c1) // 2; x0, x1 = mid - cut // 2, mid - cut // 2 + cut
        fade = np.linspace(0, 1, xf)
        a = np.concatenate([a[:x0], a[x0:x0 + xf] * (1 - fade) + a[x1:x1 + xf] * fade, a[x1 + xf:]])
        for w in words[i + 1:]: w["s"], w["e"] = round(w["s"] - cut / sr, 3), round(w["e"] - cut / sr, 3)
    return a, words

async def make(l):
    k = l["key"]; mp3, wav = f"{OUT}/{k}.mp3", f"{OUT}/{k}.wav"
    rate, pitch = TONE.get(l["emo"], ("+0%", "+0Hz"))
    c = edge_tts.Communicate(l["say"], VOICE[l["who"]], rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with open(mp3, "wb") as fh:
        async for ch in c.stream():
            if ch["type"] == "audio": fh.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7; words.append({"w": ch["text"], "s": s, "e": s + ch["duration"] / 1e7})
    subprocess.run([FF, "-y", "-v", "error", "-i", mp3, "-ac", "1", "-ar", "48000", wav], check=True); os.remove(mp3)
    a, sr = sf.read(wav)
    # trim the service's lead-in and tail silence, keep a few ms so nothing is clipped
    lead = max(0, words[0]["s"] - .04) if words else 0
    a = a[int(lead * sr):]
    for w in words: w["s"], w["e"] = round(w["s"] - lead, 3), round(w["e"] - lead, 3)
    if words:
        end = int(min(len(a), (words[-1]["e"] + .14) * sr)); a = a[:end]
    f = int(.008 * sr); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    a, words = tighten(a, sr, words)
    if l.get("sfx"):
        # a real sound (throat clear) before the words, not a spoken "Ahem"
        fx = sfx(l["sfx"], sr); a = np.concatenate([fx, np.zeros(int(.16 * sr)), a]); lead_in = (len(fx) + int(.16 * sr)) / sr
        for w in words: w["s"], w["e"] = round(w["s"] + lead_in, 3), round(w["e"] + lead_in, 3)
    sf.write(wav, a, sr)
    vis = []
    for w in words:
        ch = [x for x in w["w"].lower() if x.isalpha()] or ["a"]; d = (w["e"] - w["s"]) / len(ch)
        vis += [{"s": round(w["s"] + i * d, 3), "e": round(w["s"] + (i + 1) * d, 3), "v": VIS.get(x, "mid")} for i, x in enumerate(ch)]
    hop = sr // 100; env = np.sqrt(np.convolve(a ** 2, np.ones(hop * 3) / (hop * 3), mode="same"))[::hop]; env /= env.max() + 1e-6
    json.dump({"dur": len(a) / sr, "score": 1, "words": words, "visemes": vis, "env": [round(float(x), 3) for x in env]}, open(f"{OUT}/{k}.json", "w"))
    return k, len(a) / sr, len(words)

async def main():
    seen, todo = set(), []
    for ep in sys.argv[1:]:
        for l in json.load(open(f"v3/work/{ep}/lines.json", encoding="utf-8")):
            if l["key"] not in seen and not os.path.exists(f"{OUT}/{l['key']}.json"): seen.add(l["key"]); todo.append(l)
    sem = asyncio.Semaphore(2)
    async def one(l):
        async with sem:
            for attempt in range(6):
                try: return await make(l)
                except Exception as e:
                    if attempt == 5: print("FAIL", l["say"], e); return None
                    await asyncio.sleep(3 + attempt * 3)
    res = [r for r in await asyncio.gather(*[one(l) for l in todo]) if r]
    print("made", len(res), "of", len(todo), "total seconds", round(sum(r[1] for r in res), 1))
asyncio.run(main())
