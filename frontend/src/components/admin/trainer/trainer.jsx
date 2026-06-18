import { useState, useEffect } from 'react';
import TrainersTable from './components/TrainersTable';
import useTrainers from './hooks/usetrainer';



import './trainer.css';



export default function TrainersPage() {
  const { trainers, loading, error, fetchTrainers, deleteTrainer } = useTrainers();
  const [searchTerm, setSearchTerm] = useState('');
  const [contractFilter, setContractFilter] = useState('All');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = 
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = contractFilter === 'All' || trainer.contractStatus === contractFilter;
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    const headers = ['TRAINER NAME', 'TRAINER ID', 'SUBJECT', 'COLLEGES', 'CONTRACT', 'CURRENT SESSION'];
    const rows = filteredTrainers.map(t => [
      t.name,
      t.id,
      t.subject,
      t.colleges,
      t.contractStatus,
      t.currentSession || '—'
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trainers.csv';
    a.click();
  };

  return (
    <div className="trainers-page">
      {/* Header */}
      <div className="trainers-header">
        <div>
          <h1>Trainers</h1>
          <p>{trainers.length} trainers on record</p>
        </div>
        <button className="btn-add-trainer" onClick={() => window.location.href = '/trainers/add'}>
          + Add Trainer
        </button>
      </div>

      {/* Filters */}
      <div className="trainers-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search trainers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="contract-filter"
          value={contractFilter}
          onChange={(e) => setContractFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Expiring Soon">Expiring Soon</option>
          <option value="Expired">Expired</option>
        </select>

        <button className="btn-export-csv" onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && <p className="loading">Loading trainers...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <TrainersTable
          trainers={filteredTrainers}
          onDelete={deleteTrainer}
          onRefresh={fetchTrainers}
        />
      )}
    </div>
  );
}