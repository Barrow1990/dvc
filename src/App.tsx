import { useState } from "react";
import "./App.css";
import { Assumptions, type AssumptionsState } from "./components/Assumptions";
import { TripComparison } from "./components/TripComparison";
import { BreakEvenChart } from "./components/BreakEvenChart";
import { HolidayCalendar } from "./components/HolidayCalendar";
import { dues, directPrices, fxRate } from "./lib/data";

const defaultState: AssumptionsState = {
  resortIndex: 0,
  seasonName: "Peak Season",
  roomType: "studio",
  view: "standard",
  nights: 7,
  adults: 2,
  children: 1,
  duesPerPoint: dues.duesPerPoint["Saratoga Springs"],
  purchaseType: "direct",
  purchasePricePerPoint: directPrices.generalRange.low,
  amortizationYears: 15,
  packageTier: "Moderate resort",
  usdToGbpRate: fxRate.usdToGbp,
  demandTier: "peak",
  estimatedDiningAndMerchSpendGbp: 300,
};

function App() {
  const [state, setState] = useState<AssumptionsState>(defaultState);

  return (
    <div className="app">
      <header>
        <h1>DVC decision dashboard</h1>
        <p className="muted">
          No DVC contract owned yet - this compares buying in vs. a UK package holiday, for
          real trips during real school holiday windows. See{" "}
          <a href="https://github.com/Barrow1990/dvc/blob/main/DATA_SOURCES.md">
            DATA_SOURCES.md
          </a>{" "}
          for where every number comes from.
        </p>
      </header>

      <Assumptions state={state} onChange={setState} />
      <TripComparison state={state} />
      <BreakEvenChart state={state} years={20} />
      <HolidayCalendar />
    </div>
  );
}

export default App;
