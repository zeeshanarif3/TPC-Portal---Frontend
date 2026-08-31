import { useMemo, useState } from "react";
import {
    CalendarDays,
    Check,
    Clock3,
    FileText,
    Layers,
    Upload,
} from "lucide-react";

import "./CSVAssessmentPreview.css";

export default function CSVAssessmentPreview({
    assessments = [],

    AllCourses = [],
    AllContentSkeletons = [],

    createAssessment,
    token,

    onBack,
}) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState("");

    const courseList = Array.isArray(AllCourses)
        ? AllCourses
        : AllCourses?.data || [];

    const skeletonList = Array.isArray(
        AllContentSkeletons
    )
        ? AllContentSkeletons
        : AllContentSkeletons?.data || [];

    const totalAssessments =
        assessments.length;

    const totalQuestions = useMemo(() => {
        return assessments.reduce(
            (total, assessment) =>
                total +
                (assessment.questions?.length || 0),
            0
        );
    }, [assessments]);

    const totalMarks = useMemo(() => {
        return assessments.reduce(
            (assessmentTotal, assessment) =>
                assessmentTotal +
                (assessment.questions || []).reduce(
                    (questionTotal, question) => {
                        const marks =
                            Number(question.marks);

                        return (
                            questionTotal +
                            (Number.isFinite(marks)
                                ? marks
                                : 0)
                        );
                    },
                    0
                ),
            0
        );
    }, [assessments]);

    function getCourseName(id) {
        return (
            courseList.find(
                (course) =>
                    course._id === id
            )?.courseCode ||
            courseList.find(
                (course) =>
                    course._id === id
            )?.title ||
            "Unknown Program"
        );
    }

    function getSkeletonName(id) {
        if (!id) {
            return "Not linked";
        }

        const skeleton =
            skeletonList.find(
                (item) =>
                    item._id === id
            );

        if (!skeleton) {
            return "Unknown Skeleton";
        }

        if (
            skeleton.classNumber !==
                undefined &&
            skeleton.title
        ) {
            return `Class ${skeleton.classNumber} — ${skeleton.title}`;
        }

        return (
            skeleton.title ||
            skeleton._id
        );
    }

    function formatDate(date) {
        if (!date) {
            return "Not set";
        }

        const parsed =
            new Date(date);

        if (isNaN(parsed.getTime())) {
            return "Invalid date";
        }

        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    function formatStatus(status) {
        if (!status) {
            return "Draft";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    }

    async function importAssessments() {
        if (!assessments.length) {
            setMessage(
                "No assessments available to import."
            );
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");
        setMessageType("");

        let successCount = 0;

        const failures = [];

        for (
            let i = 0;
            i < assessments.length;
            i++
        ) {
            const assessment =
                assessments[i];

            try {
                await createAssessment(
                    assessment,
                    token
                );

                successCount++;
            } catch (err) {
                failures.push(
                    `Assessment ${i + 1} (${assessment.title}): ${
                        err?.message ||
                        "Import failed"
                    }`
                );
            }
        }

        setLoading(false);

        if (failures.length === 0) {
            setMessage(
                `All ${successCount} assessment${
                    successCount !== 1
                        ? "s"
                        : ""
                } imported successfully`
            );

            setMessageType("success");
        } else {
            setMessage(
                `${successCount} imported, ${failures.length} failed — ${failures.join(
                    "; "
                )}`
            );

            setMessageType("error");
        }
    }

    return (
        <div className="csv-assessment-preview-page">
            <div className="csv-assessment-preview-shell">

                {/* HEADER */}

                <div className="csv-preview-header">

                    <button
                        type="button"
                        className="csv-preview-back"
                        onClick={onBack}
                    >
                        ← Back
                    </button>

                    <div className="csv-preview-header-copy">

                        <div className="csv-preview-kicker">
                            <FileText
                                size={16}
                            />
                            CSV Import
                        </div>

                        <h1>
                            Assessment Preview
                        </h1>

                        <p>
                            Review the assessments
                            and questions before
                            importing them.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="csv-preview-import-btn"
                        onClick={
                            importAssessments
                        }
                        disabled={loading}
                    >
                        <Upload
                            size={17}
                        />

                        {loading
                            ? "Importing..."
                            : "Import Assessments"}
                    </button>

                </div>


                {/* MESSAGE */}

                {message && (
                    <div
                        className={`csv-preview-message ${messageType}`}
                    >
                        {message}
                    </div>
                )}


                {/* OVERALL SUMMARY */}

                <div className="csv-overview-card">

                    <div className="csv-overview-item">
                        <FileText
                            size={18}
                        />

                        <div>
                            <span>
                                Assessments
                            </span>

                            <strong>
                                {
                                    totalAssessments
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="csv-overview-item">
                        <Layers
                            size={18}
                        />

                        <div>
                            <span>
                                Questions
                            </span>

                            <strong>
                                {
                                    totalQuestions
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="csv-overview-item">
                        <Check
                            size={18}
                        />

                        <div>
                            <span>
                                Total Marks
                            </span>

                            <strong>
                                {totalMarks}
                            </strong>
                        </div>
                    </div>

                </div>


                {/* ASSESSMENTS */}

                <div className="csv-assessments-list">

                    {assessments.map(
                        (
                            assessment,
                            assessmentIndex
                        ) => {

                            const questions =
                                assessment.questions ||
                                [];

                            const assessmentMarks =
                                questions.reduce(
                                    (
                                        total,
                                        question
                                    ) => {
                                        const marks =
                                            Number(
                                                question.marks
                                            );

                                        return (
                                            total +
                                            (Number.isFinite(
                                                marks
                                            )
                                                ? marks
                                                : 0)
                                        );
                                    },
                                    0
                                );

                            return (
                                <section
                                    className="csv-assessment-card"
                                    key={
                                        assessmentIndex
                                    }
                                >

                                    {/* ASSESSMENT HEADER */}

                                    <div className="csv-assessment-card-header">

                                        <div className="csv-assessment-number">
                                            {String(
                                                assessmentIndex +
                                                    1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </div>

                                        <div className="csv-assessment-title-wrap">

                                            <h2>
                                                {
                                                    assessment.title
                                                }
                                            </h2>

                                            <div className="csv-assessment-meta">

                                                <span>
                                                    Program:{" "}
                                                    <strong>
                                                        {getCourseName(
                                                            assessment.programId
                                                        )}
                                                    </strong>
                                                </span>

                                                <span>
                                                    Questions:{" "}
                                                    <strong>
                                                        {
                                                            questions.length
                                                        }
                                                    </strong>
                                                </span>

                                                <span>
                                                    Marks:{" "}
                                                    <strong>
                                                        {
                                                            assessmentMarks
                                                        }
                                                    </strong>
                                                </span>

                                            </div>

                                        </div>

                                        <span
                                            className={`csv-status csv-status-${assessment.status}`}
                                        >
                                            {formatStatus(
                                                assessment.status
                                            )}
                                        </span>

                                    </div>


                                    {/* ASSESSMENT DETAILS */}

                                    <div className="csv-assessment-details">

                                        <div className="csv-detail-item">

                                            <Clock3
                                                size={15}
                                            />

                                            <div>
                                                <span>
                                                    Duration
                                                </span>

                                                <strong>
                                                    {
                                                        assessment.durationMinutes
                                                    }{" "}
                                                    min
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="csv-detail-item">

                                            <CalendarDays
                                                size={15}
                                            />

                                            <div>
                                                <span>
                                                    Scheduled
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        assessment.scheduledDate
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="csv-detail-item">

                                            <CalendarDays
                                                size={15}
                                            />

                                            <div>
                                                <span>
                                                    Deadline
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        assessment.deadline
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="csv-detail-item">

                                            <Layers
                                                size={15}
                                            />

                                            <div>
                                                <span>
                                                    Content
                                                    Skeleton
                                                </span>

                                                <strong>
                                                    {getSkeletonName(
                                                        assessment.skeletonId
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>


                                    {/* QUESTIONS */}

                                    <div className="csv-questions-section">

                                        <div className="csv-questions-heading">

                                            <div>
                                                <h3>
                                                    Questions
                                                </h3>

                                                <p>
                                                    {
                                                        questions.length
                                                    }{" "}
                                                    question
                                                    {
                                                        questions.length !==
                                                        1
                                                            ? "s"
                                                            : ""
                                                    }
                                                </p>
                                            </div>

                                        </div>


                                        <div className="csv-question-list">

                                            {questions.map(
                                                (
                                                    question,
                                                    questionIndex
                                                ) => (
                                                    <div
                                                        className="csv-question-card"
                                                        key={
                                                            questionIndex
                                                        }
                                                    >

                                                        {/* QUESTION TOP */}

                                                        <div className="csv-question-top">

                                                            <div className="csv-question-number">
                                                                {String(
                                                                    questionIndex +
                                                                        1
                                                                ).padStart(
                                                                    2,
                                                                    "0"
                                                                )}
                                                            </div>

                                                            <div className="csv-question-text">
                                                                {
                                                                    question.questionText
                                                                }
                                                            </div>

                                                            <div className="csv-question-marks">
                                                                {
                                                                    question.marks
                                                                }{" "}
                                                                mark
                                                                {
                                                                    Number(
                                                                        question.marks
                                                                    ) !==
                                                                    1
                                                                        ? "s"
                                                                        : ""
                                                                }
                                                            </div>

                                                        </div>


                                                        {/* OPTIONS */}

                                                        <div className="csv-options-list">

                                                            {(
                                                                question.options ||
                                                                []
                                                            ).map(
                                                                (
                                                                    option,
                                                                    optionIndex
                                                                ) => {

                                                                    const isCorrect =
                                                                        optionIndex ===
                                                                        question.correctOptionIndex;

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                optionIndex
                                                                            }
                                                                            className={`csv-option ${
                                                                                isCorrect
                                                                                    ? "correct"
                                                                                    : ""
                                                                            }`}
                                                                        >

                                                                            <span className="csv-option-letter">
                                                                                {String.fromCharCode(
                                                                                    65 +
                                                                                        optionIndex
                                                                                )}
                                                                            </span>

                                                                            <span className="csv-option-text">
                                                                                {
                                                                                    option
                                                                                }
                                                                            </span>

                                                                            {isCorrect && (
                                                                                <span className="csv-correct-badge">

                                                                                    <Check
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                    />

                                                                                    Correct
                                                                                </span>
                                                                            )}

                                                                        </div>
                                                                    );
                                                                }
                                                            )}

                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                    </div>

                                </section>
                            );
                        }
                    )}

                </div>


                {/* BOTTOM ACTION */}

                <div className="csv-preview-footer">

                    <button
                        type="button"
                        className="csv-footer-back"
                        onClick={onBack}
                        disabled={loading}
                    >
                        ← Back
                    </button>

                    <div className="csv-footer-summary">
                        {
                            totalAssessments
                        }{" "}
                        assessment
                        {
                            totalAssessments !==
                            1
                                ? "s"
                                : ""
                        }{" "}
                        ·{" "}
                        {totalQuestions}{" "}
                        questions ·{" "}
                        {totalMarks} total
                        marks
                    </div>

                    <button
                        type="button"
                        className="csv-footer-import"
                        onClick={
                            importAssessments
                        }
                        disabled={loading}
                    >
                        <Upload
                            size={17}
                        />

                        {loading
                            ? "Importing..."
                            : "Import Assessments"}
                    </button>

                </div>

            </div>
        </div>
    );
}