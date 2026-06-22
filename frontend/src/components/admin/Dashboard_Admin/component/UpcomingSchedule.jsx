
import './UpcomingSchedule.css';


// UpcomingSchedule.jsx
export default function UpcomingSchedule({ schedule, onViewAll }) {
  return (
    <div className="upcoming-Schedulle">
      <div className="upcoming-Schedulle__header">
        <h3 className="upcoming-Schedulle__title">Upcoming schedule</h3>
        {/* <button className="upcoming-Schedulle__view-all" onClick={onViewAll}>
          View all
        </button> */}
      </div>

      <table className="upcoming-Schedulle__table">
        <thead>
          <tr>
            <th>Trainer</th>
            <th>Course</th>
            <th>Day</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr key={row.id}>
              <td>{row.trainer}</td>
              <td>{row.course}</td>
              <td>{row.day}</td>
              <td>{row.time}</td>
              <td>
                <span className={`status-badge status-badge--${row.status.toLowerCase()}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}