#!/usr/bin/env node
// Writes specs/bundles/<TASK>.md = task sheet + the context packs it needs, ready to paste into any chat agent.
// Run after build-context.mjs:  node scripts/build-context.mjs && node scripts/build-bundles.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const { tasks } = JSON.parse(readFileSync(join(root, "specs/manifest.json"), "utf8"));
mkdirSync(join(root, "specs/bundles"), { recursive: true });
for (const t of tasks) {
  const parts = [readFileSync(join(root, `specs/tasks/${t.id}.md`), "utf8").trim()];
  for (const c of t.context) parts.push(readFileSync(join(root, `specs/context/${c}.md`), "utf8").trim());
  const out = parts.join("\n\n---\n\n") + "\n";
  writeFileSync(join(root, `specs/bundles/${t.id}.md`), out);
  console.log(`${t.id.padEnd(8)} ~${Math.round(out.length / 4 / 1000)}k tokens`);
}
