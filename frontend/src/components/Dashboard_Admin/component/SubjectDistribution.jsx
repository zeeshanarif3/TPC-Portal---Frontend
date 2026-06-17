import "./SubjectDistribution.css";

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

      <div className="subject-distribution__content">
        {data.map((item) => {
          const percent = ((item.count / total) * 100).toFixed(1);

          return (
            <div
              key={item.subject}
              className="subject-distribution__row"
            >
              <div className="subject-distribution__top">
                <div className="subject-distribution__subject">
                  <span
                    className="subject-distribution__dot"
                    style={{
                      backgroundColor:
                        item.color || "#4f46e5",
                    }}
                  />

                  {item.subject}
                </div>

                <div className="subject-distribution__stats">
                  <span>{item.count}</span>
                  <span>{percent}%</span>
                </div>
              </div>

              <div className="subject-distribution__track">
                <div
                  className="subject-distribution__fill"
                  style={{
                    width: `${percent}%`,
                    backgroundColor:
                      item.color || "#4f46e5",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}