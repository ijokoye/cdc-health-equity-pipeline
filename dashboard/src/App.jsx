import { useState, useEffect } from "react";
import "./App.css";
import MetricCards from "./components/MetricCards";
import FilterBar from "./components/FilterBar";
import DataTable from "./components/DataTable";
import ObesityBySVIChart from "./components/ObesityBySVIChart";
import SVIScatterPlot from "./components/SVIScatterPlot";

function App() {
  const [data, setData] = useState([]);
  const [sviChartData, setSviChartData] = useState([]);
  const [filter, setFilter] = useState("");
  const [scatterData, setScatterData] = useState([]);

  // Fetch raw county rows for the table
  useEffect(() => {
    fetch("http://localhost:3000/health-data")
      .then((response) => response.json())
      .then((result) => setData(result))
      .catch((error) => console.error("Fetch error:", error));
  }, []);

  // Fetch the 3-row aggregated data for the obesity-by-SVI chart
  useEffect(() => {
    fetch("http://localhost:3000/obesity-by-svi")
      .then((response) => response.json())
      .then((result) => setSviChartData(result))
      .catch((error) => console.error("Chart fetch error:", error));
  }, []);

  // Fetch the data for the health outcome-by-SVI chart
  useEffect(() => {
    fetch("http://localhost:3000/svi-vs-outcome")
      .then((response) => response.json())
      .then((result) => setScatterData(result))
      .catch((error) => console.error("Scatter Plot fetch error:", error));
  }, []);

  // Filter rows by state abbreviation (case-insensitive)
  const filteredData = data.filter((row) =>
    row.state_abbr.toLowerCase().includes(filter.toLowerCase())
  );

  // Count how many distinct states appear in the filtered results
  const uniqueStates = new Set(filteredData.map((row) => row.state_abbr)).size;

  // Find average obesity for what is displayed in the table
  const totalObesity = filteredData.reduce((sum, row) => sum + row.obesity, 0);
  const avgObesity = filteredData.length > 0 ? (totalObesity / filteredData.length).toFixed(1) : "--";

  // Average SVI across filtered counties
  const totalSVI = filteredData.reduce((sum, row) => sum + row.svi, 0);
  const avgSVI = filteredData.length > 0 ? (totalSVI / filteredData.length).toFixed(3) : "--";

  // High-risk: counties with SVI >= 0.8 AND obesity >= 40
  const highRiskCount = filteredData.filter((row) => row.svi >= 0.8 && row.obesity >= 40).length;


  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Health Equity Dashboard</h1>
        <p className="header-subtitle">County-level health and social vulnerability overview</p>
      </header>

      {/* Summary cards — real values for counts, placeholders for metrics not yet available */}
      <MetricCards
        countiesShown={filteredData.length}
        uniqueStates={uniqueStates}
        averageObesity={avgObesity}
        averageSVI={avgSVI}
        highRiskCount={highRiskCount}
      />

      {/* Two-column row: bar chart on the left, table on the right */}
      <div className="main-grid">
        <ObesityBySVIChart data={sviChartData} />

        <section className="table-section">
          <h2>County Data</h2>
          <p className="section-subtitle">{filteredData.length} counties shown</p>
          <FilterBar filter={filter} onFilterChange={setFilter} />
          <DataTable data={filteredData} />
        </section>
      </div>

      {/* Scatter plot — full width below so dots have space to spread out */}
      <SVIScatterPlot data={scatterData} />
    </div>
  );
}

export default App;
