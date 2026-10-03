#!/usr/bin/env node
// Applies agent replies saved in incoming/<TASK-ID>*.md to the repo, enforcing each task's file ownership.
// Usage: node scripts/apply-incoming.mjs [--dry] [--task UI-01] [path/to/reply.md ...]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const onlyTask = args.includes("--task") ? args[args.indexOf("--task") + 1] : null;
const explicit = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--task");
const { tasks } = JSON.parse(readFileSync(join(root, "specs/manifest.json"), "utf8"));
const byId = new Map(tasks.map((t) => [t.id, t]));

const owns = (task, path) =>
  task.owns.some((o) => (o.endsWith("/**") ? path.startsWith(o.slice(0, -2)) : path === o));

/** Parse "### FILE: path" + fenced block (3+ backticks; closing fence must match the opening length). */
function parseReply(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const files = [];
  let notes = "";
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#{2,4}\s*FILE:\s*`?([^`\s]+)`?\s*$/i);
    if (m) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      const fence = lines[j]?.match(/^(`{3,})/);
      if (!fence) { files.push({ path: m[1], error: "no code fence after FILE header" }); continue; }
      const close = fence[1];
      const body = [];
      let k = j + 1;
      while (k < lines.length && lines[k].trimEnd() !== close) body.push(lines[k++]);
      if (k >= lines.length) { files.push({ path: m[1], error: "unterminated code fence" }); continue; }
      files.push({ path: m[1], content: body.join("\n").replace(/\s*$/, "\n") });
      i = k;
      continue;
    }
    if (/^#{2,4}\s*NOTES\b/i.test(lines[i])) notes = lines.slice(i + 1).join("\n").trim();
  }
  return { files, notes };
}

const dir = join(root, "incoming");
const inputs = explicit.length
  ? explicit
  : existsSync(dir) ? readdirSync(dir).filter((f) => /\.(md|txt)$/i.test(f)).map((f) => join(dir, f)) : [];
if (!inputs.length) {
  console.log("No replies found. Save each agent reply as incoming/<TASK-ID>.md (e.g. incoming/UI-01.md).");
  process.exit(0);
}

let problems = 0;
for (const file of inputs.sort()) {
  const id = file.split("/").pop().match(/^([A-Z]+-\d+)/)?.[1];
  if (!id || (onlyTask && id !== onlyTask)) continue;
  const task = byId.get(id);
  if (!task) { console.log(`✗ ${file}: unknown task id ${id}`); problems++; continue; }
  const { files, notes } = parseReply(readFileSync(file, "utf8"));
  console.log(`\n${id}: ${task.title}`);
  if (!files.length) { console.log("  ✗ no FILE blocks found"); problems++; }
  for (const f of files) {
    const path = normalize(f.path).replace(/^\.?\//, "");
    if (f.error) { console.log(`  ✗ ${path}: ${f.error}`); problems++; continue; }
    if (path.includes("..") || !owns(task, path)) { console.log(`  ✗ ${path}: not owned by ${id}, skipped`); problems++; continue; }
    if (!dry) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), f.content); }
    console.log(`  ${dry ? "would write" : "wrote"} ${path} (${f.content.split("\n").length} lines)`);
  }
  if (notes && !dry) {
    mkdirSync(join(dir, "notes"), { recursive: true });
    writeFileSync(join(dir, "notes", `${id}.md`), `# ${id} notes\n\n${notes}\n`);
    console.log(`  notes → incoming/notes/${id}.md`);
  }
}
console.log(problems ? `\n${problems} problem(s); see above.` : "\nAll replies applied cleanly.");
console.log("Next: npm run typecheck && npm run lint && npm run test && npm run build");
