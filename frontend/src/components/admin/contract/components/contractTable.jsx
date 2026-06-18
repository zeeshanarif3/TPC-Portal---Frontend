

import './contractTable.css';




export default function ContractsTable({ contracts, onEnd, onDelete, onRefresh }) {
  const handleEnd = async (contractId) => {
    if (window.confirm('Are you sure you want to end this contract?')) {
      await onEnd(contractId);
      onRefresh();
    }
  };

  const handleDelete = async (contractId) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      await onDelete(contractId);
      onRefresh();
    }
  };

  return (
    <div className="contracts-table-container">
      <table className="contracts-table">
        <thead>
          <tr>
            <th>CONTRACT ID</th>
            <th>TRAINER</th>
            <th>COLLEGE</th>
            <th>SESSION</th>
            <th>STATUS</th>
            <th>START</th>
            <th>END</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td className="contract-id">{contract.id}</td>
              <td className="contract-trainer">{contract.trainer}</td>
              <td className="contract-college">{contract.college}</td>
              <td className="contract-session">{contract.session}</td>
              <td>
                <span className={`status-badge status-${contract.status.toLowerCase().replace(' ', '-')}`}>
                  {contract.status}
                </span>
              </td>
              <td className="contract-start">{contract.startDate}</td>
              <td className="contract-end">{contract.endDate}</td>
              <td className="contract-actions">
                <button
                  className="btn-action btn-view"
                  onClick={() => window.location.href = `/contracts/${contract.id}`}
                  title="View"
                >
                  👁️
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={() => window.location.href = `/contracts/${contract.id}/edit`}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-action btn-end"
                  onClick={() => handleEnd(contract.id)}
                  title="End Contract"
                >
                  End
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {contracts.length === 0 && <p className="no-data">No contracts found</p>}
    </div>
  );
}