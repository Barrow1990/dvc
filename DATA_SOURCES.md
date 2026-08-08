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
| `flights-2026.json` | UK→Orlando return flights, family-of-4 GBP, by demand tier | 2026-08-07 | Each time you're comparing a real trip - flight prices are highly date-specific, these are planning-level ranges |
| `park-tickets-2026.json` | UK-exclusive 14-Day Magic Ticket, GBP per person (adult/child), by demand tier | 2026-08-07 | Annually alongside Disney's own price updates |
| `direct-vs-resale-perks-2026.json` | Blue Card eligibility/perks, resale-restricted resorts, resale vs direct discount % | 2026-08-07 | Annually, or if Disney changes the Membership Extras/resale-restriction policy |
| `points-charts/polynesian-villas-bungalows.json` | Full 2026 points chart, nightly average (see note in file re: day-of-week) | 2026-08-08 | Annually - sourced from an official Disney sales prospectus PDF (user-provided) for price/dues, dvctripplanner.com for the points chart |
| `contract-expirations.json` | Real deeded-ownership expiration date, Polynesian only so far | 2026-08-08 | As you source more resorts' real expiration dates - see Coverage gaps |
| `closing-costs.json` | One real example (150-point direct cash purchase at Polynesian) | 2026-08-08 | As you get real resale closing-cost quotes - direct and resale costs differ |

## Why DVC needs flights + tickets added on top

DVC ownership only ever pays for accommodation - a UK package holiday
bundles flights + hotel + the UK-exclusive 14-Day Magic Ticket together
(confirmed 2026-08-07 against real UK operator package pages), which is
why packages look "cheap" for what they include. Comparing DVC's points
cost against a package price without adding flights and tickets to the
DVC side wasn't a fair comparison - fixed by adding `flights-2026.json`
and `park-tickets-2026.json`, both included in the DVC total everywhere
in the app now.

## Coverage gaps (v1 scope)

- Only 3 of DVC's ~17 resorts have a full points chart (Saratoga Springs,
  Animal Kingdom Villas, Polynesian Villas & Bungalows) - enough to
  demonstrate the comparison across value/deluxe tiers. Add more resorts'
  charts the same way as needed (`dvctripplanner.com/resort/<slug>`
  fetches cleanly as text; `wdwinfo.com` blocks automated fetches,
  `dvcfan.com`'s numbers are PDF-only - or provide the official Disney
  sales prospectus PDF directly, which is what got Polynesian's real
  price/dues data).
- Animal Kingdom Villas' points are ranges (spanning its view categories)
  rather than exact per-view numbers - the source page didn't break them
  out further. Polynesian's points are a nightly average (the source
  chart splits Sun-Thu vs Fri-Sat, which this app doesn't model) - see
  the note in `points-charts/polynesian-villas-bungalows.json`.
- Contract expiration dates and closing costs are now sourced for
  Polynesian only (see `contract-expirations.json`/`closing-costs.json`)
  but **not yet wired into any calculation** - the app's amortization
  years still isn't capped by a resort's real expiration date, and
  closing costs aren't added to the purchase price anywhere. Tracked in
  `DECISION_FACTORS.md`.
- The "demand tier" (low/regular/peak) driving flights + ticket prices is
  a separate selector from the DVC points chart's own season - they're
  priced on genuinely different calendars (airline/Disney-UK-ticket demand
  vs. DVC's own points calendar) and not assumed to line up on the same
  dates. Pick both to roughly match the real dates you're planning around.
- Flights scale linearly from the sourced family-of-4 baseline by party
  size - a simplification, real fares aren't per-seat-linear (checked
  baggage, seat selection, etc. don't scale that cleanly either).
- No real DVC contract exists yet - all "assumptions" (points owned,
  purchase price paid) are user-editable placeholders in the UI, not
  real committed numbers.
