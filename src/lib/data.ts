import duesData from "../data/dues-2026.json";
import resaleData from "../data/resale-prices-2026.json";
import directData from "../data/direct-prices-2026.json";
import packageData from "../data/package-holidays-2026.json";
import saratogaSprings from "../data/points-charts/saratoga-springs.json";
import animalKingdomVillas from "../data/points-charts/animal-kingdom-villas.json";
import polynesian from "../data/points-charts/polynesian-villas-bungalows.json";
import schoolHolidays from "../data/school-holidays/moorland-school.json";
import fxRateData from "../data/fx-rate.json";
import flightsData from "../data/flights-2026.json";
import ticketsData from "../data/park-tickets-2026.json";
import perksData from "../data/direct-vs-resale-perks-2026.json";
import contractExpirationsData from "../data/contract-expirations.json";
import closingCostsData from "../data/closing-costs.json";
import type { PointsChart } from "./types";

export const dues = duesData;
export const resalePrices = resaleData;
export const directPrices = directData;
export const packageHolidays = packageData;
export const schoolHolidayData = schoolHolidays;
export const fxRate = fxRateData;
export const flights = flightsData;
export const parkTickets = ticketsData;
export const directVsResalePerks = perksData;
export const contractExpirations = contractExpirationsData;
export const closingCosts = closingCostsData;

export const pointsCharts: PointsChart[] = [
  saratogaSprings as PointsChart,
  animalKingdomVillas as PointsChart,
  polynesian as PointsChart,
];
