// Brainstorms relatable episode briefs and appends them to v3/ideas.md.
// usage: node v3/tools/ideas.js [count] [angle...]     e.g. node v3/tools/ideas.js 10 students
const fs = require('fs'), path = require('path'), ask = require('./claude.js');
const ROOT = path.join(__dirname, '..'), n = +process.argv[2] || 10, angle = process.argv.slice(3).join(' ');
const style = fs.readFileSync(path.join(ROOT, 'STYLE.md'), 'utf8').split('## The beat sheet')[0];
const out = path.join(ROOT, 'ideas.md'), have = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '# Episode ideas\n\nPick one and run `node v3/tools/write.js "<brief>"`.\n';
const done = fs.readdirSync(path.join(ROOT, 'episodes')).map(f => f.replace('.js', '')).join(', ');

const reply = ask(`${style}
Brainstorm ${n} episode briefs${angle ? ` for this audience or angle: ${angle}` : ''}. Each must be a situation heavy Claude users instantly recognise, with a clear stake and a real Claude fix.
Already made or already listed, do not repeat: ${done}
${have}

Reply with only a markdown list, one brief per line, in this form:
- **<hook-style title>**: <one-sentence situation with a number in it>. Fix: <the real Claude features or habits, comma separated>.`);
const list = reply.split('\n').filter(l => l.startsWith('- ')).join('\n');
fs.writeFileSync(out, have.trimEnd() + `\n\n## ${new Date().toISOString().slice(0, 10)}${angle ? ' · ' + angle : ''}\n\n${list}\n`);
console.log(list); console.log(`\nadded to ${path.relative(process.cwd(), out)}`);
