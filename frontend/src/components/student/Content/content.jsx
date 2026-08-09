
import { useMemo, useState } from "react";
import { useStu } from "../../../hooks/useStu";
import PDFPreviewModal from "./components/PDFPreviewModal";

import {
    BookOpen,
    CalendarDays,
    Clock3,
    ChevronDown,
    ChevronUp,
    File,
    FileText,
    Files,
    FolderOpen,
    PlayCircle,
    Eye,
    GraduationCap,
    Video,
    Link as LinkIcon,
} from "lucide-react";

import "./content.css";


/* ==========================================================================
   FILTERS
========================================================================== */

const STATUS_FILTERS = [
    "All",
    "Draft",
    "Published",
];

const FORMAT_FILTERS = [
    "All",
    "pdf",
    "video",
    "doc",
    "link",
    "live",
];

const SORT_OPTIONS = [
    {
        value: "newest",
        label: "Newest",
    },
    {
        value: "oldest",
        label: "Oldest",
    },
    {
        value: "deadline",
        label: "Deadline",
    },
];


/* ==========================================================================
   HELPERS
========================================================================== */

function formatDate(dateStr) {
    if (!dateStr) return "—";

    const d = new Date(dateStr);

    if (Number.isNaN(d.getTime())) {
        return "—";
    }

    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) {
        return "";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


function getFileKind(mimeType = "") {
    const type = mimeType.toLowerCase();

    if (type.includes("pdf")) {
        return {
            label: "PDF",
            icon: FileText,
        };
    }

    if (type.includes("video")) {
        return {
            label: "VIDEO",
            icon: Video,
        };
    }

    if (
        type.includes("word") ||
        type.includes("doc")
    ) {
        return {
            label: "DOC",
            icon: FileText,
        };
    }

    if (type.includes("image")) {
        return {
            label: "IMAGE",
            icon: File,
        };
    }

    return {
        label: "FILE",
        icon: File,
    };
}


function getFormatIcon(format = "") {
    switch (format.toLowerCase()) {
        case "pdf":
            return FileText;

        case "video":
            return Video;

        case "doc":
            return FileText;

        case "link":
            return LinkIcon;

        case "live":
            return PlayCircle;

        default:
            return File;
    }
}


/* ==========================================================================
   STATUS BADGE
========================================================================== */

function StatusBadge({ status }) {
    const map = {
        draft: {
            label: "Draft",
            cls: "badge-gray",
        },

        published: {
            label: "Published",
            cls: "badge-green",
        },

        active: {
            label: "Active",
            cls: "badge-blue",
        },

        archived: {
            label: "Archived",
            cls: "badge-orange",
        },
    };

    const entry =
        map[status] || {
            label: status || "Unknown",
            cls: "badge-gray",
        };

    return (
        <span className={`badge ${entry.cls}`}>
            <span className="badge-dot" />
            {entry.label}
        </span>
    );
}


/* ==========================================================================
   COMPONENT
========================================================================== */

export default function Content({ token }) {

    const {
        AllContentSkeletons = [],
        AllContents = [],
        previewContent,
    } = useStu(token);


    /* ======================================================================
       STATE
    ====================================================================== */

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [formatFilter, setFormatFilter] =
        useState("All");

    const [sortBy, setSortBy] =
        useState("newest");

    const [expandedId, setExpandedId] =
        useState(null);

    const [previewOpen, setPreviewOpen] =
        useState(false);

    const [previewBlobUrl, setPreviewBlobUrl] =
        useState(null);

    const [previewFileName, setPreviewFileName] =
        useState("");

    const [previewFile, setPreviewFile] =
        useState(null);

    const [previewLoadingId, setPreviewLoadingId] =
        useState(null);


    /* ======================================================================
       CONTENT HELPERS
    ====================================================================== */

    const getContentsForSkeleton = (skeletonId) => {
        return AllContents.filter(
            (content) =>
                content.skeletonId === skeletonId
        );
    };


    /* ======================================================================
       STATISTICS
    ====================================================================== */

    const stats = useMemo(() => {

        const totalSkeletons =
            AllContentSkeletons.length;

        const totalFiles =
            AllContents.length;

        const published =
            AllContentSkeletons.filter(
                (skeleton) =>
                    skeleton.status === "published"
            ).length;

        const pdfCount =
            AllContents.filter(
                (content) =>
                    (content.mimeType || "")
                        .toLowerCase()
                        .includes("pdf")
            ).length;

        const upcoming =
            AllContentSkeletons.filter(
                (skeleton) => {
                    if (
                        !skeleton.timeline
                            ?.scheduledDate
                    ) {
                        return false;
                    }

                    const date = new Date(
                        skeleton.timeline.scheduledDate
                    );

                    return date >= new Date();
                }
            ).length;

        const publishedPct =
            totalSkeletons
                ? Math.round(
                      (published /
                          totalSkeletons) *
                          100
                  )
                : 0;

        return {
            totalSkeletons,
            totalFiles,
            published,
            publishedPct,
            pdfCount,
            upcoming,
        };

    }, [
        AllContentSkeletons,
        AllContents,
    ]);


    /* ======================================================================
       FILTERING
    ====================================================================== */

    const filteredSkeletons = useMemo(() => {

        const term =
            searchTerm
                .trim()
                .toLowerCase();

        let rows =
            AllContentSkeletons.filter(
                (skeleton) => {

                    if (
                        statusFilter !== "All" &&
                        skeleton.status !==
                            statusFilter.toLowerCase()
                    ) {
                        return false;
                    }

                    if (
                        formatFilter !== "All" &&
                        skeleton.expectedFormat !==
                            formatFilter
                    ) {
                        return false;
                    }

                    if (!term) {
                        return true;
                    }

                    const contents =
                        getContentsForSkeleton(
                            skeleton._id
                        );

                    const haystack = [
                        skeleton.title,
                        skeleton.metadata?.topic,
                        skeleton.classNumber?.toString(),
                        skeleton.metadata?.description,
                        ...(skeleton.metadata?.tags ||
                            []),

                        ...contents.map(
                            (content) =>
                                content.fileName
                        ),
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return haystack.includes(term);
                }
            );


        rows = [...rows].sort(
            (a, b) => {

                if (
                    sortBy === "oldest"
                ) {
                    return (
                        new Date(
                            a.createdAt || 0
                        ) -
                        new Date(
                            b.createdAt || 0
                        )
                    );
                }

                if (
                    sortBy === "deadline"
                ) {
                    return (
                        new Date(
                            a.timeline?.deadline ||
                                0
                        ) -
                        new Date(
                            b.timeline?.deadline ||
                                0
                        )
                    );
                }

                return (
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
                );
            }
        );

        return rows;

    }, [
        AllContentSkeletons,
        AllContents,
        searchTerm,
        statusFilter,
        formatFilter,
        sortBy,
    ]);


    /* ======================================================================
       PREVIEW
    ====================================================================== */

    const handlePreviewFile = async (
        file
    ) => {

        try {

            setPreviewLoadingId(
                file._id
            );

            const blob =
                await previewContent(
                    file._id,
                    token
                );

            if (previewBlobUrl) {
                URL.revokeObjectURL(
                    previewBlobUrl
                );
            }

            const url =
                URL.createObjectURL(
                    blob
                );

            setPreviewBlobUrl(url);

            setPreviewFileName(
                file.fileName
            );

            setPreviewFile(file);

            setPreviewOpen(true);

        } catch (err) {

            alert(
                err.message ||
                    "Failed to preview file"
            );

        } finally {

            setPreviewLoadingId(null);
        }
    };


    /* ======================================================================
       CLOSE PREVIEW
    ====================================================================== */

    const closePreview = () => {

        if (previewBlobUrl) {
            URL.revokeObjectURL(
                previewBlobUrl
            );
        }

        setPreviewBlobUrl(null);
        setPreviewFileName("");
        setPreviewOpen(false);
        setPreviewFile(null);
    };


    /* ======================================================================
       TOGGLE CARD
    ====================================================================== */

    const toggleCard = (id) => {

        setExpandedId(
            expandedId === id
                ? null
                : id
        );
    };


    /* ======================================================================
       RENDER
    ====================================================================== */

    return (
        <div className="content-library">

            {/* ==============================================================
                HEADER
            ============================================================== */}

            <div className="cl-header">

                <div>

                    <h1>
                        Content Library
                    </h1>

                    <p className="cl-subtitle">
                        Explore your course resources,
                        learning material and uploaded
                        content.
                    </p>

                </div>

            </div>


            {/* ==============================================================
                STUDENT STATS
            ============================================================== */}

            <div className="cl-stats">

                <div className="content-stat-card">

                    <div className="student-stat-icon">
                        <BookOpen
                            size={18}
                            strokeWidth={1.8}
                        />
                    </div>

                    <span className="stat-label">
                        Learning Resources
                    </span>

                    <span className="stat-value">
                        {stats.totalSkeletons}
                    </span>

                    <span className="stat-foot">
                        Available in your library
                    </span>

                </div>


                <div className="content-stat-card">

                    <div className="student-stat-icon">
                        <Files
                            size={18}
                            strokeWidth={1.8}
                        />
                    </div>

                    <span className="stat-label">
                        Uploaded Files
                    </span>

                    <span className="stat-value">
                        {stats.totalFiles}
                    </span>

                    <span className="stat-foot">
                        {stats.pdfCount} PDF
                        {stats.pdfCount !== 1
                            ? "s"
                            : ""}
                    </span>

                </div>


                <div className="content-stat-card">

                    <div className="student-stat-icon">
                        <GraduationCap
                            size={18}
                            strokeWidth={1.8}
                        />
                    </div>

                    <span className="stat-label">
                        Published
                    </span>

                    <span className="stat-value">
                        {stats.published}
                    </span>

                    <span className="stat-foot">
                        {stats.publishedPct}% of
                        available resources
                    </span>

                </div>


                <div className="content-stat-card">

                    <div className="student-stat-icon">
                        <CalendarDays
                            size={18}
                            strokeWidth={1.8}
                        />
                    </div>

                    <span className="stat-label">
                        Upcoming
                    </span>

                    <span className="stat-value">
                        {stats.upcoming}
                    </span>

                    <span className="stat-foot">
                        Scheduled resources
                    </span>

                </div>

            </div>


            {/* ==============================================================
                TOOLBAR
            ============================================================== */}

            <div className="cl-toolbar">

                <input
                    className="cl-search"
                    type="text"
                    placeholder="Search title, topic, tags, class or file name"
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(
                            e.target.value
                        )
                    }
                />


                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >

                    {STATUS_FILTERS.map(
                        (status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status ===
                                "All"
                                    ? "All Statuses"
                                    : status}
                            </option>
                        )
                    )}

                </select>


                <select
                    value={formatFilter}
                    onChange={(e) =>
                        setFormatFilter(
                            e.target.value
                        )
                    }
                >

                    {FORMAT_FILTERS.map(
                        (format) => (
                            <option
                                key={format}
                                value={format}
                            >
                                {format ===
                                "All"
                                    ? "All Formats"
                                    : format.toUpperCase()}
                            </option>
                        )
                    )}

                </select>


                <select
                    value={sortBy}
                    onChange={(e) =>
                        setSortBy(
                            e.target.value
                        )
                    }
                >

                    {SORT_OPTIONS.map(
                        (option) => (
                            <option
                                key={
                                    option.value
                                }
                                value={
                                    option.value
                                }
                            >
                                {option.label}
                            </option>
                        )
                    )}

                </select>

            </div>


            {/* ==============================================================
                CONTENT CARDS
            ============================================================== */}

            <div className="cl-card-wrap">

                {filteredSkeletons.length ===
                0 ? (

                    <div className="cl-empty">

                        <div className="cl-empty-icon">

                            <FolderOpen
                                size={42}
                                strokeWidth={1.5}
                            />

                        </div>

                        <h3>
                            No learning content found
                        </h3>

                        <p>
                            Try changing your search
                            or filter settings.
                        </p>

                    </div>

                ) : (

                    <div className="cl-card-grid">

                        {filteredSkeletons.map(
                            (skeleton) => {

                                const contents =
                                    getContentsForSkeleton(
                                        skeleton._id
                                    );

                                const isExpanded =
                                    expandedId ===
                                    skeleton._id;

                                const FormatIcon =
                                    getFormatIcon(
                                        skeleton.expectedFormat
                                    );


                                return (
                                    <article
                                        key={
                                            skeleton._id
                                        }
                                        className={`content-skeleton-card student-skeleton-card ${
                                            isExpanded
                                                ? "is-expanded"
                                                : ""
                                        }`}
                                    >

                                        {/* ==================================================
                                            CARD HEADER
                                        =================================================== */}

                                        <div className="skeleton-card-header">

                                            {/* <pre>{JSON.stringify(AllContents, null, 2)}</pre>
                                            <pre>{JSON.stringify(skeleton, null, 2)}</pre> */}

                                            <div className="skeleton-card-class">

                                                <span className="class-label">
                                                    CLASS
                                                </span>

                                                <span className="class-number">
                                                    {
                                                        skeleton.classNumber
                                                    }
                                                </span>

                                            </div>


                                            <div className="skeleton-card-badges">

                                                <span className="format-badge student-format-badge">

                                                    <FormatIcon
                                                        size={
                                                            12
                                                        }
                                                        strokeWidth={
                                                            2
                                                        }
                                                    />

                                                    {(
                                                        skeleton.expectedFormat ||
                                                        "file"
                                                    ).toUpperCase()}

                                                </span>


                                                <StatusBadge
                                                    status={
                                                        skeleton.status
                                                    }
                                                />

                                            </div>

                                        </div>


                                        {/* ==================================================
                                            TITLE
                                        =================================================== */}

                                        <div className="skeleton-card-title-section">

                                            <h3>
                                                {
                                                    skeleton.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    skeleton.metadata
                                                        ?.topic ||
                                                    "Learning resource"
                                                }
                                            </p>

                                        </div>


                                        {/* ==================================================
                                            RESOURCE TYPE
                                        =================================================== */}

                                        <div className="student-resource-type">

                                            <div className="student-resource-icon">

                                                <BookOpen
                                                    size={
                                                        18
                                                    }
                                                    strokeWidth={
                                                        1.8
                                                    }
                                                />

                                            </div>


                                            <div>

                                                <span>
                                                    LEARNING
                                                    RESOURCE
                                                </span>

                                                <strong>
                                                    {
                                                        skeleton.title
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        {/* ==================================================
                                            META
                                        =================================================== */}

                                        <div className="skeleton-meta-grid">

                                            <div className="skeleton-meta-item">

                                                <CalendarDays
                                                    size={
                                                        16
                                                    }
                                                    strokeWidth={
                                                        1.8
                                                    }
                                                />

                                                <div>

                                                    <span>
                                                        Scheduled
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            skeleton
                                                                .timeline
                                                                ?.scheduledDate
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="skeleton-meta-item">

                                                <Clock3
                                                    size={
                                                        16
                                                    }
                                                    strokeWidth={
                                                        1.8
                                                    }
                                                />

                                                <div>

                                                    <span>
                                                        Deadline
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            skeleton
                                                                .timeline
                                                                ?.deadline
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ==================================================
                                            FILE SUMMARY
                                        =================================================== */}

                                        <div className="skeleton-file-summary">

                                            <div className="file-summary-left">

                                                <div className="file-summary-icon">

                                                    <Files
                                                        size={
                                                            18
                                                        }
                                                        strokeWidth={
                                                            1.8
                                                        }
                                                    />

                                                </div>


                                                <div>

                                                    <strong>
                                                        {
                                                            contents.length
                                                        }
                                                    </strong>

                                                    <span>
                                                        {contents.length ===
                                                        1
                                                            ? "learning file"
                                                            : "learning files"}
                                                    </span>

                                                </div>

                                            </div>


                                            {contents.length >
                                            0 ? (

                                                <span className="uploaded-badge">
                                                    Available
                                                </span>

                                            ) : (

                                                <span className="no-upload-badge">
                                                    Coming Soon
                                                </span>

                                            )}

                                        </div>


                                        {/* ==================================================
                                            CARD ACTIONS
                                        =================================================== */}

                                        <div className="skeleton-card-actions student-card-actions">

                                            <button
                                                className={`card-action-btn student-details-btn ${
                                                    isExpanded
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    toggleCard(
                                                        skeleton._id
                                                    )
                                                }
                                            >

                                                {isExpanded ? (
                                                    <ChevronUp
                                                        size={
                                                            16
                                                        }
                                                        strokeWidth={
                                                            1.9
                                                        }
                                                    />
                                                ) : (
                                                    <ChevronDown
                                                        size={
                                                            16
                                                        }
                                                        strokeWidth={
                                                            1.9
                                                        }
                                                    />
                                                )}

                                                <span>
                                                    {isExpanded
                                                        ? "Hide Details"
                                                        : "View Resources"}
                                                </span>

                                            </button>

                                        </div>


                                        {/* ==================================================
                                            EXPANDED CONTENT
                                        =================================================== */}

                                        {isExpanded && (

                                            <div className="skeleton-expanded">

                                                <div className="expanded-divider" />


                                                {/* ==========================================
                                                    DESCRIPTION / TAGS
                                                =========================================== */}

                                                <div className="expanded-details">

                                                    <div className="expanded-detail">

                                                        <span>
                                                            About this resource
                                                        </span>

                                                        <p>
                                                            {
                                                                skeleton
                                                                    .metadata
                                                                    ?.description ||
                                                                "No description is available for this resource."
                                                            }
                                                        </p>

                                                    </div>


                                                    <div className="expanded-detail">

                                                        <span>
                                                            Duration
                                                        </span>

                                                        <p>
                                                            {
                                                                skeleton
                                                                    .metadata
                                                                    ?.durationMinutes ||
                                                                0
                                                            }{" "}
                                                            minutes
                                                        </p>

                                                    </div>


                                                    <div className="expanded-detail">

                                                        <span>
                                                            Topics
                                                        </span>

                                                        <div className="tag-list">

                                                            {(
                                                                skeleton
                                                                    .metadata
                                                                    ?.tags ||
                                                                []
                                                            ).length >
                                                            0 ? (

                                                                skeleton.metadata.tags.map(
                                                                    (
                                                                        tag
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                tag
                                                                            }
                                                                            className="content-tag"
                                                                        >
                                                                            #
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>
                                                                    )
                                                                )

                                                            ) : (

                                                                <span className="muted-text">
                                                                    No topics
                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>


                                                {/* ==========================================
                                                    FILES
                                                =========================================== */}

                                                <div className="expanded-files">

                                                    <div className="expanded-section-header">

                                                        <div>

                                                            <h4>
                                                                Learning
                                                                Resources
                                                            </h4>

                                                            <span>
                                                                {
                                                                    contents.length
                                                                }{" "}
                                                                {contents.length ===
                                                                1
                                                                    ? "resource"
                                                                    : "resources"}
                                                            </span>

                                                        </div>

                                                    </div>


                                                    {contents.length ===
                                                    0 ? (

                                                        <div className="expanded-no-files">

                                                            <Files
                                                                size={
                                                                    28
                                                                }
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />

                                                            <div>

                                                                <strong>
                                                                    No files
                                                                    available
                                                                </strong>

                                                                <span>
                                                                    Resources
                                                                    will appear
                                                                    here when
                                                                    they are
                                                                    published.
                                                                </span>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <div className="expanded-file-list">

                                                            {contents.map(
                                                                (
                                                                    file
                                                                ) => {

                                                                    const kind =
                                                                        getFileKind(
                                                                            file.mimeType
                                                                        );

                                                                    const FileIcon =
                                                                        kind.icon;

                                                                    const isLoading =
                                                                        previewLoadingId ===
                                                                        file._id;


                                                                    return (
                                                                        <div
                                                                            className="expanded-file student-expanded-file"
                                                                            key={
                                                                                file._id
                                                                            }
                                                                        >

                                                                            <div className="expanded-file-icon">

                                                                                <FileIcon
                                                                                    size={
                                                                                        19
                                                                                    }
                                                                                    strokeWidth={
                                                                                        1.8
                                                                                    }
                                                                                />

                                                                            </div>


                                                                            <div className="expanded-file-info">

                                                                                <strong>
                                                                                    {
                                                                                        file.fileName
                                                                                    }
                                                                                </strong>

                                                                                <span>
                                                                                    {
                                                                                        kind.label
                                                                                    }

                                                                                    {" · "}

                                                                                    v
                                                                                    {
                                                                                        file.version
                                                                                    }

                                                                                    {" · "}

                                                                                    {formatFileSize(
                                                                                        file.fileSize
                                                                                    )}
                                                                                </span>

                                                                            </div>


                                                                            <StatusBadge
                                                                                status={
                                                                                    file.status
                                                                                }
                                                                            />


                                                                            <div className="expanded-file-actions">

                                                                                <button
                                                                                    className="student-preview-btn"
                                                                                    title="Preview resource"
                                                                                    disabled={
                                                                                        isLoading
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handlePreviewFile(
                                                                                            file
                                                                                        )
                                                                                    }
                                                                                >

                                                                                    {isLoading ? (

                                                                                        <span className="preview-spinner" />

                                                                                    ) : (

                                                                                        <Eye
                                                                                            size={
                                                                                                15
                                                                                            }
                                                                                            strokeWidth={
                                                                                                2
                                                                                            }
                                                                                        />

                                                                                    )}

                                                                                    <span>
                                                                                        {isLoading
                                                                                            ? "Opening..."
                                                                                            : "Preview"}
                                                                                    </span>

                                                                                </button>

                                                                            </div>

                                                                        </div>
                                                                    );
                                                                }
                                                            )}

                                                        </div>

                                                    )}

                                                </div>

                                            </div>

                                        )}

                                    </article>
                                );
                            }
                        )}

                    </div>

                )}

            </div>


            {/* ==============================================================
                PDF PREVIEW
            ============================================================== */}

            <PDFPreviewModal
                open={previewOpen}
                fileUrl={previewBlobUrl}
                fileName={previewFileName}
                onClose={closePreview}
                onDownload={undefined}
            />

        </div>
    );
}
   
