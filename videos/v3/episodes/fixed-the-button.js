// name: fixed-the-button
module.exports = {
  theme: 'morning', seed: 31, moves: 4,
  outro: { line: 'Save this before your next fix' },
  hook: {"title":"Vibe coding: every *fix* breaks something *else*"},
  beats: [
    // problem: Claude fixed the button and broke the login for forty beta users
    { who: 'nia', text: "Every fix you make breaks my app. Forty users can't log in.", nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia', toast: {"app":"Beta feedback","icon":"chat","text":"Maya: login broke AGAIN??","tone":"red"} },
    { who: 'claude', text: "The code isn't the problem. You have no undo.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    { who: 'nia', text: 'I trust you, though.', nia: 'sheepish', claude: 'squint', pose: 'shrug', shot: 'nia' },
    { who: 'claude', text: 'One commit. Nine days ago.', claude: 'deadpan', nia: 'sheepish', shot: 'two' },
    { who: 'nia', text: 'That was the template.', pre: 'uh', nia: 'sheepish', claude: 'deadpan', pose: 'neck', shot: 'nia' },
    // step 1: commit before every change
    { who: 'claude', text: 'Step one. Commit before every change.', pre: 'ahem', claude: 'neutral', nia: 'neutral', cpose: 'palm', shot: 'two',
      panel: { move: 1, title: 'Commit before every change', note: 'your undo button', cap: 'Terminal: beta-app', html: `
        <div class="term">
          <div data-r="0"><span class="g">~/beta-app</span> $ <span data-type="2">git commit -am "login works"</span></div>
          <div data-r="1" class="gap dim">Claude edits 6 files...</div>
          <div data-r="1" class="r">✗ login broken</div>
          <div data-r="2" class="gap"><span class="g">~/beta-app</span> $ git restore .</div>
          <div data-r="2" class="g">✓ back to "login works"</div>
        </div>` } },
    { who: 'nia', text: 'Commits are for real engineers.', nia: 'annoyed', claude: 'deadpan', pose: 'gesture', reveal: 1, shot: 'nia' },
    { who: 'claude', text: 'Real engineers can undo.', claude: 'smug', cpose: 'shrug', nia: 'annoyed', reveal: 2, shot: 'claude' },
    // step 2: test what works before changing it
    { who: 'claude', text: 'Step two. Before I change it, I test what works.', claude: 'neutral', nia: 'neutral', cpose: 'palm', shot: 'two',
      panel: { move: 2, title: 'Test what works first', note: 'Claude Code', cap: 'Terminal: beta-app', html: `
        <div class="term">
          <div data-r="0" class="y">&gt; <span data-type="2">write a test for login. change nothing.</span></div>
          <div data-r="1" class="gap g">✓ login.test.js passed</div>
          <div data-r="2" class="gap dim">fixing the button...</div>
          <div data-r="2" class="r">✗ login.test.js failed. Stopped.</div>
        </div>` } },
    { who: 'nia', text: 'My users are my tests.', nia: 'smug', claude: 'squint', pose: 'point', reveal: 1, shot: 'nia' },
    { who: 'claude', text: 'Now the test complains. Not Maya.', claude: 'deadpan', nia: 'sheepish', reveal: 2, shot: 'claude' },
    // step 3: plan mode before edits
    { who: 'claude', text: 'Step three. Plan mode. You see the plan before any edits.', claude: 'neutral', nia: 'neutral', cpose: 'palm', shot: 'two',
      panel: { move: 3, title: 'Plan before edits', note: 'Plan mode', cap: 'Claude Code', html: `
        <div class="term">
          <div data-r="0" class="y">Plan mode: no edits yet</div>
          <div data-r="0" class="gap">1. Fix button padding</div>
          <div data-r="1">2. Refactor <mark>auth.js</mark></div>
          <div data-r="2" class="gap g">✓ Plan updated: button only</div>
        </div>` } },
    { who: 'nia', text: 'Wait. Why is login in a button fix?', nia: 'shocked', claude: 'neutral', pose: 'point', reveal: 1, shot: 'nia' },
    { who: 'claude', text: "Exactly. That's how yesterday happened.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    { who: 'nia', text: 'Cut it.', nia: 'annoyed', claude: 'happy', pose: 'gesture', reveal: 2, shot: 'nia' },
    // step 4: read the diff before accepting
    { who: 'claude', text: 'Step four. Read the diff before you hit accept.', claude: 'neutral', nia: 'neutral', cpose: 'palm', shot: 'two',
      panel: { move: 4, title: 'Read the diff', note: 'before you hit accept', cap: 'Claude Code', html: `
        <div class="term" data-r="0">
          <div class="dim">src/Button.jsx</div>
          <div class="r">- padding: 4px</div>
          <div class="g">+ padding: 12px</div>
        </div>
        <div class="row wrap" data-r="1"><span class="tag ok">1 file</span><span class="tag ok">login untouched</span></div>
        <div class="btn hot" data-r="2">Accept</div>` } },
    { who: 'nia', text: "I'll skim it. It's huge.", nia: 'sheepish', claude: 'squint', pose: 'shrug', shot: 'nia' },
    { who: 'claude', text: "It's two lines, Nia.", claude: 'smug', cpose: 'shrug', nia: 'sheepish', reveal: 1, shot: 'claude' },
    { who: 'nia', text: 'Accept.', nia: 'excited', claude: 'happy', pose: 'cheer', reveal: 2, shot: 'two' },
    // twist: she's already ahead of Claude
    { who: 'claude', text: 'Next feature. Commit first.', claude: 'neutral', cpose: 'point', nia: 'smug', shot: 'two', gap: .3 },
    { who: 'nia', text: "Did. Test's written too.", nia: 'smug', claude: 'surprised', pose: 'chin', shot: 'nia' },
    { who: 'claude', text: 'Who are you?', claude: 'surprised', nia: 'smug', shot: 'claude', panel: null },
  ],
};
