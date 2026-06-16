// TrainersTable.jsx
export default function TrainersTable({ trainers }) {
  return (
    <div className="trainers-table">
      <h3 className="trainers-table__title">Trainers</h3>

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
              <td>{t.name}</td>
              <td>{t.subject}</td>
              <td>{t.contract}</td>
              <td>{t.sessions}</td>
              <td>
                <span className={`status-badge status-badge--${t.status.toLowerCase()}`}>
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