import fs from "node:fs";
import path from "node:path";
import type { Hono } from "hono";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

const NO_BUILD_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RealDeal - Build Required</title>
  </head>
  <body style="font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; line-height: 1.5;">
    <h1>Build missing</h1>
    <p>Please run <code>npm run build</code> to compile the frontend application.</p>
  </body>
</html>`;

export function setupStatic(app: Hono): void {
  const DIST_DIR = path.resolve(process.cwd(), "dist");
  const INDEX_HTML = path.join(DIST_DIR, "index.html");

  app.get("*", async (c, next) => {
    // Skip /api routes
    if (c.req.path.startsWith("/api")) {
      return next();
    }

    if (!fs.existsSync(DIST_DIR)) {
      return c.html(NO_BUILD_HTML, 200);
    }

    // Try finding direct file in dist
    const reqPath = c.req.path;
    const sanitized = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
    const targetFile = path.join(DIST_DIR, sanitized);
    const insideDist = targetFile === DIST_DIR || targetFile.startsWith(DIST_DIR + path.sep);

    try {
      if (insideDist && fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
        const ext = path.extname(targetFile).toLowerCase();
        const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";

        if (reqPath.startsWith("/assets/")) {
          c.header("Cache-Control", "public, max-age=31536000, immutable");
        } else if (ext === ".html") {
          c.header("Cache-Control", "no-cache");
        }

        c.header("Content-Type", mimeType);
        return c.body(fs.readFileSync(targetFile));
      }
    } catch {
      // Fall through to index.html fallback
    }

    // A missing file (anything with an extension, and all of /assets) is a 404, not the app shell
    if (reqPath.startsWith("/assets/") || path.extname(reqPath) !== "") {
      return c.text("Not found", 404);
    }

    // SPA fallback to dist/index.html
    if (fs.existsSync(INDEX_HTML)) {
      c.header("Cache-Control", "no-cache");
      c.header("Content-Type", "text/html; charset=utf-8");
      return c.body(fs.readFileSync(INDEX_HTML));
    }

    return c.html(NO_BUILD_HTML, 200);
  });
}