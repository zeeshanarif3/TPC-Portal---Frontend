

import './UpcomingSchedule.css';

export default function UpcomingSchedule({ schedule = [], onViewAll }) {
  const rows = schedule.flatMap((item) =>
    Object.entries(item.slots || {}).flatMap(([day, slots]) =>
      slots.map((slot) => ({
        id: slot._id,
        course: item.course.courseCode,
        session: `${new Date(item.session.startDate).toLocaleDateString()} - ${new Date(
          item.session.endDate
        ).toLocaleDateString()}`,
        day: day.charAt(0).toUpperCase() + day.slice(1),
        time: `${slot.startTime} - ${slot.endTime}`,
      }))
    )
  );

  return (
    <div className="upcoming-Schedulle">
      <div className="upcoming-Schedulle__header">
        <h3 className="upcoming-Schedulle__title">
          Upcoming Schedule
        </h3>

        {/* <button
          className="upcoming-Schedulle__view-all"
          onClick={onViewAll}
        >
          View all
        </button> */}
      </div>

      <table className="upcoming-Schedulle__table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Session</th>
            <th>Day</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.course}</td>
                <td>{row.session}</td>
                <td>{row.day}</td>
                <td>{row.time}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                No upcoming schedule
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


// import './UpcomingSchedule.css';


// // UpcomingSchedule.jsx
// export default function UpcomingSchedule({ schedule, onViewAll }) {
//   return (
//     <div className="upcoming-Schedulle">
//       <div className="upcoming-Schedulle__header">
//         <h3 className="upcoming-Schedulle__title">Upcoming schedule</h3>
//         {/* <button className="upcoming-Schedulle__view-all" onClick={onViewAll}>
//           View all
//         </button> */}
//       </div>

//       <table className="upcoming-Schedulle__table">
//         <thead>
//           <tr>
//             <th>Trainer</th>
//             <th>Course</th>
//             <th>Day</th>
//             <th>Time</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {schedule.map((row) => (
//             <tr key={row.id}>
//               <td>{row.trainer}</td>
//               <td>{row.course}</td>
//               <td>{row.day}</td>
//               <td>{row.time}</td>
//               <td>
//                 <span className={`status-badge status-badge--${row.status.toLowerCase()}`}>
//                   {row.status}
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }