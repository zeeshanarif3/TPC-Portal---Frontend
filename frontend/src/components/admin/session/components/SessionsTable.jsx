


import './SessionsTable.css'


export default function SessionsTable({ sessions, onDelete, onRefresh }) {
  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      await onDelete(sessionId);
      onRefresh();
    }
  };

  return (
    <div className="sessions-table-container">
      <table className="sessions-table">
        <thead>
          <tr>
            <th>SESSION ID</th>
            <th>COLLEGE</th>
            <th>START DATE</th>
            <th>END DATE</th>
            <th>COURSES</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td className="session-id">{session.id}</td>
              <td className="session-college">{session.college}</td>
              <td className="session-start">{session.startDate}</td>
              <td className="session-end">{session.endDate}</td>
              <td className="session-courses">{session.courses}</td>
              <td>
                <span className={`status-badge status-${session.status.toLowerCase()}`}>
                  {session.status}
                </span>
              </td>
              <td className="session-actions">
                <button
                  className="btn-action btn-view"
                  onClick={() => window.location.href = `/sessions/${session.id}`}
                  title="View"
                >
                  👁️
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={() => window.location.href = `/sessions/${session.id}/edit`}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(session.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sessions.length === 0 && <p className="no-data">No sessions found</p>}
    </div>
  );
}