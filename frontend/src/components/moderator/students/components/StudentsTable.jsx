import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import "./StudentsTable.css";

export default function StudentsTable({
  students = [],
  onDelete,
  onRefresh,
  token,
  setShowUpdateStudent,
  setSelectedStudentData,
}) {
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((p) =>
        p === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      let aVal = "";
      let bVal = "";

      switch (sortField) {
        case "name":
          aVal = a.name || "";
          bVal = b.name || "";
          break;

        case "rollNumber":
          aVal = a.rollNumber || "";
          bVal = b.rollNumber || "";
          break;

        case "course":
          aVal = a.courseId?.courseCode || "";
          bVal = b.courseId?.courseCode || "";
          break;

        case "createdAt":
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;

        default:
          break;
      }

      if (aVal < bVal)
        return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal)
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [students, sortField, sortDirection]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this student?"
      )
    )
      return;

    await onDelete?.(id, token);
    onRefresh?.();
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    if (
      !window.confirm(
        `Delete ${selected.length} students?`
      )
    )
      return;

    for (const id of selected) {
      await onDelete?.(id, token);
    }

    setSelected([]);
    onRefresh?.();
  };

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === sortedStudents.length) {
      setSelected([]);
    } else {
      setSelected(
        sortedStudents.map((s) => s._id)
      );
    }
  };

