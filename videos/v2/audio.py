"""Assemble and master the soundtrack. usage: python audio.py timeline.json cachedir out.wav"""
import sys, json, os, numpy as np, soundfile as sf
from scipy import signal
SR = 48000
tl = json.load(open(sys.argv[1], encoding="utf-8")); cache = sys.argv[2]; out = sys.argv[3]
N = int((tl["duration"] + .1) * SR); rng = np.random.default_rng(tl.get("seed", 7))

def biquad(kind, f, q=.8, gain=0):
    A = 10 ** (gain / 40); w = 2 * np.pi * f / SR; a = np.sin(w) / (2 * q); c = np.cos(w)
    if kind == "hp": b0, b1, b2, a0, a1, a2 = (1 + c) / 2, -(1 + c), (1 + c) / 2, 1 + a, -2 * c, 1 - a
    if kind == "lp": b0, b1, b2, a0, a1, a2 = (1 - c) / 2, 1 - c, (1 - c) / 2, 1 + a, -2 * c, 1 - a
    if kind == "peak": b0, b1, b2, a0, a1, a2 = 1 + a * A, -2 * c, 1 - a * A, 1 + a / A, -2 * c, 1 - a / A
    return signal.tf2sos([b0 / a0, b1 / a0, b2 / a0], [1, a1 / a0, a2 / a0])
def f(x, *a, **k): return signal.sosfilt(biquad(*a, **k), x)

def compress(x, thr=-20, ratio=3, att=.004, rel=.09):
    e = np.abs(x); ca, cr = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR)); g = np.zeros_like(x); s = 0.
    for i, v in enumerate(e):
        s = ca * s + (1 - ca) * v if v > s else cr * s + (1 - cr) * v; g[i] = s
    db = 20 * np.log10(g + 1e-6); over = np.maximum(db - thr, 0)
    return x * 10 ** (-over * (1 - 1 / ratio) / 20)

def voice(path, clip_in, clip_out):
    a, sr = sf.read(path); a = a[int(clip_in * sr):int(clip_out * sr)]
    n = min(int(.012 * sr), len(a) // 2)
    if n: a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
    x = a if sr == SR else signal.resample_poly(a, SR // np.gcd(SR, sr), sr // np.gcd(SR, sr))   # match the 48 kHz mix whatever the take rate
    # dry, close-mic podcast voice: no presence boost, no exciter, gentle levelling only
    x = f(x, "hp", 70); x = f(x, "peak", 180, q=.9, gain=1); x = f(x, "peak", 6500, q=2, gain=-1)
    x = compress(x, thr=-26, ratio=2, att=.008, rel=.18)
    return x / (np.sqrt(np.mean(x ** 2)) + 1e-6) * .09                    # level match the two speakers

dry = np.zeros(N)
for b in tl["beats"]:
    if not b.get("key"): continue
    x = voice(os.path.join(cache, b["key"] + ".wav"), b["clipIn"], b["clipOut"]); s = int(b["start"] * SR)
    dry[s:s + len(x)] += x[:max(0, N - s)]
# small-room ambience so voices sit in the same space instead of feeling pasted on
ir_n = int(.28 * SR); ir = rng.normal(0, 1, ir_n) * np.exp(-np.arange(ir_n) / (.055 * SR)); ir = f(f(ir, "hp", 300), "lp", 5000)
wetL = signal.fftconvolve(dry, ir)[:N]; wetR = signal.fftconvolve(dry, np.roll(ir, 97))[:N]
wetL *= 0; wetR *= 0   # no room echo: it made voices sound like they came through speakers

# ---- music: warm electric-piano lo-fi with brushed drums, ducked under speech
def ep(freq, dur, vel=.5):
    t = np.arange(int(dur * SR)) / SR; mi = 1.3 * np.exp(-t * 3.5)
    y = np.sin(2 * np.pi * freq * t + mi * np.sin(2 * np.pi * freq * t)) + .12 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 9)
    return y * np.exp(-t * 1.5) * (1 - np.exp(-t * 300)) * vel * (1 + .06 * np.sin(2 * np.pi * 4.7 * t))
PROG = {"morning": [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 349.2]],
        "midnight": [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [146.8, 174.6, 220, 261.6], [164.8, 207.7, 246.9, 293.7]],
        "cafe": [[293.7, 349.2, 440, 523.3], [196, 246.9, 293.7, 349.2], [261.6, 329.6, 392, 493.9], [220, 277.2, 329.6, 392]],
        "bedroom": [[196, 233.1, 293.7, 349.2], [155.6, 196, 233.1, 293.7], [174.6, 220, 261.6, 311.1], [146.8, 185, 220, 261.6]]}[tl.get("theme", "morning")]
