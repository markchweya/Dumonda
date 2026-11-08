// name: three-live-keys
module.exports = {
  theme: 'midnight', seed: 41, moves: 4,
  outro: { line: 'Save this before your next push' },
  hook: {"title":"I pushed my *API* *keys* to GitHub at 1 a.m."},
  beats: [
    // problem: usage alert after a 1 a.m. public push
    { who: 'nia', text: "I pushed my API keys to GitHub, and my bill's at $412.", say: "I pushed my API keys to GitHub, and my bill's at four hundred twelve dollars.", nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia', toast: {"app":"API usage","icon":"chat","text":"$412 since 1:04 a.m.","tone":"red"} },
    { who: 'claude', text: "Deleting the repo won't save you.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    { who: 'nia', text: 'But I deleted the commit.', pre: 'uh', nia: 'pleading', claude: 'deadpan', pose: 'gesture', shot: 'nia' },
    { who: 'claude', text: "They're still live. All three.", claude: 'deadpan', nia: 'sheepish', shot: 'two' },
    // step 1: rotate the keys first
    { who: 'claude', text: 'Step one. Rotate all three keys. Right now.', pre: 'ahem', claude: 'neutral', nia: 'sheepish', cpose: 'palm',
      panel: { move: 1, title: 'Rotate the keys first', note: 'before anything else', cap: 'Your API dashboards', html: `
        <div class="row wrap" data-r="0"><span class="tag bad">AI key · public</span><span class="tag bad">Maps key · public</span><span class="tag bad">Payments key · public</span></div>
        <div class="code" data-r="1"><b>Deleted commit ≠ dead key.</b> Anyone who copied it still has it.</div>
        <div class="row wrap" data-r="2"><span class="tag ok">old keys revoked</span><span class="tag ok">3 new keys</span></div>` } },
    { who: 'nia', text: 'The commit is gone, though.', nia: 'annoyed', claude: 'deadpan', pose: 'shrug', shot: 'nia' },
    { who: 'claude', text: 'Bots scrape public repos. It got copied in minutes.', claude: 'deadpan', nia: 'shocked', reveal: 1, shot: 'claude' },
    { who: 'nia', text: 'Okay. Revoked. All three.', nia: 'sheepish', claude: 'happy', reveal: 2, pose: 'neck', shot: 'two' },
    // step 2: Claude Code scans the repo and its history
    { who: 'claude', text: 'Step two. Open your terminal, type claude. I scan everything.', say: 'Step two. Open your terminal, type Claude. I scan everything.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'Scan repo and history', note: 'Claude Code', cap: 'Terminal: side-project', html: `
        <div class="term">
          <div data-r="0"><span class="g">~/side-project</span> $ <span data-type="1">claude</span></div>
          <div data-r="0" class="dim">&gt; find every secret in this repo and its git history</div>
          <div data-r="1" class="gap"><span class="o">.env</span> 3 keys <span class="dim">(commit a41f, 1:02 a.m.)</span></div>
          <div data-r="2"><span class="o">src/config.js</span> line 12, <span class="y">hardcoded key</span></div>
          <div data-r="2" class="gap r">4 secrets found. 1 still in your code.</div>
        </div>` } },
    { who: 'nia', text: "It's just the .env. I checked.", say: "It's just the dot env. I checked.", nia: 'smug', claude: 'neutral', reveal: 1, pose: 'point', shot: 'nia' },
    { who: 'claude', text: 'Config dot js. Line twelve.', claude: 'smug', nia: 'shocked', reveal: 2, cpose: 'point', shot: 'claude' },
    { who: 'nia', text: 'Oh. The test key.', nia: 'sheepish', claude: 'deadpan', pose: 'head', shot: 'nia' },
    { who: 'claude', text: 'Rotate that one too.', claude: 'deadpan', nia: 'sad', shot: 'two' },
    // step 3: .gitignore plus environment variables
    { who: 'claude', text: 'Step three. .env goes in .gitignore. Code reads environment variables.', say: 'Step three. Dot env goes in git ignore. Code reads environment variables.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 3, title: 'Ignore it. Use env vars.', note: 'nothing secret in the repo', cap: 'side-project', html: `
        <div class="file" data-r="0"><i>GIT</i>.gitignore <mark>+ .env</mark></div>
        <div class="file" data-r="1"><i>ENV</i>.env.example <span class="dim">AI_KEY=</span></div>
        <div class="code" data-r="2">const key = process.env.AI_KEY</div>
        <div class="stamp" data-r="3">0 keys in repo</div>` } },
    { who: 'nia', text: 'Can I just make the repo private?', nia: 'pleading', claude: 'squint', reveal: 1, pose: 'gesture', shot: 'nia' },
    { who: 'claude', text: 'You made it public at 1 a.m. You will again.', say: 'You made it public at one a.m. You will again.', pre: 'hmm', claude: 'sideeye', nia: 'sheepish', reveal: 2, shot: 'claude' },
    { who: 'nia', text: 'Fair.', nia: 'sheepish', claude: 'happy', reveal: 3, pose: 'neck', shot: 'two' },
    // step 4: a CLAUDE.md rule
    { who: 'claude', text: 'Last step. Put a rule in CLAUDE.md.', say: 'Last step. Put a rule in Claude dot M D.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 4, title: 'Write the rule down', note: 'CLAUDE.md', cap: 'CLAUDE.md', html: `
        <div class="doc" data-r="0"><h5>Rules</h5><p>Never commit secrets or .env files.</p><p>Check for keys before every push.</p></div>
        <div class="msg me" data-r="1">push it, quick</div>
        <div class="msg ai" data-r="2">Stopped. .env is staged again. Unstage it?</div>` } },
    { who: 'nia', text: 'Okay. Pushing the fix. Quick.', nia: 'excited', claude: 'neutral', reveal: 1, pose: 'cheer', shot: 'nia' },
    { who: 'claude', text: 'Stopped. You staged .env again.', say: 'Stopped. You staged dot env again.', claude: 'smug', cpose: 'shrug', nia: 'shocked', reveal: 2, shot: 'claude' },
    // twist
    { who: 'nia', text: 'Fine. Clean now. Making it public.', nia: 'excited', claude: 'deadpan', pose: 'cheer', shot: 'two', gap: .3 },
    { who: 'claude', text: 'Check your README. Setup step two is your key.', say: 'Check your read me. Setup step two is your key.', claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude', panel: null },
  ],
};
