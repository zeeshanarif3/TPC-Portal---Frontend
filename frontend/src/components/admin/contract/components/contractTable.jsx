import "./contractTable.css";

import {
  Eye,
  Pencil,
  CircleStop,
  Trash2,
} from "lucide-react";

export default function ContractsTable({
  contracts = [],
  onEnd,
  onDelete,
  onRefresh,
  token,
  Updatecontractdata,
  setShowUpdatecontract,
}) {
  const handleEnd = async (contractId) => {
    if (
      window.confirm(
        "Are you sure you want to end this contract?"
      )
    ) {
      if (onEnd) {
        await onEnd(contractId);
      }

      onRefresh?.();
    }
  };

  const handleDelete = async (contractId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this contract?"
      )
    ) {
      if (onDelete) {
        await onDelete(contractId, token);
      }

      onRefresh?.();
    }
  };

  return (
    <div className="contracts-table-container">
      <table className="contracts-table">
        <thead>
          <tr>
            <th>CONTRACT ID</th>
            <th>TRAINER</th>
            <th>SPECIALITY</th>
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
            <tr key={contract._id}>
              <td className="contract-id">
                {contract._id}
              </td>

              <td className="contract-trainer">
                {contract.trainerId?.name || "—"}
              </td>

              <td>
                {contract.trainerId?.speciality || "—"}
              </td>

              <td>
                {contract.sessionId
                  ? `${new Date(
                      contract.sessionId.startDate
                    ).toLocaleDateString()} - ${new Date(
                      contract.sessionId.endDate
                    ).toLocaleDateString()}`
                  : "—"}
              </td>

              <td>
                <span
                  className={`status-badge status-${contract.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {contract.status.charAt(0).toUpperCase() +
                    contract.status.slice(1)}
                </span>
              </td>

              <td>
                {new Date(
                  contract.startDate
                ).toLocaleDateString()}
              </td>

              <td>
                {new Date(
                  contract.endDate
                ).toLocaleDateString()}
              </td>

              <td className="contract-actions">
                {/* <button
                  className="btn-action btn-view"
                  title="View Contract"
                  onClick={() =>
                    (window.location.href = `/contracts/${contract._id}`)
                  }
                >
                  <Eye />
                </button> */}

                <button
                  className="btn-action btn-edit"
                  title="Edit Contract"
                  onClick={() =>
                    {
                      Updatecontractdata(contract);
                      setShowUpdatecontract(true);
                    }
                  }
                >
                  <Pencil />
                </button>

                {/* <button
                  className="btn-action btn-end"
                  title="End Contract"
                  onClick={() =>
                    handleEnd(contract._id)
                  }
                >
                  <CircleStop />
                </button> */}

                <button
                  className="btn-action btn-delete"
                  title="Delete Contract"
                  onClick={() =>
                    handleDelete(contract._id)
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