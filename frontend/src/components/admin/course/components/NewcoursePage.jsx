import "./NewcoursePage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useState } from "react";


import './NewcoursePage.css'

export default function NewCoursePage({ token, onBack ,AllColleges ,createCourse}) {
  
  const [formData, setFormData] = useState({
    collegeId: "",
    courseCode: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.collegeId) {
      return alert("Please select a college.");
    }

    if (!formData.courseCode.trim()) {
      return alert("Course code is required.");
    }

    try {
      setLoading(true);

      await createCourse(formData, token);

      alert("Course created successfully.");

      onBack();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-course-page">
      <button onClick={onBack}>← Back</button>

      <h2>Create Course</h2>

      <div className="course-form">

        <div className="form-group">
          <label>College</label>

          <select
            value={formData.collegeId}
            onChange={(e) =>
              handleChange("collegeId", e.target.value)
            }
          >
            <option value="">Select College</option>

            {AllColleges.map((college) => (
              <option
                key={college._id}
                value={college._id}
              >
                {college.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Course Code</label>

          <input
            type="text"
            placeholder="e.g. BTECH-CSE-2027"
            value={formData.courseCode}
            onChange={(e) =>
              handleChange("courseCode", e.target.value)
            }
          />
        </div>

        <button
          className="save-btn"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Creating..." : "Create Course"}
        </button>

      </div>
    </div>
  );
}