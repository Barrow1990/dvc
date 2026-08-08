import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateBlueCardDiscount,
  calculateBreakEven,
  calculateDvcTripCost,
  calculateFlightsCost,
  calculatePackageTripCost,
  calculateTicketsCost,
  findBreakEvenYear,
  usdToGbp,
} from "../lib/calculations";
import { pointsCharts, packageHolidays, flights, parkTickets, directVsResalePerks } from "../lib/data";
import type { AssumptionsState } from "./Assumptions";

interface Props {
  state: AssumptionsState;
  years: number;
}

const gbp = (n: number) => `£${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function endLabel(color: string, lastIndex: number) {
  // recharts' own label-render prop type is broader (RenderableText) than what it
  // actually passes at runtime for a Line - narrowed with Number()/index check
  // rather than fighting the library's types with an exact interface.
  return (props: Record<string, unknown>) => {
    const { x, y, index, value } = props;
    if (index !== lastIndex || x === undefined || y === undefined) return <g />;
    return (
      <text x={Number(x) + 8} y={Number(y)} dy={4} fill={color} fontSize={12} fontWeight={600}>
        {gbp(Number(value ?? 0))}
      </text>
    );
  };
}

export function BreakEvenChart({ state, years }: Props) {
  const chart = pointsCharts[state.resortIndex];
  const partySize = state.adults + state.children;
  const [showTable, setShowTable] = useState(false);

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

  // One-time purchase cost for enough points to cover this trip every year,
  // converted to GBP so the whole chart is in one currency.
  const purchaseCostGbp = usdToGbp(dvc.totalPoints * state.purchasePricePerPoint, state.usdToGbpRate);
  const annualDuesGbp = usdToGbp(dvc.duesCost, state.usdToGbpRate);
  const annualRecurringGbp =
    annualDuesGbp + flightsCost.totalGbp + ticketsCost.totalGbp - blueCardDiscountGbp;

  const points = calculateBreakEven(purchaseCostGbp, annualRecurringGbp, packageAnnualGbp, years);
  const breakEvenYear = findBreakEvenYear(points);
  const lastIndex = points.length - 1;

  return (
    <div className="card">
      <h2>Break-even over time</h2>
      <p className="card-desc">
        Cumulative cost of buying DVC (one-time purchase, plus dues + flights + tickets paid
        every year, less the Blue Card discount if buying direct) vs. always booking the
        package holiday instead, assuming this exact trip every year, all converted to GBP.{" "}
        {breakEvenYear
          ? `Break-even at year ${breakEvenYear}.`
          : `DVC doesn't break even within ${years} years at these assumptions.`}
      </p>

      <div className="chart-legend" role="list">
        <span role="listitem">
          <span className="swatch" style={{ background: "var(--series-dvc)" }} />
          DVC (cumulative)
        </span>
        <span role="listitem">
          <span className="swatch" style={{ background: "var(--series-package)" }} />
          Package holiday (cumulative)
        </span>
      </div>

      {!showTable ? (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={points} margin={{ top: 12, right: 64, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="var(--gridline)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="var(--baseline)"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickLine={false}
              label={{
                value: "Years of ownership",
                position: "insideBottom",
                offset: -4,
                fill: "var(--text-muted)",
                fontSize: 12,
              }}
            />
            <YAxis
              tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              stroke="var(--baseline)"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--text-primary)" }}
              formatter={(v) => gbp(Number(v))}
            />
            <Line
              type="monotone"
              dataKey="cumulativeDvcCost"
              name="DVC (cumulative)"
              stroke="var(--series-dvc)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: "var(--surface-card)", fill: "var(--series-dvc)" }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface-card)" }}
              label={endLabel("var(--series-dvc)", lastIndex) as never}
            />
            <Line
              type="monotone"
              dataKey="cumulativePackageCost"
              name="Package holiday (cumulative)"
              stroke="var(--series-package)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: "var(--surface-card)", fill: "var(--series-package)" }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface-card)" }}
              label={endLabel("var(--series-package)", lastIndex) as never}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th className="num">DVC cumulative</th>
              <th className="num">Package cumulative</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.year}>
                <td>{p.year}</td>
                <td className="num">{gbp(p.cumulativeDvcCost)}</td>
                <td className="num">{gbp(p.cumulativePackageCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button type="button" className="table-view-toggle" onClick={() => setShowTable((v) => !v)}>
        {showTable ? "Show chart" : "Show table"}
      </button>
    </div>
  );
}
