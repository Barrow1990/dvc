import {
  calculateDvcTripCost,
  calculateFlightsCost,
  calculateFullDvcTripCostGbp,
  calculatePackageTripCost,
  calculateTicketsCost,
} from "../lib/calculations";
import { pointsCharts, packageHolidays, flights, parkTickets } from "../lib/data";
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
    full = {
      dvc,
      flightsCost,
      ticketsCost,
      totals: calculateFullDvcTripCostGbp(dvc, flightsCost, ticketsCost, state.usdToGbpRate),
    };
  } catch (e) {
    dvcError = e instanceof Error ? e.message : String(e);
  }

  const pkg = calculatePackageTripCost({
    perPersonRange: packageHolidays.perPersonGbp14Nights[state.packageTier],
    partySize,
    packageNights: 14,
    tripNights: state.nights,
  });

  return (
    <section>
      <h2>Trip comparison</h2>
      <p className="muted">
        Both columns are "everything included" - accommodation, flights, and park tickets.
        Package figures scale the sourced 14-night per-person range linearly to your trip
        length; ticket prices are Disney's UK-exclusive 14-Day Magic Ticket, buyable
        standalone so they apply to DVC ownership too, not just packages.
      </p>
      {dvcError ? (
        <p className="error">{dvcError}</p>
      ) : (
        full && (
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
                <td>Accommodation</td>
                <td>{gbp(full.totals.accommodationGbp)}</td>
                <td rowSpan={4} className="muted">
                  Bundled - not broken out per component
                </td>
              </tr>
              <tr>
                <td>Flights</td>
                <td>{gbp(full.flightsCost.totalGbp)}</td>
              </tr>
              <tr>
                <td>Park tickets</td>
                <td>{gbp(full.ticketsCost.totalGbp)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Total, this trip</strong>
                </td>
                <td>
                  <strong>{gbp(full.totals.totalGbp)}</strong>
                </td>
              </tr>
              <tr>
                <td></td>
                <td></td>
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
