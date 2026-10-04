# Blockers

Agents and the integrator log contract problems here: `- [TASK-ID] what is needed, where, and the workaround used.`
- [SCAN-UNITS] scrapers/parse.ts parseSize maps "per lb" to 1 kg; the scan no longer uses it (shared/units.ts parseTagAmount does), but scrapers still do. Workaround: none needed for scanning.
