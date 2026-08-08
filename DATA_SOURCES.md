# Data sources

Every file in `src/data/` carries its own `source` + `fetchedAt` fields.
This is the index — check here first to see what's stale before trusting
a number in the dashboard.

| File | Covers | Fetched | Refresh when |
|---|---|---|---|
| `dues-2026.json` | Annual dues $/point, **all 17 DVC resorts** | 2026-08-08 | Every ~February, when Disney publishes the next year's dues |
| `resale-prices-2026.json` | Resale $/point by resort tier (not every resort individually) | 2026-08-06 | Monthly-ish - resale market moves; treat as a planning estimate, get a real broker quote before deciding |
| `direct-prices-2026.json` | Disney direct $/point, **all 17 DVC resorts** | 2026-08-08 | After any Disney price-increase announcement (was 2026-02-10 for this data) |
| `package-holidays-2026.json` | UK tour-operator package costs (GBP) | 2026-08-06 | Each time you're comparing a real trip - these are seasonal/demand-driven, the ranges here are a rough planning baseline only |
| `points-charts/*.json` | Full 2026 points charts, **all 17 DVC resorts** | 2026-08-06 to 2026-08-08 | Annually - Disney publishes a new points chart PDF each year. See "Points chart data quality" below - several resorts have known gaps/omissions, check each file's own `note` field |
| `school-holidays/moorland-school.json` | Term dates through Summer 2027 | 2026-08-06 | Christmas 2026/2027 dates weren't published yet at fetch time - check back on the school's site |
| `fx-rate.json` | USD→GBP: latest, real 7-day/30-day low/high/avg | 2026-08-06 | Run `npm run update-fx` any time - fetches real ECB historical rates via the Frankfurter API (free, no key) and rewrites this file. The app has quick-select buttons for latest/7d-avg/30d-avg/30d-low/30d-high. |
| `flights-2026.json` | UK→Orlando return flights, family-of-4 GBP, by demand tier | 2026-08-07 | Each time you're comparing a real trip - flight prices are highly date-specific, these are planning-level ranges |
| `park-tickets-2026.json` | UK-exclusive 14-Day Magic Ticket, GBP per person (adult/child), by demand tier | 2026-08-07 | Annually alongside Disney's own price updates |
| `direct-vs-resale-perks-2026.json` | Blue Card eligibility/perks, resale-restricted resorts, resale vs direct discount % | 2026-08-07 | Annually, or if Disney changes the Membership Extras/resale-restriction policy |
| `contract-expirations.json` | Real deeded-ownership expiration date, Polynesian only so far | 2026-08-08 | As you source more resorts' real expiration dates - see Coverage gaps |
| `closing-costs.json` | One real example (150-point direct cash purchase at Polynesian) | 2026-08-08 | As you get real resale closing-cost quotes - direct and resale costs differ |
| `transport-to-parks.json` | Real transport mode(s) from every resort to every park it can reach | 2026-08-08 | Rarely changes structurally; `currentDisruptions` (temporary closures/refurbishments) needs checking closer to a real trip |

## Why DVC needs flights + tickets added on top

DVC ownership only ever pays for accommodation - a UK package holiday
bundles flights + hotel + the UK-exclusive 14-Day Magic Ticket together
(confirmed 2026-08-07 against real UK operator package pages), which is
why packages look "cheap" for what they include. Comparing DVC's points
cost against a package price without adding flights and tickets to the
DVC side wasn't a fair comparison - fixed by adding `flights-2026.json`
and `park-tickets-2026.json`, both included in the DVC total everywhere
in the app now.

## Points chart data quality (read before trusting a specific resort/room)

All 17 DVC resorts now have a points chart, sourced from dvctripplanner.com
(one official Disney prospectus PDF for Polynesian). This was a large,
mostly-automated extraction pass (2026-08-08) - most resorts are solid, but
a few real gaps and one real correction came out of it:

- **Real bug fixed:** Saratoga Springs' dues had been wrong since this
  project started ($7.42/point) - corrected to the real $9.19/point after
  cross-checking two independent sources. If you ran any numbers against
  Saratoga Springs before 2026-08-08, they understated the real cost.
- **Excluded room types (not guessed, just left out):** a few resorts'
  extractions produced numbers that didn't scale plausibly against every
  other data point in this dataset (e.g. a 2-bedroom costing 5x the studio
  rate when every other resort is ~1.5-2.5x) - almost certainly a table-
  parsing artifact, not a real Disney number. Rather than risk a wrong
  figure in a financial tool, those specific room types were dropped:
  - BoardWalk Villas: 2-bedroom, 3-bedroom grand villa
  - Disneyland Hotel Villas: 1-bedroom, 2-bedroom, 3-bedroom (studio only)
  - Vero Beach: 1-bedroom, 2-bedroom, 3-bedroom, Deluxe Inn (studio only)
  Each affected file's own `note` explains this - re-verify from a primary
  source (an official Disney prospectus PDF, like Polynesian's) if you
  need those room types at those specific resorts.
- **Nightly averages, not exact per-night figures:** most resorts' real
  charts split by day-of-week (Sun-Thu vs Fri-Sat) or view category more
  finely than this app's schema supports - values are each season's
  published weekly total ÷ 7, or a (5×weekday + 2×weekend)/7 blend where
  no weekly total was given. Every affected file's `note` says which.
- **Non-standard room types repurposed:** Cabins (Copper Creek, Fort
  Wilderness) and the Polynesian Bungalow don't fit this app's
  studio/1BR/2BR/3BR schema - mapped into the unused `grandVilla` or
  `twoBedroom` slot respectively, noted in each file.
- **Grand Floridian's "studio"** is specifically the cheaper Resort Studio
  category - the pricier Deluxe Studio tier isn't modeled.
- **Aulani/Grand Californian/Disneyland Hotel Villas** use their own real
  regional calendars (Hawaii/Disneyland), not the standard Orlando date
  ranges every WDW deluxe resort in this dataset shares.

## Coverage gaps (v1 scope)

- Contract expiration dates and closing costs are sourced for Polynesian
  only (see `contract-expirations.json`/`closing-costs.json`) but **not
  yet wired into any calculation** - the app's amortization years still
  isn't capped by a resort's real expiration date, and closing costs
  aren't added to the purchase price anywhere. Tracked in
  `DECISION_FACTORS.md`.
- The "demand tier" (low/regular/peak) driving flights + ticket prices is
  a separate selector from the DVC points chart's own season - they're
  priced on genuinely different calendars (airline/Disney-UK-ticket demand
  vs. DVC's own points calendar) and not assumed to line up on the same
  dates. Pick both to roughly match the real dates you're planning around.
- Flights scale linearly from the sourced family-of-4 baseline by party
  size - a simplification, real fares aren't per-seat-linear (checked
  baggage, seat selection, etc. don't scale that cleanly either).
- Resale price data is only broken out by resort *tier*, not every
  individual resort - the app's "use typical resale price" button falls
  back to the blended market average for resorts not in that tier
  breakdown (e.g. Bay Lake Tower, Old Key West).
- No real DVC contract exists yet - all "assumptions" (points owned,
  purchase price paid) are user-editable placeholders in the UI, not
  real committed numbers.
