import './TrainersTable.css';

export default function TrainersTable({ trainers }) {
  return (
    <div className="trainers-table">
      <div className="trainers-table__header">
        <h3 className="trainers-table__title">Trainers</h3>

        
      </div>

      <table className="trainers-table__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Subject</th>
            <th>Contract</th>
            <th>Sessions</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {trainers.map((t) => (
            <tr key={t.id}>
              <td className="trainer-name">{t.name}</td>

              <td>{t.subject}</td>

              <td>{t.contract}</td>

              <td>
                <span className="session-pill">
                  {t.sessions}
                </span>
              </td>

              <td>
                <span
                  className={`status-badge status-badge--${t.status.toLowerCase()}`}
                >
                  <span className="status-dot" />
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}