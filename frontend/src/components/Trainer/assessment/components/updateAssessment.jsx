import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, FileText, Plus } from "lucide-react";

import "./updateAssessment.css";
import QuestionCard from "./QuestionCard";

const EMPTY_QUESTION = {
    questionText: "",
    options: ["", ""],
    correctOptionIndex: 0,
    marks: 1,
};

const EMPTY_ASSESSMENT = {
    title: "",
    programId: "",
    skeletonId: "",
    durationMinutes: 30,
    scheduledDate: "",
    deadline: "",
    status: "draft",
    questions: [structuredClone(EMPTY_QUESTION)],
};

function cloneQuestion(question) {
    return {
        questionText: question.questionText ?? "",
        options: Array.isArray(question.options) ? [...question.options] : ["", ""],
        correctOptionIndex:
            typeof question.correctOptionIndex === "number"
                ? question.correctOptionIndex
                : 0,
        marks: question.marks ?? 1,
    };
}

function normalizeQuestionForSubmit(question) {
    const options = (question.options || []).map((opt) => String(opt).trim());

    return {
        questionText: String(question.questionText || "").trim(),
        options,
        correctOptionIndex: Number(question.correctOptionIndex ?? 0),
        marks: Number(question.marks ?? 1),
    };
}

export default function UpdateAssessment({
    token,
    activeAssessment = null,
    mode = "create",
    onBack,
    AllCourses = [],
    AllContentSkeletons = [],
    createAssessment,
    updateAssessment,
}) {
    const [form, setForm] = useState(EMPTY_ASSESSMENT);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (activeAssessment?._id) {
            setForm({
                title: activeAssessment.title ?? "",
                programId:
                    activeAssessment.programId?._id ||
                    activeAssessment.programId ||
                    "",
                skeletonId:
                    activeAssessment.skeletonId?._id ||
                    activeAssessment.skeletonId ||
                    "",
                durationMinutes: activeAssessment.durationMinutes ?? 30,
                scheduledDate: activeAssessment.scheduledDate
                    ? String(activeAssessment.scheduledDate).slice(0, 10)
                    : "",
                deadline: activeAssessment.deadline
                    ? String(activeAssessment.deadline).slice(0, 10)
                    : "",
                status: activeAssessment.status ?? "draft",
                questions:
                    Array.isArray(activeAssessment.questions) &&
                    activeAssessment.questions.length > 0
                        ? activeAssessment.questions.map(cloneQuestion)
                        : [structuredClone(EMPTY_QUESTION)],
            });
        }
    }, [activeAssessment]);

    const skeletonList = Array.isArray(AllContentSkeletons)
        ? AllContentSkeletons
        : AllContentSkeletons?.data || [];

    const courseList = Array.isArray(AllCourses) ? AllCourses : AllCourses?.data || [];

    const totalQuestions = form.questions.length;

    const totalMarks = useMemo(() => {
        return form.questions.reduce((sum, q) => {
            const marks = Number(q.marks);
            return sum + (Number.isFinite(marks) ? marks : 0);
        }, 0);
    }, [form.questions]);

    const duration = Number(form.durationMinutes) || 0;

    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const setQuestion = (index, updater) => {
        setForm((prev) => {
            const next = [...prev.questions];
            const current = next[index] || structuredClone(EMPTY_QUESTION);
            next[index] = typeof updater === "function" ? updater(current) : updater;
            return { ...prev, questions: next };
        });
    };

    const addQuestion = () => {
        setForm((prev) => ({
            ...prev,
            questions: [...prev.questions, structuredClone(EMPTY_QUESTION)],
        }));
    };

    const deleteQuestion = (index) => {
        setForm((prev) => {
            if (prev.questions.length <= 1) return prev;
            return {
                ...prev,
                questions: prev.questions.filter((_, i) => i !== index),
            };
        });
    };

    const duplicateQuestion = (index) => {
        setForm((prev) => {
            const next = [...prev.questions];
            const copy = cloneQuestion(next[index]);
            next.splice(index + 1, 0, copy);
            return { ...prev, questions: next };
        });
    };

    const updateQuestionText = (index, questionText) => {
        setQuestion(index, (current) => ({ ...current, questionText }));
    };

    const updateQuestionMarks = (index, marks) => {
        setQuestion(index, (current) => ({ ...current, marks }));
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        setQuestion(questionIndex, (current) => {
            const options = [...current.options];
            options[optionIndex] = value;
            return { ...current, options };
        });
    };

    const addOption = (questionIndex) => {
        setQuestion(questionIndex, (current) => ({
            ...current,
            options: [...current.options, ""],
        }));
    };

    const removeOption = (questionIndex, optionIndex) => {
        setQuestion(questionIndex, (current) => {
            if (current.options.length <= 2) return current;

            const options = current.options.filter((_, i) => i !== optionIndex);
            let correctOptionIndex = current.correctOptionIndex;

            if (optionIndex === correctOptionIndex) {
                correctOptionIndex = 0;
            } else if (optionIndex < correctOptionIndex) {
                correctOptionIndex -= 1;
            }

            return {
                ...current,
                options,
                correctOptionIndex,
            };
        });
    };

    const setCorrectOption = (questionIndex, optionIndex) => {
        setQuestion(questionIndex, (current) => ({
            ...current,
            correctOptionIndex: optionIndex,
        }));
    };

    const validateBeforeSubmit = (payload) => {
        if (!payload.title) return "Title is required.";

        if (!payload.questions.length) return "Add at least one question.";

        for (let i = 0; i < payload.questions.length; i++) {
            const q = payload.questions[i];

            if (!q.questionText) {
                return `Question ${i + 1} text is required.`;
            }

            if (!Array.isArray(q.options) || q.options.length < 2) {
                return `Question ${i + 1} must have at least 2 options.`;
            }

            if (q.options.some((opt) => !opt)) {
                return `Question ${i + 1} has empty options. Fill all options or remove the extra ones.`;
            }

            if (
                q.correctOptionIndex === undefined ||
                q.correctOptionIndex === null ||
                typeof q.correctOptionIndex !== "number"
            ) {
                return `Question ${i + 1} correct answer is required.`;
            }

            if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
                return `Question ${i + 1} correct answer is out of range.`;
            }

            if (!Number.isFinite(Number(q.marks)) || Number(q.marks) <= 0) {
                return `Question ${i + 1} marks must be greater than 0.`;
            }
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            title: String(form.title || "").trim(),
            skeletonId: form.skeletonId || null,
            programId: form.programId || null,
            durationMinutes:
                form.durationMinutes === "" ? null : Number(form.durationMinutes),
            scheduledDate: form.scheduledDate || null,
            deadline: form.deadline || null,
            status: form.status || "draft",
            questions: form.questions.map(normalizeQuestionForSubmit),
        };

        const error = validateBeforeSubmit(payload);
        if (error) {
            alert(error);
            return;
        }

        setSaving(true);
        try {
            if (mode === "edit" && activeAssessment?._id && updateAssessment) {
                await updateAssessment(activeAssessment._id, payload, token);
            } else if (createAssessment) {
                await createAssessment(payload, token);
            } else {
                throw new Error("Assessment action is not available");
            }

            setForm(EMPTY_ASSESSMENT);
            if (onBack) onBack();
        } catch (err) {
            alert(
                err?.message ||
                    (mode === "edit"
                        ? "Failed to update assessment"
                        : "Failed to create assessment")
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="am-page">
            <div className="am-shell">
                <div className="am-header">
                    <button type="button" className="am-back" onClick={onBack}>
                        ← Back
                    </button>

                    <div className="am-header-copy">
                        <div className="am-kicker">
                            <FileText size={16} />
                            Assessment Builder
                        </div>
                        <h1>
                            {mode === "edit" ? "Edit Assessment" : "Create New Assessment"}
                        </h1>
                        <p>
                            Build a complete assessment with questions, correct answers, marks, and scheduling.
                        </p>
                    </div>

                    <div className="am-header-badge">
                        <span>{totalQuestions}</span>
                        <small>Questions</small>
                    </div>
                </div>

                <div className="am-layout">
                    <form className="am-main" onSubmit={handleSubmit}>
                        <section className="am-card">
                            <div className="am-section-title">
                                <h2>Assessment Details</h2>
                                <p>Set the core information for this assessment.</p>
                            </div>

                            <div className="am-grid">
                                <div className="am-field am-field-full">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Arrays and Strings Quiz"
                                        value={form.title}
                                        onChange={(e) => setField("title", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="am-field">
                                    <label>Program</label>
                                    <select
                                        value={form.programId}
                                        onChange={(e) => setField("programId", e.target.value)}
                                    >
                                        <option value="">Select Program</option>
                                        {courseList.map((course) => (
                                            <option key={course._id} value={course._id}>
                                                {course.courseCode || course.title || course.name || course._id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="am-field">
                                    <label>Content Skeleton</label>
                                    <select
                                        value={form.skeletonId}
                                        onChange={(e) => setField("skeletonId", e.target.value)}
                                    >
                                        <option value="">Optional</option>
                                        {skeletonList.map((skeleton) => (
                                            <option key={skeleton._id} value={skeleton._id}>
                                                Class {skeleton.classNumber} — {skeleton.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="am-field">
                                    <label>
                                        <Clock3 size={14} /> Duration (Minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.durationMinutes}
                                        onChange={(e) => setField("durationMinutes", e.target.value)}
                                    />
                                </div>

                                <div className="am-field">
                                    <label>Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setField("status", e.target.value)}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="am-card">
                            <div className="am-section-title">
                                <h2>Schedule</h2>
                                <p>Optional dates for release and expiry.</p>
                            </div>

                            <div className="am-grid">
                                <div className="am-field">
                                    <label>
                                        <CalendarDays size={14} /> Scheduled Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.scheduledDate}
                                        onChange={(e) => setField("scheduledDate", e.target.value)}
                                    />
                                </div>

                                <div className="am-field">
                                    <label>
                                        <CalendarDays size={14} /> Deadline
                                    </label>
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={(e) => setField("deadline", e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="am-card am-questions-card">
                            <div className="am-questions-head">
                                <div className="am-section-title">
                                    <h2>Questions</h2>
                                    <p>Add multiple choice questions with the correct answer and marks.</p>
                                </div>

                                <button type="button" className="am-add-question" onClick={addQuestion}>
                                    <Plus size={16} />
                                    Add Question
                                </button>
                            </div>

                            <div className="am-questions-list">
                                {form.questions.map((question, index) => (
                                    <QuestionCard
                                        key={index}
                                        index={index}
                                        question={question}
                                        onChangeText={(value) => updateQuestionText(index, value)}
                                        onChangeMarks={(value) => updateQuestionMarks(index, value)}
                                        onChangeOption={(optionIndex, value) =>
                                            updateOption(index, optionIndex, value)
                                        }
                                        onAddOption={() => addOption(index)}
                                        onRemoveOption={(optionIndex) => removeOption(index, optionIndex)}
                                        onSetCorrectOption={(optionIndex) =>
                                            setCorrectOption(index, optionIndex)
                                        }
                                        onDuplicate={() => duplicateQuestion(index)}
                                        onDelete={() => deleteQuestion(index)}
                                        canDeleteQuestion={form.questions.length > 1}
                                    />
                                ))}
                            </div>
                        </section>

                        <div className="am-footer">
                            <button type="button" className="am-btn am-btn-ghost" onClick={onBack}>
                                Cancel
                            </button>
                            <button type="submit" className="am-btn am-btn-primary" disabled={saving}>
                                {saving
                                    ? mode === "edit"
                                        ? "Updating…"
                                        : "Creating…"
                                    : mode === "edit"
                                    ? "Update Assessment"
                                    : "Create Assessment"}
                            </button>
                        </div>
                    </form>

                    <aside className="am-side">
                        <div className="am-sticky">
                            <div className="am-summary-card">
                                <h3>Assessment Summary</h3>

                                <div className="am-summary-grid">
                                    <div className="am-summary-item">
                                        <span>Questions</span>
                                        <strong>{totalQuestions}</strong>
                                    </div>
                                    <div className="am-summary-item">
                                        <span>Total Marks</span>
                                        <strong>{totalMarks}</strong>
                                    </div>
                                    <div className="am-summary-item">
                                        <span>Duration</span>
                                        <strong>{duration} min</strong>
                                    </div>
                                    <div className="am-summary-item">
                                        <span>Status</span>
                                        <strong className={`am-status am-status-${form.status}`}>
                                            {form.status}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="am-tip-card">
                                <h4>Validation</h4>
                                <ul>
                                    <li>At least 1 question</li>
                                    <li>At least 2 options per question</li>
                                    <li>Every option must be filled</li>
                                    <li>Each question needs one correct answer</li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}