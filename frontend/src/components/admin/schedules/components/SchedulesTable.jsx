import './SchedulesTable.css'


export default function SchedulesTable({ schedules, onDelete, onRefresh }) {
  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule slot?')) {
      await onDelete(scheduleId);
      onRefresh();
    }
  };

  return (
    <div className="schedules-table-container">
      <table className="schedules-table">
        <thead>
          <tr>
            <th>COURSE</th>
            <th>TRAINER</th>
            <th>DAY</th>
            <th>TIME SLOT</th>
            <th>SESSION</th>
            <th>COLLEGE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td className="schedule-course">{schedule.course}</td>
              <td className="schedule-trainer">{schedule.trainer}</td>
              <td className="schedule-day">{schedule.day}</td>
              <td className="schedule-time">{schedule.timeSlot}</td>
              <td className="schedule-session">{schedule.session}</td>
              <td className="schedule-college">{schedule.college}</td>
              <td className="schedule-actions">
                <button
                  className="btn-action btn-edit"
                  onClick={() => window.location.href = `/schedules/${schedule.id}/edit`}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(schedule.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {schedules.length === 0 && <p className="no-data">No schedules found</p>}
    </div>
  );
}