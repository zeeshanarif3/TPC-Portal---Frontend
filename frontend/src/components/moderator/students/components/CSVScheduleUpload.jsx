import { useState } from "react";
import Papa from "papaparse";
import CSVSchedulePreview from "./CSVSchedulePreview";
// import "./CSVScheduleUpload.css";

export default function CSVScheduleUpload({
  token,
  AllCourses = [],
  createStudent,
  onBack,
}) {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function findCourse(courseCode) {
    return AllCourses.find(
      (c) =>
        c.courseCode &&
        c.courseCode.trim().toLowerCase() ===
          courseCode.trim().toLowerCase()
    );
  }

  function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    if (!uploaded.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file.");
      setSuccess("");
      return;
    }

    setFile(uploaded);
    setError("");
    setSuccess("");
  }

  function processCSV() {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data || [];

          if (!rows.length) {
            throw new Error("CSV is empty.");
          }

          const required = [
            "rollNumber",
            "name",
            "email",
            "dob",
            "courseCode",
          ];

          const headers = Object.keys(rows[0] || {});
          const missing = required.filter(
            (col) => !headers.includes(col)
          );

          if (missing.length) {
            throw new Error(
              `Missing CSV columns: ${missing.join(", ")}`
            );
          }

          const finalStudents = [];

          rows.forEach((row, index) => {
            const rollNumber = row.rollNumber?.trim();
            const name = row.name?.trim();
            const email = row.email?.trim();
            const dob = row.dob?.trim();
            const courseCode = row.courseCode?.trim();

            if (!rollNumber)
              throw new Error(
                `Row ${index + 1}: rollNumber is missing`
              );

            if (!name)
              throw new Error(
                `Row ${index + 1}: name is missing`
              );

            if (!email)
              throw new Error(
                `Row ${index + 1}: email is missing`
              );

            if (!dob)
              throw new Error(
                `Row ${index + 1}: dob is missing`
              );

            if (!courseCode)
              throw new Error(
                `Row ${index + 1}: courseCode is missing`
              );

            const course = findCourse(courseCode);

            if (!course) {
              throw new Error(
                `Row ${index + 1}: Course '${courseCode}' not found`
              );
            }

            const student = {
              rollNumber,
              name,
              email,
              dob,
              courseId: course._id,
            };

            const duplicate = finalStudents.some(
              (s) =>
                s.rollNumber.toLowerCase() ===
                  student.rollNumber.toLowerCase() &&
                s.courseId === student.courseId
            );

            if (!duplicate) {
              finalStudents.push(student);
            }
          });

          if (!finalStudents.length) {
            throw new Error("No valid students found.");
          }

          setStudents(finalStudents);
          setSuccess(
            `${finalStudents.length} students extracted successfully.`
          );
          setShowPreview(true);
        } catch (err) {
          setError(err.message || "Failed to process CSV.");
          setSuccess("");
        }
      },
      error: (err) => {
        setError(err.message || "Failed to parse CSV.");
      },
    });
  }

  if (showPreview) {
    return (
      <CSVSchedulePreview
        students={students}
        AllCourses={AllCourses}
        createStudent={createStudent}
        token={token}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="csv-upload-page">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <h2>Import Students From CSV</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="upload-box">
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
        />

        <button onClick={processCSV}>
          Read CSV
        </button>
      </div>

      <div className="csv-help">
        <p>
          Required columns:
          <strong>
            {" "}
            rollNumber, name, email, dob,
            courseCode
          </strong>
        </p>

        <p>
          DOB format:
          <strong> YYYY-MM-DD</strong>
        </p>
      </div>
    </div>
  );
}





// // import "./CSVScheduleUpload.css";
// import { useState } from "react";
// import Papa from "papaparse";
// import CSVSchedulePreview from "./CSVSchedulePreview";

// export default function CSVScheduleUpload({
//   token,
//   AllCourses = [],
//   createStudent,
//   onBack,
// }) {
//   const [file, setFile] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [showPreview, setShowPreview] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   function findCourse(courseCode) {
//     return AllCourses.find(
//       (c) =>
//         c.courseCode &&
//         c.courseCode.trim().toLowerCase() === courseCode.trim().toLowerCase()
//     );
//   }

//   function handleFile(e) {
//     const uploaded = e.target.files?.[0];
//     if (!uploaded) return;

//     if (!uploaded.name.toLowerCase().endsWith(".csv")) {
//       setError("Please upload a CSV file.");
//       setSuccess("");
//       return;
//     }

//     setFile(uploaded);
//     setError("");
//     setSuccess("");
//   }

//   function processCSV() {
//     if (!file) {
//       setError("Please select a CSV file.");
//       return;
//     }

//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         try {
//           const rows = results.data || [];

//           if (!rows.length) {
//             throw new Error("CSV is empty.");
//           }

//           const required = ["rollNumber", "name", "courseCode"];
//           const headers = Object.keys(rows[0] || {});
//           const missing = required.filter((col) => !headers.includes(col));

//           if (missing.length) {
//             throw new Error(`Missing CSV columns: ${missing.join(", ")}`);
//           }

//           const finalStudents = [];

//           rows.forEach((row, index) => {
//             const rollNumber = row.rollNumber?.trim();
//             const name = row.name?.trim();
//             const courseCode = row.courseCode?.trim();

//             if (!rollNumber) {
//               throw new Error(`Row ${index + 1}: rollNumber is missing`);
//             }

//             if (!name) {
//               throw new Error(`Row ${index + 1}: name is missing`);
//             }

//             if (!courseCode) {
//               throw new Error(`Row ${index + 1}: courseCode is missing`);
//             }

//             const course = findCourse(courseCode);

//             if (!course) {
//               throw new Error(`Row ${index + 1}: Course not found`);
//             }

//             const student = {
//               rollNumber,
//               name,
//               courseId: course._id,
//             };

//             const duplicate = finalStudents.some(
//               (s) =>
//                 s.rollNumber.toLowerCase() === student.rollNumber.toLowerCase() &&
//                 s.courseId === student.courseId
//             );

//             if (!duplicate) {
//               finalStudents.push(student);
//             }
//           });

//           if (finalStudents.length === 0) {
//             throw new Error("No valid students found");
//           }

//           setStudents(finalStudents);
//           setSuccess(`${finalStudents.length} students extracted`);
//           setShowPreview(true);
//         } catch (err) {
//           setError(err.message || "Failed to process CSV");
//         }
//       },
//       error: (err) => {
//         setError(err.message || "Failed to parse CSV");
//       },
//     });
//   }

//   if (showPreview) {
//     return (
//       <CSVSchedulePreview
//         students={students}
//         AllCourses={AllCourses}
//         createStudent={createStudent}
//         token={token}
//         onBack={() => setShowPreview(false)}
//       />
//     );
//   }

//   return (
//     <div className="csv-upload-page">
//       <button className="back-btn" onClick={onBack}>
//         ← Back
//       </button>

//       <h2>Import Students From CSV</h2>

//       {error && <div className="error">{error}</div>}
//       {success && <div className="success">{success}</div>}

//       <div className="upload-box">
//         <input type="file" accept=".csv" onChange={handleFile} />

//         <button onClick={processCSV}>Read CSV</button>
//       </div>

//       <div className="csv-help">
//         <p>Required columns: <strong>rollNumber, name, courseCode</strong></p>
//       </div>
//     </div>
//   );
// }