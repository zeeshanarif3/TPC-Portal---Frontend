import { useState, useMemo } from "react";
import SchedulesTable from "./components/SchedulesTable";
import SchedulesCalendar from "./components/SchedulesCalendar";
import ConflictAlert from "./components/ConflictAlert";
import AttendanceForm from "../attendance/attendance"


import { useDashboard } from "../../../hooks/useDashboard";
import { useTrainer } from "../../../hooks/useTrainer";
// import NewSchedulePage from "./pages/NewSchedulePage";
import TopicFeedbackModal from "./components/TopicFeedbackModal";

import "./schedules.css";

export default function SchedulesPage({ token }) {
  // const {
  //   // AllSchedules,
  //   submitAttendance,
  //   Allstudents,


  // } = useDashboard(token);

  const {
    // AllSchedules,
    AllSlots,
    updateTopicAndFeedback,
    Allstudents,
    submitAttendance,
  } = useTrainer(token);


  const [view, setView] = useState("table");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showTopicFeedbackModal, setShowTopicFeedbackModal] = useState(false);
  const [showAttendanceModal, setshowAttendanceModal] = useState(false);
  const [TopicFeedbackData, setTopicFeedbackData] = useState(null);

  if (showTopicFeedbackModal) {

    return (

      <TopicFeedbackModal

        token={token}
        onBack={() =>
          setShowTopicFeedbackModal(false)
        }
        slot={TopicFeedbackData}
        onSuccess={() => {
          // TODO: refresh AllSlots here once useTrainer exposes a refresh fn
        }}
        updateTopicAndFeedback={updateTopicAndFeedback}
      />

    );

  }

  if (showAttendanceModal) {
    
    return(
      <>
    <AttendanceForm 
        token={token}
        onBack={() =>
          setshowAttendanceModal(false)
        }
        slot={TopicFeedbackData}
        onSuccess={() =>
          setshowAttendanceModal(false)
        }
        submitAttendance={submitAttendance}
        students={Allstudents}
        
        
        />
    </>
  )
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
            className={`btn-view-toggle ${view === "table" ? "active" : ""
              }`}
            onClick={() => setView("table")}
          >
            Table
          </button>

          <button
            className={`btn-view-toggle ${view === "calendar" ? "active" : ""
              }`}
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>


        </div>
      </div>

      {/* Conflict Alert */}
      {/* <ConflictAlert /> */}




      <>
        {view === "table" ? (
          <SchedulesTable
            schedules={AllSlots}
            setTopicFeedbackData={setTopicFeedbackData}
            setShowTopicFeedbackModal={setShowTopicFeedbackModal}
            setshowAttendanceModal={setshowAttendanceModal}
            token={token}
          />
        ) : (
          <SchedulesCalendar
            token={token}
            schedules={AllSlots}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            setTopicFeedbackData={setTopicFeedbackData}
            setShowTopicFeedbackModal={setShowTopicFeedbackModal}

          />
        )}
      </>

    </div>
  );
}







// import { useState, useMemo } from "react";
// import SchedulesTable from "./components/SchedulesTable";
// import SchedulesCalendar from "./components/SchedulesCalendar";
// import ConflictAlert from "./components/ConflictAlert";


// // import { useDashboard } from "../../../hooks/useDashboard";
// import { useTrainer } from "../../../hooks/useTrainer";
// // import NewSchedulePage from "./pages/NewSchedulePage";
// import TopicFeedbackModal from "./components/TopicFeedbackModal";

// import "./schedules.css";

// export default function SchedulesPage({ token }) {
//   // const {
//   //   AllSchedules,

//   // } = useDashboard(token);

//     const {
//       // AllSchedules,
//       AllSlots,
//       updateTopicAndFeedback,
//     } = useTrainer(token);
  

//   const [view, setView] = useState("table");
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   const [TopicFeedbackModalpage, setTopicFeedbackModalpage] = useState(false);
//   const [TopicFeedbackData, setTopicFeedbackData] = useState(null);

//   if (TopicFeedbackModalpage) {
  
//       return (
  
//         <TopicFeedbackModal
  
//           token={token}
//           onBack={() =>
//             setTopicFeedbackModal(false)
//           }
//           slot={AllSlots}
//         />
  
//       );
  
//     }
  



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
//             className={`btn-view-toggle ${view === "table" ? "active" : ""
//               }`}
//             onClick={() => setView("table")}
//           >
//             Table
//           </button>

//           <button
//             className={`btn-view-toggle ${view === "calendar" ? "active" : ""
//               }`}
//             onClick={() => setView("calendar")}
//           >
//             Calendar
//           </button>


//         </div>
//       </div>

//       {/* Conflict Alert */}
//       {/* <ConflictAlert /> */}




//         <>
//           {view === "table" ? (
//             <SchedulesTable
//               schedules={AllSlots}
//               setTopicFeedbackData={setTopicFeedbackData}
//               setTopicFeedbackModal={setTopicFeedbackModal}
//               updateTopicAndFeedback={updateTopicAndFeedback}
              
//               />
//             ) : (
//               <SchedulesCalendar
//               token={token}
//               schedules={AllSlots}
//               selectedDate={selectedDate}
//               onSelectDate={setSelectedDate}
//               setTopicFeedbackData={setTopicFeedbackData}
//               setTopicFeedbackModal={setTopicFeedbackModal}

//             />
//           )}
//         </>

//     </div>
//   );
// }













// // import { useState } from "react";
// // import SchedulesTable from "./components/SchedulesTable";
// // import SchedulesCalendar from "./components/SchedulesCalendar";
// // import ConflictAlert from "./components/ConflictAlert";
// // import { useDashboard } from "../../../hooks/useDashboard";
// // import NewSchedulePage from "./pages/NewSchedulePage";

// // import "./schedules.css";

// // export default function SchedulesPage({ token }) {
// //   const {
// //     AllSchedules,
// //     AllCourses,
// //     stats,
// //     loading,
// //     error,
// //   } = useDashboard(token);

// //   const [view, setView] = useState("table");
// //   const [selectedDate, setSelectedDate] = useState(new Date());
// //   const [showNewSchedule, setShowNewSchedule] = useState(false);

// //   // Show the Add New Schedule page instead of the schedules page
// //   if (showNewSchedule) {
// //     return (
// //       <NewSchedulePage
// //         token={token}
// //         onBack={() => setShowNewSchedule(false)}
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
// //       {/* <ConflictAlert
// //         conflicts={conflicts}
// //         onResolve={handleResolveConflict}
// //       /> */}

// //       {/* Filters */}
// //       <div
// //         style={{
// //           display: "flex",
// //           gap: "12px",
// //           marginBottom: "20px",
// //           flexWrap: "wrap",
// //         }}
// //       >
// //         {/* course filter */}
// //         <div>
// //           <label htmlFor="course-filter">Course:</label>
// //           <select id="course-filter" className="filter-select">
// //             <option value="">All Courses</option>
// //             {AllCourses?.map((course) => (
// //               <option key={course._id} value={course._id}>
// //                 {course.courseCode}
// //               </option>
// //             ))}
// //           </select>
// //         </div>

// //       </div>

// //       {/* Content */}
// //       {loading && <p className="loading">Loading schedules...</p>}

// //       {error && <p className="error">{error}</p>}

// //       {!loading && !error && (
// //         <>
// //           {view === "table" ? (
// //             <SchedulesTable
// //               schedules={AllSchedules}
// //               // onDelete={deleteSchedule}
// //               // onRefresh={fetchSchedules}
// //             />
// //           ) : (
// //             <SchedulesCalendar
// //               schedules={AllSchedules}
// //               selectedDate={selectedDate}
// //               onSelectDate={setSelectedDate}
// //               // onDelete={deleteSchedule}
// //               // onRefresh={fetchSchedules}
// //             />
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // }


















// // // import { useState, useEffect } from 'react';
// // // import SchedulesTable from './components/SchedulesTable';
// // // import SchedulesCalendar from './components/SchedulesCalendar';
// // // import ConflictAlert from './components/ConflictAlert';
// // // // import useSchedules from './hooks/useSchedules';
// // // import { useDashboard } from "../../../hooks/useDashboard";

// // // import './schedules.css'


// // // import { BrowserRouter, Routes, Route } from "react-router-dom";

// // // import { useNavigate } from "react-router-dom";

// // // const navigate = useNavigate();
// // // import NewSchedulePage from './pages/NewSchedulePage';

















// // // export default function SchedulesPage({ token }) {
// // //   // const { schedules, conflicts, loading, error, fetchSchedules, deleteSchedule, resolveConflict } = useSchedules();

// // //   const {
// // //     selectedCollege,
// // //     setSelectedCollege,
// // //     colleges,
// // //     // AllSessions,
// // //     // setCurrentSession,
// // //     // CurrentSession,
// // //     UpcomingScheduleByColl,
// // //     AllSchedules,
// // //     stats,
// // //     loading,
// // //     error,
// // //     AttendanceByCollegeAndSession,
// // //   } = useDashboard(token);







// // //   const [view, setView] = useState('table');
// // //   const [selectedDate, setSelectedDate] = useState(new Date());



// // //   return (
// // //     <div className="Schedulees-page">



// // //       <BrowserRouter>
// // //         <Routes>
// // //           <Route path="/schedules/new" element={<NewSchedulePage />} />
// // //         </Routes>
// // //       </BrowserRouter>





// // //       {/* Header */}
// // //       <div className="Schedulees-header">
// // //         <div>
// // //           <h1>Schedules</h1>
// // //           <p>Timetables and slot management</p>
// // //         </div>
// // //         <div className="Schedulees-controls">
// // //           <button
// // //             className={`btn-view-toggle ${view === 'table' ? 'active' : ''}`}
// // //             onClick={() => setView('table')}
// // //           >
// // //             Table
// // //           </button>
// // //           <button
// // //             className={`btn-view-toggle ${view === 'calendar' ? 'active' : ''}`}
// // //             onClick={() => setView('calendar')}
// // //           >
// // //             Calendar
// // //           </button>
// // //           <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
// // //             + Add Slot
// // //           </button>
// // //           {/* <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
// // //             + Add Slot
// // //           </button> */}
// // //         </div>
// // //       </div>

// // //       {/* Conflict Alert */}
// // //       {/* {conflicts.length > 0 && (
// // //         <ConflictAlert 
// // //           conflicts={conflicts} 
// // //           onResolve={handleResolveConflict}
// // //         />
// // //       )} */}

// // //       {/* Content */}
// // //       {loading && <p className="loading">Loading schedules...</p>}
// // //       {error && <p className="error">{error}</p>}
// // //       {!loading && !error && (
// // //         <>
// // //           {view === 'table' ? (
// // //             <SchedulesTable
// // //               schedules={AllSchedules}
// // //             // onDelete={deleteSchedule}
// // //             // onRefresh={fetchSchedules}
// // //             />
// // //           ) : (
// // //             <SchedulesCalendar
// // //               schedules={AllSchedules}
// // //               selectedDate={selectedDate}
// // //               onSelectDate={setSelectedDate}
// // //             // onDelete={deleteSchedule}
// // //             // onRefresh={fetchSchedules}
// // //             />


// // //           )}
// // //           add drop down in for college and session selections
// // //         </>
// // //       )}
// // //     </div>
// // //   );
// // // }