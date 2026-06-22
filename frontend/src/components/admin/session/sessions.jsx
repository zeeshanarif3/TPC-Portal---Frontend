import { useState, useEffect } from 'react';
import SessionsTable from './components/SessionsTable';
import useSessions from './hooks/useSessions';



import './sessions.css'


export default function SessionsPage() {
  const { sessions, loading, error, fetchSessions, deleteSession } = useSessions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.college.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'All' || session.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    const headers = ['SESSION ID', 'COLLEGE', 'START DATE', 'END DATE', 'COURSES', 'STATUS'];
    const rows = filteredSessions.map(s => [s.id, s.college, s.startDate, s.endDate, s.courses, s.status]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sessions.csv';
    a.click();
  };

  return (
    <div className="sessions-page">
      {/* Header */}
      <div className="sessions-header">
        <div>
          <h1>Sessions</h1>
          <p>Training periods across all colleges</p>
        </div>
        <button className="btn-new-session" onClick={() => window.location.href = '/sessions/new'}>
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

        <button className="btn-export-csv" onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && <p className="loading">Loading sessions...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <SessionsTable
          sessions={filteredSessions}
          onDelete={deleteSession}
          onRefresh={fetchSessions}
        />
      )}
    </div>
  );
}