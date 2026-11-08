module.exports = {
  theme: 'morning', seed: 11, moves: 3,
  outro: { line: 'Save this before your next "so basically"' },
  hook: {"title":"Explaining your app to Claude for the *47th* *time*"},
  beats: [
    // problem: every new chat starts from zero
    { who: 'nia', text: "Hey Claude! So basically, I'm building a budgeting app.", nia: 'excited', claude: 'neutral', pose: 'gesture', shot: 'two' },
    { who: 'claude', text: "In React, with Tailwind, due Friday. You've told me forty-seven times.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude', toast: {"app":"Chat history","icon":"chat","text":"Explained 47 times","tone":"red"} },
    { who: 'nia', text: 'Then why do I keep explaining it?', nia: 'annoyed', claude: 'deadpan', shot: 'nia', pose: 'point' },
    { who: 'claude', text: 'Because every time, you open a brand new chat.', claude: 'sideeye', nia: 'sheepish', shot: 'claude' },
    { who: 'nia', text: 'New chat, new me.', nia: 'smug', claude: 'sideeye', shot: 'nia', pose: 'shrug' },
    // tip 1: one project for the app
    { who: 'claude', text: 'Make a project instead. Every chat about this app goes in there.', claude: 'neutral', nia: 'neutral', shot: 'two', cpose: 'palm',
      panel: { move: 1, title: 'One app. One project.', note: 'Projects', cap: 'Claude', html: `
        <div class="row between" data-r="0"><h4>Projects</h4><span class="btn hot">+ New project</span></div>
        <div class="tile" data-r="1"><h5>Budget app</h5><p>Every chat about the app lives here</p></div>
        <div class="tile soft" data-r="2"><h5>Pinned</h5><p>Instructions and files, there in every chat</p></div>` } },
    { who: 'nia', text: 'So all my chats share the same notes?', nia: 'neutral', claude: 'neutral', reveal: 1, pose: 'chin' },
    { who: 'claude', text: 'Exactly. Like a group chat with the important stuff pinned.', claude: 'happy', nia: 'excited', reveal: 2 },
    // tip 2: write the repeated stuff once
    { who: 'claude', text: 'Next, write what you keep repeating into the project instructions.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'Say it once. Forever.', note: 'Project instructions', cap: 'Budget app: Instructions', html: `
        <div class="doc" data-r="0"><span data-type="2.4">React, Vite, Tailwind. Function components only. Code first, short answers.</span></div>
        <div class="row wrap" data-r="1"><span class="tag ok">React</span><span class="tag ok">Tailwind</span><span class="tag bad">no semicolons. ever.</span></div>
        <div class="stamp" data-r="2">Saved for every chat</div>` } },
    { who: 'nia', text: 'React, Tailwind, and no semicolons. Ever.', nia: 'excited', claude: 'neutral', reveal: 1, pose: 'gesture' },
    { who: 'claude', text: 'Noted. You have strong feelings about semicolons.', claude: 'deadpan', nia: 'smug', reveal: 2, shot: 'claude' },
    { who: 'nia', text: 'Very strong feelings.', nia: 'smug', claude: 'sideeye', shot: 'nia', pose: 'shrug' },
    // tip 3: give it the files
    { who: 'claude', text: 'Last, upload your files. Your schema, your style guide, and your readme.', say: 'Last, upload your files. Your schema, your style guide, and your read me.', claude: 'neutral', nia: 'neutral', shot: 'two', cpose: 'palm',
      panel: { move: 3, title: 'Give it your files', note: 'Project knowledge', cap: 'Budget app: Files', html: `
        <div class="file" data-r="0"><i>SQL</i>schema.sql</div>
        <div class="file" data-r="0"><i>MD</i>style_guide.md</div>
        <div class="file" data-r="0"><i>MD</i>README.md<em data-r="1">last read: never</em></div>
        <div class="msg ai" data-r="2">It says dark mode ships in March.</div>` } },
    { who: 'nia', text: 'Nobody reads the readme.', say: 'Nobody reads the read me.', nia: 'sheepish', claude: 'neutral', reveal: 1, pose: 'neck' },
    { who: 'claude', text: 'I just did. It says dark mode ships in March.', claude: 'smug', nia: 'shocked', reveal: 2 },
    { who: 'nia', text: 'So I never have to explain my app again?', nia: 'excited', claude: 'neutral', pose: 'cheer' },
    { who: 'claude', text: 'Your app, no. Your variable names, yes.', claude: 'sideeye', cpose: 'shrug', nia: 'annoyed', shot: 'claude', panel: null },
    { who: 'nia', text: 'data_final_2 is a great name.', say: 'Data final two is a great name.', nia: 'annoyed', claude: 'deadpan', pose: 'point', shot: 'nia' },
    { who: 'claude', text: "It really isn't.", claude: 'deadpan', nia: 'annoyed', shot: 'claude' },
  ],
};
