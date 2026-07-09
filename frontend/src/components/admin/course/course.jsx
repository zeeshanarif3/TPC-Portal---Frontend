import { useState } from "react";
import CoursesTable from "./components/courseTable";
// import NewCoursePage from "./components/NewCoursePage";
import NewCoursePage from "./components/NewcoursePage";
import UpdateCoursePage from "./components/UpdateCoursePage";
import { useDashboard } from "../../../hooks/useDashboard";

import "./course.css";

export default function CoursesPage({ token }) {
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showUpdateCourse, setShowUpdateCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const {
    loading,
    error,

    // Courses
    AllCourses = [],

    colleges = [],
    deleteCourse,
    updateCourse,
    createCourse,
  } = useDashboard(token);

  const [searchTerm, setSearchTerm] = useState("");

  if (showNewCourse) {
    return (
      <NewCoursePage
        token={token}
        onBack={() => setShowNewCourse(false)}
        AllColleges={colleges}
        createCourse={createCourse}
      />
    );
  }
  if (showUpdateCourse) {
    return (
      <UpdateCoursePage
        token={token}
        onBack={() => setShowUpdateCourse(false)}
        course={selectedCourse}
        AllColleges={colleges}
        updateCourse={updateCourse}
      />
    );
  }

  const filteredCourses = AllCourses.filter((course) => {
    return (
      course.courseCode
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      course._id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      course.collegeId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const handleExportCSV = () => {
    const headers = [
      "COURSE CODE",
      "COURSE ID",
      "COLLEGE",
      "CREATED",
    ];

    const rows = filteredCourses.map((course) => [
      course.courseCode,
      course._id,
      course.collegeId?.name || "—",
      new Date(course.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "courses.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="courses-page">
      {/* Header */}
      <div className="courses-header">
        <div>
          <h1>Courses</h1>
          <p>{AllCourses.length} courses on record</p>
        </div>

        <button
          className="btn-add-course"
          onClick={() => setShowNewCourse(true)}
        >
          + Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="courses-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <button
          className="btn-export-csv"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading && (
        <p className="loading">
          Loading courses...
        </p>
      )}

      {error && (
        <p className="error">{error}</p>
      )}

      {!loading && !error && (
        <CoursesTable
          courses={filteredCourses}
          onDelete={deleteCourse}
          onUpdate={updateCourse}
          token={token}
          setSelectedCourse={setSelectedCourse}
          setShowUpdateCourse={setShowUpdateCourse}
        />
      )}
    </div>
  );
}