import { useMemo, useState } from "react";
import SchedulesTable from "./components/SchedulesTable";
import SchedulesCalendar from "./components/SchedulesCalendar";
import AttendanceForm from "../attendance/attendance";
import { useTrainer } from "../../../hooks/useTrainer";
import TopicFeedbackModal from "./components/TopicFeedbackModal";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import "./schedules.css";

export default function SchedulesPage({ token }) {
  const {
    AllUpcommingSlots = [],
    updateTopicAndFeedback,
    submitAttendance,
    selectedDate,
    setSelectedDate,
    setselectedcourse,
    selectedcourse,
    studentsbycoll,
  } = useTrainer(token);



    const contentRef = useRef(null);
  
    const scrollToBottom = () => {
      contentRef.current?.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    };
    const [showButton, setShowButton] = useState(false);
  
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
  
      // Is scrolling even possible?
      const scrollable = el.scrollHeight > el.clientHeight;
  
      // Is the user at the bottom?
      const atBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
  
      setShowButton(scrollable && !atBottom);
    };

  const [view, setView] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showTopicFeedbackModal, setShowTopicFeedbackModal] = useState(false);
  const [showAttendanceModal, setshowAttendanceModal] = useState(false);
  const [TopicFeedbackData, setTopicFeedbackData] = useState(null);

  const getScheduleDate = (schedule) => {
    if (!schedule?.date) return null;
    const d = new Date(schedule.date);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getWeekLabel = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(d);
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const getScheduleStatus = (schedule) => {
    const raw = (schedule?.status || "").toLowerCase();
    if (raw === "completed" || raw === "cancelled" || raw === "cancelled") {
      return raw;
    }
    return "active";
  };

  const getCourseLabel = (schedule) => {
    return (
      schedule?.course?.courseCode ||
      schedule?.course?.name ||
      schedule?.courseCode ||
      schedule?.courseName ||
      "Unknown"
    );
  };

  const courseOptions = useMemo(() => {
    const map = new Map();

    AllUpcommingSlots.forEach((schedule) => {
      const label = getCourseLabel(schedule);
      if (label && label !== "Unknown") {
        map.set(label, label);
      }
    });

    return ["All", ...Array.from(map.values()).sort()];
  }, [AllUpcommingSlots]);

  const filteredSchedules = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return AllUpcommingSlots.filter((schedule) => {
      const courseLabel = getCourseLabel(schedule);
      const status = getScheduleStatus(schedule);

      const matchesCourse =
        courseFilter === "All" || courseLabel === courseFilter;

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter.toLowerCase();

      if (!query) return matchesCourse && matchesStatus;

      const dateText = getScheduleDate(schedule)
        ? formatDate(schedule.date).toLowerCase()
        : "";

      const sessionText = schedule.session
        ? `${formatDate(schedule.session.startDate)} ${formatDate(
            schedule.session.endDate
          )}`
        : "";

      const matchesSearch =
        courseLabel.toLowerCase().includes(query) ||
        (schedule.roomNo || "").toLowerCase().includes(query) ||
        (schedule.topic || "").toLowerCase().includes(query) ||
        dateText.includes(query) ||
        sessionText.toLowerCase().includes(query) ||
        (schedule._id || "").toLowerCase().includes(query);

      return matchesCourse && matchesStatus && matchesSearch;
    });
  }, [AllUpcommingSlots, searchTerm, courseFilter, statusFilter]);

  const totalSchedules = AllUpcommingSlots.length;
  const todaySchedules = AllUpcommingSlots.filter((schedule) => {
    const date = getScheduleDate(schedule);
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  }).length;

  const activeSchedules = AllUpcommingSlots.filter(
    (schedule) => getScheduleStatus(schedule) === "active"
  ).length;

  const completedSchedules = AllUpcommingSlots.filter(
    (schedule) => getScheduleStatus(schedule) === "completed"
  ).length;

  const selectedWeekLabel = getWeekLabel(selectedDate);

  const uniqueCourses = useMemo(() => {
    const set = new Set();
    AllUpcommingSlots.forEach((schedule) => {
      set.add(getCourseLabel(schedule));
    });
    return set.size;
  }, [AllUpcommingSlots]);

  if (showTopicFeedbackModal) {
    return (
      <TopicFeedbackModal
        token={token}
        onBack={() => setShowTopicFeedbackModal(false)}
        slot={TopicFeedbackData}
        onSuccess={() => {
          setShowTopicFeedbackModal(false);
        }}
        updateTopicAndFeedback={updateTopicAndFeedback}
      />
    );
  }

  if (showAttendanceModal) {
    return (
      <AttendanceForm
        token={token}
        onBack={() => setshowAttendanceModal(false)}
        slot={TopicFeedbackData}
        onSuccess={() => setshowAttendanceModal(false)}
        submitAttendance={submitAttendance}
        students={studentsbycoll}
        // setselectedcourse={setselectedcourse}
      />
    );
  }

  return (
    <>
      <div
        className={`scroll-bottom-btn ${showButton ? "" : "hidden"}`}
        onClick={scrollToBottom}
      >
        <ChevronDown />
      </div>
      <div ref={contentRef} onScroll={handleScroll} className="Schedulees-page no-scrollbar">
    {/* <div className="Schedulees-page"> */}




      <div className="Schedulees-header">
      {/* <pre>{JSON.stringify(selectedcourse, null, 2)}</pre> */}
        <div>
          <h1>Schedules</h1>
          <p>Timetables and slot management</p>
          {selectedWeekLabel && (
            <div className="schedule-week-label">
              Week of {selectedWeekLabel}
            </div>
          )}
        </div>

        <div className="Schedulees-controls">
            <button
              className={`btn-view-toggle ${view === "table" ? "active" : ""}`}
              onClick={() => {
                setView("table")
                setShowButton(false);
              }}
            >
              Table
            </button>
            <button
              className={`btn-view-toggle ${view === "calendar" ? "active" : ""}`}
              onClick={() => {
                setView("calendar");
                setShowButton(true);
              }}
            >
              Calendar
            </button>
          {/* <button
            className="btn-view-toggle"
            onClick={() => setSelectedDate(new Date())}
            title="Jump to today"
            >
            Today
            </button> */}
        </div>
      </div>

      <div className="students-stats sessions-stats">
        <div className="stat-card">
          <span>Total Schedules</span>
          <h2>{totalSchedules}</h2>
        </div>

        {/* <div className="stat-card">
          <span>Today</span>
          <h2>{todaySchedules}</h2>
          </div> */}

        <div className="stat-card">
          <span>Active</span>
          <h2>{activeSchedules}</h2>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <h2>{completedSchedules}</h2>
        </div>

        <div className="stat-card">
          <span>Courses</span>
          <h2>{uniqueCourses}</h2>
        </div>
      </div>

      <div className="sessions-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by course, room, topic, date, or session..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="status-filter"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          >
          <option value="All">All Courses</option>
          {courseOptions
            .filter((course) => course !== "All")
            .map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
        </select>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="students-results">
        Showing <strong>{filteredSchedules.length}</strong> of{" "}
        <strong>{totalSchedules}</strong> schedules
      </div>

      {view === "table" ? (
        <SchedulesTable
        schedules={filteredSchedules}
        setTopicFeedbackData={setTopicFeedbackData}
        setShowTopicFeedbackModal={setShowTopicFeedbackModal}
        setshowAttendanceModal={setshowAttendanceModal}
        token={token}
        setselectedcourse={setselectedcourse}
        />
      ) : (
        <SchedulesCalendar
        token={token}
        schedules={filteredSchedules}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        setTopicFeedbackData={setTopicFeedbackData}
        setShowTopicFeedbackModal={setShowTopicFeedbackModal}
        setshowAttendanceModal={setshowAttendanceModal}
        />
      )}
    </div>
    </>
  );
}












