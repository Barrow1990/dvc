import duesData from "../data/dues-2026.json";
import resaleData from "../data/resale-prices-2026.json";
import directData from "../data/direct-prices-2026.json";
import packageData from "../data/package-holidays-2026.json";
import saratogaSprings from "../data/points-charts/saratoga-springs.json";
import animalKingdomVillas from "../data/points-charts/animal-kingdom-villas.json";
import polynesian from "../data/points-charts/polynesian-villas-bungalows.json";
import bayLakeTower from "../data/points-charts/bay-lake-tower.json";
import beachClubVillas from "../data/points-charts/beach-club-villas.json";
import boardwalkVillas from "../data/points-charts/boardwalk-villas.json";
import boulderRidgeVillas from "../data/points-charts/boulder-ridge-villas.json";
import copperCreek from "../data/points-charts/copper-creek-villas-and-cabins.json";
import grandFloridianVillas from "../data/points-charts/grand-floridian-villas.json";
import oldKeyWest from "../data/points-charts/old-key-west.json";
import rivieraResort from "../data/points-charts/riviera-resort.json";
import aulani from "../data/points-charts/aulani.json";
import disneylandHotelVillas from "../data/points-charts/disneyland-hotel-villas.json";
import grandCalifornianVillas from "../data/points-charts/grand-californian-villas.json";
import hiltonHeadIsland from "../data/points-charts/hilton-head-island.json";
import veroBeach from "../data/points-charts/vero-beach.json";
import cabinsAtFortWilderness from "../data/points-charts/cabins-at-fort-wilderness.json";
import schoolHolidays from "../data/school-holidays/moorland-school.json";
import fxRateData from "../data/fx-rate.json";
import flightsData from "../data/flights-2026.json";
import ticketsData from "../data/park-tickets-2026.json";
import perksData from "../data/direct-vs-resale-perks-2026.json";
import contractExpirationsData from "../data/contract-expirations.json";
import closingCostsData from "../data/closing-costs.json";
import transportData from "../data/transport-to-parks.json";
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
export const transportToParks = transportData;

export const pointsCharts: PointsChart[] = [
  saratogaSprings as PointsChart,
  animalKingdomVillas as PointsChart,
  polynesian as PointsChart,
  bayLakeTower as PointsChart,
  beachClubVillas as PointsChart,
  boardwalkVillas as PointsChart,
  boulderRidgeVillas as PointsChart,
  copperCreek as PointsChart,
  grandFloridianVillas as PointsChart,
  oldKeyWest as PointsChart,
  rivieraResort as PointsChart,
  aulani as PointsChart,
  disneylandHotelVillas as PointsChart,
  grandCalifornianVillas as PointsChart,
  hiltonHeadIsland as PointsChart,
  veroBeach as PointsChart,
  cabinsAtFortWilderness as PointsChart,
].sort((a, b) => a.resort.localeCompare(b.resort));
