


import './CollegeTable.css';


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
    if (window.confirm('Are you sure you want to delete this college?')) {
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
            <th>
              <input
                type="checkbox"
                checked={colleges.length > 0 && selectedColleges.length === colleges.length}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th>COLLEGE NAME</th>
            <th>COLLEGE ID</th>
            <th>COURSES</th>
            <th>TRAINERS</th>
            <th>ACTIVE SESSION</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
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
              <td className="college-name">{college.name}</td>
              <td className="college-id">{college.id}</td>
              <td className="college-courses">{college.courses}</td>
              <td className="college-trainers">{college.trainers}</td>
              <td className="college-session">{college.activeSession || '—'}</td>
              <td>
                <span className={`status-badge status-${college.status.toLowerCase()}`}>
                  {college.status}
                </span>
              </td>
              <td className="college-actions">
                <button
                  className="btn-action btn-view"
                  onClick={() => window.location.href = `/college/${college.id}`}
                  title="View"
                >
                  👁️
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={() => window.location.href = `/college/${college.id}/edit`}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-action btn-archive"
                  onClick={() => handleArchive(college.id)}
                  title="Archive"
                >
                  📦
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(college.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {colleges.length === 0 && <p className="no-data">No colleges found</p>}
    </div>
  );
}