bpm = 76; bar = 240 / bpm; beat = bar / 4
mL, mR = np.zeros(N + SR * 4), np.zeros(N + SR * 4)
def put(buf, y, t):
    s = int(t * SR)
    if s < len(buf): e = min(len(buf), s + len(y)); buf[s:e] += y[:e - s]
t = 0.; i = 0
while t < tl["duration"]:
    ch = PROG[i % 4]
    for j, fq in enumerate(ch):
        y = ep(fq, bar * 1.3, .17); d = t + j * .018 + rng.uniform(0, .008)
        put(mL, y * (.6 + .1 * j), d); put(mR, y * (1.0 - .1 * j), d)
    put(mL, ep(ch[0] / 2, bar, .28), t); put(mR, ep(ch[0] / 2, bar, .28), t)
    for k in range(int(bar / beat)):
        tb = t + k * beat + (beat * .1 if k % 2 else 0)
        if rng.random() < .3 and i % 2:
            fq = rng.choice(ch) * 2; y = ep(fq, 1.1, .1); put(mL, y, tb); put(mR, y * .8, tb)
    for b4 in range(4):
        tk = t + b4 * bar / 4
        if b4 in (0, 2):
            d = np.arange(int(.22 * SR)) / SR; y = np.sin(2 * np.pi * (48 + 60 * np.exp(-d * 34)) * d) * np.exp(-d * 15) * .3
            put(mL, y, tk); put(mR, y, tk)
        else:
            d = np.arange(int(.16 * SR)) / SR; y = f(rng.normal(0, 1, len(d)), "hp", 1400) * np.exp(-d * 24) * .085
            put(mL, y, tk); put(mR, y, tk)
        for h in range(2):
            d = np.arange(int(.05 * SR)) / SR; y = f(rng.normal(0, 1, len(d)), "hp", 6500) * np.exp(-d * 90) * (.035 if h else .05)
            put(mL, y * .8, tk + h * bar / 8 + (.018 if h else 0)); put(mR, y, tk + h * bar / 8 + (.018 if h else 0))
    t += bar; i += 1
mL, mR = f(mL[:N], "lp", 6500), f(mR[:N], "lp", 6500)
vinyl = f(rng.normal(0, 1, N), "lp", 3500) * .0035
mL += vinyl; mR += vinyl
env = np.abs(dry); a, r = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.45 * SR)); sc = np.zeros(N); s = 0.
for k, v in enumerate(env):
    s = a * s + (1 - a) * v if v > s else r * s + (1 - r) * v; sc[k] = s
duck = 1 - .5 * np.clip(sc / .05, 0, 1)
fadein = np.clip(np.arange(N) / (SR * .4), 0, 1); fadeout = np.clip((N - np.arange(N)) / (SR * 1.5), 0, 1)
mg = .2; ml, mr = mL * duck * fadein * fadeout * mg, mR * duck * fadein * fadeout * mg
# a real music track (v3/music/<id>-<name>.mp3, Mixkit Stock Music Free License) replaces the synth bed when the episode names one
MUSIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v3", "music")
if tl.get("music"):
    import glob, subprocess
    p = glob.glob(os.path.join(MUSIC, f"*-{tl['music']}.mp3"))[0]
    FFM = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft/WinGet/Links/ffmpeg.exe")
    raw = subprocess.run([FFM, "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    full = np.frombuffer(raw, np.float32).astype(float).reshape(-1, 2)
    X = int(1.5 * SR); a = max(X, int(tl.get("musicAt", 0) * SR))
    m = full[a:a + N]; m = np.resize(m, (N, 2)) if len(m) < N else m.copy()
    # loops seamlessly on replay: no fade-in, and the last 1.5 s blends into the bars just before the start point,
    # so when the reel restarts the music simply carries on
    w = np.sin(np.linspace(0, np.pi / 2, X))[:, None]
    m[-X:] = m[-X:] * np.cos(np.linspace(0, np.pi / 2, X))[:, None] + full[a - X:a] * w
    # carve a pocket for the voices instead of burying the music: drop the sub-bass phones can't play,
    # dip the speech presence band, lift the sparkle that phone speakers do play
    for c in (0, 1): m[:, c] = f(f(f(m[:, c], "hp", 90), "peak", 1600, q=.7, gain=-4.5), "peak", 6500, q=.8, gain=2.5)
    m = m / (np.sqrt(np.mean(m ** 2)) + 1e-9) * .030          # heard but behind: ~15 dB under the dialogue in gaps, ~19 dB while talking
    tduck = 1 - .4 * np.clip(sc / .05, 0, 1)                   # dips while anyone talks, swells in the gaps
    ml, mr = m[:, 0] * tduck, m[:, 1] * tduck

# ---- sound effects
def tick(fq=1250, vel=.1):
    d = np.arange(int(.05 * SR)) / SR; return np.sin(2 * np.pi * fq * d) * np.exp(-d * 95) * vel
def swoosh():
    d = np.arange(int(.32 * SR)) / SR; y = f(f(rng.normal(0, 1, len(d)), "hp", 700), "lp", 5200)
    return y * np.sin(np.pi * d / d[-1]) ** 2 * .065
def bell():
    d = np.arange(int(1.6 * SR)) / SR; y = sum(np.sin(2 * np.pi * q * d) * np.exp(-d * 3.2) * .05 for q in (659.3, 987.8, 1318.5)); return y
sfx = np.zeros(N)
KIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v3", "sfx", "dl")   # real recordings, see v3/sfx/CREDITS.md
if os.path.isdir(KIT):
    import re, subprocess, glob
    FF = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft/WinGet/Links/ffmpeg.exe")
    _kit = {}
    def kit(name, peak=None, rms=None, dur=None):
        if name not in _kit:
            p = glob.glob(os.path.join(KIT, f"*-{name}.mp3"))[0]
            raw = subprocess.run([FF, "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
            _kit[name] = np.frombuffer(raw, np.float32).astype(float)
        y = _kit[name][:int(dur * SR)] if dur else _kit[name].copy()
        if dur: n = min(int(.03 * SR), len(y) // 2); y[-n:] *= np.linspace(1, 0, n)
        if peak: y = y / (np.abs(y).max() + 1e-9) * peak
        if rms: y = y / (np.sqrt(np.mean(y ** 2)) + 1e-9) * rms
        return y
    tb = next((b for b in tl["beats"] if b.get("toast")), None)
    if tb: put(sfx, kit("toast-pop", peak=.22), max(tb["start"], .9))
    html = ""
    for b in tl["beats"]:
        if b.get("panel"):
            html = b["panel"].get("html", ""); put(sfx, kit("card-swoosh", peak=.16), max(0, b["start"] - .12))
            for m in re.finditer(r'data-r="(\d)"[^>]*>(?:(?!data-r=).)*?data-type="([\d.]+)"', html, re.S):
                if m.group(1) == "0": put(sfx, kit("typing", rms=.012, dur=float(m.group(2))), b["start"] + .35)
        elif "panel" in b and b["panel"] is None: html = ""
        r = b.get("reveal")
        if r is not None:
            item = " ".join(re.findall(rf'<[^>]*data-r="{r}"[^>]*>.*?</', html, re.S))
            put(sfx, kit("reveal-pop", peak=.14), b["start"])
            if "tag bad" in item or 'class="r"' in item: put(sfx, kit("wrong-buzz", peak=.1), b["start"] + .05)
            elif "tag ok" in item or 'class="g"' in item: put(sfx, kit("success", peak=.12), b["start"] + .05)
        if b.get("sfx") == "scratch": put(sfx, kit("record-scratch", peak=.26, dur=.75), max(0, b["start"] - .5))
        if b.get("sfx") == "drum": put(sfx, kit("joke-drum", peak=.2), b["end"] + .05)
    # a quiet room under everything so silence never sounds like a dead file
    bed = np.resize(kit("room-tone", rms=.0045), N)
    if tl.get("theme") == "midnight": bed += np.resize(kit("city-night", rms=.004), N)
    sfx += bed   # no fades: the reel loops
else:
    for b in tl["beats"]:
        if b.get("panel"): put(sfx, swoosh(), max(0, b["start"] - .1))
        if b.get("reveal") is not None: put(sfx, tick(), b["start"])
if tl.get("endAt"): put(sfx, bell(), tl["endAt"])
L = dry + wetL + ml + sfx; R = dry + wetR + mr + sfx
st = np.stack([L, R], 1); st = np.clip(st, -1, 1)
sf.write(out, st, SR, subtype="PCM_24"); print("audio ok", round(st.shape[0] / SR, 1))
