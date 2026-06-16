// SubjectDistribution.jsx
export default function SubjectDistribution({ data }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="subject-distribution">
      <h3 className="subject-distribution__title">Subject distribution</h3>

      <ul className="subject-distribution__list">
        {data.map((item) => (
          <li key={item.subject} className="subject-distribution__item">
            <span className="subject-distribution__label">{item.subject}</span>

            <div className="subject-distribution__bar-track">
              <div
                className="subject-distribution__bar-fill"
                style={{
                  width: `${(item.count / max) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>

            <span className="subject-distribution__count">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}