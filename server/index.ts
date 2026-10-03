import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getStore, startDataWatcher } from "./data";
import { apiRoute } from "./routes/api";
import { setupStatic } from "./static";

// Load .env if present
try {
  process.loadEnvFile?.();
} catch {
  // .env may not exist or not support loadEnvFile; ignore
}

// Start watching data/prices.json
startDataWatcher();

const app = new Hono();

// Mount API routes
app.route("/api", apiRoute);

// Mount static hosting & SPA fallback
setupStatic(app);

const port = Number(process.env.PORT ?? 8787);
const server = serve({ fetch: app.fetch, port }, () => {
  const store = getStore();
  const sources = Array.from(new Set(store.points.map((p) => p.source))).join(", ");
  console.log(`RealDeal live server running at http://localhost:${port}`);
  console.log(`[Server] Active data source: [${sources}] (${store.points.length} points across ${store.items.length} items)`);
});

export { app, server };