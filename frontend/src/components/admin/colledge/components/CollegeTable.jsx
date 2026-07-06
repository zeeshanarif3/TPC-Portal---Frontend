import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import "./CollegeTable.css";

export default function CollegeTable({
  colleges = [],
  onDelete,
}) {
  const handleDelete = async (collegeId) => {
    if (window.confirm("Are you sure you want to delete this college?")) {
      await onDelete?.(collegeId);
    }
  };

  return (
    <div className="college-table-container">
      <table className="college-table">
        <thead>
          <tr>
            <th>COLLEGE</th>
            <th>LOCATION</th>
            <th>POINT OF CONTACT</th>
            <th>MODERATOR</th>
            <th>CREATED</th>
            <th className="actions-column">ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {colleges.map((college) => (
            <tr key={college._id}>
              <td className="college-name">
                <div>{college.name}</div>
                <small className="college-id">{college._id}</small>
              </td>

              <td>{college.location || "—"}</td>

              <td>{college.pointOfContact || "—"}</td>

              <td>
                <div>{college.moderatorId?.name || "—"}</div>
                <small>{college.moderatorId?.email}</small>
              </td>

              <td>
                {new Date(college.createdAt).toLocaleDateString()}
              </td>

              <td className="college-actions">
                <button
                  className="btn-action btn-view"
                  title="View"
                  onClick={() =>
                    (window.location.href = `/colleges/${college._id}`)
                  }
                >
                  <Eye size={18} />
                </button>

                <button
                  className="btn-action btn-edit"
                  title="Edit"
                  onClick={() =>
                    (window.location.href = `/colleges/${college._id}/edit`)
                  }
                >
                  <Pencil size={18} />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete"
                  onClick={() => handleDelete(college._id)}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {colleges.length === 0 && (
        <div className="no-data">
          No colleges found
        </div>
      )}
    </div>
  );
}