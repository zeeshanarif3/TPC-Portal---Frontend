import { useState, useEffect } from 'react';
import ContractsTable from './components/contractTable';
import ContractsStats from './components/contractStats';
import useContracts from './hooks/usecontract';

import './contract.css';

export default function ContractsPage() {
  const { contracts, loading, error, fetchContracts, endContract, deleteContract } = useContracts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.college.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'All' || contract.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    active: contracts.filter(c => c.status === 'Active').length,
    expiringSoon: contracts.filter(c => c.status === 'Expiring Soon').length,
    expired: contracts.filter(c => c.status === 'Expired').length,
  };

  const handleExportCSV = () => {
    const headers = ['CONTRACT ID', 'TRAINER', 'COLLEGE', 'SESSION', 'STATUS', 'START', 'END'];
    const rows = filteredContracts.map(c => [c.id, c.trainer, c.college, c.session, c.status, c.startDate, c.endDate]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contracts.csv';
    a.click();
  };

  return (
    <div className="contracts-page">
      {/* Header */}
      <div className="contracts-header">
        <div>
          <h1>Contracts</h1>
          <p>Manage trainer-college agreements</p>
        </div>
        <button className="btn-new-contract" onClick={() => window.location.href = '/contracts/new'}>
          + New Contract
        </button>
      </div>

      {/* Stats Cards */}
      <ContractsStats stats={stats} />

      {/* Filters */}
      <div className="contracts-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search contracts..."
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
          <option value="Expiring Soon">Expiring Soon</option>
          <option value="Expired">Expired</option>
        </select>

        <button className="btn-export-csv" onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && <p className="loading">Loading contracts...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <ContractsTable
          contracts={filteredContracts}
          onEnd={endContract}
          onDelete={deleteContract}
          onRefresh={fetchContracts}
        />
      )}
    </div>
  );
}