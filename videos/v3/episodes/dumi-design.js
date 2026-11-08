// name: dumi-design
// Not a real episode: a pose sheet for Dumi, the Dumonda mascot (clay St. Bernard pup).
// Used only to render design stills from several camera angles before any scripts are written.
module.exports = {
  theme: 'morning', cast: 'dumonda', seed: 7, moves: 0,
  outro: { line: 'Say grüezi to Dumi 👋' },
  beats: [
    { who: 'claude', text: "Grüezi, I'm Dumi.", say: "Gruetzee, I'm Doomi.", claude: 'happy', cpose: 'palm', nia: 'excited', shot: 'claude' },
    { who: 'claude', text: 'Tell me what happened.', claude: 'neutral', cpose: 'point', nia: 'neutral', shot: 'low' },
    { who: 'nia', text: 'Okay, this is actually adorable.', nia: 'excited', claude: 'happy', pose: 'gesture', shot: 'two' },
    { who: 'claude', text: 'Welcome to Switzerland.', claude: 'smug', cpose: 'wave', nia: 'excited', shot: 'claude' },
  ],
};
