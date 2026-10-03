// STUB (SPEC-00). BE-10 replaces; keep `export const speakRoute: Hono`. Mounted at /api/speak by BE-07.
import { Hono } from "hono";

export const speakRoute = new Hono();
speakRoute.post("/", (c) => c.json({ error: "Voice isn't set up on this server." }, 501));
