// SchedulesTable.jsx
import "./SchedulesTable.css";
import {
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import useTable from "../../hook/useTable";

export default function SchedulesTable({
  schedules = [],
  onDelete,
  onRefresh,
  setUpdateScheduledata,
  setshowUpdateSchedule,
  token,
  trainerMap = {},
}) {
  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object")
      return value._id || value.id || "";
    return String(value);
  };

  const getCourseLabel = (course) => {
    if (!course) return "—";
    if (typeof course === "string") return course;
    return course.courseCode || course.name || "—";
  };

  const getTrainerLabel = (trainerId) => {
    const id = normalizeId(trainerId);
    if (!id) return "—";
    return trainerMap[id] || "Unknown";
  };

  const getScheduleStatus = (schedule) => {
    const raw = (schedule?.status || "")
      .toString()
      .trim()
      .toLowerCase();

    if (raw === "completed") return "Completed";
    if (raw === "cancelled" || raw === "canceled")
      return "Cancelled";
    if (raw === "active") return "Active";
    if (raw === "upcoming") return "Upcoming";
    if (raw === "pending") return "Pending";

    return "Scheduled";
  };

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
    return id.length > 10
      ? `${id.slice(0, 10)}...`
      : id;
  };

  const {
    sortedData: sortedSchedules,
    selected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSort,
    copyID,
  } = useTable(schedules, {
    course: (schedule) =>
      getCourseLabel(schedule.courseId) || "",
    trainer: (schedule) =>
      getTrainerLabel(schedule.trainerId) || "",
    date: (schedule) =>
      new Date(schedule.date || 0).getTime(),
    timeSlot: (schedule) =>
      `${schedule.startTime || ""}-${schedule.endTime || ""}`,
    roomNo: (schedule) => schedule.roomNo || "",
    topic: (schedule) => schedule.topic || "",
    session: (schedule) =>
      schedule.sessionId
        ? new Date(
            schedule.sessionId.startDate || 0
          ).getTime()
        : 0,
    status: (schedule) =>
      getScheduleStatus(schedule) || "",
  });

  const handleDelete = async (scheduleId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this schedule?"
      )
    ) {
      return;
    }

    try {
      await onDelete?.(scheduleId, token);
      onRefresh?.();
    } catch (err) {
      alert(err.message || "Failed deleting schedule");
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;

    if (
      !window.confirm(
        `Delete ${selected.length} schedule${
          selected.length === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }

    try {
      for (const id of selected) {
        await onDelete?.(id, token);
      }

      clearSelection();
      onRefresh?.();
    } catch (err) {
      alert(err.message || "Failed deleting schedules");
    }
  };

  const rows = sortedSchedules.map((schedule) => {
    const trainerId = normalizeId(schedule.trainerId);
    const status = getScheduleStatus(schedule);

    return {
      id: schedule._id,
      scheduleId: schedule._id,
      course: getCourseLabel(schedule.courseId),
      trainer: getTrainerLabel(trainerId),
      trainerId,
      date: formatDate(schedule.date),
      timeSlot: `${schedule.startTime || "—"} - ${schedule.endTime || "—"}`,
      session: schedule.sessionId
        ? `${formatDate(
            schedule.sessionId.startDate
          )} - ${formatDate(
            schedule.sessionId.endDate
          )}`
        : "—",
      roomNo: schedule.roomNo || "—",
      topic: schedule.topic || "—",
      status,
      original: schedule,
    };
  });

  return (
    <div className="schedules-table-container">
      {selected.length > 0 && (
        <div className="schedules-bulk-bar">
          <span>{selected.length} selected</span>

          <button
            className="btn-delete-selected"
            onClick={handleBulkDelete}
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      <table className="schedules-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  rows.length > 0 &&
                  selected.length === rows.length
                }
                onChange={selectAll}
              />
            </th>

            <th onClick={() => toggleSort("course")}>
              COURSE <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("trainer")}>
              TRAINER <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("date")}>
              DATE <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("timeSlot")}>
              TIME SLOT <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("roomNo")}>
              ROOM <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("topic")}>
              TOPIC <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("session")}>
              SESSION <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("status")}>
              STATUS <ArrowUpDown size={14} />
            </th>

            <th className="actions-column">ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((schedule) => (
            <tr
              key={schedule.id}
              className={`${
                schedule.status === "Cancelled"
                  ? "schedule-cancelled"
                  : schedule.status === "Completed"
                  ? "schedule-completed"
                  : ""
              } ${
                selected.includes(schedule.id)
                  ? "selected-row"
                  : ""
              }`}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(schedule.id)}
                  onChange={() =>
                    toggleSelection(schedule.id)
                  }
                />
              </td>

              <td
                className="schedule-course"
                title={schedule.course}
              >
                {schedule.course}
              </td>

              <td
                className="schedule-trainer"
                title={schedule.trainer}
              >
                {schedule.trainer}
              </td>

              <td className="schedule-date">
                {schedule.date}
              </td>

              <td className="schedule-time">
                {schedule.timeSlot}
              </td>

              <td title={schedule.roomNo}>
                {schedule.roomNo}
              </td>

              <td title={schedule.topic}>
                {schedule.topic}
              </td>

              <td className="schedule-session">
                {schedule.session}
              </td>

              <td>
                <span
                  className={`status-badge status-${schedule.status.toLowerCase()}`}
                >
                  {schedule.status}
                </span>
              </td>

              <td className="schedule-actions">
                <button
                  className="btn-copy"
                  title="Copy Schedule ID"
                  onClick={() => copyID(schedule.id)}
                >
                  <Copy size={14} />
                </button>

                <button
                  className="btn-action btn-edit"
                  title="Edit Schedule"
                  onClick={() => {
                    setUpdateScheduledata(
                      schedule.original
                    );
                    setshowUpdateSchedule(true);
                  }}
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
          <h3>No schedules found</h3>
          <p>
            Try changing the search, course, or status filter.
          </p>
        </div>
      )}
    </div>
  );
}









// // SchedulesTable.jsx
// import "./SchedulesTable.css";
// import { Pencil, Trash2 } from "lucide-react";

// export default function SchedulesTable({
//   schedules = [],
//   onDelete,
//   onRefresh,
//   setUpdateScheduledata,
//   setshowUpdateSchedule,
//   token,
//   trainerMap = {},
// }) {
//   const normalizeId = (value) => {
//     if (!value) return "";
//     if (typeof value === "string") return value;
//     if (typeof value === "object") return value._id || value.id || "";
//     return String(value);
//   };

//   const getCourseLabel = (course) => {
//     if (!course) return "—";
//     if (typeof course === "string") return course;
//     return course.courseCode || course.name || "—";
//   };

//   const getTrainerLabel = (trainerId) => {
//     const id = normalizeId(trainerId);
//     if (!id) return "—";
//     return trainerMap[id] || "Unknown";
//   };

//   const getScheduleStatus = (schedule) => {
//     const raw = (schedule?.status || "").toString().trim().toLowerCase();

//     if (raw === "completed") return "Completed";
//     if (raw === "cancelled" || raw === "canceled") return "Cancelled";
//     if (raw === "active") return "Active";
//     if (raw === "upcoming") return "Upcoming";
//     if (raw === "pending") return "Pending";

//     return "Scheduled";
//   };

//   const formatDate = (date) => {
//     if (!date) return "—";

//     const parsed = new Date(date);
//     if (Number.isNaN(parsed.getTime())) return "—";

//     return parsed.toLocaleDateString(undefined, {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const shortId = (id) => {
//     if (!id) return "—";
//     return id.length > 10 ? `${id.slice(0, 10)}...` : id;
//   };

//   const handleDelete = async (scheduleId) => {
//     if (
//       window.confirm("Are you sure you want to delete this schedule?")
//     ) {
//       try {
//         await onDelete(scheduleId, token);
//         onRefresh?.();
//       } catch (err) {
//         alert(err.message || "Failed deleting schedule");
//       }
//     }
//   };

//   const rows = schedules.map((schedule) => {
//     const trainerId = normalizeId(schedule.trainerId);
//     const status = getScheduleStatus(schedule);

//     return {
//       id: schedule._id,
//       scheduleId: schedule._id,
//       course: getCourseLabel(schedule.courseId),
//       trainer: getTrainerLabel(trainerId),
//       trainerId,
//       date: formatDate(schedule.date),
//       timeSlot: `${schedule.startTime || "—"} - ${schedule.endTime || "—"}`,
//       session: schedule.sessionId
//         ? `${formatDate(schedule.sessionId.startDate)} - ${formatDate(
//             schedule.sessionId.endDate
//           )}`
//         : "—",
//       roomNo: schedule.roomNo || "—",
//       topic: schedule.topic || "—",
//       status,
//       original: schedule,
//     };
//   });

//   return (
//     <div className="schedules-table-container">
//       <table className="schedules-table">
//         <thead>
//           <tr>
//             <th>COURSE</th>
//             <th>TRAINER</th>
//             <th>DATE</th>
//             <th>TIME SLOT</th>
//             <th>ROOM</th>
//             <th>TOPIC</th>
//             <th>SESSION</th>
//             <th>STATUS</th>
//             <th className="actions-column">ACTIONS</th>
//           </tr>
//         </thead>

//         <tbody>
//           {rows.map((schedule) => (
//             <tr
//               key={schedule.id}
//               className={
//                 schedule.status === "Cancelled"
//                   ? "schedule-cancelled"
//                   : schedule.status === "Completed"
//                     ? "schedule-completed"
//                     : ""
//               }
//             >
//               <td className="schedule-course" title={schedule.course}>
//                 {schedule.course}
//               </td>

//               <td className="schedule-trainer" title={schedule.trainer}>
//                 {schedule.trainer}
//               </td>

//               <td className="schedule-date">{schedule.date}</td>

//               <td className="schedule-time">{schedule.timeSlot}</td>

//               <td title={schedule.roomNo}>{schedule.roomNo}</td>

//               <td title={schedule.topic}>{schedule.topic}</td>

//               <td className="schedule-session">{schedule.session}</td>

//               <td>
//                 <span className={`status-badge status-${schedule.status.toLowerCase()}`}>
//                   {schedule.status}
//                 </span>
//               </td>

//               <td className="schedule-actions">
//                 <button
//                   className="btn-action btn-edit"
//                   title="Edit Schedule"
//                   onClick={() => {
//                     setUpdateScheduledata(schedule.original);
//                     setshowUpdateSchedule(true);
//                   }}
//                 >
//                   <Pencil />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete Schedule"
//                   onClick={() => handleDelete(schedule.scheduleId)}
//                 >
//                   <Trash2 />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {rows.length === 0 && (
//         <div className="no-data">
//           <h3>No schedules found</h3>
//           <p>Try changing the search, course, or status filter.</p>
//         </div>
//       )}
//     </div>
//   );
// }









// // import "./SchedulesTable.css";
// // import { Pencil, Trash2 } from "lucide-react";
// // import { useState, useEffect } from "react";

// // export default function SchedulesTable({

// //   schedules = [],

// //   onDelete,

// //   onRefresh,

// //   setUpdateScheduledata,

// //   setshowUpdateSchedule,

// //   fetchTrainerById,

// //   token,

// // }) {

// //   const [trainers, setTrainers] = useState({});

// //   // Fetch all trainers used in schedules
// //   useEffect(() => {

// //     const loadTrainers = async () => {

// //       const ids = new Set();

// //       schedules.forEach(schedule => {

// //         if (schedule.trainerId) {

// //           const id =
// //             schedule.trainerId?._id ||
// //             schedule.trainerId;

// //           ids.add(id);

// //         }

// //       });

// //       const entries = {};

// //       for (const id of ids) {

// //         try {

// //           const trainer =
// //             await fetchTrainerById(
// //               id,
// //               token
// //             );

// //           entries[id] =
// //             trainer?.name ||
// //             "Unknown";

// //         }
// //         catch (error) {

// //           console.error(
// //             "Trainer fetch failed",
// //             error
// //           );

// //           entries[id] =
// //             "Unknown";

// //         }

// //       }

// //       setTrainers(entries);

// //     };

// //     if (schedules.length)
// //       loadTrainers();

// //   }, [
// //     schedules,
// //     token
// //   ]);



// //   const handleDelete = async (scheduleId) => {

// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this schedule?"
// //       )
// //     ) {

// //       try {

// //         await onDelete(scheduleId);

// //         if (onRefresh) {
// //           onRefresh();
// //         }

// //       }
// //       catch (err) {

// //         alert(
// //           err.message ||
// //           "Failed deleting schedule"
// //         );

// //       }

// //     }

// //   };



// //   const rows = schedules.map(schedule => {

// //     const trainerId =
// //       schedule.trainerId?._id ||
// //       schedule.trainerId ||
// //       "";

// //     const isCompleted =
// //       schedule.status === "completed" &&
// //       schedule.headCount != null &&
// //       schedule.topic?.trim();

// //     const isCancelled =
// //       schedule.status === "cancelled";

// //     return {

// //       id:
// //         schedule._id,

// //       scheduleId:
// //         schedule._id,

// //       course:
// //         schedule.courseId?.courseCode ||
// //         "-",

// //       trainer:
// //         trainers[trainerId] ||
// //         "-",

// //       trainerId,

// //       date:
// //         schedule.date ||
// //         "-",

// //       timeSlot:
// //         `${schedule.startTime || "-"} - ${schedule.endTime || "-"}`,

// //       session:
// //         schedule.sessionId
// //           ?
// //           `${new Date(
// //             schedule.sessionId.startDate
// //           ).toLocaleDateString()}
// //         -
// //         ${new Date(
// //             schedule.sessionId.endDate
// //           ).toLocaleDateString()}`
// //           :
// //           "-",

// //       roomNo:
// //         schedule.roomNo ||
// //         "-",

// //       topic:
// //         schedule.topic ||
// //         "-",

// //       isCompleted,
// //       isCancelled,

// //       original:
// //         schedule

// //     };

// //   });



// //   return (

// //     <div className="schedules-table-container">

// //       <table className="schedules-table">

// //         <thead>

// //           <tr>

// //             <th>
// //               COURSE
// //             </th>

// //             <th>
// //               TRAINER
// //             </th>

// //             <th>
// //               DATE
// //             </th>

// //             <th>
// //               TIME SLOT
// //             </th>

// //             <th>
// //               ROOM
// //             </th>

// //             <th>
// //               TOPIC
// //             </th>

// //             <th>
// //               SESSION
// //             </th>

// //             <th className="actions-column">
// //               ACTIONS
// //             </th>

// //           </tr>

// //         </thead>

// //         <tbody>

// //           {

// //             rows.map(schedule => (

// //               // <tr
// //               //   key={schedule.id}
// //               //   className={
// //               //     schedule.isCompleted
// //               //       ? "schedule-completed"
// //               //       : ""
// //               //   }
// //               // >
// //               <tr
// //                 key={schedule.id}
// //                 className={
// //                   schedule.isCancelled
// //                     ? "schedule-cancelled"
// //                     : schedule.isCompleted
// //                       ? "schedule-completed"
// //                       : ""
// //                 }
// //               >

// //                 <td className="schedule-course">
// //                   {schedule.course}
// //                 </td>

// //                 <td className="schedule-trainer">
// //                   {schedule.trainer}
// //                 </td>

// //                 <td className="schedule-date">
// //                   {schedule.date}
// //                 </td>

// //                 <td className="schedule-time">
// //                   {schedule.timeSlot}
// //                 </td>

// //                 <td>
// //                   {schedule.roomNo}
// //                 </td>

// //                 <td>
// //                   {schedule.topic}
// //                 </td>

// //                 <td className="schedule-session">
// //                   {schedule.session}
// //                 </td>

// //                 <td className="schedule-actions">

// //                   <button

// //                     className="btn-action btn-edit"

// //                     title="Edit Schedule"

// //                     onClick={() => {

// //                       setUpdateScheduledata(
// //                         schedule.original
// //                       );

// //                       setshowUpdateSchedule(
// //                         true
// //                       );

// //                     }}

// //                   >

// //                     <Pencil />

// //                   </button>

// //                   <button

// //                     className="btn-action btn-delete"

// //                     title="Delete Schedule"

// //                     onClick={() =>
// //                       handleDelete(
// //                         schedule.scheduleId
// //                       )
// //                     }

// //                   >

// //                     <Trash2 />

// //                   </button>

// //                 </td>

// //               </tr>

// //             ))

// //           }

// //         </tbody>

// //       </table>

// //       {

// //         rows.length === 0 &&

// //         <div className="no-data">

// //           No schedules found

// //         </div>

// //       }

// //     </div>

// //   );

// // }
























// // // import "./SchedulesTable.css";
// // // import { Pencil, Trash2 } from "lucide-react";
// // // import { useState, useEffect } from "react";

// // // export default function SchedulesTable({

// // //   schedules = [],

// // //   onDelete,

// // //   onRefresh,

// // //   setUpdateScheduledata,

// // //   setshowUpdateSchedule,

// // //   fetchTrainerById,

// // //   token,

// // // }) {

// // //   const [trainers, setTrainers] = useState({});

// // //   // Fetch all trainers used in schedules, keyed by trainer id
// // //   useEffect(() => {

// // //     const loadTrainers = async () => {

// // //       const ids = new Set();


// // //       schedules.forEach(schedule => {

// // //             if (schedule.trainerId) {
// // //               const id =
// // //                 schedule.trainerId?._id ||
// // //                 schedule.trainerId;

// // //               ids.add(id);

// // //             }


// // //       });



// // //       const entries = {};



// // //       for (const id of ids) {


// // //           try {

// // //             const trainer =
// // //               await fetchTrainerById(
// // //                 id,
// // //                 token
// // //               );


// // //             entries[id] = trainer?.name || "Unknown";


// // //           } catch (error) {

// // //             console.error(
// // //               "Trainer fetch failed",
// // //               error
// // //             );

// // //             entries[id] = "Unknown";



// // //         }

// // //       }

// // //       setTrainers(entries);

// // //     };


// // //     if (schedules.length)
// // //       loadTrainers();


// // //   }, [
// // //     schedules,
// // //     token
// // //   ]);


// // //   const handleDelete = async (scheduleId) => {


// // //     if (
// // //       window.confirm(
// // //         "Are you sure you want to delete this schedule?"
// // //       )
// // //     ) {


// // //       try {


// // //         await onDelete(scheduleId);



// // //         if (onRefresh) {
// // //           onRefresh();
// // //         }


// // //       }
// // //       catch (err) {

// // //         alert(
// // //           err.message ||
// // //           "Failed deleting schedule"
// // //         );

// // //       }


// // //     }


// // //   };







// // //   const rows = schedules.map(schedule => {


// // //     const trainerId =
// // //       schedule.trainerId?._id ||
// // //       schedule.trainerId ||
// // //       "";


// // //     return {


// // //       id:
// // //         schedule._id,


// // //       scheduleId:
// // //         schedule._id,



// // //       course:
// // //         schedule.courseId?.courseCode ||
// // //         "-",



// // //       trainer:
// // //         trainers[trainerId] ||
// // //         "-",



// // //       trainerId,



// // //       date:
// // //         schedule.date ||
// // //         "-",



// // //       timeSlot:

// // //         `${schedule.startTime || "-"} - ${schedule.endTime || "-"
// // //         }`,



// // //       session:

// // //         schedule.sessionId

// // //           ?

// // //           `${new Date(
// // //             schedule.sessionId.startDate
// // //           )
// // //             .toLocaleDateString()

// // //           }

// // //         -

// // //         ${new Date(
// // //             schedule.sessionId.endDate
// // //           )
// // //             .toLocaleDateString()

// // //           }`

// // //           :

// // //           "-",




// // //       roomNo:

// // //         schedule.roomNo || "-",



// // //       topic:

// // //         schedule.topic || "-",



// // //       original:
// // //         schedule


// // //     };

// // //   });









// // //   return (

// // //     <div className="schedules-table-container">


// // //       <table className="schedules-table">


// // //         <thead>

// // //           <tr>

// // //             <th>
// // //               COURSE
// // //             </th>


// // //             <th>
// // //               TRAINER
// // //             </th>


// // //             <th>
// // //               DATE
// // //             </th>


// // //             <th>
// // //               TIME SLOT
// // //             </th>


// // //             <th>
// // //               ROOM
// // //             </th>


// // //             <th>
// // //               TOPIC
// // //             </th>


// // //             <th>
// // //               SESSION
// // //             </th>


// // //             <th className="actions-column">
// // //               ACTIONS
// // //             </th>


// // //           </tr>


// // //         </thead>





// // //         <tbody>



// // //           {
// // //             rows.map(schedule => (


// // //               <tr key={schedule.id}>


// // //                 <td className="schedule-course">

// // //                   {schedule.course}

// // //                 </td>





// // //                 <td className="schedule-trainer">

// // //                   {schedule.trainer}


// // //                 </td>






// // //                 <td className="schedule-date">

// // //                   {schedule.date}

// // //                 </td>






// // //                 <td className="schedule-time">

// // //                   {schedule.timeSlot}

// // //                 </td>






// // //                 <td>

// // //                   {schedule.roomNo}

// // //                 </td>






// // //                 <td>

// // //                   {schedule.topic}

// // //                 </td>






// // //                 <td className="schedule-session">

// // //                   {schedule.session}

// // //                 </td>







// // //                 <td className="schedule-actions">


// // //                   <button

// // //                     className="btn-action btn-edit"

// // //                     title="Edit Schedule"


// // //                     onClick={() => {


// // //                       setUpdateScheduledata(
// // //                         schedule.original
// // //                       );


// // //                       setshowUpdateSchedule(
// // //                         true
// // //                       );


// // //                     }}


// // //                   >


// // //                     <Pencil />

// // //                   </button>








// // //                   <button

// // //                     className="btn-action btn-delete"

// // //                     title="Delete Schedule"


// // //                     onClick={() =>


// // //                       handleDelete(
// // //                         schedule.scheduleId
// // //                       )


// // //                     }


// // //                   >


// // //                     <Trash2 />

// // //                   </button>




// // //                 </td>






// // //               </tr>


// // //             ))


// // //           }



// // //         </tbody>



// // //       </table>








// // //       {
// // //         rows.length === 0 &&

// // //         <div className="no-data">

// // //           No schedules found

// // //         </div>

// // //       }



// // //     </div>


// // //   );


// // // }




// // // // import "./SchedulesTable.css";
// // // // import { Pencil, Trash2 } from "lucide-react";
// // // // import { useState, useEffect } from "react";

// // // // export default function SchedulesTable({

// // // //   schedules = [],

// // // //   onDelete,

// // // //   onRefresh,

// // // //   setUpdateScheduledata,

// // // //   setshowUpdateSchedule,

// // // //   fetchTrainerById,

// // // //   token,

// // // // }) {

// // // //   const [trainers, setTrainers] = useState("");

// // // //   // Fetch all trainers used in schedules
// // // //   useEffect(() => {

// // // //     const loadTrainers = async () => {

// // // //       const ids = new Set();


// // // //       schedules.forEach(schedule => {

// // // //             if (schedule.trainerId) {
// // // //               const id = schedule.trainerId;
// // // //               ids.add(id);

// // // //             }


// // // //       });



// // // //       for (const id of ids) {


// // // //           try {

// // // //             const trainername =
// // // //               await fetchTrainerById(
// // // //                 id,
// // // //                 token
// // // //               );


// // // //             setTrainers(trainername?.name || "Unknown");


// // // //           } catch (error) {

// // // //             console.error(
// // // //               "Trainer fetch failed",
// // // //               error
// // // //             );




// // // //         }

// // // //       }

// // // //     };


// // // //     if (schedules.length)
// // // //       loadTrainers();


// // // //   }, [
// // // //     schedules,
// // // //     token
// // // //   ]);


// // // //   const handleDelete = async (scheduleId) => {


// // // //     if (
// // // //       window.confirm(
// // // //         "Are you sure you want to delete this schedule?"
// // // //       )
// // // //     ) {


// // // //       try {


// // // //         await onDelete(scheduleId);



// // // //         if (onRefresh) {
// // // //           onRefresh();
// // // //         }


// // // //       }
// // // //       catch (err) {

// // // //         alert(
// // // //           err.message ||
// // // //           "Failed deleting schedule"
// // // //         );

// // // //       }


// // // //     }


// // // //   };







// // // //   const rows = schedules.map(schedule => ({


// // // //     id:
// // // //       schedule._id,


// // // //     scheduleId:
// // // //       schedule._id,



// // // //     course:
// // // //       schedule.courseId?.courseCode ||
// // // //       "-",



// // // //     trainer:
// // // //       trainers||
// // // //       "-",



// // // //     trainerId:
// // // //       schedule.trainerId?._id ||
// // // //       schedule.trainerId ||
// // // //       "",



// // // //     date:
// // // //       schedule.date ||
// // // //       "-",



// // // //     timeSlot:

// // // //       `${schedule.startTime || "-"} - ${schedule.endTime || "-"
// // // //       }`,



// // // //     session:

// // // //       schedule.sessionId

// // // //         ?

// // // //         `${new Date(
// // // //           schedule.sessionId.startDate
// // // //         )
// // // //           .toLocaleDateString()

// // // //         }

// // // //       -

// // // //       ${new Date(
// // // //           schedule.sessionId.endDate
// // // //         )
// // // //           .toLocaleDateString()

// // // //         }`

// // // //         :

// // // //         "-",




// // // //     roomNo:

// // // //       schedule.roomNo || "-",



// // // //     topic:

// // // //       schedule.topic || "-",



// // // //     original:
// // // //       schedule


// // // //   }));









// // // //   return (

// // // //     <div className="schedules-table-container">


// // // //       <table className="schedules-table">


// // // //         <thead>

// // // //           <tr>

// // // //             <th>
// // // //               COURSE
// // // //             </th>


// // // //             <th>
// // // //               TRAINER
// // // //             </th>


// // // //             <th>
// // // //               DATE
// // // //             </th>


// // // //             <th>
// // // //               TIME SLOT
// // // //             </th>


// // // //             <th>
// // // //               ROOM
// // // //             </th>


// // // //             <th>
// // // //               TOPIC
// // // //             </th>


// // // //             <th>
// // // //               SESSION
// // // //             </th>


// // // //             <th className="actions-column">
// // // //               ACTIONS
// // // //             </th>


// // // //           </tr>


// // // //         </thead>





// // // //         <tbody>



// // // //           {
// // // //             rows.map(schedule => (


// // // //               <tr key={schedule.id}>


// // // //                 <td className="schedule-course">

// // // //                   {schedule.course}

// // // //                 </td>





// // // //                 <td className="schedule-trainer">

// // // //                   {trainers}
// // // //                   {/* <pre>{JSON.stringify(trainers, null, 2)}</pre> */}


// // // //                 </td>






// // // //                 <td className="schedule-date">

// // // //                   {schedule.date}

// // // //                 </td>






// // // //                 <td className="schedule-time">

// // // //                   {schedule.timeSlot}

// // // //                 </td>






// // // //                 <td>

// // // //                   {schedule.roomNo}

// // // //                 </td>






// // // //                 <td>

// // // //                   {schedule.topic}

// // // //                 </td>






// // // //                 <td className="schedule-session">

// // // //                   {schedule.session}

// // // //                 </td>







// // // //                 <td className="schedule-actions">


// // // //                   <button

// // // //                     className="btn-action btn-edit"

// // // //                     title="Edit Schedule"


// // // //                     onClick={() => {


// // // //                       setUpdateScheduledata(
// // // //                         schedule.original
// // // //                       );


// // // //                       setshowUpdateSchedule(
// // // //                         true
// // // //                       );


// // // //                     }}


// // // //                   >


// // // //                     <Pencil />

// // // //                   </button>








// // // //                   <button

// // // //                     className="btn-action btn-delete"

// // // //                     title="Delete Schedule"


// // // //                     onClick={() =>


// // // //                       handleDelete(
// // // //                         schedule.scheduleId
// // // //                       )


// // // //                     }


// // // //                   >


// // // //                     <Trash2 />

// // // //                   </button>




// // // //                 </td>






// // // //               </tr>


// // // //             ))


// // // //           }



// // // //         </tbody>



// // // //       </table>








// // // //       {
// // // //         rows.length === 0 &&

// // // //         <div className="no-data">

// // // //           No schedules found

// // // //         </div>

// // // //       }



// // // //     </div>


// // // //   );


// // // // }


















// // // // import "./SchedulesTable.css";
// // // // import { Pencil, Trash2 } from "lucide-react";

// // // // export default function SchedulesTable({
// // // //   schedules,
// // // //   onDelete,
// // // //   onRefresh,
// // // //   setUpdateScheduledata,
// // // //   setshowUpdateSchedule
// // // // }) {
// // // //   const handleDelete = async (scheduleId) => {
// // // //     if (
// // // //       window.confirm(
// // // //         "Are you sure you want to delete this schedule?"
// // // //       )
// // // //     ) {
// // // //       await onDelete(scheduleId);
// // // //       onRefresh();
// // // //     }
// // // //   };

// // // //   const rows = schedules.flatMap((schedule) =>
// // // //     Object.entries(schedule.slots || {}).flatMap(([day, slots]) =>
// // // //       slots.map((slot) => ({
// // // //         id: slot._id,
// // // //         scheduleId: schedule._id,
// // // //         course: schedule.courseId?.courseCode || "-",
// // // //         session: schedule.sessionId
// // // //           ? `${new Date(schedule.sessionId.startDate).toLocaleDateString()} - ${new Date(
// // // //               schedule.sessionId.endDate
// // // //             ).toLocaleDateString()}`
// // // //           : "-",
// // // //         college: schedule.college?.collegeName || "-",
// // // //         trainer: schedule.trainer?.name || "-",
// // // //         day: day.charAt(0).toUpperCase() + day.slice(1),
// // // //         timeSlot: `${slot.startTime} - ${slot.endTime}`,
// // // //       }))
// // // //     )
// // // //   );

// // // //   return (
// // // //     <div className="schedules-table-container">
// // // //       <table className="schedules-table">
// // // //         <thead>
// // // //           <tr>
// // // //             <th>COURSE</th>
// // // //             <th>TRAINER</th>
// // // //             <th>DAY</th>
// // // //             <th>TIME SLOT</th>
// // // //             <th>SESSION</th>
// // // //             <th>COLLEGE</th>
// // // //             <th className="actions-column">
// // // //               ACTIONS
// // // //             </th>
// // // //           </tr>
// // // //         </thead>

// // // //         <tbody>
// // // //           {rows.map((schedule) => (
// // // //             <tr key={schedule.id}>
// // // //               <td className="schedule-course">
// // // //                 {schedule.course}
// // // //               </td>

// // // //               <td className="schedule-trainer">
// // // //                 {schedule.trainer}
// // // //               </td>

// // // //               <td className="schedule-day">
// // // //                 {schedule.day}
// // // //               </td>

// // // //               <td className="schedule-time">
// // // //                 {schedule.timeSlot}
// // // //               </td>

// // // //               <td className="schedule-session">
// // // //                 {schedule.session}
// // // //               </td>

// // // //               <td className="schedule-college">
// // // //                 {schedule.college}
// // // //               </td>

// // // //               <td className="schedule-actions">
// // // //                 <button
// // // //                   className="btn-action btn-edit"
// // // //                   title="Edit Schedule"
// // // //                   // onClick={() =>
// // // //                   //   (window.location.href = `/schedules/${schedule.scheduleId}/edit`)
// // // //                   // }
// // // //                   onClick={() =>
// // // //                     {
// // // //                       setUpdateScheduledata(schedule);
// // // //                       setshowUpdateSchedule(true);
// // // //                     }
// // // //                   }
// // // //                 >
// // // //                   <Pencil />
// // // //                 </button>

// // // //                 <button
// // // //                   className="btn-action btn-delete"
// // // //                   title="Delete Schedule"
// // // //                   onClick={() =>
// // // //                     handleDelete(schedule.scheduleId)
// // // //                   }
// // // //                 >
// // // //                   <Trash2 />
// // // //                 </button>
// // // //               </td>
// // // //             </tr>
// // // //           ))}
// // // //         </tbody>
// // // //       </table>

// // // //       {rows.length === 0 && (
// // // //         <div className="no-data">
// // // //           No schedules found
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }



// // // // // import "./SchedulesTable.css";

// // // // // import {
// // // // //   Pencil,
// // // // //   Trash2,
// // // // // } from "lucide-react";

// // // // // export default function SchedulesTable({
// // // // //   schedules,
// // // // //   onDelete,
// // // // //   onRefresh,
// // // // // }) {
// // // // //   const handleDelete = async (scheduleId) => {
// // // // //     if (
// // // // //       window.confirm(
// // // // //         "Are you sure you want to delete this schedule slot?"
// // // // //       )
// // // // //     ) {
// // // // //       await onDelete(scheduleId);
// // // // //       onRefresh();
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div className="schedules-table-container">
// // // // //       <table className="schedules-table">
// // // // //         <thead>
// // // // //           <tr>
// // // // //             <th>COURSE</th>
// // // // //             <th>TRAINER</th>
// // // // //             <th>DAY</th>
// // // // //             <th>TIME SLOT</th>
// // // // //             <th>SESSION</th>
// // // // //             <th>COLLEGE</th>
// // // // //             <th className="actions-column">
// // // // //               ACTIONS
// // // // //             </th>
// // // // //           </tr>
// // // // //         </thead>

// // // // //         <tbody>
// // // // //           {schedules.map((schedule) => (
// // // // //             <tr key={schedule.id}>
// // // // //               <td className="schedule-course">
// // // // //                 {schedule.course}
// // // // //               </td>

// // // // //               <td className="schedule-trainer">
// // // // //                 {schedule.trainer}
// // // // //               </td>

// // // // //               <td className="schedule-day">
// // // // //                 {schedule.day}
// // // // //               </td>

// // // // //               <td className="schedule-time">
// // // // //                 {schedule.timeSlot}
// // // // //               </td>

// // // // //               <td className="schedule-session">
// // // // //                 {schedule.session}
// // // // //               </td>

// // // // //               <td className="schedule-college">
// // // // //                 {schedule.college}
// // // // //               </td>

// // // // //               <td className="schedule-actions">
// // // // //                 <button
// // // // //                   className="btn-action btn-edit"
// // // // //                   title="Edit Schedule"
// // // // //                   onClick={() =>
// // // // //                     (window.location.href = `/schedules/${schedule.id}/edit`)
// // // // //                   }
// // // // //                 >
// // // // //                   <Pencil />
// // // // //                 </button>

// // // // //                 <button
// // // // //                   className="btn-action btn-delete"
// // // // //                   title="Delete Schedule"
// // // // //                   onClick={() =>
// // // // //                     handleDelete(schedule.id)
// // // // //                   }
// // // // //                 >
// // // // //                   <Trash2 />
// // // // //                 </button>
// // // // //               </td>
// // // // //             </tr>
// // // // //           ))}
// // // // //         </tbody>
// // // // //       </table>

// // // // //       {schedules.length === 0 && (
// // // // //         <div className="no-data">
// // // // //           No schedules found
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }