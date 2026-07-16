import { useState, useEffect } from 'react';
import ContractsTable from './components/contractTable';
import ContractsStats from './components/contractStats';
import { useDashboard } from "../../../hooks/useDashboard";
// import useContracts from './hooks/usecontract';
import NewContractPage from './components/NewContractPage';
import UpdateContractPage from './components/UpdateContractPage';


import './contract.css';

export default function ContractsPage({ token }) {
  // const { contracts, loading, error } = useContracts();
  const [showNewcontract, setShowNewcontract] = useState(false);
  const [showUpdatecontract, setShowUpdatecontract] = useState(false);
  const [Updatecontractdata, setUpdatecontractdata] = useState(null);

  const {
    loading,
    error,

    AllContracts = [],
    ExpContracts,

    AllTrainers = [],
    AllSessions = [],
    createContract,
    updateContract,
    deleteContract,


  } = useDashboard(token);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');



    if (showNewcontract) {
      return (
        <NewContractPage
          token={token}
          onBack={() => setShowNewcontract(false)}
          AllTrainers={AllTrainers}
          AllSessions={AllSessions}
          createContract={createContract}
        />
      );
    } 
    if (showUpdatecontract) {
      return (
        <UpdateContractPage
          token={token}
          onBack={() => setShowUpdatecontract(false)}
          contract={Updatecontractdata}
          AllTrainers={AllTrainers}
          AllSessions={AllSessions}
          updateContract={updateContract}
        />
      );
    } 



     




  const filteredContracts = AllContracts.filter((contract) => {
    const matchesSearch =
      contract._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.trainerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.trainerId?.speciality?.toLowerCase().includes(searchTerm.toLowerCase());

    const contractStatus =
      contract.status.charAt(0).toUpperCase() +
      contract.status.slice(1).toLowerCase();

    const matchesFilter =
      statusFilter === 'All' ||
      contractStatus === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    active: AllContracts.filter(
      (c) => c.status.toLowerCase() === 'active'
    ).length,

    expiringSoon: ExpContracts?.length || 0,

    Cancelled: AllContracts.filter(
      (c) => c.status.toLowerCase() === 'cancelled'
    ).length,
    Completed: AllContracts.filter(
      (c) => c.status.toLowerCase() === 'completed'
    ).length,
  };

  const handleExportCSV = () => {
    const headers = [
      'CONTRACT ID',
      'TRAINER',
      'SPECIALITY',
      'SESSION START',
      'SESSION END',
      'STATUS',
      'CONTRACT START',
      'CONTRACT END',
    ];

    const rows = filteredContracts.map((c) => [
      c._id,
      c.trainerId?.name || '—',
      c.trainerId?.speciality || '—',
      c.sessionId?.startDate
        ? new Date(c.sessionId.startDate).toLocaleDateString()
        : '—',
      c.sessionId?.endDate
        ? new Date(c.sessionId.endDate).toLocaleDateString()
        : '—',
      c.status,
      new Date(c.startDate).toLocaleDateString(),
      new Date(c.endDate).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv',
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'contracts.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="contracts-page">
      {/* Header */}
      <div className="contracts-header">
        <div>
          <h1>Contracts</h1>
          <p>Manage trainer agreements</p>
        </div>

        <button
          className="btn-new-contract"
          onClick={() => setShowNewcontract(true)}
        >
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
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          className="btn-export-csv"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && <p className="loading">Loading contracts...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <ContractsTable
          contracts={filteredContracts}
          onDelete={deleteContract}
          token={token}
          Updatecontractdata={setUpdatecontractdata}
          setShowUpdatecontract={setShowUpdatecontract}

        />
      )}
    </div>
  );
}