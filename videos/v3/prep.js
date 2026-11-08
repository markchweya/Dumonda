// Voice + timeline + master soundtrack for one episode: node v3/prep.js <name>
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const name = process.argv[2], ROOT = __dirname, script = require(path.join(ROOT, 'episodes', name + '.js'));
const FF = path.join(process.env.LOCALAPPDATA, 'Microsoft/WinGet/Links/ffmpeg.exe');
const work = path.join(ROOT, 'work', name), cache = path.join(ROOT, 'work', process.env.VOICE_CACHE || 'tts_edge');
for (const d of [work, cache, path.join(ROOT, 'public'), path.join(ROOT, 'src', 'timelines')]) fs.mkdirSync(d, { recursive: true });
const run = (cmd, args) => { const r = spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1e8 }); if (r.status) { console.error(String(r.stderr).slice(-1800)); throw new Error(cmd + ' failed'); } };

const crypto = require('crypto');
// small human sounds before a line (beat.pre), kept out of the captions; spoken ones are voiced, SFX ones are real clips in v3/sfx
const PRE = { ahem: '', hmm: 'Hmm.', uh: 'Uh,', oh: 'Oh.' }, SFX = { ahem: 'ahem' };
const sfxSig = n => { const real = path.join(ROOT, 'sfx', n + '-real.wav'), f = fs.existsSync(real) ? real : path.join(ROOT, 'sfx', n + '.wav'); return n + fs.statSync(f).size; };
const lines = script.beats.map(b => {
  const fx = b.pre && SFX[b.pre], say = (b.pre && PRE[b.pre] ? PRE[b.pre] + ' ' : '') + (b.say || b.text), emo = b.who === 'claude' ? (b.claude || 'neutral') : (b.nia || 'neutral');
  // script.voices = { claude: '<edge voice>', nia: '<edge voice>' } overrides the show's defaults (Dumonda episodes)
  const voice = script.voices && script.voices[b.who];
  return { who: b.who, say, emo, ...(fx && { sfx: fx }), ...(voice && { voice }), key: crypto.createHash('md5').update(`cb2|${b.who}|${voice || ''}|${emo}|${say}|${fx ? sfxSig(fx) : ''}`).digest('hex').slice(0, 12) };
});
fs.writeFileSync(path.join(work, 'lines.json'), JSON.stringify(lines));
if (process.argv[3] === '--lines') { console.log(name, 'lines', lines.length); process.exit(0); }

function words(text, tok, s0, s1) {
  const ws = text.split(/\s+/).filter(Boolean);
  if (tok.length === ws.length) return ws.map((w, i) => ({ w, s: tok[i].s, e: tok[i].e }));
  const tot = ws.reduce((a, w) => a + w.length + 1, 0); let at = s0;
  return ws.map(w => { const d = (w.length + 1) / tot * (s1 - s0), o = { w, s: at, e: at + d }; at += d; return o; });
}
function chunks(ws, end) {
  const out = []; let cur = [], len = 0;
  ws.forEach((w, i) => {
    cur.push(w); len += w.w.length + 1;
    const next = ws[i + 1], stop = /[.!?…]$/.test(w.w) || (/[,;:]$/.test(w.w) && len > 11), full = next && len + next.w.length > 24;
    if (next && (stop || full)) { out.push(cur); cur = []; len = 0; }
  });
  if (cur.length) out.push(cur);
  return out.map((c, i) => ({ words: c, s: c[0].s - .03, e: i + 1 < out.length ? out[i + 1][0].s - .03 : end + .18 }));
}
let t = .12; const beats = [];
script.beats.forEach((b, i) => {
  const l = lines[i], d = JSON.parse(fs.readFileSync(path.join(cache, l.key + '.json'), 'utf8'));
  const first = d.words[0], last = d.words[d.words.length - 1];
  const clipIn = 0, clipOut = d.dur;
  const prev = beats[beats.length - 1];
  if (prev) t = prev.end + (prev.who === b.who ? .24 : .32) + (b.panel ? .2 : 0) + (b.gap || 0);
  const shift = x => t + x - clipIn, tok = d.words.map(w => ({ ...w, s: shift(w.s), e: shift(w.e) }));
  const end = t + clipOut - clipIn;
  const said = b.pre ? tok.slice(PRE[b.pre].split(' ').filter(Boolean).length) : tok;
  const ws = words(b.text, said, said[0].s, said[said.length - 1].e);
  const envIn = Math.floor(clipIn * 100), env = d.env.slice(envIn, Math.ceil(clipOut * 100));
  beats.push({ ...b, key: l.key, clipIn, clipOut, start: t, end, chunks: chunks(ws, end), vis: d.visemes.map(v => ({ ...v, s: shift(v.s), e: shift(v.e) })), env });
});
let cur = 'two'; beats.forEach(b => { if (b.shot) cur = b.shot; b.shot = cur; });
const endAt = beats[beats.length - 1].end + .55, duration = endAt + 2.4;   // short end card so the replay comes round fast
const tl = { id: name, theme: script.theme, cast: script.cast, seed: script.seed, music: script.music, musicAt: script.musicAt, moves: script.moves, outro: script.outro, hook: script.hook, beats, endAt, duration };
const tj = path.join(ROOT, 'src', 'timelines', name + '.json'); fs.writeFileSync(tj, JSON.stringify(tl));
const raw = path.join(work, 'raw.wav');
run('python', [path.join(ROOT, '..', 'v2', 'audio.py'), tj, cache, raw]);
run(FF, ['-y', '-v', 'error', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.2:LRA=9', '-ar', '48000', path.join(ROOT, 'public', name + '.wav')]);
console.log(name, beats.length, 'beats', duration.toFixed(1) + 's');
