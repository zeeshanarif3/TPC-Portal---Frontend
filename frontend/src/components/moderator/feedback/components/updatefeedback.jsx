import { useEffect, useMemo, useState } from "react";
import "./newfeedback.css";
// import { updateFeedback } from "../../services/api"; // Adjust path
import { useDashboard } from "../../../../hooks/useDashboard";
const EMPTY_FORM = {
    skeletonId: "",
    rating: 5,
    comments: "",
};

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

export default function UpdateFeedback({
    token,
    feedback,
    AllContentSkeletons = [],
    onSuccess,
    onCancel,
    updateFeedback,
}) {

    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!feedback) return;

        setForm({
            skeletonId: feedback?.skeletonId?._id || "",
            rating: Number(feedback?.rating) || 5,
            comments: feedback?.comments || "",
        });

        setError("");
        setSuccess("");
    }, [feedback]);

    const selectedSkeleton = useMemo(() => {
        if (!form.skeletonId) return null;
        return AllContentSkeletons.find((item) => item._id === form.skeletonId) || null;
    }, [AllContentSkeletons, form.skeletonId]);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "rating" ? Number(value) : value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!feedback?._id) {
            setError("No feedback selected to update.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                rating: form.rating,
                comments: form.comments.trim(),
                skeletonId: form.skeletonId || null,
            };

            await updateFeedback(feedback._id, payload, token);

            setSuccess("Feedback updated successfully.");

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err.message || "Failed to update feedback.");
        } finally {
            setLoading(false);
        }
    }

    if (!feedback) {
        return (
            <div className="new-feedback-page">
                <div className="feedback-card">
                    <div className="feedback-header">
                        <h2>Update Feedback</h2>
                    </div>
                    <div className="feedback-form">
                        <div className="feedback-empty">
                            <div className="feedback-empty-icon">📝</div>
                            <h3>No feedback selected</h3>
                            <p>Select a feedback item to edit it.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="new-feedback-page">
            <div className="feedback-card">
                <div className="feedback-header">
                    <h2>Update Feedback</h2>
                </div>

                <form className="feedback-form" onSubmit={handleSubmit}>
                    <div className="feedback-grid">
                        <div className="feedback-group">
                            <label>Student</label>
                            <input
                                type="text"
                                value={feedback?.studentId?.name || "—"}
                                readOnly
                            />
                        </div>

                        <div className="feedback-group">
                            <label>Trainer</label>
                            <input
                                type="text"
                                value={feedback?.trainerId?.name || "—"}
                                readOnly
                            />
                        </div>

                        <div className="feedback-group">
                            <label>Submitted On</label>
                            <input
                                type="text"
                                value={formatDate(feedback?.date || feedback?.createdAt)}
                                readOnly
                            />
                        </div>

                        <div className="feedback-group">
                            <label>Current Rating</label>
                            <input
                                type="text"
                                value={`${Number(feedback?.rating) || 0}/5 • ${getRatingLabel(feedback?.rating)} • ${getStars(feedback?.rating)}`}
                                readOnly
                            />
                        </div>

                        <div className="feedback-group">
                            <label>Content Skeleton</label>
                            <select
                                name="skeletonId"
                                value={form.skeletonId}
                                onChange={handleChange}
                            >
                                <option value="">General Feedback</option>

                                {AllContentSkeletons.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        Class {item.classNumber} • {item.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="feedback-group">
                            <label>Selected Skeleton Preview</label>
                            <input
                                type="text"
                                value={
                                    selectedSkeleton
                                        ? `Class ${selectedSkeleton.classNumber} • ${selectedSkeleton.title}`
                                        : "General Feedback"
                                }
                                readOnly
                            />
                        </div>

                        <div className="feedback-group">
                            <label>Rating *</label>

                            <select
                                className="rating-select"
                                name="rating"
                                value={form.rating}
                                onChange={handleChange}
                                required
                            >
                                <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                                <option value={4}>⭐⭐⭐⭐ Very Good</option>
                                <option value={3}>⭐⭐⭐ Good</option>
                                <option value={2}>⭐⭐ Fair</option>
                                <option value={1}>⭐ Poor</option>
                            </select>
                        </div>

                        <div className="feedback-group" />
                    </div>

                    <div className="feedback-group full-width">
                        <label>Comments</label>
                        <textarea
                            name="comments"
                            rows={7}
                            placeholder="Update feedback comments..."
                            value={form.comments}
                            onChange={handleChange}
                        />
                    </div>

                    {error && <div className="feedback-error">{error}</div>}
                    {success && <div className="feedback-success">{success}</div>}

                    <div className="feedback-actions">
                        {onCancel && (
                            <button
                                type="button"
                                className="feedback-submit"
                                onClick={onCancel}
                                style={{
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-primary)",
                                    border: "1px solid var(--border-color)",
                                }}
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            className="feedback-submit"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Feedback"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
       
