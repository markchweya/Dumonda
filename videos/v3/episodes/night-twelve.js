// name: night-twelve
module.exports = {
  theme: 'bedroom', seed: 41, moves: 4,
  outro: { line: 'Save this before tonight’s scroll' },
  hook: {"title":"7 hours a day on my *phone* and I can't *quit*"},
  beats: [
    // problem: 1 a.m., 7h 40m, asking from the phone itself
    { who: 'nia', text: '7h 40m on my phone today. How do I quit?', say: 'Seven hours forty on my phone today. How do I quit?', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia', toast: {"app":"Screen Time","icon":"chat","text":"Daily average: 7h 40m","tone":"red"} },
    { who: 'claude', text: "Another tip won't help. This is night twelve.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    { who: 'claude', text: "And you're asking me from your phone.", claude: 'sideeye', nia: 'sheepish', shot: 'two' },
    { who: 'nia', text: 'I tried grayscale. Night three.', nia: 'annoyed', claude: 'neutral', pose: 'gesture', shot: 'nia' },
    // step 1: real numbers, not vibes
    { who: 'claude', pre: 'ahem', text: 'Step one. Give me numbers, not vibes.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 1, title: 'Numbers, not vibes', note: 'Screen Time, pasted', cap: 'Claude', html: `
        <div class="msg me" data-r="0">i'm on my phone a lot</div>
        <div class="sheet" data-r="1"><h5>Today</h5><p>TikTok <mark>4h 12m</mark></p><p>Instagram 2h 05m</p><p>146 pickups</p></div>
        <div class="msg ai" data-r="2">Most of it after <u>11 p.m.</u></div>` } },
    { who: 'nia', text: 'Fine. Pasting Screen Time.', nia: 'sheepish', claude: 'neutral', reveal: 1, pose: 'neck' },
    { who: 'nia', text: 'Four hours of TikTok? Rude.', nia: 'shocked', claude: 'deadpan', pose: 'point', shot: 'nia' },
    { who: 'claude', text: 'Mostly after eleven.', claude: 'smug', nia: 'sad', reveal: 2, shot: 'claude' },
    // step 2: a Project that remembers what she tried
    { who: 'claude', text: 'Step two. Make a Project. List what already failed.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'A Project that remembers', note: 'project instructions', cap: 'Project: Phone', html: `
        <div class="tile" data-r="0"><h5>Instructions</h5><p>Don't suggest what I already tried.</p></div>
        <div class="doc" data-r="1">Grayscale: lasted 2 days<br>App timer: ignored 40 times<br>Phone in kitchen: walked to kitchen</div>
        <div class="row wrap" data-r="2"><span class="tag bad">no repeats</span><span class="tag ok">night 12 remembered</span></div>` } },
    { who: 'nia', text: 'I ignored the app timer forty times.', nia: 'sheepish', claude: 'neutral', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: 'Now I never suggest it again.', claude: 'happy', nia: 'neutral', reveal: 2, shot: 'two' },
    // step 3: ask questions first, find the trigger
    { who: 'claude', pre: 'hmm', text: 'Step three. Tell me to ask questions first.', claude: 'neutral', nia: 'neutral', cpose: 'point',
      panel: { move: 3, title: 'Questions before tips', note: 'find the trigger', cap: 'Claude', html: `
        <div class="msg me" data-r="0">Ask me 3 questions before any advice.</div>
        <div class="msg ai list" data-r="1"><span>What do you open first?</span><span>What happens right before?</span><span>Where's your charger?</span></div>
        <div class="code" data-r="2"><b>Trigger:</b> work email, in bed, 11:40 p.m.</div>` } },
    { who: 'claude', text: 'What happens right before you scroll?', claude: 'squint', nia: 'neutral', reveal: 1, shot: 'claude' },
    { who: 'nia', pre: 'uh', text: 'I check work email. Then I need to calm down.', nia: 'sheepish', claude: 'neutral', pose: 'neck', shot: 'nia' },
    { who: 'claude', text: 'There it is.', claude: 'smug', nia: 'shocked', reveal: 2, shot: 'two' },
    // step 4: one tiny plan, as an artifact
    { who: 'claude', text: 'Step four. One tiny plan. Make it an artifact.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 4, title: 'One plan, not twelve', note: 'artifact', cap: 'Artifact: Tonight', html: `
        <div class="doc" data-r="0"><span data-type="2">Email off after 9 p.m. Charger in the hallway.</span></div>
        <div class="meter" data-r="1"><i style="width:14%"></i></div>
        <div class="stamp" data-r="2">Night 1 of 7</div>` } },
    { who: 'nia', text: 'Just one thing? Add a few more tips.', nia: 'pleading', claude: 'deadpan', reveal: 1, pose: 'gesture' },
    { who: 'claude', text: 'You tried twelve. None stuck.', claude: 'deadpan', nia: 'sheepish', reveal: 2, shot: 'claude' },
    // twist: she's still typing
    { who: 'nia', text: "Done. Phone's charging in the hallway.", nia: 'smug', claude: 'squint', pose: 'cheer', shot: 'two', gap: .3, panel: null },
    { who: 'claude', text: 'Then what are you typing on?', claude: 'sideeye', cpose: 'point', nia: 'shocked', shot: 'claude' },
    { who: 'nia', text: 'The iPad.', nia: 'sheepish', claude: 'deadpan', pose: 'shrug', shot: 'nia' },
  ],
};
