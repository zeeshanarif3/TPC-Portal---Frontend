import { useState, useEffect, useMemo, } from "react";
import { Pencil, Trash2, SendHorizontal } from "lucide-react";
import "./SchedulesCalendar.css";

export default function SchedulesCalendar({
  schedules = [],
  selectedDate,
  onSelectDate,
  token,
  setTopicFeedbackData,
  setShowTopicFeedbackModal,
  setshowAttendanceModal,
  onDelete,
  onRefresh,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() =>
    getMonday(selectedDate ? new Date(selectedDate) : new Date())
  );

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value._id || value.id || "";
    return String(value);
  };

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sun ... 6 = Sat
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const isInSelectedWeek = (date) => {
    if (!date) return false;

    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return date >= selectedWeekStart && date < weekEnd;
  };

  useEffect(() => {
    if (selectedDate) {
      setSelectedWeekStart(getMonday(new Date(selectedDate)));
    }
  }, [selectedDate]);

  const parseTimeToHour = (time) => {
    if (!time) return null;

    const raw = String(time).trim().toUpperCase();

    const hasAM = raw.includes("AM");
    const hasPM = raw.includes("PM");

    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?$/);
    if (!match) return null;

    let hour = parseInt(match[1], 10);

    if (hasAM || hasPM) {
      if (hasPM && hour !== 12) hour += 12;
      if (hasAM && hour === 12) hour = 0;
      return hour;
    }

    if (hour >= 0 && hour <= 23) return hour;
    return null;
  };

  const formatHour = (hour) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getScheduleDate = (schedule) => {
    if (!schedule?.date) return null;
    const d = new Date(schedule.date);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const getScheduleDayName = (schedule) => {
    const date = getScheduleDate(schedule);
    if (!date) return null;
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const generateTimeSlots = () => {
    const hours = new Set();

    for (let i = 8; i <= 17; i++) hours.add(i);

    schedules.forEach((schedule) => {
      const start = parseTimeToHour(schedule.startTime);
      const end = parseTimeToHour(schedule.endTime);

      if (start !== null) hours.add(start);
      if (end !== null) hours.add(end);
    });

    return [...hours].sort((a, b) => a - b);
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [schedules]);

  const handleDelete = async (id) => {
    if (!id) return;

    if (window.confirm("Delete this schedule?")) {
      try {
        await onDelete(id, token);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert(err.message || "Failed deleting schedule");
      }
    }
  };

  const getSchedulesForSlot = (day, hour) => {
    return schedules
      .filter((schedule) => {
        const scheduleDay = getScheduleDayName(schedule);
        const startHour = parseTimeToHour(schedule.startTime);
        const scheduleDate = getScheduleDate(schedule);

        return (
          scheduleDay === day &&
          startHour === hour &&
          isInSelectedWeek(scheduleDate)
        );
      })
      .map((schedule) => {
        const trainerId = normalizeId(schedule.trainerId);

        const isCompleted =
          schedule.status === "completed" &&
          schedule.headCount != null &&
          schedule.topic?.trim();

        const isCancelled = schedule.status === "cancelled";

        return {
          id: schedule._id,
          scheduleId: schedule._id,
          course: schedule.course?.courseCode || "Unknown",
          trainerId,
          roomNo: schedule.roomNo,
          topic: schedule.topic,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          originalSchedule: schedule,
          isCompleted,
          isCancelled,
        };
      });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const ymd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const mondayFirstDay = (firstDay + 6) % 7;

  const scheduledDates = new Set(
    schedules
      .map((s) => {
        const d = getScheduleDate(s);
        return d ? ymd(d) : null;
      })
      .filter(Boolean)
  );

  const selectedDateFormatted = selectedDate
    ? ymd(new Date(selectedDate))
    : null;

  const selectedWeekStartFormatted = ymd(selectedWeekStart);

  const cells = [
    ...Array.from({ length: mondayFirstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="Schedulees-calendar-container">
      <div className="calendar-main">
        <div className="calendar-grid">
          <div className="grid-header">
            <div className="time-label">TIME</div>

            {weekDays.map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
          </div>

          {timeSlots.map((hour) => (
            <div key={hour} className="time-row">
              <div className="time-label">{formatHour(hour)}</div>

              {weekDays.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  className="time-slot"
                  onMouseEnter={() => setHoveredSlot(`${day}-${hour}`)}
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  {getSchedulesForSlot(day, hour).map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`Schedulee-card ${schedule.isCancelled
                        ? "schedule-cancelled-card"
                        : schedule.isCompleted
                          ? "schedule-completed-card"
                          : ""
                        }`}
                    >
                      <div className="card-title">{schedule.course}</div>

                      <div className="card-time">
                        {schedule.startTime} - {schedule.endTime}
                      </div>

                      <div>Room: {schedule.roomNo || "-"}</div>

                      {schedule.topic && <div>{schedule.topic}</div>}

                      {hoveredSlot === `${day}-${hour}` && (
                        <div className="card-actions2">
                          {/* <button
                            className="btn-edit-card"
                            onClick={() => {
                              setTopicFeedbackData(schedule.originalSchedule);
                              setShowTopicFeedbackModal(true);
                            }}
                          >
                          <Pencil />
                          </button> */}
                          <button

                            className="btn-action2 btn-edit"

                            title="Edit Schedule"


                            onClick={() => {
                              setTopicFeedbackData(schedule.originalSchedule);
                              setShowTopicFeedbackModal(true);

                            }}


                          >


                            <Pencil />

                          </button>
                          <button

                            className="btn-action2 btn-edit"

                            title="Set Attendance"


                            onClick={() => {
                              setTopicFeedbackData(schedule.originalSchedule);
                              setshowAttendanceModal(true);
                            }}


                          >


                            <SendHorizontal />

                          </button>
                          {/* <button
                            className="btn-delete-card"
                            onClick={() => handleDelete(schedule.scheduleId)}
                          >
                            ×
                          </button> */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mini-calendar">
        <div className="calendar-nav">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
          >
            ‹
          </button>

          <span>{formatMonthYear(currentMonth)}</span>

          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
          >
            ›
          </button>
        </div>

        <div className="calendar-weekdays">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-dates-wrapper">
          {weeks.map((week, wi) => {
            const isSelectedWeek = week.some((day) => {
              if (!day) return false;

              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              );

              return ymd(getMonday(date)) === selectedWeekStartFormatted;
            });

            return (
              <div
                key={wi}
                className={`calendar-week-row ${isSelectedWeek ? "selected-week-row" : ""
                  }`}
              >
                {isSelectedWeek && <span className="active-week-dot" />}

                <div className="calendar-dates">
                  {week.map((day, di) => {
                    if (day === null) {
                      return <div key={di} className="date empty" />;
                    }

                    const date = new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day
                    );

                    const today =
                      date.toDateString() === new Date().toDateString();

                    const selected =
                      selectedDateFormatted && ymd(date) === selectedDateFormatted;

                    const hasSchedule = scheduledDates.has(ymd(date));

                    return (
                      <div
                        key={di}
                        className={`date ${today ? "today" : ""} ${selected ? "selected" : ""
                          } ${hasSchedule ? "has-schedule" : ""}`}
                        onClick={() => onSelectDate(date)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="calendar-today">Today</div>
      </div>
    </div>
  );
}












// import { useState, useEffect, useMemo } from "react";
// import "./SchedulesCalendar.css";

// export default function SchedulesCalendar({
//   schedules = [],
//   selectedDate,
//   onSelectDate,
//   token,

//   setTopicFeedbackData,
//   setShowTopicFeedbackModal,

//   onDelete,
//   onRefresh,

//   // fetchTrainerById,

// }) {
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [hoveredSlot, setHoveredSlot] = useState(null);
//   // const [trainers, setTrainers] = useState({});

//   const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

//   const normalizeId = (value) => {
//     if (!value) return "";
//     if (typeof value === "string") return value;
//     if (typeof value === "object") return value._id || value.id || "";
//     return String(value);
//   };

//   // const getTrainerNameFromResponse = (data) => {
//   //   if (!data) return "Unknown";
//   //   if (typeof data === "string") return data;
//   //   return data.name || data.fullName || data.trainerName || "Unknown";
//   // };

//   // Fetch all trainers used in schedules, keyed by trainer id
//   // useEffect(() => {

//   //   const loadTrainers = async () => {

//   //     const ids = new Set();

//   //     schedules.forEach((schedule) => {
//   //       const id = normalizeId(schedule.trainerId);
//   //       if (id) ids.add(id);
//   //     });

//   //     const entries = {};

//   //     for (const id of ids) {

//   //       try {

//   //         const data = await fetchTrainerById(id, token);
//   //         entries[id] = getTrainerNameFromResponse(data);

//   //       } catch (error) {

//   //         console.error("Trainer fetch failed", error);
//   //         entries[id] = "Unknown";

//   //       }

//   //     }

//   //     setTrainers(entries);

//   //   };

//   //   if (schedules.length && fetchTrainerById) loadTrainers();

//   // }, [schedules, token, fetchTrainerById]);


//   const parseTimeToHour = (time) => {
//     if (!time) return null;

//     const raw = String(time).trim().toUpperCase();

//     // Handles "10:00 AM", "10 AM", "22:00", "22:00:00"
//     const hasAM = raw.includes("AM");
//     const hasPM = raw.includes("PM");

//     const match = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?$/);
//     if (!match) return null;

//     let hour = parseInt(match[1], 10);

//     if (hasAM || hasPM) {
//       if (hasPM && hour !== 12) hour += 12;
//       if (hasAM && hour === 12) hour = 0;
//       return hour;
//     }

//     if (hour >= 0 && hour <= 23) return hour;
//     return null;
//   };

//   const formatHour = (hour) => {
//     const date = new Date();
//     date.setHours(hour, 0, 0, 0);

//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const getScheduleDate = (schedule) => {
//     if (!schedule?.date) return null;
//     const d = new Date(schedule.date);
//     return Number.isNaN(d.getTime()) ? null : d;
//   };

//   const getScheduleDayName = (schedule) => {
//     const date = getScheduleDate(schedule);
//     if (!date) return null;

//     return date.toLocaleDateString("en-US", { weekday: "long" });
//   };

//   // const getTrainerName = (trainerId) => {
//   //   const id = normalizeId(trainerId);
//   //   if (!id) return "Unknown";
//   //   return trainers[id] || "Loading...";
//   // };

//   const generateTimeSlots = () => {
//     const hours = new Set();

//     // default visible working hours
//     for (let i = 8; i <= 17; i++) hours.add(i);

//     schedules.forEach((schedule) => {
//       const start = parseTimeToHour(schedule.startTime);
//       const end = parseTimeToHour(schedule.endTime);

//       if (start !== null) hours.add(start);
//       if (end !== null) hours.add(end);
//     });

//     return [...hours].sort((a, b) => a - b);
//   };

//   const timeSlots = useMemo(() => generateTimeSlots(), [schedules]);

//   // const handleDelete = async (id) => {
//   //   if (!id) return;

//   //   if (window.confirm("Delete this schedule?")) {
//   //     try {
//   //       await onDelete(id, token);
//   //       if (onRefresh) onRefresh();
//   //     } catch (err) {
//   //       alert(err.message || "Failed deleting schedule");
//   //     }
//   //   }
//   // };

//   const getSchedulesForSlot = (day, hour) => {
//     return schedules
//       .filter((schedule) => {
//         const scheduleDay = getScheduleDayName(schedule);
//         const startHour = parseTimeToHour(schedule.startTime);
//         return scheduleDay === day && startHour === hour;
//       })
//       .map((schedule) => {
//         const trainerId = normalizeId(schedule.trainerId);

//         const isCompleted =
//           schedule.status === "completed" &&
//           schedule.headCount != null &&
//           schedule.topic?.trim();

//         const isCancelled =
//           schedule.status === "cancelled";

//         return {
//           id: schedule._id,
//           scheduleId: schedule._id,
//           course: schedule.courseId?.courseCode || "Unknown",
//           // trainerId: schedule.trainerId,
//           roomNo: schedule.roomNo,
//           topic: schedule.topic,
//           startTime: schedule.startTime,
//           endTime: schedule.endTime,
//           originalSchedule: schedule,
//           isCompleted,
//           isCancelled,
//         };
//       });
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

//   const daysInMonth = getDaysInMonth(currentMonth);
//   const firstDay = getFirstDayOfMonth(currentMonth);

//   return (
//     <div className="Schedulees-calendar-container">
//       <div className="calendar-main">
//         <div className="calendar-grid">
//           <div className="grid-header">
//             <div className="time-label">TIME</div>

//             {weekDays.map((day) => (
//               <div key={day} className="day-header">
//                 {day}
//               </div>
//             ))}
//           </div>

//           {timeSlots.map((hour) => (
//             <div key={hour} className="time-row">
//               <div className="time-label">{formatHour(hour)}</div>

//               {weekDays.map((day) => (
//                 <div
//                   key={`${day}-${hour}`}
//                   className="time-slot"
//                   onMouseEnter={() => setHoveredSlot(`${day}-${hour}`)}
//                   onMouseLeave={() => setHoveredSlot(null)}
//                 >
//                   {getSchedulesForSlot(day, hour).map((schedule) => (
//                     // <div key={schedule.id} className="Schedulee-card">
//                                         <div
//                       key={schedule.id}
//                       className={`Schedulee-card
//     ${schedule.isCancelled
//                           ? "schedule-cancelled-card"
//                           : schedule.isCompleted
//                             ? "schedule-completed-card"
//                             : ""
//                         }`}
//                     >
//                       <div className="card-title">{schedule.course}</div>

//                       <div className="card-time">
//                         {schedule.startTime} - {schedule.endTime}
//                       </div>

//                       {/* <div>
//                         Trainer: {getTrainerName(schedule.trainerId)}
//                       </div> */}

//                       <div>
//                         Room: {schedule.roomNo || "-"}
//                       </div>

//                       {schedule.topic && <div>{schedule.topic}</div>}

//                       {hoveredSlot === `${day}-${hour}` && (
//                         <div className="card-actions">
//                           <button
//                             className="btn-edit-card"
//                             onClick={() => {
//                               setTopicFeedbackData(schedule.originalSchedule);
//                               setShowTopicFeedbackModal(true);
//                             }}
//                           >
//                             ✎
//                           </button>

//                           {/* <button
//                             className="btn-delete-card"
//                             onClick={() => handleDelete(schedule.scheduleId)}
//                           >
//                             ×
//                           </button> */}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>

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

//           <span>{formatDate(currentMonth)}</span>

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
//           {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
//             <div key={day} className="weekday">
//               {day}
//             </div>
//           ))}
//         </div>

//         <div className="calendar-dates">
//           {Array.from({ length: firstDay }).map((_, i) => (
//             <div key={i} className="date empty" />
//           ))}

//           {Array.from({ length: daysInMonth }).map((_, i) => {
//             const date = new Date(
//               currentMonth.getFullYear(),
//               currentMonth.getMonth(),
//               i + 1
//             );

//             const today = date.toDateString() === new Date().toDateString();

// const formatDate = (d) =>
//   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//     d.getDate()
//   ).padStart(2, "0")}`;

// const selected =
//   selectedDate &&
//   formatDate(date) === selectedDate;
//             return (
//               <div
//                 key={i}
//                 className={`date ${today ? "today" : ""} ${
//                   selected ? "selected" : ""
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







// // import { useState, useEffect, useMemo } from "react";
// // import "./SchedulesCalendar.css";

// // export default function SchedulesCalendar({
// //   schedules = [],
// //   selectedDate,
// //   onSelectDate,
// //   token,

// // }) {
// //   const [currentMonth, setCurrentMonth] = useState(new Date());
// //   const [hoveredSlot, setHoveredSlot] = useState(null);

// //   const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// //   const normalizeId = (value) => {
// //     if (!value) return "";
// //     if (typeof value === "string") return value;
// //     if (typeof value === "object") return value._id || value.id || "";
// //     return String(value);
// //   };

// //   const getTrainerNameFromResponse = (data) => {
// //     if (!data) return "Unknown";
// //     if (typeof data === "string") return data;
// //     return data.name || data.fullName || data.trainerName || "Unknown";
// //   };


// //   const parseTimeToHour = (time) => {
// //     if (!time) return null;

// //     const raw = String(time).trim().toUpperCase();

// //     // Handles "10:00 AM", "10 AM", "22:00", "22:00:00"
// //     const hasAM = raw.includes("AM");
// //     const hasPM = raw.includes("PM");

// //     const match = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?$/);
// //     if (!match) return null;

// //     let hour = parseInt(match[1], 10);

// //     if (hasAM || hasPM) {
// //       if (hasPM && hour !== 12) hour += 12;
// //       if (hasAM && hour === 12) hour = 0;
// //       return hour;
// //     }

// //     if (hour >= 0 && hour <= 23) return hour;
// //     return null;
// //   };

// //   const formatHour = (hour) => {
// //     const date = new Date();
// //     date.setHours(hour, 0, 0, 0);

// //     return date.toLocaleTimeString("en-US", {
// //       hour: "numeric",
// //       minute: "2-digit",
// //       hour12: true,
// //     });
// //   };

// //   const getScheduleDate = (schedule) => {
// //     if (!schedule?.date) return null;
// //     const d = new Date(schedule.date);
// //     return Number.isNaN(d.getTime()) ? null : d;
// //   };

// //   const getScheduleDayName = (schedule) => {
// //     const date = getScheduleDate(schedule);
// //     if (!date) return null;

// //     return date.toLocaleDateString("en-US", { weekday: "long" });
// //   };

// //   const getTrainerName = (trainerId) => {
// //     const id = normalizeId(trainerId);
// //     if (!id) return "Unknown";
// //     return trainers[id] || "Loading...";
// //   };

// //   const generateTimeSlots = () => {
// //     const hours = new Set();

// //     // default visible working hours
// //     for (let i = 8; i <= 17; i++) hours.add(i);

// //     schedules.forEach((schedule) => {
// //       const start = parseTimeToHour(schedule.startTime);
// //       const end = parseTimeToHour(schedule.endTime);

// //       if (start !== null) hours.add(start);
// //       if (end !== null) hours.add(end);
// //     });

// //     return [...hours].sort((a, b) => a - b);
// //   };

// //   const timeSlots = useMemo(() => generateTimeSlots(), [schedules]);

// //   const handleDelete = async (id) => {
// //     if (!id) return;

// //     if (window.confirm("Delete this schedule?")) {
// //       await onDelete(id, token);
// //     }
// //   };

// //   const getSchedulesForSlot = (day, hour) => {
// //     return schedules
// //       .filter((schedule) => {
// //         const scheduleDay = getScheduleDayName(schedule);
// //         const startHour = parseTimeToHour(schedule.startTime);
// //         return scheduleDay === day && startHour === hour;
// //       })
// //       .map((schedule) => {

// //         return {
// //           id: schedule._id,
// //           scheduleId: schedule._id,
// //           course: schedule.courseId?.courseCode || "Unknown",
// //           roomNo: schedule.roomNo,
// //           topic: schedule.topic,
// //           startTime: schedule.startTime,
// //           endTime: schedule.endTime,
// //           originalSchedule: schedule,
// //         };
// //       });
// //   };

// //   const getDaysInMonth = (date) => {
// //     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
// //   };

// //   const getFirstDayOfMonth = (date) => {
// //     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
// //   };

// //   const formatDate = (date) => {
// //     return date.toLocaleDateString("en-US", {
// //       month: "long",
// //       year: "numeric",
// //     });
// //   };

// //   const daysInMonth = getDaysInMonth(currentMonth);
// //   const firstDay = getFirstDayOfMonth(currentMonth);

// //   return (
// //     <div className="Schedulees-calendar-container">
// //       <div className="calendar-main">
// //         <div className="calendar-grid">
// //           <div className="grid-header">
// //             <div className="time-label">TIME</div>

// //             {weekDays.map((day) => (
// //               <div key={day} className="day-header">
// //                 {day}
// //               </div>
// //             ))}
// //           </div>

// //           {timeSlots.map((hour) => (
// //             <div key={hour} className="time-row">
// //               <div className="time-label">{formatHour(hour)}</div>

// //               {weekDays.map((day) => (
// //                 <div
// //                   key={`${day}-${hour}`}
// //                   className="time-slot"
// //                   onMouseEnter={() => setHoveredSlot(`${day}-${hour}`)}
// //                   onMouseLeave={() => setHoveredSlot(null)}
// //                 >
// //                   {getSchedulesForSlot(day, hour).map((schedule) => (
// //                     <div key={schedule.id} className="Schedulee-card">
// //                       <div className="card-title">{schedule.course}</div>


// //                       <div className="card-time">
// //                         {schedule.startTime} - {schedule.endTime}
// //                       </div>

// //                       <div>
// //                         Room: {schedule.roomNo || "-"}
// //                       </div>

// //                       {schedule.topic && <div>{schedule.topic}</div>}

// //                       {hoveredSlot === `${day}-${hour}` && (
// //                         <div className="card-actions">
// //                           <button
// //                             className="btn-edit-card"
// //                             onClick={() => {
// //                               setUpdateScheduledata(schedule.originalSchedule);
// //                               setshowUpdateSchedule(true);
// //                             }}
// //                           >
// //                             ✎
// //                           </button>

// //                           <button
// //                             className="btn-delete-card"
// //                             onClick={() => handleDelete(schedule.scheduleId)}
// //                           >
// //                             ×
// //                           </button>
// //                         </div>
// //                       )}
// //                     </div>
// //                   ))}
// //                 </div>
// //               ))}
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       <div className="mini-calendar">
// //         <div className="calendar-nav">
// //           <button
// //             onClick={() =>
// //               setCurrentMonth(
// //                 new Date(
// //                   currentMonth.getFullYear(),
// //                   currentMonth.getMonth() - 1
// //                 )
// //               )
// //             }
// //           >
// //             ‹
// //           </button>

// //           <span>{formatDate(currentMonth)}</span>

// //           <button
// //             onClick={() =>
// //               setCurrentMonth(
// //                 new Date(
// //                   currentMonth.getFullYear(),
// //                   currentMonth.getMonth() + 1
// //                 )
// //               )
// //             }
// //           >
// //             ›
// //           </button>
// //         </div>

// //         <div className="calendar-weekdays">
// //           {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
// //             <div key={day} className="weekday">
// //               {day}
// //             </div>
// //           ))}
// //         </div>

// //         <div className="calendar-dates">
// //           {Array.from({ length: firstDay }).map((_, i) => (
// //             <div key={i} className="date empty" />
// //           ))}

// //           {Array.from({ length: daysInMonth }).map((_, i) => {
// //             const date = new Date(
// //               currentMonth.getFullYear(),
// //               currentMonth.getMonth(),
// //               i + 1
// //             );

// //             const today = date.toDateString() === new Date().toDateString();

// //             const selected =
// //               selectedDate &&
// //               date.toDateString() === selectedDate.toDateString();

// //             return (
// //               <div
// //                 key={i}
// //                 className={`date ${today ? "today" : ""} ${
// //                   selected ? "selected" : ""
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








// // import { useState } from "react";
// // import "./SchedulesCalendar.css";

// // export default function SchedulesCalendar({
// //   schedules,
// //   selectedDate,
// //   onSelectDate,
// //   onDelete,
// //   onRefresh,
// //   token,
// // }) {
// //   const [currentMonth, setCurrentMonth] = useState(new Date());
// //   const [hoveredSlot, setHoveredSlot] = useState(null);

// //   const handleDelete = async (scheduleId) => {
// //     if (window.confirm("Are you sure you want to delete this schedule?")) {
// //       await onDelete(scheduleId, token);
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
// //     return date.toLocaleDateString("en-US", {
// //       month: "long",
// //       year: "numeric",
// //     });
// //   };

// //   const getDayName = (index) => {
// //     const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
// //     return days[index];
// //   };

// //   const weekDays = [
// //     "Monday",
// //     "Tuesday",
// //     "Wednesday",
// //     "Thursday",
// //     "Friday",
// //   ];

// //   // Generate unique time slots from backend data
// //   const timeSlots = [
// //     ...new Set(
// //       schedules.flatMap((schedule) =>
// //         Object.values(schedule.slots || {}).flat().map((slot) => {
// //           let hour = parseInt(slot.startTime.split(":")[0], 10);

// //           // Handle 12-hour format if backend ever returns AM/PM
// //           if (slot.startTime.includes("PM") && hour !== 12) hour += 12;
// //           if (slot.startTime.includes("AM") && hour === 12) hour = 0;

// //           return `${String(hour).padStart(2, "0")}:00`;
// //         })
// //       )
// //     ),
// //   ].sort();

// //   const getSchedulesForSlot = (day, time) => {
// //     const dayKey = day.toLowerCase();
// //     const hour = parseInt(time.split(":")[0], 10);

// //     return schedules.flatMap((schedule) => {
// //       const slots = schedule.slots?.[dayKey] || [];

// //       return slots
// //         .filter((slot) => {
// //           let slotHour = parseInt(slot.startTime.split(":")[0], 10);

// //           if (slot.startTime.includes("PM") && slotHour !== 12)
// //             slotHour += 12;
// //           if (slot.startTime.includes("AM") && slotHour === 12)
// //             slotHour = 0;

// //           return slotHour === hour;
// //         })
// //         .map((slot) => ({
// //           id: slot._id,
// //           scheduleId: schedule._id,
// //           course: schedule.courseId?.courseCode || "Unknown Course",
// //           session: schedule.sessionId,
// //           startTime: slot.startTime,
// //           endTime: slot.endTime,
// //         }));
// //     });
// //   };

// //   const daysInMonth = getDaysInMonth(currentMonth);
// //   const firstDay = getFirstDayOfMonth(currentMonth);

// //   return (
// //     <div className="Schedulees-calendar-container">
// //       <div className="calendar-main">
// //         <div className="calendar-grid">
// //           {/* Header */}
// //           <div className="grid-header">
// //             <div className="time-label">Time</div>

// //             {weekDays.map((day) => (
// //               <div key={day} className="day-header">
// //                 {day}
// //               </div>
// //             ))}
// //           </div>

// //           {/* Time Rows */}
// //           {timeSlots.map((time) => (
// //             <div key={time} className="time-row">
// //               <div className="time-label">{time}</div>

// //               {weekDays.map((day) => (
// //                 <div
// //                   key={`${day}-${time}`}
// //                   className="time-slot"
// //                   onMouseEnter={() => setHoveredSlot(`${day}-${time}`)}
// //                   onMouseLeave={() => setHoveredSlot(null)}
// //                 >
// //                   {getSchedulesForSlot(day, time).map((schedule) => (
// //                     <div
// //                       key={schedule.id}
// //                       className={`Schedulee-card ${
// //                         hoveredSlot === `${day}-${time}` ? "hovered" : ""
// //                       }`}
// //                     >
// //                       <div className="card-title">{schedule.course}</div>

// //                       <div className="card-time">
// //                         {schedule.startTime} - {schedule.endTime}
// //                       </div>

// //                       {hoveredSlot === `${day}-${time}` && (
// //                         <button
// //                           className="btn-delete-card"
// //                           onClick={() => handleDelete(schedule.scheduleId)}
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
// //           <button
// //             onClick={() =>
// //               setCurrentMonth(
// //                 new Date(
// //                   currentMonth.getFullYear(),
// //                   currentMonth.getMonth() - 1
// //                 )
// //               )
// //             }
// //           >
// //             ‹
// //           </button>

// //           <span className="calendar-month">
// //             {formatDate(currentMonth)}
// //           </span>

// //           <button
// //             onClick={() =>
// //               setCurrentMonth(
// //                 new Date(
// //                   currentMonth.getFullYear(),
// //                   currentMonth.getMonth() + 1
// //                 )
// //               )
// //             }
// //           >
// //             ›
// //           </button>
// //         </div>

// //         <div className="calendar-weekdays">
// //           {Array.from({ length: 7 }).map((_, i) => (
// //             <div key={i} className="weekday">
// //               {getDayName(i)}
// //             </div>
// //           ))}
// //         </div>

// //         <div className="calendar-dates">
// //           {Array.from({ length: firstDay }).map((_, i) => (
// //             <div key={`empty-${i}`} className="date empty"></div>
// //           ))}

// //           {Array.from({ length: daysInMonth }).map((_, i) => {
// //             const date = new Date(
// //               currentMonth.getFullYear(),
// //               currentMonth.getMonth(),
// //               i + 1
// //             );

// //             const isToday =
// //               date.toDateString() === new Date().toDateString();

// //             const isSelected =
// //               selectedDate &&
// //               date.toDateString() === selectedDate.toDateString();

// //             return (
// //               <div
// //                 key={i}
// //                 className={`date ${isToday ? "today" : ""} ${
// //                   isSelected ? "selected" : ""
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


// // // import { useState } from 'react';


// // // import './SchedulesCalendar.css'
// // // export default function SchedulesCalendar({ schedules, selectedDate, onSelectDate, onDelete, onRefresh }) {
// // //   const [currentMonth, setCurrentMonth] = useState(new Date());
// // //   const [hoveredSlot, setHoveredSlot] = useState(null);

// // //   const handleDelete = async (scheduleId) => {
// // //     if (window.confirm('Are you sure you want to delete this schedule slot?')) {
// // //       await onDelete(scheduleId);
// // //       onRefresh();
// // //     }
// // //   };

// // //   const getDaysInMonth = (date) => {
// // //     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
// // //   };

// // //   const getFirstDayOfMonth = (date) => {
// // //     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
// // //   };

// // //   const formatDate = (date) => {
// // //     return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
// // //   };

// // //   const getDayName = (index) => {
// // //     const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// // //     return days[index];
// // //   };

// // //   const timeSlots = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
// // //   const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// // //   const getSchedulesForSlot = (day, time) => {
// // //     return schedules.filter(s => s.day === day && s.timeSlot.startsWith(time.split(':')[0]));
// // //   };

// // //   const daysInMonth = getDaysInMonth(currentMonth);
// // //   const firstDay = getFirstDayOfMonth(currentMonth);

// // //   return (
// // //     <div className="Schedulees-calendar-container">
// // //       <div className="calendar-main">
// // //         {/* Weekly Grid */}
// // //         <div className="calendar-grid">
// // //           {/* Header */}
// // //           <div className="grid-header">
// // //             <div className="time-label">Time</div>
// // //             {weekDays.map(day => (
// // //               <div key={day} className="day-header">{day}</div>
// // //             ))}
// // //           </div>

// // //           {/* Time Slots */}
// // //           {timeSlots.map(time => (
// // //             <div key={time} className="time-row">
// // //               <div className="time-label">{time}</div>
// // //               {weekDays.map(day => (
// // //                 <div
// // //                   key={`${day}-${time}`}
// // //                   className="time-slot"
// // //                   onMouseEnter={() => setHoveredSlot(`${day}-${time}`)}
// // //                   onMouseLeave={() => setHoveredSlot(null)}
// // //                 >
// // //                   {getSchedulesForSlot(day, time).map(schedule => (
// // //                     <div
// // //                       key={schedule.id}
// // //                       className={`Schedulee-card ${hoveredSlot === `${day}-${time}` ? 'hovered' : ''}`}
// // //                     >
// // //                       <div className="card-title">{schedule.course}</div>
// // //                       <div className="card-trainer">{schedule.trainer}</div>
// // //                       {hoveredSlot === `${day}-${time}` && (
// // //                         <button
// // //                           className="btn-delete-card"
// // //                           onClick={() => handleDelete(schedule.id)}
// // //                         >
// // //                           ×
// // //                         </button>
// // //                       )}
// // //                     </div>
// // //                   ))}
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           ))}
// // //         </div>
// // //       </div>

// // //       {/* Mini Calendar */}
// // //       <div className="mini-calendar">
// // //         <div className="calendar-nav">
// // //           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
// // //             ‹
// // //           </button>
// // //           <span className="calendar-month">{formatDate(currentMonth)}</span>
// // //           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
// // //             ›
// // //           </button>
// // //         </div>

// // //         <div className="calendar-weekdays">
// // //           {Array.from({ length: 7 }).map((_, i) => (
// // //             <div key={i} className="weekday">{getDayName(i)}</div>
// // //           ))}
// // //         </div>

// // //         <div className="calendar-dates">
// // //           {Array.from({ length: firstDay }).map((_, i) => (
// // //             <div key={`empty-${i}`} className="date empty"></div>
// // //           ))}
// // //           {Array.from({ length: daysInMonth }).map((_, i) => {
// // //             const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
// // //             const isToday = date.toDateString() === new Date().toDateString();
// // //             return (
// // //               <div
// // //                 key={i + 1}
// // //                 className={`date ${isToday ? 'today' : ''} ${
// // //                   date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
// // //                 }`}
// // //                 onClick={() => onSelectDate(date)}
// // //               >
// // //                 {i + 1}
// // //               </div>
// // //             );
// // //           })}
// // //         </div>

// // //         <div className="calendar-today">Today</div>
// // //       </div>
// // //     </div>
// // //   );
// // // }