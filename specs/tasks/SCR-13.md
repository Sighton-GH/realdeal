# SCR-13: Camera hook + frame capture

| | |
|---|---|
| Suggested agent | Claude / GLM |
| Paste with | `specs/context/CORE.md`, `specs/context/FRONTEND.md` (or use the ready-made bundle `specs/bundles/SCR-13.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **SCR-13**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, FRONTEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `src/pages/scan/useCamera.ts`
- `src/pages/scan/captureFrame.ts`
- `src/pages/scan/captureFrame.test.ts`

## Goal
The camera engine for in-store scanning: a React hook that runs the phone's rear camera, and pure helpers that capture and crop a frame. No UI (SCR-14 builds the screen).

## Contract
- `src/pages/scan/useCamera.ts`: `export type CameraState = "idle" | "starting" | "live" | "denied" | "unavailable" | "insecure"`; `export interface UseCamera { videoRef; state; start(); stop(); torchSupported; torchOn; toggleTorch(); canSwitch; switchCamera() }`; `export function useCamera(): UseCamera`. (Exact shape in CONTEXT; keep it.)
- `src/pages/scan/captureFrame.ts`: `export interface Rect`; `mapRectToVideo(rect, elementSize, videoSize): Rect`; `captureFrame(video, guide): Promise<Blob>`; `prepareImageFile(file): Promise<Blob>`.
- Also return `src/pages/scan/captureFrame.test.ts` (vitest, node environment: test only `mapRectToVideo`).

## useCamera
- `start()`: if `!window.isSecureContext` → `insecure`; if no `navigator.mediaDevices?.getUserMedia` → `unavailable`. Else `starting`, then `getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })`. Attach to `videoRef.current` (`srcObject`, `playsInline`, `muted`, `play()`), state `live`. `NotAllowedError` → `denied`; `NotFoundError`/`OverconstrainedError` → `unavailable`.
- `stop()`: stop all tracks, clear `srcObject`, state `idle`.
- Stop on unmount and when `document.visibilityState` becomes hidden; restart when visible again if it was live.
- Torch: after start, `track.getCapabilities?.().torch` → `torchSupported`; `toggleTorch` uses `applyConstraints({ advanced: [{ torch: !torchOn }] })` (cast through a local type; no `any`).
- `canSwitch`: more than one `videoinput` from `enumerateDevices()` (after permission). `switchCamera` cycles `deviceId` with `exact`.
- Handles React 19 StrictMode double-mount without leaking streams.

## captureFrame helpers
- `mapRectToVideo`: the video element uses `object-fit: cover`; convert a rect in element CSS pixels to source video pixels (scale = max(elW/vW, elH/vH); account for the cropped offset on the overflowing axis); clamp to the video bounds.
- `captureFrame`: draw the mapped region from the `<video>` to a canvas, downscale so the long edge ≤ 1600px, `canvas.toBlob(..., "image/jpeg", 0.85)`.
- `prepareImageFile`: load the file into an `ImageBitmap` (respect EXIF orientation via `createImageBitmap(file, { imageOrientation: "from-image" })`), downscale to long edge ≤ 1600, JPEG 0.85.

## Tests
`mapRectToVideo` for: a 4:3 video in a 9:16 element (horizontal crop), a 16:9 video in a 9:16 element, an exact-fit case, and clamping at edges.

## Acceptance
- [ ] Works on iOS Safari and Android Chrome over HTTPS; never leaks a stream.
