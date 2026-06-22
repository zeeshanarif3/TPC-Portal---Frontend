
import './AttendanceTable.css'





export default function AttendanceTable({ attendance, onDelete, onRefresh }) {
  const handleDelete = async (attendanceId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      await onDelete(attendanceId);
      onRefresh();
    }
  };

  const getPercentageClass = (percentage) => {
    const num = parseInt(percentage);
    if (num >= 75) return 'percentage-good';
    if (num >= 50) return 'percentage-warning';
    return 'percentage-low';
  };

  return (
    <div className="attendance-table-container">
      <table className="attendance-table">
        <thead>
          <tr>
            <th>DATE</th>
            <th>TIME</th>
            <th>COURSE</th>
            <th>SESSION</th>
            <th>HEAD COUNT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record.id}>
              <td className="attendance-date">{record.date}</td>
              <td className="attendance-time">{record.time}</td>
              <td className="attendance-course">{record.course}</td>
              <td className="attendance-session">{record.session}</td>
              <td>
                <div className="head-count-wrapper">
                  <span className="head-count">{record.headCount}</span>
                  <span className={`percentage ${getPercentageClass(record.percentage)}`}>
                    {record.percentage}
                  </span>
                </div>
              </td>
              <td className="attendance-actions">
                <button
                  className="btn-action btn-view"
                  onClick={() => window.location.href = `/attendance/${record.id}`}
                  title="View"
                >
                  👁️
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={() => window.location.href = `/attendance/${record.id}/edit`}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(record.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {attendance.length === 0 && <p className="no-data">No attendance records found</p>}
    </div>
  );
}