// name: no-shorter
module.exports = {
  theme: 'midnight', seed: 41, moves: 4,
  outro: { line: 'Save this before your next deadline' },
  hook: {"title":"Out of *Claude* *messages* at 2 a.m."},
  beats: [
    // problem: locked out at 2 a.m., statement due at nine
    { who: 'nia', text: "I hit my Claude limit at 2 a.m. My statement's due at nine.", say: "I hit my Claude limit at two a.m. My statement's due at nine.", nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia', toast: {"app":"Claude","icon":"chat","text":"You've hit your usage limit","tone":"red"} },
    { who: 'claude', text: "You didn't run out. You spent it on two words.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    { who: 'claude', text: "No, shorter. Twenty-five times.", pre: 'hmm', claude: 'squint', nia: 'sheepish', shot: 'two' },
    { who: 'nia', text: "Twenty-six. One was 'shorter pls'.", nia: 'sheepish', claude: 'deadpan', pose: 'neck', shot: 'nia' },
    { who: 'nia', text: "It's a very important paragraph.", nia: 'pleading', claude: 'deadpan', pose: 'gesture' },

    // step 1: edit the original message, don't stack follow-ups
    { who: 'claude', text: 'Step one. Edit your first message. Stop replying.', pre: 'ahem', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 1, title: 'Edit. Don\'t follow up.', note: 'pencil on your first message', cap: 'Claude', html: `
        <div class="msg me" data-r="0">rewrite this paragraph, shorter</div>
        <div class="row wrap" data-r="1"><span class="tag bad">no, shorter</span><span class="tag bad">no, shorter</span><span class="tag bad">shorter pls</span><span class="tag bad">+23</span></div>
        <div class="msg me" data-r="2"><span data-type="2">rewrite this in 120 words, warm, plain</span></div>
        <div class="row between" data-r="3"><span class="tag ok">edited</span><span class="tag">1 message</span></div>` } },
    { who: 'nia', text: 'But the follow-ups were working.', nia: 'annoyed', claude: 'deadpan', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: 'Each one dragged the whole chat along.', claude: 'deadpan', nia: 'sheepish', shot: 'claude' },
    { who: 'nia', text: 'Okay. Fix the first one.', nia: 'sheepish', claude: 'happy', reveal: 2, pose: 'neck', shot: 'nia' },
    { who: 'claude', text: 'One message. Same result.', claude: 'smug', nia: 'neutral', reveal: 3, shot: 'two' },

    // step 2: show the length and tone with an example
    { who: 'claude', text: 'Step two. Show me the length you want.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'Give an example', note: 'this long, this voice', cap: 'Claude', html: `
        <div class="msg me" data-r="0">match this length and tone:</div>
        <div class="quote" data-r="1">Mom, I'm fine. I just miss the kitchen.</div>
        <div class="row wrap" data-r="2"><span class="tag ok">~90 words</span><span class="tag ok">plain</span><span class="tag ok">no "passionate"</span></div>` } },
    { who: 'nia', text: "I don't have an example.", nia: 'annoyed', claude: 'squint', pose: 'gesture' },
    { who: 'claude', text: 'The text you sent your mom at midnight.', claude: 'sideeye', nia: 'shocked', reveal: 1, shot: 'claude' },
    { who: 'nia', text: 'That was a rant.', nia: 'sheepish', claude: 'neutral', pose: 'chin', shot: 'nia' },
    { who: 'claude', text: 'Ninety words. Honest. Use it.', claude: 'smug', nia: 'neutral', reveal: 2, shot: 'two' },

    // step 3: say what has to stay
    { who: 'claude', text: "Step three. Tell me what can't be cut.", claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 3, title: 'Say what stays', note: 'cut around it', cap: 'Claude', html: `
        <div class="sheet" data-r="0"><h5>Keep</h5><p>Grandma's kitchen</p><p>The robot that caught fire</p></div>
        <div class="code" data-r="1"><b>Draft 19:</b> grandma removed</div>
        <div class="sheet" data-r="2"><h5>Cut anything else</h5><p>"ever since I was young"</p></div>` } },
    { who: 'nia', text: 'Draft nineteen cut my grandma.', pre: 'uh', nia: 'sad', claude: 'deadpan', reveal: 1, pose: 'head', shot: 'nia' },
    { who: 'claude', text: 'You said shorter. She was long.', claude: 'deadpan', nia: 'annoyed', cpose: 'shrug', shot: 'claude' },
    { who: 'nia', text: 'Grandma stays. Robot stays.', nia: 'annoyed', claude: 'happy', reveal: 2, pose: 'point', shot: 'two' },

    // step 4: new chat with a handoff summary
    { who: 'claude', text: 'Step four. Ask for a handoff summary. Open a new chat.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 4, title: 'Fresh chat, handoff', note: 'leave the mess behind', cap: 'Claude', html: `
        <div class="msg me" data-r="0">write a handoff summary for a new chat</div>
        <div class="doc" data-r="1"><p><mark>Goal:</mark> one paragraph, 120 words</p><p>Keep: grandma, robot</p><p>Tone: like the text to Mom</p></div>
        <div class="btn hot" data-r="2">New chat</div>
        <div class="msg ai" data-r="3">Draft 1. 118 words.</div>` } },
    { who: 'nia', text: "Why not keep this chat?", nia: 'neutral', claude: 'deadpan', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: "It's twenty-six versions of one paragraph.", claude: 'sideeye', nia: 'sheepish', reveal: 2, shot: 'claude' },
    { who: 'nia', text: "Okay. First try. It's actually good.", nia: 'excited', claude: 'happy', reveal: 3, pose: 'cheer', shot: 'nia', gap: .3 },

    // twist: she never needed shorter
    { who: 'claude', text: "Your word limit's 650. You were at 410.", say: "Your word limit's six fifty. You were at four ten.", claude: 'deadpan', nia: 'shocked', cpose: 'point', shot: 'claude', panel: null },
    { who: 'nia', text: 'So I can make it longer?', pre: 'oh', nia: 'smug', claude: 'deadpan', pose: 'chin', shot: 'nia' },
    { who: 'claude', text: 'Edit the first message.', claude: 'smug', cpose: 'palm', nia: 'sheepish', shot: 'two' },
  ],
};