// // SchedulesPage.jsx
// import { useMemo, useState } from "react";
// import SchedulesTable from "./components/SchedulesTable";
// import SchedulesCalendar from "./components/SchedulesCalendar";
// import AttendanceForm from "../attendance/attendance";
// import { useTrainer } from "../../../hooks/useTrainer";
// import TopicFeedbackModal from "./components/TopicFeedbackModal";
// import "./schedules.css";

// export default function SchedulesPage({ token }) {
//   const {
//     AllUpcommingSlots = [],
//     updateTopicAndFeedback,
//     submitAttendance,
//     selectedDate,
//     setSelectedDate,
//     setselectedcourse,
//     studentsbycoll,
//   } = useTrainer(token);

//   const [view, setView] = useState("table");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showTopicFeedbackModal, setShowTopicFeedbackModal] = useState(false);
//   const [showAttendanceModal, setshowAttendanceModal] = useState(false);
//   const [TopicFeedbackData, setTopicFeedbackData] = useState(null);

//   const getScheduleDate = (schedule) => {
//     if (!schedule?.date) return null;
//     const d = new Date(schedule.date);
//     return Number.isNaN(d.getTime()) ? null : d;
//   };

//   const formatDate = (date) => {
//     if (!date) return "—";
//     return new Date(date).toLocaleDateString(undefined, {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const getWeekLabel = (date) => {
//     if (!date) return "";
//     const d = new Date(date);
//     const day = d.getDay();
//     const diff = day === 0 ? -6 : 1 - day;
//     const start = new Date(d);
//     start.setDate(start.getDate() + diff);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(start);
//     end.setDate(end.getDate() + 6);

