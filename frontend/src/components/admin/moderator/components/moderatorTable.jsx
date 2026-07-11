import { Pencil, Trash2 } from "lucide-react";
import "./moderatorTable.css";

export default function ModeratorTable({
  moderator = [],
  onDelete,
  onRefresh,
  token,
  setShowUpdateModeratorPage,
  setUpdateModeratordata,
}) {
  const handleDelete = async (moderatorId) => {
    if (!onDelete) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this moderator?"
    );

    if (!confirmed) return;

    try {
      await onDelete(moderatorId,token);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to delete moderator:", err);
      alert("Failed to delete moderator.");
    }
  };

  return (
    <div className="moderator-table-container">
      <table className="moderator-table">
        <thead>
          <tr>
            <th>MODERATOR NAME</th>
            <th>EMAIL</th>
            <th>SPECIALITY</th>
            <th>MODERATOR ID</th>
            <th>CREATED</th>
            <th className="actions-column">ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {moderator.map((item) => (
            <tr key={item._id}>
              <td className="moderator-name">
                {item.name || "—"}
              </td>

              <td>
                {item.userId?.email || "—"}
              </td>

              <td>
                {item.speciality || "—"}
              </td>

              <td className="moderator-id">
                {item._id}
              </td>

              <td>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "—"}
              </td>

              <td className="moderator-actions">
                <button
                  className="btn-action btn-edit"
                  title="Edit Moderator"
                  onClick={() =>
                    {
                      setUpdateModeratordata(item);
                      setShowUpdateModeratorPage(true);
                    }
                  }
                >
                  <Pencil size={18} />
                </button>

                {onDelete && (
                  <button
                    className="btn-action btn-delete"
                    title="Delete Moderator"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}

          {moderator.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div className="no-data">
                  No moderators found
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}