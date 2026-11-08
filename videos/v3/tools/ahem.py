"""Stand-in throat clear for Claude (beat.pre = 'ahem') until a real recording is dropped in.
A raspy "khh" rolling into a rough, closed-mouth "HM-hm". Drop a real clip at v3/sfx/ahem-real.wav (any format ffmpeg reads,
renamed .wav) and edge.py uses that instead.
usage: python v3/tools/ahem.py   writes v3/sfx/ahem.wav"""
import os
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000; rng = np.random.default_rng(7)
os.makedirs("v3/sfx", exist_ok=True)

def band(x, lo, hi, order=4): return sosfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def env(n, att, rel, shape=1.6):
    e = np.ones(n); a, r = int(att * SR), int(rel * SR)
    e[:a] = np.linspace(0, 1, a) ** shape; e[-r:] = np.linspace(1, 0, r) ** shape; return e

def rattle(n, rate, jitter=.35):
    # irregular glottal "fry" pulses: the gravel in a throat clear
    out, t = np.zeros(n), 0
    while t < n:
        w = int(SR / rate * (1 + rng.uniform(-jitter, jitter))); out[t:t + int(w * .35)] = rng.uniform(.5, 1); t += w
    return out

def rasp(dur, lo=500, hi=2600, rate=38):
    n = int(dur * SR); noise = band(rng.standard_normal(n), lo, hi)
    am = np.convolve(rattle(n, rate), np.hanning(int(.004 * SR)), "same")
    return noise * (.35 + am) * env(n, .03, .05)

def hum(dur, f0, f1, rough=.55):
    # voiced closed-mouth "hm": jittered pulse train, subharmonic roughness, nasal resonances
    n = int(dur * SR); f = np.linspace(f0, f1, n) * (1 + .03 * band(rng.standard_normal(n), 2, 30, 2) * 20)
    ph = np.cumsum(f / SR); pulses = (np.sin(2 * np.pi * ph) > .6).astype(float)
    sub = 1 + rough * (np.sin(np.pi * ph) > 0)   # alternate pulse heights: the creaky, scraped quality
    v = band(pulses * sub, 60, 3000, 2)
    v = band(v, 180, 420, 2) * 1.0 + band(v, 900, 1300, 2) * .35 + band(v, 2200, 2800, 2) * .12
    v += .25 * rasp(dur, 400, 1800, 42) * np.abs(v).mean() * 8
    return v * env(n, .02, .09)

def norm(x, peak): return x / (np.abs(x).max() + 1e-9) * peak
sil = lambda d: np.zeros(int(d * SR))
a = np.concatenate([norm(rasp(.13), .45), norm(hum(.2, 118, 92), .9), sil(.06), norm(hum(.13, 105, 88, .4), .55)])
a = sosfilt(butter(2, 70, "highpass", fs=SR, output="sos"), a)
f = int(.01 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
sf.write("v3/sfx/ahem.wav", norm(a, .8), SR)
print("wrote v3/sfx/ahem.wav", round(len(a) / SR, 2), "s")
