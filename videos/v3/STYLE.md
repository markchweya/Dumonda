# House style for Nia & Claude scripts

Read by `v3/tools/write.js` on every run, so edit this file to change how new scripts come out.

## What the show is

Nia is a real person with a real problem. Claude is a dry, quick friend who roasts her a little, then actually fixes it with a workflow she can copy tonight. Viewers should think "that is literally me" in the first three seconds, and leave with steps they can use.

The reference videos in `reference/` set the bar for pace and stakes. Learn from them, never copy their topics, lines, jokes, numbers or steps.

## Who it's for

Mostly **vibe coders** (people building apps, sites and side projects by prompting, often not trained engineers) and **doom scrollers** (people losing hours to their phone, who know it, and half want out). Write for them first. Their world: shipping at 3 a.m., "it worked on localhost", 40 open tabs, broken deploys, leaked API keys, an app with zero users, a startup idea from a TikTok, screen time reports, saving 900 reels they never open, "five more minutes", productivity content as procrastination.

## Topics that land

- A real stake with a clock on it: a deadline, a bill, an exam, a landlord, a launch, an interview, a group project, a usage limit at 2 a.m.
- Something people who use Claude a lot actually do wrong: three-word prompts, one endless chat, pasting screenshots, starting from zero every time, accepting the first draft, asking for "make it better".
- The fix must be a real Claude feature or a real habit: Projects, project instructions and files, artifacts, voice mode, web search, Claude Code, plan mode, connectors, asking it to ask questions first, asking for a handoff summary, giving an example. Never invent features, prices or numbers about Anthropic.

## The triple hook (the first three seconds decide everything)

Viewers only stay for a topic they already care about, so the opening has three jobs, in this order, in the first two lines.

1. **Context, immediately.** The first words of line one say what the video is about: "I pushed my API keys to GitHub", "Every fix you make breaks my app", "7h 40m on my phone today". Never open with "Claude," or a greeting, and never save the topic for the back half of the sentence. Say it in the audio, write it in `hook.title`, and show it in the `toast` on beat one: all three at once.
2. **The lean.** The same sentence or the next one adds a reason to lean in: a number ("my bill's at $412"), a pain they feel ("forty users can't log in"), or something shocking. Read line one alone: is the topic clear, and do you want the next line?
3. **The contrarian snapback.** Line two is Claude yanking the viewer the other way, against what they expect the fix to be: "Deleting the repo won't save you.", "The code isn't the problem. You have no undo.", "Another tip won't help.", "Confidence won't fix that. A number with proof will." The rest of the video pays off that snapback.

## The beat sheet (60 to 75 seconds)

1. **Hook.** Line one (Nia: context + lean), line two (Claude: snapback).
2. **Roast.** Two or three quick lines that sting. Nia corrects a number to something worse ("Twenty-six.").
3. **Steps.** Claude says them out loud: "Step one. ..." Four or five steps. Each step gets a note card (`panel`) with a short title, and every step answers something Nia just did or said.
4. **Banter inside the steps.** After each step, Nia reacts with one short line (a doubt, a dumb shortcut, a confession) and Claude answers in a few words.
5. **Twist ending.** One or two lines that turn the joke around. No moral, no "and that's how you...".

## Lines

- **Flow like speech, not like reading.** Each line is one breath, with thoughts joined by "and", "so", "but", "like", "though", the way people actually talk: "I've been building this app for three weeks and I have zero signups." Never stack clipped fragments with full stops ("Three weeks. Zero signups. Not one."), because the voice pauses at every full stop and sounds like it's reading. One full stop per line at most, except for a deliberate punchline beat.
- Keep lines to 6 to 13 words, and nothing over 16 words.
- Concrete numbers beat adjectives: "63 questions", "eleven files", "two forty a.m.".
- Claude is deadpan, never mean, never preachy, never says "Great question". It can be smug when it wins.
- Nia is smart and messy, never dumb. She cuts corners, confesses things, and pushes back.
- Write the way people talk: contractions, "I mean", "okay but", "wait,", a question tag like "right?".
- If a word would be read wrong by a voice (acronyms, file names, code, times), put the spoken version in `say`.

## Human sounds

A beat can start with a small human sound before the words, with `pre`:

| `pre` | Sounds like | Use it when |
| --- | --- | --- |
| `ahem` | a real recorded throat clear (no word) | Claude is about to correct her, or starts the fix |
| `hmm` | thinking | Claude weighs something dumb she said |
| `uh` | hesitation | Nia is caught out |
| `oh` | realisation | someone just got it |

Use two or three per episode, mostly on Claude. They are not shown in captions. Never write the sound into `text` as well.

Two comedy accents can go on a beat with `sfx`, at most once each per episode:

- `scratch`: a record scratch just before the line. Put it on Claude's snapback (line two).
- `drum`: a joke drum hit after the line. Only use it on a final punchline that really lands.

Cards, reveals, the toast and the room sound are added automatically from `v3/sfx/`.

## What the numbers taught us

The first posted episode (the-3am-bug, 58 s) kept 62% of viewers past the hook but averaged only 21 s watched, and got zero shares. People left when it turned into a tutorial. So:

- Aim for **35 to 50 seconds**.
- Use **one fix, told as banter**, never "Step one, Step two" for the whole middle.
- Put a **joke every 5 to 8 seconds**.
- **End where you began.** The last line points back to the first, so it loops.
- `outro.line` asks for a **send**, not a save: "Send this to the friend who…".

## Hook and outro

- `hook.title`: 6 to 10 words on screen from frame one. It states the same context as line one, with the lean (a number or the pain), in the viewer's words. Wrap one to three key words in asterisks to make them gold. It never gives away the snapback.
- `outro.line`: a short call to action, such as "Save this for your next deadline" or "Comment PLAN for the prompts".
- One `toast` on beat one: a fake notification that proves the context visually, such as "$412 used since 1:04 a.m." or "Daily average: 7h 40m" (`icon`: git, chat, pen or book; `tone`: red).

## Note cards

Each step's first beat carries `panel: { move, title, note, cap, html }`. `title` is 2 to 5 words. The html is a small mock app screen built only from these classes:

- `msg me` and `msg ai` chat bubbles, `msg ai list` with `<span>` rows
- `tag`, `tag ok`, `tag bad` pills, inside `row wrap` or `row between`
- `code` for an error, `term` for a terminal (inner spans `g`, `o`, `y`, `r`, `dim`; `gap` adds space)
- `doc` for a document, `quote`, `sheet` with `<h5>` and `<p>`, `tile` and `tile soft` with `<h5>` and `<p>`
- `file` rows with `<i>EXT</i>name`, `stamp`, `meter` with `<i style="width:70%">`, `btn hot`
- `<mark>` for a highlight, `<u>` for a page number or reference

Each item gets `data-r="0"`, `"1"`, `"2"` ... and later beats show it with `reveal: n`. A `<span data-type="2">` types its text out over 2 seconds. Keep each card to three or four items.
