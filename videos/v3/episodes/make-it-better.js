module.exports = {
  theme: 'cafe', seed: 33, moves: 3,
  outro: { line: 'Save this before you type "fix it"' },
  hook: {"title":"You typed 3 words and expected Claude to read your *mind*"},
  beats: [
    // problem: a three-word prompt with no context
    { who: 'nia', text: 'Claude, make it better.', nia: 'annoyed', claude: 'neutral', pose: 'gesture', shot: 'nia', toast: {"app":"Your prompt","icon":"pen","text":"\"make it better\"","tone":"red"} },
    { who: 'claude', text: 'Make what better?', claude: 'squint', nia: 'annoyed', shot: 'claude' },
    { who: 'nia', text: 'The email! You should know what I mean.', nia: 'annoyed', claude: 'squint', shot: 'nia', pose: 'point' },
    { who: 'claude', text: "I'm smart, but I'm not a mind reader.", claude: 'sideeye', cpose: 'shrug', nia: 'sheepish', shot: 'claude' },
    // tip 1: who it's for and what you want
    { who: 'claude', text: "Tell me who it's for, and what you want them to do.", claude: 'neutral', nia: 'neutral', shot: 'two', cpose: 'palm',
      panel: { move: 1, title: "Say who it's for", note: 'who + what you want', cap: 'Claude', html: `
        <div class="msg me struck" data-r="0">make it better</div>
        <div class="msg me" data-r="1"><span data-type="2.2">Email to my landlord. The sink has been broken for 3 weeks. I want it fixed by Friday.</span></div>
        <div class="row wrap" data-r="2"><span class="tag ok">polite</span><span class="tag ok">clear deadline</span><span class="tag bad">firm</span></div>` } },
    { who: 'nia', text: "It's for my landlord. My sink's been broken for three weeks. I want it fixed by Friday.", nia: 'annoyed', claude: 'neutral', reveal: 1, pose: 'gesture' },
    { who: 'claude', text: 'Perfect. So, polite, with a clear deadline.', claude: 'happy', nia: 'neutral', reveal: 2 },
    { who: 'nia', text: 'And maybe a little threatening.', nia: 'smug', claude: 'deadpan', shot: 'nia', pose: 'chin' },
    { who: 'claude', text: "We'll call that firm.", claude: 'deadpan', nia: 'sheepish', shot: 'claude' },
    // tip 2: show an example of the tone
    { who: 'claude', text: "Next, paste an email you liked, and I'll copy the tone.", claude: 'neutral', nia: 'neutral', shot: 'two', cpose: 'palm',
      panel: { move: 2, title: 'Show the tone you want', note: 'paste one you liked', cap: 'Claude', html: `
        <div class="msg me" data-r="0">Write it like this one. <span class="tag">deposit_email.txt</span></div>
        <div class="quote" data-r="1">"Per section 4.2, the deposit was due back on the 1st. I'd love to close this out by Friday."</div>
        <div class="msg ai" data-r="2">Tone: <mark>petty, but professional</mark>.</div>` } },
    { who: 'nia', text: 'This one got my deposit back.', nia: 'smug', claude: 'neutral', reveal: 1, pose: 'point' },
    { who: 'claude', text: 'Petty, but professional. I love it.', claude: 'happy', cpose: 'shrug', nia: 'excited', reveal: 2 },
    // tip 3: let it ask questions first
    { who: 'claude', text: 'Last, for anything big, ask me to ask you questions first.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 3, title: 'Let it ask first', note: 'three questions', cap: 'Claude', html: `
        <div class="msg me" data-r="0">Before you write it, ask me 3 questions.</div>
        <div class="msg ai list" data-r="1"><span>1. Has he replied before?</span><span>2. What does your lease say about repairs?</span><span>3. What happens if he misses Friday?</span></div>` } },
    { who: 'nia', text: 'Wait. You can interview me?', nia: 'shocked', claude: 'neutral', reveal: 1, pose: 'chin' },
    { who: 'claude', text: 'Three quick questions now save three rewrites later.', claude: 'neutral', nia: 'excited' },
    { who: 'nia', text: 'So "make it better" was a bad prompt.', say: 'So, make it better was a bad prompt.', nia: 'sheepish', claude: 'neutral', pose: 'neck', panel: null, shot: 'nia' },
    { who: 'claude', text: "That wasn't a prompt. That was a wish.", claude: 'smug', cpose: 'shrug', nia: 'annoyed', shot: 'claude' },
  ],
};
