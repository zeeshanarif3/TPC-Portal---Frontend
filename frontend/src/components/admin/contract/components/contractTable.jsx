import "./contractTable.css";
import {
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import useTable from "../../hook/useTable";

export default function ContractsTable({
  contracts = [],
  onEnd,
  onDelete,
  onRefresh,
  token,
  Updatecontractdata,
  setShowUpdatecontract,
}) {
  const {
    sortedData: sortedContracts,
    selected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSort,
    copyID,
  } = useTable(contracts, {
    contractId: (c) => c._id || "",
    trainer: (c) => c.trainerId?.name || "",
    session: (c) =>
      new Date(c.sessionId?.startDate || 0).getTime(),
    status: (c) => c.status || "",
    start: (c) =>
      new Date(c.startDate || 0).getTime(),
    end: (c) =>
      new Date(c.endDate || 0).getTime(),
  });

  const formatDate = (date) => {
    if (!date) return "—";

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (contractId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this contract?"
      )
    ) {
      return;
    }

    await onDelete?.(contractId, token);
    onRefresh?.();
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;

    if (
      !window.confirm(
        `Delete ${selected.length} contract${
          selected.length === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }

    for (const id of selected) {
      await onDelete?.(id, token);
    }

    clearSelection();
    onRefresh?.();
  };

  return (
    <div className="contracts-table-container">
      {selected.length > 0 && (
        <div className="contracts-bulk-bar">
          <span>{selected.length} selected</span>

          <button
            className="btn-delete-selected"
            onClick={handleBulkDelete}
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      <table className="contracts-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  sortedContracts.length > 0 &&
                  selected.length ===
                    sortedContracts.length
                }
                onChange={selectAll}
              />
            </th>

            <th onClick={() => toggleSort("contractId")}>
              CONTRACT ID
              <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("trainer")}>
              TRAINER
              <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("session")}>
              SESSION
              <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("status")}>
              STATUS
              <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("start")}>
              START
              <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("end")}>
              END
              <ArrowUpDown size={14} />
            </th>

            <th className="actions-column">
              ACTIONS
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedContracts.map((contract) => (
            <tr
              key={contract._id}
              className={
                selected.includes(contract._id)
                  ? "selected-row"
                  : ""
              }
            >
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(
                    contract._id
                  )}
                  onChange={() =>
                    toggleSelection(
                      contract._id
                    )
                  }
                />
              </td>

              <td className="contract-id">
                <span title={contract._id}>
                  {contract._id.slice(0, 10)}...
                </span>

                <button
                  className="btn-copy"
                  title="Copy Contract ID"
                  onClick={() =>
                    copyID(contract._id)
                  }
                >
                  <Copy size={14} />
                </button>
              </td>

              <td className="contract-trainer">
                <div className="trainer-info">
                  <strong>
                    {contract.trainerId?.name ||
                      "—"}
                  </strong>

                  <small>
                    {contract.trainerId
                      ?.speciality || "—"}
                  </small>
                </div>
              </td>

              <td>
                {contract.sessionId ? (
                  <div className="session-info">
                    <div>
                      {formatDate(
                        contract.sessionId
                          .startDate
                      )}
                    </div>

                    <small>
                      {formatDate(
                        contract.sessionId
                          .endDate
                      )}
                    </small>
                  </div>
                ) : (
                  "—"
                )}
              </td>

              <td>
                <span
                  className={`status-badge status-${
                    (contract.status || "unknown")
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                  }`}
                >
                  {(contract.status || "—")
                    .charAt(0)
                    .toUpperCase() +
                    (contract.status || "—")
                      .slice(1)}
                </span>
              </td>

              <td>{formatDate(contract.startDate)}</td>

              <td>{formatDate(contract.endDate)}</td>

              <td className="contract-actions">
                <button
                  className="btn-action btn-edit"
                  title={
                    contract.status === "ended"
                      ? "Ended contracts cannot be edited"
                      : "Edit Contract"
                  }
                  disabled={contract.status === "ended"}
                  onClick={() => {
                    Updatecontractdata(contract);
                    setShowUpdatecontract(true);
                  }}
                >
                  <Pencil />
                </button>

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
          <h3>No contracts found</h3>
          <p>
            There are currently no contracts to display.
          </p>
        </div>
      )}
    </div>
  );
}






// import "./contractTable.css";
// import { Pencil, Trash2, Copy } from "lucide-react";

// export default function ContractsTable({
//   contracts = [],
//   onEnd,
//   onDelete,
//   onRefresh,
//   token,
//   Updatecontractdata,
//   setShowUpdatecontract,
// }) {
//   const formatDate = (date) => {
//     if (!date) return "—";

//     return new Date(date).toLocaleDateString(undefined, {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const copyContractId = async (id) => {
//     try {
//       await navigator.clipboard.writeText(id);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleDelete = async (contractId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this contract?"
//       )
//     ) {
//       return;
//     }

//     await onDelete?.(contractId, token);
//     onRefresh?.();
//   };

//   return (
//     <div className="contracts-table-container">
//       <table className="contracts-table">
//         <thead>
//           <tr>
//             <th>CONTRACT ID</th>
//             <th>TRAINER</th>
//             <th>SESSION</th>
//             <th>STATUS</th>
//             <th>START</th>
//             <th>END</th>
//             <th className="actions-column">
//               ACTIONS
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {contracts.map((contract) => (
//             <tr key={contract._id}>
//               <td className="contract-id">
//                 <span
//                   title={contract._id}
//                 >
//                   {contract._id.slice(0, 10)}...
//                 </span>

//                 <button
//                   className="btn-copy"
//                   title="Copy Contract ID"
//                   onClick={() =>
//                     copyContractId(contract._id)
//                   }
//                 >
//                   <Copy size={14} />
//                 </button>
//               </td>

//               <td className="contract-trainer">
//                 <div className="trainer-info">
//                   <strong>
//                     {contract.trainerId?.name ||
//                       "—"}
//                   </strong>

//                   <small>
//                     {contract.trainerId
//                       ?.speciality || "—"}
//                   </small>
//                 </div>
//               </td>

//               <td>
//                 {contract.sessionId ? (
//                   <div className="session-info">
//                     <div>
//                       {formatDate(
//                         contract.sessionId
//                           .startDate
//                       )}
//                     </div>

//                     <small>
//                       {formatDate(
//                         contract.sessionId
//                           .endDate
//                       )}
//                     </small>
//                   </div>
//                 ) : (
//                   "—"
//                 )}
//               </td>

//               <td>
//                 <span
//                   className={`status-badge status-${contract.status
//                     .toLowerCase()
//                     .replace(/\s+/g, "-")}`}
//                 >
//                   {contract.status
//                     .charAt(0)
//                     .toUpperCase() +
//                     contract.status.slice(1)}
//                 </span>
//               </td>

//               <td>
//                 {formatDate(contract.startDate)}
//               </td>

//               <td>
//                 {formatDate(contract.endDate)}
//               </td>

//               <td className="contract-actions">
//                 <button
//                   className="btn-action btn-edit"
//                   title={
//                     contract.status ===
//                     "ended"
//                       ? "Ended contracts cannot be edited"
//                       : "Edit Contract"
//                   }
//                   disabled={
//                     contract.status ===
//                     "ended"
//                   }
//                   onClick={() => {
//                     Updatecontractdata(
//                       contract
//                     );
//                     setShowUpdatecontract(
//                       true
//                     );
//                   }}
//                 >
//                   <Pencil />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete Contract"
//                   onClick={() =>
//                     handleDelete(
//                       contract._id
//                     )
//                   }
//                 >
//                   <Trash2 />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {contracts.length === 0 && (
//         <div className="no-data">
//           <h3>No contracts found</h3>
//           <p>
//             There are currently no
//             contracts to display.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }






// // import "./contractTable.css";

// // import {
// //   Eye,
// //   Pencil,
// //   CircleStop,
// //   Trash2,
// // } from "lucide-react";

// // export default function ContractsTable({
// //   contracts = [],
// //   onEnd,
// //   onDelete,
// //   onRefresh,
// //   token,
// //   Updatecontractdata,
// //   setShowUpdatecontract,
// // }) {
// //   const handleEnd = async (contractId) => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to end this contract?"
// //       )
// //     ) {
// //       if (onEnd) {
// //         await onEnd(contractId);
// //       }

// //       onRefresh?.();
// //     }
// //   };

// //   const handleDelete = async (contractId) => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this contract?"
// //       )
// //     ) {
// //       if (onDelete) {
// //         await onDelete(contractId, token);
// //       }

// //       onRefresh?.();
// //     }
// //   };

// //   return (
// //     <div className="contracts-table-container">
// //       <table className="contracts-table">
// //         <thead>
// //           <tr>
// //             <th>CONTRACT ID</th>
// //             <th>TRAINER</th>
// //             <th>SPECIALITY</th>
// //             <th>SESSION</th>
// //             <th>STATUS</th>
// //             <th>START</th>
// //             <th>END</th>
// //             <th className="actions-column">
// //               ACTIONS
// //             </th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {contracts.map((contract) => (
// //             <tr key={contract._id}>
// //               <td className="contract-id">
// //                 {contract._id}
// //               </td>

// //               <td className="contract-trainer">
// //                 {contract.trainerId?.name || "—"}
// //               </td>

// //               <td>
// //                 {contract.trainerId?.speciality || "—"}
// //               </td>

// //               <td>
// //                 {contract.sessionId
// //                   ? `${new Date(
// //                       contract.sessionId.startDate
// //                     ).toLocaleDateString()} - ${new Date(
// //                       contract.sessionId.endDate
// //                     ).toLocaleDateString()}`
// //                   : "—"}
// //               </td>

// //               <td>
// //                 <span
// //                   className={`status-badge status-${contract.status
// //                     .toLowerCase()
// //                     .replace(/\s+/g, "-")}`}
// //                 >
// //                   {contract.status.charAt(0).toUpperCase() +
// //                     contract.status.slice(1)}
// //                 </span>
// //               </td>

// //               <td>
// //                 {new Date(
// //                   contract.startDate
// //                 ).toLocaleDateString()}
// //               </td>

// //               <td>
// //                 {new Date(
// //                   contract.endDate
// //                 ).toLocaleDateString()}
// //               </td>

// //               <td className="contract-actions">
// //                 {/* <button
// //                   className="btn-action btn-view"
// //                   title="View Contract"
// //                   onClick={() =>
// //                     (window.location.href = `/contracts/${contract._id}`)
// //                   }
// //                 >
// //                   <Eye />
// //                 </button> */}

// //                 <button
// //                   className="btn-action btn-edit"
// //                   title="Edit Contract"
// //                   onClick={() =>
// //                     {
// //                       Updatecontractdata(contract);
// //                       setShowUpdatecontract(true);
// //                     }
// //                   }
// //                 >
// //                   <Pencil />
// //                 </button>

// //                 {/* <button
// //                   className="btn-action btn-end"
// //                   title="End Contract"
// //                   onClick={() =>
// //                     handleEnd(contract._id)
// //                   }
// //                 >
// //                   <CircleStop />
// //                 </button> */}

// //                 <button
// //                   className="btn-action btn-delete"
// //                   title="Delete Contract"
// //                   onClick={() =>
// //                     handleDelete(contract._id)
// //                   }
// //                 >
// //                   <Trash2 />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {contracts.length === 0 && (
// //         <div className="no-data">
// //           No contracts found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }