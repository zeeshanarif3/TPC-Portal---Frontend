import "./SchedulesTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function SchedulesTable({

  schedules = [],

  onDelete,

  onRefresh,

  setUpdateScheduledata,

  setshowUpdateSchedule,

  fetchTrainerById,

  token,

}) {

  const [trainers, setTrainers] = useState("");

  // Fetch all trainers used in schedules
  useEffect(() => {

    const loadTrainers = async () => {

      const ids = new Set();


      schedules.forEach(schedule => {

            if (schedule.trainerId) {
              const id = schedule.trainerId;
              ids.add(id);

            }


      });



      for (const id of ids) {


          try {

            const trainername =
              await fetchTrainerById(
                id,
                token
              );


            setTrainers(trainername?.name || "Unknown");


          } catch (error) {

            console.error(
              "Trainer fetch failed",
              error
            );




        }

      }

    };


    if (schedules.length)
      loadTrainers();


  }, [
    schedules,
    token
  ]);


  const handleDelete = async (scheduleId) => {


    if (
      window.confirm(
        "Are you sure you want to delete this schedule?"
      )
    ) {


      try {


        await onDelete(scheduleId);



        if (onRefresh) {
          onRefresh();
        }


      }
      catch (err) {

        alert(
          err.message ||
          "Failed deleting schedule"
        );

      }


    }


  };







  const rows = schedules.map(schedule => ({


    id:
      schedule._id,


    scheduleId:
      schedule._id,



    course:
      schedule.courseId?.courseCode ||
      "-",



    trainer:
      trainers||
      "-",



    trainerId:
      schedule.trainerId?._id ||
      schedule.trainerId ||
      "",



    date:
      schedule.date ||
      "-",



    timeSlot:

      `${schedule.startTime || "-"} - ${schedule.endTime || "-"
      }`,



    session:

      schedule.sessionId

        ?

        `${new Date(
          schedule.sessionId.startDate
        )
          .toLocaleDateString()

        }

      -

      ${new Date(
          schedule.sessionId.endDate
        )
          .toLocaleDateString()

        }`

        :

        "-",




    roomNo:

      schedule.roomNo || "-",



    topic:

      schedule.topic || "-",



    original:
      schedule


  }));









  return (

    <div className="schedules-table-container">


      <table className="schedules-table">


        <thead>

          <tr>

            <th>
              COURSE
            </th>


            <th>
              TRAINER
            </th>


            <th>
              DATE
            </th>


            <th>
              TIME SLOT
            </th>


            <th>
              ROOM
            </th>


            <th>
              TOPIC
            </th>


            <th>
              SESSION
            </th>


            <th className="actions-column">
              ACTIONS
            </th>


          </tr>


        </thead>





        <tbody>



          {
            rows.map(schedule => (


              <tr key={schedule.id}>


                <td className="schedule-course">

                  {schedule.course}

                </td>





                <td className="schedule-trainer">

                  {trainers}
                  {/* <pre>{JSON.stringify(trainers, null, 2)}</pre> */}


                </td>






                <td className="schedule-date">

                  {schedule.date}

                </td>






                <td className="schedule-time">

                  {schedule.timeSlot}

                </td>






                <td>

                  {schedule.roomNo}

                </td>






                <td>

                  {schedule.topic}

                </td>






                <td className="schedule-session">

                  {schedule.session}

                </td>







                <td className="schedule-actions">


                  <button

                    className="btn-action btn-edit"

                    title="Edit Schedule"


                    onClick={() => {


                      setUpdateScheduledata(
                        schedule.original
                      );


                      setshowUpdateSchedule(
                        true
                      );


                    }}


                  >


                    <Pencil />

                  </button>








                  <button

                    className="btn-action btn-delete"

                    title="Delete Schedule"


                    onClick={() =>


                      handleDelete(
                        schedule.scheduleId
                      )


                    }


                  >


                    <Trash2 />

                  </button>




                </td>






              </tr>


            ))


          }



        </tbody>



      </table>








      {
        rows.length === 0 &&

        <div className="no-data">

          No schedules found

        </div>

      }



    </div>


  );


}


















// import "./SchedulesTable.css";
// import { Pencil, Trash2 } from "lucide-react";

// export default function SchedulesTable({
//   schedules,
//   onDelete,
//   onRefresh,
//   setUpdateScheduledata,
//   setshowUpdateSchedule
// }) {
//   const handleDelete = async (scheduleId) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this schedule?"
//       )
//     ) {
//       await onDelete(scheduleId);
//       onRefresh();
//     }
//   };

//   const rows = schedules.flatMap((schedule) =>
//     Object.entries(schedule.slots || {}).flatMap(([day, slots]) =>
//       slots.map((slot) => ({
//         id: slot._id,
//         scheduleId: schedule._id,
//         course: schedule.courseId?.courseCode || "-",
//         session: schedule.sessionId
//           ? `${new Date(schedule.sessionId.startDate).toLocaleDateString()} - ${new Date(
//               schedule.sessionId.endDate
//             ).toLocaleDateString()}`
//           : "-",
//         college: schedule.college?.collegeName || "-",
//         trainer: schedule.trainer?.name || "-",
//         day: day.charAt(0).toUpperCase() + day.slice(1),
//         timeSlot: `${slot.startTime} - ${slot.endTime}`,
//       }))
//     )
//   );

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
//           {rows.map((schedule) => (
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
//                   // onClick={() =>
//                   //   (window.location.href = `/schedules/${schedule.scheduleId}/edit`)
//                   // }
//                   onClick={() =>
//                     {
//                       setUpdateScheduledata(schedule);
//                       setshowUpdateSchedule(true);
//                     }
//                   }
//                 >
//                   <Pencil />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete Schedule"
//                   onClick={() =>
//                     handleDelete(schedule.scheduleId)
//                   }
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
//           No schedules found
//         </div>
//       )}
//     </div>
//   );
// }



// // import "./SchedulesTable.css";

// // import {
// //   Pencil,
// //   Trash2,
// // } from "lucide-react";

// // export default function SchedulesTable({
// //   schedules,
// //   onDelete,
// //   onRefresh,
// // }) {
// //   const handleDelete = async (scheduleId) => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this schedule slot?"
// //       )
// //     ) {
// //       await onDelete(scheduleId);
// //       onRefresh();
// //     }
// //   };

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
// //           {schedules.map((schedule) => (
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
// //                   onClick={() =>
// //                     (window.location.href = `/schedules/${schedule.id}/edit`)
// //                   }
// //                 >
// //                   <Pencil />
// //                 </button>

// //                 <button
// //                   className="btn-action btn-delete"
// //                   title="Delete Schedule"
// //                   onClick={() =>
// //                     handleDelete(schedule.id)
// //                   }
// //                 >
// //                   <Trash2 />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {schedules.length === 0 && (
// //         <div className="no-data">
// //           No schedules found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }