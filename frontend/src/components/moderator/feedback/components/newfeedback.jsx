import { useMemo, useState } from "react";
import "./newfeedback.css";

// import { createFeedback } from "../../services/api"; // Adjust path
import { useDashboard } from "../../../../hooks/useDashboard";
const INITIAL_FORM = {
    studentId: "",
    skeletonId: "",
    rating: 5,
    comments: "",
};

export default function Newfeedback({
    token,
    onSuccess,
    onBack
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    
    const {
        AllContentSkeletons = [],
        Allstudents = [],
        createFeedback,
        AllCourses,
      } = useDashboard(token);

    const filteredStudents = useMemo(() => {
        if (!selectedCourse) return Allstudents;

        return Allstudents.filter(
            (student) => student.courseId?._id === selectedCourse
        );
    }, [Allstudents, selectedCourse]);

    const filteredSkeletons = useMemo(() => {
        if (!selectedCourse) return AllContentSkeletons;

        return AllContentSkeletons.filter(
            (skeleton) => skeleton.programId === selectedCourse
        );
    }, [AllContentSkeletons, selectedCourse]);

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === "course") {
            setSelectedCourse(value);

            setForm((prev) => ({
                ...prev,
                studentId: "",
                skeletonId: "",
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: name === "rating" ? Number(value) : value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const payload = {
                studentId: form.studentId,
                rating: form.rating,
                comments: form.comments.trim(),
            };
            
            if (form.skeletonId) {
                payload.skeletonId = form.skeletonId;
            }
            
            await createFeedback(payload, token);
            
            setSuccess("Feedback submitted successfully.");
            setForm(INITIAL_FORM);
            setSelectedCourse("");
            
            if (onSuccess) {
                onSuccess();
                onBack();
            }
        } catch (err) {
            setError(err.message || "Failed to submit feedback.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="new-feedback-page">
            <button onClick={onBack}>← Back</button>

            <div className="feedback-card">
                <div className="feedback-header">
                    <h2>Create Feedback</h2>
                </div>

                <form
                    className="feedback-form"
                    onSubmit={handleSubmit}
                >
                    <div className="feedback-grid">

                        {/* Course */}
                        <div className="feedback-group">
                            <label>Course</label>

                            <select
                                name="course"
                                value={selectedCourse}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select Course
                                </option>

                                {AllCourses.map((course) => (
                                    <option
                                        key={course._id}
                                        value={course._id}
                                    >
                                        {course.courseCode}
                                        {course.collegeId?.name
                                            ? ` • ${course.collegeId.name}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Student */}
                        <div className="feedback-group">
                            <label>Student *</label>

                            <select
                                name="studentId"
                                value={form.studentId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Student
                                </option>

                                {filteredStudents.map((student) => (
                                    <option
                                        key={student._id}
                                        value={student.userId}
                                    >
                                        {student.rollNumber} • {student.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Skeleton */}
                        <div className="feedback-group">
                            <label>
                                Content Skeleton
                            </label>

                            <select
                                name="skeletonId"
                                value={form.skeletonId}
                                onChange={handleChange}
                            >
                                <option value="">
                                    General Feedback
                                </option>

                                {filteredSkeletons.map((item) => (
                                    <option
                                        key={item._id}
                                        value={item._id}
                                    >
                                        Class {item.classNumber} •{" "}
                                        {item.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Rating */}
                        <div className="feedback-group">
                            <label>Rating *</label>

                            <select
                                className="rating-select"
                                name="rating"
                                value={form.rating}
                                onChange={handleChange}
                            >
                                <option value={5}>
                                    ⭐⭐⭐⭐⭐ Excellent
                                </option>

                                <option value={4}>
                                    ⭐⭐⭐⭐ Very Good
                                </option>

                                <option value={3}>
                                    ⭐⭐⭐ Good
                                </option>

                                <option value={2}>
                                    ⭐⭐ Fair
                                </option>

                                <option value={1}>
                                    ⭐ Poor
                                </option>
                            </select>
                        </div>

                        {/* Comments */}
                        <div className="feedback-group full-width">
                            <label>Comments</label>

                            <textarea
                                name="comments"
                                rows={7}
                                placeholder="Write detailed feedback for the student..."
                                value={form.comments}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="feedback-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="feedback-success">
                            {success}
                        </div>
                    )}

                    <div className="feedback-actions">
                        <button
                            type="submit"
                            className="feedback-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Submitting..."
                                : "Submit Feedback"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}



















// import { useMemo, useState } from "react";
// // import { createFeedback } from "../../services/api"; // Adjust path
// import { useDashboard } from "../../../../hooks/useDashboard";
// const INITIAL_FORM = {
//     studentId: "",
//     skeletonId: "",
//     rating: 5,
//     comments: "",
// };

// export default function Newfeedback({
//     token,
//     onSuccess,
// }) {
//     const [form, setForm] = useState(INITIAL_FORM);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");
//     const [selectedCourse, setSelectedCourse] = useState("");
    
//     const {
//         AllContentSkeletons = [],
//         Allstudents = [],
//         createFeedback,
//         AllCourses,
//       } = useDashboard(token);

//     const filteredStudents = useMemo(() => {
//         if (!selectedCourse) return Allstudents;

//         return Allstudents.filter(
//             (student) => student.courseId?._id === selectedCourse
//         );
//     }, [Allstudents, selectedCourse]);

//     const filteredSkeletons = useMemo(() => {
//         if (!selectedCourse) return AllContentSkeletons;

//         return AllContentSkeletons.filter(
//             (skeleton) => skeleton.programId === selectedCourse
//         );
//     }, [AllContentSkeletons, selectedCourse]);

//     function handleChange(e) {
//         const { name, value } = e.target;

//         if (name === "course") {
//             setSelectedCourse(value);

//             setForm((prev) => ({
//                 ...prev,
//                 studentId: "",
//                 skeletonId: "",
//             }));

//             return;
//         }

//         setForm((prev) => ({
//             ...prev,
//             [name]: name === "rating" ? Number(value) : value,
//         }));
//     }

//     async function handleSubmit(e) {
//         e.preventDefault();

//         setLoading(true);
//         setError("");
//         setSuccess("");

//         try {
//             const payload = {
//                 studentId: form.studentId,
//                 rating: form.rating,
//                 comments: form.comments.trim(),
//             };

//             if (form.skeletonId) {
//                 payload.skeletonId = form.skeletonId;
//             }

//             await createFeedback(payload, token);

//             setSuccess("Feedback submitted successfully.");

//             setForm(INITIAL_FORM);
//             setSelectedCourse("");

//             if (onSuccess) {
//                 onSuccess();
//             }
//         } catch (err) {
//             setError(err.message || "Failed to submit feedback.");
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div className="card">
//             <div className="card-header">
//                 <h2>Create Feedback</h2>
//             </div>

//             <form onSubmit={handleSubmit} className="form">
//                 {/* Course */}
//                 <div className="form-group">
//                     <label>Course</label>

//                     <select
//                         name="course"
//                         value={selectedCourse}
//                         onChange={handleChange}
//                     >
//                         <option value="">All Courses</option>

//                         {AllCourses.map((course) => (
//                             <option key={course._id} value={course._id}>
//                                 {course.courseCode}
//                                 {course.collegeId?.name
//                                     ? ` • ${course.collegeId.name}`
//                                     : ""}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Student */}
//                 <div className="form-group">
//                     <label>Student *</label>

//                     <select
//                         name="studentId"
//                         value={form.studentId}
//                         onChange={handleChange}
//                         required
//                     >
//                         <option value="">Select Student</option>

//                         {filteredStudents.map((student) => (
//                             <option
//                                 key={student._id}
//                                 value={student.userId}
//                             >
//                                 {student.rollNumber} • {student.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Skeleton */}
//                 <div className="form-group">
//                     <label>Content Skeleton (Optional)</label>

//                     <select
//                         name="skeletonId"
//                         value={form.skeletonId}
//                         onChange={handleChange}
//                     >
//                         <option value="">General Feedback</option>

//                         {filteredSkeletons.map((item) => (
//                             <option
//                                 key={item._id}
//                                 value={item._id}
//                             >
//                                 Class {item.classNumber} • {item.title}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Rating */}
//                 <div className="form-group">
//                     <label>Rating *</label>

//                     <select
//                         name="rating"
//                         value={form.rating}
//                         onChange={handleChange}
//                     >
//                         <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
//                         <option value={4}>⭐⭐⭐⭐ (4)</option>
//                         <option value={3}>⭐⭐⭐ (3)</option>
//                         <option value={2}>⭐⭐ (2)</option>
//                         <option value={1}>⭐ (1)</option>
//                     </select>
//                 </div>

//                 {/* Comments */}
//                 <div className="form-group">
//                     <label>Comments</label>

//                     <textarea
//                         name="comments"
//                         rows={6}
//                         placeholder="Write feedback..."
//                         value={form.comments}
//                         onChange={handleChange}
//                     />
//                 </div>

//                 {error && (
//                     <div className="error-message">
//                         {error}
//                     </div>
//                 )}

//                 {success && (
//                     <div className="success-message">
//                         {success}
//                     </div>
//                 )}

//                 <button
//                     type="submit"
//                     disabled={loading}
//                     className="btn-primary"
//                 >
//                     {loading
//                         ? "Submitting..."
//                         : "Submit Feedback"}
//                 </button>
//             </form>
//         </div>
//     );
// }










// // import { useState } from "react";
// // // import { createFeedback } from "../../services/api"; // adjust path
// // import './newfeedback.css'

// // import { useDashboard } from "../../../../hooks/useDashboard";
// // const INITIAL_FORM = {
// //     studentId: "",
// //     skeletonId: "",
// //     rating: 5,
// //     comments: "",
// // };

// // export default function Newfeedback({
// //     token,
// //     onSuccess,
// // }) {
// //     const [form, setForm] = useState(INITIAL_FORM);
// //     const [loading, setLoading] = useState(false);
// //     const [error, setError] = useState("");
// //     const [success, setSuccess] = useState("");
    
// //     const {
// //         AllContentSkeletons = [],
// //         Allstudents = [],
// //         createFeedback
// //       } = useDashboard(token);

// //     function handleChange(e) {
// //         const { name, value } = e.target;

// //         setForm((prev) => ({
// //             ...prev,
// //             [name]:
// //                 name === "rating"
// //                     ? Number(value)
// //                     : value,
// //         }));
// //     }

// //     async function handleSubmit(e) {
// //         e.preventDefault();

// //         setLoading(true);
// //         setError("");
// //         setSuccess("");

// //         try {
// //             const payload = {
// //                 studentId: form.studentId,
// //                 rating: form.rating,
// //                 comments: form.comments.trim(),
// //             };

// //             if (form.skeletonId) {
// //                 payload.skeletonId = form.skeletonId;
// //             }

// //             await createFeedback(payload, token);

// //             setSuccess("Feedback submitted successfully.");

// //             setForm(INITIAL_FORM);

// //             if (onSuccess) {
// //                 onSuccess();
// //             }
// //         } catch (err) {
// //             setError(err.message || "Failed to submit feedback.");
// //         } finally {
// //             setLoading(false);
// //         }
// //     }

// //     return (
// //         <div className="card">
// //             <div className="card-header">
// //                 <h2>Create Feedback</h2>
// //             </div>

// //             <form onSubmit={handleSubmit} className="form">

// //                 <div className="form-group">
// //                     <label>Student *</label>

// //                     <select
// //                         name="studentId"
// //                         value={form.studentId}
// //                         onChange={handleChange}
// //                         required
// //                     >
// //                         <option value="">Select Student</option>

// //                         {Allstudents.map((student) => (
// //                             <option
// //                                 key={student._id}
// //                                 value={student.userId}
// //                             >
// //                                 {student.rollNumber} - {student.name}
// //                             </option>
// //                         ))}
// //                     </select>
// //                 </div>

// //                 <div className="form-group">
// //                     <label>Content Skeleton (Optional)</label>

// //                     <select
// //                         name="skeletonId"
// //                         value={form.skeletonId}
// //                         onChange={handleChange}
// //                     >
// //                         <option value="">General Feedback</option>

// //                         {AllContentSkeletons.map((item) => (
// //                             <option
// //                                 key={item._id}
// //                                 value={item._id}
// //                             >
// //                                 Class {item.classNumber} • {item.title}
// //                             </option>
// //                         ))}
// //                     </select>
// //                 </div>

// //                 <div className="form-group">
// //                     <label>Rating *</label>

// //                     <select
// //                         name="rating"
// //                         value={form.rating}
// //                         onChange={handleChange}
// //                     >
// //                         <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
// //                         <option value={4}>⭐⭐⭐⭐ (4)</option>
// //                         <option value={3}>⭐⭐⭐ (3)</option>
// //                         <option value={2}>⭐⭐ (2)</option>
// //                         <option value={1}>⭐ (1)</option>
// //                     </select>
// //                 </div>

// //                 <div className="form-group">
// //                     <label>Comments</label>

// //                     <textarea
// //                         name="comments"
// //                         rows={6}
// //                         placeholder="Write feedback..."
// //                         value={form.comments}
// //                         onChange={handleChange}
// //                     />
// //                 </div>

// //                 {error && (
// //                     <div className="error-message">
// //                         {error}
// //                     </div>
// //                 )}

// //                 {success && (
// //                     <div className="success-message">
// //                         {success}
// //                     </div>
// //                 )}

// //                 <button
// //                     type="submit"
// //                     disabled={loading}
// //                     className="btn-primary"
// //                 >
// //                     {loading
// //                         ? "Submitting..."
// //                         : "Submit Feedback"}
// //                 </button>
// //             </form>
// //         </div>
// //     );
// // }