// name: message-three
module.exports = {
  theme: 'morning', seed: 31, moves: 4,
  outro: { line: 'Save this before your next 200-message chat' },
  hook: {"title":"214 messages in, and Claude *forgot* *my* *budget*"},
  beats: [
    // problem: 214 messages in, Claude is pitching venues 4,000 over budget
    { who: 'nia', text: "214 messages in, and you forgot my budget. That venue's $16,000.", say: "Two hundred fourteen messages in, and you forgot my budget. That venue's sixteen thousand.", nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia', toast: {"app":"Claude","icon":"chat","text":"Sister's Wedding · 214 messages","tone":"red"} },
    { who: 'claude', text: "I didn't forget it. You buried it. It's message three.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    { who: 'nia', text: 'Two fifteen. I just asked about doves.', nia: 'sheepish', claude: 'deadpan', pose: 'neck', shot: 'nia' },
    { who: 'claude', pre: 'hmm', text: 'The doves are not the problem.', claude: 'squint', nia: 'sheepish', shot: 'two' },
    // step 1: ask for a handoff summary
    { who: 'claude', pre: 'ahem', text: 'Step one. Ask me for a handoff summary. Budget first.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 1, title: 'Ask for a handoff', note: 'everything decided, one page', cap: "Chat: Sister's Wedding", html: `
        <div class="msg me" data-r="0">Write a handoff summary. Budget first.</div>
        <div class="msg ai list" data-r="1"><span>Budget: <mark>$12,000 total</mark></span><span>Date: May 17</span><span>Guests: 90</span><span>Venue: not chosen</span></div>
        <div class="row wrap" data-r="2"><span class="tag bad">Message 160 says 140 guests</span></div>` } },
    { who: 'nia', text: 'Fine. Summarize everything.', nia: 'annoyed', claude: 'neutral', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: 'It says 90 guests. You said 140 at message 160.', say: "It says ninety guests. You said a hundred forty at message one sixty.", claude: 'sideeye', nia: 'shocked', reveal: 2, shot: 'claude' },
    { who: 'nia', pre: 'uh', text: 'Mom added people.', nia: 'sheepish', claude: 'deadpan', pose: 'neck', shot: 'nia' },
    // step 2: start a fresh chat with the summary
    { who: 'claude', text: 'Step two. Open a fresh chat. Paste the summary in.', claude: 'neutral', nia: 'neutral', cpose: 'palm', shot: 'two',
      panel: { move: 2, title: 'Start a fresh chat', note: 'summary goes first', cap: 'Claude', html: `
        <div class="row between" data-r="0"><span class="tag bad">Old chat · 214 messages</span><span class="tag ok">New chat</span></div>
        <div class="msg me" data-r="1">Here's where we are. Pick up from here.</div>
        <div class="msg ai" data-r="2">Got it. <mark>$12,000</mark>, 140 guests, venue still open.</div>` } },
    { who: 'nia', text: 'But that chat knows me.', nia: 'pleading', claude: 'deadpan', pose: 'gesture' },
    { who: 'claude', text: 'It knows eleven barns you hated.', claude: 'deadpan', nia: 'annoyed', shot: 'claude' },
    { who: 'nia', text: 'Okay. Pasting it.', nia: 'neutral', claude: 'neutral', reveal: 1, shot: 'nia' },
    { who: 'claude', text: 'Look. I remember the budget.', claude: 'smug', cpose: 'shrug', nia: 'neutral', reveal: 2, shot: 'two' },
    // step 3: keep the summary and budget in a Project
    { who: 'claude', text: 'Step three. Make a Project. The budget goes in the instructions.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 3, title: 'Put it in a Project', note: 'instructions plus files', cap: "Project: Maya's Wedding", html: `
        <div class="sheet" data-r="0"><h5>Project instructions</h5><p>Hard cap: <mark>$12,000 total</mark>. Never suggest anything over it.</p></div>
        <div class="file" data-r="1"><i>MD</i>handoff-summary</div>
        <div class="file" data-r="1"><i>CSV</i>guest-list</div>
        <div class="row wrap" data-r="2"><span class="tag ok">Every new chat starts here</span></div>` } },
    { who: 'nia', text: "Can't I just remind you?", nia: 'smug', claude: 'deadpan', pose: 'shrug', shot: 'nia' },
    { who: 'claude', text: 'You did. Message three.', claude: 'smug', cpose: 'point', nia: 'annoyed', shot: 'claude' },
    { who: 'nia', text: 'Fine. Summary and guest list, uploaded.', nia: 'annoyed', claude: 'neutral', reveal: 1, pose: 'gesture', shot: 'two' },
    { who: 'claude', text: 'Now every new chat starts with them.', claude: 'happy', nia: 'neutral', reveal: 2 },
    // step 4: edit the message instead of piling on
    { who: 'claude', text: "Step four. When I'm wrong, edit your message. Don't pile on.", say: "Step four. When I'm wrong, edit your message. Don't pile on.", claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 4, title: 'Edit. Don\'t pile on.', note: 'fix the ask, not the thread', cap: "Project: Maya's Wedding", html: `
        <div class="msg me" data-r="0">no, cheaper</div>
        <div class="msg me" data-r="0">no. CHEAPER</div>
        <div class="row wrap" data-r="1"><span class="tag">✎ Edit message</span><span class="tag bad">11 × "no, cheaper"</span></div>
        <div class="msg me" data-r="2"><span data-type="2">Venues under $4,500. 140 guests. Near Mom.</span></div>
        <div class="msg ai list" data-r="3"><span>Orchard Hall: <mark>$4,200</mark></span><span>Fits 150. 20 min from Mom.</span></div>` } },
    { who: 'nia', text: "I usually just type 'no, cheaper.'", say: "I usually just type, no, cheaper.", nia: 'sheepish', claude: 'deadpan', pose: 'neck', shot: 'nia' },
    { who: 'claude', text: 'Eleven times. Each one buried the budget deeper.', claude: 'deadpan', cpose: 'point', nia: 'sheepish', reveal: 1, shot: 'claude' },
    { who: 'nia', text: 'Okay. Editing it.', nia: 'neutral', claude: 'neutral', reveal: 2, pose: 'gesture', shot: 'two' },
    { who: 'nia', text: 'Forty-two hundred! It fits!', nia: 'excited', claude: 'happy', reveal: 3, pose: 'cheer', gap: .3 },
    // twist
    { who: 'nia', text: 'Wait. My sister just texted.', nia: 'shocked', claude: 'neutral', pose: 'chin', shot: 'nia', gap: .3 },
    { who: 'nia', text: 'She eloped. Last night.', nia: 'shocked', claude: 'surprised', pose: 'head', shot: 'nia' },
    { who: 'claude', text: 'Finally. Under budget.', claude: 'deadpan', cpose: 'shrug', nia: 'sad', shot: 'claude', panel: null },
  ],
};
