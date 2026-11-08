// name: zero-signups
// Hand-written. The app-with-zero-users meme: built to be sent to a friend. One fix told as banter, ends on the mom callback.
// Lines are written the way people talk: one breath, joined with "and", "so", "but", not chopped into full stops.
module.exports = {
  theme: 'bedroom', seed: 53, moves: 2, music: 'kk', musicAt: 19.2,
  outro: { line: 'Send this to the friend whose app has 0 users' },
  hook: { title: '*3 weeks* building my app. *Zero* signups.' },
  beats: [
    // context and lean: three weeks of building, zero signups
    { who: 'nia', text: "I've been building this app for three weeks and I have zero signups.", nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia',
      toast: { app: 'Waitlist', icon: 'chat', text: 'New signups this week: 0', tone: 'red' } },
    // snapback: the fix isn't more building
    { who: 'claude', sfx: 'scratch', text: "And another feature won't fix that if nobody knows it exists.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'claude' },
    // roast
    { who: 'nia', text: "But it's a really good to-do app though.", nia: 'pleading', claude: 'deadpan', pose: 'gesture', shot: 'nia' },
    { who: 'claude', text: 'So are the other four million of them.', claude: 'sideeye', nia: 'sheepish', cpose: 'shrug', shot: 'claude' },
    { who: 'nia', text: 'Okay but my mom signed up, so that counts.', nia: 'smug', claude: 'deadpan', pose: 'point', shot: 'nia' },
    { who: 'claude', text: 'She signed up twice with two different emails.', claude: 'deadpan', nia: 'sheepish', cpose: 'palm', shot: 'two' },
    // fix one: one person, not everyone
    { who: 'claude', pre: 'ahem', text: "So who's it actually for? Give me one person, not everyone.", claude: 'neutral', nia: 'neutral', cpose: 'palm',
      panel: { move: 1, title: 'Pick one person', note: 'Before you build more', cap: 'Notes: my app', html: `
        <div class="sheet">
          <h5 data-r="0">It's for:</h5>
          <div class="row wrap" data-r="1"><span class="tag bad">everyone</span></div>
          <div class="row wrap gap" data-r="2"><span class="tag ok">nursing students, 9 deadlines a week</span></div>
        </div>` } },
    { who: 'nia', text: 'I mean everyone has a to-do list, right?', nia: 'neutral', claude: 'squint', pose: 'shrug', reveal: 1, shot: 'nia' },
    { who: 'claude', text: 'Everyone is no one, so who needs it the most?', claude: 'deadpan', nia: 'sheepish', cpose: 'point', shot: 'claude' },
    { who: 'nia', text: "Probably nursing students, they've got like nine deadlines a week.", nia: 'sheepish', claude: 'happy', pose: 'chin', reveal: 2, shot: 'nia' },
    // fix two: find where they already talk
    { who: 'claude', text: "Perfect, now let's search where they actually hang out.", claude: 'happy', nia: 'neutral', cpose: 'palm',
      panel: { move: 2, title: 'Go where they are', note: 'Web search', cap: 'Claude', html: `
        <div class="msg me" data-r="0">Where do nursing students vent about deadlines?</div>
        <div class="msg ai list" data-r="1"><span>r/StudentNurse</span><span>nursing school Discord servers</span><span>#nursingschool on TikTok</span></div>` } },
    { who: 'nia', text: 'So I just spam my link everywhere?', nia: 'excited', claude: 'deadpan', pose: 'point', reveal: 1, shot: 'nia' },
    { who: 'claude', text: 'No, you answer ten of their questions and put the link in your bio.', claude: 'deadpan', nia: 'neutral', cpose: 'point', shot: 'claude' },
    { who: 'nia', pre: 'oh', text: "Wait, that's not even coding.", nia: 'shocked', claude: 'neutral', pose: 'head', shot: 'nia' },
    { who: 'claude', text: "Exactly, and that's why you skipped it.", claude: 'smug', nia: 'annoyed', cpose: 'shrug', shot: 'two' },
    // twist: the mom callback
    { who: 'nia', text: 'Seven signups and none of them are my mom!', nia: 'excited', claude: 'deadpan', pose: 'cheer', shot: 'nia', panel: null },
    { who: 'claude', sfx: 'drum', text: "One of them is, it's her third email.", claude: 'deadpan', cpose: 'point', nia: 'shocked', shot: 'two', panel: null },
  ],
};
