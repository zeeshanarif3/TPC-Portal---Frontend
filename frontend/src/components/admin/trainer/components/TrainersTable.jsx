import {
  Eye,
  Pencil,
  FileText,
  Trash2
} from "lucide-react";

import "./TrainerTable.css";

export default function TrainersTable({
  trainers,
  onDelete,
  onRefresh
}) {
  const handleDelete = async (trainerId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this trainer?"
      )
    ) {
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
            <th className="actions-column">
              ACTIONS
            </th>
          </tr>
        </thead>

        <tbody>
          {trainers.map((trainer) => (
            <tr key={trainer.id}>
              <td className="trainer-name">
                {trainer.name}
              </td>

              <td className="trainer-id">
                {trainer.id}
              </td>

              <td>
                {trainer.subject}
              </td>

              <td>
                {trainer.colleges}
              </td>

              <td>
                <span
                  className={`contract-badge contract-${trainer.contractStatus
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {trainer.contractStatus}
                </span>
              </td>

              <td>
                {trainer.currentSession || "—"}
              </td>

              <td className="trainer-actions">
                <button
                  className="btn-action btn-view"
                  title="View Trainer"
                  onClick={() =>
                    (window.location.href = `/trainers/${trainer.id}`)
                  }
                >
                  <Eye />
                </button>

                <button
                  className="btn-action btn-edit"
                  title="Edit Trainer"
                  onClick={() =>
                    (window.location.href = `/trainers/${trainer.id}/edit`)
                  }
                >
                  <Pencil />
                </button>

                <button
                  className="btn-action btn-contract"
                  title="Assign Contract"
                  onClick={() =>
                    handleAssignContract(trainer.id)
                  }
                >
                  <FileText />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete Trainer"
                  onClick={() =>
                    handleDelete(trainer.id)
                  }
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {trainers.length === 0 && (
        <div className="no-data">
          No trainers found
        </div>
      )}
    </div>
  );
}