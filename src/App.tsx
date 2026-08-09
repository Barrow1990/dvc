import { useEffect, useState } from "react";
import "./App.css";
import { Assumptions, type AssumptionsState } from "./components/Assumptions";
import { StatTiles } from "./components/StatTiles";
import { TripComparison } from "./components/TripComparison";
import { BreakEvenChart } from "./components/BreakEvenChart";
import { HolidayCalendar } from "./components/HolidayCalendar";
import { Transport } from "./components/Transport";
import { CompareResorts } from "./components/CompareResorts";
import { dues, directPrices, fxRate, pointsCharts } from "./lib/data";

const TABS = [
  { id: "planner", label: "Trip planner" },
  { id: "compare", label: "Compare resorts" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const DEFAULT_RESORT = "Saratoga Springs";

const defaultState: AssumptionsState = {
  resortIndex: pointsCharts.findIndex((c) => c.resort === DEFAULT_RESORT),
  holidayWindowName: "Summer holidays 2026",
  seasonName: "Peak Season",
  roomType: "studio",
  view: "standard",
  nights: 7,
  adults: 2,
  children: 1,
  duesPerPoint: dues.duesPerPoint[DEFAULT_RESORT],
  purchaseType: "direct",
  purchasePricePerPoint: directPrices.perPointByResort[DEFAULT_RESORT],
  amortizationYears: 15,
  packageTier: "Moderate resort",
  usdToGbpRate: fxRate.usdToGbp,
  demandTier: "peak",
  estimatedDiningAndMerchSpendGbp: 300,
};

function App() {
  const [state, setState] = useState<AssumptionsState>(defaultState);
  const [tab, setTab] = useState<TabId>("planner");
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="intro">
          <h1>DVC decision dashboard</h1>
          <p className="muted">
            No DVC contract owned yet - this compares buying in vs. a UK package holiday, for
            real trips during real school holiday windows. See{" "}
            <a href="https://github.com/Barrow1990/dvc/blob/main/DATA_SOURCES.md">
              DATA_SOURCES.md
            </a>{" "}
            for where every number comes from.
          </p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </header>

      <nav className="tab-bar" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "tab active" : "tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "planner" ? (
        <div className="shell">
          <aside className="sidebar">
            <Assumptions state={state} onChange={setState} />
          </aside>

          <div className="results">
            <StatTiles state={state} />
            <TripComparison state={state} />
            <BreakEvenChart state={state} years={20} />
            <Transport resortIndex={state.resortIndex} />
            <HolidayCalendar />
          </div>
        </div>
      ) : (
        <div className="results compare-results">
          <CompareResorts />
        </div>
      )}
    </div>
  );
}

export default App;
