// name: b-ausweis-zug
// Dumonda demo episode 2 (German, ~30 s): Lena lives in Kanton Zug and her B permit expires in two
// months. Dumi shows the three facts in the real Dumonda UI and name-drops Apertus, the Swiss LLM
// Dumonda runs on. Every fact comes from Dumonda's own rule_permit_b + src_sem_permits (SEM, federal):
// renewal at the earliest 3 months and at the latest 14 days before expiry, competent authority is the
// cantonal migration office (for Lena: Kanton Zug), documents: current permit, passport/ID, the
// canton's renewal form. Nothing Zug-specific is claimed beyond cantonal competence — no office names,
// no fees. Expiry in ~2 months minus the 14-day limit leaves ~6 weeks on the deadline meter.
module.exports = {
  theme: 'cafe', cast: 'dumonda', seed: 7, moves: 3, music: 'positive-energy', musicAt: 5.0,
  voices: { claude: 'en-US-BrianMultilingualNeural', nia: 'de-DE-SeraphinaMultilingualNeural' },
  outro: { line: 'Schick das jemandem mit B-Ausweis 🪪', follow: 'Folg mir für mehr' },
  hook: { title: '*B-Ausweis läuft ab* — und keiner kennt die *Frist*' },
  beats: [
    { who: 'nia', text: 'Mein B-Ausweis läuft bald ab. Und jetzt?', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia',
      toast: { app: 'Dumonda', icon: 'chat', text: 'B-Ausweis: noch 2 Monate', tone: 'red', when: 'jetzt' } },
    { who: 'claude', sfx: 'scratch', text: 'Ruhig. Drei Fakten, alle offiziell.', claude: 'smug', cpose: 'palm', nia: 'shocked', shot: 'low' },

    { who: 'claude', text: 'Erstens: sag\'s Dumonda — Schweizer KI, dank Apertus.', claude: 'happy', cpose: 'point', nia: 'neutral', shot: 'claude',
      panel: { move: 1, title: 'Sag, was passiert ist', note: 'Schweizer KI: Apertus', cap: 'dumonda.ch', html: `
        <div class="dmd" data-r="0">
          <div class="dbar">Dumonda<span>Was ist los?</span></div>
          <div class="dmsg me"><span data-type="1.6">Mein B-Ausweis läuft im Januar ab</span></div>
          <div class="dmsg ai" data-a="up" data-d="2.0">Alles klar. Welcher Ausweis ist es?</div>
          <div class="row wrap"><span class="chip sel" data-a="pop" data-d="3.0">B</span><span class="chip" data-a="up" data-d="2.4">C</span><span class="chip" data-a="up" data-d="2.5">L</span></div>
          <span class="docs" data-a="up" data-d="2.6">⚡ Läuft auf Apertus — der Schweizer KI</span>
        </div>` } },

    { who: 'claude', text: 'Zweitens: spätestens vierzehn Tage vor Ablauf.', claude: 'happy', cpose: 'palm', nia: 'neutral', shot: 'side',
      panel: { move: 2, title: 'Deine Checkliste', note: 'mit echter Frist', cap: 'dumonda.ch', html: `
        <div class="dmd" data-r="0" style="gap:10px">
          <div class="dbar">Meine Checkliste<span>B-Ausweis verlängern</span></div>
          <div class="task" style="padding:12px 20px"><h5><i class="cb on" data-a="pop" data-d=".5">✓</i>Dumonda gefragt</h5></div>
          <div class="task" style="padding:12px 20px;gap:6px"><h5><i class="cb"></i>Verlängerung beantragen<span class="badge req">Pflicht</span></h5>
            <span class="due">⏱ <b>spätestens 14 Tage vor Ablauf</b> · frühestens 3 Monate vorher</span>
            <span class="docs" data-r="1">Zuständig: Migrationsamt deines Kantons</span>
            <span class="src">✓ Verifizierte Quelle</span></div>
          <div class="task" data-r="2" style="padding:12px 20px;gap:6px"><h5><i class="cb"></i>Unterlagen bereitlegen</h5>
            <span class="docs">Ausweis · Pass · Formular des Kantons</span></div>
        </div>` } },
    { who: 'nia', text: 'Und wohin damit?', nia: 'sheepish', claude: 'neutral', pose: 'chin', shot: 'nia' },
    { who: 'claude', text: 'Migrationsamt deines Kantons. Für dich: Zug.', claude: 'deadpan', cpose: 'point', nia: 'excited', reveal: 1, shot: 'dutch' },
    { who: 'claude', text: 'Mitbringen: Ausweis, Pass und das Formular.', claude: 'happy', cpose: 'palm', nia: 'shocked', reveal: 2, shot: 'high' },

    { who: 'claude', text: 'Drittens: alles belegt — direkt vom Bund.', claude: 'happy', cpose: 'point', nia: 'excited', shot: 'claude',
      panel: { move: 3, title: 'Alles belegt', note: 'Quelle: SEM', cap: 'dumonda.ch', html: `
        <div class="dmd" data-r="0">
          <div class="dbar">Verlängerung beantragen<span>Kanton Zug</span></div>
          <div class="task" style="padding:14px 20px;gap:6px"><h5>Deine Frist</h5><span class="due">⏱ <b>noch 6 Wochen</b></span>
            <div class="meter" style="margin-top:4px"><i data-a="grow" style="width:68%"></i></div></div>
          <div class="task" style="padding:14px 20px;gap:6px"><h5>Quelle</h5><span class="src">✓ Verifizierte Quelle · sem.admin.ch</span>
            <span class="docs">Staatssekretariat für Migration</span></div>
          <span class="btn hot" data-r="1" data-a="pop" style="background:#b02e23;align-self:flex-start;padding:10px 20px">Offiziellen Service öffnen →</span>
        </div>` } },
    { who: 'nia', text: 'Null Panik, nur Fakten.', nia: 'excited', claude: 'smug', pose: 'cheer', reveal: 1, shot: 'two' },
    { who: 'claude', sfx: 'drum', text: 'Grüezi. Ich bin Dumi.', say: 'Grüezi! Ich bin Dumi.', claude: 'smug', cpose: 'palm', nia: 'excited', shot: 'low' },
  ],
};
