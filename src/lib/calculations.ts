import type {
  BreakEvenPoint,
  DvcTripCost,
  DvcTripInputs,
  PackageTripCost,
  PackageTripInputs,
  PointsValue,
  RoomType,
  ViewType,
} from "./types";

/** A points chart range collapses several view categories into [low, high] -
 * midpoint is a reasonable single-number estimate for comparison purposes. */
export function pointsToNumber(value: PointsValue): number {
  return Array.isArray(value) ? (value[0] + value[1]) / 2 : value;
}

function getPointsPerNight(
  inputs: Pick<DvcTripInputs, "chart" | "seasonName" | "roomType" | "view">,
): number {
  const { chart, seasonName, roomType, view } = inputs;
  const season = chart.seasons.find((s) => s.name === seasonName);
  if (!season) {
    throw new Error(`Season "${seasonName}" not found in ${chart.resort}'s points chart`);
  }
  const room = season.pointsPerNight[roomType];
  if (room === undefined) {
    throw new Error(`Room type "${roomType}" not available at ${chart.resort}`);
  }
  // threeBedroom is a bare PointsValue (no standard/preferred split) in the
  // source data; every other room type is split by view.
  const raw = roomType === "threeBedroom" ? (room as PointsValue) : (room as Record<ViewType, PointsValue | undefined>)[view];
  if (raw === undefined) {
    throw new Error(`View "${view}" not available for ${roomType} at ${chart.resort}`);
  }
  return pointsToNumber(raw);
}

/**
 * Cost of one trip, amortizing the one-time purchase price across
 * `amortizationYears` of taking this same trip annually - i.e. "if I buy
 * enough points for this exact trip and take it every year for N years,
 * what's this year's share of the purchase, plus this year's dues?"
 */
export function calculateDvcTripCost(inputs: DvcTripInputs): DvcTripCost {
  const pointsPerNight = getPointsPerNight(inputs);
  const totalPoints = pointsPerNight * inputs.nights;
  const duesCost = totalPoints * inputs.duesPerPoint;
  const amortizedPurchaseCost =
    (totalPoints * inputs.purchasePricePerPoint) / inputs.amortizationYears;
  return {
    pointsPerNight,
    totalPoints,
    duesCost,
    amortizedPurchaseCost,
    totalCost: duesCost + amortizedPurchaseCost,
  };
}

/**
 * Scales the source data's 14-night per-person range to the actual trip
 * length - linear scaling is a simplification (real package pricing isn't
 * perfectly linear per night), noted as such wherever this is shown.
 */
export function calculatePackageTripCost(inputs: PackageTripInputs): PackageTripCost {
  const nightlyLow = inputs.perPersonRange.low / inputs.packageNights;
  const nightlyHigh = inputs.perPersonRange.high / inputs.packageNights;
  return {
    totalLowGbp: nightlyLow * inputs.tripNights * inputs.partySize,
    totalHighGbp: nightlyHigh * inputs.tripNights * inputs.partySize,
  };
}

/**
 * Cumulative cost curves for buying DVC (one-time purchase + annual dues)
 * vs. always booking the package holiday instead, year by year.
 */
export function calculateBreakEven(
  dvcPurchaseCost: number,
  dvcAnnualDues: number,
  packageAnnualCost: number,
  years: number,
): BreakEvenPoint[] {
  const points: BreakEvenPoint[] = [];
  for (let year = 1; year <= years; year++) {
    points.push({
      year,
      cumulativeDvcCost: dvcPurchaseCost + dvcAnnualDues * year,
      cumulativePackageCost: packageAnnualCost * year,
    });
  }
  return points;
}

/** First year DVC's cumulative cost drops below the package's, or null if
 * it never does within the given curve. */
export function findBreakEvenYear(points: BreakEvenPoint[]): number | null {
  const crossover = points.find((p) => p.cumulativeDvcCost <= p.cumulativePackageCost);
  return crossover ? crossover.year : null;
}

/** DVC dues/purchase prices are USD; UK package prices are GBP - this
 * makes the conversion explicit rather than silently comparing the two. */
export function usdToGbp(usd: number, rate: number): number {
  return usd * rate;
}

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  studio: "Deluxe Studio",
  oneBedroom: "1-Bedroom Villa",
  twoBedroom: "2-Bedroom Villa",
  threeBedroom: "3-Bedroom Grand Villa",
  grandVilla: "Grand Villa",
};
