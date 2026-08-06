# Data sources

Every file in `src/data/` carries its own `source` + `fetchedAt` fields.
This is the index — check here first to see what's stale before trusting
a number in the dashboard.

| File | Covers | Fetched | Refresh when |
|---|---|---|---|
| `dues-2026.json` | Annual dues $/point, 6 example resorts | 2026-08-06 | Every ~February, when Disney publishes the next year's dues |
| `resale-prices-2026.json` | Resale $/point by resort tier | 2026-08-06 | Monthly-ish - resale market moves; treat as a planning estimate, get a real broker quote before deciding |
| `direct-prices-2026.json` | Disney direct $/point | 2026-08-06 | After any Disney price-increase announcement (was 2026-02-10 for this data) |
| `package-holidays-2026.json` | UK tour-operator package costs (GBP) | 2026-08-06 | Each time you're comparing a real trip - these are seasonal/demand-driven, the ranges here are a rough planning baseline only |
| `points-charts/saratoga-springs.json` | Full 2026 points chart | 2026-08-06 | Annually - Disney publishes a new points chart PDF each year |
| `points-charts/animal-kingdom-villas.json` | 2026 points chart (ranges across view categories) | 2026-08-06 | Same as above |
| `school-holidays/moorland-school.json` | Term dates through Summer 2027 | 2026-08-06 | Christmas 2026/2027 dates weren't published yet at fetch time - check back on the school's site |
| `fx-rate.json` | USD→GBP: latest, real 7-day/30-day low/high/avg | 2026-08-06 | Run `npm run update-fx` any time - fetches real ECB historical rates via the Frankfurter API (free, no key) and rewrites this file. The app has quick-select buttons for latest/7d-avg/30d-avg/30d-low/30d-high. |

## Coverage gaps (v1 scope)

- Only 2 of DVC's ~17 resorts have a full points chart (Saratoga Springs,
  Animal Kingdom Villas) - one value-tier, one deluxe-tier, enough to
  demonstrate the comparison. Add more resorts' charts the same way as
  needed (`dvctripplanner.com/resort/<slug>` fetches cleanly as text;
  `wdwinfo.com` blocks automated fetches, `dvcfan.com`'s numbers are
  PDF-only).
- Animal Kingdom Villas' points are ranges (spanning its view categories)
  rather than exact per-view numbers - the source page didn't break them
  out further.
- No real DVC contract exists yet - all "assumptions" (points owned,
  purchase price paid) are user-editable placeholders in the UI, not
  real committed numbers.
