// name: it-works-on-localhost
module.exports = {
  theme: 'midnight', seed: 31, moves: 4,
  outro: { line: 'Save this for your next failed deploy' },
  hook: { title: 'It works on *localhost*. Deploy failed *six* times.' },
  beats: [
    // hook: context, then the lean
    { who: 'nia', text: "It works on localhost. Six failed deploys. Demo's in two hours.", nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia',
      toast: { app: 'deploy log', icon: 'git', text: 'Build failed, attempt 6', tone: 'red' } },
    // hook: contrarian snapback
    { who: 'claude', text: "Another redeploy won't help. Localhost isn't the real test.", claude: 'deadpan', cpose: 'point', nia: 'sheepish', shot: 'claude' },
    // roast
    { who: 'claude', text: 'You sent six screenshots. One was lunch.', claude: 'deadpan', nia: 'sheepish', cpose: 'shrug', shot: 'claude' },
    { who: 'nia', pre: 'uh', text: 'The lunch one was an accident.', nia: 'annoyed', claude: 'squint', pose: 'shrug', shot: 'nia' },
    // step 1: paste the log as text
    { who: 'claude', pre: 'ahem', text: 'Step one. Paste the full build log as text.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 1, title: 'Paste the full log', note: 'text you can search', cap: 'Claude', html: `
        <div class="msg me" data-r="0">here is the full log, as text</div>
        <div class="code" data-r="1"><b>Error:</b> Command failed: npm run build (line 312)</div>
        <div class="msg ai" data-r="2">Line 312 is the real one.</div>` } },
    { who: 'nia', text: "It's four hundred lines. Half of it is dots.", nia: 'annoyed', claude: 'deadpan', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: "Good. The dots aren't the problem. Line 312 is.", claude: 'happy', nia: 'neutral', reveal: 2 },
    // step 2: Claude Code reads the logs
    { who: 'claude', text: 'Step two. Run Claude Code and point it at the log.', claude: 'neutral', nia: 'neutral', cpose: 'point',
      panel: { move: 2, title: 'Let Claude read it', note: 'Claude Code', cap: 'Terminal: nia-demo', html: `
        <div class="term">
          <div data-r="0"><span class="g">~/nia-demo</span> $ <span data-type="1">claude</span></div>
          <div data-r="1" class="dim">Reading build-log.txt and .env...</div>
          <div data-r="2" class="gap"><span class="y">Cause:</span> API_URL is set on your laptop, not the server.</div>
        </div>` } },
    { who: 'nia', text: "It's probably the env file. I never touch that.", nia: 'smug', claude: 'neutral', pose: 'point', reveal: 1 },
    { who: 'claude', text: 'Git says you edited it at one a.m. Twice.', claude: 'deadpan', cpose: 'shrug', nia: 'sheepish', reveal: 2, shot: 'claude' },
    // step 3: explain before changing anything
    { who: 'claude', text: 'Step three. Before any change, ask it to explain the cause.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 3, title: 'Explain before changing', note: 'Plan first', cap: 'Terminal: nia-demo', html: `
        <div class="msg me" data-r="0">Explain the cause. Change no files yet.</div>
        <div class="msg ai list" data-r="1"><span>Cause: API_URL missing on the server</span><span>Would edit: 1 file</span></div>
        <div class="row wrap" data-r="2"><span class="tag ok">No edits yet</span></div>` } },
    { who: 'nia', text: 'Just fix it. I have a demo.', nia: 'annoyed', claude: 'deadpan', reveal: 1, pose: 'gesture' },
    { who: 'claude', text: 'Two hours is exactly why I explain first.', say: 'Two hours is exactly why I explain first.', claude: 'smug', nia: 'sheepish', reveal: 2, shot: 'claude' },
    { who: 'claude', text: 'The server has no API_URL. Your laptop does.', say: 'The server has no A P I URL. Your laptop does.', claude: 'deadpan', cpose: 'point', nia: 'neutral', shot: 'claude' },
    // step 4: build it here before deploying
    { who: 'nia', pre: 'oh', text: 'Wait. Localhost never runs the real build?', nia: 'shocked', claude: 'neutral', pose: 'head', shot: 'nia' },
    { who: 'claude', text: 'Localhost runs the dev server. The deploy runs the build.', claude: 'deadpan', cpose: 'point', nia: 'neutral', shot: 'claude' },
    { who: 'claude', text: 'Step four. Run the build here. Fix it until it passes.', claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 4, title: 'Build it here first', note: 'before you deploy', cap: 'Terminal: nia-demo', html: `
        <div class="term">
          <div data-r="0"><span class="g">~/nia-demo</span> $ <span data-type="1">npm run build</span></div>
          <div data-r="1" class="g">✓ built. API_URL added on the host.</div>
          <div data-r="2" class="gap dim">Deploy once. Not six times.</div>
        </div>` } },
    { who: 'nia', text: 'I was about to deploy it again. Blind.', nia: 'sheepish', claude: 'squint', reveal: 1, pose: 'shrug' },
    { who: 'claude', text: 'Seven would have been your record. Nobody wants that.', claude: 'smug', nia: 'annoyed', reveal: 2, shot: 'two' },
    // twist ending
    { who: 'nia', text: "It's live! Two hours to spare. I'm adding a chart.", nia: 'excited', claude: 'deadpan', pose: 'cheer', shot: 'two', gap: .3 },
    { who: 'claude', text: 'Fine. When it breaks, paste the error. As text.', claude: 'smug', cpose: 'palm', nia: 'sheepish', shot: 'claude', panel: null },
  ],
};
