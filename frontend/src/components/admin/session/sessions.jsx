import { useState } from 'react';
import SessionsTable from './components/SessionsTable';
// import useSessions from './hooks/useSessions';

import { useDashboard } from '../../../hooks/useDashboard';

import './sessions.css';

export default function SessionsPage({ token }) {

  const {
    loading,
    error,

    //sessions
    AllSessions = [],

  } = useDashboard(token);

  // const { sessions, loading, error, fetchSessions, deleteSession } = useSessions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const getSessionStatus = (session) => {
    const today = new Date();
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);

    if (today < start) return 'Upcoming';
    if (today > end) return 'Completed';
    return 'Active';
  };

  const filteredSessions = AllSessions.filter((session) => {
    const matchesSearch =
      session._id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.collegeId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const status = getSessionStatus(session);

    const matchesFilter =
      statusFilter === 'All' ||
      status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    const headers = [
      'SESSION ID',
      'COLLEGE',
      'START DATE',
      'END DATE',
      'COURSES',
      'STATUS',
    ];

    const rows = filteredSessions.map((s) => [
      s._id,
      s.collegeId?.name || '—',
      new Date(s.startDate).toLocaleDateString(),
      new Date(s.endDate).toLocaleDateString(),
      s.courseIds?.length || 0,
      getSessionStatus(s),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    // const blob = new Blob({ type: 'text/csv' });
        const blob = new Blob([csvContent], {
      type: 'text/csv',
    });

    // const url = window.URL.createObjectURL(
    //   new Blob([csvContent], { type: 'text/csv' })
    // );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sessions.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="sessions-page">
      {/* Header */}
      <div className="sessions-header">
        <div>
          <h1>Sessions</h1>
          <p>Training periods across all colleges</p>
        </div>

        <button
          className="btn-new-session"
          onClick={() =>
            (window.location.href = '/sessions/new')
          }
        >
          + New Session
        </button>
      </div>

      {/* Filters */}
      <div className="sessions-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Upcoming">Upcoming</option>
        </select>

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
          Loading sessions...
        </p>
      )}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <SessionsTable
          sessions={filteredSessions}
        />
      )}
    </div>
  );
}


// import { useState, useEffect } from 'react';
// import SessionsTable from './components/SessionsTable';
// // import useSessions from './hooks/useSessions';

// import { useDashboard } from '../../../hooks/useDashboard';

// import './sessions.css'


// export default function SessionsPage({ token }) {

//     const {
//         loading,
//         error,


//         //sessions

//         AllSessions,





//     } = useDashboard(token);












//   // const { sessions, loading, error, fetchSessions, deleteSession } = useSessions();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');


  
//   const filteredSessions = AllSessions.filter(session => {
//     const matchesSearch = 
//       session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       session.college.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesFilter = statusFilter === 'All' || session.status === statusFilter;
//     return matchesSearch && matchesFilter;
//   });

//   const handleExportCSV = () => {
//     const headers = ['SESSION ID', 'COLLEGE', 'START DATE', 'END DATE', 'COURSES', 'STATUS'];
//     const rows = filteredSessions.map(s => [s.id, s.college, s.startDate, s.endDate, s.courses, s.status]);
//     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'sessions.csv';
//     a.click();
//   };

//   return (
//     <div className="sessions-page">
//       {/* Header */}
//       <div className="sessions-header">
//         <div>
//           <h1>Sessions</h1>
//           <p>Training periods across all colleges</p>
//         </div>
//         <button className="btn-new-session" onClick={() => window.location.href = '/sessions/new'}>
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
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <select
//           className="status-filter"
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="All">All Status</option>
//           <option value="Active">Active</option>
//           <option value="Completed">Completed</option>
//           <option value="Upcoming">Upcoming</option>
//         </select>

//         <button className="btn-export-csv" onClick={handleExportCSV}>
//           Export CSV
//         </button>
//       </div>

//       {/* Table */}
//       {loading && <p className="loading">Loading sessions...</p>}
//       {error && <p className="error">{error}</p>}
//       {!loading && !error && (
//         <SessionsTable
//           sessions={filteredSessions}
//           onDelete={deleteSession}
//           onRefresh={fetchSessions}
//         />
//       )}
//     </div>
//   );
// }


// // import { useState, useEffect } from 'react';
// // import SessionsTable from './components/SessionsTable';
// // import useSessions from './hooks/useSessions';



// // import './sessions.css'


// // export default function SessionsPage() {
// //   const { sessions, loading, error, fetchSessions, deleteSession } = useSessions();
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [statusFilter, setStatusFilter] = useState('All');

// //   useEffect(() => {
// //     fetchSessions();
// //   }, []);

// //   const filteredSessions = sessions.filter(session => {
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