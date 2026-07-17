// SchedulesPage.jsx
import { useMemo, useState } from "react";
import SchedulesTable from "./components/SchedulesTable";
import SchedulesCalendar from "./components/SchedulesCalendar";
import UpdateSchedulePage from "./components/UpdateSchedulePage";
import CSVScheduleUpload from "./components/CSVScheduleUpload";
import { useDashboard } from "../../../hooks/useDashboard";

import { ChevronDown } from "lucide-react";
import { useRef } from "react";

import "./schedules.css";

export default function SchedulesPage({ token }) {
  const {
    AllSlots = [],
    AllCourses = [],
    loading,
    error,
    createSlot,
    updateSlot,
    deleteSlot,
    AllSessions = [],
    AllTrainers = [],
    refreshSchedules,
    setSelectedDate,
    selectedDate,
  } = useDashboard(token);


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
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [showUpdateSchedule, setShowUpdateSchedule] = useState(false);
  const [updateScheduleData, setUpdateScheduleData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const trainerMap = useMemo(() => {
    const map = {};

    (AllTrainers || []).forEach((trainer) => {
      if (!trainer?._id) return;
      map[trainer._id] =
        trainer.name || trainer.fullName || trainer.trainerName || "Unknown";
    });

    return map;
  }, [AllTrainers]);

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value._id || value.id || "";
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
    const raw = (schedule?.status || "").toString().trim().toLowerCase();

    if (raw === "completed") return "Completed";
    if (raw === "cancelled" || raw === "canceled") return "Cancelled";
    // if (raw === "active") return "Active";
    // if (raw === "upcoming") return "Upcoming";
    // if (raw === "pending") return "Pending";

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

  const filteredSchedules = useMemo(() => {
    let schedules = AllSlots || [];

    if (selectedCourse) {
      schedules = schedules.filter((schedule) => {
        const courseId = normalizeId(schedule.courseId);
        return courseId === selectedCourse;
      });
    }

    if (statusFilter !== "All") {
      schedules = schedules.filter(
        (schedule) => getScheduleStatus(schedule) === statusFilter
      );
    }

    const query = searchTerm.trim().toLowerCase();

    if (query) {
      schedules = schedules.filter((schedule) => {
        const trainerId = normalizeId(schedule.trainerId);
        const trainerName = getTrainerLabel(trainerId);

        const searchable = [
          getCourseLabel(schedule.courseId),
          trainerName,
          schedule.roomNo,
          schedule.topic,
          schedule._id,
          schedule.date,
          schedule.startTime,
          schedule.endTime,
          schedule.sessionId?.startDate,
          schedule.sessionId?.endDate,
          getScheduleStatus(schedule),
        ];

        return searchable.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );
      });
    }

    return schedules;
  }, [AllSlots, selectedCourse, searchTerm, statusFilter, AllTrainers]);

  const totalSchedules = AllSlots.length;
  // const activeSchedules = AllSlots.filter(
  //   (schedule) => getScheduleStatus(schedule) === "Active"
  // ).length;
  // const upcomingSchedules = AllSlots.filter(
  //   (schedule) => getScheduleStatus(schedule) === "Upcoming"
  // ).length;
  const completedSchedules = AllSlots.filter(
    (schedule) => getScheduleStatus(schedule) === "Completed"
  ).length;

  const csvEscape = (value) => {
    const str = value == null ? "" : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = (schedulesToExport = filteredSchedules) => {
    const headers = [
      "SCHEDULE ID",
      "COURSE",
      "TRAINER",
      "DATE",
      "TIME SLOT",
      "ROOM",
      "TOPIC",
      "SESSION",
      "STATUS",
    ];

    const rows = schedulesToExport.map((schedule) => {
      const trainerId = normalizeId(schedule.trainerId);
      const sessionRange = schedule.sessionId
        ? `${formatDate(schedule.sessionId.startDate)} - ${formatDate(
          schedule.sessionId.endDate
        )}`
        : "—";

      return [
        schedule._id,
        getCourseLabel(schedule.courseId),
        getTrainerLabel(trainerId),
        formatDate(schedule.date),
        `${schedule.startTime || "—"} - ${schedule.endTime || "—"}`,
        schedule.roomNo || "—",
        schedule.topic || "—",
        sessionRange,
        getScheduleStatus(schedule),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedules.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  if (showNewSchedule) {
    return (
      <CSVScheduleUpload
        token={token}
        onBack={() => setShowNewSchedule(false)}
        createSchedule={createSlot}
        AllCourses={AllCourses}
        AllSessions={AllSessions}
        AllTrainers={AllTrainers}
      />
    );
  }

  if (showUpdateSchedule) {
    return (
      <UpdateSchedulePage
        token={token}
        onBack={() => setShowUpdateSchedule(false)}
        schedule={updateScheduleData}
        AllCourses={AllCourses}
        AllSessions={AllSessions}
        AllTrainers={AllTrainers}
        updateSchedule={updateSlot}
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
      <div ref={contentRef} onScroll={handleScroll} className="Schedulees-page ">

        <div className="Schedulees-header">
          <div>
            <h1>Schedules</h1>
            <p>{totalSchedules} schedule slots across all colleges</p>
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



            <button
              className="btn-add-slot"
              onClick={() => setShowNewSchedule(true)}
            >
              + Add Schedule
            </button>
          </div>
        </div>

        <div className="students-stats sessions-stats">
          <div className="stat-card">
            <span>Total Slots</span>
            <h2>{totalSchedules}</h2>
          </div>

          {/* <div className="stat-card">
          <span>Active</span>
          <h2>{activeSchedules}</h2>
        </div> */}

          {/* <div className="stat-card">
          <span>Upcoming</span>
          <h2>{upcomingSchedules}</h2>
        </div> */}

          <div className="stat-card">
            <span>Completed</span>
            <h2>{completedSchedules}</h2>
          </div>
        </div>

        <div className="filter">
          <div className="filterContainer">

            <div className="filter-group">
              <label htmlFor="schedule-search">Search</label>
              <input
                id="schedule-search"
                className="search-box"
                type="text"
                placeholder="Course, trainer, room, topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="course-filter">Course</label>
              <select
                id="course-filter"
                className="filter-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {(AllCourses || []).map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Scheduled">Scheduled</option>
                {/* <option value="Active">Active</option> */}
                {/* <option value="Upcoming">Upcoming</option> */}
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                {/* <option value="Pending">Pending</option> */}
              </select>
            </div>

          </div>
          <button
            className="btn-export-csv"
            onClick={() => handleExportCSV(filteredSchedules)}
          >
            Export CSV
          </button>
        </div>

        <div className="students-results">
          Showing <strong>{filteredSchedules.length}</strong> of{" "}
          <strong>{totalSchedules}</strong> schedules
        </div>

        {loading && <p className="loading">Loading schedules...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          view === "table" ? (
            <SchedulesTable
              schedules={filteredSchedules}
              onDelete={deleteSlot}
              onRefresh={refreshSchedules}
              setUpdateScheduledata={setUpdateScheduleData}
              setshowUpdateSchedule={setShowUpdateSchedule}
              token={token}
              trainerMap={trainerMap}
            />
          ) : (
            <SchedulesCalendar
              token={token}
              schedules={filteredSchedules}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onDelete={deleteSlot}
              onRefresh={refreshSchedules}
              setUpdateScheduledata={setUpdateScheduleData}
              setshowUpdateSchedule={setShowUpdateSchedule}
              trainerMap={trainerMap}
            />
          )
        )}
      </div>
    </>
  );
}






// import { useState, useMemo } from "react";

// import SchedulesTable from "./components/SchedulesTable";
// import SchedulesCalendar from "./components/SchedulesCalendar";
// import UpdateSchedulePage from "./components/UpdateSchedulePage";
// import CSVScheduleUpload from "./components/CSVScheduleUpload";

// import { useDashboard } from "../../../hooks/useDashboard";

// import "./schedules.css";


// export default function SchedulesPage({ token }) {

//   const {
//     // AllSchedules,
//     AllSlots,
//     AllCourses,
//     loading,
//     error,

//     // createSchedule,
//     // updateSchedule,
//     // deleteSchedule,
//     createSlot,
//     updateSlot,
//     deleteSlot,

//     AllSessions,
//     AllTrainers,

//     // add this in hook if available
//     refreshSchedules,

//     fetchTrainerById,
//     setSelectedDate,
//     selectedDate



//   } = useDashboard(token);


//   const [view, setView] = useState("table");



//   const [showNewSchedule, setShowNewSchedule] =
//     useState(false);

//   const [showUpdateSchedule, setShowUpdateSchedule] =
//     useState(false);

//   const [updateScheduleData, setUpdateScheduleData] =
//     useState(null);

//   const [selectedCourse, setSelectedCourse] =
//     useState("");



//   /*
//     Filter schedules

//     New backend structure:

//     {
//       _id,
//       courseId,
//       sessionId,
//       date,
//       startTime,
//       endTime,
//       trainerId,
//       roomNo
//     }

//   */
//   const filteredSchedules = useMemo(() => {

//     let schedules = AllSlots || [];

//     if (selectedCourse) {
//       schedules =
//         schedules.filter(schedule =>
//           schedule.courseId &&
//           schedule.courseId._id === selectedCourse
//         );
//     }
//     return schedules;
//   }, [
//     AllSlots,
//     selectedCourse
//   ]);







//   // Create schedule page

//   if (showNewSchedule) {

//     return (

//       <CSVScheduleUpload

//         token={token}
//         onBack={() =>
//           setShowNewSchedule(false)
//         }
//         createSchedule={createSlot}
//         AllCourses={AllCourses}
//         AllSessions={AllSessions}
//         AllTrainers={AllTrainers}
//       />

//     );

//   }





//   // Update schedule page

//   if (showUpdateSchedule) {

//     return (

//       <UpdateSchedulePage
//         token={token}
//         onBack={() =>
//           setShowUpdateSchedule(false)
//         }


//         schedule={updateScheduleData}


//         AllCourses={AllCourses}


//         AllSessions={AllSessions}


//         AllTrainers={AllTrainers}


//         updateSchedule={updateSlot}

//         AllTrainers={AllTrainers}

//       />

//     );

//   }







//   return (

//     <div className="Schedulees-page">

//       <div className="Schedulees-header">

//         <div>

//           <h1>
//             Schedules
//           </h1>

//           <p>
//             Timetables and slot management
//           </p>

//         </div>



//         <div className="Schedulees-controls">

//           <button

//             className={
//               `btn-view-toggle ${view === "table"
//                 ? "active"
//                 : ""
//               }`
//             }


//             onClick={() =>
//               setView("table")
//             }

//           >

//             Table

//           </button>




//           <button

//             className={
//               `btn-view-toggle ${view === "calendar"
//                 ? "active"
//                 : ""
//               }`
//             }


//             onClick={() =>
//               setView("calendar")
//             }

//           >

//             Calendar

//           </button>






//           <button

//             className="btn-add-slot"


//             onClick={() =>
//               setShowNewSchedule(true)
//             }

//           >

//             + Add Schedule

//           </button>



//         </div>


//       </div>









//       <div className="filter">


//         <div className="filter-group">


//           <label htmlFor="course-filter">

//             Course

//           </label>




//           <select


//             id="course-filter"


//             className="filter-select"


//             value={selectedCourse}


//             onChange={(e) =>

//               setSelectedCourse(
//                 e.target.value
//               )

//             }


//           >


//             <option value="">

//               All Courses

//             </option>



//             {
//               (AllCourses || [])
//                 .map(course => (


//                   <option

//                     key={course._id}

//                     value={course._id}

//                   >

//                     {course.courseCode}

//                   </option>


//                 ))
//             }



//           </select>



//         </div>



//       </div>









//       {
//         loading &&

//         <p className="loading">

//           Loading schedules...

//         </p>

//       }






//       {
//         error &&

//         <p className="error">

//           {error}

//         </p>

//       }








//       {
//         !loading &&
//         !error &&


//         (

//           view === "table"

//             ?

//             <SchedulesTable


//               schedules={filteredSchedules}


//               onDelete={deleteSlot}


//               onRefresh={refreshSchedules}


//               setUpdateScheduledata={
//                 setUpdateScheduleData
//               }


//               setshowUpdateSchedule={
//                 setShowUpdateSchedule
//               }


//               fetchTrainerById ={fetchTrainerById}

//               token= {token}


//             />


//             :


//             <SchedulesCalendar
//               token={token}
//               schedules={filteredSchedules}
//               selectedDate={selectedDate}
//               onSelectDate={setSelectedDate}
//               onDelete={deleteSlot}
//               setUpdateScheduledata={setUpdateScheduleData}
//               setshowUpdateSchedule={setShowUpdateSchedule}
//               fetchTrainerById={fetchTrainerById}
//             />

//         )


//       }



//     </div>

//   );

// }
























// // import { useState, useMemo } from "react";
// // import SchedulesTable from "./components/SchedulesTable";
// // import SchedulesCalendar from "./components/SchedulesCalendar";
// // import ConflictAlert from "./components/ConflictAlert";
// // import NewSchedulePage from "./components/NewSchedulePage";
// // import UpdateSchedulePage from "./components/UpdateSchedulePage";

// // import CSVScheduleUpload from "./components/CSVScheduleUpload";
// // import CSVSchedulePreview from "./components/CSVSchedulePreview";
// // import { useDashboard } from "../../../hooks/useDashboard";
// // // import NewSchedulePage from "./pages/NewSchedulePage";

// // import "./schedules.css";

// // export default function SchedulesPage({ token }) {
// //   const {
// //     AllSchedules,
// //     AllCourses,
// //     stats,
// //     loading,
// //     error,
// //     createSchedule,
// //     updateSchedule,
// //     // appendSlotsViaCSV,
// //     AllSessions,
// //     AllTrainers,
// //     deleteSchedule,
// //   } = useDashboard(token);

// //   const [view, setView] = useState("table");
// //   const [selectedDate, setSelectedDate] = useState(new Date());
// //   const [showNewSchedule, setShowNewSchedule] = useState(false);
// //   const [showUpdateSchedule, setshowUpdateSchedule] = useState(false);
// //   const [UpdateScheduledata, setUpdateScheduledata] = useState(null);

// //   // Course filter
// //   const [selectedCourse, setSelectedCourse] = useState("");

// //   // Filter schedules
// //   const filteredSchedules = useMemo(() => {
// //     if (!selectedCourse) return AllSchedules || [];

// //     return (AllSchedules || []).filter(
// //       (schedule) =>
// //         schedule.courseId &&
// //         schedule.courseId._id === selectedCourse
// //     );
// //   }, [AllSchedules, selectedCourse]);

// //   // Show Add Schedule page
// //   // if (showNewSchedule) {
// //   //   return (
// //   //     <NewSchedulePage
// //   //       token={token}
// //   //       onBack={() => setShowNewSchedule(false)}
// //   //       createSchedule={createSchedule}
// //   //       appendSlotsViaCSV={appendSlotsViaCSV}
// //   //       AllCourses={AllCourses}
// //   //       AllSessions={AllSessions}
// //   //       AllTrainers={AllTrainers}
// //   //     />
// //   //   );
// //   // }
// //   if (showNewSchedule) {
// //     return (
// //       <CSVScheduleUpload
// //         token={token}
// //         onBack={() => setShowNewSchedule(false)}
// //         createSchedule={createSchedule}
// //         // appendSlotsViaCSV={appendSlotsViaCSV}
// //         AllCourses={AllCourses}
// //         AllSessions={AllSessions}
// //         AllTrainers={AllTrainers}
// //       />
// //     );
// //   }

// //   if (showUpdateSchedule) {
// //     return (
// //       <UpdateSchedulePage
// //         token={token}
// //         onBack={() => setshowUpdateSchedule(false)}
// //         schedule= {UpdateScheduledata}
// //         AllCourses = {AllCourses}
// //         AllSessions = {AllSessions}
// //         updateSchedule = {updateSchedule}
// //       />
// //     );
// //   }

// //   return (
// //     <div className="Schedulees-page">
// //       {/* Header */}
// //       <div className="Schedulees-header">
// //         <div>
// //           <h1>Schedules</h1>
// //           <p>Timetables and slot management</p>
// //         </div>

// //         <div className="Schedulees-controls">
// //           <button
// //             className={`btn-view-toggle ${
// //               view === "table" ? "active" : ""
// //             }`}
// //             onClick={() => setView("table")}
// //           >
// //             Table
// //           </button>

// //           <button
// //             className={`btn-view-toggle ${
// //               view === "calendar" ? "active" : ""
// //             }`}
// //             onClick={() => setView("calendar")}
// //           >
// //             Calendar
// //           </button>

// //           <button
// //             className="btn-add-slot"
// //             onClick={() => setShowNewSchedule(true)}
// //           >
// //             + Add Slot
// //           </button>
// //         </div>
// //       </div>

// //       {/* Conflict Alert */}
// //       {/* <ConflictAlert /> */}

// //       {/* Filters */}
// //       <div className="filter">
// // <div className="filter-group">
// //   <label htmlFor="course-filter">Course</label>

// //   <select
// //     id="course-filter"
// //     className="filter-select"
// //     value={selectedCourse}
// //     onChange={(e) => setSelectedCourse(e.target.value)}
// //   >
// //     <option value="">All Courses</option>

// //     {(AllCourses || []).map((course) => (
// //       <option key={course._id} value={course._id}>
// //         {course.courseCode}
// //       </option>
// //     ))}
// //   </select>
// // </div>
// //       </div>

// //       {/* Content */}
// //       {loading && <p className="loading">Loading schedules...</p>}

// //       {error && <p className="error">{error}</p>}

// //       {!loading && !error && (
// //         <>
// //           {view === "table" ? (
// //             <SchedulesTable
// //               schedules={filteredSchedules}
// //               onDelete={deleteSchedule}
// //               setUpdateScheduledata={setUpdateScheduledata}
// //               setshowUpdateSchedule={setshowUpdateSchedule}
// //               // onRefresh={fetchSchedules}
// //             />
// //           ) : (
// //             <SchedulesCalendar
// //               token={token}
// //               schedules={filteredSchedules}
// //               selectedDate={selectedDate}
// //               onSelectDate={setSelectedDate}
// //               onDelete={deleteSchedule}
// //               // onRefresh={fetchSchedules}
// //             />
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // }













// // // import { useState } from "react";
// // // import SchedulesTable from "./components/SchedulesTable";
// // // import SchedulesCalendar from "./components/SchedulesCalendar";
// // // import ConflictAlert from "./components/ConflictAlert";
// // // import { useDashboard } from "../../../hooks/useDashboard";
// // // import NewSchedulePage from "./pages/NewSchedulePage";

// // // import "./schedules.css";

// // // export default function SchedulesPage({ token }) {
// // //   const {
// // //     AllSchedules,
// // //     AllCourses,
// // //     stats,
// // //     loading,
// // //     error,
// // //   } = useDashboard(token);

// // //   const [view, setView] = useState("table");
// // //   const [selectedDate, setSelectedDate] = useState(new Date());
// // //   const [showNewSchedule, setShowNewSchedule] = useState(false);

// // //   // Show the Add New Schedule page instead of the schedules page
// // //   if (showNewSchedule) {
// // //     return (
// // //       <NewSchedulePage
// // //         token={token}
// // //         onBack={() => setShowNewSchedule(false)}
// // //       />
// // //     );
// // //   }

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
// // //             className={`btn-view-toggle ${
// // //               view === "table" ? "active" : ""
// // //             }`}
// // //             onClick={() => setView("table")}
// // //           >
// // //             Table
// // //           </button>

// // //           <button
// // //             className={`btn-view-toggle ${
// // //               view === "calendar" ? "active" : ""
// // //             }`}
// // //             onClick={() => setView("calendar")}
// // //           >
// // //             Calendar
// // //           </button>

// // //           <button
// // //             className="btn-add-slot"
// // //             onClick={() => setShowNewSchedule(true)}
// // //           >
// // //             + Add Slot
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* Conflict Alert */}
// // //       {/* <ConflictAlert
// // //         conflicts={conflicts}
// // //         onResolve={handleResolveConflict}
// // //       /> */}

// // //       {/* Filters */}
// // //       <div
// // //         style={{
// // //           display: "flex",
// // //           gap: "12px",
// // //           marginBottom: "20px",
// // //           flexWrap: "wrap",
// // //         }}
// // //       >
// // //         {/* course filter */}
// // //         <div>
// // //           <label htmlFor="course-filter">Course:</label>
// // //           <select id="course-filter" className="filter-select">
// // //             <option value="">All Courses</option>
// // //             {AllCourses?.map((course) => (
// // //               <option key={course._id} value={course._id}>
// // //                 {course.courseCode}
// // //               </option>
// // //             ))}
// // //           </select>
// // //         </div>

// // //       </div>

// // //       {/* Content */}
// // //       {loading && <p className="loading">Loading schedules...</p>}

// // //       {error && <p className="error">{error}</p>}

// // //       {!loading && !error && (
// // //         <>
// // //           {view === "table" ? (
// // //             <SchedulesTable
// // //               schedules={AllSchedules}
// // //               // onDelete={deleteSchedule}
// // //               // onRefresh={fetchSchedules}
// // //             />
// // //           ) : (
// // //             <SchedulesCalendar
// // //               schedules={AllSchedules}
// // //               selectedDate={selectedDate}
// // //               onSelectDate={setSelectedDate}
// // //               // onDelete={deleteSchedule}
// // //               // onRefresh={fetchSchedules}
// // //             />
// // //           )}
// // //         </>
// // //       )}
// // //     </div>
// // //   );
// // // }


















// // // // import { useState, useEffect } from 'react';
// // // // import SchedulesTable from './components/SchedulesTable';
// // // // import SchedulesCalendar from './components/SchedulesCalendar';
// // // // import ConflictAlert from './components/ConflictAlert';
// // // // // import useSchedules from './hooks/useSchedules';
// // // // import { useDashboard } from "../../../hooks/useDashboard";

// // // // import './schedules.css'


// // // // import { BrowserRouter, Routes, Route } from "react-router-dom";

// // // // import { useNavigate } from "react-router-dom";

// // // // const navigate = useNavigate();
// // // // import NewSchedulePage from './pages/NewSchedulePage';

















// // // // export default function SchedulesPage({ token }) {
// // // //   // const { schedules, conflicts, loading, error, fetchSchedules, deleteSchedule, resolveConflict } = useSchedules();

// // // //   const {
// // // //     selectedCollege,
// // // //     setSelectedCollege,
// // // //     colleges,
// // // //     // AllSessions,
// // // //     // setCurrentSession,
// // // //     // CurrentSession,
// // // //     UpcomingScheduleByColl,
// // // //     AllSchedules,
// // // //     stats,
// // // //     loading,
// // // //     error,
// // // //     AttendanceByCollegeAndSession,
// // // //   } = useDashboard(token);







// // // //   const [view, setView] = useState('table');
// // // //   const [selectedDate, setSelectedDate] = useState(new Date());



// // // //   return (
// // // //     <div className="Schedulees-page">



// // // //       <BrowserRouter>
// // // //         <Routes>
// // // //           <Route path="/schedules/new" element={<NewSchedulePage />} />
// // // //         </Routes>
// // // //       </BrowserRouter>





// // // //       {/* Header */}
// // // //       <div className="Schedulees-header">
// // // //         <div>
// // // //           <h1>Schedules</h1>
// // // //           <p>Timetables and slot management</p>
// // // //         </div>
// // // //         <div className="Schedulees-controls">
// // // //           <button
// // // //             className={`btn-view-toggle ${view === 'table' ? 'active' : ''}`}
// // // //             onClick={() => setView('table')}
// // // //           >
// // // //             Table
// // // //           </button>
// // // //           <button
// // // //             className={`btn-view-toggle ${view === 'calendar' ? 'active' : ''}`}
// // // //             onClick={() => setView('calendar')}
// // // //           >
// // // //             Calendar
// // // //           </button>
// // // //           <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
// // // //             + Add Slot
// // // //           </button>
// // // //           {/* <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
// // // //             + Add Slot
// // // //           </button> */}
// // // //         </div>
// // // //       </div>

// // // //       {/* Conflict Alert */}
// // // //       {/* {conflicts.length > 0 && (
// // // //         <ConflictAlert 
// // // //           conflicts={conflicts} 
// // // //           onResolve={handleResolveConflict}
// // // //         />
// // // //       )} */}

// // // //       {/* Content */}
// // // //       {loading && <p className="loading">Loading schedules...</p>}
// // // //       {error && <p className="error">{error}</p>}
// // // //       {!loading && !error && (
// // // //         <>
// // // //           {view === 'table' ? (
// // // //             <SchedulesTable
// // // //               schedules={AllSchedules}
// // // //             // onDelete={deleteSchedule}
// // // //             // onRefresh={fetchSchedules}
// // // //             />
// // // //           ) : (
// // // //             <SchedulesCalendar
// // // //               schedules={AllSchedules}
// // // //               selectedDate={selectedDate}
// // // //               onSelectDate={setSelectedDate}
// // // //             // onDelete={deleteSchedule}
// // // //             // onRefresh={fetchSchedules}
// // // //             />


// // // //           )}
// // // //           add drop down in for college and session selections
// // // //         </>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }