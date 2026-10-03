#!/usr/bin/env node
// Generates specs/context/{CORE,FRONTEND,BACKEND}.md from the live code so chat agents always see current contracts.
// Run: node scripts/build-context.mjs   (re-run after any contract change)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), "utf8");
const lang = (p) => (p.endsWith(".tsx") ? "tsx" : p.endsWith(".css") ? "css" : p.endsWith(".json") ? "json" : "ts");
const full = (p) => `#### \`${p}\`\n\`\`\`${lang(p)}\n${read(p).trimEnd()}\n\`\`\`\n`;
const list = (dir, exts = [".ts", ".tsx"]) =>
  readdirSync(join(root, dir)).filter((f) => exts.some((e) => f.endsWith(e)) && !f.endsWith(".test.ts")).sort().map((f) => `${dir}/${f}`);

/** Keep exported declarations only; replace function bodies with `;`. */
function signatures(p) {
  const lines = read(p).split("\n");
  const out = [];
  let i = 0;
  const pushComments = (idx) => {
    const buf = [];
    let j = idx - 1;
    while (j >= 0 && /^\s*(\/\/|\/\*\*|\*)/.test(lines[j])) buf.unshift(lines[j--]);
    out.push(...buf);
  };
  if (/^\/\//.test(lines[0] ?? "")) out.push(lines[0]);
  while (i < lines.length) {
    const l = lines[i];
    if (/^export (\*|\{|type \{|type \*)/.test(l)) {
      out.push(l);
      i++;
      continue;
    }
    if (/^export (interface|class|enum)\b/.test(l) || (/^export type\b/.test(l) && /\{\s*$/.test(l))) {
      pushComments(i);
      while (i < lines.length) {
        out.push(lines[i]);
        if (/^\}/.test(lines[i]) || (i > 0 && /^export (interface|type)/.test(lines[i]) && /\}\s*;?\s*$/.test(lines[i]) && !/\{\s*$/.test(lines[i]))) break;
        i++;
      }
      i++;
      continue;
    }
    if (/^export type\b/.test(l)) {
      pushComments(i);
      while (i < lines.length) {
        out.push(lines[i]);
        if (/;\s*$/.test(lines[i])) break;
        i++;
      }
      i++;
      continue;
    }
    if (/^export (async )?function\b/.test(l)) {
      pushComments(i);
      let sig = "";
      while (i < lines.length) {
        sig += (sig ? "\n" : "") + lines[i];
        if (/\{\s*$/.test(lines[i])) break;
        i++;
      }
      out.push(sig.replace(/\s*\{\s*$/, ";"));
      i++;
      continue;
    }
    if (/^export const\b/.test(l)) {
      pushComments(i);
      out.push(l.replace(/\s*=\s*(.*)$/, (m, rest) => (rest.length < 70 && /;\s*$/.test(rest) ? m : " = …;")));
      i++;
      continue;
    }
    i++;
  }
  return `#### \`${p}\` (exports only)\n\`\`\`${lang(p)}\n${out.join("\n").trim()}\n\`\`\`\n`;
}

const pkg = JSON.parse(read("package.json"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const v = (n) => (deps[n] ?? "?").replace(/^\^/, "");

const RETURN_RULES = `## How to return your work (all tasks)

You are one of many AI agents each building one small piece of RealDeal in parallel. You cannot see the repo or the other agents' work. These context packs plus your task sheet are everything you need.

1. Return **only** the files listed in your task under "Files you return". Return each file **complete** (never "...", "rest unchanged", or diffs), in exactly this format:

   ### FILE: path/from/repo/root.tsx
   \`\`\`tsx
   // full file contents
   \`\`\`

   If a file itself contains triple backticks (for example a Markdown notes file), wrap it in **four** backticks instead.

2. Import only from files shown in these context packs, packages listed under Stack, or files you are returning. Do not invent shared helpers, components, tokens, or dependencies. If you truly need something that doesn't exist, build it privately inside one of your own files and mention it in NOTES.
3. Keep every export name, prop, and signature listed in your task's "Contract" exactly. Other agents are coding against them right now.
4. TypeScript strict: no \`any\`, no \`@ts-ignore\`, no unused variables, no leftover \`console.log\`.
5. End your reply with:

   ### NOTES
   - assumptions you made
   - anything you couldn't finish or verify
   - anything the integrator must wire up or check

An integrator (Claude Code) will drop your files into the repo, run typecheck/lint/tests/build, and fix any seams. Make their job easy: follow the contracts, keep files self-contained, and be honest in NOTES.
`;

const CORE = `# CONTEXT: CORE (paste with every task)

${RETURN_RULES}
## The product

RealDeal is a mobile-first web app that tells shoppers whether the grocery price in front of them is actually a good price. You enter or scan a price (phone camera at a shelf tag), and Penny, a copper-coin mascot, reveals a verdict game-show style. It also flags pricing tricks, shows a price history chart, and compares prices at nearby store branches.

| Verdict | Unit price vs the 90-day average across all 4 stores |
|---|---|
| Steal | 25% or more below |
| Good deal | 10% to 25% below |
| Normal price | within ±10% |
| Overpriced | more than 10% above |

| Trick | Flagged when |
|---|---|
| Forever sale | on sale in 6+ of the last 12 weeks at that store |
| Inflated "was" price | the struck-out price was charged in fewer than 25% of the last 26 weeks |
| Multi-buy trap | "2 for $X" saves less than 5% per unit vs that store's usual single price |
| Shrinkflation | the package shrank 5%+ while the unit price rose 3%+ |

Scope: 40 staple groceries, 4 BC chains (Save-On-Foods, No Frills, Walmart, T&T), 26 weeks of weekly prices, 12 nearby branches. Data layers: deterministic seed data (always present) < Project Hammer historical import < live scraping. Mock mode runs the engine in the browser; live mode runs the same engine on a Hono server.

Six guaranteed test stories (the seed data and engine must produce these):

| Item | Store | Tag | Verdict | Tricks |
|---|---|---|---|---|
| Salted butter 454 g | Save-On-Foods | $5.99, was $8.49 | Normal price | Forever sale, Inflated "was" price |
| All-purpose flour 10 kg | No Frills | $12.99 | Steal | none |
| Plain Greek yogurt (now 500 g) | Walmart | $5.97 | Overpriced | Shrinkflation |
| Spaghetti 900 g | T&T | 2 for $5.00 | Normal price | Multi-buy trap |
| Strawberries 454 g | Save-On-Foods | $6.99 | Overpriced | none |
| Large eggs, dozen | Walmart | $3.97 | Good deal | none |

## Stack (already installed; do not add dependencies)

- React ${v("react")}, react-router ${v("react-router")} (declarative: \`BrowserRouter\`, \`Routes\`, \`Route\`, \`Link\`, \`NavLink\`, \`useNavigate\`, \`useParams\`, \`useSearchParams\`, \`useLocation\`, all imported from \`"react-router"\`), TypeScript ${v("typescript")} strict, Vite ${v("vite")}.
- Tailwind CSS ${v("tailwindcss")} (v4: tokens in \`src/styles/theme.css\` under \`@theme\`; **no tailwind.config.js, no v3 syntax**).
- motion ${v("motion")}: \`import { motion, AnimatePresence, useReducedMotion } from "motion/react"\`.
- @phosphor-icons/react ${v("@phosphor-icons/react")} (icons only from here; weight "bold" default, "fill" for active/selected).
- zustand ${v("zustand")}, @tanstack/react-query ${v("@tanstack/react-query")}, clsx + tailwind-merge (via \`cn()\`), d3-scale ${v("d3-scale")}, d3-shape ${v("d3-shape")}, canvas-confetti ${v("canvas-confetti")}.
- Server/scripts: hono ${v("hono")}, @hono/node-server ${v("@hono/node-server")}, @google/genai ${v("@google/genai")}, pg ${v("pg")}, cheerio ${v("cheerio")}, playwright ${v("playwright")}, tsx, vitest ${v("vitest")}. Node ${process.versions.node.split(".")[0]}.

## Imports

- Frontend (\`src/\`): \`@/…\` = \`src/…\`, \`@shared/…\` = \`shared/…\`.
- \`shared/\`, \`server/\`, \`scrapers/\`, \`scripts/\`: **relative imports only** (they also run under tsx without aliases). \`shared/\` never imports from \`src/\`.

## Folder map

\`\`\`
shared/types.ts        frozen domain types          shared/retailers.ts   RETAILERS, retailerById
shared/verdict.ts      engine                       shared/seed/          items, locations, generator, featured
shared/content/        trick copy                   src/api/              client.ts (api), mock.ts, live.ts
src/components/ui/     generic components           src/components/layout AppShell, AppColumn, TopBar, BottomNav
src/components/penny/  Penny, PennyFace, Logo        src/components/art/   ItemArt + item drawings
src/components/domain/ app-specific components      src/pages/<area>/     screens
src/lib/               brand, cn, format, motion, sfx, tier, useUserLocation
src/store/             zustand store                server/  scrapers/  scripts/
\`\`\`

## Routes

| Path | Screen | Shell |
|---|---|---|
| \`/\` | Landing | full width, no shell |
| \`/check\` | Check home | AppShell |
| \`/check/:itemId\` | Price entry | AppShell, no bottom nav |
| \`/reveal/:checkId\` | Verdict reveal | own AppColumn, no nav |
| \`/item/:itemId\` | Item detail | AppShell |
| \`/scan\` | Camera scan | AppShell, no bottom nav |
| \`/tricks\` | Trick Files | AppShell |
| \`/dev/ui\`, \`/dev/penny\` | Dev playgrounds (dev only) | AppShell |

## Shared types and constants

${full("shared/types.ts")}
${full("shared/retailers.ts")}
${full("shared/seed/constants.ts")}
`;

const design = read("DESIGN.md");
const frontendFiles = [
  "src/lib/brand.ts", "src/lib/cn.ts", "src/lib/format.ts", "src/lib/motion.ts", "src/lib/sfx.ts", "src/lib/tier.ts",
  "src/lib/useUserLocation.ts", "src/store/useAppStore.ts", "src/api/client.ts",
  "src/components/layout/TopBarContext.tsx", "src/components/layout/AppColumn.tsx", "src/components/penny/types.ts",
  "src/pages/check/useRunCheck.ts", "src/components/art/items/types.ts",
];
const sigDirs = ["src/components/ui", "src/components/layout", "src/components/penny", "src/components/art", "src/components/domain"];
const crossStubs = [
  "src/pages/landing/HeroDemo.tsx", "src/pages/check/entry/PriceKeypad.tsx", "src/pages/reveal/RevealResult.tsx",
  "src/pages/scan/useCamera.ts", "src/pages/scan/captureFrame.ts", "src/pages/scan/ScanConfirmSheet.tsx", "src/pages/scan/SampleSheet.tsx",
];
const skip = new Set([...frontendFiles, "src/components/ui/index.ts", "src/components/layout/index.ts", "src/components/penny/index.ts", "src/components/art/index.ts", "src/components/domain/index.ts"]);

const FRONTEND = `# CONTEXT: FRONTEND (paste with every UI, ART and SCR task)

Barrels: import components from \`@/components/ui\`, \`@/components/layout\`, \`@/components/penny\`, \`@/components/art\`, \`@/components/domain\` (each re-exports every file in its folder). Inside the folder that owns a component, import siblings by relative path to avoid cycles.

Many components below are still simple stubs while other agents polish them. **Use them anyway**: their props are final.

${design.replace(/^# /m, "## DESIGN: ").replace(/^## (\d+)\./gm, "### $1.")}

## Helper code (complete files, frozen)

${frontendFiles.map(full).join("\n")}
## Component contracts (exports only)

${sigDirs.flatMap((d) => list(d)).filter((p) => !skip.has(p)).map(signatures).join("\n")}
## Cross-task contracts (stubs another task replaces; exports only)

${crossStubs.map(signatures).join("\n")}
`;

const backendSig = [
  "shared/verdict.ts", "shared/seed/types.ts", "shared/seed/items.ts", "shared/seed/locations.ts", "shared/seed/generate.ts",
  "shared/seed/featured.ts", "shared/content/tricks.ts", "src/api/mock.ts", "src/api/live.ts",
  "scrapers/parse.ts", "scrapers/match.ts", "server/scan.ts", "server/tiger.ts", "server/routes/speak.ts",
];
const BACKEND = `# CONTEXT: BACKEND (paste with every DATA and BE task)

Environment variables (\`.env\`, loaded by the server with \`process.loadEnvFile?.()\`):
\`\`\`
${read(".env.example").trim()}
\`\`\`

npm scripts: ${Object.entries(pkg.scripts).map(([k, s]) => `\`${k}\`: \`${s}\``).join("; ")}.

Data files (gitignored, under \`data/\`): \`prices.json\` (merged PriceStore served live), \`scraped/<date>.json\` (PricePoint[]), \`raw/\` (cache), \`hammer/\` (Project Hammer CSVs), \`hammer-points.json\`, \`status.json\` (DataStatus), \`tts-cache/\`.

## Frozen files (complete)

${full("scrapers/types.ts")}
${full("scrapers/adapters/index.ts")}
## Current exports (placeholders other tasks replace; signatures are the contract)

${backendSig.map(signatures).join("\n")}
`;

mkdirSync(join(root, "specs/context"), { recursive: true });
writeFileSync(join(root, "specs/context/CORE.md"), CORE);
writeFileSync(join(root, "specs/context/FRONTEND.md"), FRONTEND);
writeFileSync(join(root, "specs/context/BACKEND.md"), BACKEND);
for (const f of ["CORE", "FRONTEND", "BACKEND"]) {
  const t = readFileSync(join(root, `specs/context/${f}.md`), "utf8");
  console.log(`${f}.md: ${t.split("\n").length} lines, ~${Math.round(t.length / 4)} tokens`);
}
if (!existsSync(join(root, "specs/tasks"))) console.log("note: specs/tasks not found");
