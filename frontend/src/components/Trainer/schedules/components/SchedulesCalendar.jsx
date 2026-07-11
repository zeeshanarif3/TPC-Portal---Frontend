



import { useState } from "react";
import "./SchedulesCalendar.css";

export default function SchedulesCalendar({
  schedules = [],
  selectedDate,
  onSelectDate,
  onDelete,
  onRefresh,
  token,
}) {

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState(null);


  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];



  // Convert backend time into 24 hour number
  const convertHour = (time) => {

    if (!time) return null;


    let hour = parseInt(
      time.split(":")[0],
      10
    );


    if (
      time.includes("PM") &&
      hour !== 12
    ) {
      hour += 12;
    }


    if (
      time.includes("AM") &&
      hour === 12
    ) {
      hour = 0;
    }


    return hour;

  };




  // Convert 24 hour number to 12 hour display
  const formatHour = (hour) => {

    const date = new Date();

    date.setHours(
      hour,
      0,
      0,
      0
    );


    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }
    );

  };




  // Dynamic timetable hours
  // Default 8AM - 5PM
  // Extend according to schedules

  const generateTimeSlots = () => {

    const hours = new Set();


    // Default college timing
    for (let i = 8; i <= 17; i++) {

      hours.add(i);

    }



    schedules.forEach(schedule => {


      Object.values(
        schedule.slots || {}
      )
        .flat()
        .forEach(slot => {


          const start =
            convertHour(
              slot.startTime
            );


          const end =
            convertHour(
              slot.endTime
            );



          if (start !== null) {
            hours.add(start);
          }


          if (end !== null) {
            hours.add(end);
          }


        });


    });



    return [...hours]
      .sort((a, b) => a - b);


  };



  const timeSlots =
    generateTimeSlots();






  const handleDelete = async (scheduleId) => {


    if (
      window.confirm(
        "Delete this schedule?"
      )
    ) {

      await onDelete(
        scheduleId,
        token
      );


      onRefresh();

    }

  };







  const getSchedulesForSlot = (day, hour) => {


    const dayKey =
      day.toLowerCase();



    return schedules.flatMap(
      schedule => {


        const slots =
          schedule.slots?.[dayKey] || [];



        return slots
          .filter(slot => {


            return (
              convertHour(
                slot.startTime
              )
              === hour
            );


          })


          .map(slot => ({


            id: slot._id,


            scheduleId:
              schedule._id,


            course:
              schedule.courseId
                ?.courseCode ||
              "Unknown",



            trainer:
              schedule.trainerId
                ?.name ||
              "",



            startTime:
              slot.startTime,


            endTime:
              slot.endTime



          }));


      }
    );


  };







  const getDaysInMonth = (date) => {

    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();

  };



  const getFirstDayOfMonth = (date) => {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).getDay();

  };



  const formatDate = (date) => {

    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric"
      }
    );

  };



  const getDayName = (index) => {

    return [
      "SUN",
      "MON",
      "TUE",
      "WED",
      "THU",
      "FRI",
      "SAT"
    ][index];

  };




  const daysInMonth =
    getDaysInMonth(
      currentMonth
    );


  const firstDay =
    getFirstDayOfMonth(
      currentMonth
    );








  return (

    <div className="Schedulees-calendar-container">



      <div className="calendar-main">



        <div className="calendar-grid">


          <div className="grid-header">


            <div className="time-label">
              TIME
            </div>



            {
              weekDays.map(day => (

                <div
                  key={day}
                  className="day-header"
                >

                  {day}

                </div>

              ))
            }


          </div>







          {
            timeSlots.map(hour => (


              <div
                className="time-row"
                key={hour}
              >


                <div className="time-label">

                  {formatHour(hour)}

                </div>





                {
                  weekDays.map(day => (


                    <div

                      key={`${day}-${hour}`}

                      className="time-slot"


                      onMouseEnter={() =>
                        setHoveredSlot(
                          `${day}-${hour}`
                        )
                      }


                      onMouseLeave={() =>
                        setHoveredSlot(null)
                      }

                    >


                      {
                        getSchedulesForSlot(
                          day,
                          hour
                        )
                          .map(schedule => (


                            <div

                              key={schedule.id}

                              className="Schedulee-card"

                            >


                              <div className="card-title">

                                {schedule.course}

                              </div>



                              {
                                schedule.trainer &&

                                <div className="card-trainer">

                                  {schedule.trainer}

                                </div>

                              }



                              <div className="card-time">

                                {schedule.startTime}
                                -
                                {schedule.endTime}

                              </div>




                              {
                                hoveredSlot === `${day}-${hour}` &&

                                <button

                                  className="btn-delete-card"

                                  onClick={() =>
                                    handleDelete(
                                      schedule.scheduleId
                                    )
                                  }

                                >

                                  ×

                                </button>

                              }



                            </div>


                          ))

                      }



                    </div>


                  ))

                }



              </div>


            ))

          }



        </div>


      </div>









      <div className="mini-calendar">


        <div className="calendar-nav">


          <button
            onClick={() => setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1
              )
            )}
          >
            ‹
          </button>



          <span>

            {formatDate(currentMonth)}

          </span>



          <button
            onClick={() => setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1
              )
            )}
          >

            ›

          </button>


        </div>





        <div className="calendar-weekdays">

          {
            Array.from({ length: 7 })
              .map((_, i) => (

                <div
                  key={i}
                  className="weekday"
                >

                  {getDayName(i)}

                </div>

              ))
          }

        </div>





        <div className="calendar-dates">


          {
            Array.from({
              length: firstDay
            })
              .map((_, i) => (

                <div
                  key={i}
                  className="date empty"
                />

              ))
          }




          {
            Array.from({
              length: daysInMonth
            })
              .map((_, i) => {


                const date =
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    i + 1
                  );



                const today =
                  date.toDateString()
                  ===
                  new Date()
                    .toDateString();



                const selected =
                  selectedDate &&
                  date.toDateString()
                  ===
                  selectedDate.toDateString();



                return (

                  <div

                    key={i}

                    className={
                      `date
${today ? "today" : ""}
${selected ? "selected" : ""}`
                    }

                    onClick={() =>
                      onSelectDate(date)
                    }

                  >

                    {i + 1}

                  </div>

                )


              })

          }


        </div>




        <div className="calendar-today">

          Today

        </div>



      </div>



    </div>


  );


}












