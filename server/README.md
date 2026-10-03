# RealDeal Live Backend

The live backend runs on Hono and `@hono/node-server`, providing the same REST API as the mock engine while serving the built frontend with SPA fallback.

## Running in Live Mode

1. Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env