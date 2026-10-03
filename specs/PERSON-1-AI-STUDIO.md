# Person 1 in Google AI Studio: DATA-01 to DATA-04

Run four separate chats, one per task. Do not combine them: `apply-incoming.mjs` assigns file ownership from the filename (`incoming/DATA-01.md` may only write DATA-01's files), so one reply covering several tasks would be rejected.

## Settings (every chat)

- Model: the strongest Gemini Pro available.
- Temperature: 0.3 (these are precise numbers, not creative writing).
- Thinking: on / high.
- Grounding with Google Search: **on for DATA-01** (it needs real store addresses). Off for the others.
- Output length: set to the maximum.

## Step 1: system instructions (paste once per chat)

```
You are a senior TypeScript engineer on the RealDeal project. You cannot see the repo; the pasted task bundle is your complete context.

Rules:
- Return ONLY the files listed under "Files you return", each COMPLETE, in the exact "### FILE: path" + fenced-code format from the bundle. No "...", no "rest unchanged", no diffs, no prose between files.
- After the files, add one "## NOTES" section: assumptions, anything unfinished, anything the integrator must wire up.
- Do not rename or change any exported name, signature, or type from the bundle. Contracts are frozen.
- Do not invent facts. Where the task says to use placeholders when you cannot verify something, do that and say so in NOTES.
- Numbers must be exact. Before replying, re-check every acceptance item and every worked example in the task against your code, by hand.
```

## Step 2: paste the bundle as the user message

| Chat | Paste this whole file | Save the reply as |
|---|---|---|
| 1 | `specs/bundles/DATA-01.md` | `incoming/DATA-01.md` |
| 2 | `specs/bundles/DATA-03.md` | `incoming/DATA-03.md` |
| 3 | `specs/bundles/DATA-02.md` | `incoming/DATA-02.md` |
| 4 | `specs/bundles/DATA-04.md` | `incoming/DATA-04.md` |

Add this line under the pasted bundle in chat 1 only:

```
Use Google Search to find the real branch addresses and coordinates from each chain's store locator. If you cannot verify a branch, use the labelled placeholder format from the task and list those in NOTES.
```

Add this line under the pasted bundle in chat 3 (DATA-02) only:

```
Before replying, work through the six hero stories numerically (average, percent versus average, tier) and adjust your overrides until each one lands on the required tier. Show the arithmetic briefly in NOTES.
```

## Step 3: save and hand back

- Save each reply exactly as returned (do not edit it) as `incoming/DATA-0X.md`.
- Commit and push the four files, then tell Claude to review. Integration order is DATA-01, DATA-03, DATA-02, DATA-04, then `npm run test` (the six story tests in `shared/stories.test.ts` must pass).

## Not for AI Studio

BE-02 to BE-05 (store scrapers) and BE-11 (sound effects) need a terminal plus live web access or an API key. Leave those for Claude Code.
