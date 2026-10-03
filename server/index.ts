// PLACEHOLDER (SPEC-00). BE-07 replaces with the full API + static hosting.
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();
app.get("/api/health", (c) => c.json({ ok: true }));
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`RealDeal placeholder server on http://localhost:${port}`);
