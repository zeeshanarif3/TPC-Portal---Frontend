import { useState, useEffect } from "react";
import "./newcontent.css";

export default function UpdateContentSkeleton({
    skeleton,
    AllCourses = [],
    updateContentSkeleton,
    onBack,
}) {
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: "",
        programId: "",
        classNumber: 1,
        expectedFormat: "pdf",
        status: "draft",

        timeline: {
            scheduledDate: "",
            deadline: "",
        },

        metadata: {
            topic: "",
            description: "",
            tags: "",
            durationMinutes: 0,
        },
    });

    useEffect(() => {
        if (!skeleton) return;

        setForm({
            title: skeleton.title || "",
            programId: skeleton.programId?._id || skeleton.programId || "",
            classNumber: skeleton.classNumber || 1,
            expectedFormat: skeleton.expectedFormat || "pdf",
            status: skeleton.status || "draft",

            timeline: {
                scheduledDate: skeleton.timeline?.scheduledDate
                    ? skeleton.timeline.scheduledDate.slice(0, 10)
                    : "",
                deadline: skeleton.timeline?.deadline
                    ? skeleton.timeline.deadline.slice(0, 10)
                    : "",
            },

            metadata: {
                topic: skeleton.metadata?.topic || "",
                description: skeleton.metadata?.description || "",
                tags: (skeleton.metadata?.tags || []).join(", "),
                durationMinutes:
                    skeleton.metadata?.durationMinutes || 0,
            },
        });
    }, [skeleton]);

    const submit = async (e) => {
        e.preventDefault();

        setSaving(true);

        try {
            await updateContentSkeleton(skeleton._id, {
                ...form,

                classNumber: Number(form.classNumber),

                metadata: {
                    ...form.metadata,
                    durationMinutes: Number(
                        form.metadata.durationMinutes
                    ),
                    tags: form.metadata.tags
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                },
            });

            if (onBack) onBack();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="cm-wrap">
            <div className="cm-header">
                <button
                    className="cm-back"
                    type="button"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <div>
                    <h1>Edit Content Skeleton</h1>
                    <p className="cm-subtitle">
                        Update the metadata for this class. Uploaded
                        content remains unchanged.
                    </p>
                </div>
            </div>

            <form className="cm-card" onSubmit={submit}>
                <div className="cm-section">
                    <h3>Basics</h3>

                    <div className="cm-grid">
                        <div className="cm-field cm-field-full">
                            <label>Title</label>
                            <input
                                value={form.title}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        title: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="cm-field">
                            <label>Program</label>

                            <select
                                value={form.programId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        programId: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Select Program
                                </option>

                                {AllCourses.map((course) => (
                                    <option
                                        key={course._id}
                                        value={course._id}
                                    >
                                        {course.courseCode}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="cm-field">
                            <label>Class Number</label>

                            <input
                                type="number"
                                min="1"
                                value={form.classNumber}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        classNumber: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="cm-field">
                            <label>Expected Format</label>

                            <select
                                value={form.expectedFormat}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        expectedFormat:
                                            e.target.value,
                                    })
                                }
                            >
                                <option value="pdf">PDF</option>
                                <option value="doc">DOC</option>
                                <option value="video">
                                    VIDEO
                                </option>
                                <option value="link">LINK</option>
                                <option value="live">LIVE</option>
                            </select>
                        </div>

                        <div className="cm-field">
                            <label>Status</label>

                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option value="draft">
                                    Draft
                                </option>
                                <option value="published">
                                    Published
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="cm-section">
                    <h3>Timeline</h3>

                    <div className="cm-grid">
                        <div className="cm-field">
                            <label>Scheduled Date</label>

                            <input
                                type="date"
                                value={form.timeline.scheduledDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        timeline: {
                                            ...form.timeline,
                                            scheduledDate:
                                                e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>

                        <div className="cm-field">
                            <label>Deadline</label>

                            <input
                                type="date"
                                value={form.timeline.deadline}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        timeline: {
                                            ...form.timeline,
                                            deadline:
                                                e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="cm-section">
                    <h3>Metadata</h3>

                    <div className="cm-grid">
                        <div className="cm-field">
                            <label>Topic</label>

                            <input
                                value={form.metadata.topic}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        metadata: {
                                            ...form.metadata,
                                            topic: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>

                        <div className="cm-field">
                            <label>Duration (minutes)</label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    form.metadata.durationMinutes
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        metadata: {
                                            ...form.metadata,
                                            durationMinutes:
                                                e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>

                        <div className="cm-field cm-field-full">
                            <label>Description</label>

                            <textarea
                                rows={3}
                                value={
                                    form.metadata.description
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        metadata: {
                                            ...form.metadata,
                                            description:
                                                e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>

                        <div className="cm-field cm-field-full">
                            <label>Tags</label>

                            <input
                                value={form.metadata.tags}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        metadata: {
                                            ...form.metadata,
                                            tags: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="cm-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onBack}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Update Skeleton"}
                    </button>
                </div>
            </form>
        </div>
    );
}