// Runs a prompt through the Claude Code CLI in print mode and returns the reply text.
const { spawnSync } = require('child_process');
module.exports = function ask(prompt) {
  const r = spawnSync('claude -p --output-format text', { input: prompt, encoding: 'utf8', shell: true, maxBuffer: 1e8, timeout: 600000 });
  if (r.status) throw new Error('claude -p failed: ' + (r.stderr || r.stdout || '').slice(-800));
  return r.stdout;
};
