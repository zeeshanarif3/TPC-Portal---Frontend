import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

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
  const handleDelete = async (courseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course?"
      )
    ) {
      if (onDelete) {
        await onDelete(courseId, token);
      }

      onRefresh?.();
    }
  };

  return (
    <div className="courses-table-container">
      <table className="courses-table">
        <thead>
          <tr>
            <th>COURSE CODE</th>
            <th>COLLEGE</th>
            <th>COURSE ID</th>
            <th>CREATED</th>
            <th className="actions-column">
              ACTIONS
            </th>
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <tr key={course._id}>
              <td className="course-code">
                {course.courseCode}
              </td>

              <td>
                {course.collegeId?.name || "—"}
              </td>

              <td className="course-id">
                {course._id}
              </td>

              <td>
                {new Date(course.createdAt).toLocaleDateString()}
              </td>

              <td className="course-actions">
                {/* <button
                  className="btn-action btn-view"
                  title="View Course"
                  onClick={() =>
                    (window.location.href = `/courses/${course._id}`)
                  }
                >
                  <Eye />
                </button> */}

                <button
                  className="btn-action btn-edit"
                  title="Edit Course"
                  onClick={() =>
                    {
                      setSelectedCourse(course);
                      setShowUpdateCourse(true);
                    }
                  }
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {courses.length === 0 && (
        <div className="no-data">
          No courses found
        </div>
      )}
    </div>
  );
}