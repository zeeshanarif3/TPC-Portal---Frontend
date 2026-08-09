import "./AttendanceTable.css";
import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import useTable from "../../hook/useTable";

export default function AttendanceTable({
  attendance = [],
  token,
  onDelete,
  onRefresh,
  setUpdateAttendancedata,
  setshowUpdateAttendancePage,
  fetchStudentsByCourse,
}) {
  const [studentCounts, setStudentCounts] = useState({});

  useEffect(() => {
    const loadStudentCounts = async () => {
      if (!attendance?.length || !token || !fetchStudentsByCourse) return;

      const courseIds = [
        ...new Set(
          attendance
            .map((record) => record.courseId?._id)
            .filter(Boolean)
        ),
      ];

      const counts = {};

      await Promise.all(
        courseIds.map(async (courseId) => {
          try {
            const students = await fetchStudentsByCourse(courseId, token);

            counts[courseId] = Array.isArray(students)
              ? students.length
              : students?.students?.length ||
                students?.data?.length ||
                0;
          } catch (err) {
            console.error(
              "Failed to fetch students for course:",
              courseId,
              err
            );
            counts[courseId] = 0;
          }
        })
      );

      setStudentCounts(counts);
    };

    loadStudentCounts();
  }, [attendance, token, fetchStudentsByCourse]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const shortId = (id) => {
    if (!id) return "—";
    return id.length > 10 ? `${id.slice(0, 10)}...` : id;
  };

  const getPercentageClass = (percentage) => {
    if (percentage >= 75) return "percentage-good";
    if (percentage >= 50) return "percentage-warning";
    return "percentage-low";
  };

  const rows = useMemo(() => {
    
    return attendance.map((record) => {
      const totalStudents = studentCounts[record.courseId?._id] ?? 0;
      const percentage =
        totalStudents > 0
          ? Math.round((record.headCount / totalStudents) * 100)
          : 0;

      return {
        _id: record._id,
        dateRaw: record.date,
        date: record.date ? new Date(record.date).toISOString().split("T")[0] : "—",
        time: `${record.startTime || "—"} - ${record.endTime || "—"}`,
        course: record.courseId?.courseCode || "—",
        session: record.sessionId
          ? `${formatDate(record.sessionId.startDate)} - ${formatDate(
              record.sessionId.endDate
            )}`
          : "—",
        trainer: record.trainerId?.name || "—",
        subject: record.trainerId?.speciality || "—",
        headCount: record.headCount ?? 0,
        totalStudents,
        percentage,
        original: record,
      };
    });
  }, [attendance, studentCounts]);

  const {
    sortedData: sortedAttendance,
    selected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSort,
    copyID,
  } = useTable(rows, {
    date: (r) => new Date(r.dateRaw || 0).getTime(),
    time: (r) => r.time || "",
    course: (r) => r.course || "",
    session: (r) => r.session || "",
    trainer: (r) => r.trainer || "",
    subject: (r) => r.subject || "",
    headCount: (r) => Number(r.headCount || 0),
    percentage: (r) => Number(r.percentage || 0),
  });

  const handleDelete = async (attendanceId) => {
    if (!onDelete) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this attendance record?"
      )
    ) {
      return;
    }

    await onDelete(attendanceId, token);
    onRefresh?.();
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !onDelete) return;

    if (
      !window.confirm(
        `Delete ${selected.length} attendance record${
          selected.length === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }

    for (const id of selected) {
      await onDelete(id, token);
    }

    clearSelection();
    onRefresh?.();
  };

  return (
    <div className="attendance-table-container">
      {/* {selected.length > 0 && (
        <div className="attendance-bulk-bar">
          <span>{selected.length} selected</span>

          <button
            className="btn-delete-selected"
            onClick={handleBulkDelete}
            >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )} */}


      <table className="attendance-table">
        <thead>
          <tr>
            {/* <th>
              <input
                type="checkbox"
                checked={
                  sortedAttendance.length > 0 &&
                  selected.length === sortedAttendance.length
                }
                onChange={selectAll}
              />
            </th> */}

            <th onClick={() => toggleSort("date")}>
              ATTENDANCE ID <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("date")}>
              DATE <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("time")}>
              TIME <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("course")}>
              COURSE <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("session")}>
              SESSION <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("trainer")}>
              TRAINER <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("subject")}>
              SUBJECT <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("headCount")}>
              HEAD COUNT <ArrowUpDown size={14} />
            </th>

            {/* <th className="actions-column">ACTIONS</th> */}
          </tr>
        </thead>

        <tbody>
          {/* <pre>{JSON.stringify(sortedAttendance, null, 2)}</pre> */}
          
          {sortedAttendance.map((record) => (
            <tr
              key={record._id}
              className={
                selected.includes(record._id)
                  ? "selected-row"
                  : ""
              }
            >
              {/* <td>
                <input
                  type="checkbox"
                  checked={selected.includes(record._id)}
                  onChange={() => toggleSelection(record._id)}
                />
              </td> */}

              <td className="attendance-id">
                <span title={record._id}>
                  {shortId(record._id)}
                </span>

                <button
                  className="btn-copy"
                  title="Copy Attendance ID"
                  onClick={() => copyID(record._id)}
                >
                  <Copy size={14} />
                </button>
              </td>

              <td className="attendance-date">
                {record.date}
              </td>

              <td className="attendance-time">
                {record.time}
              </td>

              <td className="attendance-course">
                {record.course}
              </td>

              <td className="attendance-session">
                {record.session}
              </td>

              <td>{record.trainer}</td>

              <td>{record.subject}</td>

              <td>
                <div className="head-count-wrapper">
                  <span className="head-count">
                    {record.headCount}/{record.totalStudents}
                  </span>

                  {record.totalStudents > 0 && (
                    <span
                      className={`percentage ${getPercentageClass(
                        Number(record.percentage)
                      )}`}
                    >
                      {record.percentage}%
                    </span>
                  )}
                </div>
              </td>

              {/* <td className="attendance-actions">
                <button
                  className="btn-action btn-edit"
                  title="Edit Attendance"
                  onClick={() => {
                    setUpdateAttendancedata(record.original);
                    setshowUpdateAttendancePage(true);
                  }}
                >
                  <Pencil size={18} />
                </button>

                {onDelete && (
                  <button
                    className="btn-action btn-delete"
                    title="Delete Attendance"
                    onClick={() => handleDelete(record._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>

      {sortedAttendance.length === 0 && (
        <div className="no-data">
          No attendance records found
        </div>
      )}
    </div>
  );
}








// import "./AttendanceTable.css";
// import { useEffect, useState } from "react";
// import {
//   Eye,
//   Pencil,
//   Trash2,
// } from "lucide-react";

// export default function AttendanceTable({
//   attendance,
//   token,
//   onDelete,
//   onRefresh,
//   setUpdateAttendancedata,
//   setshowUpdateAttendancePage,
//   fetchStudentsByCourse,
// }) {
//   const [studentCounts, setStudentCounts] = useState({});

//   useEffect(() => {
//     const loadStudentCounts = async () => {
//       if (!attendance?.length || !token) return;

//       // Get unique course IDs
//       const courseIds = [
//         ...new Set(
//           attendance
//             .map((record) => record.courseId?._id)
//             .filter(Boolean)
//         ),
//       ];

//       const counts = {};

//       await Promise.all(
//         courseIds.map(async (courseId) => {
//           try {
//             const students = await fetchStudentsByCourse(
//               courseId,
//               token
//             );

//             counts[courseId] = Array.isArray(students)
//               ? students.length
//               : students?.students?.length ||
//                 students?.data?.length ||
//                 0;
//           } catch (err) {
//             console.error(
//               "Failed to fetch students for course:",
//               courseId,
//               err
//             );
//             counts[courseId] = 0;
//           }
//         })
//       );

//       setStudentCounts(counts);
//     };

//     loadStudentCounts();
//   }, [attendance, token]);

//   const handleDelete = async (attendanceId) => {
//     if (!onDelete) return;

//     if (
//       window.confirm(
//         "Are you sure you want to delete this attendance record?"
//       )
//     ) {
//       await onDelete(attendanceId);

//       if (onRefresh) {
//         onRefresh();
//       }
//     }
//   };

//   const getPercentageClass = (percentage) => {
//     if (percentage >= 75) return "percentage-good";
//     if (percentage >= 50) return "percentage-warning";

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
//             <th>TRAINER</th>
//             <th>SUBJECT</th>
//             <th>HEAD COUNT</th>
//           </tr>
//         </thead>

//         <tbody>
//           {attendance.map((record) => {
//             const totalStudents =
//               studentCounts[record.courseId?._id] ?? 0;

//             const percentage =
//               totalStudents > 0
//                 ? (
//                     (record.headCount / totalStudents) *
//                     100
//                   ).toFixed(0)
//                 : 0;

//             return (
//               <tr key={record._id}>
//                 <td className="attendance-date">
//                   {new Date(record.date)
//                     .toISOString()
//                     .split("T")[0]}
//                 </td>

//                 <td className="attendance-time">
//                   {record.startTime} - {record.endTime}
//                 </td>

//                 <td className="attendance-course">
//                   {record.courseId?.courseCode}
//                 </td>

//                 <td className="attendance-session">
//                   {new Date(
//                     record.sessionId?.startDate
//                   ).toLocaleDateString()}{" "}
//                   -{" "}
//                   {new Date(
//                     record.sessionId?.endDate
//                   ).toLocaleDateString()}
//                 </td>

//                 <td>{record.trainerId?.name || "-"}</td>
//                 <td>{record.trainerId?.speciality || "-"}</td>

//                 <td>
//                   <div className="head-count-wrapper">
//                     <span className="head-count">
//                       {record.headCount}/{totalStudents}
//                     </span>

//                     {/* Uncomment if you want percentage */}
//                     {/*
//                     <span
//                       className={`percentage ${getPercentageClass(
//                         Number(percentage)
//                       )}`}
//                     >
//                       {percentage}%
//                     </span>
//                     */}
//                   </div>
//                 </td>

//                 {/*
//                 <td className="attendance-actions">
//                   <button
//                     className="btn-action btn-view"
//                     title="View Attendance"
//                     onClick={() =>
//                       (window.location.href = `/attendance/${record._id}`)
//                     }
//                   >
//                     <Eye size={18} />
//                   </button>

//                   <button
//                     className="btn-action btn-edit"
//                     title="Edit Attendance"
//                     onClick={() => {
//                       setUpdateAttendancedata(record);
//                       setshowUpdateAttendancePage(true);
//                     }}
//                   >
//                     <Pencil size={18} />
//                   </button>

//                   {onDelete && (
//                     <button
//                       className="btn-action btn-delete"
//                       title="Delete Attendance"
//                       onClick={() =>
//                         handleDelete(record._id)
//                       }
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   )}
//                 </td>
//                 */}
//               </tr>
//             );
//           })}
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








// // import "./AttendanceTable.css";

// // import {
// //   Eye,
// //   Pencil,
// //   Trash2,
// // } from "lucide-react";

// // export default function AttendanceTable({
// //   attendance,
// //   onDelete,
// //   onRefresh,
// //   setUpdateAttendancedata,
// //   setshowUpdateAttendancePage,
// //   fetchStudentsByCourse
// // }) {
// //   const handleDelete = async (attendanceId) => {
// //     if (!onDelete) return;

// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this attendance record?"
// //       )
// //     ) {
// //       await onDelete(attendanceId);

// //       if (onRefresh) {
// //         onRefresh();
// //       }
// //     }
// //   };

// //   const getPercentageClass = (percentage) => {
// //     if (percentage >= 75) return "percentage-good";
// //     if (percentage >= 50) return "percentage-warning";

// //     return "percentage-low";
// //   };

// //   return (
// //     <div className="attendance-table-container">
// //       <table className="attendance-table">
// //         <thead>
// //           <tr>
// //             <th>DATE</th>
// //             <th>TIME</th>
// //             <th>COURSE</th>
// //             <th>SESSION</th>
// //             <th>HEAD COUNT</th>
// //             {/* <th className="actions-column">
// //               ACTIONS
// //             </th> */}
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {attendance.map((record) => {
// //             // If every class has 15 students.
// //             // Replace 15 with record.totalStudents when your API provides it.
// //             const percentage = (
// //               (record.headCount / 15) *
// //               100
// //             ).toFixed(0);

// //             return (
// //               <tr key={record._id}>
// //                 <td className="attendance-date">
// //                   {/* {new Date(record.date).toLocaleDateString()} */}
// //                   {new Date(record.date).toISOString().split("T")[0]}
// //                 </td>

// //                 <td className="attendance-time">
// //                   {record.startTime} - {record.endTime}
// //                 </td>

// //                 <td className="attendance-course">
// //                   {record.courseId?.courseCode}
// //                 </td>

// //                 <td className="attendance-session">
// //                   {new Date(
// //                     record.sessionId?.startDate
// //                   ).toLocaleDateString()}{" "}
// //                   -{" "}
// //                   {new Date(
// //                     record.sessionId?.endDate
// //                   ).toLocaleDateString()}
// //                 </td>

// //                 <td>
// //                   <div className="head-count-wrapper">
// //                     <span className="head-count">
// //                       {record.headCount}
// //                     </span>

// //                     {/* <span
// //                       className={`percentage ${getPercentageClass(
// //                         Number(percentage)
// //                       )}`}
// //                     >
// //                       {percentage}%
// //                     </span> */}
// //                   </div>
// //                 </td>

// //                 {/* <td className="attendance-actions">
// //                   <button
// //                     className="btn-action btn-view"
// //                     title="View Attendance"
// //                     onClick={() =>
// //                       (window.location.href = `/attendance/${record._id}`)
// //                     }
// //                   >
// //                     <Eye size={18} />
// //                   </button>



                    
// //                   <button
// //                     className="btn-action btn-edit"
// //                     title="Edit Attendance"
// //                     // onClick={() =>
// //                     //   (window.location.href = `/attendance/${record._id}/edit`)
// //                     // }
// //                     onClick={() =>
// //                     {
// //                       setUpdateAttendancedata(record);
// //                       setshowUpdateAttendancePage(true);
// //                     }
// //                   }
// //                   >
// //                     <Pencil size={18} />
// //                   </button>

// //                   {onDelete && (
// //                     <button
// //                       className="btn-action btn-delete"
// //                       title="Delete Attendance"
// //                       onClick={() =>
// //                         handleDelete(record._id)
// //                       }
// //                     >
// //                       <Trash2 size={18} />
// //                     </button>
// //                   )}
// //                 </td> */}
// //               </tr>
// //             );
// //           })}
// //         </tbody>
// //       </table>

// //       {attendance.length === 0 && (
// //         <div className="no-data">
// //           No attendance records found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }



// // // import "./AttendanceTable.css";

// // // import {
// // //   Eye,
// // //   Pencil,
// // //   Trash2,
// // // } from "lucide-react";

// // // export default function AttendanceTable({
// // //   attendance,
// // //   onDelete,
// // //   onRefresh,
// // // }) {
// // //   const handleDelete = async (attendanceId) => {
// // //     if (
// // //       window.confirm(
// // //         "Are you sure you want to delete this attendance record?"
// // //       )
// // //     ) {
// // //       await onDelete(attendanceId);
// // //       onRefresh();
// // //     }
// // //   };

// // //   const getPercentageClass = (percentage) => {
// // //     const num = parseInt(percentage);

// // //     if (num >= 75) return "percentage-good";
// // //     if (num >= 50) return "percentage-warning";

// // //     return "percentage-low";
// // //   };

// // //   return (
// // //     <div className="attendance-table-container">
// // //       <table className="attendance-table">
// // //         <thead>
// // //           <tr>
// // //             <th>DATE</th>
// // //             <th>TIME</th>
// // //             <th>COURSE</th>
// // //             <th>SESSION</th>
// // //             <th>HEAD COUNT</th>
// // //             <th className="actions-column">
// // //               ACTIONS
// // //             </th>
// // //           </tr>
// // //         </thead>

// // //         <tbody>
// // //           {attendance.map((record) => (
// // //             <tr key={record.id}>
// // //               <td className="attendance-date">
// // //                 {record.date}
// // //               </td>

// // //               <td className="attendance-time">
// // //                 {record.time}
// // //               </td>

// // //               <td className="attendance-course">
// // //                 {record.course}
// // //               </td>

// // //               <td className="attendance-session">
// // //                 {record.session}
// // //               </td>

// // //               <td>
// // //                 <div className="head-count-wrapper">
// // //                   <span className="head-count">
// // //                     {record.headCount}
// // //                   </span>

// // //                   <span
// // //                     className={`percentage ${getPercentageClass(
// // //                       record.percentage
// // //                     )}`}
// // //                   >
// // //                     {record.percentage}
// // //                   </span>
// // //                 </div>
// // //               </td>

// // //               <td className="attendance-actions">
// // //                 <button
// // //                   className="btn-action btn-view"
// // //                   title="View Attendance"
// // //                   onClick={() =>
// // //                     (window.location.href = `/attendance/${record.id}`)
// // //                   }
// // //                 >
// // //                   <Eye />
// // //                 </button>

// // //                 <button
// // //                   className="btn-action btn-edit"
// // //                   title="Edit Attendance"
// // //                   onClick={() =>
// // //                     (window.location.href = `/attendance/${record.id}/edit`)
// // //                   }
// // //                 >
// // //                   <Pencil />
// // //                 </button>

// // //                 <button
// // //                   className="btn-action btn-delete"
// // //                   title="Delete Attendance"
// // //                   onClick={() =>
// // //                     handleDelete(record.id)
// // //                   }
// // //                 >
// // //                   <Trash2 />
// // //                 </button>
// // //               </td>
// // //             </tr>
// // //           ))}
// // //         </tbody>
// // //       </table>

// // //       {attendance.length === 0 && (
// // //         <div className="no-data">
// // //           No attendance records found
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }