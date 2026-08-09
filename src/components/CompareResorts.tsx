import { useState } from "react";
import type { PointsChart, RoomType, ViewType } from "../lib/types";
import { calculateDvcTripCost, findSeasonForDate, ROOM_TYPE_LABELS } from "../lib/calculations";
import { pointsCharts, dues, schoolHolidayData, transportToParks } from "../lib/data";
import { directPriceForResort, isResaleRestricted, resalePriceMidpointForResort } from "../lib/resortHelpers";
import { ALL_DESTINATIONS } from "../lib/parks";

interface TransportInfo {
  primary: Record<string, string>;
  bus: string[];
  notes: string;
}

const DEFAULT_WINDOW = "Summer holidays 2026";
const WEEKLY_REFERENCE_NIGHTS = 7;

/** A holiday window can span more than one of a resort's points-chart
 * seasons (e.g. "Summer holidays 2026" runs into September, which is Low
 * Season at some resorts) - walking every day in the window and collecting
 * each day's points/night, rather than matching only the window's start
 * date, is what actually captures that range instead of hiding it behind
 * one single (and sometimes unrepresentative) season. */
function pointsStatsForWindow(
  chart: PointsChart,
  roomType: RoomType,
  view: ViewType,
  startIso: string,
  endIso: string,
): { min: number; max: number; average: number } | null {
  const start = new Date(`${startIso}T00:00:00Z`);
  const end = new Date(`${endIso}T00:00:00Z`);
  const values: number[] = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const seasonName = findSeasonForDate(chart, d.toISOString().slice(0, 10));
    if (!seasonName) continue;
    try {
      const result = calculateDvcTripCost({
        chart,
        seasonName,
        roomType,
        view,
        nights: 1,
        duesPerPoint: 0,
        purchasePricePerPoint: 0,
        amortizationYears: 1,
      });
      values.push(result.pointsPerNight);
    } catch {
      // room type/view not available at this resort - skip this day
    }
  }
  if (values.length === 0) return null;
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((a, b) => a + b, 0) / values.length,
  };
}

