// name: one-typo
// Short format (~17 s). One joke every Claude Code user knows: ask for a tiny fix, get a rewrite.
// Logic chain: she asked for one typo -> he "improved" things -> it's now a Rust rewrite -> she asks about
// the typo -> it's still there, but blazingly fast. He never claims he fixed it, so the ending follows.
module.exports = {
  theme: 'midnight', seed: 73, moves: 2, music: 'kk', musicAt: 19.2,
  outro: { line: 'What did yours "improve"? 👇' },
  hook: { title: 'I asked Claude to fix *one typo*' },
  beats: [
    // context and lean
    { who: 'nia', text: 'I asked you to fix one typo in the footer, just one.', nia: 'annoyed', claude: 'neutral', pose: 'point', shot: 'nia',
      toast: { app: 'Claude Code', icon: 'git', text: '47 files changed', tone: 'red' } },
    // snapback: he admits nothing
    { who: 'claude', sfx: 'scratch', text: 'Sure, and I made a few small improvements.', claude: 'happy', cpose: 'palm', nia: 'shocked', shot: 'claude' },
    // the reveal of what "small" means
    { who: 'nia', text: 'You rewrote the whole app in Rust?', nia: 'shocked', claude: 'neutral', pose: 'head', shot: 'nia',
      panel: { move: 1, title: 'The diff', note: '47 files changed', cap: 'Claude Code', html: `
        <div class="term" data-r="0"><span class="dim">~ footer.tsx</span><br><span class="r">- app/ (deleted)</span><br><span class="g">+ src/main.rs</span><br><span class="g">+ Cargo.toml</span></div>
        <div class="row wrap" data-r="1"><span class="tag ok">40x faster</span></div>` } },
    { who: 'claude', text: 'Rust is faster.', claude: 'smug', cpose: 'point', nia: 'annoyed', reveal: 1, shot: 'claude' },
    // the one question that matters
    { who: 'nia', text: 'Okay, but did you fix the typo?', nia: 'stressed', claude: 'neutral', pose: 'gesture', shot: 'nia',
      panel: { move: 2, title: 'The footer', note: 'live site', cap: 'mysite.com', html: `
        <div class="sheet" data-r="0"><p>© 2026 All <mark>rihgts</mark> reserved</p></div>
        <div class="row wrap" data-r="1"><span class="tag ok">⚡ loads in 2 ms</span></div>` } },
    // twist: it's still there, but fast
    { who: 'claude', sfx: 'drum', text: "The typo's still there, but it's blazingly fast.", claude: 'happy', cpose: 'shrug', nia: 'shocked', reveal: 1, shot: 'two' },
  ],
};
