import type { DemandTier, PurchaseType, RoomType, ViewType } from "../lib/types";
import { pointsCharts, packageHolidays, fxRate, directPrices, resalePrices, directVsResalePerks } from "../lib/data";
import { ROOM_TYPE_LABELS } from "../lib/calculations";

export interface AssumptionsState {
  resortIndex: number;
  seasonName: string;
  roomType: RoomType;
  view: ViewType;
  nights: number;
  adults: number;
  children: number;
  duesPerPoint: number;
  purchaseType: PurchaseType;
  purchasePricePerPoint: number;
  amortizationYears: number;
  packageTier: keyof typeof packageHolidays.perPersonGbp14Nights;
  usdToGbpRate: number;
  demandTier: DemandTier;
  estimatedDiningAndMerchSpendGbp: number;
}

interface Props {
  state: AssumptionsState;
  onChange: (next: AssumptionsState) => void;
}

/** Resale prices are only tracked per resort-tier, not every individual
 * resort - falls back to the blended market average when a specific
 * resort (e.g. Animal Kingdom Villas) isn't in that breakdown. */
function resalePriceMidpointForResort(resort: string): number {
  const tierKey = Object.keys(resalePrices.rangesPerPointByResortTier).find((k) =>
    k.includes(resort),
  ) as keyof typeof resalePrices.rangesPerPointByResortTier | undefined;
  if (tierKey) {
    const r = resalePrices.rangesPerPointByResortTier[tierKey];
    return (r.low + r.high) / 2;
  }
  return resalePrices.blendedAveragePerPoint;
}

function directPriceForResort(resort: string): number {
  const specific = (directPrices.perPointByResort as Record<string, number>)[resort];
  if (specific !== undefined) return specific;
  return (directPrices.generalRange.low + directPrices.generalRange.high) / 2;
}

