// Bar chart showing how many counties exist per state.
// Uses the full (unfiltered) dataset so the chart always shows the big picture.
// Props: data (array of { location_name, state_abbr })

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function CountyBarChart({ data }) {
  // Count how many counties belong to each state
  const countsByState = data.reduce((acc, row) => {
    const state = row.state_abbr;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});

  // Convert to array format that Recharts expects: [{ state: "CA", count: 58 }, ...]
  const chartData = Object.entries(countsByState)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count); // sort highest to lowest

  if (chartData.length === 0) {
    return <p className="empty-message">No data to display.</p>;
  }

  return (
    <section className="chart-section">
      <h2>Counties per State</h2>
      <p className="section-subtitle">Total counties in the dataset, grouped by state</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
          {/* rotated labels so state abbreviations don't overlap */}
          <XAxis dataKey="state" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value) => [`${value} counties`, "Count"]} />
          <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default CountyBarChart;
