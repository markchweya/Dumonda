// name: nine-hundred-reels
module.exports = {
  theme: 'morning', seed: 31, moves: 4,
  outro: { line: 'Save this for your next empty fridge' },
  hook: {"title":"900 saved recipes, *zero* cooked, *nine* days of food money"},
  beats: [
    // problem: 900 saved reels, zero cooked, food money almost gone
    { who: 'nia', text: 'I saved 900 cooking reels, cooked none, and my food money ends in nine days.', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia', toast: {"app":"Saved reels","icon":"book","text":"900 saved. 0 cooked.","tone":"red"} },
    { who: 'claude', text: "Sorting 900 reels won't cook you one meal.", claude: 'deadpan', cpose: 'point', nia: 'sheepish', shot: 'claude' },
    { who: 'nia', text: "They're good reels, though.", nia: 'sheepish', claude: 'deadpan', pose: 'shrug', shot: 'nia' },
    // roast: how many did she actually cook
    { who: 'claude', pre: 'hmm', text: 'How many have you actually cooked?', claude: 'squint', nia: 'neutral', shot: 'two' },
    { who: 'nia', text: 'Four.', nia: 'sheepish', claude: 'squint', pose: 'neck' },
    { who: 'claude', text: 'Four what? Eggs?', claude: 'deadpan', cpose: 'palm', nia: 'annoyed' },
    { who: 'nia', text: "Okay. Zero. Eggs don't count.", nia: 'sheepish', claude: 'neutral', pose: 'shrug', shot: 'nia' },
    // step 1: paste the 15 she remembers
    { who: 'claude', pre: 'ahem', text: 'Step one. Paste the 15 you remember. Not all 900.', claude: 'neutral', nia: 'neutral', cpose: 'palm', shot: 'claude',
      panel: { move: 1, title: 'Paste the 15 you remember', note: 'not all 900', cap: 'Claude', html: `
        <div class="msg me" data-r="0">Here are the reels I remember:</div>
        <div class="msg ai list" data-r="1"><span>Lemon garlic salmon</span><span>One pot dal</span><span>Egg fried rice</span></div>
        <div class="row wrap" data-r="2"><span class="tag ok">15 pasted</span><span class="tag bad">885 ignored</span></div>` } },
    { who: 'nia', text: "I don't remember fifteen. I remember the voiceover.", nia: 'sheepish', claude: 'neutral', pose: 'shrug', shot: 'nia' },
    { who: 'claude', text: 'Then paste whatever you remember. Even the wrong ones.', claude: 'deadpan', nia: 'neutral', reveal: 2, shot: 'claude' },
    // step 2: make it ask questions before any plan
    { who: 'claude', text: 'Step two. Make it ask questions before any plan.', claude: 'neutral', nia: 'neutral', cpose: 'palm', shot: 'claude',
      panel: { move: 2, title: 'Ask questions first', note: 'before any plan', cap: 'Claude', html: `
        <div class="msg me" data-r="0">Plan my cooking for the week.</div>
        <div class="msg ai" data-r="1">Quick questions first. How many people eat? What is left in the budget? What do you hate?</div>
        <div class="row wrap" data-r="2"><span class="tag">3 questions</span><span class="tag ok">Then the plan</span></div>` } },
    { who: 'nia', text: 'Wait. It asks me questions?', nia: 'shocked', claude: 'smug', pose: 'head', shot: 'nia', reveal: 1 },
    { who: 'claude', text: 'Three questions. Answer them honestly.', claude: 'deadpan', nia: 'sheepish', reveal: 2, shot: 'claude' },
    { who: 'nia', text: "I'll lie about the budget. A little.", nia: 'sheepish', claude: 'squint', pose: 'neck', shot: 'nia' },
    { who: 'claude', text: 'Then the plan is takeaway. Again.', claude: 'deadpan', cpose: 'shrug', nia: 'annoyed', shot: 'claude' },
    // step 3: the week as an artifact
    { who: 'claude', text: 'Step three. Ask for the week as an artifact.', claude: 'neutral', nia: 'neutral', cpose: 'point', shot: 'claude',
      panel: { move: 3, title: 'Weekly plan as an artifact', note: 'meals and grocery list', cap: 'Claude', html: `
        <div class="sheet" data-r="0"><h5>This week</h5><p>Mon: lentil stew, make 4 portions</p><p>Tue: egg fried rice, uses the eggs</p></div>
        <div class="file" data-r="1"><i>TXT</i>grocery-list</div>
        <div class="row between" data-r="2"><span class="tag ok">Under budget</span><span class="btn hot">Print</span></div>` } },
    { who: 'nia', pre: 'oh', text: "So it's a page, not a chat.", nia: 'excited', claude: 'neutral', pose: 'cheer', shot: 'nia', reveal: 1 },
    { who: 'claude', text: 'A page with a grocery list. Tick things off.', claude: 'deadpan', nia: 'neutral', reveal: 2, shot: 'claude' },
    { who: 'nia', text: 'Cheap meals? I have nine days.', nia: 'stressed', claude: 'neutral', pose: 'gesture', shot: 'nia' },
    { who: 'claude', text: 'Lentils, eggs, rice. You own rice.', claude: 'smug', cpose: 'shrug', nia: 'sheepish', shot: 'claude' },
    // step 4: keep it in a Project
    { who: 'claude', text: 'Step four. Put the plan in a Project.', claude: 'neutral', nia: 'neutral', cpose: 'palm', shot: 'claude',
      panel: { move: 4, title: 'Keep it in a Project', note: 'next week, one message', cap: 'Claude', html: `
        <div class="doc" data-r="0"><b>Project instructions</b> Plan weekly meals inside my food budget. Ask questions first.</div>
        <div class="file" data-r="1"><i>TXT</i>the-15-reels</div>
        <div class="row wrap" data-r="2"><span class="tag ok">Next week: one message</span></div>` } },
    { who: 'nia', text: "Can't I just keep the chat?", nia: 'pleading', claude: 'sideeye', pose: 'neck', shot: 'nia', reveal: 1 },
    { who: 'claude', text: 'Endless chats are how you got here.', claude: 'deadpan', cpose: 'point', nia: 'sheepish', reveal: 2, shot: 'claude' },
    // twist ending
    { who: 'nia', text: "Okay. I'm saving this video for later.", nia: 'smug', claude: 'deadpan', pose: 'point', shot: 'nia' },
    { who: 'claude', text: 'You said that about the 900.', claude: 'deadpan', cpose: 'shrug', nia: 'sad', shot: 'claude', panel: null },
  ],
};
