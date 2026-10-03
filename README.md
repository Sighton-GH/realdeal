# RealDeal

Is that sale actually a deal? RealDeal checks a grocery price against 90 days of prices at four BC stores and tells you in seconds: steal, good deal, normal, or overpriced. Snap a shelf tag with your phone, see the price history, and compare nearby stores.

## Run it

```
npm install
npm run dev          # http://localhost:5173 (mock data, no keys needed)
```

Live mode (real data, Gemini scanning, one port for the Cloudflare tunnel):

```
cp .env.example .env   # fill in keys, set VITE_API_MODE=live
npm run start          # http://localhost:8787
cloudflared tunnel --url http://localhost:8787
```

Other scripts: `npm run typecheck`, `lint`, `test`, `build`, `scrape`, `import:hammer`, `merge:data`.

## Build docs

- `PLAN.md`: product rules, data strategy, architecture, workflow
- `DESIGN.md`: design system and component contracts
- `AGENTS.md`: rules for AI agents (also `CLAUDE.md`, `GEMINI.md`)
- `specs/README.md`: the 45-task board; `specs/bundles/` ready-to-paste prompts
- `INTEGRATE.md`: how Claude Code merges agent output
