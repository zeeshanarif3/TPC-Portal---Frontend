import { useStu } from "../../../hooks/useStu";
import "./PerformancePage.css";

function getAttendanceTier(pct) {
    if (pct >= 90) return { label: "Excellent", tone: "excellent" };
    if (pct >= 75) return { label: "Good", tone: "good" };
    if (pct >= 60) return { label: "Needs attention", tone: "fair" };
    return { label: "At risk", tone: "risk" };
}

function getScoreTier(pct) {
    if (pct >= 90) return "gold";
    if (pct >= 75) return "good";
    if (pct >= 60) return "fair";
    return "risk";
}

function getOverallGrade(avgPct) {
    if (avgPct >= 90) return "A+";
    if (avgPct >= 80) return "A";
    if (avgPct >= 70) return "B";
    if (avgPct >= 60) return "C";
    return "D";
}

function initials(name = "") {
    return name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function PerformancePage({ token }) {
    const { myPerformance } = useStu(token);

    const performance = myPerformance?.data;

    if (!performance) {
        return (
            <div className="performance-page">
                <div className="performance-loading">
                    <div className="loading-ring" />
                    <span>Loading your performance...</span>
                </div>
            </div>
        );
    }

    const { attendance, assessments, feedback } = performance;
    const attendanceTier = getAttendanceTier(attendance.percentage);
    const overallGrade = getOverallGrade(assessments.averageScorePercent);
    const ringStyle = {
        "--ring-value": attendance.percentage,
    };

    return (
        <div className="performance-page">
            {/* Hero */}
            <header className="performance-hero">
                <div className="hero-copy">
                    <span className="hero-eyebrow">Performance overview</span>
                    <h1>My Performance</h1>
                    <p>Track your attendance, assessments and trainer feedback in one place.</p>
                </div>

                <div className="hero-grade" title="Overall grade, based on your average assessment score">
                    <span className="hero-grade-label">Overall grade</span>
                    <span className="hero-grade-value">{overallGrade}</span>
                </div>
            </header>

            {/* KPI cards */}
            <section className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon accent-blue">🗓️</div>
                    <span className="kpi-label">Total Classes</span>
                    <span className="kpi-value">{attendance.totalClasses}</span>
                </div>

                <div className={`kpi-card accent-${attendanceTier.tone}`}>
                    <div className={`kpi-icon accent-${attendanceTier.tone}`}>✓</div>
                    <span className="kpi-label">Attendance</span>
                    <span className="kpi-value">{attendance.percentage}%</span>
                    <span className={`kpi-subtitle tone-${attendanceTier.tone}`}>
                        {attendanceTier.label}
                    </span>
                </div>

                <div className="kpi-card accent-gold">
                    <div className="kpi-icon accent-gold">📝</div>
                    <span className="kpi-label">Assessments</span>
                    <span className="kpi-value">{assessments.totalAttempted}</span>
                    <span className="kpi-subtitle">
                        Average {assessments.averageScorePercent}%
                    </span>
                </div>

                <div className="kpi-card accent-gold">
                    <div className="kpi-icon accent-gold">🏆</div>
                    <span className="kpi-label">Best Score</span>
                    <span className="kpi-value">{assessments.bestScorePercent}%</span>
                    <span className="kpi-subtitle">Personal best</span>
                </div>
            </section>

            {/* Attendance */}
            <section className="performance-section">
                <div className="section-header">
                    <h2>Attendance</h2>
                    <p>Your classroom participation this term</p>
                </div>

                <div className="attendance-panel">
                    <div className="attendance-ring-wrap">
                        <div className="attendance-ring" style={ringStyle}>
                            <div className="attendance-ring-inner">
                                <span className="ring-value">{attendance.percentage}%</span>
                                <span className="ring-label">Attendance</span>
                            </div>
                        </div>
                    </div>

                    <div className="performance-attendance-stats">
                        <div className="attendance-stat">
                            <span className="dot dot-good" />
                            <div>
                                <span className="attendance-stat-value">{attendance.present}</span>
                                <span className="attendance-stat-label">Classes attended</span>
                            </div>
                        </div>

                        <div className="attendance-stat">
                            <span className="dot dot-risk" />
                            <div>
                                <span className="attendance-stat-value">{attendance.absent}</span>
                                <span className="attendance-stat-label">Classes missed</span>
                            </div>
                        </div>

                        <div className="attendance-stat">
                            <span className={`dot dot-${attendanceTier.tone}`} />
                            <div>
                                <span className="attendance-stat-value">{attendanceTier.label}</span>
                                <span className="attendance-stat-label">Current standing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Assessments */}
            <section className="performance-section">
                <div className="section-header">
                    <h2>Assessments</h2>
                    <p>Every assessment you've submitted, most recent first</p>
                </div>

                {assessments.submissions.length === 0 ? (
                    <EmptyState
                        icon="📄"
                        title="No assessments attempted yet"
                        body="Assessments you complete will show up here with your score."
                    />
                ) : (
                    <div className="assessment-grid">
                        {/* <pre>{JSON.stringify(assessments, null, 2)}</pre> */}
                        {assessments.submissions.map((submission) => {
                            const tier = getScoreTier(submission.percentage);
                            return (
                                <div className="assessment-card" key={submission._id}>
                                    <div className="assessment-card-top">
                                        <span className="assessment-title">{submission.title}</span>
                                        <span className={`score-pill tone-${tier}`}>
                                            {submission.percentageScore}%
                                        </span>
                                    </div>

                                    <div className="assessment-bar-track">
                                        <div
                                            className={`assessment-bar-fill tone-${tier}`}
                                            style={{ width: `${submission.percentageScore}%` }}
                                        />
                                    </div>

                                    <div className="assessment-card-bottom">
                                        <span className="score-badge">
                                            <strong>Score:</strong> {submission.score}
                                        </span>
                                        {/* <span>
                                            {new Date(submission.submittedAt).toLocaleDateString(
                                                undefined,
                                                { day: "2-digit", month: "short", year: "numeric" }
                                            )}
                                        </span> */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Feedback */}
            {/* <section className="performance-section">
                <div className="section-header">
                    <h2>Trainer Feedback</h2>
                    <p>Notes from the trainers who've worked with you</p>
                </div>

                {feedback.length === 0 ? (
                    <EmptyState
                        icon="💬"
                        title="No trainer feedback yet"
                        body="Feedback from your trainers will appear here."
                    />
                ) : (
                    <div className="feedback-timeline">
                        {feedback.map((item) => (
                            <div className="feedback-card" key={item._id}>
                                <div className="feedback-avatar">{initials(item.trainerName)}</div>

                                <div className="feedback-body">
                                    <div className="feedback-header">
                                        <strong>{item.trainerName}</strong>
                                        <span className="feedback-date">
                                            {new Date(item.createdAt).toLocaleDateString(
                                                undefined,
                                                { day: "2-digit", month: "short", year: "numeric" }
                                            )}
                                        </span>
                                    </div>
                                    <p>{item.feedback}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section> */}
            {/* Feedback */}
            <section className="performance-section">
                <div className="section-header">
                    <h2>Trainer Feedback</h2>
                    <p>Notes from the trainers who've worked with you</p>
                </div>

                {feedback.length === 0 ? (
                    <EmptyState
                        icon="💬"
                        title="No trainer feedback yet"
                        body="Feedback from your trainers will appear here."
                    />
                ) : (
                    <div className="feedback-timeline">
                        {feedback.map((item) => (
                            <div className="feedback-card" key={item._id}>
                                <div className="feedback-avatar">
                                    {initials(item.trainer?.name)}
                                </div>

                                <div className="feedback-body">
                                    <div className="feedback-header">
                                        <div>
                                            <strong>{item.trainer?.name || "Unknown Trainer"}</strong>

                                            {item.class && (
                                                <div className="feedback-class">
                                                    Class {item.class.classNumber}: {item.class.title}
                                                </div>
                                            )}
                                        </div>

                                        <span className="feedback-date">
                                            {new Date(item.date).toLocaleDateString(undefined, {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    <div className="feedback-rating">
                                        {"★".repeat(item.rating)}
                                        {"☆".repeat(5 - item.rating)}
                                        <span> ({item.rating}/5)</span>
                                    </div>

                                    <p>{item.comments}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function EmptyState({ icon, title, body }) {
    return (
        <div className="empty-state">
            <span className="empty-icon">{icon}</span>
            <strong>{title}</strong>
            <p>{body}</p>
        </div>
    );
}













// import { useStu } from "../../../hooks/useStu";

// import "./PerformancePage.css";

// export default function PerformancePage({ token }) {
//     // const { myPerformance } = useStu();
//       const {
//         myPerformance
//     } = useStu(token);


//     const performance = myPerformance?.data;

//     if (!performance) {
//         return (
//             <div className="performance-page">
//                 <div className="performance-loading">
//                     Loading performance...
//                 </div>
//             </div>
//         );
//     }

//     const { attendance, assessments, feedback } = performance;

//     return (
//         <div className="performance-page">

//             <div className="performance-header">
//                 <h1>My Performance</h1>
//                 <p>
//                     Track your attendance, assessments and trainer feedback.
//                 </p>
//             </div>

//             {/* Attendance */}

//             <section className="performance-section">
//                 <h2>Attendance</h2>

//                 <div className="stats-grid">

//                     <div className="stat-card">
//                         <span>Total Classes</span>
//                         <h2>{attendance.totalClasses}</h2>
//                     </div>

//                     <div className="stat-card green">
//                         <span>Present</span>
//                         <h2>{attendance.present}</h2>
//                     </div>

//                     <div className="stat-card red">
//                         <span>Absent</span>
//                         <h2>{attendance.absent}</h2>
//                     </div>

//                     <div className="stat-card blue">
//                         <span>Attendance %</span>
//                         <h2>{attendance.percentage}%</h2>
//                     </div>

//                 </div>

//                 <div className="attendance-progress">

//                     <div
//                         className="attendance-progress-fill"
//                         style={{
//                             width: `${attendance.percentage}%`,
//                         }}
//                     />

//                 </div>

//             </section>

//             {/* Assessments */}

//             <section className="performance-section">
//                 <h2>Assessments</h2>

//                 <div className="stats-grid">

//                     <div className="stat-card">
//                         <span>Attempted</span>
//                         <h2>{assessments.totalAttempted}</h2>
//                     </div>

//                     <div className="stat-card purple">
//                         <span>Average Score</span>
//                         <h2>{assessments.averageScorePercent}%</h2>
//                     </div>

//                     <div className="stat-card orange">
//                         <span>Best Score</span>
//                         <h2>{assessments.bestScorePercent}%</h2>
//                     </div>

//                 </div>

//                 <div className="table-wrapper">

//                     <table className="performance-table">

//                         <thead>
//                             <tr>
//                                 <th>Assessment</th>
//                                 <th>Score</th>
//                                 <th>Percentage</th>
//                                 <th>Date</th>
//                             </tr>
//                         </thead>

//                         <tbody>

//                             {assessments.submissions.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="4" className="empty-row">
//                                         No assessments attempted yet.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 assessments.submissions.map((submission) => (
//                                     <tr key={submission._id}>
//                                         <td>{submission.title}</td>
//                                         <td>
//                                             {submission.score} /{" "}
//                                             {submission.maxScore}
//                                         </td>
//                                         <td>{submission.percentage}%</td>
//                                         <td>
//                                             {new Date(
//                                                 submission.submittedAt
//                                             ).toLocaleDateString()}
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}

//                         </tbody>

//                     </table>

//                 </div>

//             </section>

//             {/* Feedback */}

//             <section className="performance-section">

//                 <h2>Trainer Feedback</h2>

//                 {feedback.length === 0 ? (
//                     <div className="empty-feedback">
//                         No feedback available yet.
//                     </div>
//                 ) : (
//                     <div className="feedback-list">

//                         {feedback.map((item) => (
//                             <div
//                                 className="feedback-card"
//                                 key={item._id}
//                             >
//                                 <div className="feedback-header">
//                                     <strong>{item.trainerName}</strong>

//                                     <span>
//                                         {new Date(
//                                             item.createdAt
//                                         ).toLocaleDateString()}
//                                     </span>
//                                 </div>

//                                 <p>{item.feedback}</p>

//                             </div>
//                         ))}

//                     </div>
//                 )}

//             </section>

//         </div>
//     );
// }