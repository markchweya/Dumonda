# Sound sources

All files in `dl/` were downloaded on 2026-11-04 from Mixkit (`assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`), under the Mixkit Sound Effects Free License: free to use in videos, no credit required, not to be resold as sound files.

| File | Mixkit title | Used for |
| --- | --- | --- |
| 2226-throat-clear | Male clearing the throat | Claude's `pre: 'ahem'` (trimmed to `ahem-real.wav`) |
| 2354-toast-pop | Message pop alert | the beat-one notification toast |
| 166-card-swoosh | Fast small sweep transition | a note card sliding in |
| 2356-reveal-pop | Dry pop up notification alert | `reveal` on a card item |
| 2541-key-press | Single key press in a laptop | typed text in cards |
| 1386-typing | Keyboard typing | longer typing beds |
| 950-wrong-buzz | Game show wrong answer buzz | a `tag bad` reveal |
| 2865-success | Success software tone | a `tag ok` / fixed reveal |
| 704-record-scratch | Vinyl stop fast scratch | optional: Claude's snapback (`sfx: 'scratch'`) |
| 579-joke-drum | Drum joke accent | optional: the final punchline (`sfx: 'drum'`) |
| 3199-room-tone | Cinematic room tone loop | quiet room bed under every episode |
| 2678-city-night | Urban city ambience at night | the midnight theme bed |

`ahem.wav` is a synthesized stand-in from `v3/tools/ahem.py`; `ahem-real.wav` wins when present.
