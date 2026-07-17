import {
  Pencil,
  Trash2
} from "lucide-react";

import "./TrainerTable.css";

export default function TrainersTable({
  trainers = [],
  onDelete,
  onRefresh,
  token,
  setShowUpdateTrainer,
  setSelectedTrainerData,
  updateUserActiveStatus,
  AllUsers = [],
}) {
  const handleDelete = async (trainerId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this trainer?"
      )
    ) {
      if (onDelete) {
        await onDelete(trainerId, token);
      }

      onRefresh?.();
    }
  };

  // Get the latest active status from AllUsers
  const getUserStatus = (trainer) => {
    const user = AllUsers.find(
      (u) => u._id === trainer.userId?._id
    );

    return user?.active ?? false;
  };

  const handleToggleActive = async (trainer) => {
    try {
      const currentStatus = getUserStatus(trainer);

      await updateUserActiveStatus(
        trainer.userId._id,
        !currentStatus,
        token
      );

      onRefresh?.();
    } catch (err) {
      alert(err.message || "Failed to update trainer status");
    }
  };

  return (
    <div className="trainers-table-container">
      <table className="trainers-table">
        <thead>
          <tr>
            <th>TRAINER NAME</th>
            <th>EMAIL</th>
            <th>SPECIALITY</th>
            <th>TRAINER ID</th>
            <th>CREATED</th>
            <th>STATUS</th>
            <th className="actions-column">
              ACTIONS
            </th>
          </tr>
        </thead>

        <tbody>
          {trainers.map((trainer) => (
            <tr key={trainer._id}>
              <td className="trainer-name">
                {trainer.name}
              </td>

              <td>
                {trainer.userId?.email || "—"}
              </td>

              <td>
                {trainer.speciality}
              </td>

              <td className="trainer-id">
                {trainer._id}
              </td>

              <td>
                {new Date(
                  trainer.createdAt
                ).toLocaleDateString()}
              </td>

              <td>
                <label className="status-switch">
                  <input
                    type="checkbox"
                    checked={getUserStatus(trainer)}
                    onChange={() =>
                      handleToggleActive(trainer)
                    }
                  />
                  <span className="status-slider"></span>
                </label>
              </td>

              <td className="trainer-actions">
                <button
                  className="btn-action btn-edit"
                  title="Edit Trainer"
                  onClick={() => {
                    setSelectedTrainerData(trainer);
                    setShowUpdateTrainer(true);
                  }}
                >
                  <Pencil size={18} />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete Trainer"
                  onClick={() =>
                    handleDelete(trainer._id)
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













// import {
//   Pencil,
//   Trash2
// } from "lucide-react";

// // import { updateUserActiveStatus } from "../../services/api"; // Update the path if needed
// import "./TrainerTable.css";

// export default function TrainersTable({
//   trainers = [],
//   onDelete,
//   onRefresh,
//   token,
//   setShowUpdateTrainer,
//   setSelectedTrainerData,
//   updateUserActiveStatus,
//   AllUsers,
// }) {
//   const handleDelete = async (trainerId) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this trainer?"
//       )
//     ) {
//       if (onDelete) {
//         await onDelete(trainerId, token);
//       }

//       onRefresh?.();
//     }
//   };

//   const handleToggleActive = async (trainer) => {
//     try {
//       await updateUserActiveStatus(
//         trainer.userId._id,
//         !trainer.userId.active,
//         token
//       );

//       onRefresh?.();
//     } catch (err) {
//       alert(err.message || "Failed to update trainer status");
//     }
//   };

//   return (
//     <div className="trainers-table-container">
//       <table className="trainers-table">
//         <thead>
//           <tr>
//             <th>TRAINER NAME</th>
//             <th>EMAIL</th>
//             <th>SPECIALITY</th>
//             <th>TRAINER ID</th>
//             <th>CREATED</th>
//             <th>STATUS</th>
//             <th className="actions-column">
//               ACTIONS
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {trainers.map((trainer) => (
//             <tr key={trainer._id}>
//               <td className="trainer-name">
//                 {trainer.name}
//               </td>

//               <td>
//                 {trainer.userId?.email || "—"}
//               </td>

//               <td>
//                 {trainer.speciality}
//               </td>

//               <td className="trainer-id">
//                 {trainer._id}
//               </td>

//               <td>
//                 {new Date(
//                   trainer.createdAt
//                 ).toLocaleDateString()}
//               </td>

//               <td>
//                 <label className="status-switch">
//                   <input
//                     type="checkbox"
//                     checked={
//                       trainer.userId?.active ?? false
//                     }
//                     onChange={() =>
//                       handleToggleActive(trainer)
//                     }
//                   />
//                   <span className="status-slider"></span>
//                 </label>
//               </td>

//               <td className="trainer-actions">
//                 <button
//                   className="btn-action btn-edit"
//                   title="Edit Trainer"
//                   onClick={() => {
//                     setSelectedTrainerData(trainer);
//                     setShowUpdateTrainer(true);
//                   }}
//                 >
//                   <Pencil size={18} />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete Trainer"
//                   onClick={() =>
//                     handleDelete(trainer._id)
//                   }
//                 >
//                   <Trash2 />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {trainers.length === 0 && (
//         <div className="no-data">
//           No trainers found
//         </div>
//       )}
//     </div>
//   );
// }







// // import {
// //   Eye,
// //   Pencil,
// //   FileText,
// //   Trash2
// // } from "lucide-react";

// // import "./TrainerTable.css";

// // export default function TrainersTable({
// //   trainers = [],
// //   onDelete,
// //   onRefresh,
// //   token,
// //   setShowUpdateTrainer,
// //   setSelectedTrainerData,

// // }) {
// //   const handleDelete = async (trainerId) => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this trainer?"
// //       )
// //     ) {
// //       if (onDelete) {
// //         await onDelete(trainerId,token);
// //       }

// //       onRefresh?.();
// //     }
// //   };

// //   const handleAssignContract = (trainerId) => {
// //     window.location.href = `/trainers/${trainerId}/assign-contract`;
// //   };

// //   return (
// //     <div className="trainers-table-container">
// //       <table className="trainers-table">
// //         <thead>
// //           <tr>
// //             <th>TRAINER NAME</th>
// //             <th>EMAIL</th>
// //             <th>SPECIALITY</th>
// //             <th>TRAINER ID</th>
// //             <th>CREATED</th>
// //             <th className="actions-column">
// //               ACTIONS
// //             </th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {trainers.map((trainer) => (
// //             <tr key={trainer._id}>
// //               <td className="trainer-name">
// //                 {trainer.name}
// //               </td>

// //               <td>
// //                 {trainer.userId?.email || "—"}
// //               </td>

// //               <td>
// //                 {trainer.speciality}
// //               </td>

// //               <td className="trainer-id">
// //                 {trainer._id}
// //               </td>

// //               <td>
// //                 {new Date(trainer.createdAt).toLocaleDateString()}
// //               </td>

// //               <td className="trainer-actions">
// //                 {/* <button
// //                   className="btn-action btn-view"
// //                   title="View Trainer"
// //                   onClick={() =>
// //                     (window.location.href = `/trainers/${trainer._id}`)
// //                   }
// //                 >
// //                   <Eye />
// //                 </button> */}



// //                   <button
// //                   className="btn-action btn-edit"
// //                   title="Edit Trainer"
// //                   onClick={() => {
// //                     setSelectedTrainerData(trainer);
// //                     setShowUpdateTrainer(true);
// //                   }}
// //                 >
// //                   <Pencil size={18} />
// //                 </button>

// //                 {/* <button
// //                   className="btn-action btn-contract"
// //                   title="Assign Contract"
// //                   onClick={() =>
// //                     handleAssignContract(trainer._id)
// //                   }
// //                 >
// //                   <FileText />
// //                 </button> */}

// //                 <button
// //                   className="btn-action btn-delete"
// //                   title="Delete Trainer"
// //                   onClick={() =>
// //                     handleDelete(trainer._id)
// //                   }
// //                 >
// //                   <Trash2 />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {trainers.length === 0 && (
// //         <div className="no-data">
// //           No trainers found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // // import {
// // //   Eye,
// // //   Pencil,
// // //   FileText,
// // //   Trash2
// // // } from "lucide-react";

// // // import "./TrainerTable.css";

// // // export default function TrainersTable({
// // //   trainers,
// // //   onDelete,
// // //   onRefresh
// // // }) {
// // //   const handleDelete = async (trainerId) => {
// // //     if (
// // //       window.confirm(
// // //         "Are you sure you want to delete this trainer?"
// // //       )
// // //     ) {
// // //       await onDelete(trainerId);
// // //       onRefresh();
// // //     }
// // //   };

// // //   const handleAssignContract = (trainerId) => {
// // //     window.location.href = `/trainers/${trainerId}/assign-contract`;
// // //   };

// // //   return (
// // //     <div className="trainers-table-container">
// // //       <table className="trainers-table">
// // //         <thead>
// // //           <tr>
// // //             <th>TRAINER NAME</th>
// // //             <th>TRAINER ID</th>
// // //             <th>SUBJECT</th>
// // //             <th>COLLEGES</th>
// // //             <th>CONTRACT</th>
// // //             <th>CURRENT SESSION</th>
// // //             <th className="actions-column">
// // //               ACTIONS
// // //             </th>
// // //           </tr>
// // //         </thead>

// // //         <tbody>
// // //           {trainers.map((trainer) => (
// // //             <tr key={trainer.id}>
// // //               <td className="trainer-name">
// // //                 {trainer.name}
// // //               </td>

// // //               <td className="trainer-id">
// // //                 {trainer.id}
// // //               </td>

// // //               <td>
// // //                 {trainer.subject}
// // //               </td>

// // //               <td>
// // //                 {trainer.colleges}
// // //               </td>

// // //               <td>
// // //                 <span
// // //                   className={`contract-badge contract-${trainer.contractStatus
// // //                     .toLowerCase()
// // //                     .replace(" ", "-")}`}
// // //                 >
// // //                   {trainer.contractStatus}
// // //                 </span>
// // //               </td>

// // //               <td>
// // //                 {trainer.currentSession || "—"}
// // //               </td>

// // //               <td className="trainer-actions">
// // //                 <button
// // //                   className="btn-action btn-view"
// // //                   title="View Trainer"
// // //                   onClick={() =>
// // //                     (window.location.href = `/trainers/${trainer.id}`)
// // //                   }
// // //                 >
// // //                   <Eye />
// // //                 </button>

// // //                 <button
// // //                   className="btn-action btn-edit"
// // //                   title="Edit Trainer"
// // //                   onClick={() =>
// // //                     (window.location.href = `/trainers/${trainer.id}/edit`)
// // //                   }
// // //                 >
// // //                   <Pencil />
// // //                 </button>

// // //                 <button
// // //                   className="btn-action btn-contract"
// // //                   title="Assign Contract"
// // //                   onClick={() =>
// // //                     handleAssignContract(trainer.id)
// // //                   }
// // //                 >
// // //                   <FileText />
// // //                 </button>

// // //                 <button
// // //                   className="btn-action btn-delete"
// // //                   title="Delete Trainer"
// // //                   onClick={() =>
// // //                     handleDelete(trainer.id)
// // //                   }
// // //                 >
// // //                   <Trash2 />
// // //                 </button>
// // //               </td>
// // //             </tr>
// // //           ))}
// // //         </tbody>
// // //       </table>

// // //       {trainers.length === 0 && (
// // //         <div className="no-data">
// // //           No trainers found
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }