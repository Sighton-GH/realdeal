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

`GEMINI_API_KEY` still works for a single key. The server counts every request against each key's free-tier limits (gemini-3.8-flash: 5 requests a minute, 20 a day, 250K tokens a minute; override with `GEMINI_RPM`, `GEMINI_RPD`, `GEMINI_TPM`) and each scan goes to the key with the most room left. A key that is full is skipped without sending it a request, so a scan never waits on a 429. Daily counts reset at midnight Pacific (when Google resets them) and are saved in `data/gemini-usage.json` (hashed key ids, never the keys), so a restart does not retry keys that are already full for the day. If every key is full for the minute and one frees up within 10 seconds, the scan waits for it. If Google rate limits a key anyway, that key rests for the wait Google asks for (until midnight Pacific if its daily quota is gone) and the same scan carries on with the next key. A key Google rejects as invalid is switched off until the server restarts. If every key is full or resting, the scan screen says how long to wait and the sample tags still work. Keys are only ever logged as their last four characters. Limits are per Google project, so keys from different projects add up; keys from the same project share one limit.
