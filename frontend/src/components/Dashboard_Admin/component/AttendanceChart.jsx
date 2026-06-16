// AttendanceChart.jsx
// Lightweight bar chart — no external chart library needed.
// Swap for Recharts/Chart.js if you prefer.

export default function AttendanceChart({ data }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="attendance-chart">
      <div className="attendance-chart__header">
        <span className="attendance-chart__title">Daily record</span>
        <button className="attendance-chart__action">Book</button>
      </div>

      <div className="attendance-chart__bars">
        {data.map((d) => (
          <div key={d.day} className="attendance-chart__bar-group">
            <div className="attendance-chart__bar-wrap">
              <div
                className="attendance-chart__bar"
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="attendance-chart__day">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}