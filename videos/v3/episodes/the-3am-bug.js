module.exports = {
  theme: 'midnight', seed: 22, moves: 3,
  outro: { line: 'Save this for your next 3 a.m.' },
  hook: {"title":"It worked an hour ago and you *\"changed* *nothing\"*"},
  beats: [
    // problem: the app broke and Nia swears she changed nothing
    { who: 'nia', text: 'Claude, my app is broken. It worked an hour ago, and I changed nothing.', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia' },
    { who: 'claude', text: 'Git says you changed eleven files.', claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude', toast: {"app":"git diff","icon":"git","text":"11 files changed","tone":"red"} },
    { who: 'nia', text: 'Okay. Eleven tiny things.', nia: 'sheepish', claude: 'deadpan', pose: 'neck', shot: 'nia' },
    { who: 'claude', text: 'Show me the error.', claude: 'neutral', nia: 'sheepish', shot: 'two' },
    { who: 'nia', text: 'I sent you a photo of my screen.', nia: 'neutral', claude: 'squint', pose: 'gesture' },
    // tip 1: paste the error text, not a photo
    { who: 'claude', text: "That's a photo of sixty tabs. I can't read the error.", claude: 'deadpan', nia: 'sheepish', cpose: 'palm',
      panel: { move: 1, title: 'Paste the error. Not a photo.', note: 'text you can search', cap: 'Claude', html: `
        <div class="msg me" data-r="0"><div class="att"><div class="thumb"></div>IMG_4471.png</div>here's the error</div>
        <div class="code" data-r="1"><b>TypeError:</b> Cannot read properties of undefined (reading 'map')</div>
        <div class="msg ai" data-r="2">Thank you. Now I can actually help.</div>` } },
    { who: 'nia', text: 'Fine. I copied the actual text.', nia: 'annoyed', claude: 'neutral', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: 'Thank you. Now I can actually help.', claude: 'happy', nia: 'neutral', reveal: 2 },
    // tip 2: let Claude read the whole project
    { who: 'claude', text: "Next, open your terminal and type claude. I'll read the whole project myself.", say: "Next, open your terminal and type Claude. I'll read the whole project myself.", claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'Let it read everything', note: 'Claude Code', cap: 'Terminal: budget-app', html: `
        <div class="term">
          <div data-r="0"><span class="g">~/budget-app</span> $ <span data-type="1">claude</span></div>
          <div data-r="0" class="dim">Reading 142 files...</div>
          <div data-r="1" class="gap"><span class="o">src/config.js</span> lost its <span class="y">BASE_URL</span> line.</div>
          <div data-r="2" class="gap dim">$ git log -1 src/config.js</div>
          <div data-r="2"><span class="r">2:40 a.m.</span> <span class="dim">You.</span></div>
        </div>` } },
    { who: 'nia', text: "It's the API file. I already know it is.", nia: 'smug', claude: 'neutral', pose: 'point' },
    { who: 'claude', text: "It's the config file. Someone deleted a line at 2:40.", say: "It's the config file. Someone deleted a line at two forty.", claude: 'deadpan', nia: 'shocked', reveal: 1, shot: 'claude' },
    { who: 'nia', text: 'Who would do that?', nia: 'shocked', claude: 'smug', pose: 'shrug', shot: 'nia' },
    { who: 'claude', text: 'Git says you did.', claude: 'smug', cpose: 'shrug', nia: 'annoyed', reveal: 2, shot: 'two' },
    // tip 3: plan first, then the fix and a test
    { who: 'claude', text: "Last thing. Before I change any code, I'll show you a plan.", claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 3, title: 'Plan first. Then the fix.', note: 'Plan mode', cap: 'Terminal: budget-app', html: `
        <div class="term">
          <div data-r="0" class="y">Plan: no edits yet</div>
          <div data-r="0" class="gap">1. Put back <span class="o">BASE_URL</span></div>
          <div data-r="0">2. Handle empty data</div>
          <div data-r="0">3. Add a test for this bug</div>
          <div data-r="1" class="gap dim">you: skip the plan, just fix it</div>
          <div data-r="2" class="r">last time: database deleted</div>
          <div data-r="3" class="gap g">✓ 12 tests passed. Committed.</div>
        </div>` } },
    { who: 'nia', text: 'Skip the plan. Just fix it.', nia: 'annoyed', claude: 'deadpan', reveal: 1, pose: 'gesture' },
    { who: 'claude', text: 'Last time you said that, we lost your database.', claude: 'sideeye', nia: 'sheepish', reveal: 2, shot: 'claude' },
    { who: 'nia', text: 'Okay. Show me the plan.', nia: 'sheepish', claude: 'happy', pose: 'neck', shot: 'nia' },
    { who: 'nia', text: 'It works! Can we add one more feature?', nia: 'excited', claude: 'deadpan', reveal: 3, pose: 'cheer', shot: 'two', gap: .3 },
    { who: 'claude', text: "It's three a.m. Go to bed.", claude: 'deadpan', cpose: 'point', nia: 'sad', shot: 'claude', panel: null },
  ],
};