export function CompareResorts() {
  const [holidayWindowName, setHolidayWindowName] = useState(DEFAULT_WINDOW);
  const [roomType, setRoomType] = useState<RoomType>("studio");
  const [view, setView] = useState<ViewType>("standard");

  const activeWindow = schoolHolidayData.holidayWindows.find((w) => w.name === holidayWindowName);

  const pointsRows = pointsCharts.map((chart) => ({
    resort: chart.resort,
    region: chart.region,
    stats: activeWindow
      ? pointsStatsForWindow(chart, roomType, view, activeWindow.start, activeWindow.end)
      : null,
  }));

  const sortedPointsRows = [...pointsRows].sort((a, b) => {
    if (a.stats === null && b.stats === null) return 0;
    if (a.stats === null) return 1;
    if (b.stats === null) return -1;
    return a.stats.average - b.stats.average;
  });

  const priceRows = pointsCharts.map((chart) => ({
    resort: chart.resort,
    region: chart.region,
    duesPerPoint: (dues.duesPerPoint as Record<string, number>)[chart.resort],
    directPerPoint: directPriceForResort(chart.resort),
    resalePerPoint: resalePriceMidpointForResort(chart.resort),
    restricted: isResaleRestricted(chart.resort),
  }));

  return (
    <>
      <div className="card">
        <h2>Points per night, by resort</h2>
        <p className="card-desc">
          {activeWindow
            ? `${activeWindow.name} (${activeWindow.start} to ${activeWindow.end})`
            : "Pick a holiday window"}{" "}
          - range and average are computed across every day in that window, not just its start date, since a window
          can span more than one points season at a resort (this window's real length varies by term dates - some
          windows are a week, some are the whole summer). A resort with no season data covering any day in the
          window, or where this room type/view isn't available, shows "—" rather than a guess. Sorted cheapest first
          by average.
        </p>
        <div className="chip-row">
          <label className="filter-label">
            Holiday window
            <select value={holidayWindowName} onChange={(e) => setHolidayWindowName(e.target.value)}>
              {schoolHolidayData.holidayWindows.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-label">
            Room type
            <select value={roomType} onChange={(e) => setRoomType(e.target.value as RoomType)}>
              {(Object.entries(ROOM_TYPE_LABELS) as [RoomType, string][]).map(([rt, label]) => (
                <option key={rt} value={rt}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-label">
            View
            <select value={view} onChange={(e) => setView(e.target.value as ViewType)}>
              <option value="standard">Standard</option>
              <option value="preferred">Preferred</option>
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Resort</th>
                <th>Region</th>
                <th className="num">Points/night (range)</th>
                <th className="num">Points/night (avg)</th>
                <th className="num">Points for {WEEKLY_REFERENCE_NIGHTS} nights (avg)</th>
              </tr>
            </thead>
            <tbody>
              {sortedPointsRows.map((r) => (
                <tr key={r.resort}>
                  <td>{r.resort}</td>
                  <td>{r.region}</td>
                  <td className="num">
                    {r.stats
                      ? r.stats.min === r.stats.max
                        ? r.stats.min.toFixed(1)
                        : `${r.stats.min.toFixed(1)}–${r.stats.max.toFixed(1)}`
                      : "—"}
                  </td>
                  <td className="num">{r.stats ? r.stats.average.toFixed(1) : "—"}</td>
                  <td className="num">
                    {r.stats ? Math.round(r.stats.average * WEEKLY_REFERENCE_NIGHTS) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="field-hint">
          "—" means this room type/view isn't available at that resort (see that resort's own `note` in
          DATA_SOURCES.md for known extraction gaps), or no season in its chart covers any day in the window. The
          range column only shows two figures when the window crosses a season boundary at that resort - a single
          number means the whole window falls in one season there.
        </p>
      </div>

      <div className="card">
        <h2>Transport to the parks, by resort</h2>
        <p className="card-desc">
          Every resort's real transport mode(s) to every park it can reach. Disney's rule: a bus never duplicates a
          resort's direct route (monorail/Skyliner/boat/walking) to the same park - "Bus" below means that's the
          only way there.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Resort</th>
                {ALL_DESTINATIONS.map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pointsCharts.map((chart) => {
                const info = (transportToParks.resorts as Record<string, TransportInfo>)[chart.resort];
                return (
                  <tr key={chart.resort}>
                    <td>{chart.resort}</td>
                    {ALL_DESTINATIONS.map((d) => {
                      if (!info) return <td key={d}>—</td>;
                      const mode = info.primary[d] ?? (info.bus.includes(d) ? "Bus" : null);
                      return <td key={d}>{mode ?? "—"}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="field-hint">
          Aulani, Hilton Head Island Resort, and Vero Beach aren't near any Disney theme park - shown as "—"
          throughout, that's real, not a data gap.
        </p>
      </div>

      <div className="card">
        <h2>Ownership cost per point, by resort</h2>
        <p className="card-desc">
          Annual dues and typical purchase price ($/point, USD) side by side for all 17 resorts. Resale figures are
          per-resort-<em>tier</em> midpoints where tracked, falling back to the blended market average otherwise -
          see DATA_SOURCES.md, not a live broker quote.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Resort</th>
                <th>Region</th>
                <th className="num">Dues $/pt/yr</th>
                <th className="num">Direct $/pt</th>
                <th className="num">Resale $/pt (approx)</th>
                <th>Resale-restricted</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((r) => (
                <tr key={r.resort}>
                  <td>{r.resort}</td>
                  <td>{r.region}</td>
                  <td className="num">{r.duesPerPoint !== undefined ? r.duesPerPoint.toFixed(2) : "—"}</td>
                  <td className="num">{r.directPerPoint.toFixed(0)}</td>
                  <td className="num">{r.resalePerPoint.toFixed(0)}</td>
                  <td>{r.restricted ? "Yes - resale locked to this resort" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
