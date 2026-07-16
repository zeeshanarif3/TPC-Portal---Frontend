import { useState } from "react";
import "./NewStudentPage.css";

export default function NewStudentPage({
  token,
  onBack,
  createStudent,
  courses = [],
  setShowNewStudent,
  setShowCSVScheduleUpload,
}) {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    courseId: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
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

      await createStudent(formData, token);

      alert("Student created successfully.");

      onBack();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-student-page">
      <button onClick={onBack}>← Back</button>
      <button
        onClick={() => {
          setShowCSVScheduleUpload(true);
          setShowNewStudent(false);
        }}
      >
        Use CSV
      </button>

      <h2>Create Student</h2>

      <div className="student-form">
        <div className="form-group">
          <label>Name</label>

          <input
            type="text"
            placeholder="Enter student name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Roll Number</label>

          <input
            type="text"
            placeholder="Enter roll number"
            value={formData.rollNumber}
            onChange={(e) => handleChange("rollNumber", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Course</label>

          <select
            value={formData.courseId}
            onChange={(e) => handleChange("courseId", e.target.value)}
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
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Student"}
        </button>
      </div>
    </div>
  );
}