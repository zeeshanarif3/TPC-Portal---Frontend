import "./SchedulesTable.css";
import { Pencil, Trash2 } from "lucide-react";

export default function SchedulesTable({
  schedules,
  onDelete,
  onRefresh,
  setUpdateScheduledata,
  setshowUpdateSchedule
}) {
  const handleDelete = async (scheduleId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this schedule?"
      )
    ) {
      await onDelete(scheduleId);
      onRefresh();
    }
  };

  const rows = schedules.flatMap((schedule) =>
    Object.entries(schedule.slots || {}).flatMap(([day, slots]) =>
      slots.map((slot) => ({
        id: slot._id,
        scheduleId: schedule._id,
        course: schedule.courseId?.courseCode || "-",
        session: schedule.sessionId
          ? `${new Date(schedule.sessionId.startDate).toLocaleDateString()} - ${new Date(
              schedule.sessionId.endDate
            ).toLocaleDateString()}`
          : "-",
        college: schedule.college?.collegeName || "-",
        trainer: schedule.trainer?.name || "-",
        day: day.charAt(0).toUpperCase() + day.slice(1),
        timeSlot: `${slot.startTime} - ${slot.endTime}`,
      }))
    )
  );

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
          {rows.map((schedule) => (
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
                  // onClick={() =>
                  //   (window.location.href = `/schedules/${schedule.scheduleId}/edit`)
                  // }
                  onClick={() =>
                    {
                      setUpdateScheduledata(schedule);
                      setshowUpdateSchedule(true);
                    }
                  }
                >
                  <Pencil />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete Schedule"
                  onClick={() =>
                    handleDelete(schedule.scheduleId)
                  }
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="no-data">
          No schedules found
        </div>
      )}
    </div>
  );
}



// import "./SchedulesTable.css";

// import {
//   Pencil,
//   Trash2,
// } from "lucide-react";

// export default function SchedulesTable({
//   schedules,
//   onDelete,
//   onRefresh,
// }) {
//   const handleDelete = async (scheduleId) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this schedule slot?"
//       )
//     ) {
//       await onDelete(scheduleId);
//       onRefresh();
//     }
//   };

//   return (
//     <div className="schedules-table-container">
//       <table className="schedules-table">
//         <thead>
//           <tr>
//             <th>COURSE</th>
//             <th>TRAINER</th>
//             <th>DAY</th>
//             <th>TIME SLOT</th>
//             <th>SESSION</th>
//             <th>COLLEGE</th>
//             <th className="actions-column">
//               ACTIONS
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {schedules.map((schedule) => (
//             <tr key={schedule.id}>
//               <td className="schedule-course">
//                 {schedule.course}
//               </td>

//               <td className="schedule-trainer">
//                 {schedule.trainer}
//               </td>

//               <td className="schedule-day">
//                 {schedule.day}
//               </td>

//               <td className="schedule-time">
//                 {schedule.timeSlot}
//               </td>

//               <td className="schedule-session">
//                 {schedule.session}
//               </td>

//               <td className="schedule-college">
//                 {schedule.college}
//               </td>

//               <td className="schedule-actions">
//                 <button
//                   className="btn-action btn-edit"
//                   title="Edit Schedule"
//                   onClick={() =>
//                     (window.location.href = `/schedules/${schedule.id}/edit`)
//                   }
//                 >
//                   <Pencil />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete Schedule"
//                   onClick={() =>
//                     handleDelete(schedule.id)
//                   }
//                 >
//                   <Trash2 />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {schedules.length === 0 && (
//         <div className="no-data">
//           No schedules found
//         </div>
//       )}
//     </div>
//   );
// }