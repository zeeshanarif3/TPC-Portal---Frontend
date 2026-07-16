// SchedulesTable.jsx
import "./SchedulesTable.css";
import { Pencil, SendHorizontal, Copy } from "lucide-react";
import { useMemo } from "react";

export default function SchedulesTable({
  schedules = [],
  token,
  setTopicFeedbackData,
  setShowTopicFeedbackModal,
  setshowAttendanceModal,
  setselectedcourse,
}) {
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const shortId = (id) => {
    if (!id) return "—";
    return id.length > 10 ? `${id.slice(0, 10)}...` : id;
  };

  const getStatus = (schedule) => {
    if (schedule?.status) return schedule.status;
    return "active";
  };

  const normalizeStatusLabel = (status) => {
    if (!status) return "Active";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const rows = useMemo(() => {
    return schedules.map((schedule) => {
      const status = getStatus(schedule);
      const isCancelled = status === "cancelled";
      const isCompleted = status === "completed";

      return {
        id: schedule._id,
        course: schedule.course?.courseCode || "—",
        date: schedule.date || null,
        timeSlot: `${schedule.startTime || "—"} - ${schedule.endTime || "—"}`,
        session: schedule.session
          ? `${formatDate(schedule.session.startDate)} – ${formatDate(schedule.session.endDate)}`
          : "—",
        roomNo: schedule.roomNo || "—",
        topic: schedule.topic || "—",
        status,
        isCancelled,
        isCompleted,
        original: schedule,
      };
    });
  }, [schedules]);

  return (
    <div className="schedules-table-container">
      
      <table className="schedules-table">
        <thead>
          <tr>
            <th>COURSE</th>
            <th>DATE</th>
            <th>TIME SLOT</th>
            <th>ROOM</th>
            <th>TOPIC</th>
            <th>SESSION</th>
            <th>STATUS</th>
            <th className="actions-column">ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((schedule) => (
            
            <tr
              key={schedule.id}
              className={
                schedule.isCancelled
                  ? "schedule-cancelled"
                  : schedule.isCompleted
                  ? "schedule-completed"
                  : ""
              }
            > 
            {/* <pre>{JSON.stringify(schedule, null, 2)}</pre> */}
              <td className="schedule-course">{schedule.course}</td>

              <td className="schedule-date">
                {schedule.date ? formatDate(schedule.date) : "—"}
              </td>

              <td className="schedule-time">{schedule.timeSlot}</td>

              <td>{schedule.roomNo}</td>

              <td title={schedule.topic}>{schedule.topic}</td>

              <td className="schedule-session">{schedule.session}</td>

              <td>
                <span
                  className={`status-badge status-${schedule.status.toLowerCase()}`}
                >
                  {normalizeStatusLabel(schedule.status)}
                </span>
              </td>

              <td className="schedule-actions">
                <button
                  className="btn-action btn-edit"
                  title="Copy Schedule ID"
                  onClick={() => copyToClipboard(schedule.id)}
                >
                  <Copy />
                </button>

                <button
                  className="btn-action btn-edit"
                  title="Edit Schedule"
                  onClick={() => {
                    setTopicFeedbackData(schedule.original);
                    setShowTopicFeedbackModal(true);
                  }}
                  >
                  <Pencil />
                </button>

                <button
                  className="btn-action btn-edit"
                  title="Set Attendance"
                  disabled={schedule.isCancelled}
                    onClick={() => {
                      setselectedcourse(schedule.original.course._id);
                      console.log(schedule.original.course._id);

                      setTopicFeedbackData(schedule.original);
                      setshowAttendanceModal(true);
                    }}
                >
                  <SendHorizontal />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="no-data">
          <h3>No schedules found</h3>
          <p>Try changing the search or date selection.</p>
        </div>
      )}
    </div>
  );
}













// import "./SchedulesTable.css";
// import { Pencil, Trash2, SendHorizontal } from "lucide-react";
// import { useState, useEffect } from "react";

// export default function SchedulesTable({

//   schedules = [],

//   token,
//   setTopicFeedbackData,
//   setShowTopicFeedbackModal,
//   setshowAttendanceModal,

// }) {










//   const rows = schedules.map(schedule => {

//     const trainerId =
//       schedule.trainerId?._id ||
//       schedule.trainerId ||
//       "";

//     const isCompleted =
//       schedule.status === "completed" &&
//       schedule.headCount != null &&
//       schedule.topic?.trim();

//     const isCancelled =
//       schedule.status === "cancelled";

//     return {

//       id:
//         schedule._id,


//       scheduleId:
//         schedule._id,



//       course:
//         schedule.course?.courseCode ||
//         "-",





//       date:
//         schedule.date ||
//         "-",



//       timeSlot:

//         `${schedule.startTime || "-"} - ${schedule.endTime || "-"
//         }`,



//       session:

//         schedule.session

//           ?

//           `${new Date(
//             schedule.session.startDate
//           )
//             .toLocaleDateString()

//           }

//       -

//       ${new Date(
//             schedule.session.endDate
//           )
//             .toLocaleDateString()

//           }`

//           :

//           "-",




//       roomNo:

//         schedule.roomNo || "-",



//       topic:

//         schedule.topic || "-",

//       isCancelled,
//       isCompleted,


//       original:
//         schedule


//     }
//   });









//   return (

//     <div className="schedules-table-container">


//       <table className="schedules-table">


//         <thead>

//           <tr>

//             <th>
//               COURSE
//             </th>


//             <th>
//               DATE
//             </th>


//             <th>
//               TIME SLOT
//             </th>


//             <th>
//               ROOM
//             </th>


//             <th>
//               TOPIC
//             </th>


//             <th>
//               SESSION
//             </th>


//             <th className="actions-column">
//               ACTIONS
//             </th>


//           </tr>


//         </thead>





//         <tbody>



//           {
//             rows.map(schedule => (


//               // <tr key={schedule.id}>

//               <tr
//                 key={schedule.id}
//                 className={
//                   schedule.isCancelled
//                     ? "schedule-cancelled"
//                     : schedule.isCompleted
//                       ? "schedule-completed"
//                       : ""
//                 }
//               >

//                 <td className="schedule-course">

//                   {schedule.course}

//                 </td>





//                 <td className="schedule-date">

//                   {schedule.date}

//                 </td>






//                 <td className="schedule-time">

//                   {schedule.timeSlot}

//                 </td>






//                 <td>

//                   {schedule.roomNo}

//                 </td>






//                 <td>

//                   {schedule.topic}

//                 </td>






//                 <td className="schedule-session">

//                   {schedule.session}

//                 </td>







//                 <td className="schedule-actions">


//                   <button

//                     className="btn-action btn-edit"

//                     title="Edit Schedule"


//                     onClick={() => {


//                       setTopicFeedbackData(schedule.original);


//                       setShowTopicFeedbackModal(true);


//                     }}


//                   >


//                     <Pencil />

//                   </button>

//                   <button

//                     className="btn-action btn-edit"

//                     title="Set Attendance"


//                     onClick={() => {


//                       setTopicFeedbackData(schedule.original);


//                       setshowAttendanceModal(true);


//                     }}


//                   >


//                     <SendHorizontal />

//                   </button>













//                 </td>






//               </tr>


//             ))


//           }



//         </tbody>



//       </table>








//       {
//         rows.length === 0 &&

//         <div className="no-data">

//           No schedules found

//         </div>

//       }



//     </div>


//   );


// }














// // import "./SchedulesTable.css";
// // import { Pencil, Trash2 } from "lucide-react";

// // export default function SchedulesTable({
// //   schedules,
// //   onDelete,
// //   onRefresh,
// //   setUpdateScheduledata,
// //   setshowUpdateSchedule
// // }) {
// //   const handleDelete = async (scheduleId) => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this schedule?"
// //       )
// //     ) {
// //       await onDelete(scheduleId);
// //       onRefresh();
// //     }
// //   };

// //   const rows = schedules.flatMap((schedule) =>
// //     Object.entries(schedule.slots || {}).flatMap(([day, slots]) =>
// //       slots.map((slot) => ({
// //         id: slot._id,
// //         scheduleId: schedule._id,
// //         course: schedule.courseId?.courseCode || "-",
// //         session: schedule.sessionId
// //           ? `${new Date(schedule.sessionId.startDate).toLocaleDateString()} - ${new Date(
// //               schedule.sessionId.endDate
// //             ).toLocaleDateString()}`
// //           : "-",
// //         college: schedule.college?.collegeName || "-",
// //         trainer: schedule.trainer?.name || "-",
// //         day: day.charAt(0).toUpperCase() + day.slice(1),
// //         timeSlot: `${slot.startTime} - ${slot.endTime}`,
// //       }))
// //     )
// //   );

// //   return (
// //     <div className="schedules-table-container">
// //       <table className="schedules-table">
// //         <thead>
// //           <tr>
// //             <th>COURSE</th>
// //             <th>TRAINER</th>
// //             <th>DAY</th>
// //             <th>TIME SLOT</th>
// //             <th>SESSION</th>
// //             <th>COLLEGE</th>
// //             <th className="actions-column">
// //               ACTIONS
// //             </th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {rows.map((schedule) => (
// //             <tr key={schedule.id}>
// //               <td className="schedule-course">
// //                 {schedule.course}
// //               </td>

// //               <td className="schedule-trainer">
// //                 {schedule.trainer}
// //               </td>

// //               <td className="schedule-day">
// //                 {schedule.day}
// //               </td>

// //               <td className="schedule-time">
// //                 {schedule.timeSlot}
// //               </td>

// //               <td className="schedule-session">
// //                 {schedule.session}
// //               </td>

// //               <td className="schedule-college">
// //                 {schedule.college}
// //               </td>

// //               <td className="schedule-actions">
// //                 <button
// //                   className="btn-action btn-edit"
// //                   title="Edit Schedule"
// //                   // onClick={() =>
// //                   //   (window.location.href = `/schedules/${schedule.scheduleId}/edit`)
// //                   // }
// //                   onClick={() =>
// //                     {
// //                       setUpdateScheduledata(schedule);
// //                       setshowUpdateSchedule(true);
// //                     }
// //                   }
// //                 >
// //                   <Pencil />
// //                 </button>

// //                 <button
// //                   className="btn-action btn-delete"
// //                   title="Delete Schedule"
// //                   onClick={() =>
// //                     handleDelete(schedule.scheduleId)
// //                   }
// //                 >
// //                   <Trash2 />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {rows.length === 0 && (
// //         <div className="no-data">
// //           No schedules found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }


// // // import "./SchedulesTable.css";
// // // import { Pencil, Trash2 } from "lucide-react";

// // // export default function SchedulesTable({
// // //   schedules,
// // //   onDelete,
// // //   onRefresh,
// // //   setUpdateScheduledata,
// // //   setshowUpdateSchedule
// // // }) {
// // //   const handleDelete = async (scheduleId) => {
// // //     if (
// // //       window.confirm(
// // //         "Are you sure you want to delete this schedule?"
// // //       )
// // //     ) {
// // //       await onDelete(scheduleId);
// // //       onRefresh();
// // //     }
// // //   };

// // //   const rows = schedules.flatMap((schedule) =>
// // //     Object.entries(schedule.slots || {}).flatMap(([day, slots]) =>
// // //       slots.map((slot) => ({
// // //         id: slot._id,
// // //         scheduleId: schedule._id,
// // //         course: schedule.courseId?.courseCode || "-",
// // //         session: schedule.sessionId
// // //           ? `${new Date(schedule.sessionId.startDate).toLocaleDateString()} - ${new Date(
// // //               schedule.sessionId.endDate
// // //             ).toLocaleDateString()}`
// // //           : "-",
// // //         college: schedule.college?.collegeName || "-",
// // //         trainer: schedule.trainer?.name || "-",
// // //         day: day.charAt(0).toUpperCase() + day.slice(1),
// // //         timeSlot: `${slot.startTime} - ${slot.endTime}`,
// // //       }))
// // //     )
// // //   );

// // //   return (
// // //     <div className="schedules-table-container">
// // //       <table className="schedules-table">
// // //         <thead>
// // //           <tr>
// // //             <th>COURSE</th>
// // //             <th>TRAINER</th>
// // //             <th>DAY</th>
// // //             <th>TIME SLOT</th>
// // //             <th>SESSION</th>
// // //             <th>COLLEGE</th>
// // //             <th className="actions-column">
// // //               ACTIONS
// // //             </th>
// // //           </tr>
// // //         </thead>

// // //         <tbody>
// // //           {rows.map((schedule) => (
// // //             <tr key={schedule.id}>
// // //               <td className="schedule-course">
// // //                 {schedule.course}
// // //               </td>

// // //               <td className="schedule-trainer">
// // //                 {schedule.trainer}
// // //               </td>

// // //               <td className="schedule-day">
// // //                 {schedule.day}
// // //               </td>

// // //               <td className="schedule-time">
// // //                 {schedule.timeSlot}
// // //               </td>

// // //               <td className="schedule-session">
// // //                 {schedule.session}
// // //               </td>

// // //               <td className="schedule-college">
// // //                 {schedule.college}
// // //               </td>

// // //               <td className="schedule-actions">
// // //                 <button
// // //                   className="btn-action btn-edit"
// // //                   title="Edit Schedule"
// // //                   // onClick={() =>
// // //                   //   (window.location.href = `/schedules/${schedule.scheduleId}/edit`)
// // //                   // }
// // //                   onClick={() =>
// // //                     {
// // //                       setUpdateScheduledata(schedule);
// // //                       setshowUpdateSchedule(true);
// // //                     }
// // //                   }
// // //                 >
// // //                   <Pencil />
// // //                 </button>

// // //                 <button
// // //                   className="btn-action btn-delete"
// // //                   title="Delete Schedule"
// // //                   onClick={() =>
// // //                     handleDelete(schedule.scheduleId)
// // //                   }
// // //                 >
// // //                   <Trash2 />
// // //                 </button>
// // //               </td>
// // //             </tr>
// // //           ))}
// // //         </tbody>
// // //       </table>

// // //       {rows.length === 0 && (
// // //         <div className="no-data">
// // //           No schedules found
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }



