import "./CSVAssessmentUpload.css";
import { useState } from "react";
import Papa from "papaparse";
import CSVAssessmentPreview from "./CSVAssessmentPreview";

export default function CSVAssessmentUpload({
    token,
    AllCourses = [],
    AllContentSkeletons = [],
    createAssessment,
    onBack,
}) {
    const [file, setFile] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const skeletonList = Array.isArray(AllContentSkeletons)
        ? AllContentSkeletons
        : AllContentSkeletons?.data || [];

    const courseList = Array.isArray(AllCourses)
        ? AllCourses
        : AllCourses?.data || [];

    function findCourse(value) {
        if (!value) return null;

        const cleanValue = String(value).trim().toLowerCase();

        return courseList.find((course) => {
            const courseCode = course.courseCode
                ? String(course.courseCode).trim().toLowerCase()
                : "";

            const title = course.title
                ? String(course.title).trim().toLowerCase()
                : "";

            const name = course.name
                ? String(course.name).trim().toLowerCase()
                : "";

            return (
                courseCode === cleanValue ||
                title === cleanValue ||
                name === cleanValue
            );
        });
    }

    function findSkeleton(value) {
        if (!value || !String(value).trim()) {
            return null;
        }

        const cleanValue = String(value).trim().toLowerCase();

        return skeletonList.find((skeleton) => {
            const id = skeleton._id
                ? String(skeleton._id).trim().toLowerCase()
                : "";

            const title = skeleton.title
                ? String(skeleton.title).trim().toLowerCase()
                : "";

            return (
                id === cleanValue ||
                title === cleanValue
            );
        });
    }

    function validateDate(dateStr, fieldName, rowNumber) {
        if (!dateStr || !String(dateStr).trim()) {
            return null;
        }

        const cleanDate = String(dateStr).trim();

        const parsed = new Date(cleanDate);

        if (isNaN(parsed.getTime())) {
            throw new Error(
                `Row ${rowNumber}: Invalid ${fieldName}`
            );
        }

        return parsed.toISOString().substring(0, 10);
    }

    function parseNumber(value, fallback = null) {
        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {
            return fallback;
        }

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }

    function handleFile(e) {
        const uploaded = e.target.files[0];

        if (!uploaded) return;

        if (!uploaded.name.toLowerCase().endsWith(".csv")) {
            setError("Please upload CSV file");
            setFile(null);
            return;
        }

        setFile(uploaded);
        setError("");
        setSuccess("");
    }

    function processCSV() {
        if (!file) {
            setError("Please select CSV file");
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,

            complete: (results) => {
                try {
                    const rows = results.data;

                    if (!rows || rows.length === 0) {
                        throw new Error("CSV file is empty");
                    }

                    const required = [
                        "title",
                        "programId",
                        "durationMinutes",
                        "scheduledDate",
                        "deadline",
                        "status",
                        "questionText",
                        "option1",
                        "option2",
                        "correctOptionIndex",
                        "marks",
                    ];

                    const csvColumns =
                        Object.keys(rows[0] || {});

                    const missing = required.filter(
                        (column) =>
                            !csvColumns.includes(column)
                    );

                    if (missing.length) {
                        throw new Error(
                            `Missing CSV columns: ${missing.join(", ")}`
                        );
                    }

                    /*
                     * Group rows by assessment title.
                     *
                     * Each CSV row represents one question.
                     */
                    const assessmentMap = new Map();

                    rows.forEach((row, index) => {
                        const rowNumber = index + 1;

                        const title =
                            String(row.title || "").trim();

                        if (!title) {
                            throw new Error(
                                `Row ${rowNumber}: Assessment title is required`
                            );
                        }

                        /*
                         * Resolve program/course
                         */
                        const course =
                            findCourse(row.programId);

                        if (!course) {
                            throw new Error(
                                `Row ${rowNumber}: Program/Course not found: "${row.programId}"`
                            );
                        }

                        /*
                         * Resolve skeleton.
                         *
                         * Empty skeletonId is allowed because
                         * backend accepts null.
                         */
                        let skeleton = null;

                        if (
                            row.skeletonId &&
                            String(row.skeletonId).trim()
                        ) {
                            skeleton =
                                findSkeleton(row.skeletonId);

                            if (!skeleton) {
                                throw new Error(
                                    `Row ${rowNumber}: Content Skeleton not found: "${row.skeletonId}"`
                                );
                            }
                        }

                        /*
                         * Dates
                         */
                        const scheduledDate =
                            validateDate(
                                row.scheduledDate,
                                "scheduledDate",
                                rowNumber
                            );

                        const deadline =
                            validateDate(
                                row.deadline,
                                "deadline",
                                rowNumber
                            );

                        if (
                            scheduledDate &&
                            deadline &&
                            new Date(scheduledDate) >
                                new Date(deadline)
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: scheduledDate cannot be after deadline`
                            );
                        }

                        /*
                         * Duration
                         */
                        const durationMinutes =
                            parseNumber(
                                row.durationMinutes,
                                30
                            );

                        if (
                            durationMinutes === null ||
                            durationMinutes <= 0
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: durationMinutes must be greater than 0`
                            );
                        }

                        /*
                         * Status
                         */
                        const status =
                            String(
                                row.status || "draft"
                            )
                                .trim()
                                .toLowerCase();

                        const allowedStatuses = [
                            "draft",
                            "published",
                            "closed",
                        ];

                        if (
                            !allowedStatuses.includes(status)
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: Invalid status "${status}". Use draft, published, or closed`
                            );
                        }

                        /*
                         * Question
                         */
                        const questionText =
                            String(
                                row.questionText || ""
                            ).trim();

                        if (!questionText) {
                            throw new Error(
                                `Row ${rowNumber}: questionText is required`
                            );
                        }

                        /*
                         * Options
                         *
                         * We support option1 -> option4.
                         *
                         * Empty options after option2 are ignored.
                         */
                        const rawOptions = [
                            row.option1,
                            row.option2,
                            row.option3,
                            row.option4,
                        ];

                        const options = rawOptions
                            .map((option) =>
                                String(option || "").trim()
                            )
                            .filter(
                                (option) => option !== ""
                            );

                        if (options.length < 2) {
                            throw new Error(
                                `Row ${rowNumber}: At least 2 options are required`
                            );
                        }

                        /*
                         * Correct answer
                         */
                        const correctOptionIndex =
                            parseNumber(
                                row.correctOptionIndex,
                                null
                            );

                        if (
                            correctOptionIndex === null ||
                            !Number.isInteger(
                                correctOptionIndex
                            )
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: correctOptionIndex must be an integer`
                            );
                        }

                        if (
                            correctOptionIndex < 0 ||
                            correctOptionIndex >=
                                options.length
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: correctOptionIndex is out of range`
                            );
                        }

                        /*
                         * Marks
                         */
                        const marks =
                            parseNumber(row.marks, null);

                        if (
                            marks === null ||
                            marks <= 0
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: marks must be greater than 0`
                            );
                        }

                        /*
                         * Use title + program as the grouping key.
                         *
                         * This prevents two assessments with the
                         * same title but different programs from
                         * being merged.
                         */
                        const groupKey = [
                            title.toLowerCase(),
                            course._id,
                        ].join("::");

                        if (
                            !assessmentMap.has(groupKey)
                        ) {
                            assessmentMap.set(
                                groupKey,
                                {
                                    title,

                                    programId:
                                        course._id,

                                    skeletonId:
                                        skeleton?._id ||
                                        null,

                                    durationMinutes,

                                    scheduledDate,

                                    deadline,

                                    status,

                                    questions: [],
                                }
                            );
                        }

                        const assessment =
                            assessmentMap.get(groupKey);

                        /*
                         * Ensure rows belonging to the same
                         * assessment do not silently have
                         * conflicting metadata.
                         */
                        if (
                            assessment.durationMinutes !==
                            durationMinutes
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: Duration does not match other rows for assessment "${title}"`
                            );
                        }

                        if (
                            assessment.scheduledDate !==
                            scheduledDate
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: scheduledDate does not match other rows for assessment "${title}"`
                            );
                        }

                        if (
                            assessment.deadline !==
                            deadline
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: deadline does not match other rows for assessment "${title}"`
                            );
                        }

                        if (
                            assessment.status !==
                            status
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: status does not match other rows for assessment "${title}"`
                            );
                        }

                        if (
                            assessment.skeletonId !==
                            (skeleton?._id || null)
                        ) {
                            throw new Error(
                                `Row ${rowNumber}: skeletonId does not match other rows for assessment "${title}"`
                            );
                        }

                        /*
                         * Add question.
                         */
                        assessment.questions.push({
                            questionText,

                            options,

                            correctOptionIndex,

                            marks,
                        });
                    });

                    const finalAssessments =
                        [...assessmentMap.values()];

                    if (
                        finalAssessments.length === 0
                    ) {
                        throw new Error(
                            "No valid assessments found"
                        );
                    }

                    /*
                     * Final safety validation.
                     */
                    finalAssessments.forEach(
                        (assessment, index) => {
                            if (
                                !assessment.questions.length
                            ) {
                                throw new Error(
                                    `Assessment ${index + 1} has no questions`
                                );
                            }
                        }
                    );

                    setAssessments(
                        finalAssessments
                    );

                    setSuccess(
                        `${finalAssessments.length} assessment${
                            finalAssessments.length > 1
                                ? "s"
                                : ""
                        } extracted`
                    );

                    setShowPreview(true);
                } catch (err) {
                    setError(
                        err?.message ||
                            "Failed to process CSV"
                    );

                    setSuccess("");
                }
            },

            error: (error) => {
                setError(
                    error?.message ||
                        "Failed to read CSV file"
                );

                setSuccess("");
            },
        });
    }

    if (showPreview) {
        return (
            <CSVAssessmentPreview
                assessments={assessments}
                AllCourses={courseList}
                AllContentSkeletons={skeletonList}
                createAssessment={createAssessment}
                token={token}
                onBack={() =>
                    setShowPreview(false)
                }
            />
        );
    }

    return (
        <div className="csv-assessment-upload-page">
            <button
                className="back-btn"
                onClick={onBack}
            >
                ← Back
            </button>

            <h2>
                Import Assessments From CSV
            </h2>

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            {success && (
                <div className="success">
                    {success}
                </div>
            )}

            <div className="upload-box">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFile}
                />

                <button
                    onClick={processCSV}
                >
                    Read CSV
                </button>
            </div>
        </div>
    );
}