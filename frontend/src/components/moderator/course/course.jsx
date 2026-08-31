// CoursesPage.jsx
import { useMemo, useState } from "react";
import CoursesTable from "./components/courseTable";
// import NewCoursePage from "./components/NewCoursePage";
import NewCoursePage from "./components/NewcoursePage";
import UpdateCoursePage from "./components/UpdateCoursePage";
import { useModer } from "../../../hooks/useModer";

import "./course.css";

export default function CoursesPage({ token }) {
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showUpdateCourse, setShowUpdateCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("all");

  const {
    loading,
    error,
    AllCourses = [],
    colleges = [],
    deleteCourse,
    updateCourse,
    createCourse,
  } = useModer(token);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredCourses = useMemo(() => {
    return AllCourses.filter((course) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        course.courseCode?.toLowerCase().includes(search) ||
        course._id?.toLowerCase().includes(search) ||
        course.collegeId?.name?.toLowerCase().includes(search);

      const matchesCollege =
        selectedCollege === "all" ||
        course.collegeId?._id === selectedCollege;

      return matchesSearch && matchesCollege;
    });
  }, [AllCourses, searchTerm, selectedCollege]);

  const totalCourses = AllCourses.length;
  const filteredCount = filteredCourses.length;
  const totalColleges = colleges.length;
  const recentlyAdded = AllCourses.filter((course) => {
    if (!course.createdAt) return false;
    const created = new Date(course.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created >= thirtyDaysAgo;
  }).length;

  const csvEscape = (value) => {
    const str = value == null ? "" : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = (coursesToExport = filteredCourses) => {
    const headers = ["COURSE CODE", "COURSE ID", "COLLEGE", "CREATED"];

    const rows = coursesToExport.map((course) => [
      course.courseCode || "—",
      course._id || "—",
      course.collegeId?.name || "—",
      formatDate(course.createdAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "courses.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  // if (showNewCourse) {
  //   return (
  //     <NewCoursePage
  //       token={token}
  //       onBack={() => setShowNewCourse(false)}
  //       AllColleges={colleges}
  //       createCourse={createCourse}
  //     />
  //   );
  // }

  // if (showUpdateCourse) {
  //   return (
  //     <UpdateCoursePage
  //       token={token}
  //       onBack={() => setShowUpdateCourse(false)}
  //       course={selectedCourse}
  //       AllColleges={colleges}
  //       updateCourse={updateCourse}
  //     />
  //   );
  // }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h1>Courses</h1>
          <p>{totalCourses} courses on record</p>
        </div>

        <div className="header-actions">
          <button
            className="btn-export-csv"
            onClick={() => handleExportCSV(AllCourses)}
          >
            Export All
          </button>

          {/* <button
            className="btn-add-course"
            onClick={() => setShowNewCourse(true)}
          >
            + Add Course
          </button> */}
        </div>
      </div>

      <div className="students-stats">
        <div className="course-stat-card">
          <span>Total Courses</span>
          <h2>{totalCourses}</h2>
        </div>

        <div className="course-stat-card">
          <span>Filtered</span>
          <h2>{filteredCount}</h2>
        </div>

        <div className="course-stat-card">
          <span>Colleges</span>
          <h2>{totalColleges}</h2>
        </div>

        <div className="course-stat-card">
          <span>Added Last 30 Days</span>
          <h2>{recentlyAdded}</h2>
        </div>
      </div>

      <div className="courses-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search by course code, college, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* <select
          className="college-filter"
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
        >
          <option value="all">All Colleges</option>
          {colleges.map((college) => (
            <option key={college._id} value={college._id}>
              {college.name}
            </option>
          ))}
        </select> */}

        <button
          className="btn-export-csv"
          onClick={() => handleExportCSV(filteredCourses)}
        >
          Export Filtered
        </button>
      </div>

      <div className="students-results">
        Showing <strong>{filteredCount}</strong> of{" "}
        <strong>{totalCourses}</strong> courses
      </div>

      {loading && <p className="loading">Loading courses...</p>}

      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <CoursesTable
          courses={filteredCourses}
          onDelete={deleteCourse}
          onUpdate={updateCourse}
          token={token}
          onRefresh={() => {}}
          setSelectedCourse={setSelectedCourse}
          setShowUpdateCourse={setShowUpdateCourse}
        />
      )}
    </div>
  );
}





// import { useState } from "react";
// import CoursesTable from "./components/courseTable";
// // import NewCoursePage from "./components/NewCoursePage";
// import NewCoursePage from "./components/NewcoursePage";
// import UpdateCoursePage from "./components/UpdateCoursePage";
// import { useDashboard } from "../../../hooks/useDashboard";

// import "./course.css";

// export default function CoursesPage({ token }) {
//   const [showNewCourse, setShowNewCourse] = useState(false);
//   const [showUpdateCourse, setShowUpdateCourse] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const {
//     loading,
//     error,

//     // Courses
//     AllCourses = [],

//     colleges = [],
//     deleteCourse,
//     updateCourse,
//     createCourse,
//   } = useDashboard(token);

//   const [searchTerm, setSearchTerm] = useState("");

//   if (showNewCourse) {
//     return (
//       <NewCoursePage
//         token={token}
//         onBack={() => setShowNewCourse(false)}
//         AllColleges={colleges}
//         createCourse={createCourse}
//       />
//     );
//   }
//   if (showUpdateCourse) {
//     return (
//       <UpdateCoursePage
//         token={token}
//         onBack={() => setShowUpdateCourse(false)}
//         course={selectedCourse}
//         AllColleges={colleges}
//         updateCourse={updateCourse}
//       />
//     );
//   }

//   const filteredCourses = AllCourses.filter((course) => {
//     return (
//       course.courseCode
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       course._id
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       course.collegeId?.name
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase())
//     );
//   });

//   const handleExportCSV = () => {
//     const headers = [
//       "COURSE CODE",
//       "COURSE ID",
//       "COLLEGE",
//       "CREATED",
//     ];

//     const rows = filteredCourses.map((course) => [
//       course.courseCode,
//       course._id,
//       course.collegeId?.name || "—",
//       new Date(course.createdAt).toLocaleDateString(),
//     ]);

//     const csvContent = [headers, ...rows]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], {
//       type: "text/csv",
//     });

//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "courses.csv";
//     a.click();

//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="courses-page">
//       {/* Header */}
//       <div className="courses-header">
//         <div>
//           <h1>Courses</h1>
//           <p>{AllCourses.length} courses on record</p>
//         </div>

//         <button
//           className="btn-add-course"
//           onClick={() => setShowNewCourse(true)}
//         >
//           + Add Course
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="courses-filters">
//         <div className="search-box">
//           <span className="search-icon">🔍</span>

//           <input
//             type="text"
//             placeholder="Search courses..."
//             value={searchTerm}
//             onChange={(e) =>
//               setSearchTerm(e.target.value)
//             }
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
//       {loading && (
//         <p className="loading">
//           Loading courses...
//         </p>
//       )}

//       {error && (
//         <p className="error">{error}</p>
//       )}

//       {!loading && !error && (
//         <CoursesTable
//           courses={filteredCourses}
//           onDelete={deleteCourse}
//           onUpdate={updateCourse}
//           token={token}
//           setSelectedCourse={setSelectedCourse}
//           setShowUpdateCourse={setShowUpdateCourse}
//         />
//       )}
//     </div>
//   );
// }