//     return `${formatDate(start)} – ${formatDate(end)}`;
//   };

//   const filteredSchedules = useMemo(() => {
//     const query = searchTerm.toLowerCase().trim();

//     return AllUpcommingSlots.filter((schedule) => {
//       if (!query) return true;

//       const dateText = getScheduleDate(schedule)
//         ? formatDate(schedule.date).toLowerCase()
//         : "";

//       const courseText =
//         schedule.course?.courseCode ||
//         schedule.course?.name ||
//         "";

//       const sessionText = schedule.session
//         ? `${formatDate(schedule.session.startDate)} ${formatDate(
//             schedule.session.endDate
//           )}`
//         : "";

//       return (
//         courseText.toLowerCase().includes(query) ||
//         (schedule.roomNo || "").toLowerCase().includes(query) ||
//         (schedule.topic || "").toLowerCase().includes(query) ||
//         dateText.includes(query) ||
//         sessionText.toLowerCase().includes(query) ||
//         (schedule._id || "").toLowerCase().includes(query)
//       );
//     });
//   }, [AllUpcommingSlots, searchTerm]);

//   const totalSchedules = AllUpcommingSlots.length;
//   const todaySchedules = AllUpcommingSlots.filter((schedule) => {
//     const date = getScheduleDate(schedule);
//     if (!date) return false;
//     return date.toDateString() === new Date().toDateString();
//   }).length;

//   const selectedWeekLabel = getWeekLabel(selectedDate);

//   const uniqueCourses = useMemo(() => {
//     const set = new Set();
//     AllUpcommingSlots.forEach((schedule) => {
//       const course = schedule.course?.courseCode || schedule.course?.name || "Unknown";
//       set.add(course);
//     });
//     return set.size;
//   }, [AllUpcommingSlots]);

//   if (showTopicFeedbackModal) {
//     return (
//       <TopicFeedbackModal
//         token={token}
//         onBack={() => setShowTopicFeedbackModal(false)}
//         slot={TopicFeedbackData}
//         onSuccess={() => {
//           setShowTopicFeedbackModal(false);
//         }}
//         updateTopicAndFeedback={updateTopicAndFeedback}
//       />
//     );
//   }

//   if (showAttendanceModal) {
//     return (
//       <AttendanceForm
//         token={token}
//         onBack={() => setshowAttendanceModal(false)}
//         slot={TopicFeedbackData}
//         onSuccess={() => setshowAttendanceModal(false)}
//         submitAttendance={submitAttendance}
//         students={studentsbycoll}
//         setselectedcourse={setselectedcourse}
//       />
//     );
//   }

//   return (
//     <div className="Schedulees-page">
//       <div className="Schedulees-header">
//         <div>
//           <h1>Schedules</h1>
//           <p>Timetables and slot management</p>
//           {selectedWeekLabel && (
//             <div className="schedule-week-label">
//               Week of {selectedWeekLabel}
//             </div>
//           )}
//         </div>

//         <div className="Schedulees-controls">
//           <button
//             className={`btn-view-toggle ${view === "table" ? "active" : ""}`}
//             onClick={() => setView("table")}
//           >
//             Table
//           </button>

//           <button
//             className={`btn-view-toggle ${view === "calendar" ? "active" : ""}`}
//             onClick={() => setView("calendar")}
//           >
//             Calendar
//           </button>

//           <button
//             className="btn-view-toggle"
//             onClick={() => setSelectedDate(new Date())}
//             title="Jump to today"
//           >
//             Today
//           </button>
//         </div>
//       </div>

