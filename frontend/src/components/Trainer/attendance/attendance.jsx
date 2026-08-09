// AttendanceWorkspace.jsx
import { useEffect, useMemo, useState } from "react";
import "./attendance.css";

function getStudentId(student) {
  return student?._id || student?.id || student?.studentId || "";
}

function getStudentName(student) {
  return (
    student?.name ||
    student?.fullName ||
    student?.studentName ||
    student?.email ||
    "Unnamed Student"
  );
}

function getStudentRoll(student, index) {
  return (
    student?.rollNo ||
    student?.rollNumber ||
    student?.roll ||
    student?.enrollmentNo ||
    `${index + 1}`
  );
}

function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AttendanceWorkspace({
  slot,
  students = [],
  token,
  onBack,
  onSuccess,
  submitAttendance,
  // setselectedcourse,
}) {
  const [attendanceMap, setAttendanceMap] = useState({});
  const [feedback, setFeedback] = useState(slot?.feedback || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   const nextMap = {};
  //   const presentSet = new Set((slot?.presentStudents || []).map(String));

  //   for (const student of students) {
  //     const id = getStudentId(student);
  //     if (!id) continue;
  //     nextMap[id] = presentSet.has(String(id));
  //   }

  //   setAttendanceMap(nextMap);
  //   setFeedback(slot?.feedback || "");
  //   setSearch("");
  //   setError("");
  // }, [slot, students]);

  useEffect(() => {
  const nextMap = {};
  const presentSet = new Set((slot?.presentStudents || []).map(String));

  // Set the selected course from the slot
  // if (slot?.courseId?._id) {
  //   setselectedcourse(slot.courseId._id);
  //   console.log(slot.courseId._id)
  // }

  for (const student of students) {
    const id = getStudentId(student);
    if (!id) continue;
    nextMap[id] = presentSet.has(String(id));
  }

  setAttendanceMap(nextMap);
  setFeedback(slot?.feedback || "");
  setSearch("");
  setError("");
}, [slot, students]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredStudents = useMemo(() => {
    const list = students.map((student, index) => {
      const id = getStudentId(student);
      const name = getStudentName(student);
      const roll = getStudentRoll(student, index);
      const email = student?.email || "";

      return {
        student,
        id,
        name,
        roll,
        email,
        isPresent: Boolean(attendanceMap[id]),
      };
    });

    if (!normalizedSearch) return list;

    return list.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedSearch) ||
        String(item.roll).toLowerCase().includes(normalizedSearch) ||
        item.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [students, attendanceMap, normalizedSearch]);

  const presentCount = useMemo(() => {
    return Object.values(attendanceMap).filter(Boolean).length;
  }, [attendanceMap]);

  const totalCount = students.length;
  const attendancePercent =
    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  function toggleStudent(studentId) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  }

  function markAll(value) {
    const next = {};
    for (const student of students) {
      const id = getStudentId(student);
      if (id) next[id] = value;
    }
    setAttendanceMap(next);
  }

  function invertSelection() {
    setAttendanceMap((prev) => {
      const next = {};
      for (const student of students) {
        const id = getStudentId(student);
        if (!id) continue;
        next[id] = !Boolean(prev[id]);
      }
      return next;
    });
  }

  function clearSearch() {
    setSearch("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!slot?._id) {
      setError("Slot data is missing.");
      return;
    }

    setLoading(true);

    try {
      const presentStudents = students
        .map(getStudentId)
        .filter((id) => Boolean(id) && attendanceMap[id]);

      const updated = await submitAttendance(
        slot._id,
        {
          presentStudents,
          feedback,
        },
        token
      );

      if (onSuccess) onSuccess(updated);
      if (onBack) onBack();
    } catch (err) {
      setError(err?.message || "Failed to submit attendance");
    } finally {
      setLoading(false);
    }
  }

  if (!slot) return null;

  const courseCode =
    slot?.courseId?.courseCode ||
    slot?.courseId?.name ||
    slot?.courseCode ||
    "Slot";

  const slotDate = slot?.date ? new Date(slot.date) : null;
  const dateLabel = slotDate
    ? slotDate.toLocaleDateString()
    : "-";

  const timeLabel =
    slot?.startTime && slot?.endTime
      ? `${slot.startTime} - ${slot.endTime}`
      : slot?.time || "-";

  return (
    <div className="attendance-workspace-overlay" onClick={onBack}>
      {/* <pre>{JSON.stringify(students, null, 2)}</pre> */}
      <div
        className="attendance-workspace"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Attendance workspace"
      >
        <form className="attendance-workspace-form" onSubmit={handleSubmit}>
          <div className="attendance-workspace-header">
            <div className="attendance-workspace-titleBlock">
              <div className="attendance-workspace-kicker">Mark Attendance</div>
              <h2 className="attendance-workspace-title">{courseCode}</h2>
              <div className="attendance-workspace-meta">
                <span>{dateLabel}</span>
                <span>•</span>
                <span>{timeLabel}</span>
                {slot?.topic ? (
                  <>
                    <span>•</span>
                    <span>{slot.topic}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="attendance-workspace-summary">
              <div className="attendance-summary-card">
                <span className="attendance-summary-label">Present</span>
                <strong>
                  {presentCount} / {totalCount}
                </strong>
              </div>

              <div className="attendance-summary-card">
                <span className="attendance-summary-label">Attendance</span>
                <strong>{attendancePercent}%</strong>
              </div>
            </div>
          </div>

          <div className="attendance-workspace-toolbar">
            <div className="attendance-searchWrap">
              <span className="attendance-searchIcon">⌕</span>
              <input
                className="attendance-searchInput"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, roll number, or email"
              />
              {search ? (
                <button
                  type="button"
                  className="attendance-clearSearch"
                  onClick={clearSearch}
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="attendance-toolbarActions">
              <button
                type="button"
                className="attendance-actionBtn success"
                onClick={() => markAll(true)}
                disabled={loading}
              >
                All Present
              </button>
              <button
                type="button"
                className="attendance-actionBtn danger"
                onClick={() => markAll(false)}
                disabled={loading}
              >
                All Absent
              </button>
              <button
                type="button"
                className="attendance-actionBtn neutral"
                onClick={invertSelection}
                disabled={loading}
              >
                Invert
              </button>
            </div>
          </div>

          {error ? <div className="attendance-error">{error}</div> : null}

          <div className="attendance-listPanel">
            <div className="attendance-listHeader">
              <span>Student</span>
              <span>Status</span>
            </div>

            <div className="attendance-listScroll">
              {filteredStudents.length === 0 ? (
                <div className="attendance-emptyState">
                  No students match your search.
                </div>
              ) : (
                filteredStudents.map(({ student, id, name, roll, isPresent }) => (
                  <div
                    key={id}
                    className={`attendance-studentRow ${
                      isPresent ? "present" : "absent"
                    }`}
                  >
                    <div className="attendance-studentInfo">
                      {/* <div className="attendance-avatar">
                        {getInitials(name)}
                      </div> */}

                      <div className="attendance-studentText">
                        <div className="attendance-studentTopline">
                          <span className="attendance-roll">#{roll}</span>
                          <span className="attendance-studentName">{name}</span>
                        </div>
                        <div className="attendance-studentSubline">
                          {student?.email || "No email"}
                        </div>
                      </div>
                    </div>

                    <div className="attendance-statusArea">
                      <button
                        type="button"
                        className={`attendance-statusToggle ${
                          isPresent ? "present" : "absent"
                        }`}
                        onClick={() => toggleStudent(id)}
                        disabled={loading}
                        aria-pressed={isPresent}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="attendance-feedbackSection">
            <label className="attendance-feedbackLabel" htmlFor="feedback">
              Feedback
            </label>
            <textarea
              id="feedback"
              className="attendance-feedbackInput"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add remarks, topic covered, student concerns, or homework..."
              disabled={loading}
            />
          </div>

          <div className="attendance-workspaceFooter">
            <button
              type="button"
              className="attendance-footerBtn secondary"
              onClick={onBack}
              disabled={loading}
            >
              Cancel
            </button>

            <div className="attendance-footerRight">
              <div className="attendance-liveCount">
                {presentCount} present · {totalCount - presentCount} absent
              </div>

              <button
                type="submit"
                className="attendance-footerBtn primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}








// import { useState } from "react";
// // import { submitAttendance } from "../../services/dashboardapi";

// // import "./attendance.css";

// export default function AttendanceModal({
//   slot,
//   students = [],
//   token,
//   onBack,
//   onSuccess,
//   submitAttendance,
// }) {
//   const [presentStudents, setPresentStudents] = useState(
//     slot?.presentStudents || []
//   );
//   const [feedback, setFeedback] = useState(slot?.feedback || "");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   function toggleStudent(studentId) {
//     setPresentStudents((prev) =>
//       prev.includes(studentId)
//         ? prev.filter((id) => id !== studentId)
//         : [...prev, studentId]
//     );
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const updated = await submitAttendance(
//         slot._id,
//         { presentStudents, feedback },
//         token
//       );

//       if (onSuccess) {
//         onSuccess(updated);
//       }

//       onBack();
//     } catch (err) {
//       setError(err.message || "Failed to submit attendance");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (!slot) return null;

//   return (
//     <div className="modal-overlay" onClick={onBack}>
//       <div
//         className="modal-content flat-card"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <h3>Mark Attendance</h3>

//         <p className="modal-subtitle">
//           {slot.courseId?.courseCode || "Slot"}
//           {" · "}
//           {slot.date ? new Date(slot.date).toLocaleDateString() : "-"}
//         </p>

//         {error && <div className="error">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <label>Present Students</label>

//           <div className="student-list">
//             {students.map((student) => (
//               <label key={student._id} className="student-checkbox">
//                 <input
//                   type="checkbox"
//                   checked={presentStudents.includes(student._id)}
//                   onChange={() => toggleStudent(student._id)}
//                   disabled={loading}
//                 />
//                 {student.name}
//               </label>
//             ))}
//           </div>

//           <label htmlFor="feedback">Feedback</label>

//           <textarea
//             id="feedback"
//             rows={4}
//             value={feedback}
//             onChange={(e) => setFeedback(e.target.value)}
//             placeholder="Enter feedback"
//             disabled={loading}
//           />

//           <div className="modal-actions">
//             <button
//               type="button"
//               className="btn-secondary"
//               onClick={onBack}
//               disabled={loading}
//             >
//               Cancel
//             </button>

//             <button type="submit" className="btn-primary" disabled={loading}>
//               {loading ? "Saving..." : "Save"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }










// // import { useState } from "react";
// // // import { submitAttendance } from "../services/slotService"; // adjust path

// // export default function AttendanceForm({ 
// //   slotId, 
// //   students = [], 
// //   token, 
// //   onSuccess, 
// //   submitAttendance
// // }) {
// //   const [presentStudents, setPresentStudents] = useState([]);
// //   const [feedback, setFeedback] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);

// //   const toggleStudent = (studentId) => {
// //     setPresentStudents((prev) =>
// //       prev.includes(studentId)
// //         ? prev.filter((id) => id !== studentId)
// //         : [...prev, studentId]
// //     );
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError(null);
// //     setLoading(true);

// //     try {
// //       const data = { presentStudents, feedback };
// //       const updatedSlot = await submitAttendance(slotId, data, token);
// //       onSuccess?.(updatedSlot);
// //     } catch (err) {
// //       setError(err.message || "Failed to submit attendance");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="flat-card attendance-form">
// //       <h3>Mark Attendance</h3>

// //       {error && <div className="form-error">{error}</div>}

// //       <div className="student-list">
// //         {students.map((student) => (
// //           <label key={student._id} className="student-checkbox">
// //             <input
// //               type="checkbox"
// //               checked={presentStudents.includes(student._id)}
// //               onChange={() => toggleStudent(student._id)}
// //               disabled={loading}
// //             />
// //             {student.name}
// //           </label>
// //         ))}
// //       </div>

// //       <textarea
// //         placeholder="Feedback (optional)"
// //         value={feedback}
// //         onChange={(e) => setFeedback(e.target.value)}
// //         disabled={loading}
// //         rows={4}
// //       />

// //       <button type="submit" disabled={loading}>
// //         {loading ? "Submitting..." : "Submit Attendance"}
// //       </button>
// //     </form>
// //   );
// // }