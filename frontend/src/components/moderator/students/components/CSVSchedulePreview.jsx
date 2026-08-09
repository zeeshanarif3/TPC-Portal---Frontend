import { useState } from "react";
// import "./CSVSchedulePreview.css";

export default function CSVSchedulePreview({
  students = [],
  AllCourses = [],
  createStudent,
  token,
  onBack,
}) {
  const ENABLE_IMPORT = true;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function getCourseName(id) {
    return (
      AllCourses.find((c) => c._id === id)?.courseCode ||
      "Unknown"
    );
  }

  async function importStudents() {
    if (!ENABLE_IMPORT) {
      setMessage("Import disabled");
      return;
    }

    setLoading(true);

    let successCount = 0;
    const failures = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      try {
        await createStudent(student, token);
        successCount++;
      } catch (err) {
        failures.push(
          `Row ${i + 1} (${student.rollNumber}, ${
            student.name
          }): ${err.message}`
        );
      }
    }

    setLoading(false);

    if (!failures.length) {
      setMessage(
        `All ${successCount} students imported successfully.`
      );
    } else {
      setMessage(
        `${successCount} imported, ${failures.length} failed.\n\n${failures.join(
          "\n"
        )}`
      );
    }
  }

  return (
    <div className="csv-calendar-container">
      <button
        className="back-btn"
        onClick={onBack}
      >
        ← Back
      </button>

      <div className="csv-header">
        <h2>CSV Student Preview</h2>

        <button
          className={
            ENABLE_IMPORT
              ? "import-btn active"
              : "import-btn"
          }
          onClick={importStudents}
          disabled={loading}
        >
          {loading
            ? "Importing..."
            : "Import Students"}
        </button>
      </div>

      {message && (
        <div
          className="message"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {message}
        </div>
      )}

      <div className="csv-table-wrap">
        <table className="csv-preview-table">
          <thead>
            <tr>
              <th>ROLL NUMBER</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>DOB</th>
              <th>COURSE</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr
                key={`${student.rollNumber}-${index}`}
              >
                <td>{student.rollNumber}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.dob}</td>
                <td>
                  {getCourseName(student.courseId)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="no-data">
            No students to preview.
          </div>
        )}
      </div>
    </div>
  );
}











// import { useState } from "react";
// // import "./CSVSchedulePreview.css";

// export default function CSVSchedulePreview({
//   students = [],
//   AllCourses = [],
//   createStudent,
//   token,
//   onBack,
// }) {
//   const ENABLE_IMPORT = true;

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   function getCourseName(id) {
//     return AllCourses.find((c) => c._id === id)?.courseCode || "Unknown";
//   }

//   async function importStudents() {
//     if (!ENABLE_IMPORT) {
//       setMessage("Import disabled");
//       return;
//     }

//     setLoading(true);

//     let successCount = 0;
//     const failures = [];

//     for (let i = 0; i < students.length; i++) {
//       const student = students[i];

//       try {
//         await createStudent(student, token);
//         successCount++;
//       } catch (err) {
//         failures.push(
//           `Row ${i + 1} (${student.rollNumber}, ${student.name}): ${err.message}`
//         );
//       }
//     }

//     setLoading(false);

//     if (failures.length === 0) {
//       setMessage(`All ${successCount} students imported successfully`);
//     } else {
//       setMessage(
//         `${successCount} imported, ${failures.length} failed — ${failures.join("; ")}`
//       );
//     }
//   }

//   return (
//     <div className="csv-calendar-container">
//       <button className="back-btn" onClick={onBack}>
//         ← Back
//       </button>

//       <div className="csv-header">
//         <h2>CSV Student Preview</h2>

//         <button
//           className={ENABLE_IMPORT ? "import-btn active" : "import-btn"}
//           onClick={importStudents}
//         >
//           {loading ? "Importing..." : "Import Students"}
//         </button>
//       </div>

//       {message && <div className="message">{message}</div>}

//       <div className="csv-table-wrap">
//         <table className="csv-preview-table">
//           <thead>
//             <tr>
//               <th>ROLL NUMBER</th>
//               <th>NAME</th>
//               <th>COURSE</th>
//             </tr>
//           </thead>

//           <tbody>
//             {students.map((student, index) => (
//               <tr key={`${student.rollNumber}-${index}`}>
//                 <td>{student.rollNumber}</td>
//                 <td>{student.name}</td>
//                 <td>{getCourseName(student.courseId)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {students.length === 0 && (
//           <div className="no-data">No students to preview</div>
//         )}
//       </div>
//     </div>
//   );
// }