//       <div className="students-stats sessions-stats">
//         <div className="stat-card">
//           <span>Total Schedules</span>
//           <h2>{totalSchedules}</h2>
//         </div>

//         <div className="stat-card">
//           <span>Today</span>
//           <h2>{todaySchedules}</h2>
//         </div>

//         <div className="stat-card">
//           <span>Visible</span>
//           <h2>{filteredSchedules.length}</h2>
//         </div>

//         <div className="stat-card">
//           <span>Courses</span>
//           <h2>{uniqueCourses}</h2>
//         </div>
//       </div>

//       <div className="sessions-filters">
//         <div className="search-box">
//           <span className="search-icon">🔍</span>
//           <input
//             type="text"
//             placeholder="Search by course, room, topic, date, or session..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="students-results">
//           Showing <strong>{filteredSchedules.length}</strong> of{" "}
//           <strong>{totalSchedules}</strong> schedules
//         </div>
//       </div>

//       {view === "table" ? (
//         <SchedulesTable
//           schedules={filteredSchedules}
//           setTopicFeedbackData={setTopicFeedbackData}
//           setShowTopicFeedbackModal={setShowTopicFeedbackModal}
//           setshowAttendanceModal={setshowAttendanceModal}
//           token={token}
//         />
//       ) : (
//         <SchedulesCalendar
//           token={token}
//           schedules={filteredSchedules}
//           selectedDate={selectedDate}
//           onSelectDate={setSelectedDate}
//           setTopicFeedbackData={setTopicFeedbackData}
//           setShowTopicFeedbackModal={setShowTopicFeedbackModal}
//           setshowAttendanceModal={setshowAttendanceModal}
//         />
//       )}
//     </div>
//   );
// }

















// // import { useState, useMemo } from "react";
// // import SchedulesTable from "./components/SchedulesTable";
// // import SchedulesCalendar from "./components/SchedulesCalendar";
// // import ConflictAlert from "./components/ConflictAlert";
// // import AttendanceForm from "../attendance/attendance"


// // import { useDashboard } from "../../../hooks/useDashboard";
// // import { useTrainer } from "../../../hooks/useTrainer";
// // // import NewSchedulePage from "./pages/NewSchedulePage";
// // import TopicFeedbackModal from "./components/TopicFeedbackModal";

// // import "./schedules.css";

// // export default function SchedulesPage({ token }) {
// //   // const {
// //   //   // AllSchedules,
// //   //   submitAttendance,
// //   //   Allstudents,


// //   // } = useDashboard(token);

// //   const {
// //     // AllSchedules,
// //     AllSlots,
// //     AllUpcommingSlots,
// //     updateTopicAndFeedback,
// //     Allstudents,
// //     submitAttendance,
// //     selectedDate,
// //     setSelectedDate,
// //     selectedcourse,
// //     setselectedcourse,
// //     studentsbycoll,

// //   } = useTrainer(token);


// //   const [view, setView] = useState("table");
// //   // const [selectedDate, setSelectedDate] = useState(new Date());

// //   const [showTopicFeedbackModal, setShowTopicFeedbackModal] = useState(false);
// //   const [showAttendanceModal, setshowAttendanceModal] = useState(false);
// //   const [TopicFeedbackData, setTopicFeedbackData] = useState(null);

// //   if (showTopicFeedbackModal) {

// //     return (

// //       <TopicFeedbackModal

// //         token={token}
// //         onBack={() =>
// //           setShowTopicFeedbackModal(false)
// //         }
// //         slot={TopicFeedbackData}
// //         onSuccess={() => {
// //           // TODO: refresh AllSlots here once useTrainer exposes a refresh fn
// //         }}
// //         updateTopicAndFeedback={updateTopicAndFeedback}
// //       />

// //     );

// //   }

// //   if (showAttendanceModal) {
    
// //     return(
// //       <>
// //     <AttendanceForm 
// //         token={token}
// //         onBack={() =>
// //           setshowAttendanceModal(false)
// //         }
// //         slot={TopicFeedbackData}
// //         onSuccess={() =>
// //           setshowAttendanceModal(false)
// //         }
// //         submitAttendance={submitAttendance}
// //         students={studentsbycoll}
// //         setselectedcourse={setselectedcourse}
        
        
// //         />
// //     </>
// //   )
// // }
  


// //   return (
// //     <div className="Schedulees-page">
// //       {/* Header */}
// //       {/* <pre>{JSON.stringify(selectedDate, null, 2)}</pre> */}
// //       <div className="Schedulees-header">
// //         <div>
// //           <h1>Schedules</h1>
// //           <p>Timetables and slot management</p>
// //         </div>

// //         <div className="Schedulees-controls">
// //           <button
// //             className={`btn-view-toggle ${view === "table" ? "active" : ""
// //               }`}
// //             onClick={() => setView("table")}
// //           >
// //             Table
// //           </button>

// //           <button
// //             className={`btn-view-toggle ${view === "calendar" ? "active" : ""
// //               }`}
// //             onClick={() => setView("calendar")}
// //           >
// //             Calendar
// //           </button>


// //         </div>
// //       </div>

// //       {/* Conflict Alert */}
// //       {/* <ConflictAlert /> */}




// //       <>
// //         {view === "table" ? (
// //           <SchedulesTable
// //             // schedules={AllSlots}
// //             schedules={AllUpcommingSlots}
// //             setTopicFeedbackData={setTopicFeedbackData}
// //             setShowTopicFeedbackModal={setShowTopicFeedbackModal}
// //             setshowAttendanceModal={setshowAttendanceModal}
// //             token={token}
// //           />
// //         ) : (
// //           <SchedulesCalendar
// //             token={token}
// //             // schedules={AllSlots}
// //             schedules={AllUpcommingSlots}
// //             selectedDate={selectedDate}
// //             onSelectDate={setSelectedDate}
// //             setTopicFeedbackData={setTopicFeedbackData}
// //             setShowTopicFeedbackModal={setShowTopicFeedbackModal}
// //             setshowAttendanceModal={setshowAttendanceModal}

// //           />
// //         )}
// //       </>

// //     </div>
// //   );
// // }







// // // import { useState, useMemo } from "react";
// // // import SchedulesTable from "./components/SchedulesTable";
// // // import SchedulesCalendar from "./components/SchedulesCalendar";
// // // import ConflictAlert from "./components/ConflictAlert";


// // // // import { useDashboard } from "../../../hooks/useDashboard";
// // // import { useTrainer } from "../../../hooks/useTrainer";
// // // // import NewSchedulePage from "./pages/NewSchedulePage";
// // // import TopicFeedbackModal from "./components/TopicFeedbackModal";

// // // import "./schedules.css";

// // // export default function SchedulesPage({ token }) {
// // //   // const {
// // //   //   AllSchedules,

// // //   // } = useDashboard(token);

// // //     const {
// // //       // AllSchedules,
// // //       AllSlots,
// // //       updateTopicAndFeedback,
// // //     } = useTrainer(token);
  

// // //   const [view, setView] = useState("table");
// // //   const [selectedDate, setSelectedDate] = useState(new Date());

// // //   const [TopicFeedbackModalpage, setTopicFeedbackModalpage] = useState(false);
// // //   const [TopicFeedbackData, setTopicFeedbackData] = useState(null);

// // //   if (TopicFeedbackModalpage) {
  
// // //       return (
  
// // //         <TopicFeedbackModal
  
// // //           token={token}
// // //           onBack={() =>
// // //             setTopicFeedbackModal(false)
// // //           }
// // //           slot={AllSlots}
// // //         />
  
// // //       );
  
// // //     }
  



// // //   return (
// // //     <div className="Schedulees-page">
// // //       {/* Header */}
// // //       <div className="Schedulees-header">
// // //         <div>
// // //           <h1>Schedules</h1>
// // //           <p>Timetables and slot management</p>
// // //         </div>

// // //         <div className="Schedulees-controls">
// // //           <button
// // //             className={`btn-view-toggle ${view === "table" ? "active" : ""
// // //               }`}
// // //             onClick={() => setView("table")}
// // //           >
// // //             Table
// // //           </button>

// // //           <button
// // //             className={`btn-view-toggle ${view === "calendar" ? "active" : ""
// // //               }`}
// // //             onClick={() => setView("calendar")}
// // //           >
// // //             Calendar
// // //           </button>


// // //         </div>
// // //       </div>

// // //       {/* Conflict Alert */}
// // //       {/* <ConflictAlert /> */}




// // //         <>
// // //           {view === "table" ? (
// // //             <SchedulesTable
// // //               schedules={AllSlots}
// // //               setTopicFeedbackData={setTopicFeedbackData}
// // //               setTopicFeedbackModal={setTopicFeedbackModal}
// // //               updateTopicAndFeedback={updateTopicAndFeedback}
              
// // //               />
// // //             ) : (
// // //               <SchedulesCalendar
// // //               token={token}
// // //               schedules={AllSlots}
// // //               selectedDate={selectedDate}
// // //               onSelectDate={setSelectedDate}
// // //               setTopicFeedbackData={setTopicFeedbackData}
// // //               setTopicFeedbackModal={setTopicFeedbackModal}

// // //             />
// // //           )}
// // //         </>

// // //     </div>
// // //   );
// // // }













// // // // import { useState } from "react";
// // // // import SchedulesTable from "./components/SchedulesTable";
// // // // import SchedulesCalendar from "./components/SchedulesCalendar";
// // // // import ConflictAlert from "./components/ConflictAlert";
// // // // import { useDashboard } from "../../../hooks/useDashboard";
// // // // import NewSchedulePage from "./pages/NewSchedulePage";

// // // // import "./schedules.css";

// // // // export default function SchedulesPage({ token }) {
// // // //   const {
// // // //     AllSchedules,
// // // //     AllCourses,
// // // //     stats,
// // // //     loading,
// // // //     error,
// // // //   } = useDashboard(token);

// // // //   const [view, setView] = useState("table");
// // // //   const [selectedDate, setSelectedDate] = useState(new Date());
// // // //   const [showNewSchedule, setShowNewSchedule] = useState(false);

// // // //   // Show the Add New Schedule page instead of the schedules page
// // // //   if (showNewSchedule) {
// // // //     return (
// // // //       <NewSchedulePage
// // // //         token={token}
// // // //         onBack={() => setShowNewSchedule(false)}
// // // //       />
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="Schedulees-page">
// // // //       {/* Header */}
// // // //       <div className="Schedulees-header">
// // // //         <div>
// // // //           <h1>Schedules</h1>
// // // //           <p>Timetables and slot management</p>
// // // //         </div>

// // // //         <div className="Schedulees-controls">
// // // //           <button
// // // //             className={`btn-view-toggle ${
// // // //               view === "table" ? "active" : ""
// // // //             }`}
// // // //             onClick={() => setView("table")}
// // // //           >
// // // //             Table
// // // //           </button>

// // // //           <button
// // // //             className={`btn-view-toggle ${
// // // //               view === "calendar" ? "active" : ""
// // // //             }`}
// // // //             onClick={() => setView("calendar")}
// // // //           >
// // // //             Calendar
// // // //           </button>

// // // //           <button
// // // //             className="btn-add-slot"
// // // //             onClick={() => setShowNewSchedule(true)}
// // // //           >
// // // //             + Add Slot
// // // //           </button>
// // // //         </div>
// // // //       </div>

// // // //       {/* Conflict Alert */}
// // // //       {/* <ConflictAlert
// // // //         conflicts={conflicts}
// // // //         onResolve={handleResolveConflict}
// // // //       /> */}

// // // //       {/* Filters */}
// // // //       <div
// // // //         style={{
// // // //           display: "flex",
// // // //           gap: "12px",
// // // //           marginBottom: "20px",
// // // //           flexWrap: "wrap",
// // // //         }}
// // // //       >
// // // //         {/* course filter */}
// // // //         <div>
// // // //           <label htmlFor="course-filter">Course:</label>
// // // //           <select id="course-filter" className="filter-select">
// // // //             <option value="">All Courses</option>
// // // //             {AllCourses?.map((course) => (
// // // //               <option key={course._id} value={course._id}>
// // // //                 {course.courseCode}
// // // //               </option>
// // // //             ))}
// // // //           </select>
// // // //         </div>

// // // //       </div>

// // // //       {/* Content */}
// // // //       {loading && <p className="loading">Loading schedules...</p>}

// // // //       {error && <p className="error">{error}</p>}

// // // //       {!loading && !error && (
// // // //         <>
// // // //           {view === "table" ? (
// // // //             <SchedulesTable
// // // //               schedules={AllSchedules}
// // // //               // onDelete={deleteSchedule}
// // // //               // onRefresh={fetchSchedules}
// // // //             />
// // // //           ) : (
// // // //             <SchedulesCalendar
// // // //               schedules={AllSchedules}
// // // //               selectedDate={selectedDate}
// // // //               onSelectDate={setSelectedDate}
// // // //               // onDelete={deleteSchedule}
// // // //               // onRefresh={fetchSchedules}
// // // //             />
// // // //           )}
// // // //         </>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }


















// // // // // import { useState, useEffect } from 'react';
// // // // // import SchedulesTable from './components/SchedulesTable';
// // // // // import SchedulesCalendar from './components/SchedulesCalendar';
// // // // // import ConflictAlert from './components/ConflictAlert';
// // // // // // import useSchedules from './hooks/useSchedules';
// // // // // import { useDashboard } from "../../../hooks/useDashboard";

// // // // // import './schedules.css'


// // // // // import { BrowserRouter, Routes, Route } from "react-router-dom";

// // // // // import { useNavigate } from "react-router-dom";

// // // // // const navigate = useNavigate();
// // // // // import NewSchedulePage from './pages/NewSchedulePage';

















// // // // // export default function SchedulesPage({ token }) {
// // // // //   // const { schedules, conflicts, loading, error, fetchSchedules, deleteSchedule, resolveConflict } = useSchedules();

// // // // //   const {
// // // // //     selectedCollege,
// // // // //     setSelectedCollege,
// // // // //     colleges,
// // // // //     // AllSessions,
// // // // //     // setCurrentSession,
// // // // //     // CurrentSession,
// // // // //     UpcomingScheduleByColl,
// // // // //     AllSchedules,
// // // // //     stats,
// // // // //     loading,
// // // // //     error,
// // // // //     AttendanceByCollegeAndSession,
// // // // //   } = useDashboard(token);







// // // // //   const [view, setView] = useState('table');
// // // // //   const [selectedDate, setSelectedDate] = useState(new Date());



// // // // //   return (
// // // // //     <div className="Schedulees-page">



// // // // //       <BrowserRouter>
// // // // //         <Routes>
// // // // //           <Route path="/schedules/new" element={<NewSchedulePage />} />
// // // // //         </Routes>
// // // // //       </BrowserRouter>





// // // // //       {/* Header */}
// // // // //       <div className="Schedulees-header">
// // // // //         <div>
// // // // //           <h1>Schedules</h1>
// // // // //           <p>Timetables and slot management</p>
// // // // //         </div>
// // // // //         <div className="Schedulees-controls">
// // // // //           <button
// // // // //             className={`btn-view-toggle ${view === 'table' ? 'active' : ''}`}
// // // // //             onClick={() => setView('table')}
// // // // //           >
// // // // //             Table
// // // // //           </button>
// // // // //           <button
// // // // //             className={`btn-view-toggle ${view === 'calendar' ? 'active' : ''}`}
// // // // //             onClick={() => setView('calendar')}
// // // // //           >
// // // // //             Calendar
// // // // //           </button>
// // // // //           <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
// // // // //             + Add Slot
// // // // //           </button>
// // // // //           {/* <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
// // // // //             + Add Slot
// // // // //           </button> */}
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Conflict Alert */}
// // // // //       {/* {conflicts.length > 0 && (
// // // // //         <ConflictAlert 
// // // // //           conflicts={conflicts} 
// // // // //           onResolve={handleResolveConflict}
// // // // //         />
// // // // //       )} */}

// // // // //       {/* Content */}
// // // // //       {loading && <p className="loading">Loading schedules...</p>}
// // // // //       {error && <p className="error">{error}</p>}
// // // // //       {!loading && !error && (
// // // // //         <>
// // // // //           {view === 'table' ? (
// // // // //             <SchedulesTable
// // // // //               schedules={AllSchedules}
// // // // //             // onDelete={deleteSchedule}
// // // // //             // onRefresh={fetchSchedules}
// // // // //             />
// // // // //           ) : (
// // // // //             <SchedulesCalendar
// // // // //               schedules={AllSchedules}
// // // // //               selectedDate={selectedDate}
// // // // //               onSelectDate={setSelectedDate}
// // // // //             // onDelete={deleteSchedule}
// // // // //             // onRefresh={fetchSchedules}
// // // // //             />


// // // // //           )}
// // // // //           add drop down in for college and session selections
// // // // //         </>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }