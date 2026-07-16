// SchedulesCalendar.jsx
import { useMemo, useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import "./SchedulesCalendar.css";

export default function SchedulesCalendar({
  schedules = [],
  selectedDate,
  onSelectDate,
  onDelete,
  onRefresh,
  token,
  setUpdateScheduledata,
  setshowUpdateSchedule,
  trainerMap = {},
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const [selectedWeekStart, setSelectedWeekStart] = useState(() =>
    getMonday(selectedDate ? new Date(selectedDate) : new Date())
  );

  useEffect(() => {
    if (selectedDate) {
      setSelectedWeekStart(getMonday(new Date(selectedDate)));
    }
  }, [selectedDate]);

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value._id || value.id || "";
    return String(value);
  };

  const formatDate = (date, options) => {
    if (!date) return "—";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-US", options);
  };

  const ymd = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const formatMonth = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const formatDayLabel = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

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

  const getTrainerName = (trainerId) => {
    const id = normalizeId(trainerId);
    if (!id) return "Unknown";
    return trainerMap[id] || "Unknown";
  };

  const isInSelectedWeek = (date) => {
    if (!date) return false;

    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return date >= selectedWeekStart && date < weekEnd;
  };

  const generateTimeSlots = () => {
    const hours = new Set();

    for (let i = 8; i <= 17; i += 1) hours.add(i);

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
      await onDelete?.(id, token);
      onRefresh?.();
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

        const rawStatus = (schedule.status || "").toString().trim().toLowerCase();
        const isCompleted = rawStatus === "completed";
        const isCancelled = rawStatus === "cancelled" || rawStatus === "canceled";

        return {
          id: schedule._id,
          scheduleId: schedule._id,
          course: schedule.courseId?.courseCode || "Unknown",
          trainer: getTrainerName(trainerId),
          trainerId,
          roomNo: schedule.roomNo,
          topic: schedule.topic,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isCompleted,
          isCancelled,
          originalSchedule: schedule,
        };
      });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

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
                      className={`Schedulee-card ${
                        schedule.isCancelled
                          ? "schedule-cancelled-card"
                          : schedule.isCompleted
                            ? "schedule-completed-card"
                            : ""
                      }`}
                    >
                      <div className="card-title">{schedule.course}</div>

                      <div className="card-trainer">
                        Trainer: {schedule.trainer}
                      </div>

                      <div className="card-time">
                        {schedule.startTime} - {schedule.endTime}
                      </div>

                      <div>Room: {schedule.roomNo || "-"}</div>

                      {schedule.topic && <div>{schedule.topic}</div>}

                      {hoveredSlot === `${day}-${hour}` && (
                        <div className="card-actions">
                          <button
                            className="btn-edit-card"
                            onClick={() => {
                              setUpdateScheduledata(schedule.originalSchedule);
                              setshowUpdateSchedule(true);
                            }}
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            className="btn-delete-card"
                            onClick={() => handleDelete(schedule.scheduleId)}
                          >
                            <Trash2 size={14} />
                          </button>
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
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
              )
            }
          >
            ‹
          </button>

          <span>{formatMonth(currentMonth)}</span>

          <button
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
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
          {(() => {
            const mondayFirstDay = (firstDay + 6) % 7;

            const cells = [
              ...Array.from({ length: mondayFirstDay }, () => null),
              ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
            ];

            const weeks = [];
            for (let i = 0; i < cells.length; i += 7) {
              weeks.push(cells.slice(i, i + 7));
            }

            const selectedDateFormatted = selectedDate
              ? ymd(new Date(selectedDate))
              : null;

            const selectedWeekStartFormatted = ymd(selectedWeekStart);

            const scheduledDates = new Set(
              schedules
                .map((schedule) => {
                  const d = getScheduleDate(schedule);
                  return d ? ymd(d) : null;
                })
                .filter(Boolean)
            );

            return weeks.map((week, wi) => {
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
                  className={`calendar-week-row ${
                    isSelectedWeek ? "selected-week-row" : ""
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
                          className={`date ${today ? "today" : ""} ${
                            selected ? "selected" : ""
                          } ${hasSchedule ? "has-schedule" : ""}`}
                          onClick={() => onSelectDate?.(date)}
                          title={formatDayLabel(date)}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>

        <button
          className="calendar-today"
          onClick={() => {
            const today = new Date();
            setCurrentMonth(today);
            onSelectDate?.(today);
          }}
        >
          Today
        </button>
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
//   onDelete,
//   token,
//   setUpdateScheduledata,
//   setshowUpdateSchedule,
//   fetchTrainerById,
// }) {
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [hoveredSlot, setHoveredSlot] = useState(null);
//   const [trainers, setTrainers] = useState({});

//   // NEW: tracks the Monday of the week currently shown in the main grid
//   const [selectedWeekStart, setSelectedWeekStart] = useState(() =>
//     getMonday(selectedDate ? new Date(selectedDate) : new Date())
//   );

//   const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

//   // NEW: whenever a date is picked on the mini calendar, jump the main grid to that week
//   useEffect(() => {
//     if (selectedDate) {
//       setSelectedWeekStart(getMonday(new Date(selectedDate)));
//     }
//   }, [selectedDate]);

//   function getMonday(date) {
//     const d = new Date(date);
//     const day = d.getDay(); // 0 = Sun ... 6 = Sat
//     const diff = day === 0 ? -6 : 1 - day;
//     d.setDate(d.getDate() + diff);
//     d.setHours(0, 0, 0, 0);
//     return d;
//   }

//   // NEW: is this date inside the currently selected week (Mon–Sun)?
//   const isInSelectedWeek = (date) => {
//     if (!date) return false;
//     const weekEnd = new Date(selectedWeekStart);
//     weekEnd.setDate(weekEnd.getDate() + 7);
//     return date >= selectedWeekStart && date < weekEnd;
//   };

//   const normalizeId = (value) => {
//     if (!value) return "";
//     if (typeof value === "string") return value;
//     if (typeof value === "object") return value._id || value.id || "";
//     return String(value);
//   };

//   const getTrainerNameFromResponse = (data) => {
//     if (!data) return "Unknown";
//     if (typeof data === "string") return data;
//     return data.name || data.fullName || data.trainerName || "Unknown";
//   };

//   // Fetch trainer names for all unique trainer IDs
//   useEffect(() => {
//     let cancelled = false;

//     const loadTrainers = async () => {
//       const ids = new Set();

//       schedules.forEach((schedule) => {
//         const id = normalizeId(schedule.trainerId);
//         if (id) ids.add(id);
//       });

//       const entries = {};

//       for (const id of ids) {
//         try {
//           const trainerData = await fetchTrainerById(id, token);
//           entries[id] = getTrainerNameFromResponse(trainerData);
//         } catch (error) {
//           console.error("Trainer fetch failed", error);
//           entries[id] = "Unknown";
//         }

//         if (cancelled) return;
//       }

//       setTrainers((prev) => ({
//         ...prev,
//         ...entries,
//       }));
//     };

//     if (schedules.length && typeof fetchTrainerById === "function") {
//       loadTrainers();
//     }

//     return () => {
//       cancelled = true;
//     };
//   }, [schedules, token, fetchTrainerById]);

//   const parseTimeToHour = (time) => {
//     if (!time) return null;

//     const raw = String(time).trim().toUpperCase();

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

//   const getTrainerName = (trainerId) => {
//     const id = normalizeId(trainerId);
//     if (!id) return "Unknown";
//     return trainers[id] || "Loading...";
//   };

//   const generateTimeSlots = () => {
//     const hours = new Set();

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

//   const handleDelete = async (id) => {
//     if (!id) return;

//     if (window.confirm("Delete this schedule?")) {
//       await onDelete(id, token);
//     }
//   };

//   // UPDATED: now also filters by the selected week
//   const getSchedulesForSlot = (day, hour) => {
//     return schedules
//       .filter((schedule) => {
//         const scheduleDay = getScheduleDayName(schedule);
//         const startHour = parseTimeToHour(schedule.startTime);
//         const scheduleDate = getScheduleDate(schedule);

//         return (
//           scheduleDay === day &&
//           startHour === hour &&
//           isInSelectedWeek(scheduleDate)
//         );
//       })
//       .map((schedule) => {
//         const trainerId = normalizeId(schedule.trainerId);

//         const isCompleted =
//           schedule.status === "completed" &&
//           schedule.headCount != null &&
//           schedule.topic?.trim();

//         const isCancelled = schedule.status === "cancelled";

//         return {
//           id: schedule._id,
//           scheduleId: schedule._id,
//           course: schedule.courseId?.courseCode || "Unknown",
//           trainer: getTrainerName(trainerId),
//           trainerId,
//           roomNo: schedule.roomNo,
//           topic: schedule.topic,
//           startTime: schedule.startTime,
//           endTime: schedule.endTime,
//           isCompleted,
//           isCancelled,
//           originalSchedule: schedule,
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
//                     <div
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

//                       <div className="card-trainer">
//                         Trainer: {schedule.trainer}
//                       </div>

//                       <div className="card-time">
//                         {schedule.startTime} - {schedule.endTime}
//                       </div>

//                       <div>Room: {schedule.roomNo || "-"}</div>

//                       {schedule.topic && <div>{schedule.topic}</div>}

//                       {hoveredSlot === `${day}-${hour}` && (
//                         <div className="card-actions">
//                           <button
//                             className="btn-edit-card"
//                             onClick={() => {
//                               setUpdateScheduledata(schedule.originalSchedule);
//                               setshowUpdateSchedule(true);
//                             }}
//                           >
//                             ✎
//                           </button>

//                           <button
//                             className="btn-delete-card"
//                             onClick={() => handleDelete(schedule.scheduleId)}
//                           >
//                             ×
//                           </button>
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
//           {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
//             <div key={day} className="weekday">
//               {day}
//             </div>
//           ))}
//         </div>

//         <div className="calendar-dates-wrapper">
//           {(() => {
//             const mondayFirstDay = (firstDay + 6) % 7; // shifts Sun(0)->6, Mon(1)->0, etc.

//             const cells = [
//               ...Array.from({ length: mondayFirstDay }, () => null),
//               ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
//             ];

//             const weeks = [];
//             for (let i = 0; i < cells.length; i += 7) {
//               weeks.push(cells.slice(i, i + 7));
//             }
//             const ymd = (d) =>
//               `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//                 d.getDate()
//               ).padStart(2, "0")}`;

//             const scheduledDates = new Set(
//               schedules
//                 .map((s) => {
//                   if (!s?.date) return null;
//                   const d = new Date(s.date);
//                   return Number.isNaN(d.getTime()) ? null : ymd(d);
//                 })
//                 .filter(Boolean)
//             );

//             const selectedDateFormatted = selectedDate
//               ? ymd(new Date(selectedDate))
//               : null;

//             const selectedWeekStartFormatted = ymd(selectedWeekStart);

//             return weeks.map((week, wi) => {
//               const isActiveWeek = week.some((day) => {
//                 if (!day || !selectedDateFormatted) return false;
//                 const date = new Date(
//                   currentMonth.getFullYear(),
//                   currentMonth.getMonth(),
//                   day
//                 );
//                 return formatDate(date) === selectedDateFormatted;   // ✅
//               });

//               // NEW: is this the week currently being shown in the main grid?
//               const isSelectedWeek = week.some((day) => {
//                 if (!day) return false;
//                 const date = new Date(
//                   currentMonth.getFullYear(),
//                   currentMonth.getMonth(),
//                   day
//                 );
//                 return ymd(getMonday(date)) === selectedWeekStartFormatted;
//               });

//               return (
//                 <div
//                   key={wi}
//                   className={`calendar-week-row ${isSelectedWeek ? "selected-week-row" : ""
//                     }`}
//                 >
//                   {isSelectedWeek && <span className="active-week-dot" />}

//                   <div className="calendar-dates">
//                     {week.map((day, di) => {
//                       if (day === null) {
//                         return <div key={di} className="date empty" />;
//                       }

//                       const date = new Date(
//                         currentMonth.getFullYear(),
//                         currentMonth.getMonth(),
//                         day
//                       );
//                       const today =
//                         date.toDateString() === new Date().toDateString();
//                       const selected =
//                         selectedDateFormatted &&
//                         ymd(date) === selectedDateFormatted;
//                       const hasSchedule = scheduledDates.has(ymd(date));

//                       return (
//                         <div
//                           key={di}
//                           className={`date ${today ? "today" : ""} ${selected ? "selected" : ""
//                             } ${hasSchedule ? "has-schedule" : ""}`}
//                           onClick={() => onSelectDate(date)}
//                         >
//                           {day}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               );
//             });
//           })()}
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
// //   onDelete,
// //   token,
// //   setUpdateScheduledata,
// //   setshowUpdateSchedule,
// //   fetchTrainerById,
// // }) {
// //   const [currentMonth, setCurrentMonth] = useState(new Date());
// //   const [hoveredSlot, setHoveredSlot] = useState(null);
// //   const [trainers, setTrainers] = useState({});

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

// //   // Fetch trainer names for all unique trainer IDs
// //   useEffect(() => {
// //     let cancelled = false;

// //     const loadTrainers = async () => {
// //       const ids = new Set();

// //       schedules.forEach((schedule) => {
// //         const id = normalizeId(schedule.trainerId);
// //         if (id) ids.add(id);
// //       });

// //       const entries = {};

// //       for (const id of ids) {
// //         try {
// //           const trainerData = await fetchTrainerById(id, token);
// //           entries[id] = getTrainerNameFromResponse(trainerData);
// //         } catch (error) {
// //           console.error("Trainer fetch failed", error);
// //           entries[id] = "Unknown";
// //         }

// //         if (cancelled) return;
// //       }

// //       setTrainers((prev) => ({
// //         ...prev,
// //         ...entries,
// //       }));
// //     };

// //     if (schedules.length && typeof fetchTrainerById === "function") {
// //       loadTrainers();
// //     }

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [schedules, token, fetchTrainerById]);

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
// //       // .map((schedule) => {
// //       //   const trainerId = normalizeId(schedule.trainerId);

// //       //   return {
// //       //     id: schedule._id,
// //       //     scheduleId: schedule._id,
// //       //     course: schedule.courseId?.courseCode || "Unknown",
// //       //     trainer: getTrainerName(trainerId),
// //       //     trainerId,
// //       //     roomNo: schedule.roomNo,
// //       //     topic: schedule.topic,
// //       //     startTime: schedule.startTime,
// //       //     endTime: schedule.endTime,
// //       //     originalSchedule: schedule,
// //       //   };
// //       // });
// //       .map((schedule) => {
// //         const trainerId = normalizeId(schedule.trainerId);

// //         const isCompleted =
// //           schedule.status === "completed" &&
// //           schedule.headCount != null &&
// //           schedule.topic?.trim();

// //         const isCancelled =
// //           schedule.status === "cancelled";

// //         return {
// //           id: schedule._id,
// //           scheduleId: schedule._id,
// //           course: schedule.courseId?.courseCode || "Unknown",
// //           trainer: getTrainerName(trainerId),
// //           trainerId,
// //           roomNo: schedule.roomNo,
// //           topic: schedule.topic,
// //           startTime: schedule.startTime,
// //           endTime: schedule.endTime,

// //           // Add this
// //           isCompleted,
// //           isCancelled,

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
// //       {/* <pre>{JSON.stringify(schedules, null, 2)}</pre> */}
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
// //                     // <div key={schedule.id} className="Schedulee-card">
// //                     // <div
// //                     //   key={schedule.id}
// //                     //   className={`Schedulee-card ${schedule.isCompleted ? "schedule-completed-card" : ""
// //                     //     }`}
// //                     // >
// //                     <div
// //                       key={schedule.id}
// //                       className={`Schedulee-card
// //     ${schedule.isCancelled
// //                           ? "schedule-cancelled-card"
// //                           : schedule.isCompleted
// //                             ? "schedule-completed-card"
// //                             : ""
// //                         }`}
// //                     >
// //                       <div className="card-title">{schedule.course}</div>

// //                       <div className="card-trainer">
// //                         Trainer: {schedule.trainer}
// //                       </div>

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

// //         {/* <div className="calendar-dates">
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

// //             const formatDate = (d) =>
// //               `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
// //                 d.getDate()
// //               ).padStart(2, "0")}`;

// //             const selected =
// //               selectedDate &&
// //               formatDate(date) === selectedDate;
// //             return (
// //               <div
// //                 key={i}
// //                 className={`date ${today ? "today" : ""} ${selected ? "selected" : ""
// //                   }`}
// //                 onClick={() => onSelectDate(date)}
// //               >
// //                 {i + 1}
// //               </div>
// //             );
// //           })}
// //         </div> */}
// //         {/* <div className="calendar-dates-wrapper">
// //           {(() => {
// //             const cells = [
// //               ...Array.from({ length: firstDay }, () => null),
// //               ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
// //             ];

// //             const weeks = [];
// //             for (let i = 0; i < cells.length; i += 7) {
// //               weeks.push(cells.slice(i, i + 7));
// //             }

// //             return weeks.map((week, wi) => {

// //               const formatDate = (d) =>
// //                 `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
// //                   d.getDate()
// //                 ).padStart(2, "0")}`;

// //               const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
// //               const selectedDateFormatted = selectedDateObj ? formatDate(selectedDateObj) : null;

// //               const isActiveWeek = week.some((day) => {
// //                 if (!day || !selectedDateFormatted) return false;
// //                 const date = new Date(
// //                   currentMonth.getFullYear(),
// //                   currentMonth.getMonth(),
// //                   day
// //                 );

// //               return formatDate(date) === selectedDateFormatted;
// //             });

// //             return (
// //               <div key={wi} className="calendar-week-row">


// //                 {isActiveWeek && <span className="active-week-dot" />}

// //                 <div className="calendar-dates">
// //                   {week.map((day, di) => {
// //                     if (day === null) {
// //                       return <div key={di} className="date empty" />;
// //                     }

// //                     const date = new Date(
// //                       currentMonth.getFullYear(),
// //                       currentMonth.getMonth(),
// //                       day
// //                     );
// //                     const today = date.toDateString() === new Date().toDateString();
// //                     const selected =
// //                       selectedDate && formatDate(date) === selectedDate;

// //                     return (
// //                       <div
// //                         key={di}
// //                         className={`date ${today ? "today" : ""} ${selected ? "selected" : ""
// //                           }`}
// //                         onClick={() => onSelectDate(date)}
// //                       >
// //                         {day}
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             );
// //           });
// //           })()}
// //         </div> */}

// //         <div className="calendar-dates-wrapper">
// //           {(() => {
// //             const cells = [
// //               ...Array.from({ length: firstDay }, () => null),
// //               ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
// //             ];

// //             const weeks = [];
// //             for (let i = 0; i < cells.length; i += 7) {
// //               weeks.push(cells.slice(i, i + 7));
// //             }

// //             const formatDate = (d) =>
// //               `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
// //                 d.getDate()
// //               ).padStart(2, "0")}`;

// //             // Build a Set of formatted dates that actually have a schedule
// //             const scheduledDates = new Set(
// //               schedules
// //                 .map((s) => {
// //                   if (!s?.date) return null;
// //                   const d = new Date(s.date);
// //                   return Number.isNaN(d.getTime()) ? null : formatDate(d);
// //                 })
// //                 .filter(Boolean)
// //             );

// //             const selectedDateFormatted = selectedDate
// //               ? formatDate(new Date(selectedDate))
// //               : null;

// //             return weeks.map((week, wi) => {
// //               const isActiveWeek = week.some((day) => {
// //                 if (!day) return false;
// //                 const date = new Date(
// //                   currentMonth.getFullYear(),
// //                   currentMonth.getMonth(),
// //                   day
// //                 );
// //                 return scheduledDates.has(formatDate(date));
// //               });

// //               return (
// //                 <div key={wi} className="calendar-week-row">
// //                   {isActiveWeek && <span className="active-week-dot" />}

// //                   <div className="calendar-dates">
// //                     {week.map((day, di) => {
// //                       if (day === null) {
// //                         return <div key={di} className="date empty" />;
// //                       }

// //                       const date = new Date(
// //                         currentMonth.getFullYear(),
// //                         currentMonth.getMonth(),
// //                         day
// //                       );
// //                       const today = date.toDateString() === new Date().toDateString();
// //                       const selected =
// //                         selectedDateFormatted && formatDate(date) === selectedDateFormatted;
// //                       const hasSchedule = scheduledDates.has(formatDate(date));

// //                       return (
// //                         <div
// //                           key={di}
// //                           className={`date ${today ? "today" : ""} ${selected ? "selected" : ""
// //                             } ${hasSchedule ? "has-schedule" : ""}`}
// //                           onClick={() => onSelectDate(date)}
// //                         >
// //                           {day}
// //                         </div>
// //                       );
// //                     })}
// //                   </div>
// //                 </div>
// //               );
// //             });
// //           })()}
// //         </div>
// //         <div className="calendar-today">Today</div>
// //       </div>
// //     </div>
// //   );
// // }











// // // import { useState } from "react";
// // // import "./SchedulesCalendar.css";

// // // export default function SchedulesCalendar({
// // //   schedules = [],
// // //   selectedDate,
// // //   onSelectDate,
// // //   onDelete,
// // //   token,
// // //   setUpdateScheduledata,
// // //   setshowUpdateSchedule,
// // //   fetchTrainerById,
// // // }) {

// // //   const [currentMonth, setCurrentMonth] = useState(new Date());
// // //   const [hoveredSlot, setHoveredSlot] = useState(null);
// // //   const [hoveredSlot, setHoveredSlot] = useState(null);


// // //   const weekDays = [
// // //     "Monday",
// // //     "Tuesday",
// // //     "Wednesday",
// // //     "Thursday",
// // //     "Friday",
// // //   ];



// // //   const convertHour = (time) => {

// // //     if (!time) return null;


// // //     let hour = parseInt(
// // //       time.split(":")[0],
// // //       10
// // //     );


// // //     if (time.includes("PM") && hour !== 12) {
// // //       hour += 12;
// // //     }


// // //     if (time.includes("AM") && hour === 12) {
// // //       hour = 0;
// // //     }


// // //     return hour;

// // //   };




// // //   const formatHour = (hour) => {

// // //     const date = new Date();

// // //     date.setHours(
// // //       hour,
// // //       0,
// // //       0,
// // //       0
// // //     );


// // //     return date.toLocaleTimeString(
// // //       "en-US",
// // //       {
// // //         hour: "numeric",
// // //         minute: "2-digit",
// // //         hour12: true
// // //       }
// // //     );

// // //   };






// // //   const generateTimeSlots = () => {

// // //     const hours = new Set();


// // //     for (let i = 8; i <= 17; i++) {
// // //       hours.add(i);
// // //     }



// // //     schedules.forEach(schedule => {

// // //       Object.values(schedule.slots || {})
// // //         .flat()
// // //         .forEach(slot => {


// // //           const start =
// // //             convertHour(slot.startTime);


// // //           const end =
// // //             convertHour(slot.endTime);



// // //           if (start !== null)
// // //             hours.add(start);


// // //           if (end !== null)
// // //             hours.add(end);


// // //         });


// // //     });



// // //     return [...hours]
// // //       .sort((a, b) => a - b);

// // //   };



// // //   const timeSlots =
// // //     generateTimeSlots();






// // //   const handleDelete = async (id) => {


// // //     if (
// // //       window.confirm(
// // //         "Delete this schedule?"
// // //       )
// // //     ) {

// // //       await onDelete(
// // //         id,
// // //         token
// // //       );

// // //     }

// // //   };






// // //   const getSchedulesForSlot = (day, hour) => {


// // //     const dayKey =
// // //       day.toLowerCase();



// // //     return schedules.flatMap(schedule => {


// // //       const slots =
// // //         schedule.slots?.[dayKey] || [];



// // //       return slots
// // //         .filter(slot =>
// // //           convertHour(slot.startTime)
// // //           === hour
// // //         )
// // //         .map(slot => ({

// // //           id:
// // //             slot._id ||
// // //             `${schedule._id}-${day}-${slot.startTime}`,


// // //           scheduleId:
// // //             schedule._id,


// // //           course:
// // //             schedule.courseId?.courseCode ||
// // //             "Unknown",


// // //           trainer:
// // //             slot.trainerId?.name ||
// // //             "Unknown",


// // //           trainerId:
// // //             slot.trainerId?._id ||
// // //             slot.trainerId,


// // //           roomNo:
// // //             slot.roomNo,


// // //           topic:
// // //             slot.topic,


// // //           startTime:
// // //             slot.startTime,


// // //           endTime:
// // //             slot.endTime,


// // //           originalSchedule:
// // //             schedule

// // //         }));


// // //     });


// // //   };






// // //   const getDaysInMonth = (date) => {

// // //     return new Date(
// // //       date.getFullYear(),
// // //       date.getMonth() + 1,
// // //       0
// // //     ).getDate();

// // //   };



// // //   const getFirstDayOfMonth = (date) => {

// // //     return new Date(
// // //       date.getFullYear(),
// // //       date.getMonth(),
// // //       1
// // //     ).getDay();

// // //   };



// // //   const formatDate = (date) => {

// // //     return date.toLocaleDateString(
// // //       "en-US",
// // //       {
// // //         month: "long",
// // //         year: "numeric"
// // //       }
// // //     );

// // //   };




// // //   const daysInMonth =
// // //     getDaysInMonth(currentMonth);


// // //   const firstDay =
// // //     getFirstDayOfMonth(currentMonth);




// // //   return (

// // //     <div className="Schedulees-calendar-container">


// // //       <div className="calendar-main">


// // //         <div className="calendar-grid">


// // //           <div className="grid-header">


// // //             <div className="time-label">
// // //               TIME
// // //             </div>


// // //             {
// // //               weekDays.map(day => (

// // //                 <div
// // //                   key={day}
// // //                   className="day-header"
// // //                 >
// // //                   {day}
// // //                 </div>

// // //               ))
// // //             }


// // //           </div>






// // //           {
// // //             timeSlots.map(hour => (


// // //               <div
// // //                 key={hour}
// // //                 className="time-row"
// // //               >


// // //                 <div className="time-label">

// // //                   {formatHour(hour)}

// // //                 </div>





// // //                 {
// // //                   weekDays.map(day => (


// // //                     <div

// // //                       key={`${day}-${hour}`}

// // //                       className="time-slot"


// // //                       onMouseEnter={() =>
// // //                         setHoveredSlot(
// // //                           `${day}-${hour}`
// // //                         )
// // //                       }


// // //                       onMouseLeave={() =>
// // //                         setHoveredSlot(null)
// // //                       }

// // //                     >


// // //                       {

// // //                         getSchedulesForSlot(
// // //                           day,
// // //                           hour
// // //                         )
// // //                           .map(schedule => (


// // //                             <div

// // //                               key={schedule.id}

// // //                               className="Schedulee-card"

// // //                             >


// // //                               <div className="card-title">

// // //                                 {schedule.course}

// // //                               </div>



// // //                               <div className="card-trainer">

// // //                                 Trainer:
// // //                                 {" "}
// // //                                 {schedule.trainer}

// // //                               </div>



// // //                               <div className="card-time">

// // //                                 {schedule.startTime}
// // //                                 -
// // //                                 {schedule.endTime}

// // //                               </div>



// // //                               <div>

// // //                                 Room:
// // //                                 {" "}
// // //                                 {schedule.roomNo || "-"}

// // //                               </div>



// // //                               {
// // //                                 schedule.topic &&
// // //                                 <div>
// // //                                   {schedule.topic}
// // //                                 </div>
// // //                               }





// // //                               {
// // //                                 hoveredSlot === `${day}-${hour}` &&

// // //                                 <div className="card-actions">


// // //                                   <button

// // //                                     className="btn-edit-card"

// // //                                     onClick={() => {

// // //                                       setUpdateScheduledata(
// // //                                         schedule.originalSchedule
// // //                                       );

// // //                                       setshowUpdateSchedule(true);

// // //                                     }}

// // //                                   >

// // //                                     ✎

// // //                                   </button>





// // //                                   <button

// // //                                     className="btn-delete-card"

// // //                                     onClick={() => handleDelete(
// // //                                       schedule.scheduleId
// // //                                     )}

// // //                                   >

// // //                                     ×

// // //                                   </button>



// // //                                 </div>

// // //                               }



// // //                             </div>


// // //                           ))

// // //                       }



// // //                     </div>


// // //                   ))

// // //                 }



// // //               </div>


// // //             ))

// // //           }




// // //         </div>


// // //       </div>








// // //       <div className="mini-calendar">


// // //         <div className="calendar-nav">


// // //           <button
// // //             onClick={() => setCurrentMonth(
// // //               new Date(
// // //                 currentMonth.getFullYear(),
// // //                 currentMonth.getMonth() - 1
// // //               )
// // //             )}
// // //           >
// // //             ‹
// // //           </button>



// // //           <span>
// // //             {formatDate(currentMonth)}
// // //           </span>




// // //           <button
// // //             onClick={() => setCurrentMonth(
// // //               new Date(
// // //                 currentMonth.getFullYear(),
// // //                 currentMonth.getMonth() + 1
// // //               )
// // //             )}
// // //           >
// // //             ›
// // //           </button>


// // //         </div>





// // //         <div className="calendar-weekdays">

// // //           {
// // //             ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
// // //               .map(day => (

// // //                 <div
// // //                   key={day}
// // //                   className="weekday"
// // //                 >
// // //                   {day}
// // //                 </div>

// // //               ))
// // //           }

// // //         </div>





// // //         <div className="calendar-dates">


// // //           {
// // //             Array.from({
// // //               length: firstDay
// // //             })
// // //               .map((_, i) => (

// // //                 <div
// // //                   key={i}
// // //                   className="date empty"
// // //                 />

// // //               ))
// // //           }





// // //           {
// // //             Array.from({
// // //               length: daysInMonth
// // //             })
// // //               .map((_, i) => {


// // //                 const date =
// // //                   new Date(
// // //                     currentMonth.getFullYear(),
// // //                     currentMonth.getMonth(),
// // //                     i + 1
// // //                   );



// // //                 const today =
// // //                   date.toDateString()
// // //                   ===
// // //                   new Date()
// // //                     .toDateString();



// // //                 const selected =
// // //                   selectedDate &&
// // //                   date.toDateString()
// // //                   ===
// // //                   selectedDate.toDateString();



// // //                 return (

// // //                   <div

// // //                     key={i}

// // //                     className={
// // //                       `date
// // // ${today ? "today" : ""}
// // // ${selected ? "selected" : ""}`
// // //                     }


// // //                     onClick={() =>
// // //                       onSelectDate(date)
// // //                     }

// // //                   >

// // //                     {i + 1}

// // //                   </div>

// // //                 )


// // //               })

// // //           }



// // //         </div>





// // //         <div className="calendar-today">

// // //           Today

// // //         </div>



// // //       </div>



// // //     </div>

// // //   );

// // // }



























// // // // import { useState } from "react";
// // // // import "./SchedulesCalendar.css";

// // // // export default function SchedulesCalendar({
// // // //   schedules = [],
// // // //   selectedDate,
// // // //   onSelectDate,
// // // //   onDelete,
// // // //   onRefresh,
// // // //   token,
// // // // }) {

// // // //   const [currentMonth, setCurrentMonth] = useState(new Date());
// // // //   const [hoveredSlot, setHoveredSlot] = useState(null);


// // // //   const weekDays = [
// // // //     "Monday",
// // // //     "Tuesday",
// // // //     "Wednesday",
// // // //     "Thursday",
// // // //     "Friday",
// // // //   ];



// // // //   // Convert backend time into 24 hour number
// // // //   const convertHour = (time) => {

// // // //     if (!time) return null;


// // // //     let hour = parseInt(
// // // //       time.split(":")[0],
// // // //       10
// // // //     );


// // // //     if (
// // // //       time.includes("PM") &&
// // // //       hour !== 12
// // // //     ) {
// // // //       hour += 12;
// // // //     }


// // // //     if (
// // // //       time.includes("AM") &&
// // // //       hour === 12
// // // //     ) {
// // // //       hour = 0;
// // // //     }


// // // //     return hour;

// // // //   };




// // // //   // Convert 24 hour number to 12 hour display
// // // //   const formatHour = (hour) => {

// // // //     const date = new Date();

// // // //     date.setHours(
// // // //       hour,
// // // //       0,
// // // //       0,
// // // //       0
// // // //     );


// // // //     return date.toLocaleTimeString(
// // // //       "en-US",
// // // //       {
// // // //         hour: "numeric",
// // // //         minute: "2-digit",
// // // //         hour12: true
// // // //       }
// // // //     );

// // // //   };




// // // //   // Dynamic timetable hours
// // // //   // Default 8AM - 5PM
// // // //   // Extend according to schedules

// // // //   const generateTimeSlots = () => {

// // // //     const hours = new Set();


// // // //     // Default college timing
// // // //     for (let i = 8; i <= 17; i++) {

// // // //       hours.add(i);

// // // //     }



// // // //     schedules.forEach(schedule => {


// // // //       Object.values(
// // // //         schedule.slots || {}
// // // //       )
// // // //         .flat()
// // // //         .forEach(slot => {


// // // //           const start =
// // // //             convertHour(
// // // //               slot.startTime
// // // //             );


// // // //           const end =
// // // //             convertHour(
// // // //               slot.endTime
// // // //             );



// // // //           if (start !== null) {
// // // //             hours.add(start);
// // // //           }


// // // //           if (end !== null) {
// // // //             hours.add(end);
// // // //           }


// // // //         });


// // // //     });



// // // //     return [...hours]
// // // //       .sort((a, b) => a - b);


// // // //   };



// // // //   const timeSlots =
// // // //     generateTimeSlots();






// // // //   const handleDelete = async (scheduleId) => {


// // // //     if (
// // // //       window.confirm(
// // // //         "Delete this schedule?"
// // // //       )
// // // //     ) {

// // // //       await onDelete(
// // // //         scheduleId,
// // // //         token
// // // //       );


// // // //       onRefresh();

// // // //     }

// // // //   };







// // // //   const getSchedulesForSlot = (day, hour) => {


// // // //     const dayKey =
// // // //       day.toLowerCase();



// // // //     return schedules.flatMap(
// // // //       schedule => {


// // // //         const slots =
// // // //           schedule.slots?.[dayKey] || [];



// // // //         return slots
// // // //           .filter(slot => {


// // // //             return (
// // // //               convertHour(
// // // //                 slot.startTime
// // // //               )
// // // //               === hour
// // // //             );


// // // //           })


// // // //           .map(slot => ({


// // // //             id: slot._id,


// // // //             scheduleId:
// // // //               schedule._id,


// // // //             course:
// // // //               schedule.courseId
// // // //                 ?.courseCode ||
// // // //               "Unknown",



// // // //             trainer:
// // // //               schedule.trainerId
// // // //                 ?.name ||
// // // //               "",



// // // //             startTime:
// // // //               slot.startTime,


// // // //             endTime:
// // // //               slot.endTime



// // // //           }));


// // // //       }
// // // //     );


// // // //   };







// // // //   const getDaysInMonth = (date) => {

// // // //     return new Date(
// // // //       date.getFullYear(),
// // // //       date.getMonth() + 1,
// // // //       0
// // // //     ).getDate();

// // // //   };



// // // //   const getFirstDayOfMonth = (date) => {

// // // //     return new Date(
// // // //       date.getFullYear(),
// // // //       date.getMonth(),
// // // //       1
// // // //     ).getDay();

// // // //   };



// // // //   const formatDate = (date) => {

// // // //     return date.toLocaleDateString(
// // // //       "en-US",
// // // //       {
// // // //         month: "long",
// // // //         year: "numeric"
// // // //       }
// // // //     );

// // // //   };



// // // //   const getDayName = (index) => {

// // // //     return [
// // // //       "SUN",
// // // //       "MON",
// // // //       "TUE",
// // // //       "WED",
// // // //       "THU",
// // // //       "FRI",
// // // //       "SAT"
// // // //     ][index];

// // // //   };




// // // //   const daysInMonth =
// // // //     getDaysInMonth(
// // // //       currentMonth
// // // //     );


// // // //   const firstDay =
// // // //     getFirstDayOfMonth(
// // // //       currentMonth
// // // //     );








// // // //   return (

// // // //     <div className="Schedulees-calendar-container">



// // // //       <div className="calendar-main">



// // // //         <div className="calendar-grid">


// // // //           <div className="grid-header">


// // // //             <div className="time-label">
// // // //               TIME
// // // //             </div>



// // // //             {
// // // //               weekDays.map(day => (

// // // //                 <div
// // // //                   key={day}
// // // //                   className="day-header"
// // // //                 >

// // // //                   {day}

// // // //                 </div>

// // // //               ))
// // // //             }


// // // //           </div>







// // // //           {
// // // //             timeSlots.map(hour => (


// // // //               <div
// // // //                 className="time-row"
// // // //                 key={hour}
// // // //               >


// // // //                 <div className="time-label">

// // // //                   {formatHour(hour)}

// // // //                 </div>





// // // //                 {
// // // //                   weekDays.map(day => (


// // // //                     <div

// // // //                       key={`${day}-${hour}`}

// // // //                       className="time-slot"


// // // //                       onMouseEnter={() =>
// // // //                         setHoveredSlot(
// // // //                           `${day}-${hour}`
// // // //                         )
// // // //                       }


// // // //                       onMouseLeave={() =>
// // // //                         setHoveredSlot(null)
// // // //                       }

// // // //                     >


// // // //                       {
// // // //                         getSchedulesForSlot(
// // // //                           day,
// // // //                           hour
// // // //                         )
// // // //                           .map(schedule => (


// // // //                             <div

// // // //                               key={schedule.id}

// // // //                               className="Schedulee-card"

// // // //                             >


// // // //                               <div className="card-title">

// // // //                                 {schedule.course}

// // // //                               </div>



// // // //                               {
// // // //                                 schedule.trainer &&

// // // //                                 <div className="card-trainer">

// // // //                                   {schedule.trainer}

// // // //                                 </div>

// // // //                               }



// // // //                               <div className="card-time">

// // // //                                 {schedule.startTime}
// // // //                                 -
// // // //                                 {schedule.endTime}

// // // //                               </div>




// // // //                               {
// // // //                                 hoveredSlot === `${day}-${hour}` &&

// // // //                                 <button

// // // //                                   className="btn-delete-card"

// // // //                                   onClick={() =>
// // // //                                     handleDelete(
// // // //                                       schedule.scheduleId
// // // //                                     )
// // // //                                   }

// // // //                                 >

// // // //                                   ×

// // // //                                 </button>

// // // //                               }



// // // //                             </div>


// // // //                           ))

// // // //                       }



// // // //                     </div>


// // // //                   ))

// // // //                 }



// // // //               </div>


// // // //             ))

// // // //           }



// // // //         </div>


// // // //       </div>









// // // //       <div className="mini-calendar">


// // // //         <div className="calendar-nav">


// // // //           <button
// // // //             onClick={() => setCurrentMonth(
// // // //               new Date(
// // // //                 currentMonth.getFullYear(),
// // // //                 currentMonth.getMonth() - 1
// // // //               )
// // // //             )}
// // // //           >
// // // //             ‹
// // // //           </button>



// // // //           <span>

// // // //             {formatDate(currentMonth)}

// // // //           </span>



// // // //           <button
// // // //             onClick={() => setCurrentMonth(
// // // //               new Date(
// // // //                 currentMonth.getFullYear(),
// // // //                 currentMonth.getMonth() + 1
// // // //               )
// // // //             )}
// // // //           >

// // // //             ›

// // // //           </button>


// // // //         </div>





// // // //         <div className="calendar-weekdays">

// // // //           {
// // // //             Array.from({ length: 7 })
// // // //               .map((_, i) => (

// // // //                 <div
// // // //                   key={i}
// // // //                   className="weekday"
// // // //                 >

// // // //                   {getDayName(i)}

// // // //                 </div>

// // // //               ))
// // // //           }

// // // //         </div>





// // // //         <div className="calendar-dates">


// // // //           {
// // // //             Array.from({
// // // //               length: firstDay
// // // //             })
// // // //               .map((_, i) => (

// // // //                 <div
// // // //                   key={i}
// // // //                   className="date empty"
// // // //                 />

// // // //               ))
// // // //           }




// // // //           {
// // // //             Array.from({
// // // //               length: daysInMonth
// // // //             })
// // // //               .map((_, i) => {


// // // //                 const date =
// // // //                   new Date(
// // // //                     currentMonth.getFullYear(),
// // // //                     currentMonth.getMonth(),
// // // //                     i + 1
// // // //                   );



// // // //                 const today =
// // // //                   date.toDateString()
// // // //                   ===
// // // //                   new Date()
// // // //                     .toDateString();



// // // //                 const selected =
// // // //                   selectedDate &&
// // // //                   date.toDateString()
// // // //                   ===
// // // //                   selectedDate.toDateString();



// // // //                 return (

// // // //                   <div

// // // //                     key={i}

// // // //                     className={
// // // //                       `date
// // // // ${today ? "today" : ""}
// // // // ${selected ? "selected" : ""}`
// // // //                     }

// // // //                     onClick={() =>
// // // //                       onSelectDate(date)
// // // //                     }

// // // //                   >

// // // //                     {i + 1}

// // // //                   </div>

// // // //                 )


// // // //               })

// // // //           }


// // // //         </div>




// // // //         <div className="calendar-today">

// // // //           Today

// // // //         </div>



// // // //       </div>



// // // //     </div>


// // // //   );


// // // // }












// // // // import { useState } from "react";
// // // // import "./SchedulesCalendar.css";

// // // // export default function SchedulesCalendar({
// // // //   schedules,
// // // //   selectedDate,
// // // //   onSelectDate,
// // // //   onDelete,
// // // //   onRefresh,
// // // //   token,
// // // // }) {
// // // //   const [currentMonth, setCurrentMonth] = useState(new Date());
// // // //   const [hoveredSlot, setHoveredSlot] = useState(null);

// // // //   const handleDelete = async (scheduleId) => {
// // // //     if (window.confirm("Are you sure you want to delete this schedule?")) {
// // // //       await onDelete(scheduleId, token);
// // // //       onRefresh();
// // // //     }
// // // //   };

// // // //   const getDaysInMonth = (date) => {
// // // //     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
// // // //   };

// // // //   const getFirstDayOfMonth = (date) => {
// // // //     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
// // // //   };

// // // //   const formatDate = (date) => {
// // // //     return date.toLocaleDateString("en-US", {
// // // //       month: "long",
// // // //       year: "numeric",
// // // //     });
// // // //   };

// // // //   const getDayName = (index) => {
// // // //     const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
// // // //     return days[index];
// // // //   };

// // // //   const weekDays = [
// // // //     "Monday",
// // // //     "Tuesday",
// // // //     "Wednesday",
// // // //     "Thursday",
// // // //     "Friday",
// // // //   ];

// // // //   // Generate unique time slots from backend data
// // // //   const timeSlots = [
// // // //     ...new Set(
// // // //       schedules.flatMap((schedule) =>
// // // //         Object.values(schedule.slots || {}).flat().map((slot) => {
// // // //           let hour = parseInt(slot.startTime.split(":")[0], 10);

// // // //           // Handle 12-hour format if backend ever returns AM/PM
// // // //           if (slot.startTime.includes("PM") && hour !== 12) hour += 12;
// // // //           if (slot.startTime.includes("AM") && hour === 12) hour = 0;

// // // //           return `${String(hour).padStart(2, "0")}:00`;
// // // //         })
// // // //       )
// // // //     ),
// // // //   ].sort();

// // // //   const getSchedulesForSlot = (day, time) => {
// // // //     const dayKey = day.toLowerCase();
// // // //     const hour = parseInt(time.split(":")[0], 10);

// // // //     return schedules.flatMap((schedule) => {
// // // //       const slots = schedule.slots?.[dayKey] || [];

// // // //       return slots
// // // //         .filter((slot) => {
// // // //           let slotHour = parseInt(slot.startTime.split(":")[0], 10);

// // // //           if (slot.startTime.includes("PM") && slotHour !== 12)
// // // //             slotHour += 12;
// // // //           if (slot.startTime.includes("AM") && slotHour === 12)
// // // //             slotHour = 0;

// // // //           return slotHour === hour;
// // // //         })
// // // //         .map((slot) => ({
// // // //           id: slot._id,
// // // //           scheduleId: schedule._id,
// // // //           course: schedule.courseId?.courseCode || "Unknown Course",
// // // //           session: schedule.sessionId,
// // // //           startTime: slot.startTime,
// // // //           endTime: slot.endTime,
// // // //         }));
// // // //     });
// // // //   };

// // // //   const daysInMonth = getDaysInMonth(currentMonth);
// // // //   const firstDay = getFirstDayOfMonth(currentMonth);

// // // //   return (
// // // //     <div className="Schedulees-calendar-container">
// // // //       <div className="calendar-main">
// // // //         <div className="calendar-grid">
// // // //           {/* Header */}
// // // //           <div className="grid-header">
// // // //             <div className="time-label">Time</div>

// // // //             {weekDays.map((day) => (
// // // //               <div key={day} className="day-header">
// // // //                 {day}
// // // //               </div>
// // // //             ))}
// // // //           </div>

// // // //           {/* Time Rows */}
// // // //           {timeSlots.map((time) => (
// // // //             <div key={time} className="time-row">
// // // //               <div className="time-label">{time}</div>

// // // //               {weekDays.map((day) => (
// // // //                 <div
// // // //                   key={`${day}-${time}`}
// // // //                   className="time-slot"
// // // //                   onMouseEnter={() => setHoveredSlot(`${day}-${time}`)}
// // // //                   onMouseLeave={() => setHoveredSlot(null)}
// // // //                 >
// // // //                   {getSchedulesForSlot(day, time).map((schedule) => (
// // // //                     <div
// // // //                       key={schedule.id}
// // // //                       className={`Schedulee-card ${
// // // //                         hoveredSlot === `${day}-${time}` ? "hovered" : ""
// // // //                       }`}
// // // //                     >
// // // //                       <div className="card-title">{schedule.course}</div>

// // // //                       <div className="card-time">
// // // //                         {schedule.startTime} - {schedule.endTime}
// // // //                       </div>

// // // //                       {hoveredSlot === `${day}-${time}` && (
// // // //                         <button
// // // //                           className="btn-delete-card"
// // // //                           onClick={() => handleDelete(schedule.scheduleId)}
// // // //                         >
// // // //                           ×
// // // //                         </button>
// // // //                       )}
// // // //                     </div>
// // // //                   ))}
// // // //                 </div>
// // // //               ))}
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       </div>

// // // //       {/* Mini Calendar */}
// // // //       <div className="mini-calendar">
// // // //         <div className="calendar-nav">
// // // //           <button
// // // //             onClick={() =>
// // // //               setCurrentMonth(
// // // //                 new Date(
// // // //                   currentMonth.getFullYear(),
// // // //                   currentMonth.getMonth() - 1
// // // //                 )
// // // //               )
// // // //             }
// // // //           >
// // // //             ‹
// // // //           </button>

// // // //           <span className="calendar-month">
// // // //             {formatDate(currentMonth)}
// // // //           </span>

// // // //           <button
// // // //             onClick={() =>
// // // //               setCurrentMonth(
// // // //                 new Date(
// // // //                   currentMonth.getFullYear(),
// // // //                   currentMonth.getMonth() + 1
// // // //                 )
// // // //               )
// // // //             }
// // // //           >
// // // //             ›
// // // //           </button>
// // // //         </div>

// // // //         <div className="calendar-weekdays">
// // // //           {Array.from({ length: 7 }).map((_, i) => (
// // // //             <div key={i} className="weekday">
// // // //               {getDayName(i)}
// // // //             </div>
// // // //           ))}
// // // //         </div>

// // // //         <div className="calendar-dates">
// // // //           {Array.from({ length: firstDay }).map((_, i) => (
// // // //             <div key={`empty-${i}`} className="date empty"></div>
// // // //           ))}

// // // //           {Array.from({ length: daysInMonth }).map((_, i) => {
// // // //             const date = new Date(
// // // //               currentMonth.getFullYear(),
// // // //               currentMonth.getMonth(),
// // // //               i + 1
// // // //             );

// // // //             const isToday =
// // // //               date.toDateString() === new Date().toDateString();

// // // //             const isSelected =
// // // //               selectedDate &&
// // // //               date.toDateString() === selectedDate.toDateString();

// // // //             return (
// // // //               <div
// // // //                 key={i}
// // // //                 className={`date ${isToday ? "today" : ""} ${
// // // //                   isSelected ? "selected" : ""
// // // //                 }`}
// // // //                 onClick={() => onSelectDate(date)}
// // // //               >
// // // //                 {i + 1}
// // // //               </div>
// // // //             );
// // // //           })}
// // // //         </div>

// // // //         <div className="calendar-today">Today</div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }


// // // // // import { useState } from 'react';


// // // // // import './SchedulesCalendar.css'
// // // // // export default function SchedulesCalendar({ schedules, selectedDate, onSelectDate, onDelete, onRefresh }) {
// // // // //   const [currentMonth, setCurrentMonth] = useState(new Date());
// // // // //   const [hoveredSlot, setHoveredSlot] = useState(null);

// // // // //   const handleDelete = async (scheduleId) => {
// // // // //     if (window.confirm('Are you sure you want to delete this schedule slot?')) {
// // // // //       await onDelete(scheduleId);
// // // // //       onRefresh();
// // // // //     }
// // // // //   };

// // // // //   const getDaysInMonth = (date) => {
// // // // //     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
// // // // //   };

// // // // //   const getFirstDayOfMonth = (date) => {
// // // // //     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
// // // // //   };

// // // // //   const formatDate = (date) => {
// // // // //     return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
// // // // //   };

// // // // //   const getDayName = (index) => {
// // // // //     const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// // // // //     return days[index];
// // // // //   };

// // // // //   const timeSlots = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
// // // // //   const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// // // // //   const getSchedulesForSlot = (day, time) => {
// // // // //     return schedules.filter(s => s.day === day && s.timeSlot.startsWith(time.split(':')[0]));
// // // // //   };

// // // // //   const daysInMonth = getDaysInMonth(currentMonth);
// // // // //   const firstDay = getFirstDayOfMonth(currentMonth);

// // // // //   return (
// // // // //     <div className="Schedulees-calendar-container">
// // // // //       <div className="calendar-main">
// // // // //         {/* Weekly Grid */}
// // // // //         <div className="calendar-grid">
// // // // //           {/* Header */}
// // // // //           <div className="grid-header">
// // // // //             <div className="time-label">Time</div>
// // // // //             {weekDays.map(day => (
// // // // //               <div key={day} className="day-header">{day}</div>
// // // // //             ))}
// // // // //           </div>

// // // // //           {/* Time Slots */}
// // // // //           {timeSlots.map(time => (
// // // // //             <div key={time} className="time-row">
// // // // //               <div className="time-label">{time}</div>
// // // // //               {weekDays.map(day => (
// // // // //                 <div
// // // // //                   key={`${day}-${time}`}
// // // // //                   className="time-slot"
// // // // //                   onMouseEnter={() => setHoveredSlot(`${day}-${time}`)}
// // // // //                   onMouseLeave={() => setHoveredSlot(null)}
// // // // //                 >
// // // // //                   {getSchedulesForSlot(day, time).map(schedule => (
// // // // //                     <div
// // // // //                       key={schedule.id}
// // // // //                       className={`Schedulee-card ${hoveredSlot === `${day}-${time}` ? 'hovered' : ''}`}
// // // // //                     >
// // // // //                       <div className="card-title">{schedule.course}</div>
// // // // //                       <div className="card-trainer">{schedule.trainer}</div>
// // // // //                       {hoveredSlot === `${day}-${time}` && (
// // // // //                         <button
// // // // //                           className="btn-delete-card"
// // // // //                           onClick={() => handleDelete(schedule.id)}
// // // // //                         >
// // // // //                           ×
// // // // //                         </button>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   ))}
// // // // //                 </div>
// // // // //               ))}
// // // // //             </div>
// // // // //           ))}
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Mini Calendar */}
// // // // //       <div className="mini-calendar">
// // // // //         <div className="calendar-nav">
// // // // //           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
// // // // //             ‹
// // // // //           </button>
// // // // //           <span className="calendar-month">{formatDate(currentMonth)}</span>
// // // // //           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
// // // // //             ›
// // // // //           </button>
// // // // //         </div>

// // // // //         <div className="calendar-weekdays">
// // // // //           {Array.from({ length: 7 }).map((_, i) => (
// // // // //             <div key={i} className="weekday">{getDayName(i)}</div>
// // // // //           ))}
// // // // //         </div>

// // // // //         <div className="calendar-dates">
// // // // //           {Array.from({ length: firstDay }).map((_, i) => (
// // // // //             <div key={`empty-${i}`} className="date empty"></div>
// // // // //           ))}
// // // // //           {Array.from({ length: daysInMonth }).map((_, i) => {
// // // // //             const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
// // // // //             const isToday = date.toDateString() === new Date().toDateString();
// // // // //             return (
// // // // //               <div
// // // // //                 key={i + 1}
// // // // //                 className={`date ${isToday ? 'today' : ''} ${
// // // // //                   date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
// // // // //                 }`}
// // // // //                 onClick={() => onSelectDate(date)}
// // // // //               >
// // // // //                 {i + 1}
// // // // //               </div>
// // // // //             );
// // // // //           })}
// // // // //         </div>

// // // // //         <div className="calendar-today">Today</div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }