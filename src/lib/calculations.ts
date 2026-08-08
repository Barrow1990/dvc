import type {
  BreakEvenPoint,
  DemandTier,
  DvcTripCost,
  DvcTripInputs,
  FlightsCost,
  FullDvcTripCostGbp,
  PackageTripCost,
  PackageTripInputs,
  PointsChart,
  PointsValue,
  RoomType,
  TicketsCost,
  ViewType,
} from "./types";

/** A points chart range collapses several view categories into [low, high] -
 * midpoint is a reasonable single-number estimate for comparison purposes. */
export function pointsToNumber(value: PointsValue): number {
  return Array.isArray(value) ? (value[0] + value[1]) / 2 : value;
}

const MONTH_INDEX: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseDateRangeBound(part: string, fallbackMonth: number): { month: number; day: number } {
  const match = part.trim().match(/^([A-Za-z]{3})?\s*(\d{1,2})$/);
  if (!match) throw new Error(`Cannot parse date range bound "${part}"`);
  const month = match[1] ? MONTH_INDEX[match[1]] : fallbackMonth;
  return { month, day: Number(match[2]) };
}

/** Every points chart's dateRanges strings look like "Mar 21-28" or
 * "Feb 16-Mar 20" - no cross-year wraparound in this dataset (a season
 * spanning Dec into Jan is always two separate range strings, e.g.
 * ["Mar 21-28", "Dec 24-31"], never "Dec 24-Jan 5"), so a simple
 * (month, day) tuple comparison is enough. */
function dateRangeContainsMonthDay(range: string, month: number, day: number): boolean {
  const [startPart, endPart] = range.split("-");
  const start = parseDateRangeBound(startPart, -1);
  const end = parseDateRangeBound(endPart, start.month);
  const cmp = (a: { month: number; day: number }, b: { month: number; day: number }) =>
    a.month - b.month || a.day - b.day;
  return cmp({ month, day }, start) >= 0 && cmp({ month, day }, end) <= 0;
}

/** Maps a real calendar date (e.g. a school holiday window's start date)
 * onto whichever of this resort's own points-chart seasons contains it.
 * A holiday window that spans two seasons (e.g. Christmas holidays
 * crossing from one points season into the next) is matched against its
 * START date only - a deliberate simplification, not a bug. */
export function findSeasonForDate(chart: PointsChart, isoDate: string): string | null {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  for (const season of chart.seasons) {
    if (season.dateRanges.some((r) => dateRangeContainsMonthDay(r, month, day))) {
      return season.name;
    }
  }
  return null;
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
  const multiplier = inputs.demandMultiplier ?? 1;
  const nightlyLow = (inputs.perPersonRange.low * multiplier) / inputs.packageNights;
  const nightlyHigh = (inputs.perPersonRange.high * multiplier) / inputs.packageNights;
  return {
    totalLowGbp: nightlyLow * inputs.tripNights * inputs.partySize,
    totalHighGbp: nightlyHigh * inputs.tripNights * inputs.partySize,
  };
}

/**
 * DVC ownership only covers accommodation - flights and park tickets are
 * real costs on top of it that a package holiday already bundles in.
 * Scales the sourced family-of-4 baseline linearly by actual party size.
 */
export function calculateFlightsCost(
  familyOf4RangeGbp: { low: number; high: number },
  partySize: number,
): FlightsCost {
  const midpoint = (familyOf4RangeGbp.low + familyOf4RangeGbp.high) / 2;
  return { totalGbp: (midpoint / 4) * partySize };
}

/** UK-exclusive Magic Ticket, priced separately for adults and children,
 * since a DVC owner still has to buy park admission on top of the room. */
export function calculateTicketsCost(
  adultPriceByTier: Record<DemandTier, number>,
  childPriceByTier: Record<DemandTier, number>,
  tier: DemandTier,
  adults: number,
  children: number,
): TicketsCost {
  return { totalGbp: adultPriceByTier[tier] * adults + childPriceByTier[tier] * children };
}

/** Blue Card (Membership Extras) dining/merchandise discount - only real if
 * bought direct with >= 150 points; resale buyers get nothing here
 * regardless of contract size. Editable estimated spend since actual value
 * depends entirely on how much a family spends on dining/shopping. */
export function calculateBlueCardDiscount(
  isEligible: boolean,
  estimatedDiningAndMerchSpendGbp: number,
  discountPercent: number,
): number {
  if (!isEligible) return 0;
  return estimatedDiningAndMerchSpendGbp * (discountPercent / 100);
}

/** Combines DVC accommodation (converted to GBP) with flights and tickets
 * (already GBP) into one comparable total against a package holiday. */
export function calculateFullDvcTripCostGbp(
  dvcTripCost: DvcTripCost,
  flightsCost: FlightsCost,
  ticketsCost: TicketsCost,
  usdToGbpRate: number,
  blueCardDiscountGbp: number,
): FullDvcTripCostGbp {
  const accommodationGbp = usdToGbp(dvcTripCost.totalCost, usdToGbpRate);
  return {
    accommodationGbp,
    flightsGbp: flightsCost.totalGbp,
    ticketsGbp: ticketsCost.totalGbp,
    blueCardDiscountGbp,
    totalGbp:
      accommodationGbp + flightsCost.totalGbp + ticketsCost.totalGbp - blueCardDiscountGbp,
  };
}

/**
 * Cumulative cost curves for buying DVC (one-time purchase, plus dues +
 * flights + tickets paid every year this trip is taken) vs. always booking
 * the package holiday instead, year by year.
 */
export function calculateBreakEven(
  dvcPurchaseCost: number,
  dvcAnnualRecurringCost: number,
  packageAnnualCost: number,
  years: number,
): BreakEvenPoint[] {
  const points: BreakEvenPoint[] = [];
  for (let year = 1; year <= years; year++) {
    points.push({
      year,
      cumulativeDvcCost: dvcPurchaseCost + dvcAnnualRecurringCost * year,
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
