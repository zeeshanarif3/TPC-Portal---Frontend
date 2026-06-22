import { useState, useEffect } from 'react';
import AttendanceTable from './components/AttendanceTable';
import AttendanceStats from './components/AttendanceStats';
import useAttendance from './hooks/useAttendance';


import './attendance.css'

export default function AttendancePage() {
  const { attendance, stats, loading, error, fetchAttendance, deleteAttendance } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = 
      record.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.session.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || record.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const handleTakeAttendance = () => {
    window.location.href = '/attendance/take';
  };

  const handleExportCSV = () => {
    const headers = ['DATE', 'TIME', 'COURSE', 'SESSION', 'HEAD COUNT', 'PERCENTAGE'];
    const rows = filteredAttendance.map(a => [
      a.date,
      a.time,
      a.course,
      a.session,
      a.headCount,
      a.percentage,
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
  };

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="attendance-header">
        <div>
          <h1>Attendance</h1>
          <p>Track and manage student attendance records</p>
        </div>
        <button className="btn-take-attendance" onClick={handleTakeAttendance}>
          + Take Attendance
        </button>
      </div>

      {/* Stats Cards */}
      <AttendanceStats stats={stats} />

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

        <input
          type="date"
          className="date-filter"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <button className="btn-export-csv" onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && <p className="loading">Loading attendance records...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <AttendanceTable
          attendance={filteredAttendance}
          onDelete={deleteAttendance}
          onRefresh={fetchAttendance}
        />
      )}
    </div>
  );
}