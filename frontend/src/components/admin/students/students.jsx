import { useMemo, useState } from "react";
import StudentsTable from "./components/StudentsTable";
import NewStudentPage from "./components/NewStudentPage";
import UpdateStudentPage from "./components/UpdateStudentPage";
import CSVScheduleUpload from "./components/CSVScheduleUpload";
import { useDashboard } from "../../../hooks/useDashboard";
import "./students.css";

export default function StudentsPage({ token }) {
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [showCSVScheduleUpload, setShowCSVScheduleUpload] = useState(false);
  const [showUpdateStudent, setShowUpdateStudent] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const {
    loading,
    error,

    // Students
    Allstudents = [],
    AllCourses = [],
    createStudent,
    updateStudent,
    deleteStudent,
    refreshStudents,
  } = useDashboard(token);


  const filteredStudents = useMemo(() => {
    return Allstudents.filter((student) => {
      const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.courseId?.courseCode
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student._id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        selectedCourse === "all" ||
        student.courseId?._id === selectedCourse;

      return matchesSearch && matchesCourse;
    });
  }, [Allstudents, searchTerm, selectedCourse]);

  const handleExportCSV = (students = filteredStudents) => {
    const headers = [
      "STUDENT NAME",
      "ROLL NUMBER",
      "COURSE",
      "STUDENT ID",
    ];

    const rows = students.map((student) => [
      student.name,
      student.rollNumber,
      student.courseId?.courseCode || "—",
      student._id,
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // const assignedStudents = Allstudents.filter(
  //   (s) => s.courseId
  // ).length;
  const assignedStudents = Allstudents.filter(
  (s) => s.courseId?._id
).length;

  const unassignedStudents =
    Allstudents.length - assignedStudents;







  if (showCSVScheduleUpload) {
    return (
      <CSVScheduleUpload
        token={token}
        onBack={() => setShowCSVScheduleUpload(false)}
        createStudent={createStudent}
        AllCourses={AllCourses}
      />
    );
  }


  if (showNewStudent) {
    return (
      <NewStudentPage
        token={token}
        onBack={() => setShowNewStudent(false)}
        createStudent={createStudent}
        courses={AllCourses}
        setShowCSVScheduleUpload={setShowCSVScheduleUpload}
        setShowNewStudent={setShowNewStudent}
      />
    );
  }

  if (showUpdateStudent) {
    return (
      <UpdateStudentPage
        token={token}
        onBack={() => setShowUpdateStudent(false)}
        student={selectedStudentData}
        updateStudent={updateStudent}
        courses={AllCourses}
      />
    );
  }




  return (
    <div className="students-page">
      {/* Header */}
      <div className="students-header">
        <div>
          <h1>Students</h1>
          <p>{Allstudents.length} students on record</p>
        </div>

        <div className="header-actions">
          {/* <button
            className="btn-refresh"
            onClick={refreshStudents}
          >
            Refresh
          </button> */}

          <button
            className="btn-add-student"
            onClick={() => setShowNewStudent(true)}
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="students-stats">
        <div className="stu-stat-card">
          <span>Total Students</span>
          <h2>{Allstudents.length}</h2>
        </div>

        <div className="stu-stat-card">
          <span>Assigned</span>
          <h2>{assignedStudents}</h2>
        </div>

        <div className="stu-stat-card">
          <span>Unassigned</span>
          <h2>{unassignedStudents}</h2>
        </div>

        <div className="stu-stat-card">
          <span>Courses</span>
          <h2>{AllCourses.length}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="students-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search by name, roll no, ID..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <select
          value={selectedCourse}
          onChange={(e) =>
            setSelectedCourse(e.target.value)
          }
        >
          <option value="all">All Courses</option>

          {AllCourses.map((course) => (
            <option
              key={course._id}
              value={course._id}
            >
              {course.courseCode}
            </option>
          ))}
        </select>


        <button
          className="btn-export-csv secondary"
          onClick={() => handleExportCSV(Allstudents)}
        >
          Export All
        </button>
      </div>

      {/* Search Result Counter */}
      <div className="students-results">
        Showing{" "}
        <strong>{filteredStudents.length}</strong> of{" "}
        <strong>{Allstudents.length}</strong> students
      </div>

      {/* Table */}
      {loading && (
        <p className="loading">
          Loading students...
        </p>
      )}

      {error && (
        <p className="error">{error}</p>
      )}

      {!loading && !error && (
        <StudentsTable
          students={filteredStudents}
          token={token}
          onDelete={deleteStudent}
          onRefresh={refreshStudents}
          setShowUpdateStudent={setShowUpdateStudent}
          setSelectedStudentData={setSelectedStudentData}
        />
      )}
    </div>
  );
}













// import { useState } from "react";
// import StudentsTable from "./components/StudentsTable";
// import NewStudentPage from "./components/NewStudentPage";
// import UpdateStudentPage from "./components/UpdateStudentPage";
// import { useDashboard } from "../../../hooks/useDashboard";
// import "./students.css";

// export default function StudentsPage({ token }) {
//   const [showNewStudent, setShowNewStudent] = useState(false);
//   const [showUpdateStudent, setShowUpdateStudent] = useState(false);
//   const [selectedStudentData, setSelectedStudentData] = useState(null);

//   const {
//     loading,
//     error,

//     // Students
//     Allstudents = [],
//     AllCourses,
//     createStudent,
//     updateStudent,
//     deleteStudent,
//   } = useDashboard(token);

//   const [searchTerm, setSearchTerm] = useState("");

//   if (showNewStudent) {
//     return (
//       <NewStudentPage
//         token={token}
//         onBack={() => setShowNewStudent(false)}
//         createStudent={createStudent}
//         courses={AllCourses}
//       />
//     );
//   }

//   if (showUpdateStudent) {
//     return (
//       <UpdateStudentPage
//         token={token}
//         onBack={() => setShowUpdateStudent(false)}
//         student={selectedStudentData}
//         updateStudent={updateStudent}
//         courses={AllCourses}
//       />
//     );
//   }

//   const filteredStudents = Allstudents.filter((student) => {
//     return (
//       student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.courseId?.courseCode
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       student._id?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   });

//   const handleExportCSV = () => {
//     const headers = [
//       "STUDENT NAME",
//       "ROLL NUMBER",
//       "COURSE",
//       "STUDENT ID",
//     ];

//     const rows = filteredStudents.map((student) => [
//       student.name,
//       student.rollNumber,
//       student.courseId?.courseCode || "—",
//       student._id,
//     ]);

//     const csvContent = [headers, ...rows]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "students.csv";
//     a.click();

//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="students-page">
//       {/* Header */}
//       <div className="students-header">
//         <div>
//           <h1>Students</h1>
//           <p>{Allstudents.length} students on record</p>
//         </div>

//         <button
//           className="btn-add-student"
//           onClick={() => setShowNewStudent(true)}
//         >
//           + Add Student
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="students-filters">
//         <div className="search-box">
//           <span className="search-icon">🔍</span>

//           <input
//             type="text"
//             placeholder="Search students..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <button
//           className="btn-export-csv"
//           onClick={handleExportCSV}
//         >
//           Export CSV
//         </button>
//       </div>

//       {/* Table */}
//       {loading && <p className="loading">Loading students...</p>}
//       {error && <p className="error">{error}</p>}

//       {!loading && !error && (
//         <StudentsTable
//           students={filteredStudents.map((student) => ({
//             ...student,
//             id: student._id,
//             courseCode: student.courseId?.courseCode || "—",
//           }))}
//           token={token}
//           onDelete={deleteStudent}
//           setShowUpdateStudent={setShowUpdateStudent}
//           setSelectedStudentData={setSelectedStudentData}
//         />
//       )}
//     </div>
//   );
// }