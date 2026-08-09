# DVC decision factors

Everything relevant to the "should we buy into DVC" decision — what the
dashboard actually models, what it simplifies, and what it doesn't touch
at all yet. This is a hand-maintained checklist, not generated — edit it
directly as your thinking (or the real numbers) change.

## Modeled in the app today

- **Accommodation cost** — DVC points required (resort/season/room/view)
  × dues, plus the purchase price amortized over an editable ownership
  horizon
- **Purchase price: direct vs resale** — real 2026 sourced defaults for
  both, editable, with quick-set buttons per resort
- **Blue Card dining/merchandise discount** — direct-only (150+ points),
  quantified against an editable estimated per-trip spend
- **Flights** — UK↔Orlando return, by demand tier, scaled by party size
- **Park tickets** — Disney's UK-exclusive 14-Day Magic Ticket, priced
  separately for adults/children, by demand tier
- **USD→GBP exchange rate** — real historical data (latest, 7-day,
  30-day low/high/avg), editable, refreshable via `npm run update-fx`
- **Comparison against a UK package holiday** — flights + hotel + tickets
  bundled, confirmed genuinely "everything included"
- **Break-even chart** — cumulative DVC cost (purchase + recurring) vs.
  always booking the package, over an editable number of years
- **Real school holiday windows** — Moorland School's actual term dates,
  since travel is constrained to those anyway
- **All 17 DVC resorts** — real dues, direct price, and a points chart for
  every resort (some with known gaps, see `DATA_SOURCES.md`'s "Points
  chart data quality" section)
- **Transport to the parks** — real mode(s) (monorail/Skyliner/boat/
  walking/bus) from every resort to every park it can reach, shown per
  resort - informational, not part of any cost calculation
- **Cross-resort comparison tables** — a separate "Compare resorts" tab
  with all 17 resorts side by side: points/night for a chosen holiday
  window + room type (sorted cheapest first), transport to every park,
  and dues/direct-price/resale-price/resale-restriction per resort - for
  "which resort" questions the single-scenario Trip Planner tab can't
  answer directly

## Known simplifications in what IS modeled

- Only 2 of DVC's ~17 resorts have a full points chart (Saratoga Springs,
  Animal Kingdom Villas) — see `DATA_SOURCES.md` for how to add more
- Animal Kingdom Villas' points are ranges (spanning view categories),
  not exact per-view numbers
- Package and flight costs scale **linearly** by nights/party size — real
  pricing isn't perfectly linear per night or per seat
- The "demand tier" driving flights/tickets is a separate calendar from
  the DVC points chart's own season — not auto-synced, pick both to
  roughly match the real dates you're planning around
- **Annual dues are assumed flat** over the whole ownership horizon in
  the break-even chart — real dues have historically risen ~3–7%/year,
  which compounds a lot over 15–30 years. Not modeled.
- **Amortization years is a free-typed number**, not capped to the
  resort's actual contract expiration date (see below) — you could
  currently type in more years than the contract will even exist for.

## Real factors NOT modeled yet — financial

- **Cash/rack-rate comparison.** The original plan included a third
  comparison — booking the same Disney resort direct for cash, no
  package discount — as a baseline. Not built; only DVC vs. UK package
  exists today.
- **Contract expiration date (resort-specific).** DVC is a leasehold,
  not fee-simple ownership — every resort has a fixed expiration year.
  Confirmed for real against an official Disney sales document
  (2026-08-08): Polynesian Villas & Bungalows expires **2066-01-31** —
  see `contract-expirations.json`. Other resorts' dates aren't sourced
  yet (commonly-cited figures exist online but weren't verified against
  a primary source, so deliberately left out rather than repeated
  unverified). This still isn't enforced anywhere in the calculator —
  `amortizationYears` is a free-typed number, not capped by the real
  expiration date even for Polynesian now that it's known.
