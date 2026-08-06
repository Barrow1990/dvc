import { calculateDvcTripCost, calculatePackageTripCost, usdToGbp } from "../lib/calculations";
import { pointsCharts, packageHolidays } from "../lib/data";
import type { AssumptionsState } from "./Assumptions";

interface Props {
  state: AssumptionsState;
}

const gbp = (n: number) => `£${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function TripComparison({ state }: Props) {
  const chart = pointsCharts[state.resortIndex];

  let dvc;
  let dvcError: string | null = null;
  try {
    dvc = calculateDvcTripCost({
      chart,
      seasonName: state.seasonName,
      roomType: state.roomType,
      view: state.view,
      nights: state.nights,
      duesPerPoint: state.duesPerPoint,
      purchasePricePerPoint: state.purchasePricePerPoint,
      amortizationYears: state.amortizationYears,
    });
  } catch (e) {
    dvcError = e instanceof Error ? e.message : String(e);
  }

  const pkg = calculatePackageTripCost({
    perPersonRange: packageHolidays.perPersonGbp14Nights[state.packageTier],
    partySize: state.partySize,
    packageNights: 14,
    tripNights: state.nights,
  });

  return (
    <section>
      <h2>Trip comparison</h2>
      <p className="muted">
        Package figures scale the sourced 14-night per-person range linearly to your trip
        length - a simplification, real package pricing isn't perfectly linear per night.
      </p>
      {dvcError ? (
        <p className="error">{dvcError}</p>
      ) : (
        dvc && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>DVC (this trip, amortized)</th>
                <th>UK package holiday</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Points needed</td>
                <td>
                  {dvc.totalPoints.toFixed(0)} pts ({dvc.pointsPerNight.toFixed(1)}/night ×{" "}
                  {state.nights} nights)
                </td>
                <td>—</td>
              </tr>
              <tr>
                <td>Annual dues cost</td>
                <td>
                  {usd(dvc.duesCost)} ({gbp(usdToGbp(dvc.duesCost, state.usdToGbpRate))})
                </td>
                <td>—</td>
              </tr>
              <tr>
                <td>Amortized purchase cost</td>
                <td>
                  {usd(dvc.amortizedPurchaseCost)} (
                  {gbp(usdToGbp(dvc.amortizedPurchaseCost, state.usdToGbpRate))}) over{" "}
                  {state.amortizationYears} yrs
                </td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <strong>Total, this trip</strong>
                </td>
                <td>
                  <strong>
                    {usd(dvc.totalCost)} (
                    {gbp(usdToGbp(dvc.totalCost, state.usdToGbpRate))})
                  </strong>
                </td>
                <td>
                  <strong>
                    {gbp(pkg.totalLowGbp)}–{gbp(pkg.totalHighGbp)}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        )
      )}
    </section>
  );
}
