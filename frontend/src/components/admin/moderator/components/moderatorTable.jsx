import {
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import "./moderatorTable.css";
import useTable from "../../hook/useTable";

export default function ModeratorTable({
  moderator = [],
  onDelete,
  onRefresh,
  token,
  setShowUpdateModeratorPage,
  setUpdateModeratordata,
  colleges = [],
}) {
  // moderatorId -> college name lookup
  const collegeMap = new Map();

  colleges.forEach((college) => {
    if (college.moderatorId?._id) {
      collegeMap.set(
        college.moderatorId._id,
        college.name
      );
    }
  });

  const {
    sortedData: sortedModerators,
    selected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSort,
    copyID,
  } = useTable(moderator, {
    name: (m) => m.name || "",
    college: (m) =>
      collegeMap.get(m._id) || "",
    email: (m) =>
      m.userId?.email || "",
    speciality: (m) =>
      m.speciality || "",
    created: (m) =>
      new Date(
        m.createdAt || 0
      ).getTime(),
  });

  const handleDelete = async (
    moderatorId
  ) => {
    if (!onDelete) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this moderator?"
      )
    )
      return;

    try {
      await onDelete(
        moderatorId,
        token
      );

      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert(
        "Failed to delete moderator."
      );
    }
  };

  const handleBulkDelete =
    async () => {
      if (
        !selected.length ||
        !onDelete
      )
        return;

      if (
        !window.confirm(
          `Delete ${selected.length} moderator${
            selected.length === 1
              ? ""
              : "s"
          }?`
        )
      )
        return;

      for (const id of selected) {
        await onDelete(id, token);
      }

      clearSelection();
      onRefresh?.();
    };

  return (
    <div className="moderator-table-container">
      {selected.length > 0 && (
        <div className="moderators-bulk-bar">
          <span>
            {selected.length} selected
          </span>

          <button
            className="btn-delete-selected"
            onClick={
              handleBulkDelete
            }
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      <table className="moderator-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  sortedModerators.length >
                    0 &&
                  selected.length ===
                    sortedModerators.length
                }
                onChange={
                  selectAll
                }
              />
            </th>

            <th
              onClick={() =>
                toggleSort("name")
              }
            >
              MODERATOR NAME
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort(
                  "college"
                )
              }
            >
              COLLEGE
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort("email")
              }
            >
              EMAIL
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort(
                  "speciality"
                )
              }
            >
              SPECIALITY
              <ArrowUpDown size={14} />
            </th>

            <th>
              MODERATOR ID
            </th>

            <th
              onClick={() =>
                toggleSort(
                  "created"
                )
              }
            >
              CREATED
              <ArrowUpDown size={14} />
            </th>

            <th className="actions-column">
              ACTIONS
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedModerators.length >
          0 ? (
            sortedModerators.map(
              (item) => (
                <tr
                  key={item._id}
                  className={
                    selected.includes(
                      item._id
                    )
                      ? "selected-row"
                      : ""
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(
                        item._id
                      )}
                      onChange={() =>
                        toggleSelection(
                          item._id
                        )
                      }
                    />
                  </td>

                  <td className="moderator-name">
                    {item.name ||
                      "—"}
                  </td>

                  <td>
                    {collegeMap.get(
                      item._id
                    ) ||
                      "Not Assigned"}
                  </td>

                  <td>
                    {item.userId
                      ?.email ||
                      "—"}
                  </td>

                  <td>
                    {item.speciality ||
                      "—"}
                  </td>

                  <td className="moderator-id">
                    <span>
                      {item._id.slice(
                        0,
                        10
                      )}
                      ...
                    </span>

                    <button
                      className="btn-copy"
                      onClick={() =>
                        copyID(
                          item._id
                        )
                      }
                    >
                      <Copy
                        size={14}
                      />
                    </button>
                  </td>

                  <td>
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="moderator-actions">
                    <button
                      className="btn-action btn-edit"
                      title="Edit Moderator"
                      onClick={() => {
                        setUpdateModeratordata(
                          item
                        );
                        setShowUpdateModeratorPage(
                          true
                        );
                      }}
                    >
                      <Pencil
                        size={18}
                      />
                    </button>

                    {onDelete && (
                      <button
                        className="btn-action btn-delete"
                        title="Delete Moderator"
                        onClick={() =>
                          handleDelete(
                            item._id
                          )
                        }
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    )}
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan={8}>
                <div className="no-data">
                  No moderators
                  found
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}








// import { Pencil, Trash2 } from "lucide-react";
// import "./moderatorTable.css";

// export default function ModeratorTable({
//   moderator = [],
//   onDelete,
//   onRefresh,
//   token,
//   setShowUpdateModeratorPage,
//   setUpdateModeratordata,
//   colleges = [],
// }) {
//   // Create a lookup: moderatorId -> college name
//   const collegeMap = new Map();

//   colleges.forEach((college) => {
//     if (college.moderatorId?._id) {
//       collegeMap.set(college.moderatorId._id, college.name);
//     }
//   });

//   const handleDelete = async (moderatorId) => {
//     if (!onDelete) return;

//     const confirmed = window.confirm(
//       "Are you sure you want to delete this moderator?"
//     );

//     if (!confirmed) return;

//     try {
//       await onDelete(moderatorId, token);
//       onRefresh?.();
//     } catch (err) {
//       console.error("Failed to delete moderator:", err);
//       alert("Failed to delete moderator.");
//     }
//   };

//   return (
//     <div className="moderator-table-container">
//       <table className="moderator-table">
//         <thead>
//           <tr>
//             <th>MODERATOR NAME</th>
//             <th>COLLEGE</th>
//             <th>EMAIL</th>
//             <th>SPECIALITY</th>
//             <th>MODERATOR ID</th>
//             <th>CREATED</th>
//             <th className="actions-column">ACTIONS</th>
//           </tr>
//         </thead>

//         <tbody>
//           {moderator.length > 0 ? (
//             moderator.map((item) => (
//               <tr key={item._id}>
//                 <td className="moderator-name">
//                   {item.name || "—"}
//                 </td>

//                 <td>
//                   {collegeMap.get(item._id) || "Not Assigned"}
//                 </td>

//                 <td>
//                   {item.userId?.email || "—"}
//                 </td>

//                 <td>
//                   {item.speciality || "—"}
//                 </td>

//                 <td className="moderator-id">
//                   {item._id}
//                 </td>

//                 <td>
//                   {item.createdAt
//                     ? new Date(item.createdAt).toLocaleDateString()
//                     : "—"}
//                 </td>

//                 <td className="moderator-actions">
//                   <button
//                     className="btn-action btn-edit"
//                     title="Edit Moderator"
//                     onClick={() => {
//                       setUpdateModeratordata(item);
//                       setShowUpdateModeratorPage(true);
//                     }}
//                   >
//                     <Pencil size={18} />
//                   </button>

//                   {onDelete && (
//                     <button
//                       className="btn-action btn-delete"
//                       title="Delete Moderator"
//                       onClick={() => handleDelete(item._id)}
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={7}>
//                 <div className="no-data">
//                   No moderators found
//                 </div>
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }









// // import { Pencil, Trash2 } from "lucide-react";
// // import "./moderatorTable.css";

// // export default function ModeratorTable({
// //   moderator = [],
// //   onDelete,
// //   onRefresh,
// //   token,
// //   setShowUpdateModeratorPage,
// //   setUpdateModeratordata,
// //   colleges,
// // }) {
// //   const handleDelete = async (moderatorId) => {
// //     if (!onDelete) return;

// //     const confirmed = window.confirm(
// //       "Are you sure you want to delete this moderator?"
// //     );

// //     if (!confirmed) return;

// //     try {
// //       await onDelete(moderatorId,token);
// //       onRefresh?.();
// //     } catch (err) {
// //       console.error("Failed to delete moderator:", err);
// //       alert("Failed to delete moderator.");
// //     }
// //   };

// //   return (
// //     <div className="moderator-table-container">

// //       <pre>{JSON.stringify(colleges, null, 2)}</pre>
// //       <pre>{JSON.stringify(moderator, null, 2)}</pre>
// //       <table className="moderator-table">
// //         <thead>
// //           <tr>
// //             <th>MODERATOR NAME</th>
// //             <th>EMAIL</th>
// //             <th>SPECIALITY</th>
// //             <th>MODERATOR ID</th>
// //             <th>CREATED</th>
// //             <th className="actions-column">ACTIONS</th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {moderator.map((item) => (
// //             <tr key={item._id}>
// //               <td className="moderator-name">
// //                 {item.name || "—"}
// //               </td>

// //               <td>
// //                 {item.userId?.email || "—"}
// //               </td>

// //               <td>
// //                 {item.speciality || "—"}
// //               </td>

// //               <td className="moderator-id">
// //                 {item._id}
// //               </td>

// //               <td>
// //                 {item.createdAt
// //                   ? new Date(item.createdAt).toLocaleDateString()
// //                   : "—"}
// //               </td>

// //               <td className="moderator-actions">
// //                 <button
// //                   className="btn-action btn-edit"
// //                   title="Edit Moderator"
// //                   onClick={() =>
// //                     {
// //                       setUpdateModeratordata(item);
// //                       setShowUpdateModeratorPage(true);
// //                     }
// //                   }
// //                 >
// //                   <Pencil size={18} />
// //                 </button>

// //                 {onDelete && (
// //                   <button
// //                     className="btn-action btn-delete"
// //                     title="Delete Moderator"
// //                     onClick={() => handleDelete(item._id)}
// //                   >
// //                     <Trash2 size={18} />
// //                   </button>
// //                 )}
// //               </td>
// //             </tr>
// //           ))}

// //           {moderator.length === 0 && (
// //             <tr>
// //               <td colSpan={6}>
// //                 <div className="no-data">
// //                   No moderators found
// //                 </div>
// //               </td>
// //             </tr>
// //           )}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }