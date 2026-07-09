import "./NewSessionPage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useMemo, useState } from "react";

export default function NewSessionPage({AllColleges, AllCourses, token, onBack ,createSession, updateSession}) {


  const [formData, setFormData] = useState({
    collegeId: "",
    courseIds: [],
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);

  const availableCourses = useMemo(() => {
    if (!formData.collegeId) return [];

    return AllCourses.filter((course) => {
      const collegeId =
        typeof course.collegeId === "object"
          ? course.collegeId?._id
          : course.collegeId;

      return collegeId === formData.collegeId;
    });
  }, [AllCourses, formData.collegeId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCourseChange = (e) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setFormData((prev) => ({
      ...prev,
      courseIds: values,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.collegeId) {
      return alert("Please select a college.");
    }

    if (formData.courseIds.length === 0) {
      return alert("Please select at least one course.");
    }

    if (!formData.startDate || !formData.endDate) {
      return alert("Please select session dates.");
    }

    try {
      setLoading(true);

      await createSession(formData, token);

      alert("Session created successfully.");

      onBack();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-session-page">
      <button onClick={onBack}>← Back</button>

      <h2>Create Session</h2>

      <div className="session-form">

        <div className="form-group">
          <label>College</label>

          <select
            value={formData.collegeId}
            onChange={(e) => {
              setFormData({
                ...formData,
                collegeId: e.target.value,
                courseIds: [],
              });
            }}
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
          <label>Courses</label>

          <select
            multiple
            size={Math.min(availableCourses.length || 1, 6)}
            value={formData.courseIds}
            onChange={handleCourseChange}
          >
            {availableCourses.map((course) => (
              <option
                key={course._id}
                value={course._id}
              >
                {course.courseCode}
              </option>
            ))}
          </select>

          <small>
            Hold Ctrl (Windows/Linux) or Cmd (Mac) to select multiple
            courses.
          </small>
        </div>

        <div className="form-group">
          <label>Start Date</label>

          <input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              handleChange("startDate", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>End Date</label>

          <input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              handleChange("endDate", e.target.value)
            }
          />
        </div>

        <button
          className="save-btn"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Creating..." : "Create Session"}
        </button>

      </div>
    </div>
  );
}