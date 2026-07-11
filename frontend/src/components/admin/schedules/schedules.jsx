import { useState, useMemo } from "react";
import SchedulesTable from "./components/SchedulesTable";
import SchedulesCalendar from "./components/SchedulesCalendar";
import ConflictAlert from "./components/ConflictAlert";
import NewSchedulePage from "./components/NewSchedulePage";
import UpdateSchedulePage from "./components/UpdateSchedulePage";

import CSVScheduleUpload from "./components/CSVScheduleUpload";
import CSVSchedulePreview from "./components/CSVSchedulePreview";
import { useDashboard } from "../../../hooks/useDashboard";
// import NewSchedulePage from "./pages/NewSchedulePage";

import "./schedules.css";

export default function SchedulesPage({ token }) {
  const {
    AllSchedules,
    AllCourses,
    stats,
    loading,
    error,
    createSchedule,
    updateSchedule,
    appendSlotsViaCSV,
    AllSessions,
    AllTrainers,
    deleteSchedule,
  } = useDashboard(token);

  const [view, setView] = useState("table");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [showUpdateSchedule, setshowUpdateSchedule] = useState(false);
  const [UpdateScheduledata, setUpdateScheduledata] = useState(null);

  // Course filter
  const [selectedCourse, setSelectedCourse] = useState("");

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    if (!selectedCourse) return AllSchedules || [];

    return (AllSchedules || []).filter(
      (schedule) =>
        schedule.courseId &&
        schedule.courseId._id === selectedCourse
    );
  }, [AllSchedules, selectedCourse]);

  // Show Add Schedule page
  // if (showNewSchedule) {
  //   return (
  //     <NewSchedulePage
  //       token={token}
  //       onBack={() => setShowNewSchedule(false)}
  //       createSchedule={createSchedule}
  //       appendSlotsViaCSV={appendSlotsViaCSV}
  //       AllCourses={AllCourses}
  //       AllSessions={AllSessions}
  //       AllTrainers={AllTrainers}
  //     />
  //   );
  // }
  if (showNewSchedule) {
    return (
      <CSVScheduleUpload
        token={token}
        onBack={() => setShowNewSchedule(false)}
        createSchedule={createSchedule}
        appendSlotsViaCSV={appendSlotsViaCSV}
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
        onBack={() => setshowUpdateSchedule(false)}
        schedule= {UpdateScheduledata}
        AllCourses = {AllCourses}
        AllSessions = {AllSessions}
        updateSchedule = {updateSchedule}
      />
    );
  }

  return (
    <div className="Schedulees-page">
      {/* Header */}
      <div className="Schedulees-header">
        <div>
          <h1>Schedules</h1>
          <p>Timetables and slot management</p>
        </div>

        <div className="Schedulees-controls">
          <button
            className={`btn-view-toggle ${
              view === "table" ? "active" : ""
            }`}
            onClick={() => setView("table")}
          >
            Table
          </button>

          <button
            className={`btn-view-toggle ${
              view === "calendar" ? "active" : ""
            }`}
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>

          <button
            className="btn-add-slot"
            onClick={() => setShowNewSchedule(true)}
          >
            + Add Slot
          </button>
        </div>
      </div>

      {/* Conflict Alert */}
      {/* <ConflictAlert /> */}

      {/* Filters */}
      <div className="filter">
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
      </div>

      {/* Content */}
      {loading && <p className="loading">Loading schedules...</p>}

      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {view === "table" ? (
            <SchedulesTable
              schedules={filteredSchedules}
              onDelete={deleteSchedule}
              setUpdateScheduledata={setUpdateScheduledata}
              setshowUpdateSchedule={setshowUpdateSchedule}
              // onRefresh={fetchSchedules}
            />
          ) : (
            <SchedulesCalendar
              token={token}
              schedules={filteredSchedules}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onDelete={deleteSchedule}
              // onRefresh={fetchSchedules}
            />
          )}
        </>
      )}
    </div>
  );
}













// import { useState } from "react";
// import SchedulesTable from "./components/SchedulesTable";
// import SchedulesCalendar from "./components/SchedulesCalendar";
// import ConflictAlert from "./components/ConflictAlert";
// import { useDashboard } from "../../../hooks/useDashboard";
// import NewSchedulePage from "./pages/NewSchedulePage";

// import "./schedules.css";

// export default function SchedulesPage({ token }) {
//   const {
//     AllSchedules,
//     AllCourses,
//     stats,
//     loading,
//     error,
//   } = useDashboard(token);

//   const [view, setView] = useState("table");
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showNewSchedule, setShowNewSchedule] = useState(false);

//   // Show the Add New Schedule page instead of the schedules page
//   if (showNewSchedule) {
//     return (
//       <NewSchedulePage
//         token={token}
//         onBack={() => setShowNewSchedule(false)}
//       />
//     );
//   }

//   return (
//     <div className="Schedulees-page">
//       {/* Header */}
//       <div className="Schedulees-header">
//         <div>
//           <h1>Schedules</h1>
//           <p>Timetables and slot management</p>
//         </div>

//         <div className="Schedulees-controls">
//           <button
//             className={`btn-view-toggle ${
//               view === "table" ? "active" : ""
//             }`}
//             onClick={() => setView("table")}
//           >
//             Table
//           </button>

//           <button
//             className={`btn-view-toggle ${
//               view === "calendar" ? "active" : ""
//             }`}
//             onClick={() => setView("calendar")}
//           >
//             Calendar
//           </button>

//           <button
//             className="btn-add-slot"
//             onClick={() => setShowNewSchedule(true)}
//           >
//             + Add Slot
//           </button>
//         </div>
//       </div>

//       {/* Conflict Alert */}
//       {/* <ConflictAlert
//         conflicts={conflicts}
//         onResolve={handleResolveConflict}
//       /> */}

//       {/* Filters */}
//       <div
//         style={{
//           display: "flex",
//           gap: "12px",
//           marginBottom: "20px",
//           flexWrap: "wrap",
//         }}
//       >
//         {/* course filter */}
//         <div>
//           <label htmlFor="course-filter">Course:</label>
//           <select id="course-filter" className="filter-select">
//             <option value="">All Courses</option>
//             {AllCourses?.map((course) => (
//               <option key={course._id} value={course._id}>
//                 {course.courseCode}
//               </option>
//             ))}
//           </select>
//         </div>

//       </div>

//       {/* Content */}
//       {loading && <p className="loading">Loading schedules...</p>}

//       {error && <p className="error">{error}</p>}

//       {!loading && !error && (
//         <>
//           {view === "table" ? (
//             <SchedulesTable
//               schedules={AllSchedules}
//               // onDelete={deleteSchedule}
//               // onRefresh={fetchSchedules}
//             />
//           ) : (
//             <SchedulesCalendar
//               schedules={AllSchedules}
//               selectedDate={selectedDate}
//               onSelectDate={setSelectedDate}
//               // onDelete={deleteSchedule}
//               // onRefresh={fetchSchedules}
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// }


















// // import { useState, useEffect } from 'react';
// // import SchedulesTable from './components/SchedulesTable';
// // import SchedulesCalendar from './components/SchedulesCalendar';
// // import ConflictAlert from './components/ConflictAlert';
// // // import useSchedules from './hooks/useSchedules';
// // import { useDashboard } from "../../../hooks/useDashboard";

// // import './schedules.css'


// // import { BrowserRouter, Routes, Route } from "react-router-dom";

// // import { useNavigate } from "react-router-dom";

// // const navigate = useNavigate();
// // import NewSchedulePage from './pages/NewSchedulePage';

















// // export default function SchedulesPage({ token }) {
// //   // const { schedules, conflicts, loading, error, fetchSchedules, deleteSchedule, resolveConflict } = useSchedules();

// //   const {
// //     selectedCollege,
// //     setSelectedCollege,
// //     colleges,
// //     // AllSessions,
// //     // setCurrentSession,
// //     // CurrentSession,
// //     UpcomingScheduleByColl,
// //     AllSchedules,
// //     stats,
// //     loading,
// //     error,
// //     AttendanceByCollegeAndSession,
// //   } = useDashboard(token);







// //   const [view, setView] = useState('table');
// //   const [selectedDate, setSelectedDate] = useState(new Date());



// //   return (
// //     <div className="Schedulees-page">



// //       <BrowserRouter>
// //         <Routes>
// //           <Route path="/schedules/new" element={<NewSchedulePage />} />
// //         </Routes>
// //       </BrowserRouter>





// //       {/* Header */}
// //       <div className="Schedulees-header">
// //         <div>
// //           <h1>Schedules</h1>
// //           <p>Timetables and slot management</p>
// //         </div>
// //         <div className="Schedulees-controls">
// //           <button
// //             className={`btn-view-toggle ${view === 'table' ? 'active' : ''}`}
// //             onClick={() => setView('table')}
// //           >
// //             Table
// //           </button>
// //           <button
// //             className={`btn-view-toggle ${view === 'calendar' ? 'active' : ''}`}
// //             onClick={() => setView('calendar')}
// //           >
// //             Calendar
// //           </button>
// //           <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
// //             + Add Slot
// //           </button>
// //           {/* <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
// //             + Add Slot
// //           </button> */}
// //         </div>
// //       </div>

// //       {/* Conflict Alert */}
// //       {/* {conflicts.length > 0 && (
// //         <ConflictAlert 
// //           conflicts={conflicts} 
// //           onResolve={handleResolveConflict}
// //         />
// //       )} */}

// //       {/* Content */}
// //       {loading && <p className="loading">Loading schedules...</p>}
// //       {error && <p className="error">{error}</p>}
// //       {!loading && !error && (
// //         <>
// //           {view === 'table' ? (
// //             <SchedulesTable
// //               schedules={AllSchedules}
// //             // onDelete={deleteSchedule}
// //             // onRefresh={fetchSchedules}
// //             />
// //           ) : (
// //             <SchedulesCalendar
// //               schedules={AllSchedules}
// //               selectedDate={selectedDate}
// //               onSelectDate={setSelectedDate}
// //             // onDelete={deleteSchedule}
// //             // onRefresh={fetchSchedules}
// //             />


// //           )}
// //           add drop down in for college and session selections
// //         </>
// //       )}
// //     </div>
// //   );
// // }