export function Assumptions({ state, onChange }: Props) {
  const chart = pointsCharts[state.resortIndex];
  const availableRoomTypes = Object.keys(
    chart.seasons[0].pointsPerNight,
  ) as RoomType[];
  const isRestrictedResort = (
    directVsResalePerks.resaleRestrictedResorts.resorts as string[]
  ).includes(chart.resort);

  function set<K extends keyof AssumptionsState>(key: K, value: AssumptionsState[K]) {
    onChange({ ...state, [key]: value });
  }

  return (
    <section>
      <h2>Assumptions</h2>
      <p className="muted">
        No real DVC contract exists yet - every number here is editable. Defaults are
        sourced estimates, not commitments.
      </p>
      <div className="grid">
        <label>
          Resort
          <select
            value={state.resortIndex}
            onChange={(e) => set("resortIndex", Number(e.target.value))}
          >
            {pointsCharts.map((c, i) => (
              <option key={c.resort} value={i}>
                {c.resort} ({c.tier})
              </option>
            ))}
          </select>
        </label>

        <label>
          Season (accommodation points)
          <select value={state.seasonName} onChange={(e) => set("seasonName", e.target.value)}>
            {chart.seasons.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.dateRanges.join(", ")})
              </option>
            ))}
          </select>
        </label>

        <label>
          Room type
          <select value={state.roomType} onChange={(e) => set("roomType", e.target.value as RoomType)}>
            {availableRoomTypes.map((rt) => (
              <option key={rt} value={rt}>
                {ROOM_TYPE_LABELS[rt]}
              </option>
            ))}
          </select>
        </label>

        <label>
          View
          <select value={state.view} onChange={(e) => set("view", e.target.value as ViewType)}>
            <option value="standard">Standard</option>
            <option value="preferred">Preferred</option>
          </select>
        </label>

        <label>
          Nights
          <input
            type="number"
            min={1}
            value={state.nights}
            onChange={(e) => set("nights", Number(e.target.value))}
          />
        </label>

        <label>
          Adults
          <input
            type="number"
            min={1}
            value={state.adults}
            onChange={(e) => set("adults", Number(e.target.value))}
          />
        </label>

        <label>
          Children (3-9)
          <input
            type="number"
            min={0}
            value={state.children}
            onChange={(e) => set("children", Number(e.target.value))}
          />
        </label>

        <label>
          Demand tier (flights + tickets)
          <select value={state.demandTier} onChange={(e) => set("demandTier", e.target.value as DemandTier)}>
            <option value="low">Low (e.g. Feb half-term, Easter booked early)</option>
            <option value="regular">Regular (e.g. October half-term)</option>
            <option value="peak">Peak (summer, Christmas)</option>
          </select>
        </label>

        <label>
          Dues $/point/year
          <input
            type="number"
            step="0.01"
            value={state.duesPerPoint}
            onChange={(e) => set("duesPerPoint", Number(e.target.value))}
          />
        </label>

        <label>
          Purchase type
          <select
            value={state.purchaseType}
            onChange={(e) => set("purchaseType", e.target.value as PurchaseType)}
          >
            <option value="direct">Direct from Disney</option>
            <option value="resale">Resale (secondhand)</option>
          </select>
        </label>

        <label>
          Purchase price $/point
          <input
            type="number"
            step="0.01"
            value={state.purchasePricePerPoint}
            onChange={(e) => set("purchasePricePerPoint", Number(e.target.value))}
          />
        </label>

        <label>
          Amortize purchase over (years)
          <input
            type="number"
            min={1}
            value={state.amortizationYears}
            onChange={(e) => set("amortizationYears", Number(e.target.value))}
          />
        </label>

        <label>
          Package comparison tier
          <select value={state.packageTier} onChange={(e) => set("packageTier", e.target.value as AssumptionsState["packageTier"])}>
            {Object.keys(packageHolidays.perPersonGbp14Nights).map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </label>

        <label>
          Est. dining/merch spend per trip (£)
          <input
            type="number"
            min={0}
            value={state.estimatedDiningAndMerchSpendGbp}
            onChange={(e) => set("estimatedDiningAndMerchSpendGbp", Number(e.target.value))}
          />
        </label>

        <label>
          USD → GBP rate
          <input
            type="number"
            step="0.0001"
            value={state.usdToGbpRate}
            onChange={(e) => set("usdToGbpRate", Number(e.target.value))}
          />
        </label>
      </div>

      <div className="purchase-type-info">
        <p className="muted">
          {state.purchaseType === "direct" ? (
            <>
              Direct purchases (150+ points) get the Blue Card - {directVsResalePerks.blueCardPerks.diningAndMerchandiseDiscountPercent.low}–
              {directVsResalePerks.blueCardPerks.diningAndMerchandiseDiscountPercent.high}% off dining/merchandise (applied below using your
              estimated spend), plus Annual Pass discounts, DVC lounges, pool hopping, and members-only events - not quantified here.
            </>
          ) : (
            <>
              Resale buyers get no Blue Card / Membership Extras at all, regardless of contract size - typically{" "}
              {directVsResalePerks.resaleDiscountVsDirectPercent.low}–{directVsResalePerks.resaleDiscountVsDirectPercent.high}% cheaper per
              point than direct, though.
              {isRestrictedResort &&
                ` ${chart.resort} is a resale-restricted resort - resale points bought here can ONLY be used here, and resale points from other (legacy) resorts can't book here at all.`}
            </>
          )}
        </p>
        <div className="fx-buttons">
          <button type="button" onClick={() => set("purchasePricePerPoint", directPriceForResort(chart.resort))}>
            Use typical direct price
          </button>
          <button type="button" onClick={() => set("purchasePricePerPoint", resalePriceMidpointForResort(chart.resort))}>
            Use typical resale price
          </button>
        </div>
      </div>

      <div className="fx-rates">
        <p className="muted">
          Latest {fxRate.usdToGbp} · 7-day: {fxRate.last7Days.low}–{fxRate.last7Days.high} (avg{" "}
          {fxRate.last7Days.average}) · 30-day: {fxRate.last30Days.low}–{fxRate.last30Days.high}{" "}
          (avg {fxRate.last30Days.average}) · real ECB historical data, see{" "}
          <a href="https://github.com/Barrow1990/dvc/blob/main/DATA_SOURCES.md">
            DATA_SOURCES.md
          </a>
        </p>
        <div className="fx-buttons">
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.usdToGbp)}>
            Use latest
          </button>
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.last7Days.average)}>
            Use 7-day avg
          </button>
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.last30Days.average)}>
            Use 30-day avg
          </button>
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.last30Days.low)}>
            Use 30-day low
          </button>
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.last30Days.high)}>
            Use 30-day high
          </button>
        </div>
      </div>
    </section>
  );
}
