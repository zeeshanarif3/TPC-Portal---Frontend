import "./AttendanceTable.css";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function AttendanceTable({
  attendance,
  onDelete,
  onRefresh,
  setUpdateAttendancedata,
  setshowUpdateAttendancePage,
}) {
  const handleDelete = async (attendanceId) => {
    if (!onDelete) return;

    if (
      window.confirm(
        "Are you sure you want to delete this attendance record?"
      )
    ) {
      await onDelete(attendanceId);

      if (onRefresh) {
        onRefresh();
      }
    }
  };

  const getPercentageClass = (percentage) => {
    if (percentage >= 75) return "percentage-good";
    if (percentage >= 50) return "percentage-warning";

    return "percentage-low";
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
            {/* <th className="actions-column">
              ACTIONS
            </th> */}
          </tr>
        </thead>

        <tbody>
          {attendance.map((record) => {
            // If every class has 15 students.
            // Replace 15 with record.totalStudents when your API provides it.
            const percentage = (
              (record.headCount / 15) *
              100
            ).toFixed(0);

            return (
              <tr key={record._id}>
                <td className="attendance-date">
                  {/* {new Date(record.date).toLocaleDateString()} */}
                  {new Date(record.date).toISOString().split("T")[0]}
                </td>

                <td className="attendance-time">
                  {record.startTime} - {record.endTime}
                </td>

                <td className="attendance-course">
                  {record.courseId?.courseCode}
                </td>

                <td className="attendance-session">
                  {new Date(
                    record.sessionId?.startDate
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(
                    record.sessionId?.endDate
                  ).toLocaleDateString()}
                </td>

                <td>
                  <div className="head-count-wrapper">
                    <span className="head-count">
                      {record.headCount}
                    </span>

                    <span
                      className={`percentage ${getPercentageClass(
                        Number(percentage)
                      )}`}
                    >
                      {percentage}%
                    </span>
                  </div>
                </td>

                {/* <td className="attendance-actions">
                  <button
                    className="btn-action btn-view"
                    title="View Attendance"
                    onClick={() =>
                      (window.location.href = `/attendance/${record._id}`)
                    }
                  >
                    <Eye size={18} />
                  </button>



                    
                  <button
                    className="btn-action btn-edit"
                    title="Edit Attendance"
                    // onClick={() =>
                    //   (window.location.href = `/attendance/${record._id}/edit`)
                    // }
                    onClick={() =>
                    {
                      setUpdateAttendancedata(record);
                      setshowUpdateAttendancePage(true);
                    }
                  }
                  >
                    <Pencil size={18} />
                  </button>

                  {onDelete && (
                    <button
                      className="btn-action btn-delete"
                      title="Delete Attendance"
                      onClick={() =>
                        handleDelete(record._id)
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td> */}
              </tr>
            );
          })}
        </tbody>
      </table>

      {attendance.length === 0 && (
        <div className="no-data">
          No attendance records found
        </div>
      )}
    </div>
  );
}



// import "./AttendanceTable.css";

// import {
//   Eye,
//   Pencil,
//   Trash2,
// } from "lucide-react";

// export default function AttendanceTable({
//   attendance,
//   onDelete,
//   onRefresh,
// }) {
//   const handleDelete = async (attendanceId) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this attendance record?"
//       )
//     ) {
//       await onDelete(attendanceId);
//       onRefresh();
//     }
//   };

//   const getPercentageClass = (percentage) => {
//     const num = parseInt(percentage);

//     if (num >= 75) return "percentage-good";
//     if (num >= 50) return "percentage-warning";

//     return "percentage-low";
//   };

//   return (
//     <div className="attendance-table-container">
//       <table className="attendance-table">
//         <thead>
//           <tr>
//             <th>DATE</th>
//             <th>TIME</th>
//             <th>COURSE</th>
//             <th>SESSION</th>
//             <th>HEAD COUNT</th>
//             <th className="actions-column">
//               ACTIONS
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {attendance.map((record) => (
//             <tr key={record.id}>
//               <td className="attendance-date">
//                 {record.date}
//               </td>

//               <td className="attendance-time">
//                 {record.time}
//               </td>

//               <td className="attendance-course">
//                 {record.course}
//               </td>

//               <td className="attendance-session">
//                 {record.session}
//               </td>

//               <td>
//                 <div className="head-count-wrapper">
//                   <span className="head-count">
//                     {record.headCount}
//                   </span>

//                   <span
//                     className={`percentage ${getPercentageClass(
//                       record.percentage
//                     )}`}
//                   >
//                     {record.percentage}
//                   </span>
//                 </div>
//               </td>

//               <td className="attendance-actions">
//                 <button
//                   className="btn-action btn-view"
//                   title="View Attendance"
//                   onClick={() =>
//                     (window.location.href = `/attendance/${record.id}`)
//                   }
//                 >
//                   <Eye />
//                 </button>

//                 <button
//                   className="btn-action btn-edit"
//                   title="Edit Attendance"
//                   onClick={() =>
//                     (window.location.href = `/attendance/${record.id}/edit`)
//                   }
//                 >
//                   <Pencil />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete Attendance"
//                   onClick={() =>
//                     handleDelete(record.id)
//                   }
//                 >
//                   <Trash2 />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {attendance.length === 0 && (
//         <div className="no-data">
//           No attendance records found
//         </div>
//       )}
//     </div>
//   );
// }