- **Dues inflation** — not modeled, see above.
- **Closing costs.** Confirmed one real example (2026-08-08, official
  Disney document): a 150-point **direct cash** purchase at Polynesian
  carries ~$783.88 in closing costs — see `closing-costs.json`. Resale
  closing costs (title company fees etc.) are a separate, typically
  larger cost, still not sourced. Neither is added to the purchase price
  anywhere in the calculator yet.
- **Financing costs** — the app assumes cash purchase. If financed,
  there's real interest cost; if paid cash, there's a real opportunity
  cost (that lump sum isn't invested elsewhere). Neither is modeled.
- **Resale value / exit strategy** — a DVC contract retains some resale
  value if sold before expiration. Not modeled as a partial recovery of
  the purchase cost — the app currently assumes the full purchase price
  is "spent," not partially recoverable.
- **Right of First Refusal (ROFR) risk** — Disney can exercise ROFR on
  any resale contract, meaning a deal can fall through after real time
  and effort invested. Not a direct cost, but a real process risk worth
  knowing about before going deep on a specific resale listing.
- **Currency risk over the ownership horizon** — the app only models
  today's FX rate/range. A 15–30 year hold has real long-term GBP/USD
  exposure that isn't modeled at all.
- **Annual Pass discount** (a real Blue Card perk) — mentioned in the
  UI but not quantified, since it depends entirely on whether you'd
  actually buy an AP, which isn't decided.
- **Disney Cruise Line / other point uses** — DVC points can book
  cruises too, not just resort stays. Not modeled - the whole app
  assumes points are only ever used for WDW resort stays.

## Real factors NOT modeled yet — practical/process

- **Points expiration / banking / borrowing** — points must be used
  within their Use Year, or banked forward once, or borrowed from the
  next year. Miss the window and they're gone. Not a dollar cost, but a
  real planning-risk factor worth being aware of.
- **Booking windows** — 11 months out at your home resort, 7 months out
  for other DVC resorts. Affects whether you can actually get the room/
  dates you want, especially since this whole project is about traveling
  during peak-demand school holiday windows.
- **Resale restrictions** — already surfaced in the app's Assumptions
  panel (Riviera, Fort Wilderness Cabins, Disneyland Hotel Villas are
  two-way restricted), restated here for completeness.
- **Minimum point purchase amounts** — Disney sets a direct-purchase
  minimum (150 points for Blue Card eligibility, smaller add-ons
  possible below that); resale contracts have their own practical
  minimums that affect market liquidity/availability.

## Non-financial / lifestyle factors

- Buying DVC effectively commits your primary annual family holiday to
  Disney/Orlando for the ownership horizon — real opportunity cost of
  not exploring other destinations.
- Family circumstances changing over 15–30 years (kids growing up/
  leaving home, family size changes) affect what room type you actually
  need, which changes the real points requirement over time.
- Whether the contract can flexibly split across smaller trips, or be
  used by extended family, rather than always one big annual trip.
- Inheritance/estate handling — DVC can be passed down or needs
  resolving (sold or let lapse) before/at contract expiration.
- Jointly-owned-asset risk (e.g. relationship changes) — not something
  to model financially, but worth having a real answer for before buying.

## Open decisions only you can make

- **Which resort(s)** to seriously consider — all 17 real DVC resorts now
  have data modeled (2026-08-08), including transport to the parks. A
  few resorts have known room-type gaps (see `DATA_SOURCES.md`'s "Points
  chart data quality") - an official Disney sales prospectus PDF (like
  the one that seeded Polynesian's real price/dues/expiration/closing-
  cost data) is the best way to fill those in or verify a resort you're
  seriously considering.
- **Realistic annual trip pattern** (nights, room type, season) to size
  the points purchase around — the app currently uses whatever's typed
  into Assumptions, not a settled real plan.
- **Direct vs resale** — now that the real perks/restrictions tradeoff
  is documented and quantified where possible.
- **How many points to buy** — bigger contracts get better $/point
  pricing and dues-admin efficiency, but lock in more capital.
- **Buy now vs wait** — resale/direct prices have historically trended
  upward, but so has your ability to save toward a larger purchase.
