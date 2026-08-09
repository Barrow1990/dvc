import {
  calculateBlueCardDiscount,
  calculateDvcTripCost,
  calculateFlightsCost,
  calculateFullDvcTripCostGbp,
  calculatePackageTripCost,
  calculateTicketsCost,
} from "../lib/calculations";
import { pointsCharts, packageHolidays, flights, parkTickets, directVsResalePerks } from "../lib/data";
import type { AssumptionsState } from "./Assumptions";

interface Props {
  state: AssumptionsState;
}

const gbp = (n: number) => `£${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function TripComparison({ state }: Props) {
  const chart = pointsCharts[state.resortIndex];
  const partySize = state.adults + state.children;

  let dvcError: string | null = null;
  let full;
  try {
    const dvc = calculateDvcTripCost({
      chart,
      seasonName: state.seasonName,
      roomType: state.roomType,
      view: state.view,
      nights: state.nights,
      duesPerPoint: state.duesPerPoint,
      purchasePricePerPoint: state.purchasePricePerPoint,
      amortizationYears: state.amortizationYears,
    });
    const flightsCost = calculateFlightsCost(
      flights.familyOf4ReturnGbp[state.demandTier],
      partySize,
    );
    const ticketsCost = calculateTicketsCost(
      parkTickets.fourteenDayMagicTicketGbp.adult,
      parkTickets.fourteenDayMagicTicketGbp.child,
      state.demandTier,
      state.adults,
      state.children,
    );
    const blueCardEligible =
      state.purchaseType === "direct" && dvc.totalPoints >= directVsResalePerks.blueCardMinimumPoints;
    const blueCardDiscountGbp = calculateBlueCardDiscount(
      blueCardEligible,
      state.estimatedDiningAndMerchSpendGbp,
      directVsResalePerks.blueCardPerks.diningAndMerchandiseDiscountPercent.low +
        (directVsResalePerks.blueCardPerks.diningAndMerchandiseDiscountPercent.high -
          directVsResalePerks.blueCardPerks.diningAndMerchandiseDiscountPercent.low) /
          2,
    );
    full = {
      dvc,
      flightsCost,
      ticketsCost,
      blueCardEligible,
      totals: calculateFullDvcTripCostGbp(
        dvc,
        flightsCost,
        ticketsCost,
        state.usdToGbpRate,
        blueCardDiscountGbp,
      ),
    };
  } catch (e) {
    dvcError = e instanceof Error ? e.message : String(e);
  }

  const pkg = calculatePackageTripCost({
    perPersonRange: packageHolidays.perPersonGbp14Nights[state.packageTier],
    partySize,
    packageNights: 14,
    tripNights: state.nights,
    demandMultiplier: packageHolidays.demandMultiplier[state.demandTier],
  });

  return (
    <div className="card">
      <h2>Trip comparison</h2>
      <p className="card-desc">
        Both columns are "everything included" - accommodation, flights, and park tickets.
        Package figures scale the sourced 14-night per-person range linearly to your trip
        length; ticket prices are Disney's UK-exclusive 14-Day Magic Ticket, buyable
        standalone so they apply to DVC ownership too, not just packages. Direct purchases
        get a Blue Card dining/merchandise discount applied below - resale doesn't (see
        Assumptions above).
      </p>
      {dvcError ? (
        <p className="error">{dvcError}</p>
      ) : (
        full && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th className="num" style={{ color: "var(--series-dvc)" }}>
                  DVC (amortized)
                </th>
                <th className="num" style={{ color: "var(--series-package)" }}>
                  UK package
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Accommodation</td>
                <td className="num">{gbp(full.totals.accommodationGbp)}</td>
                <td rowSpan={5} className="muted">
                  Bundled - not broken out per component
                </td>
              </tr>
              <tr>
                <td>Flights</td>
                <td className="num">{gbp(full.flightsCost.totalGbp)}</td>
              </tr>
              <tr>
                <td>Park tickets</td>
                <td className="num">{gbp(full.ticketsCost.totalGbp)}</td>
              </tr>
              <tr>
                <td>Blue Card discount{full.blueCardEligible ? "" : " (not eligible)"}</td>
                <td className="num">−{gbp(full.totals.blueCardDiscountGbp)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Total, this trip</strong>
                </td>
                <td className="num">
                  <strong>{gbp(full.totals.totalGbp)}</strong>
                </td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td className="num">
                  <strong>
                    {gbp(pkg.totalLowGbp)}–{gbp(pkg.totalHighGbp)}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        )
      )}
      <p className="callout-warning">
        <span className="icon" aria-hidden="true">
          ⚠
        </span>
        <span>
          UK package total is a blog-aggregator estimate, not a live booking-engine quote, and likely understates
          the real price - confirmed at least £2,000 low against a real quote for a comparable trip (2026-08-09).
          See DATA_SOURCES.md's "Package pricing caveat".
        </span>
      </p>
    </div>
  );
}