// import { useState } from "react";
// import "./SchedulesCalendar.css";

// export default function SchedulesCalendar({
//   schedules,
//   selectedDate,
//   onSelectDate,
//   onDelete,
//   onRefresh,
//   token,
// }) {
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [hoveredSlot, setHoveredSlot] = useState(null);

//   const handleDelete = async (scheduleId) => {
//     if (window.confirm("Are you sure you want to delete this schedule?")) {
//       await onDelete(scheduleId, token);
//       onRefresh();
//     }
//   };

//   const getDaysInMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   const formatDate = (date) => {
//     return date.toLocaleDateString("en-US", {
//       month: "long",
//       year: "numeric",
//     });
//   };

//   const getDayName = (index) => {
//     const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
//     return days[index];
//   };

//   const weekDays = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//   ];

//   // Generate unique time slots from backend data
//   const timeSlots = [
//     ...new Set(
//       schedules.flatMap((schedule) =>
//         Object.values(schedule.slots || {}).flat().map((slot) => {
//           let hour = parseInt(slot.startTime.split(":")[0], 10);

//           // Handle 12-hour format if backend ever returns AM/PM
//           if (slot.startTime.includes("PM") && hour !== 12) hour += 12;
//           if (slot.startTime.includes("AM") && hour === 12) hour = 0;

//           return `${String(hour).padStart(2, "0")}:00`;
//         })
//       )
//     ),
//   ].sort();

//   const getSchedulesForSlot = (day, time) => {
//     const dayKey = day.toLowerCase();
//     const hour = parseInt(time.split(":")[0], 10);

//     return schedules.flatMap((schedule) => {
//       const slots = schedule.slots?.[dayKey] || [];

//       return slots
//         .filter((slot) => {
//           let slotHour = parseInt(slot.startTime.split(":")[0], 10);

//           if (slot.startTime.includes("PM") && slotHour !== 12)
//             slotHour += 12;
//           if (slot.startTime.includes("AM") && slotHour === 12)
//             slotHour = 0;

//           return slotHour === hour;
//         })
//         .map((slot) => ({
//           id: slot._id,
//           scheduleId: schedule._id,
//           course: schedule.courseId?.courseCode || "Unknown Course",
//           session: schedule.sessionId,
//           startTime: slot.startTime,
//           endTime: slot.endTime,
//         }));
//     });
//   };

//   const daysInMonth = getDaysInMonth(currentMonth);
//   const firstDay = getFirstDayOfMonth(currentMonth);

//   return (
//     <div className="Schedulees-calendar-container">
//       <div className="calendar-main">
//         <div className="calendar-grid">
//           {/* Header */}
//           <div className="grid-header">
//             <div className="time-label">Time</div>

//             {weekDays.map((day) => (
//               <div key={day} className="day-header">
//                 {day}
//               </div>
//             ))}
//           </div>

//           {/* Time Rows */}
//           {timeSlots.map((time) => (
//             <div key={time} className="time-row">
//               <div className="time-label">{time}</div>

//               {weekDays.map((day) => (
//                 <div
//                   key={`${day}-${time}`}
//                   className="time-slot"
//                   onMouseEnter={() => setHoveredSlot(`${day}-${time}`)}
//                   onMouseLeave={() => setHoveredSlot(null)}
//                 >
//                   {getSchedulesForSlot(day, time).map((schedule) => (
//                     <div
//                       key={schedule.id}
//                       className={`Schedulee-card ${
//                         hoveredSlot === `${day}-${time}` ? "hovered" : ""
//                       }`}
//                     >
//                       <div className="card-title">{schedule.course}</div>

//                       <div className="card-time">
//                         {schedule.startTime} - {schedule.endTime}
//                       </div>

//                       {hoveredSlot === `${day}-${time}` && (
//                         <button
//                           className="btn-delete-card"
//                           onClick={() => handleDelete(schedule.scheduleId)}
//                         >
//                           ×
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Mini Calendar */}
//       <div className="mini-calendar">
//         <div className="calendar-nav">
//           <button
//             onClick={() =>
//               setCurrentMonth(
//                 new Date(
//                   currentMonth.getFullYear(),
//                   currentMonth.getMonth() - 1
//                 )
//               )
//             }
//           >
//             ‹
//           </button>

//           <span className="calendar-month">
//             {formatDate(currentMonth)}
//           </span>

//           <button
//             onClick={() =>
//               setCurrentMonth(
//                 new Date(
//                   currentMonth.getFullYear(),
//                   currentMonth.getMonth() + 1
//                 )
//               )
//             }
//           >
//             ›
//           </button>
//         </div>

//         <div className="calendar-weekdays">
//           {Array.from({ length: 7 }).map((_, i) => (
//             <div key={i} className="weekday">
//               {getDayName(i)}
//             </div>
//           ))}
//         </div>

//         <div className="calendar-dates">
//           {Array.from({ length: firstDay }).map((_, i) => (
//             <div key={`empty-${i}`} className="date empty"></div>
//           ))}

//           {Array.from({ length: daysInMonth }).map((_, i) => {
//             const date = new Date(
//               currentMonth.getFullYear(),
//               currentMonth.getMonth(),
//               i + 1
//             );

//             const isToday =
//               date.toDateString() === new Date().toDateString();

//             const isSelected =
//               selectedDate &&
//               date.toDateString() === selectedDate.toDateString();

//             return (
//               <div
//                 key={i}
//                 className={`date ${isToday ? "today" : ""} ${
//                   isSelected ? "selected" : ""
//                 }`}
//                 onClick={() => onSelectDate(date)}
//               >
//                 {i + 1}
//               </div>
//             );
//           })}
//         </div>

//         <div className="calendar-today">Today</div>
//       </div>
//     </div>
//   );
// }


// // import { useState } from 'react';


// // import './SchedulesCalendar.css'
// // export default function SchedulesCalendar({ schedules, selectedDate, onSelectDate, onDelete, onRefresh }) {
// //   const [currentMonth, setCurrentMonth] = useState(new Date());
// //   const [hoveredSlot, setHoveredSlot] = useState(null);

// //   const handleDelete = async (scheduleId) => {
// //     if (window.confirm('Are you sure you want to delete this schedule slot?')) {
// //       await onDelete(scheduleId);
// //       onRefresh();
// //     }
// //   };

// //   const getDaysInMonth = (date) => {
// //     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
// //   };

// //   const getFirstDayOfMonth = (date) => {
// //     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
// //   };

// //   const formatDate = (date) => {
// //     return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
// //   };

// //   const getDayName = (index) => {
// //     const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// //     return days[index];
// //   };

// //   const timeSlots = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
// //   const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// //   const getSchedulesForSlot = (day, time) => {
// //     return schedules.filter(s => s.day === day && s.timeSlot.startsWith(time.split(':')[0]));
// //   };

// //   const daysInMonth = getDaysInMonth(currentMonth);
// //   const firstDay = getFirstDayOfMonth(currentMonth);

// //   return (
// //     <div className="Schedulees-calendar-container">
// //       <div className="calendar-main">
// //         {/* Weekly Grid */}
// //         <div className="calendar-grid">
// //           {/* Header */}
// //           <div className="grid-header">
// //             <div className="time-label">Time</div>
// //             {weekDays.map(day => (
// //               <div key={day} className="day-header">{day}</div>
// //             ))}
// //           </div>

// //           {/* Time Slots */}
// //           {timeSlots.map(time => (
// //             <div key={time} className="time-row">
// //               <div className="time-label">{time}</div>
// //               {weekDays.map(day => (
// //                 <div
// //                   key={`${day}-${time}`}
// //                   className="time-slot"
// //                   onMouseEnter={() => setHoveredSlot(`${day}-${time}`)}
// //                   onMouseLeave={() => setHoveredSlot(null)}
// //                 >
// //                   {getSchedulesForSlot(day, time).map(schedule => (
// //                     <div
// //                       key={schedule.id}
// //                       className={`Schedulee-card ${hoveredSlot === `${day}-${time}` ? 'hovered' : ''}`}
// //                     >
// //                       <div className="card-title">{schedule.course}</div>
// //                       <div className="card-trainer">{schedule.trainer}</div>
// //                       {hoveredSlot === `${day}-${time}` && (
// //                         <button
// //                           className="btn-delete-card"
// //                           onClick={() => handleDelete(schedule.id)}
// //                         >
// //                           ×
// //                         </button>
// //                       )}
// //                     </div>
// //                   ))}
// //                 </div>
// //               ))}
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Mini Calendar */}
// //       <div className="mini-calendar">
// //         <div className="calendar-nav">
// //           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
// //             ‹
// //           </button>
// //           <span className="calendar-month">{formatDate(currentMonth)}</span>
// //           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
// //             ›
// //           </button>
// //         </div>

// //         <div className="calendar-weekdays">
// //           {Array.from({ length: 7 }).map((_, i) => (
// //             <div key={i} className="weekday">{getDayName(i)}</div>
// //           ))}
// //         </div>

// //         <div className="calendar-dates">
// //           {Array.from({ length: firstDay }).map((_, i) => (
// //             <div key={`empty-${i}`} className="date empty"></div>
// //           ))}
// //           {Array.from({ length: daysInMonth }).map((_, i) => {
// //             const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
// //             const isToday = date.toDateString() === new Date().toDateString();
// //             return (
// //               <div
// //                 key={i + 1}
// //                 className={`date ${isToday ? 'today' : ''} ${
// //                   date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
// //                 }`}
// //                 onClick={() => onSelectDate(date)}
// //               >
// //                 {i + 1}
// //               </div>
// //             );
// //           })}
// //         </div>

// //         <div className="calendar-today">Today</div>
// //       </div>
// //     </div>
// //   );
// // }