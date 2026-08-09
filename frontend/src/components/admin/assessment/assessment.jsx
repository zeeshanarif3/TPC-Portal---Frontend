import { useState } from "react";

import NewAssessment from "./components/newassessment";
import UpdateAssessment from "./components/updateAssessment";
import { useDashboard } from "../../../hooks/useDashboard";

import "./assessment.css";

export default function Assessment({ token }) {
    const {
        AllCourses = [],
        AllContentSkeletons = [],
        AllAssessments = [],
        AssessmentSubmissions = [],
        createAssessment,
        updateAssessment,
        getAssessmentSubmissions,
        deleteAssessment,
        getAllAssessments, // optional, if your hook exposes it
        refresh
    } = useDashboard(token);

    const [showNewAssessment, setshowNewAssessment] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState(null);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const assessments = AllAssessments?.data || [];

    const filteredAssessments = assessments.filter((a) => {
        const title = a.title || "";
        const matchesSearch = title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesDate =
            !dateFilter || a.scheduledDate?.slice(0, 10) === dateFilter;

        return matchesSearch && matchesDate;
    });

    const total = assessments.length;
    const drafts = assessments.filter((a) => a.status === "draft").length;
    const published = assessments.filter((a) => a.status === "published").length;
    const submissions = assessments.reduce(
        (sum, a) => sum + (a.submissionCount || 0),
        0
    );

    const handleViewResults = async (assessment) => {
        try {
            setLoadingResults(true);
            await getAssessmentSubmissions(assessment._id);
            setSelectedAssessment(assessment);
        } catch (err) {
            alert(err.message || "Failed to load submissions");
        } finally {
            setLoadingResults(false);
        }
    };

    const handleDeleteAssessment = async (assessment) => {
        const confirmed = window.confirm(
            `Delete "${assessment.title}"?\n\nThis will permanently delete the assessment and all associated submissions.`
        );

        if (!confirmed) return;

        try {
            setDeletingId(assessment._id);

            const res = await deleteAssessment(assessment._id);

            alert(res?.message || "Assessment deleted successfully");

            // if (typeof getAllAssessments === "function") {
            //     await getAllAssessments();
            // } else {
            //     window.location.reload();
            //}
            refresh();
        } catch (err) {
            alert(err.message || "Failed to delete assessment");
        } finally {
            setDeletingId(null);
        }
    };

    if (selectedAssessment) {
        return (
            <div className="assessment-page">
                <div className="assessment-header">
                    <div>
                        <h1>{selectedAssessment.title}</h1>
                        <p>Assessment Submissions</p>
                    </div>

                    <button
                        className="new-assessment-btn"
                        onClick={() => setSelectedAssessment(null)}
                    >
                        ← Back
                    </button>
                </div>

                <div className="assessment-results">
                    {loadingResults ? (
                        <p>Loading...</p>
                    ) : AssessmentSubmissions.length === 0 ? (
                        <div className="empty-state">
                            <h3>No submissions yet</h3>
                        </div>
                    ) : (
                        <table className="results-table">
                            <thead>
                                <tr className="as-table-content">
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            {/* <pre>{JSON.stringify(AssessmentSubmissions, null, 2)}</pre> */}
                            <tbody>
                                {AssessmentSubmissions.map((submission) => (
                                    <tr key={submission._id}>
                                        <td>{submission.studentId?.name || "-"}</td>
                                        <td>{submission.studentId?.email || "-"}</td>
                                        <td>
                                            {submission.score} / {submission.totalMarks}
                                        </td>
                                        {/* <td>{submission.percentage}%</td> */}
                                        <td>{(submission.score / submission.totalMarks)*100}%</td>
                                        <td>
                                            {submission.submittedAt
                                                ? new Date(
                                                      submission.submittedAt
                                                  ).toLocaleString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        );
    }

    if (showNewAssessment) {
        return (
            <NewAssessment
                token={token}
                mode="create"
                onBack={() => setshowNewAssessment(false)}
                AllCourses={AllCourses}
                AllContentSkeletons={AllContentSkeletons}
                createAssessment={createAssessment}
            />
        );
    }

    if (editingAssessment) {
        return (
            <UpdateAssessment
                token={token}
                mode="edit"
                activeAssessment={editingAssessment}
                onBack={() => setEditingAssessment(null)}
                AllCourses={AllCourses}
                AllContentSkeletons={AllContentSkeletons}
                updateAssessment={updateAssessment}
            />
        );
    }

    return (
        <div className="assessment-page">
            <div className="assessment-header">
                <div>
                    <h1>Assessment Management</h1>
                    <p>Create, schedule and monitor assessments.</p>
                </div>

                <button
                    className="new-assessment-btn"
                    onClick={() => setshowNewAssessment(true)}
                >
                    + New Assessment
                </button>
            </div>

            <div className="assessment-stats">
                <div className="stat-card">
                    <span>Total</span>
                    <h2>{total}</h2>
                </div>

                <div className="stat-card">
                    <span>Published</span>
                    <h2>{published}</h2>
                </div>

                <div className="stat-card">
                    <span>Draft</span>
                    <h2>{drafts}</h2>
                </div>

                <div className="stat-card">
                    <span>Submissions</span>
                    <h2>{submissions}</h2>
                </div>
            </div>

            <div className="assessment-toolbar">
                <input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>

            <div className="assessment-grid">
                {filteredAssessments.length === 0 && (
                    <div className="empty-state">
                        <h3>No assessments found</h3>
                        <p>Create your first assessment to get started.</p>
                    </div>
                )}

                {filteredAssessments.map((assessment) => {
                    const skeleton = AllContentSkeletons.find(
                        (s) => s._id === assessment.skeletonId
                    );

                    return (
                        <div className="assessment-card" key={assessment._id}>
                            <div className="assessment-card-header">
                                <div>
                                    <h3>{assessment.title}</h3>
                                    <span className={`status ${assessment.status}`}>
                                        {assessment.status}
                                    </span>
                                </div>
                            </div>

                            <div className="assessment-meta">
                                <div>
                                    <label>Questions</label>
                                    <strong>{assessment.questions?.length || 0}</strong>
                                </div>

                                <div>
                                    <label>Duration</label>
                                    <strong>{assessment.durationMinutes || 0} mins</strong>
                                </div>

                                <div>
                                    <label>Attempts</label>
                                    <strong>{assessment.submissionCount || 0}</strong>
                                </div>
                            </div>

                            <div className="assessment-info">
                                <p>
                                    <strong>Skeleton:</strong>{" "}
                                    {skeleton?.title || "Unknown"}
                                </p>

                                <p>
                                    <strong>Scheduled:</strong>{" "}
                                    {assessment.scheduledDate
                                        ? new Date(
                                              assessment.scheduledDate
                                          ).toLocaleDateString()
                                        : "-"}
                                </p>

                                <p>
                                    <strong>Deadline:</strong>{" "}
                                    {assessment.deadline
                                        ? new Date(assessment.deadline).toLocaleDateString()
                                        : "-"}
                                </p>
                            </div>

                            <div className="assessment-actions">
                                <button onClick={() => setEditingAssessment(assessment)}>
                                    Edit
                                </button>

                                <button
                                    onClick={() => {
                                        if (assessment.status === "draft") {
                                            // publish later
                                        } else {
                                            handleViewResults(assessment);
                                        }
                                    }}
                                >
                                    {assessment.status === "draft"
                                        ? "Publish"
                                        : "Results"}
                                </button>

                                <button
                                    className="delete-btn"
                                    disabled={deletingId === assessment._id}
                                    onClick={() => handleDeleteAssessment(assessment)}
                                >
                                    {deletingId === assessment._id
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}













// import { useState } from "react";

// import NewAssessment from "./components/newassessment";
// import UpdateAssessment from "./components/updateAssessment";
// import { useDashboard } from "../../../hooks/useDashboard";

// import "./assessment.css";

// export default function Assessment({ token }) {
//     const {
//         AllCourses = [],
//         AllContentSkeletons = [],
//         AllAssessments = [],
//         createAssessment,
//         updateAssessment,
//         AssessmentSubmissions,
//         getAssessmentSubmissions,
//     } = useDashboard(token);

//     const [showNewAssessment, setshowNewAssessment] = useState(false);
//     const [editingAssessment, setEditingAssessment] = useState(null);
//     const [selectedAssessment, setSelectedAssessment] = useState(null);
//     const [loadingResults, setLoadingResults] = useState(false);


//     const [searchTerm, setSearchTerm] = useState("");
//     const [dateFilter, setDateFilter] = useState("");

//     const assessments = AllAssessments?.data || [];

//     const filteredAssessments = assessments.filter((a) => {
//         const matchesSearch =
//             a.title.toLowerCase().includes(searchTerm.toLowerCase());

//         const matchesDate =
//             !dateFilter ||
//             a.scheduledDate?.slice(0, 10) === dateFilter;

//         return matchesSearch && matchesDate;
//     });

//     const total = assessments.length;
//     const drafts = assessments.filter(a => a.status === "draft").length;
//     const published = assessments.filter(a => a.status === "published").length;
//     const submissions = assessments.reduce(
//         (sum, a) => sum + (a.submissionCount || 0),
//         0
//     );



//     const handleViewResults = async (assessment) => {
//         try {
//             setLoadingResults(true);
//             await getAssessmentSubmissions(assessment._id);
//             setSelectedAssessment(assessment);
//         } catch (err) {
//             alert(err.message || "Failed to load submissions");
//         } finally {
//             setLoadingResults(false);
//         }
//     };


//     if (selectedAssessment) {
//         return (
//             <div className="assessment-page">

//                 <div className="assessment-header">
//                     <div>
//                         <h1>{selectedAssessment.title}</h1>
//                         <p>Assessment Submissions</p>
//                     </div>

//                     <button
//                         className="new-assessment-btn"
//                         onClick={() => setSelectedAssessment(null)}
//                     >
//                         ← Back
//                     </button>
//                 </div>

//                 <div className="assessment-results">
//                     {/* <pre>{JSON.stringify(AssessmentSubmissions, null, 2)}</pre> */}

//                     {loadingResults ? (
//                         <p>Loading...</p>
//                     ) : AssessmentSubmissions.length === 0 ? (
//                         <div className="empty-state">
//                             <h3>No submissions yet</h3>
//                         </div>
//                     ) : (
//                         <table className="results-table">
//                             <thead>
//                                 <tr>
//                                     <th>Student</th>
//                                     <th>Email</th>
//                                     <th>Score</th>
//                                     <th>Percentage</th>
//                                     <th>Submitted</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {AssessmentSubmissions.map((submission) => {
//                                     const student = submission.studentId;
//                                     const percentage = Math.round(
//                                         (submission.score / submission.totalMarks) * 100
//                                     );

//                                     return (
//                                         <tr key={submission._id}>
//                                             <td>
//                                                 <div className="student-cell">
//                                                     <div className="student-avatar">
//                                                         {student?.name?.charAt(0).toUpperCase() || "?"}
//                                                     </div>

//                                                     <span className="student-name">
//                                                         {student?.name}
//                                                     </span>
//                                                 </div>
//                                             </td>

//                                             <td className="student-email">
//                                                 {student?.email}
//                                             </td>

//                                             <td>
//                                                 <span className="score-badge">
//                                                     {submission.score} / {submission.totalMarks}
//                                                 </span>
//                                             </td>

//                                             <td>
//                                                 <span
//                                                     className={`percentage-badge ${percentage >= 80
//                                                             ? "excellent"
//                                                             : percentage >= 60
//                                                                 ? "good"
//                                                                 : percentage >= 40
//                                                                     ? "average"
//                                                                     : "poor"
//                                                         }`}
//                                                 >
//                                                     {percentage}%
//                                                 </span>
//                                             </td>

//                                             <td className="submitted-date">
//                                                 <div>
//                                                     {new Date(
//                                                         submission.submittedAt
//                                                     ).toLocaleDateString()}
//                                                 </div>
//                                                 <small>
//                                                     {new Date(
//                                                         submission.submittedAt
//                                                     ).toLocaleTimeString([], {
//                                                         hour: "2-digit",
//                                                         minute: "2-digit",
//                                                     })}
//                                                 </small>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     )}

//                 </div>

//             </div>
//         );
//     }




//     if (showNewAssessment) {
//         return (
//             <NewAssessment
//                 token={token}
//                 mode="create"
//                 onBack={() => setshowNewAssessment(false)}
//                 AllCourses={AllCourses}
//                 AllContentSkeletons={AllContentSkeletons}
//                 createAssessment={createAssessment}
//             />
//         );
//     }
//     if (editingAssessment) {
//         return (
//             <UpdateAssessment
//                 token={token}
//                 mode="edit"
//                 activeAssessment={editingAssessment}
//                 onBack={() => setEditingAssessment(null)}
//                 AllCourses={AllCourses}
//                 AllContentSkeletons={AllContentSkeletons}
//                 updateAssessment={updateAssessment}
//             />
//         );
//     }
//     return (
//         <div className="assessment-page">

//             <div className="assessment-header">

//                 <div>
//                     <h1>Assessment Management</h1>
//                     <p>Create, schedule and monitor assessments.</p>
//                 </div>

//                 <button
//                     className="new-assessment-btn"
//                     onClick={() => setshowNewAssessment(true)}
//                 >
//                     + New Assessment
//                 </button>

//             </div>

//             <div className="assessment-stats">

//                 <div className="stat-card">
//                     <span>Total</span>
//                     <h2>{total}</h2>
//                 </div>

//                 <div className="stat-card">
//                     <span>Published</span>
//                     <h2>{published}</h2>
//                 </div>

//                 <div className="stat-card">
//                     <span>Draft</span>
//                     <h2>{drafts}</h2>
//                 </div>

//                 <div className="stat-card">
//                     <span>Submissions</span>
//                     <h2>{submissions}</h2>
//                 </div>

//             </div>

//             <div className="assessment-toolbar">

//                 <input
//                     placeholder="Search assessments..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />

//                 <input
//                     type="date"
//                     value={dateFilter}
//                     onChange={(e) => setDateFilter(e.target.value)}
//                 />

//             </div>

//             <div className="assessment-grid">

//                 {filteredAssessments.length === 0 && (
//                     <div className="empty-state">
//                         <h3>No assessments found</h3>
//                         <p>Create your first assessment to get started.</p>
//                     </div>
//                 )}

//                 {filteredAssessments.map((assessment) => {

//                     const skeleton = AllContentSkeletons.find(
//                         s => s._id === assessment.skeletonId
//                     );

//                     return (

//                         <div
//                             className="assessment-card"
//                             key={assessment._id}
//                         >

//                             <div className="assessment-card-header">

//                                 <div>

//                                     <h3>{assessment.title}</h3>

//                                     <span className={`status ${assessment.status}`}>
//                                         {assessment.status}
//                                     </span>

//                                 </div>

//                             </div>

//                             <div className="assessment-meta">

//                                 <div>
//                                     <label>Questions</label>
//                                     <strong>
//                                         {assessment.questions.length}
//                                     </strong>
//                                 </div>

//                                 <div>
//                                     <label>Duration</label>
//                                     <strong>
//                                         {assessment.durationMinutes} mins
//                                     </strong>
//                                 </div>

//                                 <div>
//                                     <label>Attempts</label>
//                                     <strong>
//                                         {assessment.submissionCount}
//                                     </strong>
//                                 </div>

//                             </div>

//                             <div className="assessment-info">

//                                 <p>
//                                     <strong>Skeleton:</strong>{" "}
//                                     {skeleton?.title || "Unknown"}
//                                 </p>

//                                 <p>
//                                     <strong>Scheduled:</strong>{" "}
//                                     {new Date(
//                                         assessment.scheduledDate
//                                     ).toLocaleDateString()}
//                                 </p>

//                                 <p>
//                                     <strong>Deadline:</strong>{" "}
//                                     {new Date(
//                                         assessment.deadline
//                                     ).toLocaleDateString()}
//                                 </p>

//                             </div>

//                             <div className="assessment-actions">

//                                 <button
//                                     onClick={() => setEditingAssessment(assessment)}
//                                 >
//                                     Edit
//                                 </button>

//                                 {/* <button>Duplicate</button> */}

//                                 <button
//                                     onClick={() => {
//                                         if (assessment.status === "draft") {
//                                             // publish later
//                                         } else {
//                                             handleViewResults(assessment);
//                                         }
//                                     }}
//                                 >
//                                     {assessment.status === "draft"
//                                         ? "Publish"
//                                         : "Results"}
//                                 </button>
//                             </div>

//                         </div>

//                     )

//                 })}

//             </div>

//         </div>
//     );
// }
