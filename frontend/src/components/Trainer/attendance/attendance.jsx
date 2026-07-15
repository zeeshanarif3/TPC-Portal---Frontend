import { useState } from "react";
// import { submitAttendance } from "../../services/dashboardapi";

// import "./attendance.css";

export default function AttendanceModal({
  slot,
  students = [],
  token,
  onBack,
  onSuccess,
  submitAttendance,
}) {
  const [presentStudents, setPresentStudents] = useState(
    slot?.presentStudents || []
  );
  const [feedback, setFeedback] = useState(slot?.feedback || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleStudent(studentId) {
    setPresentStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updated = await submitAttendance(
        slot._id,
        { presentStudents, feedback },
        token
      );

      if (onSuccess) {
        onSuccess(updated);
      }

      onBack();
    } catch (err) {
      setError(err.message || "Failed to submit attendance");
    } finally {
      setLoading(false);
    }
  }

  if (!slot) return null;

  return (
    <div className="modal-overlay" onClick={onBack}>
      <div
        className="modal-content flat-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Mark Attendance</h3>

        <p className="modal-subtitle">
          {slot.courseId?.courseCode || "Slot"}
          {" · "}
          {slot.date ? new Date(slot.date).toLocaleDateString() : "-"}
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Present Students</label>

          <div className="student-list">
            {students.map((student) => (
              <label key={student._id} className="student-checkbox">
                <input
                  type="checkbox"
                  checked={presentStudents.includes(student._id)}
                  onChange={() => toggleStudent(student._id)}
                  disabled={loading}
                />
                {student.name}
              </label>
            ))}
          </div>

          <label htmlFor="feedback">Feedback</label>

          <textarea
            id="feedback"
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter feedback"
            disabled={loading}
          />

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onBack}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}










// import { useState } from "react";
// // import { submitAttendance } from "../services/slotService"; // adjust path

// export default function AttendanceForm({ 
//   slotId, 
//   students = [], 
//   token, 
//   onSuccess, 
//   submitAttendance
// }) {
//   const [presentStudents, setPresentStudents] = useState([]);
//   const [feedback, setFeedback] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const toggleStudent = (studentId) => {
//     setPresentStudents((prev) =>
//       prev.includes(studentId)
//         ? prev.filter((id) => id !== studentId)
//         : [...prev, studentId]
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const data = { presentStudents, feedback };
//       const updatedSlot = await submitAttendance(slotId, data, token);
//       onSuccess?.(updatedSlot);
//     } catch (err) {
//       setError(err.message || "Failed to submit attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flat-card attendance-form">
//       <h3>Mark Attendance</h3>

//       {error && <div className="form-error">{error}</div>}

//       <div className="student-list">
//         {students.map((student) => (
//           <label key={student._id} className="student-checkbox">
//             <input
//               type="checkbox"
//               checked={presentStudents.includes(student._id)}
//               onChange={() => toggleStudent(student._id)}
//               disabled={loading}
//             />
//             {student.name}
//           </label>
//         ))}
//       </div>

//       <textarea
//         placeholder="Feedback (optional)"
//         value={feedback}
//         onChange={(e) => setFeedback(e.target.value)}
//         disabled={loading}
//         rows={4}
//       />

//       <button type="submit" disabled={loading}>
//         {loading ? "Submitting..." : "Submit Attendance"}
//       </button>
//     </form>
//   );
// }