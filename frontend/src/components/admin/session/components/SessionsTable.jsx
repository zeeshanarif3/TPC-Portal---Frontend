import "./SessionsTable.css";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function SessionsTable({
  sessions = [],
  onDelete,
  onRefresh,
}) {
  const getSessionStatus = (session) => {
    const today = new Date();
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);

    if (today < start) return "Upcoming";
    if (today > end) return "Completed";
    return "Active";
  };

  const handleDelete = async (sessionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this session?"
      )
    ) {
      if (onDelete) {
        await onDelete(sessionId);
      }

      onRefresh?.();
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
          {sessions.map((session) => {
            const status = getSessionStatus(session);

            return (
              <tr key={session._id}>
                <td className="session-id">
                  {session._id}
                </td>

                <td className="session-college">
                  {session.collegeId?.name || "—"}
                </td>

                <td>
                  {new Date(
                    session.startDate
                  ).toLocaleDateString()}
                </td>

                <td>
                  {new Date(
                    session.endDate
                  ).toLocaleDateString()}
                </td>

                <td>
                  {session.courseIds?.length || 0}
                </td>

                <td>
                  <span
                    className={`status-badge status-${status.toLowerCase()}`}
                  >
                    {status}
                  </span>
                </td>

                <td className="session-actions">
                  <button
                    className="btn-action btn-view"
                    title="View Session"
                    onClick={() =>
                      (window.location.href = `/sessions/${session._id}`)
                    }
                  >
                    <Eye />
                  </button>

                  <button
                    className="btn-action btn-edit"
                    title="Edit Session"
                    onClick={() =>
                      (window.location.href = `/sessions/${session._id}/edit`)
                    }
                  >
                    <Pencil />
                  </button>

                  <button
                    className="btn-action btn-delete"
                    title="Delete Session"
                    onClick={() =>
                      handleDelete(session._id)
                    }
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            );
          })}
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