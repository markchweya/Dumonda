// name: anyone-can-read
module.exports = {
  theme: 'cafe', seed: 31, moves: 4,
  outro: { line: 'Save this before you email your waitlist' },
  hook: { title: '*300* signups and I never checked who can *read* them' },
  beats: [
    // context and lean: 300 signups, nobody checked who can read them
    { who: 'nia', text: 'My waitlist has 300 signups. I never checked who can read them.', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia',
      toast: { app: 'Database', icon: 'book', text: '300 signups. Read access: never checked', tone: 'red' } },
    // snapback: "nobody's looking" is not the same as "nobody can look"
    { who: 'claude', text: "Nobody looking isn't the same as nobody able to look.", claude: 'deadpan', cpose: 'point', nia: 'sheepish', shot: 'claude' },
    // roast
    { who: 'claude', text: 'Who can read that table right now?', claude: 'deadpan', pre: 'ahem', nia: 'neutral', shot: 'claude' },
    { who: 'nia', text: 'Me. And the app.', nia: 'smug', claude: 'deadpan', pose: 'point', shot: 'nia' },
    { who: 'claude', text: 'Open a private window. You can read all 300.', say: 'Open a private window. You can read all three hundred.', claude: 'smug', cpose: 'point', nia: 'shocked', shot: 'two' },
    { who: 'nia', text: 'Okay. Like two people. Tops.', nia: 'sheepish', claude: 'neutral', pose: 'shrug' },
    { who: 'claude', text: 'Anyone with the link. Not two.', claude: 'deadpan', nia: 'annoyed', cpose: 'palm' },
    // step one: run the security check
    { who: 'claude', text: 'Step one. Type /security-review.', say: 'Step one. Type slash security review.', claude: 'neutral', nia: 'neutral', pre: 'ahem', cpose: 'point',
      panel: { move: 1, title: 'Run the security check', note: 'Claude Code', cap: 'Terminal: waitlist-app', html: `
        <div class="term">
          <div data-r="0"><span class="g">~/waitlist-app</span> $ <span data-type="1">claude</span></div>
          <div data-r="0" class="gap"><span class="o">&gt; /security-review</span></div>
          <div data-r="1" class="dim">Scanning 38 files...</div>
          <div data-r="2" class="gap"><span class="r">HIGH</span> signups table: readable by anyone</div>
        </div>` } },
    { who: 'nia', text: 'Wait. It says readable by anyone?', nia: 'shocked', claude: 'neutral', reveal: 2, pose: 'gesture', shot: 'nia' },
    { who: 'claude', text: 'Anyone. Including the bots.', claude: 'deadpan', cpose: 'shrug', nia: 'shocked', shot: 'claude' },
    // step two: ask it to flag what it is unsure of
    { who: 'claude', text: "Step two. Ask it to flag what it's unsure of.", claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: "Flag what it's unsure of", note: 'Ask it to doubt', cap: 'Claude Code', html: `
        <div class="msg me" data-r="0">Which of these are safe to leave public?</div>
        <div class="msg ai" data-r="1">I'm not sure about the email column. Flagged.</div>
        <div class="row wrap" data-r="2"><span class="tag bad">email: unsure</span><span class="tag ok">names: fine</span></div>` } },
    { who: 'nia', text: "I'd have just said it's fine.", nia: 'sheepish', claude: 'neutral', reveal: 2, pose: 'neck', shot: 'nia' },
    { who: 'claude', text: "That's the whole point of flagging.", claude: 'deadpan', pre: 'hmm', nia: 'sheepish' },
    // step three: plan before the rules change
    { who: 'claude', text: 'Step three. Plan first, then touch the rules.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 3, title: 'Plan before the rules', note: 'Plan mode', cap: 'Terminal: waitlist-app', html: `
        <div class="term">
          <div data-r="0" class="y">Plan: no edits yet</div>
          <div data-r="0" class="gap">1. Only the owner reads signups</div>
          <div data-r="1">2. Public form can add, not read</div>
          <div data-r="2" class="gap dim">you: just change the rules</div>
          <div data-r="3" class="r">last time: signups stopped for two days</div>
        </div>` } },
    { who: 'nia', text: "Just change the rules. I know what I'm doing.", nia: 'annoyed', claude: 'deadpan', reveal: 2, pose: 'gesture', shot: 'nia' },
    { who: 'claude', text: 'Last time you said that, signups stopped for two days.', claude: 'sideeye', nia: 'sheepish', reveal: 3, shot: 'claude' },
    { who: 'nia', text: 'Okay. Show me the plan.', nia: 'sheepish', claude: 'happy', pose: 'neck', shot: 'nia' },
    // step four: test as a stranger
    { who: 'claude', text: 'Step four. Test it as a stranger.', claude: 'neutral', nia: 'neutral', cpose: 'point',
      panel: { move: 4, title: 'Test it as a stranger', note: 'Private window', cap: 'Browser: logged out', html: `
        <div class="msg me" data-r="0">Read the signups table.</div>
        <div class="code" data-r="1">Access denied: signups</div>
        <div class="row wrap" data-r="2"><span class="tag ok">owner only</span></div>` } },
    { who: 'nia', text: "Denied. Good. That's the answer I want.", nia: 'excited', claude: 'neutral', reveal: 2, pose: 'cheer', shot: 'nia' },
    { who: 'claude', text: 'Two minutes. Better than two days.', claude: 'happy', cpose: 'shrug', nia: 'neutral', shot: 'claude' },
    // twist ending
    { who: 'nia', text: "So I'm basically a security expert now.", nia: 'smug', claude: 'deadpan', pose: 'point', shot: 'nia', panel: null },
    { who: 'claude', text: "You're a waitlist with a lock on it. Congratulations.", claude: 'smug', cpose: 'shrug', nia: 'annoyed', shot: 'two', panel: null },
  ],
};
