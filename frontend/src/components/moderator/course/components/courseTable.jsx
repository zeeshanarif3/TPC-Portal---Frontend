// courseTable.jsx
import {
  Copy,
  Pencil,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import useTable from "../../hook/useTable";
import "./courseTable.css";

export default function CoursesTable({
  courses = [],
  onDelete,
  onUpdate,
  onRefresh,
  token,
  setSelectedCourse,
  setShowUpdateCourse,
}) {
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const shortId = (id) => {
    if (!id) return "—";
    return id.length > 10 ? `${id.slice(0, 10)}...` : id;
  };

  const {
    sortedData: sortedCourses,
    selected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSort,
    copyID,
  } = useTable(courses, {
    courseCode: (c) => c.courseCode || "",
    college: (c) => c.collegeId?.name || "",
    id: (c) => c._id || "",
    created: (c) =>
      new Date(c.createdAt || 0).getTime(),
  });

  const handleDelete = async (courseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course?"
      )
    ) {
      return;
    }

    await onDelete?.(courseId, token);
    onRefresh?.();
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;

    if (
      !window.confirm(
        `Delete ${selected.length} course${
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
    <div className="courses-table-container">
      {selected.length > 0 && (
        <div className="courses-bulk-bar">
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

      <table className="courses-table">
        <thead>
          <tr>
            {/* <th>
              <input
                type="checkbox"
                checked={
                  sortedCourses.length > 0 &&
                  selected.length ===
                    sortedCourses.length
                }
                onChange={selectAll}
              />
            </th> */}

            <th
              onClick={() =>
                toggleSort("courseCode")
              }
            >
              COURSE CODE
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort("college")
              }
            >
              COLLEGE
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort("id")
              }
            >
              COURSE ID
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort("created")
              }
            >
              CREATED
              <ArrowUpDown size={14} />
            </th>

            {/* <th className="actions-column">
              ACTIONS
            </th> */}
          </tr>
        </thead>

        <tbody>
          {sortedCourses.map((course) => (
            <tr
              key={course._id}
              className={
                selected.includes(course._id)
                  ? "selected-row"
                  : ""
              }
            >
              {/* <td>
                <input
                  type="checkbox"
                  checked={selected.includes(
                    course._id
                  )}
                  onChange={() =>
                    toggleSelection(course._id)
                  }
                />
              </td> */}

              <td className="course-code">
                {course.courseCode || "—"}
              </td>

              <td>
                {course.collegeId?.name || "—"}
              </td>

              <td className="course-id">
                <span title={course._id}>
                  {shortId(course._id)}
                </span>

                <button
                  className="btn-copy"
                  title="Copy Course ID"
                  onClick={() =>
                    copyID(course._id)
                  }
                >
                  <Copy size={14} />
                </button>
              </td>

              <td>
                {formatDate(course.createdAt)}
              </td>
{/* 
              <td className="course-actions">
                <button
                  className="btn-action btn-edit"
                  title="Edit Course"
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowUpdateCourse(true);
                  }}
                >
                  <Pencil />
                </button>

                <button
                  className="btn-action btn-delete"
                  title="Delete Course"
                  onClick={() =>
                    handleDelete(course._id)
                  }
                >
                  <Trash2 />
                </button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>

      {courses.length === 0 && (
        <div className="no-data">
          <h3>No courses found</h3>
          <p>
            Try changing the search or
            college filter.
          </p>
        </div>
      )}
    </div>
  );
}







// // courseTable.jsx
// import { useState } from "react";
// import { Copy, Pencil, Trash2 } from "lucide-react";

// import "./courseTable.css";

// export default function CoursesTable({
//   courses = [],
//   onDelete,
//   onUpdate,
//   onRefresh,
//   token,
//   setSelectedCourse,
//   setShowUpdateCourse,
// }) {
//   const [copiedId, setCopiedId] = useState("");

//   const formatDate = (date) => {
//     if (!date) return "—";
//     return new Date(date).toLocaleDateString(undefined, {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const shortId = (id) => {
//     if (!id) return "—";
//     return id.length > 10 ? `${id.slice(0, 10)}...` : id;
//   };

//   const copyToClipboard = async (text) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedId(text);
//       setTimeout(() => setCopiedId(""), 1200);
//     } catch (error) {
//       console.error("Failed to copy:", error);
//     }
//   };

//   const handleDelete = async (courseId) => {
//     if (
//       window.confirm("Are you sure you want to delete this course?")
//     ) {
//       if (onDelete) {
//         await onDelete(courseId, token);
//       }

//       onRefresh?.();
//     }
//   };

//   return (
//     <div className="courses-table-container">
//       <table className="courses-table">
//         <thead>
//           <tr>
//             <th>COURSE CODE</th>
//             <th>COLLEGE</th>
//             <th>COURSE ID</th>
//             <th>CREATED</th>
//             <th className="actions-column">ACTIONS</th>
//           </tr>
//         </thead>

//         <tbody>
//           {courses.map((course) => (
//             <tr key={course._id}>
//               <td className="course-code">
//                 {course.courseCode || "—"}
//               </td>

//               <td>
//                 {course.collegeId?.name || "—"}
//               </td>

//               <td className="course-id">
//                 <span title={course._id}>
//                   {shortId(course._id)}
//                 </span>

//                 <button
//                   className="btn-copy"
//                   title={
//                     copiedId === course._id
//                       ? "Copied"
//                       : "Copy Course ID"
//                   }
//                   onClick={() => copyToClipboard(course._id)}
//                 >
//                   <Copy size={14} />
//                 </button>
//               </td>

//               <td>
//                 {formatDate(course.createdAt)}
//               </td>

//               <td className="course-actions">
//                 <button
//                   className="btn-action btn-edit"
//                   title="Edit Course"
//                   onClick={() => {
//                     setSelectedCourse(course);
//                     setShowUpdateCourse(true);
//                   }}
//                 >
//                   <Pencil />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete Course"
//                   onClick={() => handleDelete(course._id)}
//                 >
//                   <Trash2 />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {courses.length === 0 && (
//         <div className="no-data">
//           <h3>No courses found</h3>
//           <p>Try changing the search or college filter.</p>
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

// // import "./courseTable.css";

// // export default function CoursesTable({
// //   courses = [],
// //   onDelete,
// //   onUpdate,
// //   onRefresh,
// //   token,
// //   setSelectedCourse,
// //   setShowUpdateCourse,
// // }) {
// //   const handleDelete = async (courseId) => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this course?"
// //       )
// //     ) {
// //       if (onDelete) {
// //         await onDelete(courseId, token);
// //       }

// //       onRefresh?.();
// //     }
// //   };

// //   return (
// //     <div className="courses-table-container">
// //       <table className="courses-table">
// //         <thead>
// //           <tr>
// //             <th>COURSE CODE</th>
// //             <th>COLLEGE</th>
// //             <th>COURSE ID</th>
// //             <th>CREATED</th>
// //             <th className="actions-column">
// //               ACTIONS
// //             </th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {courses.map((course) => (
// //             <tr key={course._id}>
// //               <td className="course-code">
// //                 {course.courseCode}
// //               </td>

// //               <td>
// //                 {course.collegeId?.name || "—"}
// //               </td>

// //               <td className="course-id">
// //                 {course._id}
// //               </td>

// //               <td>
// //                 {new Date(course.createdAt).toLocaleDateString()}
// //               </td>

// //               <td className="course-actions">
// //                 {/* <button
// //                   className="btn-action btn-view"
// //                   title="View Course"
// //                   onClick={() =>
// //                     (window.location.href = `/courses/${course._id}`)
// //                   }
// //                 >
// //                   <Eye />
// //                 </button> */}

// //                 <button
// //                   className="btn-action btn-edit"
// //                   title="Edit Course"
// //                   onClick={() =>
// //                     {
// //                       setSelectedCourse(course);
// //                       setShowUpdateCourse(true);
// //                     }
// //                   }
// //                 >
// //                   <Pencil />
// //                 </button>

// //                 <button
// //                   className="btn-action btn-delete"
// //                   title="Delete Course"
// //                   onClick={() =>
// //                     handleDelete(course._id)
// //                   }
// //                 >
// //                   <Trash2 />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {courses.length === 0 && (
// //         <div className="no-data">
// //           No courses found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }