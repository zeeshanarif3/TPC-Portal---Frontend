import { useState, useEffect } from 'react';
import useCollege from './hooks/useCollege';
import CollegeTable from './components/CollegeTable';

import './colledge.css';

export default function CollegePage() {
  const { colleges, loading, error, fetchColleges, deleteCollege, archiveCollege } = useCollege();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedColleges, setSelectedColleges] = useState([]);

  useEffect(() => {
    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          college.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || college.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectCollege = (collegeId) => {
    setSelectedColleges(prev =>
      prev.includes(collegeId) ? prev.filter(id => id !== collegeId) : [...prev, collegeId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedColleges(checked ? filteredColleges.map(c => c.id) : []);
  };

  const handleBulkArchive = async () => {
    if (selectedColleges.length === 0) return;
    for (const collegeId of selectedColleges) {
      await archiveCollege(collegeId);
    }
    setSelectedColleges([]);
    fetchColleges();
  };

  const handleExportCSV = () => {
    const headers = ['COLLEGE NAME', 'COLLEGE ID', 'COURSES', 'TRAINERS', 'ACTIVE SESSION', 'STATUS'];
    const rows = filteredColleges.map(c => [c.name, c.id, c.courses, c.trainers, c.activeSession, c.status]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colleges.csv';
    a.click();
  };

  return (
    <div className="college-page">
      {/* Header */}
      <div className="college-header">
        <div>
          <h1>Colleges</h1>
          <p>{colleges.length} colleges registered</p>
        </div>
        <button className="btn-add-college" onClick={() => window.location.href = '/college/add'}>
          + Add College
        </button>
      </div>

      {/* Filters */}
      <div className="college-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search colleges..."
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
          <option value="Inactive">Inactive</option>
        </select>

        <button
          className="btn-bulk-archive"
          onClick={handleBulkArchive}
          disabled={selectedColleges.length === 0}
        >
          📦 Bulk Archive
        </button>

        <button className="btn-export-csv" onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && <p className="loading">Loading colleges...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <CollegeTable
          colleges={filteredColleges}
          selectedColleges={selectedColleges}
          onSelectCollege={handleSelectCollege}
          onSelectAll={handleSelectAll}
          onDelete={deleteCollege}
          onArchive={archiveCollege}
          onRefresh={fetchColleges}
        />
      )}
    </div>
  );
}