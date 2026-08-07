// A points value in the source charts is either a single number, or a
// [low, high] range (Animal Kingdom Villas' chart collapses its view
// categories into a range rather than breaking each one out). Typed as
// number[] rather than a tuple - JSON imports infer plain array types,
// and a tuple cast from that isn't type-safe.
export type PointsValue = number | number[];

export interface RoomPoints {
  studio?: { standard?: PointsValue; preferred?: PointsValue };
  oneBedroom?: { standard?: PointsValue; preferred?: PointsValue };
  twoBedroom?: { standard?: PointsValue; preferred?: PointsValue };
  threeBedroom?: PointsValue;
  grandVilla?: { standard?: PointsValue; preferred?: PointsValue };
}

export interface Season {
  name: string;
  dateRanges: string[];
  pointsPerNight: RoomPoints;
}

export interface PointsChart {
  resort: string;
  tier: string;
  source: string;
  fetchedAt: string;
  note: string;
  seasons: Season[];
}

export type RoomType = "studio" | "oneBedroom" | "twoBedroom" | "threeBedroom" | "grandVilla";
export type ViewType = "standard" | "preferred";
export type DemandTier = "low" | "regular" | "peak";
export type PurchaseType = "direct" | "resale";

export interface FlightsCostInputs {
  tier: DemandTier;
  partySize: number;
}

export interface TicketsCostInputs {
  tier: DemandTier;
  adults: number;
  children: number;
}

export interface DvcTripInputs {
  chart: PointsChart;
  seasonName: string;
  roomType: RoomType;
  view: ViewType;
  nights: number;
  duesPerPoint: number;
  purchasePricePerPoint: number;
  amortizationYears: number;
}

export interface DvcTripCost {
  pointsPerNight: number; // midpoint used when the source is a range
  totalPoints: number;
  duesCost: number; // USD
  amortizedPurchaseCost: number; // USD
  totalCost: number; // USD accommodation only - duesCost + amortizedPurchaseCost
}

export interface FlightsCost {
  totalGbp: number; // scaled from the family-of-4 baseline by party size
}

export interface TicketsCost {
  totalGbp: number; // adults + children priced separately
}

export interface FullDvcTripCostGbp {
  accommodationGbp: number;
  flightsGbp: number;
  ticketsGbp: number;
  blueCardDiscountGbp: number; // negative-facing - subtracted from the total, 0 if not eligible
  totalGbp: number;
}

export interface PackageTripInputs {
  perPersonRange: { low: number; high: number };
  partySize: number;
  packageNights: number; // the 14-night baseline the source data uses
  tripNights: number; // the actual trip length being compared
}

export interface PackageTripCost {
  totalLowGbp: number;
  totalHighGbp: number;
}

export interface BreakEvenPoint {
  year: number;
  cumulativeDvcCost: number;
  cumulativePackageCost: number;
}
