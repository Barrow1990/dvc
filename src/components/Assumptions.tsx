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

const TIER_ORDER = ["value", "moderate", "deluxe"] as const;
const TIER_LABELS: Record<(typeof TIER_ORDER)[number], string> = {
  value: "Value resorts",
  moderate: "Moderate resorts",
  deluxe: "Deluxe resorts",
};

/** Resale prices are only tracked per resort-tier, not every individual
 * resort - falls back to the blended market average when a specific
 * resort (e.g. Animal Kingdom Villas) isn't in that breakdown. Tier keys
 * like "Grand Floridian / Polynesian (premium)" bundle several resort
 * names together, so this checks whether the resort name contains any
 * of the tier key's slash-separated short names, not just an exact
 * substring match of the whole resort name against the whole tier key. */
function resalePriceMidpointForResort(resort: string): number {
  const tierKey = Object.keys(resalePrices.rangesPerPointByResortTier).find((k) => {
    const shortNames = k
      .replace(/\(.*\)/, "")
      .split("/")
      .map((s) => s.trim());
    return shortNames.some((name) => resort.includes(name));
  }) as keyof typeof resalePrices.rangesPerPointByResortTier | undefined;
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
    <div className="card">
      <h2>Assumptions</h2>
      <p className="card-desc">
        No real DVC contract exists yet - every number here is editable. Defaults are
        sourced estimates, not commitments.
      </p>

      <fieldset className="fieldset">
        <legend>
          <h3>Trip</h3>
        </legend>
        <div className="field-grid">
          <label>
            Resort
            <select
              value={state.resortIndex}
              onChange={(e) => set("resortIndex", Number(e.target.value))}
            >
              {TIER_ORDER.map((tier) => {
                const resorts = pointsCharts
                  .map((c, i) => ({ c, i }))
                  .filter(({ c }) => c.tier === tier);
                if (resorts.length === 0) return null;
                return (
                  <optgroup key={tier} label={TIER_LABELS[tier]}>
                    {resorts.map(({ c, i }) => (
                      <option key={c.resort} value={i}>
                        {c.resort}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>

          <label>
            Season (points)
            <select value={state.seasonName} onChange={(e) => set("seasonName", e.target.value)}>
              {chart.seasons.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
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
              max={21}
              value={state.nights}
              onChange={(e) => set("nights", Number(e.target.value))}
            />
          </label>

          <label>
            Adults
            <input
              type="number"
              min={1}
              max={12}
              value={state.adults}
              onChange={(e) => set("adults", Number(e.target.value))}
            />
          </label>

          <label>
            Children (3-9)
            <input
              type="number"
              min={0}
              max={10}
              value={state.children}
              onChange={(e) => set("children", Number(e.target.value))}
            />
          </label>

          <label>
            Demand tier
            <select value={state.demandTier} onChange={(e) => set("demandTier", e.target.value as DemandTier)}>
              <option value="low">Low (e.g. Feb half-term)</option>
              <option value="regular">Regular (e.g. Oct half-term)</option>
              <option value="peak">Peak (summer, Christmas)</option>
            </select>
          </label>
        </div>
        <p className="field-hint">
          Party size (adults + children) drives both the park-ticket cost and how the package
          price scales. Season and demand tier are separate calendars - see DATA_SOURCES.md.
        </p>
      </fieldset>

      <fieldset className="fieldset">
        <legend>
          <h3>Ownership</h3>
        </legend>
        <div className="field-grid">
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
            Price $/point
            <input
              type="number"
              step="0.01"
              value={state.purchasePricePerPoint}
              onChange={(e) => set("purchasePricePerPoint", Number(e.target.value))}
            />
          </label>

          <label>
            Dues $/point/yr
            <input
              type="number"
              step="0.01"
              value={state.duesPerPoint}
              onChange={(e) => set("duesPerPoint", Number(e.target.value))}
            />
          </label>

          <label>
            Amortize over (yrs)
            <input
              type="number"
              min={1}
              max={50}
              value={state.amortizationYears}
              onChange={(e) => set("amortizationYears", Number(e.target.value))}
            />
          </label>
        </div>

        <p className="field-hint">
          {state.purchaseType === "direct" ? (
            <>
              Direct purchases (150+ points) get the Blue Card -{" "}
              {directVsResalePerks.blueCardPerks.diningAndMerchandiseDiscountPercent.low}–
              {directVsResalePerks.blueCardPerks.diningAndMerchandiseDiscountPercent.high}% off
              dining/merchandise (quantified below), plus Annual Pass discounts, DVC lounges, and
              members-only events - not quantified here.
            </>
          ) : (
            <>
              Resale buyers get no Blue Card at all, regardless of contract size - typically{" "}
              {directVsResalePerks.resaleDiscountVsDirectPercent.low}–
              {directVsResalePerks.resaleDiscountVsDirectPercent.high}% cheaper per point though.
              {isRestrictedResort &&
                ` ${chart.resort} is resale-restricted - resale points bought here can ONLY be used here.`}
            </>
          )}
        </p>
        <div className="chip-row">
          <button type="button" onClick={() => set("purchasePricePerPoint", directPriceForResort(chart.resort))}>
            Use typical direct price
          </button>
          <button type="button" onClick={() => set("purchasePricePerPoint", resalePriceMidpointForResort(chart.resort))}>
            Use typical resale price
          </button>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend>
          <h3>Comparison</h3>
        </legend>
        <div className="field-grid">
          <label>
            Package tier
            <select value={state.packageTier} onChange={(e) => set("packageTier", e.target.value as AssumptionsState["packageTier"])}>
              {Object.keys(packageHolidays.perPersonGbp14Nights).map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </label>

          <label>
            Dining/merch spend (£)
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

        <p className="field-hint">
          Latest {fxRate.usdToGbp} · 7-day avg {fxRate.last7Days.average} · 30-day avg{" "}
          {fxRate.last30Days.average} (real ECB historical data)
        </p>
        <div className="chip-row">
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.usdToGbp)}>
            Latest
          </button>
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.last7Days.average)}>
            7d avg
          </button>
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.last30Days.average)}>
            30d avg
          </button>
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.last30Days.low)}>
            30d low
          </button>
          <button type="button" onClick={() => set("usdToGbpRate", fxRate.last30Days.high)}>
            30d high
          </button>
        </div>
      </fieldset>
    </div>
  );
}
