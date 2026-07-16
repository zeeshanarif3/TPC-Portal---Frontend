// SessionsPage.jsx
import { useMemo, useState } from "react";
import SessionsTable from "./components/SessionsTable";
import NewSessionPage from "./components/NewSessionPage";
import UpdateSessionPage from "./components/UpdateSessionPage";
import { useDashboard } from "../../../hooks/useDashboard";
import "./sessions.css";

export default function SessionsPage({ token }) {
  const [showNewSession, setShowNewSession] = useState(false);
  const [showUpdateSession, setShowUpdateSession] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const {
    loading,
    error,
    AllSessions = [],
    colleges = [],
    AllCourses = [],
    createSession,
    updateSession,
    deleteSession,
  } = useDashboard(token);

  const getSessionStatus = (session) => {
    const today = new Date();
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);

    if (today < start) return "Upcoming";
    if (today > end) return "Completed";
    return "Active";
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredSessions = useMemo(() => {
    return AllSessions.filter((session) => {
      const search = searchTerm.toLowerCase().trim();

      const courseText =
        session.courseIds?.map((course) => {
          if (typeof course === "string") return course;
          return course?.courseCode || course?.name || "";
        }).join(" ") || "";

      const matchesSearch =
        session._id?.toLowerCase().includes(search) ||
        session.collegeId?.name?.toLowerCase().includes(search) ||
        courseText.toLowerCase().includes(search);

      const status = getSessionStatus(session);
      const matchesFilter = statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [AllSessions, searchTerm, statusFilter]);

  const totalSessions = AllSessions.length;
  const activeSessions = AllSessions.filter(
    (s) => getSessionStatus(s) === "Active"
  ).length;
  const upcomingSessions = AllSessions.filter(
    (s) => getSessionStatus(s) === "Upcoming"
  ).length;
  const completedSessions = AllSessions.filter(
    (s) => getSessionStatus(s) === "Completed"
  ).length;

  const csvEscape = (value) => {
    const str = value == null ? "" : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = (sessionsToExport = filteredSessions) => {
    const headers = [
      "SESSION ID",
      "COLLEGE",
      "START DATE",
      "END DATE",
      "COURSES",
      "STATUS",
    ];

    const rows = sessionsToExport.map((s) => {
      const courseList =
        s.courseIds?.map((course) => {
          if (typeof course === "string") return course;
          return course?.courseCode || course?.name || "—";
        }) || [];

      return [
        s._id,
        s.collegeId?.name || "—",
        formatDate(s.startDate),
        formatDate(s.endDate),
        courseList.length > 0 ? courseList.join(" | ") : "0",
        getSessionStatus(s),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sessions.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  if (showNewSession) {
    return (
      <NewSessionPage
        AllColleges={colleges}
        AllCourses={AllCourses}
        token={token}
        onBack={() => setShowNewSession(false)}
        createSession={createSession}
        updateSession={updateSession}
      />
    );
  }

  if (showUpdateSession) {
    return (
      <UpdateSessionPage
        AllColleges={colleges}
        AllCourses={AllCourses}
        token={token}
        onBack={() => setShowUpdateSession(false)}
        session={selectedSession}
        updateSession={updateSession}
      />
    );
  }

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <div>
          <h1>Sessions</h1>
          <p>{totalSessions} training periods across all colleges</p>
        </div>

        <div className="header-actions">


          <button
            className="btn-new-session"
            onClick={() => setShowNewSession(true)}
          >
            + New Session
          </button>
        </div>
      </div>

      <div className="students-stats sessions-stats">
        <div className="stat-card">
          <span>Total Sessions</span>
          <h2>{totalSessions}</h2>
        </div>

        <div className="stat-card">
          <span>Active</span>
          <h2>{activeSessions}</h2>
        </div>

        <div className="stat-card">
          <span>Upcoming</span>
          <h2>{upcomingSessions}</h2>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <h2>{completedSessions}</h2>
        </div>
      </div>

      <div className="sessions-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search by session ID, college, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Upcoming">Upcoming</option>
        </select>

          <button
            className="btn-export-csv"
            onClick={() => handleExportCSV(AllSessions)}
          >
            Export All
          </button>
      </div>

      <div className="students-results">
        Showing <strong>{filteredSessions.length}</strong> of{" "}
        <strong>{totalSessions}</strong> sessions
      </div>

      {loading && <p className="loading">Loading sessions...</p>}

      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <SessionsTable
          sessions={filteredSessions}
          onDelete={deleteSession}
          onRefresh={() => {}}
          token={token}
          setSelectedSession={setSelectedSession}
          setShowUpdateSession={setShowUpdateSession}
        />
      )}
    </div>
  );
}







// import { useState } from 'react';
// import SessionsTable from './components/SessionsTable';
// import NewSessionPage from './components/NewSessionPage';
// import UpdateSessionPage from './components/UpdateSessionPage';
// // import useSessions from './hooks/useSessions';

// import { useDashboard } from '../../../hooks/useDashboard';

// import './sessions.css';

// export default function SessionsPage({ token }) {
//   const [showNewSession, setShowNewSession] = useState(false);
//   const [showUpdateSession, setShowUpdateSession] = useState(false);
//   const [selectedSession, setSelectedSession] = useState(null);

//   const {
//     loading,
//     error,

//     //sessions
//     AllSessions = [],

//     colleges = [],
//     AllCourses = [],
//     createSession,
//     updateSession,
//     deleteSession,
//   } = useDashboard(token);

//   // const { sessions, loading, error, fetchSessions, deleteSession } = useSessions();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');




//     if (showNewSession) {
//       return (
//         <NewSessionPage
//           AllColleges={colleges}
//           AllCourses={AllCourses}
//           token={token}
//           onBack={() => setShowNewSession(false)}
//           createSession={createSession}
//           updateSession={updateSession}
//         />
//       );
//     } 
//     if (showUpdateSession) {
//       return (
//         <UpdateSessionPage
//           AllColleges={colleges}
//           AllCourses={AllCourses}
//           token={token}
//           onBack={() => setShowUpdateSession(false)}
//           session={selectedSession}
//           updateSession={updateSession}
//         />
//       );
//     } 














//   const getSessionStatus = (session) => {
//     const today = new Date();
//     const start = new Date(session.startDate);
//     const end = new Date(session.endDate);

//     if (today < start) return 'Upcoming';
//     if (today > end) return 'Completed';
//     return 'Active';
//   };

//   const filteredSessions = AllSessions.filter((session) => {
//     const matchesSearch =
//       session._id
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       session.collegeId?.name
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase());

//     const status = getSessionStatus(session);

//     const matchesFilter =
//       statusFilter === 'All' ||
//       status === statusFilter;

//     return matchesSearch && matchesFilter;
//   });

//   const handleExportCSV = () => {
//     const headers = [
//       'SESSION ID',
//       'COLLEGE',
//       'START DATE',
//       'END DATE',
//       'COURSES',
//       'STATUS',
//     ];

//     const rows = filteredSessions.map((s) => [
//       s._id,
//       s.collegeId?.name || '—',
//       new Date(s.startDate).toLocaleDateString(),
//       new Date(s.endDate).toLocaleDateString(),
//       s.courseIds?.length || 0,
//       getSessionStatus(s),
//     ]);

//     const csvContent = [headers, ...rows]
//       .map((row) => row.join(','))
//       .join('\n');

//     // const blob = new Blob({ type: 'text/csv' });
//         const blob = new Blob([csvContent], {
//       type: 'text/csv',
//     });

//     // const url = window.URL.createObjectURL(
//     //   new Blob([csvContent], { type: 'text/csv' })
//     // );
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'sessions.csv';
//     a.click();

//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="sessions-page">
//       {/* Header */}
//       <div className="sessions-header">
//         <div>
//           <h1>Sessions</h1>
//           <p>Training periods across all colleges</p>
//         </div>

//         <button
//           className="btn-new-session"
//           onClick={() =>
//             setShowNewSession(true)
//           }
//         >
//           + New Session
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="sessions-filters">
//         <div className="search-box">
//           <span className="search-icon">🔍</span>

//           <input
//             type="text"
//             placeholder="Search sessions..."
//             value={searchTerm}
//             onChange={(e) =>
//               setSearchTerm(e.target.value)
//             }
//           />
//         </div>

//         <select
//           className="status-filter"
//           value={statusFilter}
//           onChange={(e) =>
//             setStatusFilter(e.target.value)
//           }
//         >
//           <option value="All">All Status</option>
//           <option value="Active">Active</option>
//           <option value="Completed">Completed</option>
//           <option value="Upcoming">Upcoming</option>
//         </select>

//         <button
//           className="btn-export-csv"
//           onClick={handleExportCSV}
//         >
//           Export CSV
//         </button>
//       </div>

//       {/* Table */}
//       {loading && (
//         <p className="loading">
//           Loading sessions...
//         </p>
//       )}

//       {error && (
//         <p className="error">
//           {error}
//         </p>
//       )}

//       {!loading && !error && (
//         <SessionsTable
//           sessions={filteredSessions}
//           onDelete={deleteSession}
//           onRefresh={() => {}}
//           token={token}
//           setSelectedSession={setSelectedSession}
//           setShowUpdateSession={setShowUpdateSession}
//         />
//       )}
//     </div>
//   );
// }


// // import { useState, useEffect } from 'react';
// // import SessionsTable from './components/SessionsTable';
// // // import useSessions from './hooks/useSessions';

// // import { useDashboard } from '../../../hooks/useDashboard';

// // import './sessions.css'


// // export default function SessionsPage({ token }) {

// //     const {
// //         loading,
// //         error,


// //         //sessions

// //         AllSessions,





// //     } = useDashboard(token);












// //   // const { sessions, loading, error, fetchSessions, deleteSession } = useSessions();
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [statusFilter, setStatusFilter] = useState('All');


  
// //   const filteredSessions = AllSessions.filter(session => {
// //     const matchesSearch = 
// //       session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       session.college.toLowerCase().includes(searchTerm.toLowerCase());
    
// //     const matchesFilter = statusFilter === 'All' || session.status === statusFilter;
// //     return matchesSearch && matchesFilter;
// //   });

// //   const handleExportCSV = () => {
// //     const headers = ['SESSION ID', 'COLLEGE', 'START DATE', 'END DATE', 'COURSES', 'STATUS'];
// //     const rows = filteredSessions.map(s => [s.id, s.college, s.startDate, s.endDate, s.courses, s.status]);
// //     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
// //     const blob = new Blob([csvContent], { type: 'text/csv' });
// //     const url = window.URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = 'sessions.csv';
// //     a.click();
// //   };

// //   return (
// //     <div className="sessions-page">
// //       {/* Header */}
// //       <div className="sessions-header">
// //         <div>
// //           <h1>Sessions</h1>
// //           <p>Training periods across all colleges</p>
// //         </div>
// //         <button className="btn-new-session" onClick={() => window.location.href = '/sessions/new'}>
// //           + New Session
// //         </button>
// //       </div>

// //       {/* Filters */}
// //       <div className="sessions-filters">
// //         <div className="search-box">
// //           <span className="search-icon">🔍</span>
// //           <input
// //             type="text"
// //             placeholder="Search sessions..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //           />
// //         </div>

// //         <select
// //           className="status-filter"
// //           value={statusFilter}
// //           onChange={(e) => setStatusFilter(e.target.value)}
// //         >
// //           <option value="All">All Status</option>
// //           <option value="Active">Active</option>
// //           <option value="Completed">Completed</option>
// //           <option value="Upcoming">Upcoming</option>
// //         </select>

// //         <button className="btn-export-csv" onClick={handleExportCSV}>
// //           Export CSV
// //         </button>
// //       </div>

// //       {/* Table */}
// //       {loading && <p className="loading">Loading sessions...</p>}
// //       {error && <p className="error">{error}</p>}
// //       {!loading && !error && (
// //         <SessionsTable
// //           sessions={filteredSessions}
// //           onDelete={deleteSession}
// //           onRefresh={fetchSessions}
// //         />
// //       )}
// //     </div>
// //   );
// // }


// // // import { useState, useEffect } from 'react';
// // // import SessionsTable from './components/SessionsTable';
// // // import useSessions from './hooks/useSessions';



// // // import './sessions.css'


// // // export default function SessionsPage() {
// // //   const { sessions, loading, error, fetchSessions, deleteSession } = useSessions();
// // //   const [searchTerm, setSearchTerm] = useState('');
// // //   const [statusFilter, setStatusFilter] = useState('All');

// // //   useEffect(() => {
// // //     fetchSessions();
// // //   }, []);

// // //   const filteredSessions = sessions.filter(session => {
// // //     const matchesSearch = 
// // //       session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // //       session.college.toLowerCase().includes(searchTerm.toLowerCase());
    
// // //     const matchesFilter = statusFilter === 'All' || session.status === statusFilter;
// // //     return matchesSearch && matchesFilter;
// // //   });

// // //   const handleExportCSV = () => {
// // //     const headers = ['SESSION ID', 'COLLEGE', 'START DATE', 'END DATE', 'COURSES', 'STATUS'];
// // //     const rows = filteredSessions.map(s => [s.id, s.college, s.startDate, s.endDate, s.courses, s.status]);
// // //     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
// // //     const blob = new Blob([csvContent], { type: 'text/csv' });
// // //     const url = window.URL.createObjectURL(blob);
// // //     const a = document.createElement('a');
// // //     a.href = url;
// // //     a.download = 'sessions.csv';
// // //     a.click();
// // //   };

// // //   return (
// // //     <div className="sessions-page">
// // //       {/* Header */}
// // //       <div className="sessions-header">
// // //         <div>
// // //           <h1>Sessions</h1>
// // //           <p>Training periods across all colleges</p>
// // //         </div>
// // //         <button className="btn-new-session" onClick={() => window.location.href = '/sessions/new'}>
// // //           + New Session
// // //         </button>
// // //       </div>

// // //       {/* Filters */}
// // //       <div className="sessions-filters">
// // //         <div className="search-box">
// // //           <span className="search-icon">🔍</span>
// // //           <input
// // //             type="text"
// // //             placeholder="Search sessions..."
// // //             value={searchTerm}
// // //             onChange={(e) => setSearchTerm(e.target.value)}
// // //           />
// // //         </div>

// // //         <select
// // //           className="status-filter"
// // //           value={statusFilter}
// // //           onChange={(e) => setStatusFilter(e.target.value)}
// // //         >
// // //           <option value="All">All Status</option>
// // //           <option value="Active">Active</option>
// // //           <option value="Completed">Completed</option>
// // //           <option value="Upcoming">Upcoming</option>
// // //         </select>

// // //         <button className="btn-export-csv" onClick={handleExportCSV}>
// // //           Export CSV
// // //         </button>
// // //       </div>

// // //       {/* Table */}
// // //       {loading && <p className="loading">Loading sessions...</p>}
// // //       {error && <p className="error">{error}</p>}
// // //       {!loading && !error && (
// // //         <SessionsTable
// // //           sessions={filteredSessions}
// // //           onDelete={deleteSession}
// // //           onRefresh={fetchSessions}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // }