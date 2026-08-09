import { useEffect, useState } from "react";
import "./UpdateStudentPage.css";

export default function UpdateStudentPage({
  token,
  onBack,
  student,
  updateStudent,
  courses = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    courseId: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        rollNumber: student.rollNumber || "",
        courseId: student.courseId?._id || student.courseId || "",
      });
    }
  }, [student]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!student?._id) {
      alert("Student data missing.");
      return;
    }

    if (!formData.name.trim()) {
      alert("Student name is required.");
      return;
    }

    if (!formData.rollNumber.trim()) {
      alert("Roll number is required.");
      return;
    }

    if (!formData.courseId) {
      alert("Please select a course.");
      return;
    }

    try {
      setLoading(true);

      await updateStudent(
        student._id,
        formData,
        token
      );

      alert("Student updated successfully.");

      onBack();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-student-page">
      <button onClick={onBack}>
        ← Back
      </button>

      <h2>Update Student</h2>

      <div className="student-form">
        <div className="form-group">
          <label>Name</label>

          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              handleChange("name", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Roll Number</label>

          <input
            type="text"
            value={formData.rollNumber}
            onChange={(e) =>
              handleChange("rollNumber", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Course</label>

          <select
            value={formData.courseId}
            onChange={(e) =>
              handleChange("courseId", e.target.value)
            }
          >
            <option value="">Select Course</option>

            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseCode}
              </option>
            ))}
          </select>
        </div>

        <button
          className="save-btn"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? "Updating..."
            : "Update Student"}
        </button>
      </div>
    </div>
  );
}