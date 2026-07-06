import "./SubjectDistribution.css";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Professional categorical color palette
const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#84CC16", // Lime
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#A855F7", // Purple
];

export default function SubjectDistribution({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="subject-distribution">
        <h3 className="subject-distribution__title">
          Subject Distribution
        </h3>

        <div className="subject-distribution__empty">
          No subject data available
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map((item, index) => ({
    name: item.subject,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="subject-distribution">
      <div className="subject-distribution__header">
        <h3 className="subject-distribution__title">
          Subject Distribution
        </h3>

        <span className="subject-distribution__total">
          {total} Sessions
        </span>
      </div>

      <div className="subject-distribution__chart">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [`${value} Sessions`, "Count"]}
            />

            <Legend
              verticalAlign="bottom"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}