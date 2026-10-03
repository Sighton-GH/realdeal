# SCR-07: Reveal sequence (the hero moment)

| | |
|---|---|
| Suggested agent | Claude |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-07.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-07**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/reveal/RevealPage.tsx`
- `src/pages/reveal/stage/**` (any files inside this folder)
- `src/pages/reveal/useRevealSequence.ts`
- `src/pages/reveal/effects.ts`

## Goal
The verdict reveal sequence at `/reveal/:checkId`: Kahoot-level drama in about 3 seconds, then hand off to the result panel. This is the one place the app spends boldness.

## Contract
- `src/pages/reveal/RevealPage.tsx`: `export function RevealPage()`. Internals go in `src/pages/reveal/stage/` (e.g. `Stage.tsx`, `Countdown.tsx`), `src/pages/reveal/useRevealSequence.ts`, and `src/pages/reveal/effects.ts`. Never `RevealResult.tsx`.
- Imports `RevealResult` from `./RevealResult` (SCR-08): `RevealResult({ verdict: Verdict; onReplay: () => void })`, the content of the white result panel. You provide the panel container (slide-up, rounded top, internal scroll).
- Wrap the page in `AppColumn` (it renders outside AppShell: no top bar or nav).

## Data
`useAppStore((s) => s.getCheck(checkId))`. Missing → inside the column: `<EmptyState mood="sad" title="This check has expired" body="Run it again from the Check screen." action={<LinkButton to="/check">Back to Check</LinkButton>} />`.

A close IconButton (`X`) top-left at all times → `/check` (white on the stage, ink on white).

## Sequence (`phase`: "suspense" → "countdown" → "slam" → "result")
Tapping anywhere during suspense or countdown jumps to slam. RevealResult's `onReplay` restarts from suspense (cancel timers, clear confetti, no duplicates).

1. **Suspense (0–1.2s)**: column `bg-grape-900`. `<Penny mood="thinking" size={160} />` centred; white Fredoka 600 h2 "Checking {item.name}…"; two counters stacked in white/70 small Nunito 800 ticking up fast: "Stores checked" 1→4 and "Prices compared" 0→`dataPoints`. `play("drumroll")`.
2. **Countdown (1.2–2.4s)**: "3", "2", "1" in white Fredoka 700 ~120px, each popping in (scale 0.5→1.1→1) for 400ms over a pulsing `bg-grape-500` circle. Penny shrinks to 96px and moves above.
3. **Slam (2.4s)**: a circular wipe in the tier face colour (`tierMeta[tier].bgClass`) expands from the centre over the whole column (clip-path circle 0%→150%, 450ms ease-out). The verdict word (`tierMeta[tier].label`, `text-verdict` / 4.5rem at md, `textOnFaceClass`) slams in with `spring.slam` from scale 2.2 and −6° rotation. Penny switches to `tierMeta[tier].mood` at 180px. Under the word: `formatPct(pctVsAvg)` in Nunito 800 h3. Effects by tier:
   - steal: `canvas-confetti`, two bursts from the bottom corners in steal/grape/yellow colours, `play("chaching")`.
   - good: one small burst, `play("pop")`.
   - normal: `play("pop")`.
   - high: shake the column x [0, −10, 10, −6, 6, 0] over 400ms, `play("buzzer")`.
   - If tricks exist, Penny turns `suspicious` 700ms after her tier reaction.
   - `play("slam")` at the moment the word lands.
4. **Result (3.2s+)**: the coloured stage shrinks to the top ~40% (word scales to ~70%, Penny 120px, subline stays). The white panel slides up from the bottom (`spring.sheet`), `rounded-t-lg bg-canvas`, fills the remaining height, scrolls internally, and renders `<RevealResult verdict onReplay />`.

Confetti: create a canvas confined to the column (`confetti.create(canvas, { resize: true })`) so on desktop it doesn't spill over the page.

**Reduced motion**: skip suspense and countdown; fade (150ms) straight into the result layout with the coloured stage; no confetti (render 6 static 4-point stars in white/40 around the word), no shake.

## Acceptance
- [ ] Each tier looks and sounds distinct; tap-to-skip and replay work cleanly.
- [ ] Text on steal/good/high faces is white and large; normal uses ink.
- [ ] Reduced-motion path verified; expired state works.
