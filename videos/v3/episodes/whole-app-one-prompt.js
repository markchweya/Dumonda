// name: whole-app-one-prompt
module.exports = {
  theme: 'bedroom', seed: 31, moves: 4,
  outro: { line: 'Save this before your next launch day' },
  hook: { title: 'My whole app from *one* prompt. *2,000* lines. *Launch* Saturday.' },
  beats: [
    { who: 'nia', text: 'My whole app came from one prompt. Two thousand lines. Launch is Saturday.', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia', toast: { app: 'Launch checklist', icon: 'chat', text: '2,000 lines. Launch Saturday.', tone: 'red' } },
    { who: 'claude', text: 'Another prompt will make it worse. Not better.', claude: 'deadpan', nia: 'sheepish', cpose: 'palm', pre: 'ahem', shot: 'claude' },
    { who: 'claude', text: 'How many prompts did it take?', claude: 'squint', nia: 'sheepish', shot: 'two' },
    { who: 'nia', text: 'One. Okay, eleven. Mostly "fix it."', nia: 'sheepish', claude: 'deadpan', pose: 'shrug' },
    { who: 'claude', text: 'Scroll up. Your chat says forty-one.', claude: 'deadpan', nia: 'shocked', cpose: 'point', shot: 'claude' },
    { who: 'nia', text: "Forty-one. Nobody's read any of it. Including me.", nia: 'sheepish', claude: 'squint', pose: 'neck' },
    // step 1: plan mode first
    { who: 'claude', text: 'Step one. Turn on plan mode before any code.', claude: 'neutral', nia: 'neutral', cpose: 'palm', pre: 'ahem',
      panel: { move: 1, title: 'Plan mode first', note: 'Claude Code', cap: 'Terminal: my-app', html: `
        <div class="term">
          <div data-r="0"><span class="g">~/my-app</span> $ claude</div>
          <div data-r="1" class="y">Plan mode: on. No edits yet.</div>
          <div data-r="2" class="gap dim">you: just build it all</div>
          <div data-r="3" class="o">Plan: first feature only.</div>
        </div>` } },
    { who: 'nia', text: 'A plan? I wanted the app.', nia: 'annoyed', claude: 'deadpan', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: 'Plans are free. Rewrites are not.', claude: 'deadpan', nia: 'neutral', reveal: 2 },
    // step 2: explain every file
    { who: 'claude', text: 'Step two. Ask what every file does, in plain English.', claude: 'neutral', nia: 'neutral', cpose: 'point',
      panel: { move: 2, title: 'Explain every file', note: 'Plain English', cap: 'Claude Code', html: `
        <div class="file" data-r="0"><i>JS</i>app.js</div>
        <div class="msg ai" data-r="1">app.js: the screen you see first.</div>
        <div class="msg ai" data-r="2">db.js: saves every signup.</div>` } },
    { who: 'nia', text: "I don't know what half of them do.", nia: 'sheepish', claude: 'neutral', reveal: 1, pose: 'neck' },
    { who: 'claude', text: "Good. That's the part you skipped.", claude: 'deadpan', nia: 'sheepish', pre: 'hmm', reveal: 2 },
    // step 3: one feature at a time
    { who: 'claude', text: 'Step three. One feature per prompt. Not the whole app.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 3, title: 'One feature at a time', note: 'Small asks', cap: 'Claude Code', html: `
        <div class="msg me" data-r="0">add login, payments and emails</div>
        <div class="row wrap" data-r="1"><span class="tag bad">3 features</span><span class="tag ok">1 feature</span></div>
        <div class="msg ai" data-r="2">Start with login. Test it first.</div>` } },
    { who: 'nia', text: 'But the payments are the whole point.', nia: 'pleading', claude: 'deadpan', pose: 'gesture', reveal: 1 },
    { who: 'claude', text: "Then they're tomorrow's problem.", claude: 'smug', nia: 'annoyed', cpose: 'shrug', reveal: 2 },
    // step 4: save before you add more
    { who: 'claude', text: 'Step four. Test it, then save a copy before the next feature.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 4, title: 'Save before you add more', note: 'Checkpoint', cap: 'Terminal: my-app', html: `
        <div class="term">
          <div data-r="0"><span class="g">✓</span> login test passed</div>
          <div data-r="1" class="gap"><span class="o">git commit</span> -m "login works"</div>
          <div data-r="2" class="dim">Saved. Next feature: payments.</div>
        </div>` } },
    { who: 'nia', text: 'So I launch Saturday with one feature?', nia: 'sheepish', claude: 'squint', pose: 'head', reveal: 1 },
    { who: 'claude', text: 'One feature that works. Yes.', claude: 'deadpan', nia: 'neutral', reveal: 2 },
    // twist ending
    { who: 'nia', text: 'Fine. I read all 2,000 lines.', nia: 'sheepish', claude: 'neutral', pose: 'neck', shot: 'nia', panel: null },
    { who: 'claude', text: 'Start with file one. There are sixty-one.', claude: 'smug', nia: 'shocked', cpose: 'point', shot: 'claude', panel: null },
    { who: 'nia', text: 'Okay. Launch is Monday then.', nia: 'sad', claude: 'smug', pose: 'shrug', shot: 'nia', panel: null },
    { who: 'claude', text: 'Plan mode already said Monday.', claude: 'smug', nia: 'sad', cpose: 'shrug', shot: 'two', panel: null },
  ],
};
