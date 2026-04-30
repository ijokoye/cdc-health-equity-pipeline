// Scatter plot: SVI score (x) vs obesity rate (y) for each county.
// Each dot is one county. The dashed reference lines mark the high-risk thresholds
// (SVI >= 0.8, obesity >= 40) so the top-right quadrant clearly shows high-risk counties.
// Props: data — array of { location_name, state_abbr, svi, obesity }

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// Custom tooltip shows county name, state, and both metric values
function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", fontSize: "0.875rem" }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.location_name}, {d.state_abbr}</p>
      <p>SVI: <strong>{d.svi}</strong></p>
      <p>avg_health_outcomes: <strong>{d.avg_health_outcome}%</strong></p>
    </div>
  );
}

function SVIScatterPlot({ data }) {
  if (!data || data.length === 0) {
    return <p className="empty-message">No data to display.</p>;
  }

  return (
    <section className="chart-section">
      <h2>SVI vs Avg Health Outcome by County</h2>
      <p className="section-subtitle">
        Each dot is one county — top-right quadrant (SVI ≥ 0.8) are high-risk
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <XAxis
            dataKey="svi"
            type="number"
            domain={[0, 1]}
            name="SVI Score"
            label={{ value: "SVI Score", position: "insideBottomRight", offset: -8, fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            dataKey="avg_health_outcome"
            type="number"
            name="Avg Outcome"
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />

          {/* Dashed lines mark the high-risk thresholds */}
          <ReferenceLine x={0.8} stroke="#dc2626" strokeDasharray="4 3" label={{ value: "SVI 0.8", position: "top", fontSize: 11, fill: "#dc2626" }} />
          <ReferenceLine y={40}  stroke="#dc2626" strokeDasharray="4 3" label={{ value: "40%", position: "right", fontSize: 11, fill: "#dc2626" }} />

          <Scatter data={data} fill="#1d4ed8" opacity={0.65} />
        </ScatterChart>
      </ResponsiveContainer>
    </section>
  );
}

export default SVIScatterPlot;
