import "./SchedulesTable.css";

import {
  Pencil,
  Trash2,
} from "lucide-react";

export default function SchedulesTable({
  schedules,
  onDelete,
  onRefresh,
}) {
  const handleDelete = async (scheduleId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this schedule slot?"
      )
    ) {
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
            <th className="actions-column">
              ACTIONS
            </th>
          </tr>
        </thead>

        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td className="schedule-course">
                {schedule.course}
              </td>

              <td className="schedule-trainer">
                {schedule.trainer}
              </td>

              <td className="schedule-day">
                {schedule.day}
              </td>

              <td className="schedule-time">
                {schedule.timeSlot}
              </td>

              <td className="schedule-session">
                {schedule.session}
              </td>

              <td className="schedule-college">
                {schedule.college}
              </td>

              <td className="schedule-actions">
                <button
                  className="btn-action btn-edit"
                  title="Edit Schedule"
                  onClick={() =>
                    (window.location.href = `/schedules/${schedule.id}/edit`)
                  }
                >
                  <Pencil />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete Schedule"
                  onClick={() =>
                    handleDelete(schedule.id)
                  }
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {schedules.length === 0 && (
        <div className="no-data">
          No schedules found
        </div>
      )}
    </div>
  );
}