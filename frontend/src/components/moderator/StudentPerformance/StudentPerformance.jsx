import { useState, useMemo } from "react";
import { useDashboard } from "../../../hooks/useDashboard";
import "./StudentPerformance.css";

const StudentPerformancePage = ({ token }) => {
  const {
    Allstudents = [],
    StudentPerformance,
    getStuPerformance,
  } = useDashboard(token);

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  // ---- derive course list from students ----
  const courses = useMemo(() => {
    const map = new Map();
    Allstudents.forEach((s) => {
      const c = s.courseId;
      if (c?._id && !map.has(c._id)) map.set(c._id, c.courseCode);
    });
    return Array.from(map, ([id, code]) => ({ id, code }));
  }, [Allstudents]);

  // ---- filtered student list ----
  const filteredStudents = useMemo(() => {
    return Allstudents.filter((s) => {
      const matchesCourse =
        selectedCourse === "all" || s.courseId?._id === selectedCourse;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.rollNumber?.toLowerCase().includes(q);
      return matchesCourse && matchesSearch;
    });
  }, [Allstudents, selectedCourse, search]);

  // The performance endpoint looks up by the account/user id, not the
  // student profile's own _id — always prefer userId when available.
  const getLookupId = (student) => student?.userId || student?._id;

  const selectedStudent = Allstudents.find(
    (s) => s._id === selectedStudentId
  );

  const handleSelectStudent = async (student) => {
    const stuId = student._id;
    const lookupId = getLookupId(student);
    setSelectedStudentId(stuId);
    setLoadingId(stuId);
    setError(null);
    try {
      await getStuPerformance(lookupId);
    } catch (err) {
      setError("Failed to load performance data.");
    } finally {
      setLoadingId(null);
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const renderStars = (rating = 0) => (
    <span className="sp-stars" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "sp-star sp-star--filled" : "sp-star"}>
          ★
        </span>
      ))}
    </span>
  );

  const perf = StudentPerformance && Object.keys(StudentPerformance).length
    ? StudentPerformance
    : null;

  const isLoadingSelected = loadingId === selectedStudentId;

  return (
      <div className="sp-page">
      {/* ---------- Header / Filters ---------- */}
      <div className="sp-header">
        <div className="sp-header-titles">
          <h1 className="sp-title">Student Performance</h1>
          <p className="sp-subtitle">
            {filteredStudents.length} of {Allstudents.length} students
          </p>
        </div>

        <div className="sp-filters">
            {/* <pre>{JSON.stringify(StudentPerformance, null, 2)}</pre> */}
          <div className="sp-search-wrap">
            <svg className="sp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="sp-search"
              type="text"
              placeholder="Search by name or roll no."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              />
          </div>

          <select
            className="sp-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            >
            <option value="all">All Courses</option>
            {courses.map((c) => (
                <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sp-layout">
        {/* ---------- Student list ---------- */}
        <div className="sp-list-panel">
          {filteredStudents.length === 0 ? (
            <div className="sp-empty">No students match this filter.</div>
          ) : (
            <ul className="sp-list">
              {filteredStudents.map((s) => (
                <li key={s._id}>
                  <button
                    className={
                      "sp-list-item" +
                      (s._id === selectedStudentId ? " sp-list-item--active" : "")
                    }
                    onClick={() => handleSelectStudent(s)}
                  >
                    <div className="sp-avatar">{s.name?.charAt(0) || "?"}</div>
                    <div className="sp-list-item-info">
                      <span className="sp-list-item-name">{s.name}</span>
                      <span className="sp-list-item-meta">
                        Roll {s.rollNumber} · {s.courseId?.courseCode}
                      </span>
                    </div>
                    {loadingId === s._id && (
                      <span className="sp-mini-spinner" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------- Detail panel ---------- */}
        <div className="sp-detail-panel">
          {!selectedStudent && (
            <div className="sp-empty sp-empty--center">
              Select a student to view performance details.
            </div>
          )}

          {selectedStudent && isLoadingSelected && (
            <div className="sp-empty sp-empty--center">
              <span className="sp-spinner" aria-hidden="true" />
              Loading performance…
            </div>
          )}

          {selectedStudent && !isLoadingSelected && error && (
            <div className="sp-empty sp-empty--center sp-error">{error}</div>
          )}

          {selectedStudent && !isLoadingSelected && !error && perf && (
            <>
              <div className="sp-detail-header">
                <div className="sp-avatar sp-avatar--lg">
                  {selectedStudent.name?.charAt(0) || "?"}
                </div>
                <div>
                  <h2 className="sp-detail-name">{selectedStudent.name}</h2>
                  <p className="sp-detail-meta">
                    Roll {selectedStudent.rollNumber} ·{" "}
                    {selectedStudent.courseId?.courseCode} · {selectedStudent.email}
                  </p>
                </div>
              </div>

              {/* Stat cards */}
              <div className="sp-stats-grid">
                <div className="sp-stat-card">
                  <span className="sp-stat-label">Attendance</span>
                  <span className="sp-stat-value">
                    {perf.attendance?.percentage ?? 0}%
                  </span>
                  <span className="sp-stat-sub">
                    {perf.attendance?.present ?? 0}/{perf.attendance?.totalClasses ?? 0} classes
                  </span>
                </div>
                <div className="sp-stat-card">
                  <span className="sp-stat-label">Avg. Score</span>
                  <span className="sp-stat-value">
                    {perf.assessments?.averageScorePercent ?? 0}%
                  </span>
                  <span className="sp-stat-sub">
                    {perf.assessments?.totalAttempted ?? 0} attempted
                  </span>
                </div>
                <div className="sp-stat-card">
                  <span className="sp-stat-label">Best Score</span>
                  <span className="sp-stat-value">
                    {perf.assessments?.bestScorePercent ?? 0}%
                  </span>
                  <span className="sp-stat-sub">personal best</span>
                </div>
              </div>

              {/* Attendance breakdown */}
              <section className="sp-section">
                <h3 className="sp-section-title">Attendance Breakdown</h3>
                <div className="sp-attendance-bar">
                  <div
                    className="sp-attendance-bar-fill sp-fill--present"
                    style={{
                      width: `${
                        perf.attendance?.totalClasses
                          ? (perf.attendance.present / perf.attendance.totalClasses) * 100
                          : 0
                      }%`,
                    }}
                  />
                  <div
                    className="sp-attendance-bar-fill sp-fill--late"
                    style={{
                      width: `${
                        perf.attendance?.totalClasses
                          ? (perf.attendance.late / perf.attendance.totalClasses) * 100
                          : 0
                      }%`,
                    }}
                  />
                  <div
                    className="sp-attendance-bar-fill sp-fill--absent"
                    style={{
                      width: `${
                        perf.attendance?.totalClasses
                          ? (perf.attendance.absent / perf.attendance.totalClasses) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="sp-legend">
                  <span><i className="sp-dot sp-dot--present" />Present ({perf.attendance?.present ?? 0})</span>
                  <span><i className="sp-dot sp-dot--late" />Late ({perf.attendance?.late ?? 0})</span>
                  <span><i className="sp-dot sp-dot--absent" />Absent ({perf.attendance?.absent ?? 0})</span>
                </div>
              </section>

              {/* Assessment submissions */}
              {Array.isArray(perf.assessments?.submissions) &&
                perf.assessments.submissions.length > 0 && (
                  <section className="sp-section">
                    <h3 className="sp-section-title">Assessment Submissions</h3>
                    <ul className="sp-submission-list">
                      {perf.assessments.submissions.map((sub, i) => (
                        <li key={sub._id || i} className="sp-submission-item">
                          <span className="sp-submission-name">
                            {sub.title || sub.assessmentTitle || `Assessment ${i + 1}`}
                          </span>
                          <span className="sp-submission-score">
                            {sub.percentageScore ?? sub.score ?? "—"}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

              {/* Feedback */}
              <section className="sp-section">
                <h3 className="sp-section-title">Trainer Feedback</h3>
                {Array.isArray(perf.feedback) && perf.feedback.length > 0 ? (
                  <ul className="sp-feedback-list">
                    {perf.feedback.map((f) => (
                      <li key={f._id} className="sp-feedback-item">
                        <div className="sp-feedback-top">
                          {renderStars(f.rating)}
                          <span className="sp-feedback-date">{fmtDate(f.date)}</span>
                        </div>
                        <p className="sp-feedback-comment">{f.comments}</p>
                        <span className="sp-feedback-trainer">
                          {f.trainer?.name || "Trainer"}
                          {f.class?.title ? ` · ${f.class.title}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="sp-empty-inline">No feedback recorded yet.</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPerformancePage;



// import { useState, useMemo } from "react";
// import { useDashboard } from "../../../hooks/useDashboard";
// import "./StudentPerformance.css";

// const StudentPerformancePage = ({ token }) => {
//   const {
//     Allstudents = [],
//     StudentPerformance,
//     getStuPerformance,
//   } = useDashboard(token);

//   const [selectedCourse, setSelectedCourse] = useState("all");
//   const [search, setSearch] = useState("");
//   const [selectedStudentId, setSelectedStudentId] = useState(null);
//   const [loadingId, setLoadingId] = useState(null);
//   const [error, setError] = useState(null);

//   // ---- derive course list from students ----
//   const courses = useMemo(() => {
//     const map = new Map();
//     Allstudents.forEach((s) => {
//       const c = s.courseId;
//       if (c?._id && !map.has(c._id)) map.set(c._id, c.courseCode);
//     });
//     return Array.from(map, ([id, code]) => ({ id, code }));
//   }, [Allstudents]);

//   // ---- filtered student list ----
//   const filteredStudents = useMemo(() => {
//     return Allstudents.filter((s) => {
//       const matchesCourse =
//         selectedCourse === "all" || s.courseId?._id === selectedCourse;
//       const q = search.trim().toLowerCase();
//       const matchesSearch =
//         !q ||
//         s.name?.toLowerCase().includes(q) ||
//         s.rollNumber?.toLowerCase().includes(q);
//       return matchesCourse && matchesSearch;
//     });
//   }, [Allstudents, selectedCourse, search]);

//   const selectedStudent = Allstudents.find((s) => s._id === selectedStudentId);

//   const handleSelectStudent = async (stuId) => {
//     setSelectedStudentId(stuId);
//     setLoadingId(stuId);
//     setError(null);
//     try {
//         console.log(stuId);
//       await getStuPerformance(stuId);
//     } catch (err) {
//       setError("Failed to load performance data.");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const fmtDate = (d) =>
//     d
//       ? new Date(d).toLocaleDateString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         })
//       : "—";

//   const renderStars = (rating = 0) => (
//     <span className="sp-stars" aria-label={`${rating} out of 5`}>
//       {Array.from({ length: 5 }).map((_, i) => (
//         <span key={i} className={i < rating ? "sp-star sp-star--filled" : "sp-star"}>
//           ★
//         </span>
//       ))}
//     </span>
//   );

//   const perf = StudentPerformance && Object.keys(StudentPerformance).length
//     ? StudentPerformance
//     : null;

//   const isLoadingSelected = loadingId === selectedStudentId;

//   return (
//     <div className="sp-page">
//         <pre>{JSON.stringify(Allstudents, null, 2)}</pre>
//       {/* ---------- Header / Filters ---------- */}
//       <div className="sp-header">
//         <div className="sp-header-titles">
//           <h1 className="sp-title">Student Performance</h1>
//           <p className="sp-subtitle">
//             {filteredStudents.length} of {Allstudents.length} students
//           </p>
//         </div>

//         <div className="sp-filters">
//           <div className="sp-search-wrap">
//             <svg className="sp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
//               <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
//               <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//             </svg>
//             <input
//               className="sp-search"
//               type="text"
//               placeholder="Search by name or roll no."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>

//           <select
//             className="sp-select"
//             value={selectedCourse}
//             onChange={(e) => setSelectedCourse(e.target.value)}
//           >
//             <option value="all">All Courses</option>
//             {courses.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.code}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="sp-layout">
//         {/* ---------- Student list ---------- */}
//         <div className="sp-list-panel">
//           {filteredStudents.length === 0 ? (
//             <div className="sp-empty">No students match this filter.</div>
//           ) : (
//             <ul className="sp-list">
//               {filteredStudents.map((s) => (
//                 <li key={s._id}>
//                   <button
//                     className={
//                       "sp-list-item" +
//                       (s._id === selectedStudentId ? " sp-list-item--active" : "")
//                     }
//                     onClick={() => handleSelectStudent(s._id)}
//                   >
//                     <div className="sp-avatar">{s.name?.charAt(0) || "?"}</div>
//                     <div className="sp-list-item-info">
//                       <span className="sp-list-item-name">{s.name}</span>
//                       <span className="sp-list-item-meta">
//                         Roll {s.rollNumber} · {s.courseId?.courseCode}
//                       </span>
//                     </div>
//                     {loadingId === s._id && (
//                       <span className="sp-mini-spinner" aria-hidden="true" />
//                     )}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* ---------- Detail panel ---------- */}
//         <div className="sp-detail-panel">
//           {!selectedStudent && (
//             <div className="sp-empty sp-empty--center">
//               Select a student to view performance details.
//             </div>
//           )}

//           {selectedStudent && isLoadingSelected && (
//             <div className="sp-empty sp-empty--center">
//               <span className="sp-spinner" aria-hidden="true" />
//               Loading performance…
//             </div>
//           )}

//           {selectedStudent && !isLoadingSelected && error && (
//             <div className="sp-empty sp-empty--center sp-error">{error}</div>
//           )}

//           {selectedStudent && !isLoadingSelected && !error && perf && (
//             <>
//               <div className="sp-detail-header">
//                 <div className="sp-avatar sp-avatar--lg">
//                   {selectedStudent.name?.charAt(0) || "?"}
//                 </div>
//                 <div>
//                   <h2 className="sp-detail-name">{selectedStudent.name}</h2>
//                   <p className="sp-detail-meta">
//                     Roll {selectedStudent.rollNumber} ·{" "}
//                     {selectedStudent.courseId?.courseCode} · {selectedStudent.email}
//                   </p>
//                 </div>
//               </div>

//               {/* Stat cards */}
//               <div className="sp-stats-grid">
//                 <div className="sp-stat-card">
//                   <span className="sp-stat-label">Attendance</span>
//                   <span className="sp-stat-value">
//                     {perf.attendance?.percentage ?? 0}%
//                   </span>
//                   <span className="sp-stat-sub">
//                     {perf.attendance?.present ?? 0}/{perf.attendance?.totalClasses ?? 0} classes
//                   </span>
//                 </div>
//                 <div className="sp-stat-card">
//                   <span className="sp-stat-label">Avg. Score</span>
//                   <span className="sp-stat-value">
//                     {perf.assessments?.averageScorePercent ?? 0}%
//                   </span>
//                   <span className="sp-stat-sub">
//                     {perf.assessments?.totalAttempted ?? 0} attempted
//                   </span>
//                 </div>
//                 <div className="sp-stat-card">
//                   <span className="sp-stat-label">Best Score</span>
//                   <span className="sp-stat-value">
//                     {perf.assessments?.bestScorePercent ?? 0}%
//                   </span>
//                   <span className="sp-stat-sub">personal best</span>
//                 </div>
//               </div>

//               {/* Attendance breakdown */}
//               <section className="sp-section">
//                 <h3 className="sp-section-title">Attendance Breakdown</h3>
//                 <div className="sp-attendance-bar">
//                   <div
//                     className="sp-attendance-bar-fill sp-fill--present"
//                     style={{
//                       width: `${
//                         perf.attendance?.totalClasses
//                           ? (perf.attendance.present / perf.attendance.totalClasses) * 100
//                           : 0
//                       }%`,
//                     }}
//                   />
//                   <div
//                     className="sp-attendance-bar-fill sp-fill--late"
//                     style={{
//                       width: `${
//                         perf.attendance?.totalClasses
//                           ? (perf.attendance.late / perf.attendance.totalClasses) * 100
//                           : 0
//                       }%`,
//                     }}
//                   />
//                   <div
//                     className="sp-attendance-bar-fill sp-fill--absent"
//                     style={{
//                       width: `${
//                         perf.attendance?.totalClasses
//                           ? (perf.attendance.absent / perf.attendance.totalClasses) * 100
//                           : 0
//                       }%`,
//                     }}
//                   />
//                 </div>
//                 <div className="sp-legend">
//                   <span><i className="sp-dot sp-dot--present" />Present ({perf.attendance?.present ?? 0})</span>
//                   <span><i className="sp-dot sp-dot--late" />Late ({perf.attendance?.late ?? 0})</span>
//                   <span><i className="sp-dot sp-dot--absent" />Absent ({perf.attendance?.absent ?? 0})</span>
//                 </div>
//               </section>

//               {/* Assessment submissions */}
//               {Array.isArray(perf.assessments?.submissions) &&
//                 perf.assessments.submissions.length > 0 && (
//                   <section className="sp-section">
//                     <h3 className="sp-section-title">Assessment Submissions</h3>
//                     <ul className="sp-submission-list">
//                       {perf.assessments.submissions.map((sub, i) => (
//                         <li key={sub._id || i} className="sp-submission-item">
//                           <span className="sp-submission-name">
//                             {sub.title || sub.assessmentTitle || `Assessment ${i + 1}`}
//                           </span>
//                           <span className="sp-submission-score">
//                             {sub.scorePercent ?? sub.score ?? "—"}%
//                           </span>
//                         </li>
//                       ))}
//                     </ul>
//                   </section>
//                 )}

//               {/* Feedback */}
//               <section className="sp-section">
//                 <h3 className="sp-section-title">Trainer Feedback</h3>
//                 {Array.isArray(perf.feedback) && perf.feedback.length > 0 ? (
//                   <ul className="sp-feedback-list">
//                     {perf.feedback.map((f) => (
//                       <li key={f._id} className="sp-feedback-item">
//                         <div className="sp-feedback-top">
//                           {renderStars(f.rating)}
//                           <span className="sp-feedback-date">{fmtDate(f.date)}</span>
//                         </div>
//                         <p className="sp-feedback-comment">{f.comments}</p>
//                         <span className="sp-feedback-trainer">
//                           {f.trainer?.name || "Trainer"}
//                           {f.class?.title ? ` · ${f.class.title}` : ""}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="sp-empty-inline">No feedback recorded yet.</p>
//                 )}
//               </section>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentPerformancePage;





// // import { useEffect, useMemo, useState } from "react";
// // import { useDashboard } from "../../../hooks/useDashboard";
// // import {
// //     Award,
// //     BookOpen,
// //     CalendarDays,
// //     ClipboardCheck,
// //     MessageSquare,
// //     TrendingUp,
// //     User,
// //     Star,
// //     Search,
// //     ChevronDown,
// //     Mail,
// //     BadgeInfo,
// //     GraduationCap,
// //     Hash,
// // } from "lucide-react";

// // import {
// //     ResponsiveContainer,
// //     LineChart,
// //     Line,
// //     CartesianGrid,
// //     XAxis,
// //     YAxis,
// //     Tooltip,
// // } from "recharts";

// // import "./StudentPerformance.css";

// // export default function StudentPerformance({ token }) {
// //     const {
// //         Allstudents = [],
// //         StudentPerformance,
// //         getStuPerformance,
// //     } = useDashboard(token);

// //     const [search, setSearch] = useState("");
// //     const [selectedStudentId, setSelectedStudentId] = useState("");

// //     useEffect(() => {
// //         if (!selectedStudentId && Allstudents.length > 0) {
// //             setSelectedStudentId(Allstudents[0].userId || Allstudents[0]._id || "");
// //         }
// //     }, [Allstudents, selectedStudentId]);

// //     useEffect(() => {
// //         if (selectedStudentId) {
// //             getStuPerformance(selectedStudentId);
// //         }
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, [selectedStudentId]);

// //     const filteredStudents = useMemo(() => {
// //         const q = search.trim().toLowerCase();

// //         if (!q) return Allstudents;

// //         return Allstudents.filter((student) => {
// //             const name = student?.name?.toLowerCase() || "";
// //             const roll = student?.rollNumber?.toLowerCase() || "";
// //             const email = student?.email?.toLowerCase() || "";
// //             const course = student?.courseId?.courseCode?.toLowerCase() || "";
// //             const userId = student?.userId?.toLowerCase() || "";
// //             const id = student?._id?.toLowerCase() || "";

// //             return (
// //                 name.includes(q) ||
// //                 roll.includes(q) ||
// //                 email.includes(q) ||
// //                 course.includes(q) ||
// //                 userId.includes(q) ||
// //                 id.includes(q)
// //             );
// //         });
// //     }, [Allstudents, search]);

// //     // Keep selection in sync with the filtered list. If the currently
// //     // selected student is filtered out, fall back to the first visible one.
// //     useEffect(() => {
// //         if (filteredStudents.length === 0) return;

// //         const stillVisible = filteredStudents.some(
// //             (student) => (student.userId || student._id) === selectedStudentId
// //         );

// //         if (!stillVisible) {
// //             setSelectedStudentId(
// //                 filteredStudents[0].userId || filteredStudents[0]._id || ""
// //             );
// //         }
// //     }, [filteredStudents, selectedStudentId]);

// //     const selectedStudent = useMemo(() => {
// //         return (
// //             Allstudents.find((student) => student.userId === selectedStudentId) ||
// //             Allstudents.find((student) => student._id === selectedStudentId) ||
// //             null
// //         );
// //     }, [Allstudents, selectedStudentId]);

// //     const performanceData = StudentPerformance || {};

// //     const attendance = performanceData.attendance || {
// //         totalClasses: 0,
// //         present: 0,
// //         absent: 0,
// //         late: 0,
// //         percentage: 0,
// //     };

// //     const assessments = performanceData.assessments || {
// //         totalAttempted: 0,
// //         averageScorePercent: 0,
// //         bestScorePercent: 0,
// //         submissions: [],
// //     };

// //     const feedback = performanceData.feedback || [];

// //     const submissions = Array.isArray(assessments.submissions)
// //         ? assessments.submissions
// //         : [];

// //     // Backend field names for submissions aren't fully confirmed, so read
// //     // through a list of likely aliases for each value instead of assuming
// //     // one exact key exists.
// //     const pick = (obj, keys, fallback) => {
// //         for (const key of keys) {
// //             const val = obj?.[key];
// //             if (val !== undefined && val !== null && val !== "") return val;
// //         }
// //         return fallback;
// //     };

// //     const getTitle = (s) =>
// //         pick(s, ["assessmentTitle", "title", "name", "assessmentName"], "-");

// //     const getPercent = (s) =>
// //         Number(pick(s, ["scorePercent", "percentage", "percent", "scorePct"], 0));

// //     const getScore = (s) => pick(s, ["score", "marks", "marksObtained", "obtainedMarks"], 0);

// //     const getTotalMarks = (s) =>
// //         pick(s, ["totalMarks", "maxMarks", "outOf", "totalScore"], null);

// //     const getSubmittedDate = (s) =>
// //         pick(s, ["submittedAt", "date", "createdAt", "submissionDate"], null);

// //     const chartData = submissions.map((submission, index) => ({
// //         name: getTitle(submission) !== "-" ? getTitle(submission) : `A${index + 1}`,
// //         score: getPercent(submission),
// //     }));

// //     const initials = (name = "") =>
// //         name
// //             .split(" ")
// //             .filter(Boolean)
// //             .map((part) => part[0]?.toUpperCase())
// //             .join("")
// //             .slice(0, 2);

// //     const formatDate = (date) => {
// //         if (!date) return "-";
// //         const d = new Date(date);
// //         if (Number.isNaN(d.getTime())) return "-";
// //         return d.toLocaleDateString("en-IN", {
// //             day: "2-digit",
// //             month: "short",
// //             year: "numeric",
// //         });
// //     };

// //     // Distinguishes "not attempted" from "attempted and scored 0" by
// //     // checking for a submission timestamp instead of percent > 0.
// //     const formatStatus = (submission) => {
// //         if (submission?.status) {
// //             return String(submission.status)
// //                 .replace(/_/g, " ")
// //                 .replace(/\b\w/g, (ch) => ch.toUpperCase());
// //         }

// //         if (!getSubmittedDate(submission)) return "Pending";

// //         return getPercent(submission) >= 40 ? "Passed" : "Needs Review";
// //     };

// //     // Maps a status label to a badge class, covering both the labels this
// //     // component computes and arbitrary status strings from the backend.
// //     const statusClass = (status) => {
// //         const normalized = status.toLowerCase();
// //         if (["passed", "graded", "completed", "approved"].includes(normalized)) {
// //             return "is-pass";
// //         }
// //         if (["needs review", "failed", "rejected"].includes(normalized)) {
// //             return "is-fail";
// //         }
// //         return "";
// //     };

// //     const avgScore = Number(assessments.averageScorePercent ?? 0);
// //     const bestScore = Number(assessments.bestScorePercent ?? 0);
// //     const attendancePercent = Math.min(
// //         100,
// //         Math.max(0, Number(attendance.percentage ?? 0))
// //     );

// //     return (
// //         <div className="student-performance-page">
// //             <div className="sp-topbar">
// //                 <div className="sp-topbar-left">
// //                     <div>
// //                         <p className="sp-eyebrow">Student Analytics</p>
// //                         <h1>Student Performance</h1>
// //                         <span className="sp-subtitle">
// //                             Search, select, and review each student’s performance in one place.
// //                         </span>
// //                     </div>
// //                 </div>

// //                 <div className="sp-topbar-right">
// //                     <div className="sp-stat-pill">
// //                         <BadgeInfo size={16} />
// //                         <span>{Allstudents.length} Students</span>
// //                     </div>
// //                 </div>
// //             </div>

// //             <div className="sp-selector-panel">
// //                 <div className="sp-searchbox">
// //                     <Search size={18} />
// //                     <input
// //                         type="text"
// //                         placeholder="Search by name, roll number, email, course, or ID..."
// //                         value={search}
// //                         onChange={(e) => setSearch(e.target.value)}
// //                     />
// //                 </div>

// //                 <div className="sp-selectbox">
// //                     <GraduationCap size={18} />
// //                     <select
// //                         value={selectedStudentId}
// //                         onChange={(e) => setSelectedStudentId(e.target.value)}
// //                     >
// //                         {filteredStudents.length === 0 ? (
// //                             <option value="">No students found</option>
// //                         ) : (
// //                             filteredStudents.map((student) => {
// //                                 const value = student.userId || student._id;
// //                                 return (
// //                                     <option key={value} value={value}>
// //                                         {student.name} • {student.rollNumber} •{" "}
// //                                         {student.courseId?.courseCode || "No course"}
// //                                     </option>
// //                                 );
// //                             })
// //                         )}
// //                     </select>
// //                     <ChevronDown size={16} className="sp-select-chevron" />
// //                 </div>
// //             </div>

// //             {selectedStudent ? (
// //                 <div className="sp-profile-card">
// //                     <div className="sp-avatar">
// //                         {initials(selectedStudent.name)}
// //                     </div>

// //                     <div className="sp-profile-info">
// //                         <div className="sp-profile-head">
// //                             <div>
// //                                 <h2>{selectedStudent.name}</h2>
// //                                 <p>
// //                                     {selectedStudent.courseId?.courseCode ||
// //                                         "No course assigned"}
// //                                 </p>
// //                             </div>

// //                             <div className="sp-profile-tag">
// //                                 <Hash size={14} />
// //                                 Roll {selectedStudent.rollNumber}
// //                             </div>
// //                         </div>

// //                         <div className="sp-profile-grid">
// //                             <div className="sp-meta-item">
// //                                 <Mail size={16} />
// //                                 <div>
// //                                     <span>Email</span>
// //                                     <strong>{selectedStudent.email}</strong>
// //                                 </div>
// //                             </div>

// //                             <div className="sp-meta-item">
// //                                 <User size={16} />
// //                                 <div>
// //                                     <span>User ID</span>
// //                                     <strong>{selectedStudent.userId || selectedStudent._id}</strong>
// //                                 </div>
// //                             </div>

// //                             <div className="sp-meta-item">
// //                                 <CalendarDays size={16} />
// //                                 <div>
// //                                     <span>Date of Birth</span>
// //                                     <strong>{formatDate(selectedStudent.dob)}</strong>
// //                                 </div>
// //                             </div>

// //                             <div className="sp-meta-item">
// //                                 <BookOpen size={16} />
// //                                 <div>
// //                                     <span>Course</span>
// //                                     <strong>{selectedStudent.courseId?.courseCode || "-"}</strong>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             ) : (
// //                 <div className="sp-empty-state">
// //                     <div className="sp-empty-icon">
// //                         <User size={28} />
// //                     </div>
// //                     <h3>No student selected</h3>
// //                     <p>Choose a student from the dropdown to view performance details.</p>
// //                 </div>
// //             )}

// //             <div className="sp-summary-grid">
// //                 <div className="sp-summary-card">
// //                     <div className="sp-summary-icon accent-1">
// //                         <Award size={20} />
// //                     </div>
// //                     <div className="sp-summary-content">
// //                         <span>Average Score</span>
// //                         <h3>{avgScore}%</h3>
// //                     </div>
// //                 </div>

// //                 <div className="sp-summary-card">
// //                     <div className="sp-summary-icon accent-2">
// //                         <ClipboardCheck size={20} />
// //                     </div>
// //                     <div className="sp-summary-content">
// //                         <span>Attendance</span>
// //                         <h3>{attendancePercent}%</h3>
// //                     </div>
// //                 </div>

// //                 <div className="sp-summary-card">
// //                     <div className="sp-summary-icon accent-3">
// //                         <BookOpen size={20} />
// //                     </div>
// //                     <div className="sp-summary-content">
// //                         <span>Assessments</span>
// //                         <h3>{assessments.totalAttempted ?? 0}</h3>
// //                     </div>
// //                 </div>

// //                 <div className="sp-summary-card">
// //                     <div className="sp-summary-icon accent-4">
// //                         <Star size={20} />
// //                     </div>
// //                     <div className="sp-summary-content">
// //                         <span>Best Score</span>
// //                         <h3>{bestScore}%</h3>
// //                     </div>
// //                 </div>
// //             </div>

// //             <div className="sp-grid">
// //                 <section className="sp-panel sp-chart-panel">
// //                     <div className="sp-panel-head">
// //                         <div>
// //                             <p className="sp-panel-kicker">Trend</p>
// //                             <h3>Performance Overview</h3>
// //                         </div>
// //                         <TrendingUp size={18} />
// //                     </div>

// //                     {chartData.length > 0 ? (
// //                         <div className="sp-chart-wrap">
// //                             <ResponsiveContainer width="100%" height={300}>
// //                                 <LineChart data={chartData}>
// //                                     <CartesianGrid strokeDasharray="4 4" />
// //                                     <XAxis dataKey="name" />
// //                                     <YAxis />
// //                                     <Tooltip />
// //                                     <Line
// //                                         type="monotone"
// //                                         dataKey="score"
// //                                         strokeWidth={3}
// //                                         dot={{ r: 4 }}
// //                                     />
// //                                 </LineChart>
// //                             </ResponsiveContainer>
// //                         </div>
// //                     ) : (
// //                         <div className="sp-inline-empty">
// //                             No assessment data available.
// //                         </div>
// //                     )}
// //                 </section>

// //                 <section className="sp-panel sp-attendance-panel">
// //                     <div className="sp-panel-head">
// //                         <div>
// //                             <p className="sp-panel-kicker">Attendance</p>
// //                             <h3>Presence Summary</h3>
// //                         </div>
// //                         <CalendarDays size={18} />
// //                     </div>

// //                     <div className="sp-attendance-box">
// //                         <div className="sp-progress-labels">
// //                             <span>Attendance Progress</span>
// //                             <strong>{attendancePercent}%</strong>
// //                         </div>

// //                         <div className="sp-progress-track">
// //                             <div
// //                                 className="sp-progress-fill"
// //                                 style={{ width: `${attendancePercent}%` }}
// //                             />
// //                         </div>

// //                         <div className="sp-progress-meta">
// //                             <div>
// //                                 <span>Total Classes</span>
// //                                 <strong>{attendance.totalClasses ?? 0}</strong>
// //                             </div>

// //                             <div>
// //                                 <span>Present</span>
// //                                 <strong>{attendance.present ?? 0}</strong>
// //                             </div>

// //                             <div>
// //                                 <span>Late</span>
// //                                 <strong>{attendance.late ?? 0}</strong>
// //                             </div>

// //                             <div>
// //                                 <span>Absent</span>
// //                                 <strong>{attendance.absent ?? 0}</strong>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </section>
// //             </div>

// //             <section className="sp-panel">
// //                 <div className="sp-panel-head">
// //                     <div>
// //                         <p className="sp-panel-kicker">Assessments</p>
// //                         <h3>Assessment History</h3>
// //                     </div>
// //                     <BookOpen size={18} />
// //                 </div>

// //                 <div className="sp-table-wrap">
// //                     <table className="sp-table">
// //                         <thead>
// //                             <tr>
// //                                 <th>Assessment</th>
// //                                 <th>Submitted On</th>
// //                                 <th>Score</th>
// //                                 <th>Percent</th>
// //                                 <th>Status</th>
// //                             </tr>
// //                         </thead>

// //                         <tbody>
// //                             {submissions.length > 0 ? (
// //                                 submissions.map((submission, index) => {
// //                                     const title = getTitle(submission);
// //                                     const score = getScore(submission);
// //                                     const totalMarks = getTotalMarks(submission);
// //                                     const percent = getPercent(submission);
// //                                     const submittedDate = getSubmittedDate(submission);
// //                                     const status = formatStatus(submission);

// //                                     return (
// //                                         <tr
// //                                             key={
// //                                                 submission._id ||
// //                                                 `${title}-${submittedDate || index}`
// //                                             }
// //                                         >
// //                                             <td>{title}</td>
// //                                             <td>{formatDate(submittedDate)}</td>
// //                                             <td>
// //                                                 <span className="sp-score-pill">
// //                                                     {score}
// //                                                     {totalMarks !== null ? ` / ${totalMarks}` : ""}
// //                                                 </span>
// //                                             </td>
// //                                             <td>{percent ? `${percent}%` : "-"}</td>
// //                                             <td>
// //                                                 <span className={`sp-badge ${statusClass(status)}`}>
// //                                                     {status}
// //                                                 </span>
// //                                             </td>
// //                                         </tr>
// //                                     );
// //                                 })
// //                             ) : (
// //                                 <tr>
// //                                     <td colSpan="5">
// //                                         <div className="sp-inline-empty">
// //                                             No assessment records found for this student.
// //                                         </div>
// //                                     </td>
// //                                 </tr>
// //                             )}
// //                         </tbody>
// //                     </table>
// //                 </div>
// //             </section>

// //             <section className="sp-panel">
// //                 <div className="sp-panel-head">
// //                     <div>
// //                         <p className="sp-panel-kicker">Feedback</p>
// //                         <h3>Trainer Feedback</h3>
// //                     </div>
// //                     <MessageSquare size={18} />
// //                 </div>

// //                 <div className="sp-feedback-list">
// //                     {feedback.length > 0 ? (
// //                         feedback.map((f, index) => {
// //                             const trainerName =
// //                                 typeof f.trainer === "string"
// //                                     ? f.trainer
// //                                     : pick(
// //                                           f.trainer,
// //                                           ["name", "fullName", "firstName", "username"],
// //                                           "Trainer"
// //                                       );

// //                             const className =
// //                                 typeof f.class === "string"
// //                                     ? f.class
// //                                     : pick(
// //                                           f.class,
// //                                           ["name", "title", "className", "topic"],
// //                                           null
// //                                       );

// //                             return (
// //                                 <div className="sp-feedback-card" key={f._id || index}>
// //                                     <div className="sp-feedback-top">
// //                                         <div>
// //                                             <strong>{trainerName}</strong>
// //                                             <p>
// //                                                 {className ? `${className} • ` : ""}
// //                                                 {formatDate(f.date || f.createdAt)}
// //                                             </p>
// //                                         </div>

// //                                         <div className="sp-rating">
// //                                             <Star size={14} />
// //                                             <span>{f.rating ?? 0}</span>
// //                                         </div>
// //                                     </div>

// //                                     <p className="sp-feedback-text">
// //                                         {f.comments || "No comments provided."}
// //                                     </p>
// //                                 </div>
// //                             );
// //                         })
// //                     ) : (
// //                         <div className="sp-inline-empty">
// //                             No trainer feedback available.
// //                         </div>
// //                     )}
// //                 </div>
// //             </section>
// //         </div>
// //     );
// // }








// // // import { useEffect, useMemo, useState } from "react";
// // // import { useDashboard } from "../../../hooks/useDashboard";
// // // import {
// // //     Award,
// // //     BookOpen,
// // //     CalendarDays,
// // //     ClipboardCheck,
// // //     MessageSquare,
// // //     TrendingUp,
// // //     User,
// // //     Star,
// // //     Search,
// // //     ChevronDown,
// // //     Mail,
// // //     BadgeInfo,
// // //     GraduationCap,
// // //     Hash,
// // // } from "lucide-react";

// // // import {
// // //     ResponsiveContainer,
// // //     LineChart,
// // //     Line,
// // //     CartesianGrid,
// // //     XAxis,
// // //     YAxis,
// // //     Tooltip,
// // // } from "recharts";

// // // import "./StudentPerformance.css";

// // // export default function StudentPerformance({ token }) {
// // //     const {
// // //         Allstudents = [],
// // //         StudentPerformance,
// // //         getStuPerformance,
// // //     } = useDashboard(token);

// // //     const [search, setSearch] = useState("");
// // //     const [selectedStudentId, setSelectedStudentId] = useState("");

// // //     useEffect(() => {
// // //         if (!selectedStudentId && Allstudents.length > 0) {
// // //             setSelectedStudentId(Allstudents[0].userId || Allstudents[0]._id || "");
// // //         }
// // //     }, [Allstudents, selectedStudentId]);

// // //     useEffect(() => {
// // //         if (selectedStudentId) {
// // //             getStuPerformance(selectedStudentId);
// // //         }
// // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // //     }, [selectedStudentId]);

// // //     const filteredStudents = useMemo(() => {
// // //         const q = search.trim().toLowerCase();

// // //         if (!q) return Allstudents;

// // //         return Allstudents.filter((student) => {
// // //             const name = student?.name?.toLowerCase() || "";
// // //             const roll = student?.rollNumber?.toLowerCase() || "";
// // //             const email = student?.email?.toLowerCase() || "";
// // //             const course = student?.courseId?.courseCode?.toLowerCase() || "";
// // //             const userId = student?.userId?.toLowerCase() || "";
// // //             const id = student?._id?.toLowerCase() || "";

// // //             return (
// // //                 name.includes(q) ||
// // //                 roll.includes(q) ||
// // //                 email.includes(q) ||
// // //                 course.includes(q) ||
// // //                 userId.includes(q) ||
// // //                 id.includes(q)
// // //             );
// // //         });
// // //     }, [Allstudents, search]);

// // //     // Keep selection in sync with the filtered list. If the currently
// // //     // selected student is filtered out, fall back to the first visible one.
// // //     useEffect(() => {
// // //         if (filteredStudents.length === 0) return;

// // //         const stillVisible = filteredStudents.some(
// // //             (student) => (student.userId || student._id) === selectedStudentId
// // //         );

// // //         if (!stillVisible) {
// // //             setSelectedStudentId(
// // //                 filteredStudents[0].userId || filteredStudents[0]._id || ""
// // //             );
// // //         }
// // //     }, [filteredStudents, selectedStudentId]);

// // //     const selectedStudent = useMemo(() => {
// // //         return (
// // //             Allstudents.find((student) => student.userId === selectedStudentId) ||
// // //             Allstudents.find((student) => student._id === selectedStudentId) ||
// // //             null
// // //         );
// // //     }, [Allstudents, selectedStudentId]);

// // //     const performanceData = StudentPerformance || {};

// // //     const attendance = performanceData.attendance || {
// // //         totalClasses: 0,
// // //         present: 0,
// // //         absent: 0,
// // //         late: 0,
// // //         percentage: 0,
// // //     };

// // //     const assessments = performanceData.assessments || {
// // //         totalAttempted: 0,
// // //         averageScorePercent: 0,
// // //         bestScorePercent: 0,
// // //         submissions: [],
// // //     };

// // //     const feedback = performanceData.feedback || [];

// // //     const submissions = Array.isArray(assessments.submissions)
// // //         ? assessments.submissions
// // //         : [];

// // //     const chartData = submissions.map((submission, index) => ({
// // //         name: submission.assessmentTitle || `A${index + 1}`,
// // //         score: Number(submission.scorePercent ?? submission.percentage ?? 0),
// // //     }));

// // //     const initials = (name = "") =>
// // //         name
// // //             .split(" ")
// // //             .filter(Boolean)
// // //             .map((part) => part[0]?.toUpperCase())
// // //             .join("")
// // //             .slice(0, 2);

// // //     const formatDate = (date) => {
// // //         if (!date) return "-";
// // //         const d = new Date(date);
// // //         if (Number.isNaN(d.getTime())) return "-";
// // //         return d.toLocaleDateString("en-IN", {
// // //             day: "2-digit",
// // //             month: "short",
// // //             year: "numeric",
// // //         });
// // //     };

// // //     // Distinguishes "not attempted" from "attempted and scored 0" by
// // //     // checking for a submission timestamp instead of percent > 0.
// // //     const formatStatus = (submission) => {
// // //         if (submission?.status) {
// // //             return String(submission.status)
// // //                 .replace(/_/g, " ")
// // //                 .replace(/\b\w/g, (ch) => ch.toUpperCase());
// // //         }

// // //         const hasSubmission =
// // //             submission?.submittedAt || submission?.date || submission?.createdAt;

// // //         if (!hasSubmission) return "Pending";

// // //         const percent = Number(submission?.scorePercent ?? submission?.percentage ?? 0);
// // //         return percent >= 40 ? "Passed" : "Needs Review";
// // //     };

// // //     // Maps a status label to a badge class, covering both the labels this
// // //     // component computes and arbitrary status strings from the backend.
// // //     const statusClass = (status) => {
// // //         const normalized = status.toLowerCase();
// // //         if (["passed", "graded", "completed", "approved"].includes(normalized)) {
// // //             return "is-pass";
// // //         }
// // //         if (["needs review", "failed", "rejected"].includes(normalized)) {
// // //             return "is-fail";
// // //         }
// // //         return "";
// // //     };

// // //     const avgScore = Number(assessments.averageScorePercent ?? 0);
// // //     const bestScore = Number(assessments.bestScorePercent ?? 0);
// // //     const attendancePercent = Math.min(
// // //         100,
// // //         Math.max(0, Number(attendance.percentage ?? 0))
// // //     );

// // //     return (
// // //         <div className="student-performance-page">
// // //             <div className="sp-topbar">
// // //                 <div className="sp-topbar-left">
// // //                     <div>
// // //                         <p className="sp-eyebrow">Student Analytics</p>
// // //                         <h1>Student Performance</h1>
// // //                         <span className="sp-subtitle">
// // //                             Search, select, and review each student’s performance in one place.
// // //                         </span>
// // //                     </div>
// // //                 </div>

// // //                 <div className="sp-topbar-right">
// // //                     <div className="sp-stat-pill">
// // //                         <BadgeInfo size={16} />
// // //                         <span>{Allstudents.length} Students</span>
// // //                     </div>
// // //                 </div>
// // //             </div>

// // //             <div className="sp-selector-panel">
// // //                 <div className="sp-searchbox">
// // //                     <Search size={18} />
// // //                     <input
// // //                         type="text"
// // //                         placeholder="Search by name, roll number, email, course, or ID..."
// // //                         value={search}
// // //                         onChange={(e) => setSearch(e.target.value)}
// // //                     />
// // //                 </div>

// // //                 <div className="sp-selectbox">
// // //                     <GraduationCap size={18} />
// // //                     <select
// // //                         value={selectedStudentId}
// // //                         onChange={(e) => setSelectedStudentId(e.target.value)}
// // //                     >
// // //                         {filteredStudents.length === 0 ? (
// // //                             <option value="">No students found</option>
// // //                         ) : (
// // //                             filteredStudents.map((student) => {
// // //                                 const value = student.userId || student._id;
// // //                                 return (
// // //                                     <option key={value} value={value}>
// // //                                         {student.name} • {student.rollNumber} •{" "}
// // //                                         {student.courseId?.courseCode || "No course"}
// // //                                     </option>
// // //                                 );
// // //                             })
// // //                         )}
// // //                     </select>
// // //                     <ChevronDown size={16} className="sp-select-chevron" />
// // //                 </div>
// // //             </div>

// // //             {selectedStudent ? (
// // //                 <div className="sp-profile-card">
// // //                     <div className="sp-avatar">
// // //                         {initials(selectedStudent.name)}
// // //                     </div>

// // //                     <div className="sp-profile-info">
// // //                         <div className="sp-profile-head">
// // //                             <div>
// // //                                 <h2>{selectedStudent.name}</h2>
// // //                                 <p>
// // //                                     {selectedStudent.courseId?.courseCode ||
// // //                                         "No course assigned"}
// // //                                 </p>
// // //                             </div>

// // //                             <div className="sp-profile-tag">
// // //                                 <Hash size={14} />
// // //                                 Roll {selectedStudent.rollNumber}
// // //                             </div>
// // //                         </div>

// // //                         <div className="sp-profile-grid">
// // //                             <div className="sp-meta-item">
// // //                                 <Mail size={16} />
// // //                                 <div>
// // //                                     <span>Email</span>
// // //                                     <strong>{selectedStudent.email}</strong>
// // //                                 </div>
// // //                             </div>

// // //                             <div className="sp-meta-item">
// // //                                 <User size={16} />
// // //                                 <div>
// // //                                     <span>User ID</span>
// // //                                     <strong>{selectedStudent.userId || selectedStudent._id}</strong>
// // //                                 </div>
// // //                             </div>

// // //                             <div className="sp-meta-item">
// // //                                 <CalendarDays size={16} />
// // //                                 <div>
// // //                                     <span>Date of Birth</span>
// // //                                     <strong>{formatDate(selectedStudent.dob)}</strong>
// // //                                 </div>
// // //                             </div>

// // //                             <div className="sp-meta-item">
// // //                                 <BookOpen size={16} />
// // //                                 <div>
// // //                                     <span>Course</span>
// // //                                     <strong>{selectedStudent.courseId?.courseCode || "-"}</strong>
// // //                                 </div>
// // //                             </div>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             ) : (
// // //                 <div className="sp-empty-state">
// // //                     <div className="sp-empty-icon">
// // //                         <User size={28} />
// // //                     </div>
// // //                     <h3>No student selected</h3>
// // //                     <p>Choose a student from the dropdown to view performance details.</p>
// // //                 </div>
// // //             )}

// // //             <div className="sp-summary-grid">
// // //                 <div className="sp-summary-card">
// // //                     <div className="sp-summary-icon accent-1">
// // //                         <Award size={20} />
// // //                     </div>
// // //                     <div className="sp-summary-content">
// // //                         <span>Average Score</span>
// // //                         <h3>{avgScore}%</h3>
// // //                     </div>
// // //                 </div>

// // //                 <div className="sp-summary-card">
// // //                     <div className="sp-summary-icon accent-2">
// // //                         <ClipboardCheck size={20} />
// // //                     </div>
// // //                     <div className="sp-summary-content">
// // //                         <span>Attendance</span>
// // //                         <h3>{attendancePercent}%</h3>
// // //                     </div>
// // //                 </div>

// // //                 <div className="sp-summary-card">
// // //                     <div className="sp-summary-icon accent-3">
// // //                         <BookOpen size={20} />
// // //                     </div>
// // //                     <div className="sp-summary-content">
// // //                         <span>Assessments</span>
// // //                         <h3>{assessments.totalAttempted ?? 0}</h3>
// // //                     </div>
// // //                 </div>

// // //                 <div className="sp-summary-card">
// // //                     <div className="sp-summary-icon accent-4">
// // //                         <Star size={20} />
// // //                     </div>
// // //                     <div className="sp-summary-content">
// // //                         <span>Best Score</span>
// // //                         <h3>{bestScore}%</h3>
// // //                     </div>
// // //                 </div>
// // //             </div>

// // //             <div className="sp-grid">
// // //                 <section className="sp-panel sp-chart-panel">
// // //                     <div className="sp-panel-head">
// // //                         <div>
// // //                             <p className="sp-panel-kicker">Trend</p>
// // //                             <h3>Performance Overview</h3>
// // //                         </div>
// // //                         <TrendingUp size={18} />
// // //                     </div>

// // //                     {chartData.length > 0 ? (
// // //                         <div className="sp-chart-wrap">
// // //                             <ResponsiveContainer width="100%" height={300}>
// // //                                 <LineChart data={chartData}>
// // //                                     <CartesianGrid strokeDasharray="4 4" />
// // //                                     <XAxis dataKey="name" />
// // //                                     <YAxis />
// // //                                     <Tooltip />
// // //                                     <Line
// // //                                         type="monotone"
// // //                                         dataKey="score"
// // //                                         strokeWidth={3}
// // //                                         dot={{ r: 4 }}
// // //                                     />
// // //                                 </LineChart>
// // //                             </ResponsiveContainer>
// // //                         </div>
// // //                     ) : (
// // //                         <div className="sp-inline-empty">
// // //                             No assessment data available.
// // //                         </div>
// // //                     )}
// // //                 </section>

// // //                 <section className="sp-panel sp-attendance-panel">
// // //                     <div className="sp-panel-head">
// // //                         <div>
// // //                             <p className="sp-panel-kicker">Attendance</p>
// // //                             <h3>Presence Summary</h3>
// // //                         </div>
// // //                         <CalendarDays size={18} />
// // //                     </div>

// // //                     <div className="sp-attendance-box">
// // //                         <div className="sp-progress-labels">
// // //                             <span>Attendance Progress</span>
// // //                             <strong>{attendancePercent}%</strong>
// // //                         </div>

// // //                         <div className="sp-progress-track">
// // //                             <div
// // //                                 className="sp-progress-fill"
// // //                                 style={{ width: `${attendancePercent}%` }}
// // //                             />
// // //                         </div>

// // //                         <div className="sp-progress-meta">
// // //                             <div>
// // //                                 <span>Total Classes</span>
// // //                                 <strong>{attendance.totalClasses ?? 0}</strong>
// // //                             </div>

// // //                             <div>
// // //                                 <span>Present</span>
// // //                                 <strong>{attendance.present ?? 0}</strong>
// // //                             </div>

// // //                             <div>
// // //                                 <span>Late</span>
// // //                                 <strong>{attendance.late ?? 0}</strong>
// // //                             </div>

// // //                             <div>
// // //                                 <span>Absent</span>
// // //                                 <strong>{attendance.absent ?? 0}</strong>
// // //                             </div>
// // //                         </div>
// // //                     </div>
// // //                 </section>
// // //             </div>

// // //             <section className="sp-panel">
// // //                 <div className="sp-panel-head">
// // //                     <div>
// // //                         <p className="sp-panel-kicker">Assessments</p>
// // //                         <h3>Assessment History</h3>
// // //                     </div>
// // //                     <BookOpen size={18} />
// // //                 </div>

// // //                 <div className="sp-table-wrap">
// // //                     <table className="sp-table">
// // //                         <thead>
// // //                             <tr>
// // //                                 <th>Assessment</th>
// // //                                 <th>Submitted On</th>
// // //                                 <th>Score</th>
// // //                                 <th>Percent</th>
// // //                                 <th>Status</th>
// // //                             </tr>
// // //                         </thead>

// // //                         <tbody>
// // //                             {submissions.length > 0 ? (
// // //                                 submissions.map((submission, index) => {
// // //                                     const score = submission.score ?? submission.marks ?? 0;
// // //                                     const percent = Number(
// // //                                         submission.scorePercent ?? submission.percentage ?? 0
// // //                                     );
// // //                                     const status = formatStatus(submission);

// // //                                     return (
// // //                                         <tr
// // //                                             key={
// // //                                                 submission._id ||
// // //                                                 `${submission.assessmentTitle || "assessment"}-${submission.submittedAt || index}`
// // //                                             }
// // //                                         >
// // //                                             <td>{submission.assessmentTitle || "-"}</td>
// // //                                             <td>{formatDate(submission.submittedAt || submission.date || submission.createdAt)}</td>
// // //                                             <td>
// // //                                                 <span className="sp-score-pill">
// // //                                                     {score}
// // //                                                     {submission.totalMarks !== undefined &&
// // //                                                     submission.totalMarks !== null
// // //                                                         ? ` / ${submission.totalMarks}`
// // //                                                         : ""}
// // //                                                 </span>
// // //                                             </td>
// // //                                             <td>{percent ? `${percent}%` : "-"}</td>
// // //                                             <td>
// // //                                                 <span className={`sp-badge ${statusClass(status)}`}>
// // //                                                     {status}
// // //                                                 </span>
// // //                                             </td>
// // //                                         </tr>
// // //                                     );
// // //                                 })
// // //                             ) : (
// // //                                 <tr>
// // //                                     <td colSpan="5">
// // //                                         <div className="sp-inline-empty">
// // //                                             No assessment records found for this student.
// // //                                         </div>
// // //                                     </td>
// // //                                 </tr>
// // //                             )}
// // //                         </tbody>
// // //                     </table>
// // //                 </div>
// // //             </section>

// // //             <section className="sp-panel">
// // //                 <div className="sp-panel-head">
// // //                     <div>
// // //                         <p className="sp-panel-kicker">Feedback</p>
// // //                         <h3>Trainer Feedback</h3>
// // //                     </div>
// // //                     <MessageSquare size={18} />
// // //                 </div>

// // //                 <div className="sp-feedback-list">
// // //                     {feedback.length > 0 ? (
// // //                         feedback.map((f, index) => (
// // //                             <div className="sp-feedback-card" key={f._id || index}>
// // //                                 <div className="sp-feedback-top">
// // //                                     <div>
// // //                                         <strong>
// // //                                             {f.trainer?.name || f.trainer || "Trainer"}
// // //                                         </strong>
// // //                                         <p>{formatDate(f.date || f.createdAt)}</p>
// // //                                     </div>

// // //                                     <div className="sp-rating">
// // //                                         <Star size={14} />
// // //                                         <span>{f.rating ?? 0}</span>
// // //                                     </div>
// // //                                 </div>

// // //                                 <p className="sp-feedback-text">
// // //                                     {f.comments || "No comments provided."}
// // //                                 </p>
// // //                             </div>
// // //                         ))
// // //                     ) : (
// // //                         <div className="sp-inline-empty">
// // //                             No trainer feedback available.
// // //                         </div>
// // //                     )}
// // //                 </div>
// // //             </section>
// // //         </div>
// // //     );
// // // }







// // // // import { useEffect, useMemo, useState } from "react";
// // // // import { useDashboard } from "../../../hooks/useDashboard";
// // // // import {
// // // //     Award,
// // // //     BookOpen,
// // // //     CalendarDays,
// // // //     ClipboardCheck,
// // // //     MessageSquare,
// // // //     TrendingUp,
// // // //     User,
// // // //     Star,
// // // //     Search,
// // // //     ChevronDown,
// // // //     Mail,
// // // //     BadgeInfo,
// // // //     GraduationCap,
// // // //     Hash,
// // // // } from "lucide-react";

// // // // import {
// // // //     ResponsiveContainer,
// // // //     LineChart,
// // // //     Line,
// // // //     CartesianGrid,
// // // //     XAxis,
// // // //     YAxis,
// // // //     Tooltip,
// // // // } from "recharts";

// // // // import "./StudentPerformance.css";

// // // // export default function StudentPerformance({ token }) {
// // // //     const {
// // // //         Allstudents = [],
// // // //         StudentPerformance,
// // // //         getStuPerformance,
// // // //     } = useDashboard(token);

// // // //     const [search, setSearch] = useState("");
// // // //     const [selectedStudentId, setSelectedStudentId] = useState("");

// // // //     useEffect(() => {
// // // //         if (!selectedStudentId && Allstudents.length > 0) {
// // // //             setSelectedStudentId(Allstudents[0].userId || Allstudents[0]._id || "");
// // // //         }
// // // //     }, [Allstudents, selectedStudentId]);

// // // //     useEffect(() => {
// // // //         if (selectedStudentId) {
// // // //             getStuPerformance(selectedStudentId);
// // // //         }
// // // //     }, [selectedStudentId, getStuPerformance]);

// // // //     const filteredStudents = useMemo(() => {
// // // //         const q = search.trim().toLowerCase();

// // // //         if (!q) return Allstudents;

// // // //         return Allstudents.filter((student) => {
// // // //             const name = student?.name?.toLowerCase() || "";
// // // //             const roll = student?.rollNumber?.toLowerCase() || "";
// // // //             const email = student?.email?.toLowerCase() || "";
// // // //             const course = student?.courseId?.courseCode?.toLowerCase() || "";
// // // //             const userId = student?.userId?.toLowerCase() || "";
// // // //             const id = student?._id?.toLowerCase() || "";

// // // //             return (
// // // //                 name.includes(q) ||
// // // //                 roll.includes(q) ||
// // // //                 email.includes(q) ||
// // // //                 course.includes(q) ||
// // // //                 userId.includes(q) ||
// // // //                 id.includes(q)
// // // //             );
// // // //         });
// // // //     }, [Allstudents, search]);

// // // //     const selectedStudent = useMemo(() => {
// // // //         return (
// // // //             Allstudents.find((student) => student.userId === selectedStudentId) ||
// // // //             Allstudents.find((student) => student._id === selectedStudentId) ||
// // // //             null
// // // //         );
// // // //     }, [Allstudents, selectedStudentId]);

// // // //     const performanceData = StudentPerformance || {};

// // // //     const attendance = performanceData.attendance || {
// // // //         totalClasses: 0,
// // // //         present: 0,
// // // //         absent: 0,
// // // //         late: 0,
// // // //         percentage: 0,
// // // //     };

// // // //     const assessments = performanceData.assessments || {
// // // //         totalAttempted: 0,
// // // //         averageScorePercent: 0,
// // // //         bestScorePercent: 0,
// // // //         submissions: [],
// // // //     };

// // // //     const feedback = performanceData.feedback || [];

// // // //     const submissions = Array.isArray(assessments.submissions)
// // // //         ? assessments.submissions
// // // //         : [];

// // // //     const chartData = submissions.map((submission, index) => ({
// // // //         name: submission.assessmentTitle || `A${index + 1}`,
// // // //         score: Number(submission.scorePercent ?? submission.percentage ?? 0),
// // // //     }));

// // // //     const initials = (name = "") =>
// // // //         name
// // // //             .split(" ")
// // // //             .filter(Boolean)
// // // //             .map((part) => part[0]?.toUpperCase())
// // // //             .join("")
// // // //             .slice(0, 2);

// // // //     const formatDate = (date) => {
// // // //         if (!date) return "-";
// // // //         const d = new Date(date);
// // // //         if (Number.isNaN(d.getTime())) return "-";
// // // //         return d.toLocaleDateString("en-IN", {
// // // //             day: "2-digit",
// // // //             month: "short",
// // // //             year: "numeric",
// // // //         });
// // // //     };

// // // //     const formatStatus = (submission) => {
// // // //         if (submission?.status) {
// // // //             return String(submission.status)
// // // //                 .replace(/_/g, " ")
// // // //                 .replace(/\b\w/g, (ch) => ch.toUpperCase());
// // // //         }

// // // //         const percent = Number(submission?.scorePercent ?? submission?.percentage ?? 0);
// // // //         if (!Number.isNaN(percent) && percent > 0) {
// // // //             return percent >= 40 ? "Passed" : "Needs Review";
// // // //         }

// // // //         return "Pending";
// // // //     };

// // // //     const avgScore = Number(assessments.averageScorePercent ?? 0);
// // // //     const bestScore = Number(assessments.bestScorePercent ?? 0);
// // // //     const attendancePercent = Number(attendance.percentage ?? 0);

// // // //     return (
// // // //         <div className="student-performance-page">
// // // //             <div className="sp-topbar">
// // // //                 <div className="sp-topbar-left">
// // // //                     <div>
// // // //                         <p className="sp-eyebrow">Student Analytics</p>
// // // //                         <h1>Student Performance</h1>
// // // //                         <span className="sp-subtitle">
// // // //                             Search, select, and review each student’s performance in one place.
// // // //                         </span>
// // // //                     </div>
// // // //                 </div>

// // // //                 <div className="sp-topbar-right">
// // // //                     <div className="sp-stat-pill">
// // // //                         <BadgeInfo size={16} />
// // // //                         <span>{Allstudents.length} Students</span>
// // // //                     </div>
// // // //                 </div>
// // // //             </div>

// // // //             <div className="sp-selector-panel">
// // // //                 <div className="sp-searchbox">
// // // //                     <Search size={18} />
// // // //                     <input
// // // //                         type="text"
// // // //                         placeholder="Search by name, roll number, email, course, or ID..."
// // // //                         value={search}
// // // //                         onChange={(e) => setSearch(e.target.value)}
// // // //                     />
// // // //                 </div>

// // // //                 <div className="sp-selectbox">
// // // //                     <GraduationCap size={18} />
// // // //                     <select
// // // //                         value={selectedStudentId}
// // // //                         onChange={(e) => setSelectedStudentId(e.target.value)}
// // // //                     >
// // // //                         {filteredStudents.length === 0 ? (
// // // //                             <option value="">No students found</option>
// // // //                         ) : (
// // // //                             filteredStudents.map((student) => {
// // // //                                 const value = student.userId || student._id;
// // // //                                 return (
// // // //                                     <option key={value} value={value}>
// // // //                                         {student.name} • {student.rollNumber} •{" "}
// // // //                                         {student.courseId?.courseCode || "No course"}
// // // //                                     </option>
// // // //                                 );
// // // //                             })
// // // //                         )}
// // // //                     </select>
// // // //                     <ChevronDown size={16} className="sp-select-chevron" />
// // // //                 </div>
// // // //             </div>

// // // //             {selectedStudent ? (
// // // //                 <div className="sp-profile-card">
// // // //                     <div className="sp-avatar">
// // // //                         {initials(selectedStudent.name)}
// // // //                     </div>

// // // //                     <div className="sp-profile-info">
// // // //                         <div className="sp-profile-head">
// // // //                             <div>
// // // //                                 <h2>{selectedStudent.name}</h2>
// // // //                                 <p>
// // // //                                     {selectedStudent.courseId?.courseCode ||
// // // //                                         "No course assigned"}
// // // //                                 </p>
// // // //                             </div>

// // // //                             <div className="sp-profile-tag">
// // // //                                 <Hash size={14} />
// // // //                                 Roll {selectedStudent.rollNumber}
// // // //                             </div>
// // // //                         </div>

// // // //                         <div className="sp-profile-grid">
// // // //                             <div className="sp-meta-item">
// // // //                                 <Mail size={16} />
// // // //                                 <div>
// // // //                                     <span>Email</span>
// // // //                                     <strong>{selectedStudent.email}</strong>
// // // //                                 </div>
// // // //                             </div>

// // // //                             <div className="sp-meta-item">
// // // //                                 <User size={16} />
// // // //                                 <div>
// // // //                                     <span>User ID</span>
// // // //                                     <strong>{selectedStudent.userId || selectedStudent._id}</strong>
// // // //                                 </div>
// // // //                             </div>

// // // //                             <div className="sp-meta-item">
// // // //                                 <CalendarDays size={16} />
// // // //                                 <div>
// // // //                                     <span>Date of Birth</span>
// // // //                                     <strong>{formatDate(selectedStudent.dob)}</strong>
// // // //                                 </div>
// // // //                             </div>

// // // //                             <div className="sp-meta-item">
// // // //                                 <BookOpen size={16} />
// // // //                                 <div>
// // // //                                     <span>Course</span>
// // // //                                     <strong>{selectedStudent.courseId?.courseCode || "-"}</strong>
// // // //                                 </div>
// // // //                             </div>
// // // //                         </div>
// // // //                     </div>
// // // //                 </div>
// // // //             ) : (
// // // //                 <div className="sp-empty-state">
// // // //                     <div className="sp-empty-icon">
// // // //                         <User size={28} />
// // // //                     </div>
// // // //                     <h3>No student selected</h3>
// // // //                     <p>Choose a student from the dropdown to view performance details.</p>
// // // //                 </div>
// // // //             )}

// // // //             <div className="sp-summary-grid">
// // // //                 <div className="sp-summary-card">
// // // //                     <div className="sp-summary-icon accent-1">
// // // //                         <Award size={20} />
// // // //                     </div>
// // // //                     <div className="sp-summary-content">
// // // //                         <span>Average Score</span>
// // // //                         <h3>{avgScore}%</h3>
// // // //                     </div>
// // // //                 </div>

// // // //                 <div className="sp-summary-card">
// // // //                     <div className="sp-summary-icon accent-2">
// // // //                         <ClipboardCheck size={20} />
// // // //                     </div>
// // // //                     <div className="sp-summary-content">
// // // //                         <span>Attendance</span>
// // // //                         <h3>{attendancePercent}%</h3>
// // // //                     </div>
// // // //                 </div>

// // // //                 <div className="sp-summary-card">
// // // //                     <div className="sp-summary-icon accent-3">
// // // //                         <BookOpen size={20} />
// // // //                     </div>
// // // //                     <div className="sp-summary-content">
// // // //                         <span>Assessments</span>
// // // //                         <h3>{assessments.totalAttempted ?? 0}</h3>
// // // //                     </div>
// // // //                 </div>

// // // //                 <div className="sp-summary-card">
// // // //                     <div className="sp-summary-icon accent-4">
// // // //                         <Star size={20} />
// // // //                     </div>
// // // //                     <div className="sp-summary-content">
// // // //                         <span>Best Score</span>
// // // //                         <h3>{bestScore}%</h3>
// // // //                     </div>
// // // //                 </div>
// // // //             </div>

// // // //             <div className="sp-grid">
// // // //                 <section className="sp-panel sp-chart-panel">
// // // //                     <div className="sp-panel-head">
// // // //                         <div>
// // // //                             <p className="sp-panel-kicker">Trend</p>
// // // //                             <h3>Performance Overview</h3>
// // // //                         </div>
// // // //                         <TrendingUp size={18} />
// // // //                     </div>

// // // //                     {chartData.length > 0 ? (
// // // //                         <div className="sp-chart-wrap">
// // // //                             <ResponsiveContainer width="100%" height={300}>
// // // //                                 <LineChart data={chartData}>
// // // //                                     <CartesianGrid strokeDasharray="4 4" />
// // // //                                     <XAxis dataKey="name" />
// // // //                                     <YAxis />
// // // //                                     <Tooltip />
// // // //                                     <Line
// // // //                                         type="monotone"
// // // //                                         dataKey="score"
// // // //                                         strokeWidth={3}
// // // //                                         dot={{ r: 4 }}
// // // //                                     />
// // // //                                 </LineChart>
// // // //                             </ResponsiveContainer>
// // // //                         </div>
// // // //                     ) : (
// // // //                         <div className="sp-inline-empty">
// // // //                             No assessment data available.
// // // //                         </div>
// // // //                     )}
// // // //                 </section>

// // // //                 <section className="sp-panel sp-attendance-panel">
// // // //                     <div className="sp-panel-head">
// // // //                         <div>
// // // //                             <p className="sp-panel-kicker">Attendance</p>
// // // //                             <h3>Presence Summary</h3>
// // // //                         </div>
// // // //                         <CalendarDays size={18} />
// // // //                     </div>

// // // //                     <div className="sp-attendance-box">
// // // //                         <div className="sp-progress-labels">
// // // //                             <span>Attendance Progress</span>
// // // //                             <strong>{attendancePercent}%</strong>
// // // //                         </div>

// // // //                         <div className="sp-progress-track">
// // // //                             <div
// // // //                                 className="sp-progress-fill"
// // // //                                 style={{ width: `${attendancePercent}%` }}
// // // //                             />
// // // //                         </div>

// // // //                         <div className="sp-progress-meta">
// // // //                             <div>
// // // //                                 <span>Total Classes</span>
// // // //                                 <strong>{attendance.totalClasses ?? 0}</strong>
// // // //                             </div>

// // // //                             <div>
// // // //                                 <span>Present</span>
// // // //                                 <strong>{attendance.present ?? 0}</strong>
// // // //                             </div>

// // // //                             <div>
// // // //                                 <span>Late</span>
// // // //                                 <strong>{attendance.late ?? 0}</strong>
// // // //                             </div>

// // // //                             <div>
// // // //                                 <span>Absent</span>
// // // //                                 <strong>{attendance.absent ?? 0}</strong>
// // // //                             </div>
// // // //                         </div>
// // // //                     </div>
// // // //                 </section>
// // // //             </div>

// // // //             <section className="sp-panel">
// // // //                 <div className="sp-panel-head">
// // // //                     <div>
// // // //                         <p className="sp-panel-kicker">Assessments</p>
// // // //                         <h3>Assessment History</h3>
// // // //                     </div>
// // // //                     <BookOpen size={18} />
// // // //                 </div>

// // // //                 <div className="sp-table-wrap">
// // // //                     <table className="sp-table">
// // // //                         <thead>
// // // //                             <tr>
// // // //                                 <th>Assessment</th>
// // // //                                 <th>Submitted On</th>
// // // //                                 <th>Score</th>
// // // //                                 <th>Percent</th>
// // // //                                 <th>Status</th>
// // // //                             </tr>
// // // //                         </thead>

// // // //                         <tbody>
// // // //                             {submissions.length > 0 ? (
// // // //                                 submissions.map((submission, index) => {
// // // //                                     const score = submission.score ?? submission.marks ?? 0;
// // // //                                     const percent = Number(
// // // //                                         submission.scorePercent ?? submission.percentage ?? 0
// // // //                                     );

// // // //                                     return (
// // // //                                         <tr
// // // //                                             key={
// // // //                                                 submission._id ||
// // // //                                                 `${submission.assessmentTitle || "assessment"}-${submission.submittedAt || index}`
// // // //                                             }
// // // //                                         >
// // // //                                             <td>{submission.assessmentTitle || "-"}</td>
// // // //                                             <td>{formatDate(submission.submittedAt || submission.date || submission.createdAt)}</td>
// // // //                                             <td>
// // // //                                                 <span className="sp-score-pill">
// // // //                                                     {score}
// // // //                                                     {submission.totalMarks !== undefined &&
// // // //                                                     submission.totalMarks !== null
// // // //                                                         ? ` / ${submission.totalMarks}`
// // // //                                                         : ""}
// // // //                                                 </span>
// // // //                                             </td>
// // // //                                             <td>{percent ? `${percent}%` : "-"}</td>
// // // //                                             <td>
// // // //                                                 <span
// // // //                                                     className={`sp-badge ${
// // // //                                                         formatStatus(submission) === "Passed"
// // // //                                                             ? "is-pass"
// // // //                                                             : formatStatus(submission) === "Needs Review"
// // // //                                                             ? "is-fail"
// // // //                                                             : ""
// // // //                                                     }`}
// // // //                                                 >
// // // //                                                     {formatStatus(submission)}
// // // //                                                 </span>
// // // //                                             </td>
// // // //                                         </tr>
// // // //                                     );
// // // //                                 })
// // // //                             ) : (
// // // //                                 <tr>
// // // //                                     <td colSpan="5">
// // // //                                         <div className="sp-inline-empty">
// // // //                                             No assessment records found for this student.
// // // //                                         </div>
// // // //                                     </td>
// // // //                                 </tr>
// // // //                             )}
// // // //                         </tbody>
// // // //                     </table>
// // // //                 </div>
// // // //             </section>

// // // //             <section className="sp-panel">
// // // //                 <div className="sp-panel-head">
// // // //                     <div>
// // // //                         <p className="sp-panel-kicker">Feedback</p>
// // // //                         <h3>Trainer Feedback</h3>
// // // //                     </div>
// // // //                     <MessageSquare size={18} />
// // // //                 </div>

// // // //                 <div className="sp-feedback-list">
// // // //                     {feedback.length > 0 ? (
// // // //                         feedback.map((f, index) => (
// // // //                             <div className="sp-feedback-card" key={f._id || index}>
// // // //                                 <div className="sp-feedback-top">
// // // //                                     <div>
// // // //                                         <strong>
// // // //                                             {f.trainer?.name || f.trainer || "Trainer"}
// // // //                                         </strong>
// // // //                                         <p>{formatDate(f.date || f.createdAt)}</p>
// // // //                                     </div>

// // // //                                     <div className="sp-rating">
// // // //                                         <Star size={14} />
// // // //                                         <span>{f.rating ?? 0}</span>
// // // //                                     </div>
// // // //                                 </div>

// // // //                                 <p className="sp-feedback-text">
// // // //                                     {f.comments || "No comments provided."}
// // // //                                 </p>
// // // //                             </div>
// // // //                         ))
// // // //                     ) : (
// // // //                         <div className="sp-inline-empty">
// // // //                             No trainer feedback available.
// // // //                         </div>
// // // //                     )}
// // // //                 </div>
// // // //             </section>
// // // //         </div>
// // // //     );
// // // // }











// // // // // import { useEffect, useMemo, useState } from "react";
// // // // // import { useDashboard } from "../../../hooks/useDashboard";
// // // // // import {
// // // // //     Award,
// // // // //     BookOpen,
// // // // //     CalendarDays,
// // // // //     ClipboardCheck,
// // // // //     MessageSquare,
// // // // //     TrendingUp,
// // // // //     User,
// // // // //     Star,
// // // // //     Search,
// // // // //     ChevronDown,
// // // // //     Mail,
// // // // //     BadgeInfo,
// // // // //     GraduationCap,
// // // // //     Hash,
// // // // // } from "lucide-react";

// // // // // import {
// // // // //     ResponsiveContainer,
// // // // //     LineChart,
// // // // //     Line,
// // // // //     CartesianGrid,
// // // // //     XAxis,
// // // // //     YAxis,
// // // // //     Tooltip,
// // // // // } from "recharts";

// // // // // import "./StudentPerformance.css";

// // // // // export default function StudentPerformance({
// // // // //     token
// // // // // }) {
// // // // //     const {
// // // // //         Allstudents = [],
// // // // //         StudentPerformance,
// // // // //         getStuPerformance,
// // // // //     } = useDashboard(token);
// // // // //     const [search, setSearch] = useState("");
// // // // //     const [selectedStudentId, setSelectedStudentId] = useState("");


// // // // //     useEffect(() => {
// // // // //         if (!selectedStudentId && Allstudents.length > 0) {
// // // // //             setSelectedStudentId(Allstudents[0].userId);
// // // // //         }
// // // // //     }, [Allstudents, selectedStudentId]);

// // // // //     useEffect(() => {
// // // // //         if (selectedStudentId) {
// // // // //             getStuPerformance(selectedStudentId);
// // // // //         }
// // // // //     }, [selectedStudentId, getStuPerformance]);

// // // // //     const filteredStudents = useMemo(() => {
// // // // //         const q = search.trim().toLowerCase();

// // // // //         if (!q) return Allstudents;

// // // // //         return Allstudents.filter((student) => {
// // // // //             const name = student?.name?.toLowerCase() || "";
// // // // //             const roll = student?.rollNumber?.toLowerCase() || "";
// // // // //             const email = student?.email?.toLowerCase() || "";
// // // // //             const course = student?.courseId?.courseCode?.toLowerCase() || "";

// // // // //             return (
// // // // //                 name.includes(q) ||
// // // // //                 roll.includes(q) ||
// // // // //                 email.includes(q) ||
// // // // //                 course.includes(q)
// // // // //             );
// // // // //         });
// // // // //     }, [Allstudents, search]);

// // // // //     const selectedStudent = useMemo(() => {
// // // // //         return Allstudents.find((student) => student.userId === selectedStudentId) || null;
// // // // //     }, [Allstudents, selectedStudentId]);

// // // // //     // const performance = StudentPerformance || {};
// // // // //     // const student = performance.student || {};
// // // // //     // const attendance = performance.attendance || {};
// // // // //     // const assessments = performance.assessments || [];
// // // // //     // const feedback = performance.feedback || [];
// // // // //     // const summary = performance.summary || {};
// // // // //     const performance = StudentPerformance || {};

// // // // //     const attendance = performance.attendance || {};

// // // // //     const assessments = performance.assessments || {
// // // // //         totalAttempted: 0,
// // // // //         averageScorePercent: 0,
// // // // //         bestScorePercent: 0,
// // // // //         submissions: [],
// // // // //     };

// // // // //     const feedback = performance.feedback || [];
// // // // //     // const chartData = assessments.map((a, i) => ({
// // // // //     //     name: a.title || `A${i + 1}`,
// // // // //     //     score: Number(a.score ?? 0),
// // // // //     // }));
// // // // //     const chartData = assessments.submissions.map((submission, index) => ({
// // // // //         name: submission.assessmentTitle || `A${index + 1}`,
// // // // //         score: submission.scorePercent,
// // // // //     }));
// // // // //     const initials = (name = "") =>
// // // // //         name
// // // // //             .split(" ")
// // // // //             .filter(Boolean)
// // // // //             .map((part) => part[0]?.toUpperCase())
// // // // //             .join("")
// // // // //             .slice(0, 2);

// // // // //     const formatDate = (date) => {
// // // // //         if (!date) return "-";
// // // // //         const d = new Date(date);
// // // // //         if (Number.isNaN(d.getTime())) return "-";
// // // // //         return d.toLocaleDateString("en-IN", {
// // // // //             day: "2-digit",
// // // // //             month: "short",
// // // // //             year: "numeric",
// // // // //         });
// // // // //     };

// // // // //     // const avgScore = Number(summary.averageScore ?? 0);
// // // // //     const avgScore = Number(assessments.averageScorePercent ?? 0);

// // // // //     const attendancePercent = Number(attendance.percentage ?? 0);

// // // // //     return (
// // // // //         <div className="student-performance-page">
// // // // //             <div className="sp-topbar">
// // // // //                 <div className="sp-topbar-left">
// // // // //                     <div>
// // // // //                         <p className="sp-eyebrow">Student Analytics</p>
// // // // //                         <h1>Student Performance</h1>
// // // // //                         <span className="sp-subtitle">
// // // // //                             Search, select, and review each student’s performance in one place.
// // // // //                         </span>
// // // // //                     </div>
// // // // //                 </div>

// // // // //                 <div className="sp-topbar-right">
// // // // //                     <div className="sp-stat-pill">
// // // // //                         <BadgeInfo size={16} />
// // // // //                         <span>{Allstudents.length} Students</span>
// // // // //                     </div>
// // // // //                 </div>
// // // // //             </div>

// // // // //             <div className="sp-selector-panel">
// // // // //                 <div className="sp-searchbox">
// // // // //                     <Search size={18} />
// // // // //                     <input
// // // // //                         type="text"
// // // // //                         placeholder="Search by name, roll number, email, or course..."
// // // // //                         value={search}
// // // // //                         onChange={(e) => setSearch(e.target.value)}
// // // // //                     />
// // // // //                 </div>

// // // // //                 <div className="sp-selectbox">
// // // // //                     <GraduationCap size={18} />
// // // // //                     <select
// // // // //                         value={selectedStudentId}
// // // // //                         onChange={(e) => setSelectedStudentId(e.target.value)}
// // // // //                     >
// // // // //                         {filteredStudents.length === 0 ? (
// // // // //                             <option value="">No students found</option>
// // // // //                         ) : (
// // // // //                             filteredStudents.map((student) => (
// // // // //                                 <option key={student.userId} value={student.userId}>
// // // // //                                     {student.name} • {student.rollNumber} • {student.courseId?.courseCode}
// // // // //                                 </option>
// // // // //                             ))
// // // // //                         )}
// // // // //                     </select>
// // // // //                     <ChevronDown size={16} className="sp-select-chevron" />
// // // // //                 </div>
// // // // //             </div>

// // // // //             {selectedStudent ? (
// // // // //                 <div className="sp-profile-card">
// // // // //                     <div className="sp-avatar">
// // // // //                         {initials(selectedStudent.name)}
// // // // //                     </div>

// // // // //                     <div className="sp-profile-info">
// // // // //                         <div className="sp-profile-head">
// // // // //                             <div>
// // // // //                                 <h2>{selectedStudent.name}</h2>
// // // // //                                 <p>
// // // // //                                     {selectedStudent.courseId?.courseCode || "No course assigned"}
// // // // //                                 </p>
// // // // //                             </div>
// // // // //                             <div className="sp-profile-tag">
// // // // //                                 <Hash size={14} />
// // // // //                                 Roll {selectedStudent.rollNumber}
// // // // //                             </div>
// // // // //                         </div>

// // // // //                         <div className="sp-profile-grid">
// // // // //                             <div className="sp-meta-item">
// // // // //                                 <Mail size={16} />
// // // // //                                 <div>
// // // // //                                     <span>Email</span>
// // // // //                                     <strong>{selectedStudent.email}</strong>
// // // // //                                 </div>
// // // // //                             </div>

// // // // //                             <div className="sp-meta-item">
// // // // //                                 <User size={16} />
// // // // //                                 <div>
// // // // //                                     <span>User ID</span>
// // // // //                                     <strong>{selectedStudent.userId}</strong>
// // // // //                                 </div>
// // // // //                             </div>

// // // // //                             <div className="sp-meta-item">
// // // // //                                 <CalendarDays size={16} />
// // // // //                                 <div>
// // // // //                                     <span>Date of Birth</span>
// // // // //                                     <strong>{formatDate(selectedStudent.dob)}</strong>
// // // // //                                 </div>
// // // // //                             </div>

// // // // //                             <div className="sp-meta-item">
// // // // //                                 <BookOpen size={16} />
// // // // //                                 <div>
// // // // //                                     <span>Course</span>
// // // // //                                     <strong>{selectedStudent.courseId?.courseCode || "-"}</strong>
// // // // //                                 </div>
// // // // //                             </div>
// // // // //                         </div>
// // // // //                     </div>
// // // // //                 </div>
// // // // //             ) : (
// // // // //                 <div className="sp-empty-state">
// // // // //                     <div className="sp-empty-icon">
// // // // //                         <User size={28} />
// // // // //                     </div>
// // // // //                     <h3>No student selected</h3>
// // // // //                     <p>Choose a student from the dropdown to view performance details.</p>
// // // // //                 </div>
// // // // //             )}

// // // // //             <div className="sp-summary-grid">
// // // // //                 <div className="sp-summary-card">
// // // // //                     <div className="sp-summary-icon accent-1">
// // // // //                         <Award size={20} />
// // // // //                     </div>
// // // // //                     <div className="sp-summary-content">
// // // // //                         <span>Average Score</span>
// // // // //                         <h3>{avgScore}%</h3>
// // // // //                     </div>
// // // // //                 </div>

// // // // //                 <div className="sp-summary-card">
// // // // //                     <div className="sp-summary-icon accent-2">
// // // // //                         <ClipboardCheck size={20} />
// // // // //                     </div>
// // // // //                     <div className="sp-summary-content">
// // // // //                         <span>Attendance</span>
// // // // //                         <h3>{attendancePercent}%</h3>
// // // // //                     </div>
// // // // //                 </div>

// // // // //                 <div className="sp-summary-card">
// // // // //                     <div className="sp-summary-icon accent-3">
// // // // //                         <BookOpen size={20} />
// // // // //                     </div>
// // // // //                     <div className="sp-summary-content">
// // // // //                         <span>Assessments</span>
// // // // //                         {/* <h3>{assessments.length}</h3> */}
// // // // //                         <h3>{assessments.totalAttempted}</h3>
// // // // //                     </div>
// // // // //                 </div>

// // // // //                 <div className="sp-summary-card">
// // // // //                     <div className="sp-summary-icon accent-4">
// // // // //                         <Star size={20} />
// // // // //                     </div>
// // // // //                     <div className="sp-summary-content">
// // // // //                         <span>Feedback</span>
// // // // //                         <h3>{feedback.length}</h3>
// // // // //                     </div>
// // // // //                 </div>
// // // // //             </div>

// // // // //             <div className="sp-grid">
// // // // //                 <section className="sp-panel sp-chart-panel">
// // // // //                     <div className="sp-panel-head">
// // // // //                         <div>
// // // // //                             <p className="sp-panel-kicker">Trend</p>
// // // // //                             <h3>Performance Overview</h3>
// // // // //                         </div>
// // // // //                         <TrendingUp size={18} />
// // // // //                     </div>

// // // // //                     {chartData.length > 0 ? (
// // // // //                         <div className="sp-chart-wrap">
// // // // //                             <ResponsiveContainer width="100%" height={300}>
// // // // //                                 <LineChart data={chartData}>
// // // // //                                     <CartesianGrid strokeDasharray="4 4" />
// // // // //                                     <XAxis dataKey="name" />
// // // // //                                     <YAxis />
// // // // //                                     <Tooltip />
// // // // //                                     <Line
// // // // //                                         type="monotone"
// // // // //                                         dataKey="score"
// // // // //                                         strokeWidth={3}
// // // // //                                         dot={{ r: 4 }}
// // // // //                                     />
// // // // //                                 </LineChart>
// // // // //                             </ResponsiveContainer>
// // // // //                         </div>
// // // // //                     ) : (
// // // // //                         <div className="sp-inline-empty">No assessment data available.</div>
// // // // //                     )}
// // // // //                 </section>

// // // // //                 <section className="sp-panel sp-attendance-panel">
// // // // //                     <div className="sp-panel-head">
// // // // //                         <div>
// // // // //                             <p className="sp-panel-kicker">Attendance</p>
// // // // //                             <h3>Presence Summary</h3>
// // // // //                         </div>
// // // // //                         <CalendarDays size={18} />
// // // // //                     </div>

// // // // //                     <div className="sp-attendance-box">
// // // // //                         <div className="sp-progress-labels">
// // // // //                             <span>Present</span>
// // // // //                             <strong>{attendance.present ?? 0}</strong>
// // // // //                         </div>

// // // // //                         <div className="sp-progress-track">
// // // // //                             <div
// // // // //                                 className="sp-progress-fill"
// // // // //                                 style={{ width: `${attendancePercent}%` }}
// // // // //                             />
// // // // //                         </div>

// // // // //                         <div className="sp-progress-meta">
// // // // //                             <span>Absent: {attendance.absent ?? 0}</span>
// // // // //                             <span>Total: {(attendance.present ?? 0) + (attendance.absent ?? 0)}</span>
// // // // //                             <span>{attendancePercent}%</span>
// // // // //                         </div>
// // // // //                     </div>
// // // // //                 </section>
// // // // //             </div>

// // // // //             <section className="sp-panel">
// // // // //                 <div className="sp-panel-head">
// // // // //                     <div>
// // // // //                         <p className="sp-panel-kicker">Assessments</p>
// // // // //                         <h3>Assessment History</h3>
// // // // //                     </div>
// // // // //                     <BookOpen size={18} />
// // // // //                 </div>

// // // // //                 <div className="sp-table-wrap">
// // // // //                     <table className="sp-table">
// // // // //                         <thead>
// // // // //                             <tr>
// // // // //                                 <th>Assessment</th>
// // // // //                                 <th>Date</th>
// // // // //                                 <th>Score</th>
// // // // //                                 <th>Status</th>
// // // // //                             </tr>
// // // // //                         </thead>
// // // // //                         <tbody>
// // // // //                             {assessments.submissions.length > 0 ? (
// // // // //                                 assessments.submissions.map((submission) => (
// // // // //                                     <tr
// // // // //                                         key={
// // // // //                                             submission._id ||
// // // // //                                             `${submission.assessmentTitle}-${submission.submittedAt}`
// // // // //                                         }
// // // // //                                     >
// // // // //                                         <td>{submission.assessmentTitle || "-"}</td>

// // // // //                                         <td>{formatDate(submission.submittedAt)}</td>

// // // // //                                         <td>
// // // // //                                             <span className="sp-score-pill">
// // // // //                                                 {submission.score ?? 0}
// // // // //                                                 {submission.totalMarks
// // // // //                                                     ? ` / ${submission.totalMarks}`
// // // // //                                                     : ""}
// // // // //                                             </span>
// // // // //                                         </td>

// // // // //                                         <td>
// // // // //                                             <span
// // // // //                                                 className={`sp-badge ${submission.status === "passed"
// // // // //                                                         ? "is-pass"
// // // // //                                                         : "is-fail"
// // // // //                                                     }`}
// // // // //                                             >
// // // // //                                                 {submission.scorePercent ?? 0}%
// // // // //                                             </span>
// // // // //                                         </td>
// // // // //                                     </tr>
// // // // //                                 ))
// // // // //                             ) : (
// // // // //                                 <tr>
// // // // //                                     <td colSpan={4}>
// // // // //                                         <div className="sp-inline-empty">
// // // // //                                             No assessment submissions found.
// // // // //                                         </div>
// // // // //                                     </td>
// // // // //                                 </tr>
// // // // //                             )}
// // // // //                         </tbody>
// // // // //                     </table>
// // // // //                 </div>
// // // // //             </section>

// // // // //             <section className="sp-panel">
// // // // //                 <div className="sp-panel-head">
// // // // //                     <div>
// // // // //                         <p className="sp-panel-kicker">Feedback</p>
// // // // //                         <h3>Trainer Feedback</h3>
// // // // //                     </div>
// // // // //                     <MessageSquare size={18} />
// // // // //                 </div>

// // // // //                 <div className="sp-feedback-list">
// // // // //                     {feedback.length > 0 ? (
// // // // //                         feedback.map((f, index) => (
// // // // //                             <div className="sp-feedback-card" key={f._id || index}>
// // // // //                                 <div className="sp-feedback-top">
// // // // //                                     <div>
// // // // //                                         <strong>{f.trainer?.name || f.trainer || "Trainer"}</strong>
// // // // //                                         <p>{formatDate(f.date)}</p>
// // // // //                                     </div>

// // // // //                                     <div className="sp-rating">
// // // // //                                         <Star size={14} />
// // // // //                                         <span>{f.rating ?? 0}</span>
// // // // //                                     </div>
// // // // //                                 </div>

// // // // //                                 <p className="sp-feedback-text">
// // // // //                                     {f.comments || "No comments provided."}
// // // // //                                 </p>
// // // // //                             </div>
// // // // //                         ))
// // // // //                     ) : (
// // // // //                         <div className="sp-inline-empty">No trainer feedback available.</div>
// // // // //                     )}
// // // // //                 </div>
// // // // //             </section>
// // // // //         </div>
// // // // //     );
// // // // // }







// // // // // // import { useEffect } from "react";
// // // // // // import {
// // // // // //     Award,
// // // // // //     BookOpen,
// // // // // //     CalendarDays,
// // // // // //     ClipboardCheck,
// // // // // //     MessageSquare,
// // // // // //     TrendingUp,
// // // // // //     User,
// // // // // //     Star,
// // // // // // } from "lucide-react";

// // // // // // import {
// // // // // //     ResponsiveContainer,
// // // // // //     LineChart,
// // // // // //     Line,
// // // // // //     CartesianGrid,
// // // // // //     XAxis,
// // // // // //     YAxis,
// // // // // //     Tooltip,
// // // // // // } from "recharts";

// // // // // // import "./StudentPerformance.css";

// // // // // // export default function StudentPerformance({
// // // // // //     studentId,
// // // // // //     StudentPerformance,
// // // // // //     getStuPerformance,
// // // // // // }) {
// // // // // //     useEffect(() => {
// // // // // //         if (studentId) getStuPerformance(studentId);
// // // // // //     }, [studentId]);

// // // // // //     if (!StudentPerformance) {
// // // // // //         return (
// // // // // //             <div className="sp-loading">
// // // // // //                 Loading performance...
// // // // // //             </div>
// // // // // //         );
// // // // // //     }

// // // // // //     const {
// // // // // //         student = {},
// // // // // //         attendance = {},
// // // // // //         assessments = [],
// // // // // //         feedback = [],
// // // // // //         summary = {},
// // // // // //     } = StudentPerformance;

// // // // // //     const chartData = assessments.map((a, i) => ({
// // // // // //         name: `A${i + 1}`,
// // // // // //         score: a.score,
// // // // // //     }));

// // // // // //     return (
// // // // // //         <div className="student-performance">

// // // // // //             {/* Header */}

// // // // // //             <div className="sp-header">

// // // // // //                 <div className="sp-user">

// // // // // //                     <div className="sp-avatar">
// // // // // //                         <User size={34}/>
// // // // // //                     </div>

// // // // // //                     <div>

// // // // // //                         <h2>{student.name}</h2>

// // // // // //                         <span>{student.email}</span>

// // // // // //                     </div>

// // // // // //                 </div>

// // // // // //             </div>

// // // // // //             {/* Summary */}

// // // // // //             <div className="sp-summary">

// // // // // //                 <div className="sp-card">
// // // // // //                     <Award size={22}/>
// // // // // //                     <div>
// // // // // //                         <span>Average Score</span>
// // // // // //                         <h3>{summary.averageScore ?? 0}%</h3>
// // // // // //                     </div>
// // // // // //                 </div>

// // // // // //                 <div className="sp-card">
// // // // // //                     <ClipboardCheck size={22}/>
// // // // // //                     <div>
// // // // // //                         <span>Attendance</span>
// // // // // //                         <h3>{attendance.percentage ?? 0}%</h3>
// // // // // //                     </div>
// // // // // //                 </div>

// // // // // //                 <div className="sp-card">
// // // // // //                     <BookOpen size={22}/>
// // // // // //                     <div>
// // // // // //                         <span>Assessments</span>
// // // // // //                         <h3>{assessments.length}</h3>
// // // // // //                     </div>
// // // // // //                 </div>

// // // // // //                 <div className="sp-card">
// // // // // //                     <Star size={22}/>
// // // // // //                     <div>
// // // // // //                         <span>Feedback</span>
// // // // // //                         <h3>{feedback.length}</h3>
// // // // // //                     </div>
// // // // // //                 </div>

// // // // // //             </div>

// // // // // //             {/* Chart */}

// // // // // //             <div className="sp-section">

// // // // // //                 <div className="sp-title">
// // // // // //                     <TrendingUp size={18}/>
// // // // // //                     Performance Trend
// // // // // //                 </div>

// // // // // //                 <ResponsiveContainer width="100%" height={300}>
// // // // // //                     <LineChart data={chartData}>
// // // // // //                         <CartesianGrid strokeDasharray="3 3"/>
// // // // // //                         <XAxis dataKey="name"/>
// // // // // //                         <YAxis/>
// // // // // //                         <Tooltip/>
// // // // // //                         <Line
// // // // // //                             type="monotone"
// // // // // //                             dataKey="score"
// // // // // //                             strokeWidth={3}
// // // // // //                         />
// // // // // //                     </LineChart>
// // // // // //                 </ResponsiveContainer>

// // // // // //             </div>

// // // // // //             {/* Assessments */}

// // // // // //             <div className="sp-section">

// // // // // //                 <div className="sp-title">
// // // // // //                     <BookOpen size={18}/>
// // // // // //                     Assessment History
// // // // // //                 </div>

// // // // // //                 <table className="sp-table">

// // // // // //                     <thead>

// // // // // //                     <tr>
// // // // // //                         <th>Assessment</th>
// // // // // //                         <th>Date</th>
// // // // // //                         <th>Score</th>
// // // // // //                         <th>Status</th>
// // // // // //                     </tr>

// // // // // //                     </thead>

// // // // // //                     <tbody>

// // // // // //                     {assessments.map((a) => (

// // // // // //                         <tr key={a._id}>

// // // // // //                             <td>{a.title}</td>

// // // // // //                             <td>
// // // // // //                                 {new Date(a.date).toLocaleDateString()}
// // // // // //                             </td>

// // // // // //                             <td>{a.score}</td>

// // // // // //                             <td>

// // // // // //                                 <span className={`badge ${a.passed ? "pass" : "fail"}`}>
// // // // // //                                     {a.passed ? "Passed" : "Failed"}
// // // // // //                                 </span>

// // // // // //                             </td>

// // // // // //                         </tr>

// // // // // //                     ))}

// // // // // //                     </tbody>

// // // // // //                 </table>

// // // // // //             </div>

// // // // // //             {/* Attendance */}

// // // // // //             <div className="sp-section">

// // // // // //                 <div className="sp-title">
// // // // // //                     <CalendarDays size={18}/>
// // // // // //                     Attendance
// // // // // //                 </div>

// // // // // //                 <div className="attendance-bar">

// // // // // //                     <div
// // // // // //                         className="attendance-fill"
// // // // // //                         style={{
// // // // // //                             width: `${attendance.percentage || 0}%`,
// // // // // //                         }}
// // // // // //                     />

// // // // // //                 </div>

// // // // // //                 <div className="attendance-text">

// // // // // //                     Present : {attendance.present}

// // // // // //                     <span/>

// // // // // //                     Absent : {attendance.absent}

// // // // // //                     <span/>

// // // // // //                     {attendance.percentage}%

// // // // // //                 </div>

// // // // // //             </div>

// // // // // //             {/* Feedback */}

// // // // // //             <div className="sp-section">

// // // // // //                 <div className="sp-title">
// // // // // //                     <MessageSquare size={18}/>
// // // // // //                     Trainer Feedback
// // // // // //                 </div>

// // // // // //                 <div className="feedback-list">

// // // // // //                     {feedback.map((f) => (

// // // // // //                         <div className="feedback-card" key={f._id}>

// // // // // //                             <div className="feedback-top">

// // // // // //                                 <strong>{f.trainer}</strong>

// // // // // //                                 <span>{f.rating} ★</span>

// // // // // //                             </div>

// // // // // //                             <p>{f.comments}</p>

// // // // // //                         </div>

// // // // // //                     ))}

// // // // // //                 </div>

// // // // // //             </div>

// // // // // //         </div>
// // // // // //     );
// // // // // // }