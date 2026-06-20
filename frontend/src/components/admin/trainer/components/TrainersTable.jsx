
import './TrainerTable.css';

export default function TrainersTable({ trainers, onDelete, onRefresh }) {
  const handleDelete = async (trainerId) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      await onDelete(trainerId);
      onRefresh();
    }
  };

  const handleAssignContract = (trainerId) => {
    window.location.href = `/trainers/${trainerId}/assign-contract`;
  };

  return (
    <div className="trainers-table-container">
      <table className="trainers-table">
        <thead>
          <tr>
            <th>TRAINER NAME</th>
            <th>TRAINER ID</th>
            <th>SUBJECT</th>
            <th>COLLEGES</th>
            <th>CONTRACT</th>
            <th>CURRENT SESSION</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((trainer) => (
            <tr key={trainer.id}>
              <td className="trainer-name">{trainer.name}</td>
              <td className="trainer-id">{trainer.id}</td>
              <td className="trainer-subject">{trainer.subject}</td>
              <td className="trainer-colleges">{trainer.colleges}</td>
              <td>
                <span className={`contract-badge contract-${trainer.contractStatus.toLowerCase().replace(' ', '-')}`}>
                  {trainer.contractStatus}
                </span>
              </td>
              <td className="trainer-session">{trainer.currentSession || '—'}</td>
              <td className="trainer-actions">
                <button
                  className="btn-action btn-view"
                  onClick={() => window.location.href = `/trainers/${trainer.id}`}
                  title="View"
                >
                  👁️
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={() => window.location.href = `/trainers/${trainer.id}/edit`}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-action btn-assign-contract"
                  onClick={() => handleAssignContract(trainer.id)}
                  title="Assign Contract"
                >
                  📋
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(trainer.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {trainers.length === 0 && <p className="no-data">No trainers found</p>}
    </div>
  );
}