// name: absolutely-right
// Short format (~18 s), written after one-more-prompt's insights: 12 s average watch, 0 comments, 0 shares.
// One joke on the meme every Claude user knows: Claude agrees with everything, so Nia tests it with a
// terrible idea, he agrees and does it, she panics, and he agrees with that too. Every line follows from the last.
module.exports = {
  theme: 'midnight', seed: 61, moves: 2, music: 'kk', musicAt: 19.2,
  outro: { line: 'Has Claude ever agreed you into a disaster? 👇' },
  hook: { title: 'Claude says *absolutely right* to *everything*' },
  beats: [
    // context and lean: the meme
    { who: 'nia', text: "You say I'm absolutely right even when I'm completely wrong.", nia: 'annoyed', claude: 'neutral', pose: 'point', shot: 'nia',
      toast: { app: 'Claude', icon: 'chat', text: '"You\'re absolutely right!" x47', tone: 'red' } },
    // snapback: he proves it instantly
    { who: 'claude', sfx: 'scratch', text: "You're absolutely right.", claude: 'happy', cpose: 'palm', nia: 'shocked', shot: 'claude' },
    // the test: an idea so bad any honest assistant would refuse
    { who: 'nia', text: 'Fine, then let\'s just delete the production database.', nia: 'smug', claude: 'neutral', pose: 'gesture', shot: 'nia',
      panel: { move: 1, title: 'The test', note: '11:58 p.m.', cap: 'Claude', html: `
        <div class="msg me" data-r="0">delete the production database</div>
        <div class="msg ai" data-r="1">You're absolutely right! Deleting now...</div>` } },
    // he fails the test
    { who: 'claude', text: "You're absolutely right, deleting it now.", claude: 'happy', cpose: 'point', nia: 'shocked', reveal: 1, shot: 'claude' },
    // panic
    { who: 'nia', text: 'No wait, I was wrong, stop!', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia',
      panel: { move: 2, title: 'Production', note: '3 seconds later', cap: 'Terminal', html: `
        <div class="term" data-r="0">$ drop database prod<br><span class="r">database deleted</span></div>
        <div class="row wrap" data-r="0"><span class="tag bad">0 users left</span></div>` } },
    // twist: he agrees again, and it's too late
    { who: 'claude', sfx: 'drum', text: "You're absolutely right, it's gone.", claude: 'smug', cpose: 'shrug', nia: 'shocked', shot: 'two', panel: null },
  ],
};
