import "./SessionsTable.css";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function SessionsTable({
  sessions,
  onDelete,
  onRefresh,
}) {
  const handleDelete = async (sessionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this session?"
      )
    ) {
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
            <th className="actions-column">
              ACTIONS
            </th>
          </tr>
        </thead>

        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td className="session-id">
                {session.id}
              </td>

              <td className="session-college">
                {session.college}
              </td>

              <td>
                {session.startDate}
              </td>

              <td>
                {session.endDate}
              </td>

              <td>
                {session.courses}
              </td>

              <td>
                <span
                  className={`status-badge status-${session.status.toLowerCase()}`}
                >
                  {session.status}
                </span>
              </td>

              <td className="session-actions">
                <button
                  className="btn-action btn-view"
                  title="View Session"
                  onClick={() =>
                    (window.location.href = `/sessions/${session.id}`)
                  }
                >
                  <Eye />
                </button>

                <button
                  className="btn-action btn-edit"
                  title="Edit Session"
                  onClick={() =>
                    (window.location.href = `/sessions/${session.id}/edit`)
                  }
                >
                  <Pencil />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete Session"
                  onClick={() =>
                    handleDelete(session.id)
                  }
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sessions.length === 0 && (
        <div className="no-data">
          No sessions found
        </div>
      )}
    </div>
  );
}