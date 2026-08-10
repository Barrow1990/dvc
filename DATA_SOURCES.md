# Data sources

Every file in `src/data/` carries its own `source` + `fetchedAt` fields.
This is the index — check here first to see what's stale before trusting
a number in the dashboard.

| File | Covers | Fetched | Refresh when |
|---|---|---|---|
| `dues-2026.json` | Annual dues $/point, **all 17 DVC resorts** | 2026-08-08 | Every ~February, when Disney publishes the next year's dues |
| `resale-prices-2026.json` | Resale $/point by resort tier (not every resort individually) | 2026-08-06 | Monthly-ish - resale market moves; treat as a planning estimate, get a real broker quote before deciding |
| `direct-prices-2026.json` | Disney direct $/point, **all 17 DVC resorts** | 2026-08-08 | After any Disney price-increase announcement (was 2026-02-10 for this data) |
| `package-holidays-2026.json` | UK tour-operator package costs (GBP) + a demand-tier multiplier | 2026-08-06 (multiplier added 2026-08-09) | **Read the file's own note before trusting this** - it's a blog-aggregator "typical price" figure, not a live per-date quote. See "Package pricing caveat" below. |
| `points-charts/*.json` | Full 2026 points charts, **all 17 DVC resorts** | 2026-08-06 to 2026-08-08 | Annually - Disney publishes a new points chart PDF each year. See "Points chart data quality" below - several resorts have known gaps/omissions, check each file's own `note` field |
| `school-holidays/moorland-school.json` | Term dates through Summer 2027 + a demand tier per holiday window | 2026-08-06 (demand tiers added 2026-08-09) | Christmas 2026/2027 dates weren't published yet at fetch time - check back on the school's site |
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

## Package pricing caveat (flagged 2026-08-09)

`package-holidays-2026.json`'s `perPersonGbp14Nights` figures are "typical
price" ranges from UK travel-blog aggregators (floridafamilyholiday.com,
thehouseoftravel.co.uk, chartertravel.co.uk, orlandoholidayplanner.co.uk)
- **not a live quote from a real tour operator's booking engine for
specific dates**. That's a real limitation: the same £2,150-2,300pp
Moderate-resort figure was being shown regardless of whether you picked
half-term or peak summer.

Partial fix: added `demandMultiplier` (low 0.9× / regular 1.0× / peak
1.25×) so the price at least responds to the demand tier you've picked,
reasoned from `flights-2026.json`'s real, separately-sourced seasonal
swing (not a second independent package-price source). Treat the result
as a rough approximation - get an actual live quote from a UK tour
operator before trusting this for a real booking decision.

**Confirmed low (2026-08-09):** the user reports real quotes running at
least £2,000 higher than what the app calculates for a comparable trip.
Searched for a better live source and found none - every result traced
back to the same blog aggregators already cited above; getting an actual
per-date booking-engine quote would need a real browser session against
a live tour-operator site, which isn't available in this environment.
Two real contributing factors were found instead, neither fixed yet (the
user asked to flag rather than guess a replacement number):

1. `package-holidays-2026.json` already contains a second, independently
   -sourced figure that was never wired into any calculation -
   `weeklyBudgetRuleOfThumbGbp` (£6,000-8,000 for 7 nights). That's much
   closer to the user's real-world report than the ~£4,000-4,300/week the
   calculator currently produces for a similar scenario (2 adults + 1
   child, Moderate resort, peak).
2. The calculation scales the sourced *14-night* per-person price
   linearly by trip length to get a shorter trip's price. Flights are a
   fixed cost baked into that 14-night total - they don't halve when the
   stay halves - so this systematically understates anything shorter
   than 14 nights, independent of whether the base figure itself is
   accurate.

A visible in-app warning (`.callout-warning` next to every package price,
in both `StatTiles.tsx` and `TripComparison.tsx`) now flags this
directly rather than leaving it buried in this file's `note` field where
nobody using the app would see it. The underlying formula/figures are
unchanged - fixing them properly needs either a real reference quote
(operator, dates, resort, party size, price) or a decision on how to
reconcile the two already-sourced figures, not more blog searching.

### Virgin Atlantic retrieval attempt + analytics (2026-08-10)

At the user's request, tried to pull real package pricing directly from
`virginatlantic.com/holidays` (Virgin Atlantic Holidays sells Disney
World packages under that brand, having absorbed Virgin Holidays).
**Blocked** - both a direct fetch and a plain `curl` with a real
browser user-agent got HTTP 444 (a deliberate silent-connection-drop
response, the same signature Disney's own booking site returned earlier
in this project), and `robots.txt` came back empty. A search-engine-
indexed snapshot of one page also shows the real pricing is loaded
client-side after page load (literal "Loading special offers"
placeholder text in the static HTML), so even without the block, a
plain scrape wouldn't find real numbers - it needs a real browser
session picking specific dates. Did not attempt to bypass the block,
consistent with how the Disney site situation was handled.

**What search-engine indexing did surface** (real fragments, not full
page content, each with a source URL):
- A real per-person Disney ticket price of **£633** (indexed
  2026-08-10) - within £2 of `park-tickets-2026.json`'s **regular**-tier
  14-Day Magic Ticket adult price (£631). Independent corroboration this
  file's ticket data is accurate - added to that file's `note`.
- "Disney park tickets start from **£38 per person per day**" - matches
  `park-tickets-2026.json`'s low-tier £546 ÷ 14 = £39/day almost exactly.
