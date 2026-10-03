# ART-01: Penny mascot (9 animated moods) + PennyFace

| | |
|---|---|
| Suggested agent | Claude (strongest at SVG) |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/ART-01.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **ART-01**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/components/penny/Penny.tsx`
- `src/components/penny/PennyFace.tsx`
- `src/components/penny/parts/**` (any files inside this folder)

## Goal
Penny, the copper-coin mascot: an animated SVG React component with 9 moods, plus a head-only version. She is the emotional core of the app. Make her charming and hand-drawn-looking, not clip-art. She must be original: **don't imitate Duolingo's owl or any existing character**, and don't reproduce the Royal Canadian Mint cent (no maple leaves, no monarch, no "1 cent" text).

## Contract
- `Penny(props: { mood: PennyMood; size?: number /* px width, default 120 */; className? })`
- `PennyFace(props: { mood?: PennyMood; size?: number /* default 32 */; className? })`
- `PennyMood` comes from `src/components/penny/types.ts` (don't redefine it).

## Construction (viewBox `0 0 200 220`)
- Body: circle r=78 at (100,108), copper `#E0793C`.
- Rim: ring 8px wide just inside the edge, copper-shade `#B5561F` at 55% opacity (a coin's raised rim).
- Shade: hard-edged crescent on the lower right of the body in copper-shade, clipped to the body, about 22% of the face.
- Shine: two hard-edged copper-light `#FFB37D` shapes on the upper left: a tilted rounded capsule and a small dot.
- Eyes: white ovals 26x32 at (76,98) and (124,98); ink `#241B35` pupils r=9 that can move; a tiny white catchlight in each pupil.
- Brows: ink rounded bars 22x6 above each eye; angle varies by mood.
- Mouth: ink path centred near (100,138); open mouths show a `#7A2E12` interior and a small `#FF8FA3` tongue.
- Cheeks: `#FF8FA3` ellipses 16x9 at 40% opacity under the eyes.
- Arms: short rounded capsules in copper-shade from the sides near (28,120) and (172,120), rotating per mood.
- Feet: two small rounded ink ovals peeking under the body near (82,192) and (118,192).
- No outlines anywhere, no gradients, max 3 tones per part, chunky proportions.

## Moods (motion/react; switching moods tweens shapes/positions over ~200ms)
| Mood | Face | Motion |
|---|---|---|
| idle | relaxed brows, small smile | bob y 0→-4→0 every 2.4s; blink every 3–5s (randomised) |
| wave | smile, brows up | right arm waves ±25° four times, then idles |
| thinking | eyes look up-right, asymmetric brows, small off-centre "o" | slow tilt ±4°; three dots pop above the head in sequence, looping |
| happy | big closed-eye smile (arcs), cheeks 60% | one bounce y -10 |
| celebrate | open grin, eyes as upward arcs | jump y -28 with squash (scaleY 0.9) on landing, arms up; 4 small 4-point stars (grape `#6A3BE4` and yellow `#FFC21A`) pop around her once |
| meh | half-lidded eyes, flat mouth, one brow slightly raised | small shrug: arms lift and drop once |
| suspicious | squint (eyes 40% height), one brow down hard, smirk | pupils slide left→right→left slowly; lean 6° |
| shocked | eyes 120% size, small pupils, brows high, open "O" | jitter x ±3 three times, arms out |
| sad | brows tilted up in the middle, small frown, pupils down | droop y +4, slow |

- Reduced motion (`useReducedMotion()`): static pose for the mood (blink allowed).
- Animation distances scale with `size`. `role="img"` with `aria-label` like "Penny looks suspicious".
- **PennyFace**: just the coin and face (no arms, feet, or stars), cropped to the circle, static, legible at 24–48px.
- Organise internals under `src/components/penny/parts/` if helpful (e.g. `Eyes.tsx`, `Mouth.tsx`, `moods.ts`).

## Acceptance
- [ ] All 9 moods are distinct at a glance at 48px and at 240px.
- [ ] Looks good on white and on grape-900 `#2B1466`.
- [ ] No outlines, gradients, or resemblance to Duolingo's owl or the real Canadian cent.
