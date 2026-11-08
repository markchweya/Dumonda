// name: one-more-prompt
// Written by hand after the-3am-bug's Instagram numbers (21 s average watch, 0 shares): shorter, one idea, a joke every few lines, ends where it began, asks for a send.
module.exports = {
  theme: 'midnight', seed: 47, moves: 2,
  outro: { line: "Send this to the friend who's one prompt away" },
  hook: { title: 'Vibe coding since *9 p.m.* Still *one prompt* from done' },
  beats: [
    // context and lean: vibe coding all night, 147 prompts, still not done
    { who: 'nia', text: 'Vibe coding since nine. Still one prompt away from done.', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia',
      toast: { app: 'Claude', icon: 'chat', text: 'Prompts tonight: 147', tone: 'red' } },
    // snapback: it isn't coding, it's a slot machine
    { who: 'claude', sfx: 'scratch', text: "You're not coding. You're pulling a slot machine.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    // roast
    { who: 'nia', text: 'This next one works. I can feel it.', nia: 'pleading', claude: 'deadpan', pose: 'gesture', shot: 'nia' },
    { who: 'claude', text: 'You felt it 146 prompts ago.', say: 'You felt it a hundred and forty-six prompts ago.', claude: 'sideeye', nia: 'sheepish', cpose: 'shrug', shot: 'claude' },
    { who: 'nia', text: "This one's different. I said please.", nia: 'smug', claude: 'deadpan', pose: 'point', shot: 'nia' },
    { who: 'claude', text: 'In all caps.', claude: 'deadpan', nia: 'sheepish', cpose: 'palm', shot: 'two' },
    // the fix: say what done looks like
    { who: 'claude', pre: 'ahem', text: 'Stop re-rolling. Tell me what done looks like.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 1, title: 'Write down done', note: 'Before the next prompt', cap: 'Notes: my app', html: `
        <div class="sheet">
          <h5 data-r="0">Done means a user can:</h5>
          <p data-r="1">1. Sign up</p>
          <p data-r="1">2. Get the welcome email</p>
          <p data-r="1">3. See their dashboard</p>
        </div>` } },
    { who: 'nia', text: 'Done is... it works?', nia: 'sheepish', claude: 'squint', pose: 'chin', shot: 'nia' },
    { who: 'claude', text: 'Three things a user can do. Say them.', claude: 'deadpan', nia: 'neutral', cpose: 'point', shot: 'claude' },
    { who: 'nia', text: 'Sign up. Get the email. See the dashboard.', nia: 'neutral', claude: 'happy', pose: 'gesture', reveal: 1, shot: 'nia' },
    // test only those three
    { who: 'claude', text: 'Sign up works. Dashboard works. The email never sends.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'Test only those three', note: 'Ignore everything else', cap: 'Claude Code', html: `
        <div class="row wrap" data-r="0"><span class="tag ok">sign up: works</span><span class="tag ok">dashboard: works</span><span class="tag bad">email: never sent</span></div>
        <div class="row wrap gap" data-r="1"><span class="tag struck">button: 6 hours, never broken</span></div>
        <div class="term" data-r="2"><span class="g">fixed: welcome email sends</span></div>` } },
    { who: 'nia', pre: 'oh', text: 'So six hours on the button...', nia: 'shocked', claude: 'neutral', pose: 'head', reveal: 1, shot: 'nia' },
    { who: 'claude', text: 'The button worked at nine. Yes.', claude: 'smug', nia: 'sad', cpose: 'shrug', shot: 'claude' },
    { who: 'claude', text: 'One fix. Email sends. You are done.', claude: 'happy', nia: 'excited', cpose: 'point', reveal: 2, shot: 'two' },
    // twist that loops back to the opening line
    { who: 'nia', text: "Done! Okay, quick one. Let's add dark mode.", nia: 'excited', claude: 'deadpan', pose: 'cheer', shot: 'nia', panel: null },
    { who: 'claude', text: "That's how nine p.m. started.", claude: 'deadpan', cpose: 'point', nia: 'sheepish', shot: 'two', panel: null },
  ],
};
