# dvc

A dashboard to help decide whether buying into Disney Vacation Club
(DVC) makes financial sense, for real trips during real school holiday
windows. Compares two ways of paying for a Walt Disney World stay,
both "everything included" (accommodation + flights + park tickets):

1. **Buying DVC** (resale or direct) — one-time purchase price/point
   plus ongoing annual dues/point (amortized per trip), plus flights,
   park tickets, less the Blue Card discount if bought direct
2. **A UK package holiday** (flights + hotel + tickets bundled from a
   UK tour operator) for the same trip

A third comparison — Disney-direct cash/rack rate, no package discount
— isn't built yet; see `DECISION_FACTORS.md`.

No DVC contract is currently owned — this is a decision-support tool,
not a record of an existing membership. Every assumption (points
owned, purchase price, ownership horizon) is editable in the UI. See
`DECISION_FACTORS.md` for the full set of things this does and doesn't
account for.

Static site (Vite + React + TypeScript), deployed to GitHub Pages — no
backend, all calculations run client-side.

## Data

Every figure in `src/data/*.json` is sourced from a real, dated
lookup — see `DATA_SOURCES.md` for what came from where and when, so
it's clear what needs refreshing as prices change.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # static build - this is what GitHub Pages serves
```
