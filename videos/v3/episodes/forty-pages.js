module.exports = {
  theme: 'bedroom', seed: 44, moves: 3,
  outro: { line: 'Save this for the night before' },
  hook: {"title":"Exam at 8. Forty pages. *Zero* *read.*"},
  beats: [
    // problem: exam tomorrow, nothing read
    { who: 'nia', text: "Claude, my exam is at eight, and I haven't read the forty pages.", nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia' },
    { who: 'claude', text: 'You had six weeks.', claude: 'deadpan', cpose: 'point', nia: 'sad', shot: 'claude', toast: {"app":"Reading progress","icon":"book","text":"Pages read: 0","tone":"red"} },
    { who: 'nia', text: 'I opened the file once.', nia: 'sheepish', claude: 'squint', pose: 'neck', shot: 'nia' },
    { who: 'claude', text: 'Did you read it?', claude: 'squint', nia: 'sheepish', shot: 'claude' },
    { who: 'nia', text: 'I made eye contact with it.', nia: 'sheepish', claude: 'deadpan', shot: 'nia', gap: .15 },
    { who: 'nia', text: 'Can you just summarize it for me?', nia: 'pleading', claude: 'deadpan', shot: 'two', pose: 'gesture' },
    { who: 'claude', text: "Reading a summary feels like studying. It isn't.", claude: 'deadpan', cpose: 'shrug', nia: 'sad', shot: 'two' },
    // tip 1: find the ten ideas that matter
    { who: 'claude', text: 'Upload the file, and ask me for the ten ideas most likely to be on the exam.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 1, title: 'Find the ten that matter', note: 'with page numbers', cap: 'Claude', html: `
        <div class="msg me" data-r="0"><span class="tag">BIO201.pdf</span> The 10 ideas most likely to be on the exam, with page numbers.</div>
        <div class="msg ai list" data-r="1"><span>1. Active vs passive transport <u>p.4</u></span><span>2. ATP synthesis <u>p.12</u></span><span>3. Enzyme inhibition <u>p.19</u></span><span>4. Osmosis and tonicity <u>p.7</u></span></div>` } },
    { who: 'nia', text: 'Only ten?', nia: 'shocked', claude: 'neutral', reveal: 1, pose: 'chin' },
    { who: 'claude', text: 'You have one night. Ten is plenty.', claude: 'deadpan', nia: 'sheepish' },
    // tip 2: teach it back
    { who: 'claude', text: 'Now explain each idea back to me, in your own words.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'Teach it back', note: 'in your own words', cap: 'Claude', html: `
        <div class="msg me" data-r="0">the mitochondria is the vibe of the cell</div>
        <div class="msg ai" data-r="1">Close. What does it actually <mark>make</mark>?</div>
        <div data-r="2"><div class="row between"><h5>Ideas you can explain</h5><b>7 / 10</b></div><div class="meter"><i style="width:70%"></i></div></div>` } },
    { who: 'nia', text: 'Easy. The mitochondria is the vibe of the cell.', nia: 'smug', claude: 'neutral', pose: 'gesture' },
    { who: 'claude', text: 'Close. What does it actually make?', claude: 'deadpan', nia: 'sheepish', reveal: 1, shot: 'claude' },
    { who: 'nia', text: 'Energy! It makes ATP!', say: 'Energy! It makes A.T.P.!', nia: 'excited', claude: 'happy', reveal: 2, pose: 'cheer', shot: 'nia' },
    // tip 3: one page of mistakes
    { who: 'claude', text: "There you go. Last thing. I'll make you one page of just what you got wrong.", claude: 'happy', nia: 'neutral', shot: 'two', cpose: 'palm',
      panel: { move: 3, title: 'One page. Only your mistakes.', note: 'print it', cap: 'Claude', html: `
        <div class="sheet" data-r="0"><h5>The 3 you got wrong</h5>
          <p data-r="1"><b>Competitive inhibition:</b> binds the active site.</p>
          <p data-r="1"><b>Hypertonic:</b> water leaves the cell.</p>
          <p data-r="1"><b>ATP synthase:</b> runs on the proton gradient.</p></div>` } },
    { who: 'nia', text: 'Can I bring it into the exam?', nia: 'smug', claude: 'neutral', reveal: 1, pose: 'chin' },
    { who: 'claude', text: 'No. Read it in the line outside.', claude: 'deadpan', nia: 'sheepish' },
    { who: 'nia', text: 'Okay. One more page?', nia: 'pleading', claude: 'deadpan', pose: 'gesture', panel: null, shot: 'nia' },
    { who: 'claude', text: 'No. Sleep.', claude: 'deadpan', cpose: 'point', nia: 'sad', shot: 'claude', gap: .2 },
  ],
};
