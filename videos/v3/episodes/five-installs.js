// name: five-installs
// Teaching short (~28 s): five real npm packages that make a site feel animated. Each tool gets its own mini
// website card that shows the motion it gives you (frame-driven keyframes, data-a), with the package's real site
// in the address bar. Camera varies angle on every beat. Button joke teaches restraint.
// Packages: gsap, motion, lenis, @formkit/auto-animate, lottie-react.
const tool = (n, pkg) => `<div class="row between" data-r="0"><span class="tag ok">npm i ${pkg}</span><span class="tag">${n} / 5</span></div>`;
module.exports = {
  theme: 'morning', seed: 88, moves: 6, music: 'kk', musicAt: 19.2,
  outro: { line: 'Which one are you installing first? 👇' },
  hook: { title: '*5 installs* that make your site feel *alive*' },
  beats: [
    { who: 'nia', text: 'My website looks like a PDF from two thousand nine.', say: 'My website looks like a P D F from two thousand nine.', nia: 'sad', claude: 'neutral', pose: 'head', shot: 'nia',
      toast: { app: 'Client', icon: 'chat', text: '"Can it feel more alive?"', tone: 'red' } },
    { who: 'claude', sfx: 'scratch', text: 'Five installs fix that.', claude: 'smug', cpose: 'palm', nia: 'shocked', shot: 'low' },

    { who: 'claude', text: 'GSAP, for scroll animations and timelines.', say: 'G sap, for scroll animations and timelines.', claude: 'happy', cpose: 'point', nia: 'excited', shot: 'claude',
      panel: { move: 1, title: 'GSAP', note: 'timelines', cap: 'gsap.com', html: `${tool(1, 'gsap')}
        <div class="site" data-r="0"><div class="nav"><b></b>studio<span>work · about</span></div>
          <div class="hero"><span data-a="up" data-d=".1">Make</span><span data-a="up" data-d=".25">it</span><em><span data-a="up" data-d=".4">move.</span></em></div>
          <div class="bar" data-a="grow" data-d=".5"></div>
          <div class="cards"><div class="card" data-a="up" data-d=".9"></div><div class="card b" data-a="up" data-d="1.0"></div><div class="card c" data-a="up" data-d="1.1"></div></div></div>` } },

    { who: 'claude', text: 'Motion, so your React components glide in.', claude: 'happy', cpose: 'palm', nia: 'excited', shot: 'side',
      panel: { move: 2, title: 'Motion', note: 'for React', cap: 'motion.dev', html: `${tool(2, 'motion')}
        <div class="site light" data-r="0"><div class="nav"><b></b>shop<span>cart (2)</span></div>
          <div class="hero" data-a="up" data-d=".05">Glide in.</div>
          <div class="cards"><div class="card" data-a="left" data-d=".2"></div><div class="card b" data-a="pop" data-d=".4"></div><div class="card c" data-a="right" data-d=".6"></div></div></div>` } },

    { who: 'nia', text: 'Okay, but my scrolling still feels stiff.', nia: 'annoyed', claude: 'neutral', pose: 'gesture', shot: 'over' },

    { who: 'claude', text: 'Lenis, buttery smooth scrolling.', say: 'Lennis, buttery smooth scrolling.', claude: 'smug', cpose: 'point', nia: 'excited', shot: 'dutch',
      panel: { move: 3, title: 'Lenis', note: 'smooth scroll', cap: 'lenis.dev', html: `${tool(3, 'lenis')}
        <div class="site" data-r="0"><div class="page" data-a="scroll" data-d=".1" data-px="560">
          <div class="block hot">Hello</div><div class="block">Our work</div><div class="block">Process</div><div class="block hot">Pricing</div><div class="block">Contact</div><div class="block">Footer</div></div></div>` } },

    { who: 'claude', text: 'Auto Animate, one line and your lists animate themselves.', claude: 'happy', cpose: 'palm', nia: 'shocked', shot: 'high',
      panel: { move: 4, title: 'Auto Animate', note: 'one line', cap: 'auto-animate.formkit.com', html: `${tool(4, '@formkit/auto-animate')}
        <div class="code" data-r="0">const [list] = <b>useAutoAnimate</b>()</div>
        <div class="page" data-r="0" style="gap:14px">
          <div class="li" data-a="move" data-d="1.2" data-px="86"><b></b>Fix navbar</div>
          <div class="li" data-a="move" data-d="1.2" data-px="86"><b></b>Add pricing</div>
          <div class="li" data-a="move" data-d="1.2" data-px="86"><b></b>Write copy</div>
          <div class="li" data-a="move" data-d="1.2" data-px="-258" style="border-color:#d9744f"><b></b>Ship it 🚀</div></div>` } },

    { who: 'claude', text: 'And Lottie, for animated icons.', claude: 'happy', cpose: 'point', nia: 'excited', shot: 'low',
      panel: { move: 5, title: 'Lottie', note: 'icons that move', cap: 'lottiefiles.com', html: `${tool(5, 'lottie-react')}
        <div class="site light" data-r="0"><div class="ics">
          <svg viewBox="0 0 100 100" data-a="beat" data-d=".1"><path d="M50 82 C20 60 12 44 22 30 C32 17 46 22 50 33 C54 22 68 17 78 30 C88 44 80 60 50 82Z" fill="#e0436b"/></svg>
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke="#2fd4a3" stroke-width="9"/><path d="M31 52 L45 65 L70 37" fill="none" stroke="#118a72" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" pathLength="120" data-a="draw" data-d=".3"/></svg>
          <svg viewBox="0 0 100 100" data-a="spin" data-d="0"><circle cx="50" cy="50" r="36" fill="none" stroke="#e5ddd0" stroke-width="10"/><path d="M50 14 A36 36 0 0 1 86 50" fill="none" stroke="#6c7bff" stroke-width="10" stroke-linecap="round"/></svg>
        </div></div>` } },

    { who: 'nia', text: 'So I put all five on every page?', nia: 'excited', claude: 'neutral', pose: 'cheer', shot: 'nia',
      panel: { move: 6, title: 'The rule', note: 'read twice', cap: 'Claude', html: `
        <div class="msg me" data-r="0">all 5 on every page?</div>
        <div class="msg ai" data-r="1"><span data-a="sea" style="display:inline-block">Only if you want your users seasick 🤢</span></div>
        <div class="row wrap" data-r="1"><span class="tag ok">1 or 2 per page</span></div>` } },
    { who: 'claude', sfx: 'drum', text: 'Only if you want your users seasick.', claude: 'deadpan', cpose: 'shrug', nia: 'shocked', reveal: 1, shot: 'two' },
  ],
};
