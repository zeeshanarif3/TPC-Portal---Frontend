import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  AlertTriangle,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import "./CollegeTable.css";

export default function CollegeTable({
  colleges = [],
  onDelete,
  onRefresh,
  token,
  setShowUpdateCollege,
  setSelectedCollege,
}) {
  const [deleteCollege, setDeleteCollege] = useState(null);
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [copying, setCopying] = useState(false);

  const handleDelete = (college) => {
    setDeleteCollege(college);
  };

  const confirmDelete = async () => {
    if (deleteCollege?._id) {
      await onDelete?.(deleteCollege._id, token);
      onRefresh?.();
    }

    setDeleteCollege(null);
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedColleges = useMemo(() => {
    return [...colleges].sort((a, b) => {
      let aVal = "";
      let bVal = "";

      switch (sortField) {
        case "name":
          aVal = a.name || "";
          bVal = b.name || "";
          break;

        case "location":
          aVal = a.location || "";
          bVal = b.location || "";
          break;

        case "contact":
          aVal = a.pointOfContact || "";
          bVal = b.pointOfContact || "";
          break;

        case "moderator":
          aVal = a.moderatorId?.name || "";
          bVal = b.moderatorId?.name || "";
          break;

        case "created":
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;

        default:
          break;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [colleges, sortField, sortDirection]);

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === sortedColleges.length) {
      setSelected([]);
    } else {
      setSelected(sortedColleges.map((college) => college._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    if (
      !window.confirm(`Delete ${selected.length} college${
        selected.length === 1 ? "" : "s"
      }?`)
    ) {
      return;
    }

    for (const id of selected) {
      await onDelete?.(id, token);
    }

    setSelected([]);
    onRefresh?.();
  };

  const copyID = async (id) => {
    if (copying) return;

    setCopying(true);
    try {
      await navigator.clipboard.writeText(String(id));
    } finally {
      setTimeout(() => setCopying(false), 300);
    }
  };

  return (
    <div className="college-table-container">
      {selected.length > 0 && (
        <div className="college-bulk-bar">
          <span>{selected.length} selected</span>

          <button className="btn-delete-selected" onClick={handleBulkDelete}>
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      <table className="college-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  sortedColleges.length > 0 &&
                  selected.length === sortedColleges.length
                }
                onChange={selectAll}
              />
            </th>

            <th onClick={() => toggleSort("name")}>
              COLLEGE <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("location")}>
              LOCATION <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("contact")}>
              POINT OF CONTACT <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("moderator")}>
              MODERATOR <ArrowUpDown size={14} />
            </th>

            <th onClick={() => toggleSort("created")}>
              CREATED <ArrowUpDown size={14} />
            </th>

            <th className="actions-column">ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {sortedColleges.map((college) => (
            <tr
              key={college._id}
              className={selected.includes(college._id) ? "selected-row" : ""}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(college._id)}
                  onChange={() => toggleSelection(college._id)}
                />
              </td>

              <td className="college-name">
                <div>{college.name || "—"}</div>

                <div className="college-id">
                  <span>{college._id.slice(0, 10)}...</span>

                  <button
                    className="btn-copy"
                    title="Copy ID"
                    onClick={() => copyID(college._id)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </td>

              <td>{college.location || "—"}</td>

              <td>{college.pointOfContact || "—"}</td>

              <td>
                <div>{college.moderatorId?.name || "—"}</div>
                <small>{college.moderatorId?.email || ""}</small>
              </td>

              <td>
                {college.createdAt
                  ? new Date(college.createdAt).toLocaleDateString()
                  : "—"}
              </td>

              <td className="college-actions">
                <button
                  className="btn-action btn-edit"
                  title="Edit"
                  onClick={() => {
                    setSelectedCollege(college);
                    setShowUpdateCollege(true);
                  }}
                >
                  <Pencil size={18} />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete"
                  onClick={() => handleDelete(college)}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {colleges.length === 0 && <div className="no-data">No colleges found</div>}

      {deleteCollege && (
        <div className="delete-overlay">
          <div className="delete-modal">
            <div className="delete-icon">
              <AlertTriangle size={30} />
            </div>

            <h2>Delete College?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteCollege.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="delete-buttons">
              <button
                className="cancel-delete"
                onClick={() => setDeleteCollege(null)}
              >
                Cancel
              </button>

              <button className="confirm-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







// import {
//   Eye,
//   Pencil,
//   Trash2,
//   AlertTriangle,
// } from "lucide-react";

// import { useState } from "react";
// import "./CollegeTable.css";

// export default function CollegeTable({
//   colleges = [],
//   onDelete,
//   token,
//   setShowUpdateCollege,
//   setSelectedCollege,
// }) {
//   const [deleteCollege, setDeleteCollege] = useState(null);

//   const handleDelete = (college) => {
//     setDeleteCollege(college);
//   };

//   const confirmDelete = async () => {
//     if (deleteCollege?._id) {
//       await onDelete?.(deleteCollege._id, token);
//     }

//     setDeleteCollege(null);
//   };

//   return (
//     <div className="college-table-container">

//       <table className="college-table">
//         <thead>
//           <tr>
//             <th>COLLEGE</th>
//             <th>LOCATION</th>
//             <th>POINT OF CONTACT</th>
//             <th>MODERATOR</th>
//             <th>CREATED</th>
//             <th className="actions-column">ACTIONS</th>
//           </tr>
//         </thead>

//         <tbody>
//           {colleges.map((college) => (
//             <tr key={college._id}>

//               <td className="college-name">
//                 <div>{college.name}</div>
//                 <small className="college-id">
//                   {college._id}
//                 </small>
//               </td>


//               <td>
//                 {college.location || "—"}
//               </td>


//               <td>
//                 {college.pointOfContact || "—"}
//               </td>


//               <td>
//                 <div>
//                   {college.moderatorId?.name || "—"}
//                 </div>

//                 <small>
//                   {college.moderatorId?.email}
//                 </small>
//               </td>


//               <td>
//                 {new Date(
//                   college.createdAt
//                 ).toLocaleDateString()}
//               </td>


//               <td className="college-actions">

//                 {/* <button
//                   className="btn-action btn-view"
//                   title="View"
//                   onClick={() =>
//                     window.location.href =
//                     `/colleges/${college._id}`
//                   }
//                 >
//                   <Eye size={18}/>
//                 </button> */}


//                 {/* <button
//                   className="btn-action btn-edit"
//                   title="Edit"
//                   // onClick={() =>
//                   //   window.location.href =
//                   //   `/colleges/${college._id}/edit`
//                   // }
//                   onClick={() => setShowUpdateCollege(true) }
                  
//                 >
//                   <Pencil size={18}/>
//                 </button> */}

//                 <button
//                   className="btn-action btn-edit"
//                   title="Edit"
//                   onClick={() => {
//                     setSelectedCollege(college);
//                     setShowUpdateCollege(true);
//                   }}
//                 >
//                   <Pencil size={18} />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete"
//                   onClick={() => handleDelete(college)}
//                 >
//                   <Trash2 size={18} />
//                 </button>

//               </td>

//             </tr>
//           ))}
//         </tbody>

//       </table>


//       {colleges.length === 0 && (
//         <div className="no-data">
//           No colleges found
//         </div>
//       )}



//       {deleteCollege && (

//         <div className="delete-overlay">

//           <div className="delete-modal">

//             <div className="delete-icon">
//               <AlertTriangle size={30} />
//             </div>


//             <h2>
//               Delete College?
//             </h2>


//             <p>
//               Are you sure you want to delete
//               <strong> {deleteCollege.name}</strong>?
//               This action cannot be undone.
//             </p>


//             <div className="delete-buttons">

//               <button
//                 className="cancel-delete"
//                 onClick={() => setDeleteCollege(null)}
//               >
//                 Cancel
//               </button>


//               <button
//                 className="confirm-delete"
//                 onClick={confirmDelete}
//               >
//                 Delete
//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }




// // import {
// //   Eye,
// //   Pencil,
// //   Trash2,
// // } from "lucide-react";

// // import "./CollegeTable.css";

// // export default function CollegeTable({
// //   colleges = [],
// //   onDelete,
// // }) {
// //   const handleDelete = async (collegeId) => {
// //     if (window.confirm("Are you sure you want to delete this college?")) {
// //       await onDelete?.(collegeId);
// //     }
// //   };

// //   return (
// //     <div className="college-table-container">
// //       <table className="college-table">
// //         <thead>
// //           <tr>
// //             <th>COLLEGE</th>
// //             <th>LOCATION</th>
// //             <th>POINT OF CONTACT</th>
// //             <th>MODERATOR</th>
// //             <th>CREATED</th>
// //             <th className="actions-column">ACTIONS</th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {colleges.map((college) => (
// //             <tr key={college._id}>
// //               <td className="college-name">
// //                 <div>{college.name}</div>
// //                 <small className="college-id">{college._id}</small>
// //               </td>

// //               <td>{college.location || "—"}</td>

// //               <td>{college.pointOfContact || "—"}</td>

// //               <td>
// //                 <div>{college.moderatorId?.name || "—"}</div>
// //                 <small>{college.moderatorId?.email}</small>
// //               </td>

// //               <td>
// //                 {new Date(college.createdAt).toLocaleDateString()}
// //               </td>

// //               <td className="college-actions">
// //                 <button
// //                   className="btn-action btn-view"
// //                   title="View"
// //                   onClick={() =>
// //                     (window.location.href = `/colleges/${college._id}`)
// //                   }
// //                 >
// //                   <Eye size={18} />
// //                 </button>

// //                 <button
// //                   className="btn-action btn-edit"
// //                   title="Edit"
// //                   onClick={() =>
// //                     (window.location.href = `/colleges/${college._id}/edit`)
// //                   }
// //                 >
// //                   <Pencil size={18} />
// //                 </button>

// //                 <button
// //                   className="btn-action btn-delete"
// //                   title="Delete"
// //                   onClick={() => handleDelete(college._id)}
// //                 >
// //                   <Trash2 size={18} />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {colleges.length === 0 && (
// //         <div className="no-data">
// //           No colleges found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }