# RealDeal Live Backend

The live backend runs on Hono and `@hono/node-server`, providing the same REST API as the mock engine while serving the built frontend with SPA fallback.

## Running in Live Mode

1. Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env

## Several Gemini keys (automatic rotation)

Put one or more keys in `.env`, comma separated:

```
GEMINI_API_KEYS=key_one,key_two,key_three
```

`GEMINI_API_KEY` still works for a single key. Scans take the keys in turn. If Google rate limits a key, that key rests for the wait Google asks for (an hour if its daily quota is used up) and the same scan carries on with the next key, so the user never notices. A key Google rejects as invalid is switched off until the server restarts. If every key is resting, the scan screen says how long to wait and the sample tags still work. Keys are only ever logged as their last four characters. Free-tier limits are per key (about 5 scans a minute), so keys from different Google projects add up; keys from the same project share one limit.