- Moderate/Deluxe/Deluxe Villa resorts get a **20%** room-rate discount
  22 Feb-19 Jul 2026, rising to **25%** for 20 Jul-30 Sep and 15 Nov-8
  Dec 2026 - directionally interesting (bigger % discount at peak
  doesn't necessarily mean a lower net price, since peak rack rates
  start higher - not something this app's data can resolve without a
  real base rate) but not a usable comparable total price.
- "Orlando holidays... start from £779 per person for 2026" - an
  unusable headline teaser figure with unknown nights/resort
  tier/inclusions (likely a short off-peak Value stay, possibly without
  park tickets) - not comparable to `perPersonGbp14Nights` without
  knowing what it actually includes.

**Analytics: quantifying the linear-scaling bug's real contribution.**
Using only figures already sourced in this app (no new invented
numbers), for the default scenario (Moderate resort, peak demand tier,
7 nights, 2 adults + 1 child):

| | Current (linear-scaled) | If flights were held fixed instead* |
|---|---|---|
| Value | £3,373-3,938 (mid £3,655) | £3,936-6,188 (mid £5,062) |
| Moderate | £4,031-4,312 (mid £4,172) | £4,594-6,562 (mid £5,578) |
| Deluxe | £4,500-5,062 (mid £4,781) | £5,062-7,312 (mid £6,188) |

\* Illustrative only: subtracts `flights-2026.json`'s peak per-person
flight cost (£750-1,125) from the 14-night per-person package figure,
scales only the remainder (hotel+tickets) by nights/14, then adds the
full unscaled flight cost back - i.e. flights no longer incorrectly
halve for a 7-night trip. This assumes the sourced flight range is a
reasonable proxy for the flight portion embedded in the blog
aggregators' bundled figure, which isn't verified (they don't publish a
component breakdown).

For Moderate at peak, this alone accounts for **~£1,400** of the
reported gap (£4,172 → £5,578 mid) - a real, quantifiable chunk, but
not the full "at least £2,000" the user reported, and still below this
file's own `weeklyBudgetRuleOfThumbGbp` (£6,000-8,000/week) for a
comparable trip. Most likely explanation: **both** identified issues are
real and compounding - the linear-scaling bug understates shorter trips
structurally, and the base 14-night blog-aggregate figure may itself run
low independent of that. Numbers are still unchanged pending a decision
on whether to apply the illustrative fix above, get a real reference
quote, or both.

## DVC resorts are not "Value/Moderate/Deluxe" (fixed 2026-08-09)

Every DVC resort is Disney's own **"Deluxe Villas"** category - Value/
Moderate/Deluxe is a separate, unrelated classification for cash-only WDW
hotels (All-Star Movies, Port Orleans, etc.) that have no DVC villas at
all. Every points-chart file's `tier` field previously mislabeled cheaper
DVC resorts (Old Key West, Hilton Head, Vero Beach) as "value" and Fort
Wilderness Cabins as "moderate" - confusing DVC's relative pricing with
Disney's real, different hotel-tier system. Fixed: `tier` is now always
`"deluxe villas"` (kept for provenance), and a new `region` field (Walt
Disney World / Disneyland Resort / Aulani (Hawaii) / East Coast) drives
the resort picker's grouping instead - a real, useful distinction rather
than a made-up one.

## School holiday → season/demand-tier picker (added 2026-08-09)

The Assumptions panel's "School holiday" dropdown picks a real Moorland
School holiday window (`school-holidays/moorland-school.json`) and
auto-derives both the DVC points season (via `findSeasonForDate` in
`src/lib/calculations.ts`, matching the window's *start* date against the
selected resort's own season date ranges - a holiday window spanning two
points seasons, like Christmas, is matched on its start only) and the
flights/tickets demand tier (from each window's own `demandTier` field,
reasoned from `flights-2026.json`'s real seasonal examples - see that
field's `demandTierNote`). Season and demand tier stay directly editable
afterward if you want to override the auto-pick.

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

## "Compare resorts" tab (added 2026-08-09)

A second top-level tab, alongside the original single-scenario "Trip
planner" - three reference tables spanning all 17 resorts at once, for
"which resort is actually cheapest/closest" questions that the Trip
Planner's one-resort-at-a-time view can't answer directly. No new data
files - reuses everything already sourced above:

- **Points per night, by resort** - own holiday-window + room-type +
  view filter, same `findSeasonForDate` auto-match the Trip Planner uses.
  A resort shows "—" if its chart has no season covering the window's
  start date, or if that specific room type/view isn't available there
  (see "Points chart data quality" above for which resorts have gaps) -
  never a guessed number.
- **Transport to the parks, by resort** - the same `transport-to-parks.json`
  data `Transport.tsx` already showed for one resort at a time, now as a
  full resort × park grid.
- **Ownership cost per point, by resort** - dues, direct price, and
  resale price (approx) side by side, plus a resale-restriction flag.

**Real bug fixed while building this (2026-08-09):** the resale-
restriction check (`isRestrictedResort` in `Assumptions.tsx`, now
`isResaleRestricted` in `src/lib/resortHelpers.ts`) compared
`chart.resort` ("Disneyland Hotel Villas") against
`direct-vs-resale-perks-2026.json`'s list entry ("Villas at Disneyland
Hotel") using exact string equality - different word order meant this
resort was silently never flagged as resale-restricted anywhere in the
app, even though it's one of only three. Fixed with a word-set
comparison instead of exact match; Riviera Resort and Cabins at Fort
Wilderness were unaffected (their list entries already matched exactly).

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
