import { useState, useEffect } from 'react';
import TrainersTable from './components/TrainersTable';
import useTrainers from './hooks/usetrainer';
import { useDashboard } from "../../../hooks/useDashboard";

import NewTrainerPage from './components/NewtrainerPage';
import UpdateTrainerPage from './components/UpdateTrainerPage';
import './trainer.css';

export default function TrainersPage({ token }) {
    const [showNewTrainer, setShowNewTrainer] = useState(false);
    const [showUpdateTrainer, setShowUpdateTrainer] = useState(false);

  const {
    loading,
    error,

    //Trainers
    AllTrainers = [],
    TrainersByColl= [],
    createTrainer,
    deleteTrainer,
    updateTrainer,
    updateUserActiveStatus,
    AllUsers,
  } = useDashboard(token);

  // const { trainers, loading, error, fetchTrainers, deleteTrainer } = useTrainers();
  const [searchTerm, setSearchTerm] = useState('');
  const [contractFilter, setContractFilter] = useState('All');
  const [selectedTrainerData, setSelectedTrainerData] = useState(null);


    if (showNewTrainer) {
      return (
        <NewTrainerPage
          token={token}
          onBack={() => setShowNewTrainer(false)}
          createTrainer={createTrainer}
          updateTrainer={updateTrainer}
        />
      );
    }
    if (showUpdateTrainer) {
      return (
        <UpdateTrainerPage
          token={token}
          onBack={() => setShowUpdateTrainer(false)}
          trainer={selectedTrainerData}
          updateTrainer={updateTrainer}
        />
      );
    }
        
  const filteredTrainers = AllTrainers.filter((trainer) => {
    const matchesSearch =
      trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.speciality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Backend doesn't provide contract status yet
    const trainerContract = trainer.contractStatus || 'Active';

    const matchesFilter =
      contractFilter === 'All' ||
      trainerContract === contractFilter;

    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    const headers = [
      'TRAINER NAME',
      'TRAINER ID',
      'EMAIL',
      'SPECIALITY',
      'CONTRACT',
      'CURRENT SESSION',
    ];

    const rows = filteredTrainers.map((t) => [
      t.name,
      t._id,
      t.userId?.email || '—',
      t.speciality || '—',
      t.contractStatus || 'Active',
      t.currentSession || '—',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'trainers.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="trainers-page">
      {/* Header */}
      <div className="trainers-header">
        <div>
          <h1>Trainers</h1>
          <p>{AllTrainers.length} trainers on record</p>
        </div>

        <button
          className="btn-add-trainer"
          onClick={() => setShowNewTrainer(true)}
        >
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


        <button
          className="btn-export-csv"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && <p className="loading">Loading trainers...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <TrainersTable
          trainers={filteredTrainers.map((trainer) => ({
            ...trainer,

            // Old fields expected by TrainersTable
            id: trainer._id,
            subject: trainer.speciality,
            email: trainer.userId?.email || '',

            // Backend doesn't provide these yet
            colleges: trainer.colleges || '—',
            contractStatus: trainer.contractStatus || 'Active',
            currentSession: trainer.currentSession || '—',
          }))}
          onDelete={deleteTrainer}
          token={token}
          setShowUpdateTrainer={setShowUpdateTrainer}
          setSelectedTrainerData={setSelectedTrainerData}
          updateUserActiveStatus={updateUserActiveStatus}
          AllUsers={AllUsers}
        />
      )}
    </div>
  );
}







// import { useState, useEffect } from 'react';
// import TrainersTable from './components/TrainersTable';
// import useTrainers from './hooks/usetrainer';
// import CollegeSelector from "./components/CollegeSelector";
// import { useDashboard } from "../../../hooks/useDashboard";

// import './trainer.css';



// export default function TrainersPage({ token }) {


//    const {
//         selectedCollege,
//         setSelectedCollege,
//         colleges,
//         loading,
//         error,

//         //Trainers
//         AllTrainers = [],
//         TrainersByColl,




//     } = useDashboard(token);








//   // const { trainers, loading, error, fetchTrainers, deleteTrainer } = useTrainers();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [contractFilter, setContractFilter] = useState('All');



//   const filteredTrainers = AllTrainers.filter(trainer => {
//     const matchesSearch = 
//       trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       trainer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       trainer.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesFilter = contractFilter === 'All' || trainer.contractStatus === contractFilter;
//     return matchesSearch && matchesFilter;
//   });

//   const handleExportCSV = () => {
//     const headers = ['TRAINER NAME', 'TRAINER ID', 'SUBJECT', 'COLLEGES', 'CONTRACT', 'CURRENT SESSION'];
//     const rows = filteredTrainers.map(t => [
//       t.name,
//       t.id,
//       t.subject,
//       t.colleges,
//       t.contractStatus,
//       t.currentSession || '—'
//     ]);
//     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'trainers.csv';
//     a.click();
//   };

//   return (
//     <div className="trainers-page">
//       {/* Header */}
//       <div className="trainers-header">
//         <div>
//           <h1>Trainers</h1>
//           <p>{AllTrainers.length} trainers on record</p>
//         </div>
//         <button className="btn-add-trainer" onClick={() => window.location.href = '/trainers/add'}>
//           + Add Trainer
//         </button>
//                 <div className="collselcont">

//           <CollegeSelector
//               colleges={colleges}
//               selected={selectedCollege}
//               onSelect={setSelectedCollege}
//               />
//           </div>
//       </div>

//       {/* Filters */}
//       <div className="trainers-filters">
//         <div className="search-box">
//           <span className="search-icon">🔍</span>
//           <input
//             type="text"
//             placeholder="Search trainers..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <select
//           className="contract-filter"
//           value={contractFilter}
//           onChange={(e) => setContractFilter(e.target.value)}
//         >
//           <option value="All">All</option>
//           <option value="Active">Active</option>
//           <option value="Expiring Soon">Expiring Soon</option>
//           <option value="Expired">Expired</option>
//         </select>

//         <button className="btn-export-csv" onClick={handleExportCSV}>
//           Export CSV
//         </button>
//       </div>

//       {/* Table */}
//       {loading && <p className="loading">Loading trainers...</p>}
//       {error && <p className="error">{error}</p>}
//       {!loading && !error && (
//         <TrainersTable
//           trainers={filteredTrainers}
//         />
//       )}
//     </div>
//   );
// }