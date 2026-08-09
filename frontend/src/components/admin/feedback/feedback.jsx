
import { useMemo, useState } from "react";
import "./feedback.css";
import { useDashboard } from "../../../hooks/useDashboard";
import NewFeedback from "./components/newfeedback";
import UpdateFeedback from "./components/updatefeedback";
import {
    Pencil,
    Trash2,
    Copy,
    ArrowUpDown,
} from "lucide-react";
function normalizeFeedbackInput(AllFeedback) {
    if (Array.isArray(AllFeedback)) return AllFeedback;
    if (Array.isArray(AllFeedback?.data)) return AllFeedback.data;
    return [];
}

function formatDate(dateValue) {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getStars(rating = 0) {
    const filled = Math.max(0, Math.min(5, Number(rating) || 0));
    return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function getRatingLabel(rating) {
    const value = Number(rating) || 0;
    if (value >= 5) return "Excellent";
    if (value >= 4) return "Very Good";
    if (value >= 3) return "Good";
    if (value >= 2) return "Fair";
    return "Poor";
}

export default function FeedbackList({ token }) {
    const {
        AllFeedback,
        refresh,
        AllContentSkeletons,
        deleteFeedback,
    } = useDashboard(token);

    const feedbackData = useMemo(
        () => normalizeFeedbackInput(AllFeedback),
        [AllFeedback]
    );

    const [search, setSearch] = useState("");
    const [showNewFeedback, setShowNewFeedback] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [ratingFilter, setRatingFilter] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [deletingId, setDeletingId] = useState(null);

    const filteredFeedback = useMemo(() => {
        const q = search.trim().toLowerCase();

        const filtered = feedbackData.filter((item) => {
            const studentName = item.studentId?.name || "";
            const studentEmail = item.studentId?.email || "";
            const trainerName = item.trainerId?.name || "";
            const trainerEmail = item.trainerId?.email || "";
            const skeletonTitle = item.skeletonId?.title || "";
            const comments = item.comments || "";
            const rating = Number(item.rating) || 0;

            const matchesSearch =
                !q ||
                studentName.toLowerCase().includes(q) ||
                studentEmail.toLowerCase().includes(q) ||
                trainerName.toLowerCase().includes(q) ||
                trainerEmail.toLowerCase().includes(q) ||
                skeletonTitle.toLowerCase().includes(q) ||
                comments.toLowerCase().includes(q);

            const matchesRating =
                ratingFilter === "" || String(rating) === String(ratingFilter);

            return matchesSearch && matchesRating;
        });

        filtered.sort((a, b) => {
            const ra = Number(a.rating) || 0;
            const rb = Number(b.rating) || 0;
            const da = new Date(a.date || a.createdAt || 0).getTime();
            const db = new Date(b.date || b.createdAt || 0).getTime();

            if (sortBy === "oldest") return da - db;
            if (sortBy === "highest") return rb - ra;
            if (sortBy === "lowest") return ra - rb;

            return db - da;
        });

        return filtered;
    }, [feedbackData, search, ratingFilter, sortBy]);

    const totalCount = feedbackData.length;
    const visibleCount = filteredFeedback.length;
    const avgRating =
        totalCount > 0
            ? (
                feedbackData.reduce(
                    (sum, item) => sum + (Number(item.rating) || 0),
                    0
                ) / totalCount
            ).toFixed(1)
            : "0.0";
    async function handleDelete(feedback) {
        const confirmed = window.confirm(
            `Delete feedback for ${feedback.studentId?.name}?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(feedback._id);

            await deleteFeedback(feedback._id, token);

            refresh();
        } catch (err) {
            alert(err.message || "Failed to delete feedback.");
        } finally {
            setDeletingId(null);
        }
    }
    if (showNewFeedback) {
        return (
            <NewFeedback
                token={token}
                AllContentSkeletons={AllContentSkeletons}
                onBack={() => setShowNewFeedback(false)}
                onSuccess={() => {
                    refresh();
                    setShowNewFeedback(false);
                }}
            />
        );
    }

    if (editingFeedback) {
        return (
            <UpdateFeedback
                token={token}
                feedback={editingFeedback}
                AllContentSkeletons={AllContentSkeletons}
                onSuccess={() => {
                    refresh();
                    setEditingFeedback(null);
                }}
                onCancel={() => setEditingFeedback(null)}
            />
        );
    }

    return (
        <div className="feedback-list-page">

            <div className="feedback-list-shell">
                <div className="feedback-list-header">
                    <div>
                        <h1>Feedback</h1>
                        <p>
                            Review, search, and organize all submitted feedback in one place.
                        </p>
                    </div>

                    <button
                        className="btn-add-course"
                        onClick={() => setShowNewFeedback(true)}
                    >
                        + Add feedback
                    </button>
                </div>

                <div className="feedback-list-stat-feeds">
                    <div className="stat-feed-card">
                        <span className="stat-feed-label">Total</span>
                        <span className="stat-feed-value">{totalCount}</span>
                    </div>
                    <div className="stat-feed-card">
                        <span className="stat-feed-label">Visible</span>
                        <span className="stat-feed-value">{visibleCount}</span>
                    </div>
                    <div className="stat-feed-card">
                        <span className="stat-feed-label">Avg Rating</span>
                        <span className="stat-feed-value">{avgRating}</span>
                    </div>
                </div>

                <div className="feedback-list-toolbar">
                    <div className="feedback-search-wrap">
                        <input
                            type="text"
                            className="feedback-search"
                            placeholder="Search student, trainer, skeleton, comments..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="feedback-filters">
                        <select
                            className="feedback-select"
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>

                        <select
                            className="feedback-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                        </select>
                    </div>
                </div>

                {filteredFeedback.length === 0 ? (
                    <div className="feedback-empty">
                        <div className="feedback-empty-icon">📝</div>
                        <h3>No feedback found</h3>
                        <p>Try changing the search text or filters.</p>
                    </div>
                ) : (
                    <div className="feedback-grid">
                        {filteredFeedback.map((item) => {
                            const studentName = item.studentId?.name || "Unknown Student";
                            const studentEmail = item.studentId?.email || "";
                            const trainerName = item.trainerId?.name || "Unknown Trainer";
                            const skeletonTitle = item.skeletonId?.title || "General Feedback";
                            const classNumber = item.skeletonId?.classNumber;
                            const rating = Number(item.rating) || 0;

                            return (
                                <article className="feedback-card" key={item._id}>

                                    <div className="feedback-card-top">
                                        <div className="feedback-student-block">
                                            <h3>{studentName}</h3>
                                            {studentEmail && (
                                                <span className="feedback-subtext">
                                                    {studentEmail}
                                                </span>
                                            )}
                                        </div>


                                        <div className="feedback-rating-block">
                                            <span className={`rating-badge rating-${rating}`}>
                                                {rating}/5
                                            </span>
                                            <span
                                                className="rating-stars"
                                                aria-label={`${rating} out of 5`}
                                            >
                                                {getStars(rating)}
                                            </span>
                                            <span className="rating-label">
                                                {getRatingLabel(rating)}
                                            </span>
                                        </div>
                                    </div>


                                    <div className="feedback-meta-row">
                                        <span className="meta-pill meta-skeleton">
                                            {skeletonTitle}
                                            {classNumber ? ` • Class ${classNumber}` : ""}
                                        </span>

                                        <span className="meta-pill meta-date">
                                            {formatDate(item.date || item.createdAt)}
                                        </span>
                                    </div>

                                    <div className="feedback-comments">
                                        {item.comments?.trim()
                                            ? item.comments
                                            : "No comments provided."}
                                    </div>

                                    <div className="feedback-card-footer">
                                        <div className="footer-item">
                                            <span className="footer-label">Trainer</span>
                                            <span className="footer-value">{trainerName}</span>
                                        </div>

                                        <div className="footer-item footer-right">
                                            <span className="footer-label">
                                                Submitted
                                            </span>

                                            <span className="footer-value">
                                                {formatDate(item.date || item.createdAt)}
                                            </span>

                                            <div className="feedback-actions">
                                                <button
                                                    type="button"
                                                    className="btn-action btn-edit"
                                                    onClick={() => setEditingFeedback(item)}
                                                >
                                                    <Pencil />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn-action btn-delete"
                                                    disabled={deletingId === item._id}
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    {deletingId === item._id
                                                        ? "Deleting..."
                                                        : <Trash2 />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}








// import { useMemo, useState } from "react";
// import "./feedback.css";
// import { useDashboard } from "../../../hooks/useDashboard";
// import Newfeedback from "./components/newfeedback"
// import UpdateFeedback from "./components/updatefeedback"
// function normalizeFeedbackInput(AllFeedback) {
//     if (Array.isArray(AllFeedback)) return AllFeedback;
//     if (Array.isArray(AllFeedback?.data)) return AllFeedback.data;
//     return [];
// }

// function formatDate(dateValue) {
//     if (!dateValue) return "—";
//     const date = new Date(dateValue);
//     if (Number.isNaN(date.getTime())) return "—";

//     return date.toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//     });
// }

// function getStars(rating = 0) {
//     const filled = Math.max(0, Math.min(5, Number(rating) || 0));
//     return "★".repeat(filled) + "☆".repeat(5 - filled);
// }

// function getRatingLabel(rating) {
//     const value = Number(rating) || 0;
//     if (value >= 5) return "Excellent";
//     if (value >= 4) return "Very Good";
//     if (value >= 3) return "Good";
//     if (value >= 2) return "Fair";
//     return "Poor";
// }

// export default function FeedbackList({ token }) {
//     const {
//         AllFeedback,
//         refresh,
//         updateFeedback,
//         // selectedFeedback,
//         AllContentSkeletons,

//     } = useDashboard(token);

//     const feedbackData = useMemo(
//         () => normalizeFeedbackInput(AllFeedback),
//         [AllFeedback]
//     );


//     const [search, setSearch] = useState("");
//     const [ShowNewfeedback, setShowNewfeedback] = useState(false);
//     const [ratingFilter, setRatingFilter] = useState("");
//     const [selectedFeedback, setselectedFeedback] = useState("");
//     const [sortBy, setSortBy] = useState("newest");

//     const filteredFeedback = useMemo(() => {
//         const q = search.trim().toLowerCase();

//         const filtered = feedbackData.filter((item) => {
//             const studentName = item.studentId?.name || "";
//             const studentEmail = item.studentId?.email || "";
//             const trainerName = item.trainerId?.name || "";
//             const trainerEmail = item.trainerId?.email || "";
//             const skeletonTitle = item.skeletonId?.title || "";
//             const comments = item.comments || "";
//             const rating = Number(item.rating) || 0;

//             const matchesSearch =
//                 !q ||
//                 studentName.toLowerCase().includes(q) ||
//                 studentEmail.toLowerCase().includes(q) ||
//                 trainerName.toLowerCase().includes(q) ||
//                 trainerEmail.toLowerCase().includes(q) ||
//                 skeletonTitle.toLowerCase().includes(q) ||
//                 comments.toLowerCase().includes(q);

//             const matchesRating =
//                 ratingFilter === "" || String(rating) === String(ratingFilter);

//             return matchesSearch && matchesRating;
//         });

//         filtered.sort((a, b) => {
//             const ra = Number(a.rating) || 0;
//             const rb = Number(b.rating) || 0;
//             const da = new Date(a.date || a.createdAt || 0).getTime();
//             const db = new Date(b.date || b.createdAt || 0).getTime();

//             if (sortBy === "oldest") return da - db;
//             if (sortBy === "highest") return rb - ra;
//             if (sortBy === "lowest") return ra - rb;

//             return db - da;
//         });

//         return filtered;
//     }, [feedbackData, search, ratingFilter, sortBy]);

//     const totalCount = feedbackData.length;
//     const visibleCount = filteredFeedback.length;
//     const avgRating =
//         totalCount > 0
//             ? (
//                 feedbackData.reduce(
//                     (sum, item) => sum + (Number(item.rating) || 0),
//                     0
//                 ) / totalCount
//             ).toFixed(1)
//             : "0.0";

//     if (ShowNewfeedback) {
//         return (
//             <Newfeedback
//                 token={token}
//                 onBack={() => setShowNewfeedback(false)}
//                 onSuccess={refresh}

//             />
//         );
//     }
//     if (ShowNewfeedback) {
//         return (
//             <UpdateFeedback
//                 token={token}
//                 feedback={selectedFeedback}
//                 AllContentSkeletons={AllContentSkeletons}
//                 onSuccess={refresh}
//                 updateFeedback={updateFeedback}
//             />
//         );
//     }


//     return (
//         <div className="feedback-list-page">
//             {/* <pre>{JSON.stringify(AllFeedback, null, 2)}</pre> */}
//             <div className="feedback-list-shell">
//                 <div className="feedback-list-header">
//                     <div>
//                         <h1>Feedback</h1>
//                         <p>
//                             Review, search, and organize all submitted feedback in one place.
//                         </p>
//                     </div>
//                     <button
//                         className="btn-add-course"
//                         onClick={() => setShowNewfeedback(true)}
//                     >
//                         + Add feedback
//                     </button>

//                 </div>
//                 <div className="feedback-list-stat-feeds">
//                     <div className="stat-feed-card">
//                         <span className="stat-feed-label">Total</span>
//                         <span className="stat-feed-value">{totalCount}</span>
//                     </div>
//                     <div className="stat-feed-card">
//                         <span className="stat-feed-label">Visible</span>
//                         <span className="stat-feed-value">{visibleCount}</span>
//                     </div>
//                     <div className="stat-feed-card">
//                         <span className="stat-feed-label">Avg Rating</span>
//                         <span className="stat-feed-value">{avgRating}</span>
//                     </div>
//                 </div>

//                 <div className="feedback-list-toolbar">
//                     <div className="feedback-search-wrap">
//                         <input
//                             type="text"
//                             className="feedback-search"
//                             placeholder="Search student, trainer, skeleton, comments..."
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                         />
//                     </div>

//                     <div className="feedback-filters">
//                         <select
//                             className="feedback-select"
//                             value={ratingFilter}
//                             onChange={(e) => setRatingFilter(e.target.value)}
//                         >
//                             <option value="">All Ratings</option>
//                             <option value="5">5 Stars</option>
//                             <option value="4">4 Stars</option>
//                             <option value="3">3 Stars</option>
//                             <option value="2">2 Stars</option>
//                             <option value="1">1 Star</option>
//                         </select>

//                         <select
//                             className="feedback-select"
//                             value={sortBy}
//                             onChange={(e) => setSortBy(e.target.value)}
//                         >
//                             <option value="newest">Newest First</option>
//                             <option value="oldest">Oldest First</option>
//                             <option value="highest">Highest Rated</option>
//                             <option value="lowest">Lowest Rated</option>
//                         </select>
//                     </div>
//                 </div>

//                 {filteredFeedback.length === 0 ? (
//                     <div className="feedback-empty">
//                         <div className="feedback-empty-icon">📝</div>
//                         <h3>No feedback found</h3>
//                         <p>Try changing the search text or filters.</p>
//                     </div>
//                 ) : (
//                     <div className="feedback-grid">
//                         {filteredFeedback.map((item) => {
//                             const studentName = item.studentId?.name || "Unknown Student";
//                             const studentEmail = item.studentId?.email || "";
//                             const trainerName = item.trainerId?.name || "Unknown Trainer";
//                             const skeletonTitle = item.skeletonId?.title || "General Feedback";
//                             const classNumber = item.skeletonId?.classNumber;
//                             const rating = Number(item.rating) || 0;

//                             return (
//                                 <article className="feedback-card" key={item._id}>
//                                     <div className="feedback-card-top">
//                                         <div className="feedback-student-block">
//                                             <h3>{studentName}</h3>
//                                             {studentEmail && (
//                                                 <span className="feedback-subtext">{studentEmail}</span>
//                                             )}
//                                         </div>

//                                         <div className="feedback-rating-block">
//                                             <span className={`rating-badge rating-${rating}`}>
//                                                 {rating}/5
//                                             </span>
//                                             <span className="rating-stars" aria-label={`${rating} out of 5`}>
//                                                 {getStars(rating)}
//                                             </span>
//                                             <span className="rating-label">
//                                                 {getRatingLabel(rating)}
//                                             </span>
//                                         </div>
//                                     </div>

//                                     <div className="feedback-meta-row">
//                                         <span className="meta-pill meta-skeleton">
//                                             {skeletonTitle}
//                                             {classNumber ? ` • Class ${classNumber}` : ""}
//                                         </span>

//                                         <span className="meta-pill meta-date">
//                                             {formatDate(item.date || item.createdAt)}
//                                         </span>
//                                     </div>

//                                     <div className="feedback-comments">
//                                         {item.comments?.trim()
//                                             ? item.comments
//                                             : "No comments provided."}
//                                     </div>

//                                     <div className="feedback-card-footer">
//                                         <div className="footer-item">
//                                             <span className="footer-label">Trainer</span>
//                                             <span className="footer-value">{trainerName}</span>
//                                         </div>

//                                         <div className="footer-item footer-right">
//                                             <span className="footer-label">Submitted</span>
//                                             <span className="footer-value">
//                                                 {formatDate(item.date || item.createdAt)}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </article>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }