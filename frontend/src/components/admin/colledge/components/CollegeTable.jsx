import {
  Eye,
  Pencil,
  Archive,
  Trash2
} from "lucide-react";

import "./CollegeTable.css";

export default function CollegeTable({
  colleges,
  selectedColleges,
  onSelectCollege,
  onSelectAll,
  onDelete,
  onArchive,
  onRefresh,
}) {
  const handleDelete = async (collegeId) => {
    if (window.confirm("Are you sure you want to delete this college?")) {
      await onDelete(collegeId);
      onRefresh();
    }
  };

  const handleArchive = async (collegeId) => {
    await onArchive(collegeId);
    onRefresh();
  };

  return (
    <div className="college-table-container">
      <table className="college-table">
        <thead>
          <tr>
            <th className="checkbox-column">
              <input
                type="checkbox"
                checked={
                  colleges.length > 0 &&
                  selectedColleges.length === colleges.length
                }
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>

            <th>COLLEGE NAME</th>
            <th>COLLEGE ID</th>
            <th>COURSES</th>
            <th>TRAINERS</th>
            <th>ACTIVE SESSION</th>
            <th>STATUS</th>
            <th className="actions-column">ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {colleges.map((college) => (
            <tr key={college.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedColleges.includes(college.id)}
                  onChange={() => onSelectCollege(college.id)}
                />
              </td>

              <td className="college-name">
                {college.name}
              </td>

              <td className="college-id">
                {college.id}
              </td>

              <td>
                {college.courses}
              </td>

              <td>
                {college.trainers}
              </td>

              <td>
                {college.activeSession || "—"}
              </td>

              <td>
                <span
                  className={`status-badge status-${college.status.toLowerCase()}`}
                >
                  {college.status}
                </span>
              </td>

              <td className="college-actions">
                <button
                  className="btn-action btn-view"
                  title="View College"
                  onClick={() =>
                    (window.location.href = `/college/${college.id}`)
                  }
                >
                  <Eye />
                </button>

                <button
                  className="btn-action btn-edit"
                  title="Edit College"
                  onClick={() =>
                    (window.location.href = `/college/${college.id}/edit`)
                  }
                >
                  <Pencil />
                </button>

                <button
                  className="btn-action btn-archive"
                  title="Archive College"
                  onClick={() => handleArchive(college.id)}
                >
                  <Archive />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete College"
                  onClick={() => handleDelete(college.id)}
                >
                  <Trash2 />
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