const [copying, setCopying] = useState(false);

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
    <div className="students-table-container">
{/* 
      {selected.length > 0 && (
        <div className="students-bulk-bar">
          <span>
            {selected.length} selected
          </span>

          <button
            className="btn-delete-selected"
            onClick={handleBulkDelete}
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )} */}

      <table className="students-table">
        <thead>
          <tr>
            {/* <th>
              <input
                type="checkbox"
                checked={
                  sortedStudents.length > 0 &&
                  selected.length ===
                    sortedStudents.length
                }
                onChange={selectAll}
              />
            </th> */}

            <th
              onClick={() =>
                toggleSort("name")
              }
            >
              STUDENT NAME
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort("rollNumber")
              }
            >
              ROLL NUMBER
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort("course")
              }
            >
              COURSE
              <ArrowUpDown size={14} />
            </th>

            <th>STUDENT ID</th>

            <th
              onClick={() =>
                toggleSort("createdAt")
              }
            >
              CREATED
              <ArrowUpDown size={14} />
            </th>

            {/* <th>ACTIONS</th> */}
          </tr>
        </thead>

        <tbody>
          {sortedStudents.map((student) => (
            <tr
              key={student._id}
              className={
                selected.includes(student._id)
                  ? "selected-row"
                  : ""
              }
              // onDoubleClick={() => {
              //   setSelectedStudentData(student);
              //   setShowUpdateStudent(true);
              // }}
            >
              {/* <td>
                <input
                  type="checkbox"
                  checked={selected.includes(
                    student._id
                  )}
                  onChange={() =>
                    toggleSelection(student._id)
                  }
                />
              </td> */}

              <td>{student.name || "—"}</td>

              <td>
                {student.rollNumber || "—"}
              </td>

              <td>
                {student.courseId
                  ?.courseCode ?? "—"}
              </td>

              <td className="student-id">
                <span>
                  {student._id.slice(0, 10)}...
                </span>

                <button
                  className="btn-copy"
                  onClick={() =>
                    copyID(student._id)
                  }
                >
                  <Copy size={14} />
                </button>
              </td>

              <td>
                {student.createdAt
                  ? new Date(
                      student.createdAt
                    ).toLocaleDateString()
                  : "—"}
              </td>

              {/* <td className="student-actions">
                <button
                  className="btn-action btn-edit"
                  onClick={() => {
                    setSelectedStudentData(
                      student
                    );
                    setShowUpdateStudent(
                      true
                    );
                  }}
                >
                  <Pencil size={17} />
                </button>

                <button
                  className="btn-action btn-delete"
                  onClick={() =>
                    handleDelete(
                      student._id
                    )
                  }
                >
                  <Trash2 size={17} />
                </button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>

      {students.length === 0 && (
        <div className="no-data">
          <h3>No students found</h3>
          <p>
            Try changing the search or
            create a new student.
          </p>
        </div>
      )}
    </div>
  );
}








// import { Pencil, Trash2 } from "lucide-react";
// import "./StudentsTable.css";

// export default function StudentsTable({
//   students = [],
//   onDelete,
//   onRefresh,
//   token,
//   setShowUpdateStudent,
//   setSelectedStudentData,
// }) {
//   const handleDelete = async (studentId) => {
//     if (window.confirm("Are you sure you want to delete this student?")) {
//       if (onDelete) {
//         await onDelete(studentId, token);
//       }

//       onRefresh?.();
//     }
//   };

//   return (
//     <div className="students-table-container">
//       <table className="students-table">
//         <thead>
//           <tr>
//             <th>STUDENT NAME</th>
//             <th>ROLL NUMBER</th>
//             <th>COURSE</th>
//             <th>STUDENT ID</th>
//             <th>CREATED</th>
//             <th className="actions-column">ACTIONS</th>
//           </tr>
//         </thead>

//         <tbody>
//           {students.map((student) => (
//             <tr key={student._id}>
//               <td className="student-name">
//                 {student.name || "—"}
//               </td>

//               <td>
//                 {student.rollNumber || "—"}
//               </td>

//               <td>
//                 {student.courseId?.courseCode ?? "—"}
//               </td>

//               <td className="student-id">
//                 {student._id}
//               </td>

//               <td>
//                 {student.createdAt
//                   ? new Date(student.createdAt).toLocaleDateString()
//                   : "—"}
//               </td>

//               <td className="student-actions">
//                 <button
//                   className="btn-action btn-edit"
//                   title="Edit Student"
//                   onClick={() => {
//                     setSelectedStudentData(student);
//                     setShowUpdateStudent(true);
//                   }}
//                 >
//                   <Pencil size={18} />
//                 </button>

//                 <button
//                   className="btn-action btn-delete"
//                   title="Delete Student"
//                   onClick={() => handleDelete(student._id)}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {students.length === 0 && (
//         <div className="no-data">
//           No students found
//         </div>
//       )}
//     </div>
//   );
// }

// // import { Pencil, Trash2 } from "lucide-react";
// // import "./StudentsTable.css";

// // export default function StudentsTable({
// //   students = [],
// //   onDelete,
// //   onRefresh,
// //   token,
// //   setShowUpdateStudent,
// //   setSelectedStudentData,
// // }) {
// //   const handleDelete = async (studentId) => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this student?"
// //       )
// //     ) {
// //       if (onDelete) {
// //         await onDelete(studentId, token);
// //       }

// //       onRefresh?.();
// //     }
// //   };

// //   return (
// //     <div className="students-table-container">
// //       <table className="students-table">
// //         <thead>
// //           <tr>
// //             <th>STUDENT NAME</th>
// //             <th>ROLL NUMBER</th>
// //             <th>COURSE</th>
// //             <th>STUDENT ID</th>
// //             <th>CREATED</th>
// //             <th className="actions-column">
// //               ACTIONS
// //             </th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {students.map((student) => (
// //             <tr key={student._id}>
// //               <td className="student-name">
// //                 {student.name}
// //               </td>

// //               <td>
// //                 {student.rollNumber}
// //               </td>

// //               <td>
// //                 {student.courseId?.courseCode || "—"}
// //               </td>

// //               <td className="student-id">
// //                 {student._id}
// //               </td>

// //               <td>
// //                 {new Date(student.createdAt).toLocaleDateString()}
// //               </td>

// //               <td className="student-actions">
// //                 <button
// //                   className="btn-action btn-edit"
// //                   title="Edit Student"
// //                   onClick={() => {
// //                     setSelectedStudentData(student);
// //                     setShowUpdateStudent(true);
// //                   }}
// //                 >
// //                   <Pencil size={18} />
// //                 </button>

// //                 <button
// //                   className="btn-action btn-delete"
// //                   title="Delete Student"
// //                   onClick={() => handleDelete(student._id)}
// //                 >
// //                   <Trash2 />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {students.length === 0 && (
// //         <div className="no-data">
// //           No students found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }