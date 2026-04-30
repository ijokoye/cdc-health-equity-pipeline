// Shows average obesity rate (%) for each SVI vulnerability bucket.
// The three buckets (Low / Medium / High) are computed in the backend query.
// Props: data — array of { vulnerability_level: string, avg_obesity: number }

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";

// Color per bucket so the chart communicates risk visually at a glance
const BUCKET_COLORS = {
  "Low Vulnerability":    "#16a34a",  // green
  "Medium Vulnerability": "#d97706",  // amber
  "High Vulnerability":   "#dc2626",  // red
};

// Custom tooltip so the value reads "38.2%" instead of just "38.2"
function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const { vulnerability_level, avg_obesity } = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", fontSize: "0.875rem" }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{vulnerability_level}</p>
      <p>Avg obesity rate: <strong>{avg_obesity}%</strong></p>
    </div>
  );
}

function ObesityBySVIChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="empty-message">Loading chart data…</p>;
  }

  return (
    <section className="chart-section">
      <h2>Obesity Rate by Vulnerability Level</h2>
      <p className="section-subtitle">
        Average age-adjusted adult obesity (%) grouped by Social Vulnerability Index
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
          barSize={64}
        >
          <XAxis dataKey="vulnerability_level" tick={{ fontSize: 13 }} />
          {/* Domain starts near the minimum so small differences are visible */}
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avg_obesity" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.vulnerability_level}
                fill={BUCKET_COLORS[entry.vulnerability_level] ?? "#6b7280"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default ObesityBySVIChart;