// // // // import "./SchedulesTable.css";

// // // // import {
// // // //   Pencil,
// // // //   Trash2,
// // // // } from "lucide-react";

// // // // export default function SchedulesTable({
// // // //   schedules,
// // // //   onDelete,
// // // //   onRefresh,
// // // // }) {
// // // //   const handleDelete = async (scheduleId) => {
// // // //     if (
// // // //       window.confirm(
// // // //         "Are you sure you want to delete this schedule slot?"
// // // //       )
// // // //     ) {
// // // //       await onDelete(scheduleId);
// // // //       onRefresh();
// // // //     }
// // // //   };

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
// // // //           {schedules.map((schedule) => (
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
// // // //                   onClick={() =>
// // // //                     (window.location.href = `/schedules/${schedule.id}/edit`)
// // // //                   }
// // // //                 >
// // // //                   <Pencil />
// // // //                 </button>

// // // //                 <button
// // // //                   className="btn-action btn-delete"
// // // //                   title="Delete Schedule"
// // // //                   onClick={() =>
// // // //                     handleDelete(schedule.id)
// // // //                   }
// // // //                 >
// // // //                   <Trash2 />
// // // //                 </button>
// // // //               </td>
// // // //             </tr>
// // // //           ))}
// // // //         </tbody>
// // // //       </table>

// // // //       {schedules.length === 0 && (
// // // //         <div className="no-data">
// // // //           No schedules found
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }