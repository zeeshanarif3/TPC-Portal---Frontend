import { useState } from "react";
import AttendanceTable from "./components/AttendanceTable";
import AttendanceStats from "./components/AttendanceStats";
// import UpdateAttendancePage from "./components/UpdateAttendancePage";
import { useModer } from "../../../hooks/useModer";

import "./attendance.css";

export default function AttendancePage({ token }) {
  const {
    // selectedCollege,
    // setSelectedCollege,
    // colleges,
    AllSessions,
    setCurrentSession,
    CurrentSession,
    stats,
    loading,
    error,
    AttendanceByCollegeAndSession,
    Allstudents,
    fetchStudentsByCourse,

    // updateAttendance,
  } = useModer(token);

  // const [showUpdateAttendancePage, setshowUpdateAttendancePage] = useState(false);
  // const [UpdateAttendancedata, setUpdateAttendancedata] = useState(null);



  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");








// if (showUpdateAttendancePage) {
//     return (
//       <UpdateAttendancePage
//         token={token}
//         onBack={() => setshowUpdateAttendancePage(false)}
//         attendance = {UpdateAttendancedata}
//         AllStudents ={Allstudents}
//         updateAttendance= {updateAttendance}
//       />
//     );
//   }












  const filteredAttendance = AttendanceByCollegeAndSession.filter((record) => {
    const courseCode = record.courseId?.courseCode || "";

    const session = `${
      new Date(record.sessionId?.startDate).toLocaleDateString()
    } - ${new Date(record.sessionId?.endDate).toLocaleDateString()}`;

    const matchesSearch =
      courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      !dateFilter ||
      new Date(record.date).toISOString().split("T")[0] === dateFilter;

    return matchesSearch && matchesDate;
  });

  const handleTakeAttendance = () => {
    window.location.href = "/attendance/take";
  };

  const handleExportCSV = () => {
    const headers = [
      "DATE",
      "TIME",
      "COURSE",
      "SESSION",
      "HEAD COUNT",
      "PRESENT STUDENTS",
    ];

    const rows = filteredAttendance.map((a) => [
      new Date(a.date).toLocaleDateString(),
      `${a.startTime} - ${a.endTime}`,
      a.courseId?.courseCode,
      `${new Date(a.sessionId?.startDate).toLocaleDateString()} - ${new Date(
        a.sessionId?.endDate
      ).toLocaleDateString()}`,
      a.headCount,
      a.presentStudents.length,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance.csv";
    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="attendance-page">
              {/* {selectedCollege } ///////////////////   {CurrentSession} debug */}
      {/* Header */}
      {/* <pre>{JSON.stringify(AttendanceByCollegeAndSession, null, 2)}</pre> */}
      <div className="attendance-header">
        <div>
          <h1>Attendance</h1>
          <p>Track and manage student attendance records</p>
        </div>

        {/* <button
          className="btn-take-attendance"
          onClick={handleTakeAttendance}
        >
          + Take Attendance
        </button> */}
      </div>

      {/* Statistics */}
      <AttendanceStats stats={stats} />

      {/* Filters */}
      {/* <div className="attendance-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search by course or session..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <input
          type="date"
          className="date-filter"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <button
          className="btn-export-csv"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
      </div> */}
      {/* Filters */}
      <div className="attendance-filters">

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by course or session..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

{/* College Selector */}
{/* <select
  className="filter-select"
  value={selectedCollege}
  onChange={(e) => {
    const collegeId = e.target.value;

    setSelectedCollege(collegeId);

    // Select the first session of the chosen college
    const firstSession = AllSessions.find(
      (session) => session.collegeId._id === collegeId
    );

    setCurrentSession(firstSession ? firstSession._id : "");
  }}
>
  {colleges.map((college) => (
    <option key={college._id} value={college._id}>
      {college.name}
    </option>
  ))}
</select> */}

{/* Session Selector
<select
  className="filter-select"
  value={CurrentSession}
  onChange={(e) => {
    setCurrentSession(e.target.value);
  }}
>
  {AllSessions.filter(
    (session) =>
      !selectedCollege ||
      session.collegeId._id === selectedCollege
  ).map((session) => (
    <option key={session._id} value={session._id}>
      {new Date(session.startDate).toLocaleDateString("en-GB")} -{" "}
      {new Date(session.endDate).toLocaleDateString("en-GB")}
    </option>
  ))}
</select> */}
<select
  className="filter-select"
  value={CurrentSession}
  onChange={(e) => {
    setCurrentSession(e.target.value);
  }}
>
  {AllSessions
    .map((session) => (
      <option key={session._id} value={session._id}>
        {new Date(session.startDate).toLocaleDateString("en-GB")} -{" "}
        {new Date(session.endDate).toLocaleDateString("en-GB")}
      </option>
    ))}
</select>

        <input
          type="date"
          className="date-filter"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <button
          className="btn-export-csv"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && (
        <p className="loading">
          Loading attendance records...
        </p>
      )}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <AttendanceTable
          attendance={filteredAttendance}
          token={token}
          // setUpdateAttendancedata = {setUpdateAttendancedata}
          // setshowUpdateAttendancePage = {setshowUpdateAttendancePage}
          fetchStudentsByCourse={fetchStudentsByCourse}
        />
      )}
    </div>
  );
}

// import { useState, useEffect } from 'react';
// import AttendanceTable from './components/AttendanceTable';
// import AttendanceStats from './components/AttendanceStats';
// // import useAttendance from './hooks/useAttendance';
// import { useDashboard } from '../../../hooks/useDashboard';

// import './attendance.css'

// export default function AttendancePage({token}) {





//     const {
//         selectedCollege,
//         setSelectedCollege,
//         stats,

//         loading,
//         error,

//         // attendance

//         upcomingClasses,
//         AttendanceChart,
//         SubjectDistributionAttendance,
//         AttendanceByCollegeAndSession,



//     } = useDashboard(token);











//   const [searchTerm, setSearchTerm] = useState('');
//   const [dateFilter, setDateFilter] = useState('');

//   useEffect(() => {
//     fetchAttendance();
//   }, []);

//   const filteredAttendance = AttendanceByCollegeAndSession.filter(record => {
//     const matchesSearch = 
//       record.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       record.session.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesDate = !dateFilter || record.date === dateFilter;
//     return matchesSearch && matchesDate;
//   });

//   const handleTakeAttendance = () => {
//     window.location.href = '/attendance/take';
//   };

//   const handleExportCSV = () => {
//     const headers = ['DATE', 'TIME', 'COURSE', 'SESSION', 'HEAD COUNT', 'PERCENTAGE'];
//     const rows = filteredAttendance.map(a => [
//       a.date,
//       a.time,
//       a.course,
//       a.session,
//       a.headCount,
//       a.percentage,
//     ]);
//     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'attendance.csv';
//     a.click();
//   };

//   return (
//     <div className="attendance-page">
//       {/* Header */}
//       <div className="attendance-header">
//         <div>
//           <h1>Attendance</h1>
//           <p>Track and manage student attendance records</p>
//         </div>
//         <button className="btn-take-attendance" onClick={handleTakeAttendance}>
//           + Take Attendance
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <AttendanceStats stats={stats} />

//       {/* Filters */}
//       <div className="attendance-filters">
//         <div className="search-box">
//           <span className="search-icon">🔍</span>
//           <input
//             type="text"
//             placeholder="Search by course or session..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <input
//           type="date"
//           className="date-filter"
//           value={dateFilter}
//           onChange={(e) => setDateFilter(e.target.value)}
//         />

//         <button className="btn-export-csv" onClick={handleExportCSV}>
//           Export CSV
//         </button>
//       </div>

//       {/* Table */}
//       {loading && <p className="loading">Loading attendance records...</p>}
//       {error && <p className="error">{error}</p>}
//       {!loading && !error && (
//         <AttendanceTable
//           attendance={filteredAttendance}
//           onDelete={deleteAttendance}
//           onRefresh={fetchAttendance}
//         />
//       )}
//     </div>
//   );
// }