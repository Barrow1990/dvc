import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateBreakEven,
  calculateDvcTripCost,
  calculateFlightsCost,
  calculatePackageTripCost,
  calculateTicketsCost,
  findBreakEvenYear,
  usdToGbp,
} from "../lib/calculations";
import { pointsCharts, packageHolidays, flights, parkTickets } from "../lib/data";
import type { AssumptionsState } from "./Assumptions";

interface Props {
  state: AssumptionsState;
  years: number;
}

export function BreakEvenChart({ state, years }: Props) {
  const chart = pointsCharts[state.resortIndex];
  const partySize = state.adults + state.children;

  let dvc;
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
  } catch {
    return null;
  }

  const pkg = calculatePackageTripCost({
    perPersonRange: packageHolidays.perPersonGbp14Nights[state.packageTier],
    partySize,
    packageNights: 14,
    tripNights: state.nights,
  });
  const packageAnnualGbp = (pkg.totalLowGbp + pkg.totalHighGbp) / 2;

  const flightsCost = calculateFlightsCost(flights.familyOf4ReturnGbp[state.demandTier], partySize);
  const ticketsCost = calculateTicketsCost(
    parkTickets.fourteenDayMagicTicketGbp.adult,
    parkTickets.fourteenDayMagicTicketGbp.child,
    state.demandTier,
    state.adults,
    state.children,
  );

  // One-time purchase cost for enough points to cover this trip every year,
  // converted to GBP so the whole chart is in one currency.
  const purchaseCostGbp = usdToGbp(dvc.totalPoints * state.purchasePricePerPoint, state.usdToGbpRate);
  const annualDuesGbp = usdToGbp(dvc.duesCost, state.usdToGbpRate);
  const annualRecurringGbp = annualDuesGbp + flightsCost.totalGbp + ticketsCost.totalGbp;

  const points = calculateBreakEven(purchaseCostGbp, annualRecurringGbp, packageAnnualGbp, years);
  const breakEvenYear = findBreakEvenYear(points);

  return (
    <section>
      <h2>Break-even over time</h2>
      <p className="muted">
        Cumulative cost of buying DVC (one-time purchase, plus dues + flights + tickets paid
        every year) vs. always booking the package holiday instead, assuming this exact trip
        every year, all converted to GBP.{" "}
        {breakEvenYear
          ? `Break-even at year ${breakEvenYear}.`
          : `DVC doesn't break even within ${years} years at these assumptions.`}
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" label={{ value: "Years of ownership", position: "insideBottom", offset: -5 }} />
          <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(v) => `£${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          />
          <Legend />
          <Line type="monotone" dataKey="cumulativeDvcCost" name="DVC (cumulative)" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="cumulativePackageCost" name="Package holiday (cumulative)" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
