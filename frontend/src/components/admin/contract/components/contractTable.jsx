import "./contractTable.css";

import {
  Eye,
  Pencil,
  CircleStop,
  Trash2,
} from "lucide-react";

export default function ContractsTable({
  contracts,
  onEnd,
  onDelete,
  onRefresh,
}) {
  const handleEnd = async (contractId) => {
    if (
      window.confirm(
        "Are you sure you want to end this contract?"
      )
    ) {
      await onEnd(contractId);
      onRefresh();
    }
  };

  const handleDelete = async (contractId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this contract?"
      )
    ) {
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
            <th className="actions-column">
              ACTIONS
            </th>
          </tr>
        </thead>

        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td className="contract-id">
                {contract.id}
              </td>

              <td className="contract-trainer">
                {contract.trainer}
              </td>

              <td className="contract-college">
                {contract.college}
              </td>

              <td>
                {contract.session}
              </td>

              <td>
                <span
                  className={`status-badge status-${contract.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {contract.status}
                </span>
              </td>

              <td>
                {contract.startDate}
              </td>

              <td>
                {contract.endDate}
              </td>

              <td className="contract-actions">
                <button
                  className="btn-action btn-view"
                  title="View Contract"
                  onClick={() =>
                    (window.location.href = `/contracts/${contract.id}`)
                  }
                >
                  <Eye />
                </button>

                <button
                  className="btn-action btn-edit"
                  title="Edit Contract"
                  onClick={() =>
                    (window.location.href = `/contracts/${contract.id}/edit`)
                  }
                >
                  <Pencil />
                </button>

                <button
                  className="btn-action btn-end"
                  title="End Contract"
                  onClick={() =>
                    handleEnd(contract.id)
                  }
                >
                  <CircleStop />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete Contract"
                  onClick={() =>
                    handleDelete(contract.id)
                  }
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {contracts.length === 0 && (
        <div className="no-data">
          No contracts found
        </div>
      )}
    </div>
  );
}