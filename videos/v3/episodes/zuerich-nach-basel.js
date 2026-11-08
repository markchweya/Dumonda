// name: zuerich-nach-basel
// Dumonda demo episode 1 (German, ~30 s): Lena moved from Zürich to Basel; Dumi turns the panic into
// three steps shown in the real Dumonda UI (chat with one follow-up chip, the checklist with deadlines
// and documents, the verified-source card). Every fact comes from Dumonda's own rules and sources:
// registration within 14 days (ID + rental contract; permit for foreign nationals), deregistration in
// the old commune, vehicle re-registration within 14 days. No invented deadlines, fees or laws.
// Ending pays off the hook: Dumi only introduces itself once the problem is solved.
module.exports = {
  theme: 'morning', cast: 'dumonda', seed: 41, moves: 3, music: 'happy-times', musicAt: 5.2,
  voices: { claude: 'en-US-BrianMultilingualNeural', nia: 'de-DE-SeraphinaMultilingualNeural' },
  outro: { line: 'Schick das jemandem, der grad umzieht 📦', follow: 'Folg mir für mehr' },
  hook: { title: '*Umgezogen* — und keiner sagt dir, *was jetzt gilt*' },
  beats: [
    { who: 'nia', text: 'Von Zürich nach Basel gezogen, und keiner sagt mir was.', nia: 'stressed', claude: 'neutral', pose: 'head', shot: 'nia',
      toast: { app: 'Dumonda', icon: 'chat', text: 'Umzug: Zürich → Basel', tone: 'red', when: 'jetzt' } },
    { who: 'claude', sfx: 'scratch', text: 'Vergiss die siebzehn Tabs. Drei Schritte.', claude: 'smug', cpose: 'palm', nia: 'shocked', shot: 'low' },

    { who: 'claude', text: 'Erstens, sag Dumonda einfach, was passiert ist.', claude: 'happy', cpose: 'point', nia: 'neutral', shot: 'claude',
      panel: { move: 1, title: 'Sag, was passiert ist', note: 'kein Amtsdeutsch', cap: 'dumonda.ch', html: `
        <div class="dmd" data-r="0">
          <div class="dbar">Dumonda<span>Was ist los?</span></div>
          <div class="dmsg me"><span data-type="1.7">Ich bin von Zürich nach Basel gezogen</span></div>
          <div class="dmsg ai" data-a="up" data-d="2.1">Alles klar. Kurze Frage: hast du ein Auto?</div>
          <div class="row wrap"><span class="chip sel" data-a="pop" data-d="3.1">Ja</span><span class="chip" data-a="up" data-d="2.5">Nein</span></div>
        </div>` } },

    { who: 'claude', text: 'Zweitens: in Basel anmelden, innert vierzehn Tagen.', claude: 'happy', cpose: 'palm', nia: 'neutral', shot: 'side',
      panel: { move: 2, title: 'Deine Checkliste', note: 'mit echten Fristen', cap: 'dumonda.ch', html: `
        <div class="dmd" data-r="0">
          <div class="dbar">Meine Checkliste<span>Umzug nach Basel</span></div>
          <div class="task"><h5><i class="cb on" data-a="pop" data-d=".5">✓</i>In Zürich abmelden</h5></div>
          <div class="task"><h5><i class="cb"></i>In Basel anmelden<span class="badge req">Pflicht</span></h5>
            <span class="due">⏱ <b>innert 14 Tagen</b></span>
            <span class="docs" data-r="1">Mitbringen: Ausweis · Mietvertrag</span>
            <span class="src">✓ Verifizierte Quelle</span></div>
          <div class="task" data-r="2"><h5><i class="cb"></i>Auto ummelden<span class="badge req">Pflicht</span></h5>
            <span class="due">⏱ <b>innert 14 Tagen</b> · neue Schilder</span></div>
        </div>` } },
    { who: 'nia', text: 'Und was nehm ich mit?', nia: 'sheepish', claude: 'neutral', pose: 'chin', shot: 'nia' },
    { who: 'claude', text: 'Ausweis und Mietvertrag, fertig.', claude: 'deadpan', cpose: 'point', nia: 'excited', reveal: 1, shot: 'dutch' },
    { who: 'claude', text: 'Das Auto: neue Schilder, gleiche Frist.', claude: 'happy', cpose: 'palm', nia: 'shocked', reveal: 2, shot: 'high' },

    { who: 'claude', text: 'Drittens: jede Frist mit offizieller Quelle.', claude: 'happy', cpose: 'point', nia: 'excited', shot: 'claude',
      panel: { move: 3, title: 'Alles belegt', note: 'offizielle Quellen', cap: 'dumonda.ch', html: `
        <div class="dmd" data-r="0">
          <div class="dbar">In Basel anmelden<span>Pflicht</span></div>
          <div class="task" style="padding:14px 20px;gap:6px"><h5>Deine Frist</h5><span class="due">⏱ <b>noch 11 Tage</b></span>
            <div class="meter" style="margin-top:4px"><i data-a="grow" style="width:76%"></i></div></div>
          <div class="task" style="padding:14px 20px;gap:6px"><h5>Quelle</h5><span class="src">✓ Verifizierte Quelle · ch.ch</span>
            <span class="docs">Kanton Basel-Stadt</span></div>
          <span class="btn hot" data-r="1" data-a="pop" style="background:#b02e23;align-self:flex-start;padding:10px 20px">Offiziellen Service öffnen →</span>
        </div>` } },
    { who: 'nia', text: 'Besser als siebzehn Tabs und Panik.', nia: 'excited', claude: 'smug', pose: 'cheer', reveal: 1, shot: 'two' },
    { who: 'claude', sfx: 'drum', text: 'Grüezi. Ich bin Dumi.', say: 'Grüezi! Ich bin Dumi.', claude: 'smug', cpose: 'palm', nia: 'excited', shot: 'low' },
  ],
};
