
import './UpcomingSchedule.css';


// UpcomingSchedule.jsx
export default function UpcomingSchedule({ schedule, onViewAll }) {
  return (
    <div className="upcoming-schedule">
      <div className="upcoming-schedule__header">
        <h3 className="upcoming-schedule__title">Upcoming schedule</h3>
        {/* <button className="upcoming-schedule__view-all" onClick={onViewAll}>
          View all
        </button> */}
      </div>

      <table className="upcoming-schedule__table">
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