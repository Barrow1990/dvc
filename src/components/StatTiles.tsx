import {
  calculateBlueCardDiscount,
  calculateBreakEven,
  calculateDvcTripCost,
  calculateFlightsCost,
  calculateFullDvcTripCostGbp,
  calculatePackageTripCost,
  calculateTicketsCost,
  findBreakEvenYear,
  usdToGbp,
} from "../lib/calculations";
import { pointsCharts, packageHolidays, flights, parkTickets, directVsResalePerks } from "../lib/data";
import type { AssumptionsState } from "./Assumptions";

interface Props {
  state: AssumptionsState;
}

const gbp = (n: number) => `£${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function StatTiles({ state }: Props) {
  const chart = pointsCharts[state.resortIndex];
  const partySize = state.adults + state.children;

  let dvcTotalGbp: number | null = null;
  let breakEvenYear: number | null | undefined;

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
    const flightsCost = calculateFlightsCost(flights.familyOf4ReturnGbp[state.demandTier], partySize);
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
    const totals = calculateFullDvcTripCostGbp(dvc, flightsCost, ticketsCost, state.usdToGbpRate, blueCardDiscountGbp);
    dvcTotalGbp = totals.totalGbp;

    const purchaseCostGbp = usdToGbp(dvc.totalPoints * state.purchasePricePerPoint, state.usdToGbpRate);
    const annualDuesGbp = usdToGbp(dvc.duesCost, state.usdToGbpRate);
    const annualRecurringGbp = annualDuesGbp + flightsCost.totalGbp + ticketsCost.totalGbp - blueCardDiscountGbp;
    const pkg = calculatePackageTripCost({
      perPersonRange: packageHolidays.perPersonGbp14Nights[state.packageTier],
      partySize,
      packageNights: 14,
      tripNights: state.nights,
    });
    const packageAnnualGbp = (pkg.totalLowGbp + pkg.totalHighGbp) / 2;
    breakEvenYear = findBreakEvenYear(calculateBreakEven(purchaseCostGbp, annualRecurringGbp, packageAnnualGbp, 30));
  } catch {
    dvcTotalGbp = null;
  }

  const pkg = calculatePackageTripCost({
    perPersonRange: packageHolidays.perPersonGbp14Nights[state.packageTier],
    partySize,
    packageNights: 14,
    tripNights: state.nights,
  });
  const packageTotalGbp = (pkg.totalLowGbp + pkg.totalHighGbp) / 2;

  const delta = dvcTotalGbp !== null ? packageTotalGbp - dvcTotalGbp : null;

  return (
    <div className="kpi-row">
      <div className="stat-tile">
        <div className="stat-label">DVC, this trip</div>
        <div className="stat-value series-dvc">{dvcTotalGbp !== null ? gbp(dvcTotalGbp) : "—"}</div>
      </div>
      <div className="stat-tile">
        <div className="stat-label">Package, this trip</div>
        <div className="stat-value series-package">{gbp(packageTotalGbp)}</div>
      </div>
      <div className="stat-tile">
        <div className="stat-label">{delta !== null && delta >= 0 ? "DVC saves" : "Package saves"}</div>
        <div className="stat-value">{delta !== null ? gbp(Math.abs(delta)) : "—"}</div>
      </div>
      <div className="stat-tile">
        <div className="stat-label">Break-even (30yr horizon)</div>
        <div className="stat-value">
          {breakEvenYear === null ? "Never" : breakEvenYear === undefined ? "—" : `Year ${breakEvenYear}`}
        </div>
      </div>
    </div>
  );
}
