import { directPrices, directVsResalePerks, resalePrices, schoolHolidayData } from "./data";

/** Resale prices are only tracked per resort-tier, not every individual
 * resort - falls back to the blended market average when a specific
 * resort (e.g. Animal Kingdom Villas) isn't in that breakdown. Tier keys
 * like "Grand Floridian / Polynesian (premium)" bundle several resort
 * names together, so this checks whether the resort name contains any
 * of the tier key's slash-separated short names, not just an exact
 * substring match of the whole resort name against the whole tier key. */
export function resalePriceMidpointForResort(resort: string): number {
  const tierKey = Object.keys(resalePrices.rangesPerPointByResortTier).find((k) => {
    const shortNames = k
      .replace(/\(.*\)/, "")
      .split("/")
      .map((s) => s.trim());
    return shortNames.some((name) => resort.includes(name));
  }) as keyof typeof resalePrices.rangesPerPointByResortTier | undefined;
  if (tierKey) {
    const r = resalePrices.rangesPerPointByResortTier[tierKey];
    return (r.low + r.high) / 2;
  }
  return resalePrices.blendedAveragePerPoint;
}

export function directPriceForResort(resort: string): number {
  const specific = (directPrices.perPointByResort as Record<string, number>)[resort];
  if (specific !== undefined) return specific;
  return (directPrices.generalRange.low + directPrices.generalRange.high) / 2;
}

export function nightsAvailableInWindow(windowName: string): number {
  const w = schoolHolidayData.holidayWindows.find((h) => h.name === windowName);
  if (!w) return 0;
  const ms = new Date(`${w.end}T00:00:00Z`).getTime() - new Date(`${w.start}T00:00:00Z`).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** Word-set comparison, not exact string equality - the source restricted-
 * resorts list spells one entry "Villas at Disneyland Hotel" while this
 * app's own points-chart data calls the same resort "Disneyland Hotel
 * Villas" (word order differs, plus a stopword). An exact-match `.includes()`
 * against the raw array silently missed that resort. */
export function isResaleRestricted(resort: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z]/g, " ")
      .split(" ")
      .filter((w) => w && w !== "at" && w !== "the" && w !== "of")
      .sort()
      .join(" ");
  const target = normalize(resort);
  return (directVsResalePerks.resaleRestrictedResorts.resorts as string[]).some(
    (r) => normalize(r) === target,
  );
}
