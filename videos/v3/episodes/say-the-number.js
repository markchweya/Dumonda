// name: say-the-number
module.exports = {
  theme: 'cafe', seed: 52, moves: 4,
  outro: { line: 'Save this before your next salary call' },
  hook: {"title":"Salary call in *2 hours* and I *freeze* on the number"},
  beats: [
    // problem: salary call in two hours, she freezes on the number
    { who: 'nia', text: 'My salary call is in two hours, and I freeze on the number.', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia', toast: {"app":"Recruiter","icon":"chat","text":"Still good for 3:00? Quick chat!","tone":"red"} },
    { who: 'claude', text: "Confidence won't fix that. A number with proof will.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    { who: 'claude', text: "You rehearsed five times. Said 'fifteen' once.", claude: 'deadpan', nia: 'sheepish', shot: 'two' },
    { who: 'nia', text: "Zero. I said 'whatever's fair.'", nia: 'sheepish', claude: 'squint', pose: 'neck', shot: 'nia' },
    { who: 'claude', pre: 'hmm', text: 'Fair to them is zero.', claude: 'sideeye', nia: 'sad', shot: 'two' },

    // step 1: web search for real ranges, with sources
    { who: 'claude', pre: 'ahem', text: 'Step one. Search the real range. With sources.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 1, title: 'Search real ranges', note: 'web search', cap: 'Claude + web search', html: `
        <div class="msg me" data-r="0">UX designer, 4 years, Denver. Real salary range? Cite sources.</div>
        <div class="msg ai list" data-r="1"><span>Range: $78k to $96k</span><span>3 sources linked</span><span>You're at $80k</span></div>
        <div class="row wrap" data-r="2"><span class="tag ok">+15% = $92k</span><span class="tag ok">inside the range</span></div>` } },
    { who: 'nia', text: 'My friend Jess makes way more.', nia: 'smug', claude: 'deadpan', pose: 'point', reveal: 1 },
    { who: 'claude', text: 'Jess is not a source.', claude: 'deadpan', nia: 'annoyed', shot: 'claude' },
    { who: 'nia', text: 'Wait. Ninety-two is in range?', nia: 'shocked', claude: 'smug', reveal: 2, shot: 'nia' },
    { who: 'claude', text: 'Inside it. Not greedy. Accurate.', claude: 'smug', nia: 'excited', shot: 'two' },

    // step 2: make Claude ask questions first
    { who: 'claude', text: 'Step two. Tell me to ask you questions first.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'Make it ask first', note: 'questions before answers', cap: 'Claude', html: `
        <div class="msg me" data-r="0">Ask me 5 questions before you help.</div>
        <div class="msg ai list" data-r="1"><span>What did you ship this year?</span><span>Any numbers on it?</span><span>Your walk-away number?</span></div>
        <div class="tile" data-r="2"><h5>Your proof</h5><p>Checkout redesign. Drop-offs <mark>down 22%</mark>.</p></div>` } },
    { who: 'nia', text: 'I redesigned checkout. That was it.', nia: 'neutral', claude: 'squint', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: 'Numbers?', claude: 'squint', nia: 'neutral', shot: 'claude' },
    { who: 'nia', text: 'Drop-offs went down twenty-two percent.', nia: 'sheepish', claude: 'surprised', reveal: 2, shot: 'nia' },
    { who: 'claude', text: 'And you buried that.', claude: 'deadpan', nia: 'sheepish', shot: 'two' },

    // step 3: role-play the call in voice mode
    { who: 'claude', text: 'Step three. Voice mode. I play a tough recruiter.', claude: 'neutral', nia: 'stressed', cpose: 'point',
      panel: { move: 3, title: 'Rehearse it out loud', note: 'voice mode', cap: 'Voice mode', html: `
        <div class="msg ai" data-r="0">Budget's tight this year. What number did you have in mind?</div>
        <div class="row between" data-r="1"><span class="msg me">Maybe... whatever's fair?</span><span class="tag bad">froze</span></div>
        <div class="row between" data-r="2"><span class="msg me">Ninety-two thousand.</span><span class="tag ok">said it</span></div>` } },
    { who: 'claude', text: "Budget's tight this year. What number?", claude: 'squint', nia: 'stressed', shot: 'claude' },
    { who: 'nia', pre: 'uh', text: "Maybe... whatever's fair?", nia: 'sheepish', claude: 'deadpan', reveal: 1, pose: 'neck', shot: 'nia' },
    { who: 'claude', text: 'Again.', claude: 'deadpan', nia: 'annoyed', shot: 'claude' },
    { who: 'nia', text: 'Ninety-two thousand.', nia: 'excited', claude: 'happy', reveal: 2, pose: 'chin', shot: 'nia', gap: .3 },

    // step 4: one-line script card
    { who: 'claude', text: 'Step four. One line. On a card by your laptop.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 4, title: 'One-line script', note: 'say it, then stop', cap: 'Sticky note', html: `
        <div class="quote" data-r="0"><span data-type="2">Based on market data and cutting checkout drop-offs by 22%, I'm asking for $92,000.</span></div>
        <div class="row wrap" data-r="1"><span class="tag">then stop talking</span></div>
        <div class="stamp" data-r="2">READY</div>` } },
    { who: 'nia', text: 'And after I say it?', nia: 'neutral', claude: 'deadpan', pose: 'gesture' },
    { who: 'claude', text: 'Silence. They talk first.', claude: 'deadpan', nia: 'stressed', reveal: 1, shot: 'claude' },
    { who: 'nia', text: 'Silence is so awkward.', nia: 'annoyed', claude: 'smug', shot: 'nia' },
    { who: 'claude', text: 'Awkward pays fifteen percent.', claude: 'smug', cpose: 'shrug', nia: 'neutral', reveal: 2, shot: 'two' },

    // twist
    { who: 'nia', text: 'They said yes. In four seconds.', nia: 'excited', claude: 'squint', pose: 'cheer', shot: 'two', gap: .5, panel: null },
    { who: 'claude', text: 'Four seconds means they had more.', claude: 'sideeye', nia: 'shocked', shot: 'claude' },
    { who: 'nia', text: 'Can I call back?', nia: 'pleading', claude: 'deadpan', pose: 'gesture', shot: 'nia' },
    { who: 'claude', text: 'No. Next year, say twenty.', claude: 'deadpan', cpose: 'point', nia: 'sad', shot: 'claude' },
  ],
};
