// Checks an episode script against the house format before any voice or render time is spent.
// usage: node v3/tools/lint.js <name>...   exits 1 on errors; warnings only advise
const path = require('path');
const V = {
  theme: ['midnight', 'morning', 'cafe', 'bedroom'], who: ['nia', 'claude'],
  nia: ['neutral', 'excited', 'annoyed', 'sad', 'sheepish', 'shocked', 'smug', 'pleading', 'stressed'],
  claude: ['neutral', 'happy', 'deadpan', 'squint', 'sideeye', 'smug', 'surprised'],
  pose: ['rest', 'gesture', 'point', 'shrug', 'head', 'neck', 'chin', 'cheer', 'wave'], cpose: ['rest', 'point', 'palm', 'shrug', 'wave'],
  shot: ['two', 'nia', 'claude', 'low', 'side', 'high', 'over', 'dutch', 'top'], pre: ['ahem', 'hmm', 'uh', 'oh'], icon: ['git', 'chat', 'pen', 'book'],
};
const CLASSES = new Set('msg me ai list tag ok bad row wrap between code term g o y r dim gap doc quote sheet tile soft file stamp meter btn hot att thumb struck site light nav hero cards card bar page block li ics b c dmd dbar task cb on badge req may due src docs chip sel prog dmsg'.split(' '));
const count = s => s.split(/\s+/).filter(Boolean).length;

function lint(name) {
  const file = path.join(__dirname, '..', 'episodes', name + '.js'); delete require.cache[file];
  let ep; try { ep = require(file); } catch (e) { console.log(`${name}: does not load
  ERROR ${e.message}`); return [`the file does not load as JavaScript: ${e.message}. Watch for apostrophes inside single-quoted strings; use double quotes for those lines.`]; }
  const err = [], warn = [];
  if (!V.theme.includes(ep.theme)) err.push(`theme "${ep.theme}" is not one of ${V.theme.join(', ')}`);
  const hook = ep.hook && ep.hook.title; if (!hook) err.push('missing hook.title'); else if (count(hook) < 4 || count(hook) > 14) warn.push(`hook is ${count(hook)} words, aim for 6 to 12`);
  if (hook && (hook.match(/\*/g) || []).length % 2) err.push('hook: an *asterisk* highlight is not closed, so a raw * would show on screen');
  if (!ep.outro || !ep.outro.line) err.push('missing outro.line');
  // short format (15-25 s) is the default since one-more-prompt averaged 12 s watched; 5 beats is the floor
  const beats = ep.beats || []; if (beats.length < 5) err.push(`only ${beats.length} beats`);
  // triple hook: context in line one's first words, a lean, then Claude's snapback on line two
  const b0 = beats[0] || {}, b1 = beats[1] || {};
  if (b0.who !== 'nia') err.push('hook: line one must be Nia stating the context');
  if (/^(claude|hey|hi|okay|so|um)/i.test(b0.text || '')) err.push('hook: line one opens with a filler word; open with the topic itself');
  if (count(b0.text || '') > 14) warn.push('hook: line one is long; context and lean should land in about 12 words');
  if (b1.who !== 'claude') err.push("hook: line two must be Claude's contrarian snapback");
  if (!b0.toast) err.push('hook: put the toast on beat one so the context shows visually from the start');
  const panels = beats.filter(b => b.panel); if (panels.length !== ep.moves) err.push(`moves is ${ep.moves} but there are ${panels.length} panels`);
  panels.forEach((b, i) => { if (b.panel.move !== i + 1) err.push(`panel ${i + 1} has move ${b.panel.move}`); });
  if (!beats.some(b => b.toast)) warn.push('no toast on the opening beats');
  let html = '', words = 0, long = 0, pres = 0;
  beats.forEach((b, i) => {
    const at = `beat ${i + 1} ("${(b.text || '').slice(0, 30)}")`;
    if (!V.who.includes(b.who)) err.push(`${at}: who must be nia or claude`);
    if (!b.text) err.push(`${at}: no text`);
    if (b.sfx && !['scratch', 'drum'].includes(b.sfx)) err.push(`${at}: sfx must be scratch or drum`);
    for (const k of ['nia', 'claude', 'pose', 'cpose', 'shot', 'pre']) if (b[k] && !V[k].includes(b[k])) err.push(`${at}: ${k} "${b[k]}" is not one of ${V[k].join(', ')}`);
    if (b.toast && !V.icon.includes(b.toast.icon)) err.push(`${at}: toast icon must be ${V.icon.join(', ')}`);
    if (b.pre) { pres++; if (new RegExp('^' + b.pre + '\\b', 'i').test(b.text || '')) err.push(`${at}: text repeats its pre sound; the pre is voiced already`); }
    const stops = ((b.text || '').match(/[.!?](\s|$)/g) || []).length; if (stops > 2) warn.push(`${at}: ${stops} sentences in one line reads choppy; join them the way people talk`);
    const n = count(b.text || ''); words += n; if (n > 16) err.push(`${at}: ${n} words, keep lines to 16 or fewer`); else if (n > 12) long++;
    if (!b.say && /\d|\b[A-Z]{2,}\b|_|\.\w{2,4}\b|\//.test(b.text || '')) warn.push(`${at}: has digits, caps, a file name or a slash; add a "say" if a voice would misread it`);
    if (b.panel) html = b.panel.html || ''; if (b.panel === null) html = '';
    if (b.panel) {
      if (count(b.panel.title || '') > 6) warn.push(`${at}: panel title is long`);
      for (const m of html.matchAll(/class="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) if (!CLASSES.has(c)) err.push(`${at}: unknown class "${c}" in panel html`);
    }
    if (b.reveal !== undefined && !html.includes(`data-r="${b.reveal}"`)) err.push(`${at}: reveal ${b.reveal} has no data-r="${b.reveal}" in the current panel`);
  });
  const secs = words / 2.6 + beats.length * .3;
  if (secs > 28) warn.push(`about ${secs.toFixed(0)} s of speech; viewers average 12 s, aim for 15 to 25`); if (secs < 10) warn.push(`only about ${secs.toFixed(0)} s of speech`);
  if (long > 3) warn.push(`${long} lines over 12 words; split some`);
  if (pres > 4) warn.push(`${pres} human sounds; two or three is plenty`);
  console.log(`${name}: ${beats.length} beats, ${panels.length} steps, ~${secs.toFixed(0)} s, ${(words / beats.length).toFixed(1)} words a line`);
  err.forEach(e => console.log('  ERROR ' + e)); warn.forEach(w => console.log('  warn  ' + w));
  return err;
}
module.exports = lint;
if (require.main === module) { const bad = process.argv.slice(2).map(lint).some(e => e.length); process.exit(bad ? 1 : 0); }
