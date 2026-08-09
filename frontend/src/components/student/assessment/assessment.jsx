import React, { useEffect, useMemo, useRef, useState } from "react";

// Adjust this import path to your project structure
// import { submitAssessment } from "../../../api/assessments";
import { useStu } from "../../../hooks/useStu";


import './StudentAssessment.css'


// --- Proctoring config ---
// After this many violations (tab switch / window blur / fullscreen exit),
// the assessment is auto-submitted.
const MAX_VIOLATIONS = 3;
// Minimum gap between two violation events before we count a new one.
// Prevents a single alt-tab from firing both `blur` and `visibilitychange`
// and being counted twice.
const VIOLATION_DEBOUNCE_MS = 800;


function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatTimeLeft(seconds) {
    if (seconds === null || seconds === undefined) return "";
    const safe = Math.max(0, Math.floor(seconds));
    const hrs = Math.floor(safe / 3600);
    const mins = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return [hrs, mins, secs]
        .map((v, i) => (i === 0 ? String(v) : String(v).padStart(2, "0")))
        .join(":");
}

function getAssessmentStatusLabel(assessment) {
    if (!assessment) return "";
    if (assessment.status === "published") return "Open";
    if (assessment.status === "closed") return "Closed";
    return "Draft";
}

function violationLabel(type) {
    switch (type) {
        case "tab_hidden":
            return "Switched tab / minimized window";
        case "window_blur":
            return "Left the assessment window";
        case "fullscreen_exit":
            return "Exited fullscreen mode";
        default:
            return "Left the assessment screen";
    }
}

export default function StudentAssessment({ token }) {

    const { 
        myPerformance ,
        AllAssessments,
        submitAssessment,
        refreshAssessments,

    } = useStu(token);

    const publishedAssessments = useMemo(() => {
        const list = Array.isArray(AllAssessments) ? AllAssessments : [];
        return list.filter((item) => item?.status === "published");
    }, [AllAssessments]);

    const [activeAssessment, setActiveAssessment] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState(null);

    // --- Proctoring state ---
    const [violationLog, setViolationLog] = useState([]);
    const [activeWarning, setActiveWarning] = useState(null); // { type, count } | null
    const lastViolationAtRef = useRef(0);
    const proctoringActiveRef = useRef(false);
    const warningTimeoutRef = useRef(null);

    // Refs mirroring latest state, so the unmount handler below (which runs
    // in a cleanup closure) always sees fresh values instead of whatever
    // was captured on the render it was created in.
    const activeAssessmentRef = useRef(null);
    const answersRef = useRef({});
    const submissionResultRef = useRef(null);
    const violationLogRef = useRef([]);
    const tokenRef = useRef(token);

    const questionCount = activeAssessment?.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = Math.max(0, questionCount - answeredCount);

    useEffect(() => {
        if (!activeAssessment?.durationMinutes) {
            setTimeLeft(null);
            return;
        }

        setTimeLeft(Math.max(0, Number(activeAssessment.durationMinutes) * 60));
    }, [activeAssessment?._id]);

    useEffect(() => {
        if (!activeAssessment || submitting || submissionResult) return;
        if (timeLeft === null) return;
        if (timeLeft <= 0) return;

        const timer = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null) return prev;
                if (prev <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [activeAssessment, timeLeft, submitting, submissionResult]);

    useEffect(() => {
        if (!activeAssessment || !activeAssessment.durationMinutes) return;
        if (timeLeft !== 0) return;
        if (submitting || submissionResult) return;
        void handleSubmit(true, "time_expired");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // Keep a ref in sync so event listeners (registered once) always know
    // whether an exam is currently in progress, without re-binding on every render.
    useEffect(() => {
        proctoringActiveRef.current =
            !!activeAssessment && !submitting && !submissionResult;
    }, [activeAssessment, submitting, submissionResult]);

    useEffect(() => {
        activeAssessmentRef.current = activeAssessment;
    }, [activeAssessment]);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        submissionResultRef.current = submissionResult;
    }, [submissionResult]);

    useEffect(() => {
        violationLogRef.current = violationLog;
    }, [violationLog]);

    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

    // If this component itself gets unmounted mid-attempt — e.g. the parent
    // app navigates away, switches tabs/routes, or removes this page from
    // the tree some other way — close out the attempt instead of silently
    // losing it. This is a fire-and-forget call: the component is gone, so
    // we can't update state, but the server still needs to record the
    // submission so the attempt can't be reopened by coming back.
    useEffect(() => {
        return () => {
            const assessment = activeAssessmentRef.current;
            const result = submissionResultRef.current;
            if (!assessment || result) return;

            const questions = assessment.questions || [];
            const currentAnswers = answersRef.current;
            const payloadAnswers = questions
                .map((_, idx) => ({
                    questionIndex: idx,
                    selectedOptionIndex: currentAnswers[idx],
                }))
                .filter((item) => Number.isInteger(item.selectedOptionIndex));

            submitAssessment(
                assessment._id,
                payloadAnswers,
                tokenRef.current,
                { reason: "component_unmounted", violations: violationLogRef.current }
            ).catch(() => {});
            refreshAssessments();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const registerViolation = (type) => {
        if (!proctoringActiveRef.current) return;

        const now = Date.now();
        if (now - lastViolationAtRef.current < VIOLATION_DEBOUNCE_MS) {
            // Same real-world event triggered multiple browser events
            // (e.g. blur + visibilitychange together) — don't double count.
            return;
        }
        lastViolationAtRef.current = now;

        setViolationLog((prev) => {
            const entry = { type, at: new Date().toISOString() };
            const next = [...prev, entry];

            const count = next.length;
            setActiveWarning({ type, count });

            if (warningTimeoutRef.current) {
                window.clearTimeout(warningTimeoutRef.current);
            }
            warningTimeoutRef.current = window.setTimeout(() => {
                setActiveWarning(null);
            }, 6000);

            if (count >= MAX_VIOLATIONS) {
                // Stop listening / stop counting further violations immediately.
                proctoringActiveRef.current = false;
                void handleSubmit(true, "proctoring_violation", next);
            }

            return next;
        });
    };

    const requestExamFullscreen = () => {
        const el = document.documentElement;
        if (!el || !el.requestFullscreen) return;
        el.requestFullscreen().catch(() => {
            // Fullscreen may be blocked (e.g. no user gesture, unsupported
            // browser). We don't hard-fail the exam over this — it's one
            // layer of several.
        });
    };

    const exitExamFullscreen = () => {
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    };

    // Proctoring listeners: only bound while an assessment is actively in progress.
    useEffect(() => {
        if (!activeAssessment || submitting || submissionResult) return;

        const handleVisibilityChange = () => {
            if (document.hidden) registerViolation("tab_hidden");
        };
        const handleBlur = () => registerViolation("window_blur");
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) registerViolation("fullscreen_exit");
        };
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue =
                "Leaving now will end your attempt. Are you sure you want to exit the assessment?";
            return e.returnValue;
        };
        const blockContextMenu = (e) => e.preventDefault();
        const blockCopyPaste = (e) => e.preventDefault();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("contextmenu", blockContextMenu);
        document.addEventListener("copy", blockCopyPaste);
        document.addEventListener("cut", blockCopyPaste);
        document.addEventListener("paste", blockCopyPaste);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("contextmenu", blockContextMenu);
            document.removeEventListener("copy", blockCopyPaste);
            document.removeEventListener("cut", blockCopyPaste);
            document.removeEventListener("paste", blockCopyPaste);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAssessment?._id, submitting, submissionResult]);

    useEffect(() => {
        return () => {
            if (warningTimeoutRef.current) {
                window.clearTimeout(warningTimeoutRef.current);
            }
        };
    }, []);

    const openAssessment = (assessment) => {
        setError("");
        setSubmissionResult(null);
        setActiveAssessment(assessment);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setSubmitting(false);
        setViolationLog([]);
        setActiveWarning(null);
        lastViolationAtRef.current = 0;
        requestExamFullscreen();
    };

    const closeAssessment = () => {
        if (submitting) return;

        // If an attempt is in progress (started but not yet submitted),
        // leaving via Back is treated as abandoning the attempt and
        // auto-submits whatever was answered so far — otherwise a student
        // could open the assessment, read the questions, hit Back before
        // anything counts against them, and repeat this indefinitely.
        if (activeAssessment && !submissionResult) {
            void handleSubmit(true, "exited_early");
            return;
        }

        setActiveAssessment(null);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setSubmitting(false);
        setSubmissionResult(null);
        setError("");
        setTimeLeft(null);
        setActiveWarning(null);
        if (warningTimeoutRef.current) {
            window.clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
        }
        lastViolationAtRef.current = 0;
        exitExamFullscreen();
    };

    const handleSelectOption = (questionIndex, optionIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [questionIndex]: optionIndex,
        }));
    };

    const goToPrevious = () => {
        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
    };

    const goToNext = () => {
        setCurrentQuestionIndex((prev) =>
            Math.min(questionCount - 1, prev + 1)
        );
    };

    const handleSubmit = async (forced = false, reason = "manual", logOverride = null) => {
        if (!activeAssessment) return;

        const questions = activeAssessment.questions || [];
        const payloadAnswers = questions
            .map((_, idx) => ({
                questionIndex: idx,
                selectedOptionIndex: answers[idx],
            }))
            .filter((item) => Number.isInteger(item.selectedOptionIndex));

        if (!forced && payloadAnswers.length !== questions.length) {
            const proceed = window.confirm(
                `You have answered ${payloadAnswers.length} of ${questions.length} questions. Submit anyway?`
            );
            if (!proceed) return;
        }

        try {
            setSubmitting(true);
            setError("");

            const finalViolationLog = logOverride || violationLog;

            // NOTE: submitAssessment's signature may need to be extended on the
            // hook/API side to actually persist `reason` and `violations`.
            // Passed here so the data is available as soon as the backend
            // supports it; extra args are harmless if the hook ignores them.
            const res = await submitAssessment(
                activeAssessment._id,
                payloadAnswers,
                token,
                { reason, violations: finalViolationLog }
            );

            setSubmissionResult({
                score: res?.data?.score ?? 0,
                totalMarks: res?.data?.totalMarks ?? 0,
                message:
                    reason === "proctoring_violation"
                        ? "Your assessment was auto-submitted after repeated attempts to leave the exam screen."
                        : reason === "exited_early"
                        ? "Your assessment was submitted because you left before finishing. Attempts can't be reopened once started."
                        : res?.message || "Assessment submitted successfully",
            });
            exitExamFullscreen();
            refreshAssessments();
        } catch (err) {
            const message =
                err?.message ||
                "Failed to submit assessment. Please try again.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const currentQuestion =
        activeAssessment?.questions?.[currentQuestionIndex] || null;

    if (!activeAssessment) {
        return (
            <div className="sa-page">
                <div className="sa-header">
                        <h1 className="sa-title">Assessments</h1>
                        <p className="sa-subtitle">
                            Open assessments available for submission
                        </p>
                </div>

                {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

                {publishedAssessments.length === 0 ? (
                    <div className="sa-empty">
                        <h3>No published assessments yet</h3>
                        <p>When your trainer publishes an assessment, it will appear here.</p>
                    </div>
                ) : (
                    <div className="sa-grid">
                        {publishedAssessments.map((assessment) => {
                            // The backend now marks assessments the student has
                            // already attempted (or whose deadline has passed)
                            // with an emptied `questions` array and a `questionCount`
                            // field instead — prefer those server-computed values
                            // over recomputing from a possibly-empty questions list
                            // or trusting the client's own clock.
                            const deadlinePassed =
                                assessment.expired ??
                                !!(assessment.deadline && new Date() > new Date(assessment.deadline));
                            const alreadyAttempted = !!assessment.attempted;
                            const locked = deadlinePassed || alreadyAttempted;
                            const totalQuestions =
                                assessment.questionCount ?? assessment.questions?.length ?? 0;

                            return (
                                <div key={assessment._id} className="sa-card">
                                    <div className="sa-card-top">
                                        <div>
                                            <h3 className="sa-card-title">{assessment.title}</h3>
                                            <p className="sa-card-meta">
                                                {totalQuestions} questions
                                            </p>
                                        </div>
                                        <span
                                            className={`sa-badge ${locked ? "sa-badge-warn" : "sa-badge-ok"
                                                }`}
                                        >
                                            {alreadyAttempted
                                                ? "Attempted"
                                                : deadlinePassed
                                                ? "Deadline passed"
                                                : "Open"}
                                        </span>
                                    </div>

                                    <div className="sa-card-body">
                                        <div className="sa-info-row">
                                            <span>Duration</span>
                                            <strong>
                                                {assessment.durationMinutes
                                                    ? `${assessment.durationMinutes} min`
                                                    : "No limit"}
                                            </strong>
                                        </div>

                                        <div className="sa-info-row">
                                            <span>Scheduled</span>
                                            <strong>{formatDate(assessment.scheduledDate)}</strong>
                                        </div>

                                        <div className="sa-info-row">
                                            <span>Deadline</span>
                                            <strong>{formatDate(assessment.deadline)}</strong>
                                        </div>

                                        <div className="sa-info-row">
                                            <span>Status</span>
                                            <strong>{getAssessmentStatusLabel(assessment)}</strong>
                                        </div>
                                    </div>

                                    <div className="sa-card-actions">
                                        <button
                                            type="button"
                                            className="sa-btn sa-btn-primary"
                                            onClick={() => openAssessment(assessment)}
                                            disabled={locked}
                                        >
                                            {alreadyAttempted
                                                ? "Already attempted"
                                                : deadlinePassed
                                                ? "Closed"
                                                : "Start assessment"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    if (submissionResult) {
        return (
            <div className="sa-page">
                <div className="sa-result">
                    <div className="sa-result-icon">✓</div>
                    <h1>Assessment submitted</h1>
                    <p>{submissionResult.message}</p>

                    <div className="sa-result-score">
                        <div className="sa-score-value">
                            {submissionResult.score} / {submissionResult.totalMarks}
                        </div>
                        <div className="sa-score-label">Your score</div>
                    </div>

                    <div className="sa-result-actions">
                        <button
                            type="button"
                            className="sa-btn sa-btn-primary"
                            onClick={closeAssessment}
                        >
                            Back to assessments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const progress =
        questionCount > 0 ? ((currentQuestionIndex + 1) / questionCount) * 100 : 0;

    return (
        <div className="sa-page">
            <div className="sa-exam-shell">
                {activeWarning ? (
                    <div className="sa-alert sa-alert-warning sa-proctor-warning">
                        <strong>
                            Warning {activeWarning.count}/{MAX_VIOLATIONS}:
                        </strong>{" "}
                        {violationLabel(activeWarning.type)}. Your assessment will be
                        auto-submitted if this happens{" "}
                        {Math.max(0, MAX_VIOLATIONS - activeWarning.count)} more time
                        {MAX_VIOLATIONS - activeWarning.count === 1 ? "" : "s"}.
                    </div>
                ) : null}

                <div className="sa-exam-header">
                    <div>
                        <button
                            type="button"
                            className="sa-back"
                            onClick={closeAssessment}
                            disabled={submitting}
                        >
                            ← Back
                        </button>
                        <h1 className="sa-title">{activeAssessment.title}</h1>
                        <p className="sa-subtitle">
                            Question {currentQuestionIndex + 1} of {questionCount}
                        </p>
                    </div>

                    <div className="sa-header-stats">
                        <div className="sa-stat">
                            <span>Answered</span>
                            <strong>
                                {answeredCount}/{questionCount}
                            </strong>
                        </div>

                        <div className="sa-stat">
                            <span>Remaining</span>
                            <strong>{unansweredCount}</strong>
                        </div>

                        {activeAssessment.durationMinutes ? (
                            <div className="sa-stat sa-stat-timer">
                                <span>Time left</span>
                                <strong>{formatTimeLeft(timeLeft)}</strong>
                            </div>
                        ) : null}

                        <div className="sa-stat sa-stat-proctor">
                            <span>Violations</span>
                            <strong>
                                {violationLog.length}/{MAX_VIOLATIONS}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="sa-progress-wrap">
                    <div className="sa-progress-bar">
                        <div className="sa-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

                <div className="sa-exam-grid">
                    <div className="sa-question-panel">
                        <div className="sa-question-head">
                            <div className="sa-question-number">
                                Question {currentQuestionIndex + 1}
                            </div>
                            <div className="sa-question-marks">
                                {currentQuestion?.marks ?? 1} mark
                                {(currentQuestion?.marks ?? 1) !== 1 ? "s" : ""}
                            </div>
                        </div>

                        <h2 className="sa-question-text">
                            {currentQuestion?.questionText || "No question available"}
                        </h2>

                        <div className="sa-options">
                            {(currentQuestion?.options || []).map((option, optionIndex) => {
                                const selected = answers[currentQuestionIndex] === optionIndex;

                                return (
                                    <button
                                        key={`${currentQuestionIndex}-${optionIndex}`}
                                        type="button"
                                        className={`sa-option ${selected ? "sa-option-selected" : ""}`}
                                        onClick={() =>
                                            handleSelectOption(currentQuestionIndex, optionIndex)
                                        }
                                        disabled={submitting}
                                    >
                                        <span className="sa-option-key">
                                            {String.fromCharCode(65 + optionIndex)}
                                        </span>
                                        <span className="sa-option-text">{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="sa-nav">
                            <button
                                type="button"
                                className="sa-btn sa-btn-secondary"
                                onClick={goToPrevious}
                                disabled={currentQuestionIndex === 0 || submitting}
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                className="sa-btn sa-btn-secondary"
                                onClick={goToNext}
                                disabled={currentQuestionIndex === questionCount - 1 || submitting}
                            >
                                Next
                            </button>

                            <button
                                type="button"
                                className="sa-btn sa-btn-primary"
                                onClick={() => handleSubmit(false, "manual")}
                                disabled={submitting}
                            >
                                {submitting ? "Submitting..." : "Submit assessment"}
                            </button>
                        </div>
                    </div>

                    <div className="sa-side-panel">
                        <div className="sa-side-card">
                            <h3>Assessment details</h3>
                            <div className="sa-info-row">
                                <span>Total questions</span>
                                <strong>{questionCount}</strong>
                            </div>
                            <div className="sa-info-row">
                                <span>Duration</span>
                                <strong>
                                    {activeAssessment.durationMinutes
                                        ? `${activeAssessment.durationMinutes} min`
                                        : "No limit"}
                                </strong>
                            </div>
                            <div className="sa-info-row">
                                <span>Deadline</span>
                                <strong>{formatDate(activeAssessment.deadline)}</strong>
                            </div>
                            <div className="sa-info-row">
                                <span>Scheduled</span>
                                <strong>{formatDate(activeAssessment.scheduledDate)}</strong>
                            </div>
                        </div>

                        <div className="sa-side-card">
                            <h3>Question navigator</h3>
                            <div className="sa-nav-grid">
                                {activeAssessment.questions?.map((_, index) => {
                                    const answered = answers[index] !== undefined;
                                    const active = index === currentQuestionIndex;

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`sa-qdot ${answered ? "sa-qdot-answered" : ""
                                                } ${active ? "sa-qdot-active" : ""}`}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            disabled={submitting}
                                            aria-label={`Go to question ${index + 1}`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="sa-side-card sa-side-note">
                            <h3>Submission rules</h3>
                            <p>
                                Your assessment is graded automatically after submission. You can
                                submit even if some questions are unanswered, but they will count
                                as incorrect.
                            </p>
                            <p>
                                Leaving this screen (switching tabs, minimizing, or exiting
                                fullscreen) is logged. After {MAX_VIOLATIONS} such attempts your
                                assessment is auto-submitted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}










// import React, { useEffect, useMemo, useRef, useState } from "react";

// // Adjust this import path to your project structure
// // import { submitAssessment } from "../../../api/assessments";
// import { useStu } from "../../../hooks/useStu";


// import './StudentAssessment.css'


// // --- Proctoring config ---
// // After this many violations (tab switch / window blur / fullscreen exit),
// // the assessment is auto-submitted.
// const MAX_VIOLATIONS = 3;
// // Minimum gap between two violation events before we count a new one.
// // Prevents a single alt-tab from firing both `blur` and `visibilitychange`
// // and being counted twice.
// const VIOLATION_DEBOUNCE_MS = 800;


// function formatDate(value) {
//     if (!value) return "—";
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return "—";
//     return date.toLocaleString("en-IN", {
//         dateStyle: "medium",
//         timeStyle: "short",
//     });
// }

// function formatTimeLeft(seconds) {
//     if (seconds === null || seconds === undefined) return "";
//     const safe = Math.max(0, Math.floor(seconds));
//     const hrs = Math.floor(safe / 3600);
//     const mins = Math.floor((safe % 3600) / 60);
//     const secs = safe % 60;
//     return [hrs, mins, secs]
//         .map((v, i) => (i === 0 ? String(v) : String(v).padStart(2, "0")))
//         .join(":");
// }

// function getAssessmentStatusLabel(assessment) {
//     if (!assessment) return "";
//     if (assessment.status === "published") return "Open";
//     if (assessment.status === "closed") return "Closed";
//     return "Draft";
// }

// function violationLabel(type) {
//     switch (type) {
//         case "tab_hidden":
//             return "Switched tab / minimized window";
//         case "window_blur":
//             return "Left the assessment window";
//         case "fullscreen_exit":
//             return "Exited fullscreen mode";
//         default:
//             return "Left the assessment screen";
//     }
// }

// export default function StudentAssessment({ token }) {

//     const { 
//         myPerformance ,
//         AllAssessments,
//         submitAssessment

//     } = useStu(token);

//     const publishedAssessments = useMemo(() => {
//         const list = Array.isArray(AllAssessments) ? AllAssessments : [];
//         return list.filter((item) => item?.status === "published");
//     }, [AllAssessments]);

//     const [activeAssessment, setActiveAssessment] = useState(null);
//     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//     const [answers, setAnswers] = useState({});
//     const [submitting, setSubmitting] = useState(false);
//     const [submissionResult, setSubmissionResult] = useState(null);
//     const [error, setError] = useState("");
//     const [timeLeft, setTimeLeft] = useState(null);

//     // --- Proctoring state ---
//     const [violationLog, setViolationLog] = useState([]);
//     const [activeWarning, setActiveWarning] = useState(null); // { type, count } | null
//     const lastViolationAtRef = useRef(0);
//     const proctoringActiveRef = useRef(false);
//     const warningTimeoutRef = useRef(null);

//     // Refs mirroring latest state, so the unmount handler below (which runs
//     // in a cleanup closure) always sees fresh values instead of whatever
//     // was captured on the render it was created in.
//     const activeAssessmentRef = useRef(null);
//     const answersRef = useRef({});
//     const submissionResultRef = useRef(null);
//     const violationLogRef = useRef([]);
//     const tokenRef = useRef(token);

//     const questionCount = activeAssessment?.questions?.length || 0;
//     const answeredCount = Object.keys(answers).length;
//     const unansweredCount = Math.max(0, questionCount - answeredCount);

//     useEffect(() => {
//         if (!activeAssessment?.durationMinutes) {
//             setTimeLeft(null);
//             return;
//         }

//         setTimeLeft(Math.max(0, Number(activeAssessment.durationMinutes) * 60));
//     }, [activeAssessment?._id]);

//     useEffect(() => {
//         if (!activeAssessment || submitting || submissionResult) return;
//         if (timeLeft === null) return;
//         if (timeLeft <= 0) return;

//         const timer = window.setInterval(() => {
//             setTimeLeft((prev) => {
//                 if (prev === null) return prev;
//                 if (prev <= 1) {
//                     window.clearInterval(timer);
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);

//         return () => window.clearInterval(timer);
//     }, [activeAssessment, timeLeft, submitting, submissionResult]);

//     useEffect(() => {
//         if (!activeAssessment || !activeAssessment.durationMinutes) return;
//         if (timeLeft !== 0) return;
//         if (submitting || submissionResult) return;
//         void handleSubmit(true, "time_expired");
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [timeLeft]);

//     // Keep a ref in sync so event listeners (registered once) always know
//     // whether an exam is currently in progress, without re-binding on every render.
//     useEffect(() => {
//         proctoringActiveRef.current =
//             !!activeAssessment && !submitting && !submissionResult;
//     }, [activeAssessment, submitting, submissionResult]);

//     useEffect(() => {
//         activeAssessmentRef.current = activeAssessment;
//     }, [activeAssessment]);

//     useEffect(() => {
//         answersRef.current = answers;
//     }, [answers]);

//     useEffect(() => {
//         submissionResultRef.current = submissionResult;
//     }, [submissionResult]);

//     useEffect(() => {
//         violationLogRef.current = violationLog;
//     }, [violationLog]);

//     useEffect(() => {
//         tokenRef.current = token;
//     }, [token]);

//     // If this component itself gets unmounted mid-attempt — e.g. the parent
//     // app navigates away, switches tabs/routes, or removes this page from
//     // the tree some other way — close out the attempt instead of silently
//     // losing it. This is a fire-and-forget call: the component is gone, so
//     // we can't update state, but the server still needs to record the
//     // submission so the attempt can't be reopened by coming back.
//     useEffect(() => {
//         return () => {
//             const assessment = activeAssessmentRef.current;
//             const result = submissionResultRef.current;
//             if (!assessment || result) return;

//             const questions = assessment.questions || [];
//             const currentAnswers = answersRef.current;
//             const payloadAnswers = questions
//                 .map((_, idx) => ({
//                     questionIndex: idx,
//                     selectedOptionIndex: currentAnswers[idx],
//                 }))
//                 .filter((item) => Number.isInteger(item.selectedOptionIndex));

//             submitAssessment(
//                 assessment._id,
//                 payloadAnswers,
//                 tokenRef.current,
//                 { reason: "component_unmounted", violations: violationLogRef.current }
//             ).catch(() => {});
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     const registerViolation = (type) => {
//         if (!proctoringActiveRef.current) return;

//         const now = Date.now();
//         if (now - lastViolationAtRef.current < VIOLATION_DEBOUNCE_MS) {
//             // Same real-world event triggered multiple browser events
//             // (e.g. blur + visibilitychange together) — don't double count.
//             return;
//         }
//         lastViolationAtRef.current = now;

//         setViolationLog((prev) => {
//             const entry = { type, at: new Date().toISOString() };
//             const next = [...prev, entry];

//             const count = next.length;
//             setActiveWarning({ type, count });

//             if (warningTimeoutRef.current) {
//                 window.clearTimeout(warningTimeoutRef.current);
//             }
//             warningTimeoutRef.current = window.setTimeout(() => {
//                 setActiveWarning(null);
//             }, 6000);

//             if (count >= MAX_VIOLATIONS) {
//                 // Stop listening / stop counting further violations immediately.
//                 proctoringActiveRef.current = false;
//                 void handleSubmit(true, "proctoring_violation", next);
//             }

//             return next;
//         });
//     };

//     const requestExamFullscreen = () => {
//         const el = document.documentElement;
//         if (!el || !el.requestFullscreen) return;
//         el.requestFullscreen().catch(() => {
//             // Fullscreen may be blocked (e.g. no user gesture, unsupported
//             // browser). We don't hard-fail the exam over this — it's one
//             // layer of several.
//         });
//     };

//     const exitExamFullscreen = () => {
//         if (document.fullscreenElement && document.exitFullscreen) {
//             document.exitFullscreen().catch(() => {});
//         }
//     };

//     // Proctoring listeners: only bound while an assessment is actively in progress.
//     useEffect(() => {
//         if (!activeAssessment || submitting || submissionResult) return;

//         const handleVisibilityChange = () => {
//             if (document.hidden) registerViolation("tab_hidden");
//         };
//         const handleBlur = () => registerViolation("window_blur");
//         const handleFullscreenChange = () => {
//             if (!document.fullscreenElement) registerViolation("fullscreen_exit");
//         };
//         const handleBeforeUnload = (e) => {
//             e.preventDefault();
//             e.returnValue =
//                 "Leaving now will end your attempt. Are you sure you want to exit the assessment?";
//             return e.returnValue;
//         };
//         const blockContextMenu = (e) => e.preventDefault();
//         const blockCopyPaste = (e) => e.preventDefault();

//         document.addEventListener("visibilitychange", handleVisibilityChange);
//         window.addEventListener("blur", handleBlur);
//         document.addEventListener("fullscreenchange", handleFullscreenChange);
//         window.addEventListener("beforeunload", handleBeforeUnload);
//         document.addEventListener("contextmenu", blockContextMenu);
//         document.addEventListener("copy", blockCopyPaste);
//         document.addEventListener("cut", blockCopyPaste);
//         document.addEventListener("paste", blockCopyPaste);

//         return () => {
//             document.removeEventListener("visibilitychange", handleVisibilityChange);
//             window.removeEventListener("blur", handleBlur);
//             document.removeEventListener("fullscreenchange", handleFullscreenChange);
//             window.removeEventListener("beforeunload", handleBeforeUnload);
//             document.removeEventListener("contextmenu", blockContextMenu);
//             document.removeEventListener("copy", blockCopyPaste);
//             document.removeEventListener("cut", blockCopyPaste);
//             document.removeEventListener("paste", blockCopyPaste);
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [activeAssessment?._id, submitting, submissionResult]);

//     useEffect(() => {
//         return () => {
//             if (warningTimeoutRef.current) {
//                 window.clearTimeout(warningTimeoutRef.current);
//             }
//         };
//     }, []);

//     const openAssessment = (assessment) => {
//         setError("");
//         setSubmissionResult(null);
//         setActiveAssessment(assessment);
//         setCurrentQuestionIndex(0);
//         setAnswers({});
//         setSubmitting(false);
//         setViolationLog([]);
//         setActiveWarning(null);
//         lastViolationAtRef.current = 0;
//         requestExamFullscreen();
//     };

//     const closeAssessment = () => {
//         if (submitting) return;

//         // If an attempt is in progress (started but not yet submitted),
//         // leaving via Back is treated as abandoning the attempt and
//         // auto-submits whatever was answered so far — otherwise a student
//         // could open the assessment, read the questions, hit Back before
//         // anything counts against them, and repeat this indefinitely.
//         if (activeAssessment && !submissionResult) {
//             void handleSubmit(true, "exited_early");
//             return;
//         }

//         setActiveAssessment(null);
//         setCurrentQuestionIndex(0);
//         setAnswers({});
//         setSubmitting(false);
//         setSubmissionResult(null);
//         setError("");
//         setTimeLeft(null);
//         setActiveWarning(null);
//         if (warningTimeoutRef.current) {
//             window.clearTimeout(warningTimeoutRef.current);
//             warningTimeoutRef.current = null;
//         }
//         lastViolationAtRef.current = 0;
//         exitExamFullscreen();
//     };

//     const handleSelectOption = (questionIndex, optionIndex) => {
//         setAnswers((prev) => ({
//             ...prev,
//             [questionIndex]: optionIndex,
//         }));
//     };

//     const goToPrevious = () => {
//         setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
//     };

//     const goToNext = () => {
//         setCurrentQuestionIndex((prev) =>
//             Math.min(questionCount - 1, prev + 1)
//         );
//     };

//     const handleSubmit = async (forced = false, reason = "manual", logOverride = null) => {
//         if (!activeAssessment) return;

//         const questions = activeAssessment.questions || [];
//         const payloadAnswers = questions
//             .map((_, idx) => ({
//                 questionIndex: idx,
//                 selectedOptionIndex: answers[idx],
//             }))
//             .filter((item) => Number.isInteger(item.selectedOptionIndex));

//         if (!forced && payloadAnswers.length !== questions.length) {
//             const proceed = window.confirm(
//                 `You have answered ${payloadAnswers.length} of ${questions.length} questions. Submit anyway?`
//             );
//             if (!proceed) return;
//         }

//         try {
//             setSubmitting(true);
//             setError("");

//             const finalViolationLog = logOverride || violationLog;

//             // NOTE: submitAssessment's signature may need to be extended on the
//             // hook/API side to actually persist `reason` and `violations`.
//             // Passed here so the data is available as soon as the backend
//             // supports it; extra args are harmless if the hook ignores them.
//             const res = await submitAssessment(
//                 activeAssessment._id,
//                 payloadAnswers,
//                 token,
//                 { reason, violations: finalViolationLog }
//             );

//             setSubmissionResult({
//                 score: res?.data?.score ?? 0,
//                 totalMarks: res?.data?.totalMarks ?? 0,
//                 message:
//                     reason === "proctoring_violation"
//                         ? "Your assessment was auto-submitted after repeated attempts to leave the exam screen."
//                         : reason === "exited_early"
//                         ? "Your assessment was submitted because you left before finishing. Attempts can't be reopened once started."
//                         : res?.message || "Assessment submitted successfully",
//             });
//             exitExamFullscreen();
//         } catch (err) {
//             const message =
//                 err?.message ||
//                 "Failed to submit assessment. Please try again.";
//             setError(message);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const currentQuestion =
//         activeAssessment?.questions?.[currentQuestionIndex] || null;

//     if (!activeAssessment) {
//         return (
//             <div className="sa-page">
//                 <div className="sa-header">
//                         <h1 className="sa-title">Assessments</h1>
//                         <p className="sa-subtitle">
//                             Open assessments available for submission
//                         </p>
//                 </div>

//                 {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

//                 {publishedAssessments.length === 0 ? (
//                     <div className="sa-empty">
//                         <h3>No published assessments yet</h3>
//                         <p>When your trainer publishes an assessment, it will appear here.</p>
//                     </div>
//                 ) : (
//                     <div className="sa-grid">
//                         {publishedAssessments.map((assessment) => {
//                             const deadlinePassed =
//                                 assessment.deadline &&
//                                 new Date() > new Date(assessment.deadline);

//                             return (
//                                 <div key={assessment._id} className="sa-card">
//                                     <div className="sa-card-top">
//                                         <div>
//                                             <h3 className="sa-card-title">{assessment.title}</h3>
//                                             <p className="sa-card-meta">
//                                                 {assessment.questions?.length || 0} questions
//                                             </p>
//                                         </div>
//                                         <span
//                                             className={`sa-badge ${deadlinePassed ? "sa-badge-warn" : "sa-badge-ok"
//                                                 }`}
//                                         >
//                                             {deadlinePassed ? "Deadline passed" : "Open"}
//                                         </span>
//                                     </div>

//                                     <div className="sa-card-body">
//                                         <div className="sa-info-row">
//                                             <span>Duration</span>
//                                             <strong>
//                                                 {assessment.durationMinutes
//                                                     ? `${assessment.durationMinutes} min`
//                                                     : "No limit"}
//                                             </strong>
//                                         </div>

//                                         <div className="sa-info-row">
//                                             <span>Scheduled</span>
//                                             <strong>{formatDate(assessment.scheduledDate)}</strong>
//                                         </div>

//                                         <div className="sa-info-row">
//                                             <span>Deadline</span>
//                                             <strong>{formatDate(assessment.deadline)}</strong>
//                                         </div>

//                                         <div className="sa-info-row">
//                                             <span>Status</span>
//                                             <strong>{getAssessmentStatusLabel(assessment)}</strong>
//                                         </div>
//                                     </div>

//                                     <div className="sa-card-actions">
//                                         <button
//                                             type="button"
//                                             className="sa-btn sa-btn-primary"
//                                             onClick={() => openAssessment(assessment)}
//                                             disabled={deadlinePassed}
//                                         >
//                                             {deadlinePassed ? "Closed" : "Start assessment"}
//                                         </button>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>
//         );
//     }

//     if (submissionResult) {
//         return (
//             <div className="sa-page">
//                 <div className="sa-result">
//                     <div className="sa-result-icon">✓</div>
//                     <h1>Assessment submitted</h1>
//                     <p>{submissionResult.message}</p>

//                     <div className="sa-result-score">
//                         <div className="sa-score-value">
//                             {submissionResult.score} / {submissionResult.totalMarks}
//                         </div>
//                         <div className="sa-score-label">Your score</div>
//                     </div>

//                     <div className="sa-result-actions">
//                         <button
//                             type="button"
//                             className="sa-btn sa-btn-primary"
//                             onClick={closeAssessment}
//                         >
//                             Back to assessments
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const progress =
//         questionCount > 0 ? ((currentQuestionIndex + 1) / questionCount) * 100 : 0;

//     return (
//         <div className="sa-page">
//             <div className="sa-exam-shell">
//                 {activeWarning ? (
//                     <div className="sa-alert sa-alert-warning sa-proctor-warning">
//                         <strong>
//                             Warning {activeWarning.count}/{MAX_VIOLATIONS}:
//                         </strong>{" "}
//                         {violationLabel(activeWarning.type)}. Your assessment will be
//                         auto-submitted if this happens{" "}
//                         {Math.max(0, MAX_VIOLATIONS - activeWarning.count)} more time
//                         {MAX_VIOLATIONS - activeWarning.count === 1 ? "" : "s"}.
//                     </div>
//                 ) : null}

//                 <div className="sa-exam-header">
//                     <div>
//                         <button
//                             type="button"
//                             className="sa-back"
//                             onClick={closeAssessment}
//                             disabled={submitting}
//                         >
//                             ← Back
//                         </button>
//                         <h1 className="sa-title">{activeAssessment.title}</h1>
//                         <p className="sa-subtitle">
//                             Question {currentQuestionIndex + 1} of {questionCount}
//                         </p>
//                     </div>

//                     <div className="sa-header-stats">
//                         <div className="sa-stat">
//                             <span>Answered</span>
//                             <strong>
//                                 {answeredCount}/{questionCount}
//                             </strong>
//                         </div>

//                         <div className="sa-stat">
//                             <span>Remaining</span>
//                             <strong>{unansweredCount}</strong>
//                         </div>

//                         {activeAssessment.durationMinutes ? (
//                             <div className="sa-stat sa-stat-timer">
//                                 <span>Time left</span>
//                                 <strong>{formatTimeLeft(timeLeft)}</strong>
//                             </div>
//                         ) : null}

//                         <div className="sa-stat sa-stat-proctor">
//                             <span>Violations</span>
//                             <strong>
//                                 {violationLog.length}/{MAX_VIOLATIONS}
//                             </strong>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="sa-progress-wrap">
//                     <div className="sa-progress-bar">
//                         <div className="sa-progress-fill" style={{ width: `${progress}%` }} />
//                     </div>
//                 </div>

//                 {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

//                 <div className="sa-exam-grid">
//                     <div className="sa-question-panel">
//                         <div className="sa-question-head">
//                             <div className="sa-question-number">
//                                 Question {currentQuestionIndex + 1}
//                             </div>
//                             <div className="sa-question-marks">
//                                 {currentQuestion?.marks ?? 1} mark
//                                 {(currentQuestion?.marks ?? 1) !== 1 ? "s" : ""}
//                             </div>
//                         </div>

//                         <h2 className="sa-question-text">
//                             {currentQuestion?.questionText || "No question available"}
//                         </h2>

//                         <div className="sa-options">
//                             {(currentQuestion?.options || []).map((option, optionIndex) => {
//                                 const selected = answers[currentQuestionIndex] === optionIndex;

//                                 return (
//                                     <button
//                                         key={`${currentQuestionIndex}-${optionIndex}`}
//                                         type="button"
//                                         className={`sa-option ${selected ? "sa-option-selected" : ""}`}
//                                         onClick={() =>
//                                             handleSelectOption(currentQuestionIndex, optionIndex)
//                                         }
//                                         disabled={submitting}
//                                     >
//                                         <span className="sa-option-key">
//                                             {String.fromCharCode(65 + optionIndex)}
//                                         </span>
//                                         <span className="sa-option-text">{option}</span>
//                                     </button>
//                                 );
//                             })}
//                         </div>

//                         <div className="sa-nav">
//                             <button
//                                 type="button"
//                                 className="sa-btn sa-btn-secondary"
//                                 onClick={goToPrevious}
//                                 disabled={currentQuestionIndex === 0 || submitting}
//                             >
//                                 Previous
//                             </button>

//                             <button
//                                 type="button"
//                                 className="sa-btn sa-btn-secondary"
//                                 onClick={goToNext}
//                                 disabled={currentQuestionIndex === questionCount - 1 || submitting}
//                             >
//                                 Next
//                             </button>

//                             <button
//                                 type="button"
//                                 className="sa-btn sa-btn-primary"
//                                 onClick={() => handleSubmit(false, "manual")}
//                                 disabled={submitting}
//                             >
//                                 {submitting ? "Submitting..." : "Submit assessment"}
//                             </button>
//                         </div>
//                     </div>

//                     <div className="sa-side-panel">
//                         <div className="sa-side-card">
//                             <h3>Assessment details</h3>
//                             <div className="sa-info-row">
//                                 <span>Total questions</span>
//                                 <strong>{questionCount}</strong>
//                             </div>
//                             <div className="sa-info-row">
//                                 <span>Duration</span>
//                                 <strong>
//                                     {activeAssessment.durationMinutes
//                                         ? `${activeAssessment.durationMinutes} min`
//                                         : "No limit"}
//                                 </strong>
//                             </div>
//                             <div className="sa-info-row">
//                                 <span>Deadline</span>
//                                 <strong>{formatDate(activeAssessment.deadline)}</strong>
//                             </div>
//                             <div className="sa-info-row">
//                                 <span>Scheduled</span>
//                                 <strong>{formatDate(activeAssessment.scheduledDate)}</strong>
//                             </div>
//                         </div>

//                         <div className="sa-side-card">
//                             <h3>Question navigator</h3>
//                             <div className="sa-nav-grid">
//                                 {activeAssessment.questions?.map((_, index) => {
//                                     const answered = answers[index] !== undefined;
//                                     const active = index === currentQuestionIndex;

//                                     return (
//                                         <button
//                                             key={index}
//                                             type="button"
//                                             className={`sa-qdot ${answered ? "sa-qdot-answered" : ""
//                                                 } ${active ? "sa-qdot-active" : ""}`}
//                                             onClick={() => setCurrentQuestionIndex(index)}
//                                             disabled={submitting}
//                                             aria-label={`Go to question ${index + 1}`}
//                                         >
//                                             {index + 1}
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//                         </div>

//                         <div className="sa-side-card sa-side-note">
//                             <h3>Submission rules</h3>
//                             <p>
//                                 Your assessment is graded automatically after submission. You can
//                                 submit even if some questions are unanswered, but they will count
//                                 as incorrect.
//                             </p>
//                             <p>
//                                 Leaving this screen (switching tabs, minimizing, or exiting
//                                 fullscreen) is logged. After {MAX_VIOLATIONS} such attempts your
//                                 assessment is auto-submitted.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
















// // import React, { useEffect, useMemo, useRef, useState } from "react";

// // // Adjust this import path to your project structure
// // // import { submitAssessment } from "../../../api/assessments";
// // import { useStu } from "../../../hooks/useStu";


// // import './StudentAssessment.css'


// // // --- Proctoring config ---
// // // After this many violations (tab switch / window blur / fullscreen exit),
// // // the assessment is auto-submitted.
// // const MAX_VIOLATIONS = 3;
// // // Minimum gap between two violation events before we count a new one.
// // // Prevents a single alt-tab from firing both `blur` and `visibilitychange`
// // // and being counted twice.
// // const VIOLATION_DEBOUNCE_MS = 800;


// // function formatDate(value) {
// //     if (!value) return "—";
// //     const date = new Date(value);
// //     if (Number.isNaN(date.getTime())) return "—";
// //     return date.toLocaleString("en-IN", {
// //         dateStyle: "medium",
// //         timeStyle: "short",
// //     });
// // }

// // function formatTimeLeft(seconds) {
// //     if (seconds === null || seconds === undefined) return "";
// //     const safe = Math.max(0, Math.floor(seconds));
// //     const hrs = Math.floor(safe / 3600);
// //     const mins = Math.floor((safe % 3600) / 60);
// //     const secs = safe % 60;
// //     return [hrs, mins, secs]
// //         .map((v, i) => (i === 0 ? String(v) : String(v).padStart(2, "0")))
// //         .join(":");
// // }

// // function getAssessmentStatusLabel(assessment) {
// //     if (!assessment) return "";
// //     if (assessment.status === "published") return "Open";
// //     if (assessment.status === "closed") return "Closed";
// //     return "Draft";
// // }

// // function violationLabel(type) {
// //     switch (type) {
// //         case "tab_hidden":
// //             return "Switched tab / minimized window";
// //         case "window_blur":
// //             return "Left the assessment window";
// //         case "fullscreen_exit":
// //             return "Exited fullscreen mode";
// //         default:
// //             return "Left the assessment screen";
// //     }
// // }

// // export default function StudentAssessment({ token }) {

// //     const { 
// //         myPerformance ,
// //         AllAssessments,
// //         submitAssessment

// //     } = useStu(token);

// //     const publishedAssessments = useMemo(() => {
// //         const list = Array.isArray(AllAssessments) ? AllAssessments : [];
// //         return list.filter((item) => item?.status === "published");
// //     }, [AllAssessments]);

// //     const [activeAssessment, setActiveAssessment] = useState(null);
// //     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //     const [answers, setAnswers] = useState({});
// //     const [submitting, setSubmitting] = useState(false);
// //     const [submissionResult, setSubmissionResult] = useState(null);
// //     const [error, setError] = useState("");
// //     const [timeLeft, setTimeLeft] = useState(null);

// //     // --- Proctoring state ---
// //     const [violationLog, setViolationLog] = useState([]);
// //     const [activeWarning, setActiveWarning] = useState(null); // { type, count } | null
// //     const lastViolationAtRef = useRef(0);
// //     const proctoringActiveRef = useRef(false);
// //     const warningTimeoutRef = useRef(null);

// //     const questionCount = activeAssessment?.questions?.length || 0;
// //     const answeredCount = Object.keys(answers).length;
// //     const unansweredCount = Math.max(0, questionCount - answeredCount);

// //     useEffect(() => {
// //         if (!activeAssessment?.durationMinutes) {
// //             setTimeLeft(null);
// //             return;
// //         }

// //         setTimeLeft(Math.max(0, Number(activeAssessment.durationMinutes) * 60));
// //     }, [activeAssessment?._id]);

// //     useEffect(() => {
// //         if (!activeAssessment || submitting || submissionResult) return;
// //         if (timeLeft === null) return;
// //         if (timeLeft <= 0) return;

// //         const timer = window.setInterval(() => {
// //             setTimeLeft((prev) => {
// //                 if (prev === null) return prev;
// //                 if (prev <= 1) {
// //                     window.clearInterval(timer);
// //                     return 0;
// //                 }
// //                 return prev - 1;
// //             });
// //         }, 1000);

// //         return () => window.clearInterval(timer);
// //     }, [activeAssessment, timeLeft, submitting, submissionResult]);

// //     useEffect(() => {
// //         if (!activeAssessment || !activeAssessment.durationMinutes) return;
// //         if (timeLeft !== 0) return;
// //         if (submitting || submissionResult) return;
// //         void handleSubmit(true, "time_expired");
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, [timeLeft]);

// //     // Keep a ref in sync so event listeners (registered once) always know
// //     // whether an exam is currently in progress, without re-binding on every render.
// //     useEffect(() => {
// //         proctoringActiveRef.current =
// //             !!activeAssessment && !submitting && !submissionResult;
// //     }, [activeAssessment, submitting, submissionResult]);

// //     const registerViolation = (type) => {
// //         if (!proctoringActiveRef.current) return;

// //         const now = Date.now();
// //         if (now - lastViolationAtRef.current < VIOLATION_DEBOUNCE_MS) {
// //             // Same real-world event triggered multiple browser events
// //             // (e.g. blur + visibilitychange together) — don't double count.
// //             return;
// //         }
// //         lastViolationAtRef.current = now;

// //         setViolationLog((prev) => {
// //             const entry = { type, at: new Date().toISOString() };
// //             const next = [...prev, entry];

// //             const count = next.length;
// //             setActiveWarning({ type, count });

// //             if (warningTimeoutRef.current) {
// //                 window.clearTimeout(warningTimeoutRef.current);
// //             }
// //             warningTimeoutRef.current = window.setTimeout(() => {
// //                 setActiveWarning(null);
// //             }, 6000);

// //             if (count >= MAX_VIOLATIONS) {
// //                 // Stop listening / stop counting further violations immediately.
// //                 proctoringActiveRef.current = false;
// //                 void handleSubmit(true, "proctoring_violation", next);
// //             }

// //             return next;
// //         });
// //     };

// //     const requestExamFullscreen = () => {
// //         const el = document.documentElement;
// //         if (!el || !el.requestFullscreen) return;
// //         el.requestFullscreen().catch(() => {
// //             // Fullscreen may be blocked (e.g. no user gesture, unsupported
// //             // browser). We don't hard-fail the exam over this — it's one
// //             // layer of several.
// //         });
// //     };

// //     const exitExamFullscreen = () => {
// //         if (document.fullscreenElement && document.exitFullscreen) {
// //             document.exitFullscreen().catch(() => {});
// //         }
// //     };

// //     // Proctoring listeners: only bound while an assessment is actively in progress.
// //     useEffect(() => {
// //         if (!activeAssessment || submitting || submissionResult) return;

// //         const handleVisibilityChange = () => {
// //             if (document.hidden) registerViolation("tab_hidden");
// //         };
// //         const handleBlur = () => registerViolation("window_blur");
// //         const handleFullscreenChange = () => {
// //             if (!document.fullscreenElement) registerViolation("fullscreen_exit");
// //         };
// //         const handleBeforeUnload = (e) => {
// //             e.preventDefault();
// //             e.returnValue =
// //                 "Leaving now will end your attempt. Are you sure you want to exit the assessment?";
// //             return e.returnValue;
// //         };
// //         const blockContextMenu = (e) => e.preventDefault();
// //         const blockCopyPaste = (e) => e.preventDefault();

// //         document.addEventListener("visibilitychange", handleVisibilityChange);
// //         window.addEventListener("blur", handleBlur);
// //         document.addEventListener("fullscreenchange", handleFullscreenChange);
// //         window.addEventListener("beforeunload", handleBeforeUnload);
// //         document.addEventListener("contextmenu", blockContextMenu);
// //         document.addEventListener("copy", blockCopyPaste);
// //         document.addEventListener("cut", blockCopyPaste);
// //         document.addEventListener("paste", blockCopyPaste);

// //         return () => {
// //             document.removeEventListener("visibilitychange", handleVisibilityChange);
// //             window.removeEventListener("blur", handleBlur);
// //             document.removeEventListener("fullscreenchange", handleFullscreenChange);
// //             window.removeEventListener("beforeunload", handleBeforeUnload);
// //             document.removeEventListener("contextmenu", blockContextMenu);
// //             document.removeEventListener("copy", blockCopyPaste);
// //             document.removeEventListener("cut", blockCopyPaste);
// //             document.removeEventListener("paste", blockCopyPaste);
// //         };
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, [activeAssessment?._id, submitting, submissionResult]);

// //     useEffect(() => {
// //         return () => {
// //             if (warningTimeoutRef.current) {
// //                 window.clearTimeout(warningTimeoutRef.current);
// //             }
// //         };
// //     }, []);

// //     const openAssessment = (assessment) => {
// //         setError("");
// //         setSubmissionResult(null);
// //         setActiveAssessment(assessment);
// //         setCurrentQuestionIndex(0);
// //         setAnswers({});
// //         setSubmitting(false);
// //         setViolationLog([]);
// //         setActiveWarning(null);
// //         lastViolationAtRef.current = 0;
// //         requestExamFullscreen();
// //     };

// //     const closeAssessment = () => {
// //         if (submitting) return;

// //         // If an attempt is in progress (started but not yet submitted),
// //         // leaving via Back is treated as abandoning the attempt and
// //         // auto-submits whatever was answered so far — otherwise a student
// //         // could open the assessment, read the questions, hit Back before
// //         // anything counts against them, and repeat this indefinitely.
// //         if (activeAssessment && !submissionResult) {
// //             void handleSubmit(true, "exited_early");
// //             return;
// //         }

// //         setActiveAssessment(null);
// //         setCurrentQuestionIndex(0);
// //         setAnswers({});
// //         setSubmitting(false);
// //         setSubmissionResult(null);
// //         setError("");
// //         setTimeLeft(null);
// //         setActiveWarning(null);
// //         exitExamFullscreen();
// //     };

// //     const handleSelectOption = (questionIndex, optionIndex) => {
// //         setAnswers((prev) => ({
// //             ...prev,
// //             [questionIndex]: optionIndex,
// //         }));
// //     };

// //     const goToPrevious = () => {
// //         setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
// //     };

// //     const goToNext = () => {
// //         setCurrentQuestionIndex((prev) =>
// //             Math.min(questionCount - 1, prev + 1)
// //         );
// //     };

// //     const handleSubmit = async (forced = false, reason = "manual", logOverride = null) => {
// //         if (!activeAssessment) return;

// //         const questions = activeAssessment.questions || [];
// //         const payloadAnswers = questions
// //             .map((_, idx) => ({
// //                 questionIndex: idx,
// //                 selectedOptionIndex: answers[idx],
// //             }))
// //             .filter((item) => Number.isInteger(item.selectedOptionIndex));

// //         if (!forced && payloadAnswers.length !== questions.length) {
// //             const proceed = window.confirm(
// //                 `You have answered ${payloadAnswers.length} of ${questions.length} questions. Submit anyway?`
// //             );
// //             if (!proceed) return;
// //         }

// //         try {
// //             setSubmitting(true);
// //             setError("");

// //             const finalViolationLog = logOverride || violationLog;

// //             // NOTE: submitAssessment's signature may need to be extended on the
// //             // hook/API side to actually persist `reason` and `violations`.
// //             // Passed here so the data is available as soon as the backend
// //             // supports it; extra args are harmless if the hook ignores them.
// //             const res = await submitAssessment(
// //                 activeAssessment._id,
// //                 payloadAnswers,
// //                 token,
// //                 { reason, violations: finalViolationLog }
// //             );

// //             setSubmissionResult({
// //                 score: res?.data?.score ?? 0,
// //                 totalMarks: res?.data?.totalMarks ?? 0,
// //                 message:
// //                     reason === "proctoring_violation"
// //                         ? "Your assessment was auto-submitted after repeated attempts to leave the exam screen."
// //                         : reason === "exited_early"
// //                         ? "Your assessment was submitted because you left before finishing. Attempts can't be reopened once started."
// //                         : res?.message || "Assessment submitted successfully",
// //             });
// //             exitExamFullscreen();
// //         } catch (err) {
// //             const message =
// //                 err?.message ||
// //                 "Failed to submit assessment. Please try again.";
// //             setError(message);
// //         } finally {
// //             setSubmitting(false);
// //         }
// //     };

// //     const currentQuestion =
// //         activeAssessment?.questions?.[currentQuestionIndex] || null;

// //     if (!activeAssessment) {
// //         return (
// //             <div className="sa-page">
// //                 <div className="sa-header">
// //                         <h1 className="sa-title">Assessments</h1>
// //                         <p className="sa-subtitle">
// //                             Open assessments available for submission
// //                         </p>
// //                 </div>

// //                 {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

// //                 {publishedAssessments.length === 0 ? (
// //                     <div className="sa-empty">
// //                         <h3>No published assessments yet</h3>
// //                         <p>When your trainer publishes an assessment, it will appear here.</p>
// //                     </div>
// //                 ) : (
// //                     <div className="sa-grid">
// //                         {publishedAssessments.map((assessment) => {
// //                             const deadlinePassed =
// //                                 assessment.deadline &&
// //                                 new Date() > new Date(assessment.deadline);

// //                             return (
// //                                 <div key={assessment._id} className="sa-card">
// //                                     <div className="sa-card-top">
// //                                         <div>
// //                                             <h3 className="sa-card-title">{assessment.title}</h3>
// //                                             <p className="sa-card-meta">
// //                                                 {assessment.questions?.length || 0} questions
// //                                             </p>
// //                                         </div>
// //                                         <span
// //                                             className={`sa-badge ${deadlinePassed ? "sa-badge-warn" : "sa-badge-ok"
// //                                                 }`}
// //                                         >
// //                                             {deadlinePassed ? "Deadline passed" : "Open"}
// //                                         </span>
// //                                     </div>

// //                                     <div className="sa-card-body">
// //                                         <div className="sa-info-row">
// //                                             <span>Duration</span>
// //                                             <strong>
// //                                                 {assessment.durationMinutes
// //                                                     ? `${assessment.durationMinutes} min`
// //                                                     : "No limit"}
// //                                             </strong>
// //                                         </div>

// //                                         <div className="sa-info-row">
// //                                             <span>Scheduled</span>
// //                                             <strong>{formatDate(assessment.scheduledDate)}</strong>
// //                                         </div>

// //                                         <div className="sa-info-row">
// //                                             <span>Deadline</span>
// //                                             <strong>{formatDate(assessment.deadline)}</strong>
// //                                         </div>

// //                                         <div className="sa-info-row">
// //                                             <span>Status</span>
// //                                             <strong>{getAssessmentStatusLabel(assessment)}</strong>
// //                                         </div>
// //                                     </div>

// //                                     <div className="sa-card-actions">
// //                                         <button
// //                                             type="button"
// //                                             className="sa-btn sa-btn-primary"
// //                                             onClick={() => openAssessment(assessment)}
// //                                             disabled={deadlinePassed}
// //                                         >
// //                                             {deadlinePassed ? "Closed" : "Start assessment"}
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             );
// //                         })}
// //                     </div>
// //                 )}
// //             </div>
// //         );
// //     }

// //     if (submissionResult) {
// //         return (
// //             <div className="sa-page">
// //                 <div className="sa-result">
// //                     <div className="sa-result-icon">✓</div>
// //                     <h1>Assessment submitted</h1>
// //                     <p>{submissionResult.message}</p>

// //                     <div className="sa-result-score">
// //                         <div className="sa-score-value">
// //                             {submissionResult.score} / {submissionResult.totalMarks}
// //                         </div>
// //                         <div className="sa-score-label">Your score</div>
// //                     </div>

// //                     <div className="sa-result-actions">
// //                         <button
// //                             type="button"
// //                             className="sa-btn sa-btn-primary"
// //                             onClick={closeAssessment}
// //                         >
// //                             Back to assessments
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     const progress =
// //         questionCount > 0 ? ((currentQuestionIndex + 1) / questionCount) * 100 : 0;

// //     return (
// //         <div className="sa-page">
// //             <div className="sa-exam-shell">
// //                 {activeWarning ? (
// //                     <div className="sa-alert sa-alert-warning sa-proctor-warning">
// //                         <strong>
// //                             Warning {activeWarning.count}/{MAX_VIOLATIONS}:
// //                         </strong>{" "}
// //                         {violationLabel(activeWarning.type)}. Your assessment will be
// //                         auto-submitted if this happens{" "}
// //                         {Math.max(0, MAX_VIOLATIONS - activeWarning.count)} more time
// //                         {MAX_VIOLATIONS - activeWarning.count === 1 ? "" : "s"}.
// //                     </div>
// //                 ) : null}

// //                 <div className="sa-exam-header">
// //                     <div>
// //                         <button
// //                             type="button"
// //                             className="sa-back"
// //                             onClick={closeAssessment}
// //                             disabled={submitting}
// //                         >
// //                             ← Back
// //                         </button>
// //                         <h1 className="sa-title">{activeAssessment.title}</h1>
// //                         <p className="sa-subtitle">
// //                             Question {currentQuestionIndex + 1} of {questionCount}
// //                         </p>
// //                     </div>

// //                     <div className="sa-header-stats">
// //                         <div className="sa-stat">
// //                             <span>Answered</span>
// //                             <strong>
// //                                 {answeredCount}/{questionCount}
// //                             </strong>
// //                         </div>

// //                         <div className="sa-stat">
// //                             <span>Remaining</span>
// //                             <strong>{unansweredCount}</strong>
// //                         </div>

// //                         {activeAssessment.durationMinutes ? (
// //                             <div className="sa-stat sa-stat-timer">
// //                                 <span>Time left</span>
// //                                 <strong>{formatTimeLeft(timeLeft)}</strong>
// //                             </div>
// //                         ) : null}

// //                         <div className="sa-stat sa-stat-proctor">
// //                             <span>Violations</span>
// //                             <strong>
// //                                 {violationLog.length}/{MAX_VIOLATIONS}
// //                             </strong>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="sa-progress-wrap">
// //                     <div className="sa-progress-bar">
// //                         <div className="sa-progress-fill" style={{ width: `${progress}%` }} />
// //                     </div>
// //                 </div>

// //                 {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

// //                 <div className="sa-exam-grid">
// //                     <div className="sa-question-panel">
// //                         <div className="sa-question-head">
// //                             <div className="sa-question-number">
// //                                 Question {currentQuestionIndex + 1}
// //                             </div>
// //                             <div className="sa-question-marks">
// //                                 {currentQuestion?.marks ?? 1} mark
// //                                 {(currentQuestion?.marks ?? 1) !== 1 ? "s" : ""}
// //                             </div>
// //                         </div>

// //                         <h2 className="sa-question-text">
// //                             {currentQuestion?.questionText || "No question available"}
// //                         </h2>

// //                         <div className="sa-options">
// //                             {(currentQuestion?.options || []).map((option, optionIndex) => {
// //                                 const selected = answers[currentQuestionIndex] === optionIndex;

// //                                 return (
// //                                     <button
// //                                         key={`${currentQuestionIndex}-${optionIndex}`}
// //                                         type="button"
// //                                         className={`sa-option ${selected ? "sa-option-selected" : ""}`}
// //                                         onClick={() =>
// //                                             handleSelectOption(currentQuestionIndex, optionIndex)
// //                                         }
// //                                         disabled={submitting}
// //                                     >
// //                                         <span className="sa-option-key">
// //                                             {String.fromCharCode(65 + optionIndex)}
// //                                         </span>
// //                                         <span className="sa-option-text">{option}</span>
// //                                     </button>
// //                                 );
// //                             })}
// //                         </div>

// //                         <div className="sa-nav">
// //                             <button
// //                                 type="button"
// //                                 className="sa-btn sa-btn-secondary"
// //                                 onClick={goToPrevious}
// //                                 disabled={currentQuestionIndex === 0 || submitting}
// //                             >
// //                                 Previous
// //                             </button>

// //                             <button
// //                                 type="button"
// //                                 className="sa-btn sa-btn-secondary"
// //                                 onClick={goToNext}
// //                                 disabled={currentQuestionIndex === questionCount - 1 || submitting}
// //                             >
// //                                 Next
// //                             </button>

// //                             <button
// //                                 type="button"
// //                                 className="sa-btn sa-btn-primary"
// //                                 onClick={() => handleSubmit(false, "manual")}
// //                                 disabled={submitting}
// //                             >
// //                                 {submitting ? "Submitting..." : "Submit assessment"}
// //                             </button>
// //                         </div>
// //                     </div>

// //                     <div className="sa-side-panel">
// //                         <div className="sa-side-card">
// //                             <h3>Assessment details</h3>
// //                             <div className="sa-info-row">
// //                                 <span>Total questions</span>
// //                                 <strong>{questionCount}</strong>
// //                             </div>
// //                             <div className="sa-info-row">
// //                                 <span>Duration</span>
// //                                 <strong>
// //                                     {activeAssessment.durationMinutes
// //                                         ? `${activeAssessment.durationMinutes} min`
// //                                         : "No limit"}
// //                                 </strong>
// //                             </div>
// //                             <div className="sa-info-row">
// //                                 <span>Deadline</span>
// //                                 <strong>{formatDate(activeAssessment.deadline)}</strong>
// //                             </div>
// //                             <div className="sa-info-row">
// //                                 <span>Scheduled</span>
// //                                 <strong>{formatDate(activeAssessment.scheduledDate)}</strong>
// //                             </div>
// //                         </div>

// //                         <div className="sa-side-card">
// //                             <h3>Question navigator</h3>
// //                             <div className="sa-nav-grid">
// //                                 {activeAssessment.questions?.map((_, index) => {
// //                                     const answered = answers[index] !== undefined;
// //                                     const active = index === currentQuestionIndex;

// //                                     return (
// //                                         <button
// //                                             key={index}
// //                                             type="button"
// //                                             className={`sa-qdot ${answered ? "sa-qdot-answered" : ""
// //                                                 } ${active ? "sa-qdot-active" : ""}`}
// //                                             onClick={() => setCurrentQuestionIndex(index)}
// //                                             disabled={submitting}
// //                                             aria-label={`Go to question ${index + 1}`}
// //                                         >
// //                                             {index + 1}
// //                                         </button>
// //                                     );
// //                                 })}
// //                             </div>
// //                         </div>

// //                         <div className="sa-side-card sa-side-note">
// //                             <h3>Submission rules</h3>
// //                             <p>
// //                                 Your assessment is graded automatically after submission. You can
// //                                 submit even if some questions are unanswered, but they will count
// //                                 as incorrect.
// //                             </p>
// //                             <p>
// //                                 Leaving this screen (switching tabs, minimizing, or exiting
// //                                 fullscreen) is logged. After {MAX_VIOLATIONS} such attempts your
// //                                 assessment is auto-submitted.
// //                             </p>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }










// // // import React, { useEffect, useMemo, useRef, useState } from "react";

// // // // Adjust this import path to your project structure
// // // // import { submitAssessment } from "../../../api/assessments";
// // // import { useStu } from "../../../hooks/useStu";


// // // import './StudentAssessment.css'


// // // // --- Proctoring config ---
// // // // After this many violations (tab switch / window blur / fullscreen exit),
// // // // the assessment is auto-submitted.
// // // const MAX_VIOLATIONS = 3;
// // // // Minimum gap between two violation events before we count a new one.
// // // // Prevents a single alt-tab from firing both `blur` and `visibilitychange`
// // // // and being counted twice.
// // // const VIOLATION_DEBOUNCE_MS = 800;


// // // function formatDate(value) {
// // //     if (!value) return "—";
// // //     const date = new Date(value);
// // //     if (Number.isNaN(date.getTime())) return "—";
// // //     return date.toLocaleString("en-IN", {
// // //         dateStyle: "medium",
// // //         timeStyle: "short",
// // //     });
// // // }

// // // function formatTimeLeft(seconds) {
// // //     if (seconds === null || seconds === undefined) return "";
// // //     const safe = Math.max(0, Math.floor(seconds));
// // //     const hrs = Math.floor(safe / 3600);
// // //     const mins = Math.floor((safe % 3600) / 60);
// // //     const secs = safe % 60;
// // //     return [hrs, mins, secs]
// // //         .map((v, i) => (i === 0 ? String(v) : String(v).padStart(2, "0")))
// // //         .join(":");
// // // }

// // // function getAssessmentStatusLabel(assessment) {
// // //     if (!assessment) return "";
// // //     if (assessment.status === "published") return "Open";
// // //     if (assessment.status === "closed") return "Closed";
// // //     return "Draft";
// // // }

// // // function violationLabel(type) {
// // //     switch (type) {
// // //         case "tab_hidden":
// // //             return "Switched tab / minimized window";
// // //         case "window_blur":
// // //             return "Left the assessment window";
// // //         case "fullscreen_exit":
// // //             return "Exited fullscreen mode";
// // //         default:
// // //             return "Left the assessment screen";
// // //     }
// // // }

// // // export default function StudentAssessment({ token }) {

// // //     const { 
// // //         myPerformance ,
// // //         AllAssessments,
// // //         submitAssessment

// // //     } = useStu(token);

// // //     const publishedAssessments = useMemo(() => {
// // //         const list = Array.isArray(AllAssessments) ? AllAssessments : [];
// // //         return list.filter((item) => item?.status === "published");
// // //     }, [AllAssessments]);

// // //     const [activeAssessment, setActiveAssessment] = useState(null);
// // //     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// // //     const [answers, setAnswers] = useState({});
// // //     const [submitting, setSubmitting] = useState(false);
// // //     const [submissionResult, setSubmissionResult] = useState(null);
// // //     const [error, setError] = useState("");
// // //     const [timeLeft, setTimeLeft] = useState(null);

// // //     // --- Proctoring state ---
// // //     const [violationLog, setViolationLog] = useState([]);
// // //     const [activeWarning, setActiveWarning] = useState(null); // { type, count } | null
// // //     const lastViolationAtRef = useRef(0);
// // //     const proctoringActiveRef = useRef(false);
// // //     const warningTimeoutRef = useRef(null);

// // //     const questionCount = activeAssessment?.questions?.length || 0;
// // //     const answeredCount = Object.keys(answers).length;
// // //     const unansweredCount = Math.max(0, questionCount - answeredCount);

// // //     useEffect(() => {
// // //         if (!activeAssessment?.durationMinutes) {
// // //             setTimeLeft(null);
// // //             return;
// // //         }

// // //         setTimeLeft(Math.max(0, Number(activeAssessment.durationMinutes) * 60));
// // //     }, [activeAssessment?._id]);

// // //     useEffect(() => {
// // //         if (!activeAssessment || submitting || submissionResult) return;
// // //         if (timeLeft === null) return;
// // //         if (timeLeft <= 0) return;

// // //         const timer = window.setInterval(() => {
// // //             setTimeLeft((prev) => {
// // //                 if (prev === null) return prev;
// // //                 if (prev <= 1) {
// // //                     window.clearInterval(timer);
// // //                     return 0;
// // //                 }
// // //                 return prev - 1;
// // //             });
// // //         }, 1000);

// // //         return () => window.clearInterval(timer);
// // //     }, [activeAssessment, timeLeft, submitting, submissionResult]);

// // //     useEffect(() => {
// // //         if (!activeAssessment || !activeAssessment.durationMinutes) return;
// // //         if (timeLeft !== 0) return;
// // //         if (submitting || submissionResult) return;
// // //         void handleSubmit(true, "time_expired");
// // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // //     }, [timeLeft]);

// // //     // Keep a ref in sync so event listeners (registered once) always know
// // //     // whether an exam is currently in progress, without re-binding on every render.
// // //     useEffect(() => {
// // //         proctoringActiveRef.current =
// // //             !!activeAssessment && !submitting && !submissionResult;
// // //     }, [activeAssessment, submitting, submissionResult]);

// // //     const registerViolation = (type) => {
// // //         if (!proctoringActiveRef.current) return;

// // //         const now = Date.now();
// // //         if (now - lastViolationAtRef.current < VIOLATION_DEBOUNCE_MS) {
// // //             // Same real-world event triggered multiple browser events
// // //             // (e.g. blur + visibilitychange together) — don't double count.
// // //             return;
// // //         }
// // //         lastViolationAtRef.current = now;

// // //         setViolationLog((prev) => {
// // //             const entry = { type, at: new Date().toISOString() };
// // //             const next = [...prev, entry];

// // //             const count = next.length;
// // //             setActiveWarning({ type, count });

// // //             if (warningTimeoutRef.current) {
// // //                 window.clearTimeout(warningTimeoutRef.current);
// // //             }
// // //             warningTimeoutRef.current = window.setTimeout(() => {
// // //                 setActiveWarning(null);
// // //             }, 6000);

// // //             if (count >= MAX_VIOLATIONS) {
// // //                 // Stop listening / stop counting further violations immediately.
// // //                 proctoringActiveRef.current = false;
// // //                 void handleSubmit(true, "proctoring_violation", next);
// // //             }

// // //             return next;
// // //         });
// // //     };

// // //     const requestExamFullscreen = () => {
// // //         const el = document.documentElement;
// // //         if (!el || !el.requestFullscreen) return;
// // //         el.requestFullscreen().catch(() => {
// // //             // Fullscreen may be blocked (e.g. no user gesture, unsupported
// // //             // browser). We don't hard-fail the exam over this — it's one
// // //             // layer of several.
// // //         });
// // //     };

// // //     const exitExamFullscreen = () => {
// // //         if (document.fullscreenElement && document.exitFullscreen) {
// // //             document.exitFullscreen().catch(() => {});
// // //         }
// // //     };

// // //     // Proctoring listeners: only bound while an assessment is actively in progress.
// // //     useEffect(() => {
// // //         if (!activeAssessment || submitting || submissionResult) return;

// // //         const handleVisibilityChange = () => {
// // //             if (document.hidden) registerViolation("tab_hidden");
// // //         };
// // //         const handleBlur = () => registerViolation("window_blur");
// // //         const handleFullscreenChange = () => {
// // //             if (!document.fullscreenElement) registerViolation("fullscreen_exit");
// // //         };
// // //         const handleBeforeUnload = (e) => {
// // //             e.preventDefault();
// // //             e.returnValue =
// // //                 "Leaving now will end your attempt. Are you sure you want to exit the assessment?";
// // //             return e.returnValue;
// // //         };
// // //         const blockContextMenu = (e) => e.preventDefault();
// // //         const blockCopyPaste = (e) => e.preventDefault();

// // //         document.addEventListener("visibilitychange", handleVisibilityChange);
// // //         window.addEventListener("blur", handleBlur);
// // //         document.addEventListener("fullscreenchange", handleFullscreenChange);
// // //         window.addEventListener("beforeunload", handleBeforeUnload);
// // //         document.addEventListener("contextmenu", blockContextMenu);
// // //         document.addEventListener("copy", blockCopyPaste);
// // //         document.addEventListener("cut", blockCopyPaste);
// // //         document.addEventListener("paste", blockCopyPaste);

// // //         return () => {
// // //             document.removeEventListener("visibilitychange", handleVisibilityChange);
// // //             window.removeEventListener("blur", handleBlur);
// // //             document.removeEventListener("fullscreenchange", handleFullscreenChange);
// // //             window.removeEventListener("beforeunload", handleBeforeUnload);
// // //             document.removeEventListener("contextmenu", blockContextMenu);
// // //             document.removeEventListener("copy", blockCopyPaste);
// // //             document.removeEventListener("cut", blockCopyPaste);
// // //             document.removeEventListener("paste", blockCopyPaste);
// // //         };
// // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // //     }, [activeAssessment?._id, submitting, submissionResult]);

// // //     useEffect(() => {
// // //         return () => {
// // //             if (warningTimeoutRef.current) {
// // //                 window.clearTimeout(warningTimeoutRef.current);
// // //             }
// // //         };
// // //     }, []);

// // //     const openAssessment = (assessment) => {
// // //         setError("");
// // //         setSubmissionResult(null);
// // //         setActiveAssessment(assessment);
// // //         setCurrentQuestionIndex(0);
// // //         setAnswers({});
// // //         setSubmitting(false);
// // //         setViolationLog([]);
// // //         setActiveWarning(null);
// // //         lastViolationAtRef.current = 0;
// // //         requestExamFullscreen();
// // //     };

// // //     const closeAssessment = () => {
// // //         if (submitting) return;
// // //         setActiveAssessment(null);
// // //         setCurrentQuestionIndex(0);
// // //         setAnswers({});
// // //         setSubmitting(false);
// // //         setSubmissionResult(null);
// // //         setError("");
// // //         setTimeLeft(null);
// // //         setActiveWarning(null);
// // //         exitExamFullscreen();
// // //     };

// // //     const handleSelectOption = (questionIndex, optionIndex) => {
// // //         setAnswers((prev) => ({
// // //             ...prev,
// // //             [questionIndex]: optionIndex,
// // //         }));
// // //     };

// // //     const goToPrevious = () => {
// // //         setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
// // //     };

// // //     const goToNext = () => {
// // //         setCurrentQuestionIndex((prev) =>
// // //             Math.min(questionCount - 1, prev + 1)
// // //         );
// // //     };

// // //     const handleSubmit = async (forced = false, reason = "manual", logOverride = null) => {
// // //         if (!activeAssessment) return;

// // //         const questions = activeAssessment.questions || [];
// // //         const payloadAnswers = questions
// // //             .map((_, idx) => ({
// // //                 questionIndex: idx,
// // //                 selectedOptionIndex: answers[idx],
// // //             }))
// // //             .filter((item) => Number.isInteger(item.selectedOptionIndex));

// // //         if (!forced && payloadAnswers.length !== questions.length) {
// // //             const proceed = window.confirm(
// // //                 `You have answered ${payloadAnswers.length} of ${questions.length} questions. Submit anyway?`
// // //             );
// // //             if (!proceed) return;
// // //         }

// // //         try {
// // //             setSubmitting(true);
// // //             setError("");

// // //             const finalViolationLog = logOverride || violationLog;

// // //             // NOTE: submitAssessment's signature may need to be extended on the
// // //             // hook/API side to actually persist `reason` and `violations`.
// // //             // Passed here so the data is available as soon as the backend
// // //             // supports it; extra args are harmless if the hook ignores them.
// // //             const res = await submitAssessment(
// // //                 activeAssessment._id,
// // //                 payloadAnswers,
// // //                 token,
// // //                 { reason, violations: finalViolationLog }
// // //             );

// // //             setSubmissionResult({
// // //                 score: res?.data?.score ?? 0,
// // //                 totalMarks: res?.data?.totalMarks ?? 0,
// // //                 message:
// // //                     reason === "proctoring_violation"
// // //                         ? "Your assessment was auto-submitted after repeated attempts to leave the exam screen."
// // //                         : res?.message || "Assessment submitted successfully",
// // //             });
// // //             exitExamFullscreen();
// // //         } catch (err) {
// // //             const message =
// // //                 err?.message ||
// // //                 "Failed to submit assessment. Please try again.";
// // //             setError(message);
// // //         } finally {
// // //             setSubmitting(false);
// // //         }
// // //     };

// // //     const currentQuestion =
// // //         activeAssessment?.questions?.[currentQuestionIndex] || null;

// // //     if (!activeAssessment) {
// // //         return (
// // //             <div className="sa-page">
// // //                 <div className="sa-header">
// // //                         <h1 className="sa-title">Assessments</h1>
// // //                         <p className="sa-subtitle">
// // //                             Open assessments available for submission
// // //                         </p>
// // //                 </div>

// // //                 {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

// // //                 {publishedAssessments.length === 0 ? (
// // //                     <div className="sa-empty">
// // //                         <h3>No published assessments yet</h3>
// // //                         <p>When your trainer publishes an assessment, it will appear here.</p>
// // //                     </div>
// // //                 ) : (
// // //                     <div className="sa-grid">
// // //                         {publishedAssessments.map((assessment) => {
// // //                             const deadlinePassed =
// // //                                 assessment.deadline &&
// // //                                 new Date() > new Date(assessment.deadline);

// // //                             return (
// // //                                 <div key={assessment._id} className="sa-card">
// // //                                     <div className="sa-card-top">
// // //                                         <div>
// // //                                             <h3 className="sa-card-title">{assessment.title}</h3>
// // //                                             <p className="sa-card-meta">
// // //                                                 {assessment.questions?.length || 0} questions
// // //                                             </p>
// // //                                         </div>
// // //                                         <span
// // //                                             className={`sa-badge ${deadlinePassed ? "sa-badge-warn" : "sa-badge-ok"
// // //                                                 }`}
// // //                                         >
// // //                                             {deadlinePassed ? "Deadline passed" : "Open"}
// // //                                         </span>
// // //                                     </div>

// // //                                     <div className="sa-card-body">
// // //                                         <div className="sa-info-row">
// // //                                             <span>Duration</span>
// // //                                             <strong>
// // //                                                 {assessment.durationMinutes
// // //                                                     ? `${assessment.durationMinutes} min`
// // //                                                     : "No limit"}
// // //                                             </strong>
// // //                                         </div>

// // //                                         <div className="sa-info-row">
// // //                                             <span>Scheduled</span>
// // //                                             <strong>{formatDate(assessment.scheduledDate)}</strong>
// // //                                         </div>

// // //                                         <div className="sa-info-row">
// // //                                             <span>Deadline</span>
// // //                                             <strong>{formatDate(assessment.deadline)}</strong>
// // //                                         </div>

// // //                                         <div className="sa-info-row">
// // //                                             <span>Status</span>
// // //                                             <strong>{getAssessmentStatusLabel(assessment)}</strong>
// // //                                         </div>
// // //                                     </div>

// // //                                     <div className="sa-card-actions">
// // //                                         <button
// // //                                             type="button"
// // //                                             className="sa-btn sa-btn-primary"
// // //                                             onClick={() => openAssessment(assessment)}
// // //                                             disabled={deadlinePassed}
// // //                                         >
// // //                                             {deadlinePassed ? "Closed" : "Start assessment"}
// // //                                         </button>
// // //                                     </div>
// // //                                 </div>
// // //                             );
// // //                         })}
// // //                     </div>
// // //                 )}
// // //             </div>
// // //         );
// // //     }

// // //     if (submissionResult) {
// // //         return (
// // //             <div className="sa-page">
// // //                 <div className="sa-result">
// // //                     <div className="sa-result-icon">✓</div>
// // //                     <h1>Assessment submitted</h1>
// // //                     <p>{submissionResult.message}</p>

// // //                     <div className="sa-result-score">
// // //                         <div className="sa-score-value">
// // //                             {submissionResult.score} / {submissionResult.totalMarks}
// // //                         </div>
// // //                         <div className="sa-score-label">Your score</div>
// // //                     </div>

// // //                     <div className="sa-result-actions">
// // //                         <button
// // //                             type="button"
// // //                             className="sa-btn sa-btn-primary"
// // //                             onClick={closeAssessment}
// // //                         >
// // //                             Back to assessments
// // //                         </button>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         );
// // //     }

// // //     const progress =
// // //         questionCount > 0 ? ((currentQuestionIndex + 1) / questionCount) * 100 : 0;

// // //     return (
// // //         <div className="sa-page">
// // //             <div className="sa-exam-shell">
// // //                 {activeWarning ? (
// // //                     <div className="sa-alert sa-alert-warning sa-proctor-warning">
// // //                         <strong>
// // //                             Warning {activeWarning.count}/{MAX_VIOLATIONS}:
// // //                         </strong>{" "}
// // //                         {violationLabel(activeWarning.type)}. Your assessment will be
// // //                         auto-submitted if this happens{" "}
// // //                         {Math.max(0, MAX_VIOLATIONS - activeWarning.count)} more time
// // //                         {MAX_VIOLATIONS - activeWarning.count === 1 ? "" : "s"}.
// // //                     </div>
// // //                 ) : null}

// // //                 <div className="sa-exam-header">
// // //                     <div>
// // //                         <button
// // //                             type="button"
// // //                             className="sa-back"
// // //                             onClick={closeAssessment}
// // //                             disabled={submitting}
// // //                         >
// // //                             ← Back
// // //                         </button>
// // //                         <h1 className="sa-title">{activeAssessment.title}</h1>
// // //                         <p className="sa-subtitle">
// // //                             Question {currentQuestionIndex + 1} of {questionCount}
// // //                         </p>
// // //                     </div>

// // //                     <div className="sa-header-stats">
// // //                         <div className="sa-stat">
// // //                             <span>Answered</span>
// // //                             <strong>
// // //                                 {answeredCount}/{questionCount}
// // //                             </strong>
// // //                         </div>

// // //                         <div className="sa-stat">
// // //                             <span>Remaining</span>
// // //                             <strong>{unansweredCount}</strong>
// // //                         </div>

// // //                         {activeAssessment.durationMinutes ? (
// // //                             <div className="sa-stat sa-stat-timer">
// // //                                 <span>Time left</span>
// // //                                 <strong>{formatTimeLeft(timeLeft)}</strong>
// // //                             </div>
// // //                         ) : null}

// // //                         <div className="sa-stat sa-stat-proctor">
// // //                             <span>Violations</span>
// // //                             <strong>
// // //                                 {violationLog.length}/{MAX_VIOLATIONS}
// // //                             </strong>
// // //                         </div>
// // //                     </div>
// // //                 </div>

// // //                 <div className="sa-progress-wrap">
// // //                     <div className="sa-progress-bar">
// // //                         <div className="sa-progress-fill" style={{ width: `${progress}%` }} />
// // //                     </div>
// // //                 </div>

// // //                 {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

// // //                 <div className="sa-exam-grid">
// // //                     <div className="sa-question-panel">
// // //                         <div className="sa-question-head">
// // //                             <div className="sa-question-number">
// // //                                 Question {currentQuestionIndex + 1}
// // //                             </div>
// // //                             <div className="sa-question-marks">
// // //                                 {currentQuestion?.marks ?? 1} mark
// // //                                 {(currentQuestion?.marks ?? 1) !== 1 ? "s" : ""}
// // //                             </div>
// // //                         </div>

// // //                         <h2 className="sa-question-text">
// // //                             {currentQuestion?.questionText || "No question available"}
// // //                         </h2>

// // //                         <div className="sa-options">
// // //                             {(currentQuestion?.options || []).map((option, optionIndex) => {
// // //                                 const selected = answers[currentQuestionIndex] === optionIndex;

// // //                                 return (
// // //                                     <button
// // //                                         key={`${currentQuestionIndex}-${optionIndex}`}
// // //                                         type="button"
// // //                                         className={`sa-option ${selected ? "sa-option-selected" : ""}`}
// // //                                         onClick={() =>
// // //                                             handleSelectOption(currentQuestionIndex, optionIndex)
// // //                                         }
// // //                                         disabled={submitting}
// // //                                     >
// // //                                         <span className="sa-option-key">
// // //                                             {String.fromCharCode(65 + optionIndex)}
// // //                                         </span>
// // //                                         <span className="sa-option-text">{option}</span>
// // //                                     </button>
// // //                                 );
// // //                             })}
// // //                         </div>

// // //                         <div className="sa-nav">
// // //                             <button
// // //                                 type="button"
// // //                                 className="sa-btn sa-btn-secondary"
// // //                                 onClick={goToPrevious}
// // //                                 disabled={currentQuestionIndex === 0 || submitting}
// // //                             >
// // //                                 Previous
// // //                             </button>

// // //                             <button
// // //                                 type="button"
// // //                                 className="sa-btn sa-btn-secondary"
// // //                                 onClick={goToNext}
// // //                                 disabled={currentQuestionIndex === questionCount - 1 || submitting}
// // //                             >
// // //                                 Next
// // //                             </button>

// // //                             <button
// // //                                 type="button"
// // //                                 className="sa-btn sa-btn-primary"
// // //                                 onClick={() => handleSubmit(false, "manual")}
// // //                                 disabled={submitting}
// // //                             >
// // //                                 {submitting ? "Submitting..." : "Submit assessment"}
// // //                             </button>
// // //                         </div>
// // //                     </div>

// // //                     <div className="sa-side-panel">
// // //                         <div className="sa-side-card">
// // //                             <h3>Assessment details</h3>
// // //                             <div className="sa-info-row">
// // //                                 <span>Total questions</span>
// // //                                 <strong>{questionCount}</strong>
// // //                             </div>
// // //                             <div className="sa-info-row">
// // //                                 <span>Duration</span>
// // //                                 <strong>
// // //                                     {activeAssessment.durationMinutes
// // //                                         ? `${activeAssessment.durationMinutes} min`
// // //                                         : "No limit"}
// // //                                 </strong>
// // //                             </div>
// // //                             <div className="sa-info-row">
// // //                                 <span>Deadline</span>
// // //                                 <strong>{formatDate(activeAssessment.deadline)}</strong>
// // //                             </div>
// // //                             <div className="sa-info-row">
// // //                                 <span>Scheduled</span>
// // //                                 <strong>{formatDate(activeAssessment.scheduledDate)}</strong>
// // //                             </div>
// // //                         </div>

// // //                         <div className="sa-side-card">
// // //                             <h3>Question navigator</h3>
// // //                             <div className="sa-nav-grid">
// // //                                 {activeAssessment.questions?.map((_, index) => {
// // //                                     const answered = answers[index] !== undefined;
// // //                                     const active = index === currentQuestionIndex;

// // //                                     return (
// // //                                         <button
// // //                                             key={index}
// // //                                             type="button"
// // //                                             className={`sa-qdot ${answered ? "sa-qdot-answered" : ""
// // //                                                 } ${active ? "sa-qdot-active" : ""}`}
// // //                                             onClick={() => setCurrentQuestionIndex(index)}
// // //                                             disabled={submitting}
// // //                                             aria-label={`Go to question ${index + 1}`}
// // //                                         >
// // //                                             {index + 1}
// // //                                         </button>
// // //                                     );
// // //                                 })}
// // //                             </div>
// // //                         </div>

// // //                         <div className="sa-side-card sa-side-note">
// // //                             <h3>Submission rules</h3>
// // //                             <p>
// // //                                 Your assessment is graded automatically after submission. You can
// // //                                 submit even if some questions are unanswered, but they will count
// // //                                 as incorrect.
// // //                             </p>
// // //                             <p>
// // //                                 Leaving this screen (switching tabs, minimizing, or exiting
// // //                                 fullscreen) is logged. After {MAX_VIOLATIONS} such attempts your
// // //                                 assessment is auto-submitted.
// // //                             </p>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // }












// // // // import React, { useEffect, useMemo, useState } from "react";

// // // // // Adjust this import path to your project structure
// // // // // import { submitAssessment } from "../../../api/assessments";
// // // // import { useStu } from "../../../hooks/useStu";


// // // // import './StudentAssessment.css'




// // // // function formatDate(value) {
// // // //     if (!value) return "—";
// // // //     const date = new Date(value);
// // // //     if (Number.isNaN(date.getTime())) return "—";
// // // //     return date.toLocaleString("en-IN", {
// // // //         dateStyle: "medium",
// // // //         timeStyle: "short",
// // // //     });
// // // // }

// // // // function formatTimeLeft(seconds) {
// // // //     if (seconds === null || seconds === undefined) return "";
// // // //     const safe = Math.max(0, Math.floor(seconds));
// // // //     const hrs = Math.floor(safe / 3600);
// // // //     const mins = Math.floor((safe % 3600) / 60);
// // // //     const secs = safe % 60;
// // // //     return [hrs, mins, secs]
// // // //         .map((v, i) => (i === 0 ? String(v) : String(v).padStart(2, "0")))
// // // //         .join(":");
// // // // }

// // // // function getAssessmentStatusLabel(assessment) {
// // // //     if (!assessment) return "";
// // // //     if (assessment.status === "published") return "Open";
// // // //     if (assessment.status === "closed") return "Closed";
// // // //     return "Draft";
// // // // }

// // // // export default function StudentAssessment({ token }) {

// // // //     const { 
// // // //         myPerformance ,
// // // //         AllAssessments,
// // // //         submitAssessment

// // // //     } = useStu(token);

// // // //     const publishedAssessments = useMemo(() => {
// // // //         const list = Array.isArray(AllAssessments) ? AllAssessments : [];
// // // //         return list.filter((item) => item?.status === "published");
// // // //     }, [AllAssessments]);

// // // //     const [activeAssessment, setActiveAssessment] = useState(null);
// // // //     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// // // //     const [answers, setAnswers] = useState({});
// // // //     const [submitting, setSubmitting] = useState(false);
// // // //     const [submissionResult, setSubmissionResult] = useState(null);
// // // //     const [error, setError] = useState("");
// // // //     const [timeLeft, setTimeLeft] = useState(null);

// // // //     const questionCount = activeAssessment?.questions?.length || 0;
// // // //     const answeredCount = Object.keys(answers).length;
// // // //     const unansweredCount = Math.max(0, questionCount - answeredCount);

// // // //     useEffect(() => {
// // // //         if (!activeAssessment?.durationMinutes) {
// // // //             setTimeLeft(null);
// // // //             return;
// // // //         }

// // // //         setTimeLeft(Math.max(0, Number(activeAssessment.durationMinutes) * 60));
// // // //     }, [activeAssessment?._id]);

// // // //     useEffect(() => {
// // // //         if (!activeAssessment || submitting || submissionResult) return;
// // // //         if (timeLeft === null) return;
// // // //         if (timeLeft <= 0) return;

// // // //         const timer = window.setInterval(() => {
// // // //             setTimeLeft((prev) => {
// // // //                 if (prev === null) return prev;
// // // //                 if (prev <= 1) {
// // // //                     window.clearInterval(timer);
// // // //                     return 0;
// // // //                 }
// // // //                 return prev - 1;
// // // //             });
// // // //         }, 1000);

// // // //         return () => window.clearInterval(timer);
// // // //     }, [activeAssessment, timeLeft, submitting, submissionResult]);

// // // //     useEffect(() => {
// // // //         if (!activeAssessment || !activeAssessment.durationMinutes) return;
// // // //         if (timeLeft !== 0) return;
// // // //         if (submitting || submissionResult) return;
// // // //         void handleSubmit(true);
// // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //     }, [timeLeft]);

// // // //     const openAssessment = (assessment) => {
// // // //         setError("");
// // // //         setSubmissionResult(null);
// // // //         setActiveAssessment(assessment);
// // // //         setCurrentQuestionIndex(0);
// // // //         setAnswers({});
// // // //         setSubmitting(false);
// // // //     };

// // // //     const closeAssessment = () => {
// // // //         if (submitting) return;
// // // //         setActiveAssessment(null);
// // // //         setCurrentQuestionIndex(0);
// // // //         setAnswers({});
// // // //         setSubmitting(false);
// // // //         setSubmissionResult(null);
// // // //         setError("");
// // // //         setTimeLeft(null);
// // // //     };

// // // //     const handleSelectOption = (questionIndex, optionIndex) => {
// // // //         setAnswers((prev) => ({
// // // //             ...prev,
// // // //             [questionIndex]: optionIndex,
// // // //         }));
// // // //     };

// // // //     const goToPrevious = () => {
// // // //         setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
// // // //     };

// // // //     const goToNext = () => {
// // // //         setCurrentQuestionIndex((prev) =>
// // // //             Math.min(questionCount - 1, prev + 1)
// // // //         );
// // // //     };

// // // //     const handleSubmit = async (forced = false) => {
// // // //         if (!activeAssessment) return;

// // // //         const questions = activeAssessment.questions || [];
// // // //         const payloadAnswers = questions
// // // //             .map((_, idx) => ({
// // // //                 questionIndex: idx,
// // // //                 selectedOptionIndex: answers[idx],
// // // //             }))
// // // //             .filter((item) => Number.isInteger(item.selectedOptionIndex));

// // // //         if (!forced && payloadAnswers.length !== questions.length) {
// // // //             const proceed = window.confirm(
// // // //                 `You have answered ${payloadAnswers.length} of ${questions.length} questions. Submit anyway?`
// // // //             );
// // // //             if (!proceed) return;
// // // //         }

// // // //         try {
// // // //             setSubmitting(true);
// // // //             setError("");

// // // //             const res = await submitAssessment(
// // // //                 activeAssessment._id,
// // // //                 payloadAnswers,
// // // //                 token
// // // //             );

// // // //             setSubmissionResult({
// // // //                 score: res?.data?.score ?? 0,
// // // //                 totalMarks: res?.data?.totalMarks ?? 0,
// // // //                 message: res?.message || "Assessment submitted successfully",
// // // //             });
// // // //         } catch (err) {
// // // //             const message =
// // // //                 err?.message ||
// // // //                 "Failed to submit assessment. Please try again.";
// // // //             setError(message);
// // // //         } finally {
// // // //             setSubmitting(false);
// // // //         }
// // // //     };

// // // //     const currentQuestion =
// // // //         activeAssessment?.questions?.[currentQuestionIndex] || null;

// // // //     if (!activeAssessment) {
// // // //         return (
// // // //             <div className="sa-page">
// // // //                 <div className="sa-header">
// // // //                         <h1 className="sa-title">Assessments</h1>
// // // //                         <p className="sa-subtitle">
// // // //                             Open assessments available for submission
// // // //                         </p>
// // // //                 </div>

// // // //                 {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

// // // //                 {publishedAssessments.length === 0 ? (
// // // //                     <div className="sa-empty">
// // // //                         <h3>No published assessments yet</h3>
// // // //                         <p>When your trainer publishes an assessment, it will appear here.</p>
// // // //                     </div>
// // // //                 ) : (
// // // //                     <div className="sa-grid">
// // // //                         {publishedAssessments.map((assessment) => {
// // // //                             const deadlinePassed =
// // // //                                 assessment.deadline &&
// // // //                                 new Date() > new Date(assessment.deadline);

// // // //                             return (
// // // //                                 <div key={assessment._id} className="sa-card">
// // // //                                     <div className="sa-card-top">
// // // //                                         <div>
// // // //                                             <h3 className="sa-card-title">{assessment.title}</h3>
// // // //                                             <p className="sa-card-meta">
// // // //                                                 {assessment.questions?.length || 0} questions
// // // //                                             </p>
// // // //                                         </div>
// // // //                                         <span
// // // //                                             className={`sa-badge ${deadlinePassed ? "sa-badge-warn" : "sa-badge-ok"
// // // //                                                 }`}
// // // //                                         >
// // // //                                             {deadlinePassed ? "Deadline passed" : "Open"}
// // // //                                         </span>
// // // //                                     </div>

// // // //                                     <div className="sa-card-body">
// // // //                                         <div className="sa-info-row">
// // // //                                             <span>Duration</span>
// // // //                                             <strong>
// // // //                                                 {assessment.durationMinutes
// // // //                                                     ? `${assessment.durationMinutes} min`
// // // //                                                     : "No limit"}
// // // //                                             </strong>
// // // //                                         </div>

// // // //                                         <div className="sa-info-row">
// // // //                                             <span>Scheduled</span>
// // // //                                             <strong>{formatDate(assessment.scheduledDate)}</strong>
// // // //                                         </div>

// // // //                                         <div className="sa-info-row">
// // // //                                             <span>Deadline</span>
// // // //                                             <strong>{formatDate(assessment.deadline)}</strong>
// // // //                                         </div>

// // // //                                         <div className="sa-info-row">
// // // //                                             <span>Status</span>
// // // //                                             <strong>{getAssessmentStatusLabel(assessment)}</strong>
// // // //                                         </div>
// // // //                                     </div>

// // // //                                     <div className="sa-card-actions">
// // // //                                         <button
// // // //                                             type="button"
// // // //                                             className="sa-btn sa-btn-primary"
// // // //                                             onClick={() => openAssessment(assessment)}
// // // //                                             disabled={deadlinePassed}
// // // //                                         >
// // // //                                             {deadlinePassed ? "Closed" : "Start assessment"}
// // // //                                         </button>
// // // //                                     </div>
// // // //                                 </div>
// // // //                             );
// // // //                         })}
// // // //                     </div>
// // // //                 )}
// // // //             </div>
// // // //         );
// // // //     }

// // // //     if (submissionResult) {
// // // //         return (
// // // //             <div className="sa-page">
// // // //                 <div className="sa-result">
// // // //                     <div className="sa-result-icon">✓</div>
// // // //                     <h1>Assessment submitted</h1>
// // // //                     <p>{submissionResult.message}</p>

// // // //                     <div className="sa-result-score">
// // // //                         <div className="sa-score-value">
// // // //                             {submissionResult.score} / {submissionResult.totalMarks}
// // // //                         </div>
// // // //                         <div className="sa-score-label">Your score</div>
// // // //                     </div>

// // // //                     <div className="sa-result-actions">
// // // //                         <button
// // // //                             type="button"
// // // //                             className="sa-btn sa-btn-primary"
// // // //                             onClick={closeAssessment}
// // // //                         >
// // // //                             Back to assessments
// // // //                         </button>
// // // //                     </div>
// // // //                 </div>
// // // //             </div>
// // // //         );
// // // //     }

// // // //     const progress =
// // // //         questionCount > 0 ? ((currentQuestionIndex + 1) / questionCount) * 100 : 0;

// // // //     return (
// // // //         <div className="sa-page">
// // // //             <div className="sa-exam-shell">
// // // //                 <div className="sa-exam-header">
// // // //                     <div>
// // // //                         <button
// // // //                             type="button"
// // // //                             className="sa-back"
// // // //                             onClick={closeAssessment}
// // // //                             disabled={submitting}
// // // //                         >
// // // //                             ← Back
// // // //                         </button>
// // // //                         <h1 className="sa-title">{activeAssessment.title}</h1>
// // // //                         <p className="sa-subtitle">
// // // //                             Question {currentQuestionIndex + 1} of {questionCount}
// // // //                         </p>
// // // //                     </div>

// // // //                     <div className="sa-header-stats">
// // // //                         <div className="sa-stat">
// // // //                             <span>Answered</span>
// // // //                             <strong>
// // // //                                 {answeredCount}/{questionCount}
// // // //                             </strong>
// // // //                         </div>

// // // //                         <div className="sa-stat">
// // // //                             <span>Remaining</span>
// // // //                             <strong>{unansweredCount}</strong>
// // // //                         </div>

// // // //                         {activeAssessment.durationMinutes ? (
// // // //                             <div className="sa-stat sa-stat-timer">
// // // //                                 <span>Time left</span>
// // // //                                 <strong>{formatTimeLeft(timeLeft)}</strong>
// // // //                             </div>
// // // //                         ) : null}
// // // //                     </div>
// // // //                 </div>

// // // //                 <div className="sa-progress-wrap">
// // // //                     <div className="sa-progress-bar">
// // // //                         <div className="sa-progress-fill" style={{ width: `${progress}%` }} />
// // // //                     </div>
// // // //                 </div>

// // // //                 {error ? <div className="sa-alert sa-alert-error">{error}</div> : null}

// // // //                 <div className="sa-exam-grid">
// // // //                     <div className="sa-question-panel">
// // // //                         <div className="sa-question-head">
// // // //                             <div className="sa-question-number">
// // // //                                 Question {currentQuestionIndex + 1}
// // // //                             </div>
// // // //                             <div className="sa-question-marks">
// // // //                                 {currentQuestion?.marks ?? 1} mark
// // // //                                 {(currentQuestion?.marks ?? 1) !== 1 ? "s" : ""}
// // // //                             </div>
// // // //                         </div>

// // // //                         <h2 className="sa-question-text">
// // // //                             {currentQuestion?.questionText || "No question available"}
// // // //                         </h2>

// // // //                         <div className="sa-options">
// // // //                             {(currentQuestion?.options || []).map((option, optionIndex) => {
// // // //                                 const selected = answers[currentQuestionIndex] === optionIndex;

// // // //                                 return (
// // // //                                     <button
// // // //                                         key={`${currentQuestionIndex}-${optionIndex}`}
// // // //                                         type="button"
// // // //                                         className={`sa-option ${selected ? "sa-option-selected" : ""}`}
// // // //                                         onClick={() =>
// // // //                                             handleSelectOption(currentQuestionIndex, optionIndex)
// // // //                                         }
// // // //                                         disabled={submitting}
// // // //                                     >
// // // //                                         <span className="sa-option-key">
// // // //                                             {String.fromCharCode(65 + optionIndex)}
// // // //                                         </span>
// // // //                                         <span className="sa-option-text">{option}</span>
// // // //                                     </button>
// // // //                                 );
// // // //                             })}
// // // //                         </div>

// // // //                         <div className="sa-nav">
// // // //                             <button
// // // //                                 type="button"
// // // //                                 className="sa-btn sa-btn-secondary"
// // // //                                 onClick={goToPrevious}
// // // //                                 disabled={currentQuestionIndex === 0 || submitting}
// // // //                             >
// // // //                                 Previous
// // // //                             </button>

// // // //                             <button
// // // //                                 type="button"
// // // //                                 className="sa-btn sa-btn-secondary"
// // // //                                 onClick={goToNext}
// // // //                                 disabled={currentQuestionIndex === questionCount - 1 || submitting}
// // // //                             >
// // // //                                 Next
// // // //                             </button>

// // // //                             <button
// // // //                                 type="button"
// // // //                                 className="sa-btn sa-btn-primary"
// // // //                                 onClick={() => handleSubmit(false)}
// // // //                                 disabled={submitting}
// // // //                             >
// // // //                                 {submitting ? "Submitting..." : "Submit assessment"}
// // // //                             </button>
// // // //                         </div>
// // // //                     </div>

// // // //                     <div className="sa-side-panel">
// // // //                         <div className="sa-side-card">
// // // //                             <h3>Assessment details</h3>
// // // //                             <div className="sa-info-row">
// // // //                                 <span>Total questions</span>
// // // //                                 <strong>{questionCount}</strong>
// // // //                             </div>
// // // //                             <div className="sa-info-row">
// // // //                                 <span>Duration</span>
// // // //                                 <strong>
// // // //                                     {activeAssessment.durationMinutes
// // // //                                         ? `${activeAssessment.durationMinutes} min`
// // // //                                         : "No limit"}
// // // //                                 </strong>
// // // //                             </div>
// // // //                             <div className="sa-info-row">
// // // //                                 <span>Deadline</span>
// // // //                                 <strong>{formatDate(activeAssessment.deadline)}</strong>
// // // //                             </div>
// // // //                             <div className="sa-info-row">
// // // //                                 <span>Scheduled</span>
// // // //                                 <strong>{formatDate(activeAssessment.scheduledDate)}</strong>
// // // //                             </div>
// // // //                         </div>

// // // //                         <div className="sa-side-card">
// // // //                             <h3>Question navigator</h3>
// // // //                             <div className="sa-nav-grid">
// // // //                                 {activeAssessment.questions?.map((_, index) => {
// // // //                                     const answered = answers[index] !== undefined;
// // // //                                     const active = index === currentQuestionIndex;

// // // //                                     return (
// // // //                                         <button
// // // //                                             key={index}
// // // //                                             type="button"
// // // //                                             className={`sa-qdot ${answered ? "sa-qdot-answered" : ""
// // // //                                                 } ${active ? "sa-qdot-active" : ""}`}
// // // //                                             onClick={() => setCurrentQuestionIndex(index)}
// // // //                                             disabled={submitting}
// // // //                                             aria-label={`Go to question ${index + 1}`}
// // // //                                         >
// // // //                                             {index + 1}
// // // //                                         </button>
// // // //                                     );
// // // //                                 })}
// // // //                             </div>
// // // //                         </div>

// // // //                         <div className="sa-side-card sa-side-note">
// // // //                             <h3>Submission rules</h3>
// // // //                             <p>
// // // //                                 Your assessment is graded automatically after submission. You can
// // // //                                 submit even if some questions are unanswered, but they will count
// // // //                                 as incorrect.
// // // //                             </p>
// // // //                         </div>
// // // //                     </div>
// // // //                 </div>
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // }