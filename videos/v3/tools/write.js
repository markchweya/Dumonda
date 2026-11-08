// Writes a new episode script from a one-line brief, using the house style, then lints it and fixes errors once.
// usage: node v3/tools/write.js "rent is due Friday and Nia has forty dollars" [--steps 4] [--theme cafe]
const fs = require('fs'), path = require('path'), ask = require('./claude.js'), lint = require('./lint.js');
const ROOT = path.join(__dirname, '..'), args = process.argv.slice(2);
const opt = k => { const i = args.indexOf('--' + k); return i < 0 ? null : args.splice(i, 2)[1]; };
const steps = opt('steps') || '4 or 5', theme = opt('theme'), brief = args.join(' ');
if (!brief) { console.log('usage: node v3/tools/write.js "<brief>" [--steps 4] [--theme cafe]'); process.exit(1); }

const style = fs.readFileSync(path.join(ROOT, 'STYLE.md'), 'utf8');
const fields = fs.readFileSync(path.join(ROOT, '..', 'README.md'), 'utf8').match(/\| Beat field[\s\S]*?\r?\n\r?\n/)[0];
const example = fs.readFileSync(path.join(ROOT, 'episodes', 'the-3am-bug.js'), 'utf8');
const taken = fs.readdirSync(path.join(ROOT, 'episodes')).map(f => f.replace('.js', ''));

const prompt = `You write scripts for a vertical comedy short series. Follow this style guide exactly.

${style}

Beat fields (plus \`pre\` from the style guide):
${fields}
Themes: midnight, morning, cafe, bedroom. Toast icons: git, chat, pen, book.

Here is an existing episode for the file format only. Its pacing is older and slower than the style guide; follow the style guide, not this episode's line lengths or step count.

\`\`\`js
${example}
\`\`\`

Write a new episode about: ${brief}
Use ${steps} steps.${theme ? ` Use the ${theme} theme.` : ''} Existing episode names you must not reuse: ${taken.join(', ')}.
Use double quotes for any string that contains an apostrophe.

Reply with only one \`\`\`js code block. Its first line is a comment \`// name: <short-kebab-case-name>\`, then \`module.exports = {...}\`.`;

const grab = s => { const m = s.match(/```(?:js|javascript)?\s*\n([\s\S]*?)```/); if (!m) throw new Error('no code block in reply:\n' + s.slice(0, 600)); return m[1].trim() + '\n'; };
console.log('writing...');
let code = grab(ask(prompt));
const name = (code.match(/\/\/ name:\s*([a-z0-9-]+)/) || [])[1] || brief.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
const file = path.join(ROOT, 'episodes', name + '.js');
fs.writeFileSync(file, code);
let errs = lint(name);
if (errs.length) {
  console.log('fixing lint errors...');
  code = grab(ask(`${prompt}\n\nYour draft:\n\`\`\`js\n${code}\`\`\`\nIt has these errors:\n${errs.join('\n')}\n\nReturn the corrected file, same rules.`));
  fs.writeFileSync(file, code); errs = lint(name);
}
console.log((errs.length ? 'saved with errors: ' : 'saved: ') + path.relative(process.cwd(), file));
console.log(`next: bash v3/make.sh ${name}`);
