import { useState, useMemo } from 'react';
import { useTrainer } from "../../../hooks/useTrainer";
import ContentManager from './components/newcontent';
import PDFPreviewModal from "./components/PDFPreviewModal";
import UpdateContentSkeleton from "./components/UpdateContentSkeleton";

import {
    Pencil,
    Upload,
    Trash2,
    LoaderCircle,
    FolderOpen,
    GraduationCap,
    CalendarDays,
    Clock3,
    Files,
    ChevronDown,
    ChevronUp,
    Eye,
    Download,
    FileText,
    Video,
    File,
} from "lucide-react";


import './content.css';

const STATUS_FILTERS = ['All', 'Draft', 'Published'];
const FORMAT_FILTERS = ['All', 'pdf', 'video', 'doc', 'link', 'live'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'deadline', label: 'Deadline' },
];

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKind(mimeType = '') {
    if (mimeType.includes('pdf')) return { label: 'PDF', icon: '📄' };
    if (mimeType.includes('video')) return { label: 'VIDEO', icon: '🎥' };
    if (mimeType.includes('word') || mimeType.includes('doc')) return { label: 'DOC', icon: '📝' };
    if (mimeType.includes('image')) return { label: 'IMAGE', icon: '🖼️' };
    return { label: 'FILE', icon: '📎' };
}

function StatusBadge({ status }) {
    const map = {
        draft: { label: 'Draft', cls: 'badge-gray' },
        published: { label: 'Published', cls: 'badge-green' },
        active: { label: 'Active', cls: 'badge-blue' },
        archived: { label: 'Archived', cls: 'badge-orange' },
    };
    const entry = map[status] || { label: status || 'Unknown', cls: 'badge-gray' };
    return <span className={`badge ${entry.cls}`}>● {entry.label}</span>;
}

export default function Content({ token }) {
    const {
        AllContentSkeletons = [],
        AllContents = [],
        ProgramStructure = [],
        AllCourses = [],
        createContentSkeleton,
        deleteContentSkeleton,
        updateContentSkeleton,
        createContent,
        deleteContent,
        previewContent,
        downloadContent,
    } = useTrainer(token);

    const [showManager, setShowManager] = useState(false);
    const [updateManager, setupdateManager] = useState(false);
    // const [updateskeletondat, setupdateskeletondat] = useState(null);
    const [managerMode, setManagerMode] = useState('skeleton'); // 'skeleton' | 'upload'
    const [activeSkeleton, setActiveSkeleton] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deletingFileId, setDeletingFileId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [formatFilter, setFormatFilter] = useState('All');
    const [programFilter, setProgramFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [expandedId, setExpandedId] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
    const [previewFileName, setPreviewFileName] = useState("");
    const [previewFile, setPreviewFile] = useState(null);

    const getProgramName = (programId) => {
        const program = AllCourses.find((c) => c._id === programId);
        return program?.courseCode || 'Unassigned';
    };

    const getCollegeName = (programId) => {
        const program = AllCourses.find((c) => c._id === programId);
        return program?.collegeId?.name || '';
    };

    const getContentsForSkeleton = (skeletonId) =>
        AllContents.filter((c) => c.skeletonId === skeletonId);

    const stats = useMemo(() => {
        const totalSkeletons = AllContentSkeletons.length;
        const totalFiles = AllContents.length;
        const published = AllContentSkeletons.filter((s) => s.status === 'published').length;
        const programIds = new Set(AllContentSkeletons.map((s) => s.programId).filter(Boolean));
        const pdfCount = AllContents.filter((c) => (c.mimeType || '').includes('pdf')).length;
        const publishedPct = totalSkeletons ? Math.round((published / totalSkeletons) * 100) : 0;

        return {
            totalSkeletons,
            totalFiles,
            published,
            publishedPct,
            programCount: programIds.size,
            pdfCount,
        };
    }, [AllContentSkeletons, AllContents]);

    const filteredSkeletons = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        let rows = AllContentSkeletons.filter((s) => {
            if (statusFilter !== 'All' && s.status !== statusFilter.toLowerCase()) return false;
            if (formatFilter !== 'All' && s.expectedFormat !== formatFilter) return false;
            if (programFilter !== 'All' && s.programId !== programFilter) return false;

            if (!term) return true;

            const contents = getContentsForSkeleton(s._id);
            const programName = getProgramName(s.programId).toLowerCase();
            const collegeName = getCollegeName(s.programId).toLowerCase();
            const haystack = [
                s.title,
                s.metadata?.topic,
                s.classNumber?.toString(),
                programName,
                collegeName,
                ...(s.metadata?.tags || []),
                ...contents.map((c) => c.fileName),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(term);
        });

        rows = [...rows].sort((a, b) => {
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'deadline')
                return new Date(a.timeline?.deadline || 0) - new Date(b.timeline?.deadline || 0);
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return rows;
    }, [AllContentSkeletons, AllContents, searchTerm, statusFilter, formatFilter, programFilter, sortBy]);

    const openNewSkeleton = () => {
        setActiveSkeleton(null);
        setManagerMode('skeleton');
        setShowManager(true);
    };

    const openUpload = (skeleton = null) => {
        setActiveSkeleton(skeleton);
        setManagerMode('upload');
        setShowManager(true);
    };

    const openUpdateSkeleton = (skeleton = null) => {
        setActiveSkeleton(skeleton);
        setupdateManager(true);
    };


    const closeManager = () => {
        setShowManager(false);
        setActiveSkeleton(null);
    };
    const closeUpdate = () => {
        setupdateManager(false);
        setActiveSkeleton(null);
    };

    const handleDelete = async (skeleton) => {
        const contentCount = getContentsForSkeleton(skeleton._id).length;
        const warning = contentCount > 0
            ? `Delete "${skeleton.title}" (Class ${skeleton.classNumber})? This skeleton has ${contentCount} uploaded file${contentCount > 1 ? 's' : ''} attached.`
            : `Delete "${skeleton.title}" (Class ${skeleton.classNumber})? This can't be undone.`;

        if (!window.confirm(warning)) return;

        setDeletingId(skeleton._id);

        try {
            await deleteContentSkeleton(skeleton._id, token);

            if (expandedId === skeleton._id) setExpandedId(null);
        } catch (err) {
            alert(err.message || 'Failed to delete content skeleton');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteFile = async (file) => {
        if (!window.confirm(`Delete "${file.fileName}"? This can't be undone.`)) return;

        setDeletingFileId(file._id);

        try {
            await deleteContent(file._id, token);
        } catch (err) {
            alert(err.message || 'Failed to delete content');
        } finally {
            setDeletingFileId(null);
        }
    };





    // const handlePreviewFile = async (file) => {
    // try {
    //     const blob = await previewContent(file._id, token);

    //     const url = window.URL.createObjectURL(blob);
    //     window.open(url, "_blank", "noopener,noreferrer");

    //     setTimeout(() => {
    //     window.URL.revokeObjectURL(url);
    //     }, 1000);
    // } catch (err) {
    //     alert(err.message || "Failed to preview content");
    // }
    // };

    // const handleDownloadFile = async (file) => {
    // try {
    //     const blob = await downloadContent(file._id, token);

    //     const url = window.URL.createObjectURL(blob);

    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.download = file.fileName;

    //     document.body.appendChild(link);
    //     link.click();
    //     link.remove();

    //     window.URL.revokeObjectURL(url);
    // } catch (err) {
    //     alert(err.message || "Failed to download content");
    // }
    // };


    const handlePreviewFile = async (file) => {
        try {
            const blob = await previewContent(file._id, token);

            if (previewBlobUrl) {
                URL.revokeObjectURL(previewBlobUrl);
            }

            const url = URL.createObjectURL(blob);

            setPreviewBlobUrl(url);
            setPreviewFileName(file.fileName);
            setPreviewOpen(true);
            setPreviewFile(file);
        } catch (err) {
            alert(err.message || "Failed to preview file");
        }
    };
    const handleDownloadFile = async (file) => {
        try {
            const blob = await downloadContent(file._id, token);

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = file.fileName;

            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(url);

        } catch (err) {
            alert(err.message || "Failed to download file");
        }
    };




    const closePreview = () => {
        if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
        }

        setPreviewBlobUrl(null);
        setPreviewFileName("");
        setPreviewOpen(false);
        setPreviewFile(null)
    };
    if (showManager) {
        return (
            <ContentManager
                token={token}
                mode={managerMode}
                skeleton={activeSkeleton}
                skeletonId={activeSkeleton?._id}
                classNumber={activeSkeleton?.classNumber}
                onBack={closeManager}
                AllContentSkeletons={AllContentSkeletons}
                AllCourses={AllCourses}
                createContentSkeleton={createContentSkeleton}
                createContent={createContent}
            />
        );
    }
    if (updateManager) {
        return (
            <UpdateContentSkeleton
                token={token}

                skeleton={activeSkeleton}
                // skeletonId={activeSkeleton?._id}
                // classNumber={activeSkeleton?.classNumber}
                onBack={closeUpdate}
                // AllContentSkeletons={AllContentSkeletons}
                AllCourses={AllCourses}
                updateContentSkeleton={updateContentSkeleton}
            // createContent={createContent}
            />
        );
    }

    return (
        <div className="content-library">
            <div className="cl-header">
                <div>
                    <h1>Content Library</h1>
                    <p className="cl-subtitle">Manage content skeletons, uploaded files and program resources.</p>
                </div>
                <div className="cl-header-actions">
                    <button className="btn btn-secondary" onClick={openNewSkeleton}>+ New Skeleton</button>
                    <button className="btn btn-primary" onClick={() => openUpload(null)}>+ Upload Content</button>
                </div>
            </div>

            <div className="cl-stats">
                <div className="content-stat-card">
                    <span className="stat-label">Skeletons</span>
                    <span className="stat-value">{stats.totalSkeletons}</span>
                    <span className="stat-foot">Across {stats.programCount} programs</span>
                </div>
                <div className="content-stat-card">
                    <span className="stat-label">Uploaded Files</span>
                    <span className="stat-value">{stats.totalFiles}</span>
                    <span className="stat-foot">{stats.pdfCount} PDFs</span>
                </div>
                <div className="content-stat-card">
                    <span className="stat-label">Published</span>
                    <span className="stat-value">{stats.published}</span>
                    <span className="stat-foot">{stats.publishedPct}% of total</span>
                </div>
                <div className="content-stat-card">
                    <span className="stat-label">Programs</span>
                    <span className="stat-value">{stats.programCount}</span>
                    <span className="stat-foot">Active programs</span>
                </div>
            </div>

            <div className="cl-toolbar">
                <input
                    className="cl-search"
                    type="text"
                    placeholder="Search by title, topic, tags, class, program or file name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    {STATUS_FILTERS.map((s) => (
                        <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                    ))}
                </select>

                <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
                    {FORMAT_FILTERS.map((f) => (
                        <option key={f} value={f}>{f === 'All' ? 'All Formats' : f.toUpperCase()}</option>
                    ))}
                </select>

                <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
                    <option value="All">All Programs</option>
                    {AllCourses.map((p) => (
                        <option key={p._id} value={p._id}>{p.courseCode}</option>
                    ))}
                </select>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* <div className="cl-table-wrap">
                {filteredSkeletons.length === 0 ? (
                    <div className="cl-empty">
                        <div className="cl-empty-icon">📂</div>
                        <h3>No content has been created yet.</h3>
                        <p>Create your first content skeleton to begin.</p>
                        <button className="btn btn-primary" onClick={openNewSkeleton}>+ New Skeleton</button>
                    </div>
                ) : (
                    <table className="cl-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Class</th>
                                <th>Title</th>
                                <th>Topic</th>
                                <th>Program</th>
                                <th>Format</th>
                                <th>Status</th>
                                <th>Files</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSkeletons.map((skeleton) => {
                                const contents = getContentsForSkeleton(skeleton._id);
                                const isExpanded = expandedId === skeleton._id;

                                return (
                                    <>
                                        <tr
                                            key={skeleton._id}
                                            className={`cl-row ${isExpanded ? 'cl-row-expanded' : ''}`}
                                            onClick={() => setExpandedId(isExpanded ? null : skeleton._id)}
                                        >
                                            <td className="cl-caret">{isExpanded ? '▼' : '▶'}</td>
                                            <td>{skeleton.classNumber}</td>
                                            <td className="cl-title-cell">{skeleton.title}</td>
                                            <td>{skeleton.metadata?.topic || '—'}</td>
                                            <td className="cl-program-cell">
                                                <span className="cl-program-code">{getProgramName(skeleton.programId)}</span>
                                                <span className="cl-program-college">{getCollegeName(skeleton.programId)}</span>
                                            </td>
                                            <td className="cl-format">{skeleton.expectedFormat}</td>
                                            <td><StatusBadge status={skeleton.status} /></td>
                                            <td>
                                                {contents.length > 0 ? (
                                                    <span className="badge badge-blue">✔ {contents.length} File{contents.length > 1 ? 's' : ''}</span>
                                                ) : (
                                                    <span className="badge badge-gray">No Upload</span>
                                                )}
                                            </td>
                                            <td>{formatDate(skeleton.timeline?.deadline)}</td>

                                            <td
                                                className="cl-actions"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    className="icon-btn"
                                                    title="Edit Skeleton"
                                                    onClick={() => openUpdateSkeleton(skeleton)}
                                                >
                                                    <Pencil size={17} strokeWidth={2} />
                                                </button>

                                                <button
                                                    className="icon-btn"
                                                    title="Upload Content"
                                                    onClick={() => openUpload(skeleton)}
                                                >
                                                    <Upload size={17} strokeWidth={2} />
                                                </button>

                                                <button
                                                    className="icon-btn icon-btn-danger"
                                                    title="Delete Skeleton"
                                                    disabled={deletingId === skeleton._id}
                                                    onClick={() => handleDelete(skeleton)}
                                                >
                                                    {deletingId === skeleton._id ? (
                                                        <LoaderCircle
                                                            size={17}
                                                            strokeWidth={2}
                                                            className="spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={17} strokeWidth={2} />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr className="cl-expand-row" key={`${skeleton._id}-detail`}>
                                                <td colSpan={10}>
                                                    <div className="cl-expand-panel">
                                                        <div className="cl-expand-grid">
                                                            <div>
                                                                <span className="detail-label">Description</span>
                                                                <p>{skeleton.metadata?.description || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="detail-label">Duration</span>
                                                                <p>{skeleton.metadata?.durationMinutes || 0} min</p>
                                                            </div>
                                                            <div>
                                                                <span className="detail-label">Tags</span>
                                                                <p>
                                                                    {(skeleton.metadata?.tags || []).length
                                                                        ? skeleton.metadata.tags.map((t) => `#${t}`).join(' ')
                                                                        : '—'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="detail-label">Scheduled</span>
                                                                <p>{formatDate(skeleton.timeline?.scheduledDate)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="detail-label">Deadline</span>
                                                                <p>{formatDate(skeleton.timeline?.deadline)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="cl-files-section">
                                                            <span className="detail-label">Uploaded Files</span>
                                                            {contents.length === 0 ? (
                                                                <div className="cl-no-files">
                                                                    <span>No files uploaded</span>
                                                                    <button className="btn btn-sm btn-primary" onClick={() => openUpload(skeleton)}>
                                                                        Upload Content
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="cl-file-list">
                                                                    {contents.map((file) => {
                                                                        const kind = fileKind(file.mimeType);
                                                                        return (
                                                                            <div className="cl-file-item" key={file._id}>
                                                                                <span className="cl-file-icon">{kind.icon}</span>
                                                                                <div className="cl-file-meta">
                                                                                    <span className="cl-file-name">{file.fileName}</span>
                                                                                    <span className="cl-file-sub">
                                                                                        {kind.label} · v{file.version} · {formatFileSize(file.fileSize)} · Uploaded by {file.uploadedBy?.name || 'Unknown'}
                                                                                    </span>
                                                                                </div>
                                                                                {/* <StatusBadge status={file.status} />
                                                                                        <button
                                                                                        className="icon-btn icon-btn-danger"
                                                                                        title="Delete File"
                                                                                        disabled={deletingFileId === file._id}
                                                                                        onClick={() => handleDeleteFile(file)}
                                                                                        >{deletingFileId === file._id ? '…' : '🗑'}
                                                                                        </button> */}

            {/* <StatusBadge status={file.status} />

                                                                                <StatusBadge status={file.status} />

                                                                                <div className="cl-file-actions">

                                                                                    <button
                                                                                        className="icon-btn"
                                                                                        title="Preview"
                                                                                        onClick={() => handlePreviewFile(file)}
                                                                                    >
                                                                                        Preview
                                                                                    </button>

                                                                                    <button
                                                                                        className="icon-btn"
                                                                                        title="Download"
                                                                                        onClick={() => handleDownloadFile(file)}
                                                                                    >
                                                                                        ⬇
                                                                                    </button>

                                                                                    <button
                                                                                        className="icon-btn icon-btn-danger"
                                                                                        title="Delete File"
                                                                                        disabled={deletingFileId === file._id}
                                                                                        onClick={() => handleDeleteFile(file)}
                                                                                    >
                                                                                        {deletingFileId === file._id ? "…" : "🗑"}
                                                                                    </button>

                                                                                </div>


                                                                            </div>
                                                                        );
                                                                    })}
                                                                    <button className="btn btn-sm btn-secondary" onClick={() => openUpload(skeleton)}>
                                                                        + Upload another version
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <div className="cl-panel-footer">
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    disabled={deletingId === skeleton._id}
                                                                    onClick={() => handleDelete(skeleton)}
                                                                >
                                                                    {deletingId === skeleton._id ? 'Deleting…' : '🗑 Delete Skeleton'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div> */}














            <div className="cl-card-wrap">
                {filteredSkeletons.length === 0 ? (
                    <div className="cl-empty">
                        <div className="cl-empty-icon">
                            <FolderOpen size={42} strokeWidth={1.6} />
                        </div>

                        <h3>No content has been created yet.</h3>

                        <p>
                            Create your first content skeleton to begin.
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={openNewSkeleton}
                        >
                            + New Skeleton
                        </button>
                    </div>
                ) : (
                    <div className="cl-card-grid">
                        {filteredSkeletons.map((skeleton) => {
                            const contents = getContentsForSkeleton(skeleton._id);
                            const isExpanded = expandedId === skeleton._id;

                            return (
                                <article
                                    className={`content-skeleton-card ${isExpanded ? "is-expanded" : ""
                                        }`}
                                    key={skeleton._id}
                                >
                                    {/* =====================================================
                            CARD HEADER
                        ====================================================== */}
                                    <div className="skeleton-card-header">

                                        <div className="skeleton-card-class">
                                            <span className="class-label">
                                                CLASS
                                            </span>

                                            <span className="class-number">
                                                {skeleton.classNumber}
                                            </span>
                                        </div>

                                        <div className="skeleton-card-badges">
                                            <span className="format-badge">
                                                {skeleton.expectedFormat?.toUpperCase()}
                                            </span>

                                            <StatusBadge
                                                status={skeleton.status}
                                            />
                                        </div>
                                    </div>

                                    {/* =====================================================
                            TITLE
                        ====================================================== */}
                                    <div className="skeleton-card-title-section">

                                        <h3>
                                            {skeleton.title}
                                        </h3>

                                        <p>
                                            {skeleton.metadata?.topic ||
                                                "No topic specified"}
                                        </p>

                                    </div>

                                    {/* =====================================================
                            PROGRAM
                        ====================================================== */}
                                    <div className="skeleton-program">

                                        <div className="skeleton-info-icon">
                                            <GraduationCap
                                                size={18}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div className="skeleton-program-info">
                                            <span className="info-label">
                                                PROGRAM
                                            </span>

                                            <strong>
                                                {getProgramName(
                                                    skeleton.programId
                                                )}
                                            </strong>

                                            {getCollegeName(
                                                skeleton.programId
                                            ) && (
                                                    <small>
                                                        {getCollegeName(
                                                            skeleton.programId
                                                        )}
                                                    </small>
                                                )}
                                        </div>

                                    </div>

                                    {/* =====================================================
                            META INFORMATION
                        ====================================================== */}
                                    <div className="skeleton-meta-grid">

                                        <div className="skeleton-meta-item">

                                            <CalendarDays
                                                size={16}
                                                strokeWidth={1.8}
                                            />

                                            <div>
                                                <span>
                                                    Scheduled
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        skeleton.timeline
                                                            ?.scheduledDate
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="skeleton-meta-item">

                                            <Clock3
                                                size={16}
                                                strokeWidth={1.8}
                                            />

                                            <div>
                                                <span>
                                                    Deadline
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        skeleton.timeline
                                                            ?.deadline
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>

                                    {/* =====================================================
                            FILE SUMMARY
                        ====================================================== */}
                                    <div className="skeleton-file-summary">

                                        <div className="file-summary-left">

                                            <div className="file-summary-icon">
                                                <Files
                                                    size={18}
                                                    strokeWidth={1.8}
                                                />
                                            </div>

                                            <div>
                                                <strong>
                                                    {contents.length}
                                                </strong>

                                                <span>
                                                    {contents.length === 1
                                                        ? "uploaded file"
                                                        : "uploaded files"}
                                                </span>
                                            </div>

                                        </div>

                                        {contents.length === 0 ? (
                                            <span className="no-upload-badge">
                                                No Upload
                                            </span>
                                        ) : (
                                            <span className="uploaded-badge">
                                                Uploaded
                                            </span>
                                        )}

                                    </div>

                                    {/* =====================================================
                            ACTION BAR
                        ====================================================== */}
                                    <div className="skeleton-card-actions">

                                        <button
                                            className="card-action-btn"
                                            title="Edit Skeleton"
                                            onClick={() =>
                                                openUpdateSkeleton(skeleton)
                                            }
                                        >
                                            <Pencil
                                                size={16}
                                                strokeWidth={1.9}
                                            />

                                            <span>Edit</span>
                                        </button>

                                        <button
                                            className="card-action-btn"
                                            title="Upload Content"
                                            onClick={() =>
                                                openUpload(skeleton)
                                            }
                                        >
                                            <Upload
                                                size={16}
                                                strokeWidth={1.9}
                                            />

                                            <span>Upload</span>
                                        </button>

                                        <button
                                            className={`card-action-btn ${isExpanded
                                                    ? "active"
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                setExpandedId(
                                                    isExpanded
                                                        ? null
                                                        : skeleton._id
                                                )
                                            }
                                        >
                                            {isExpanded ? (
                                                <ChevronUp
                                                    size={16}
                                                    strokeWidth={1.9}
                                                />
                                            ) : (
                                                <ChevronDown
                                                    size={16}
                                                    strokeWidth={1.9}
                                                />
                                            )}

                                            <span>
                                                {isExpanded
                                                    ? "Collapse"
                                                    : "Details"}
                                            </span>
                                        </button>

                                        <button
                                            className="card-action-btn card-action-danger"
                                            title="Delete Skeleton"
                                            disabled={
                                                deletingId === skeleton._id
                                            }
                                            onClick={() =>
                                                handleDelete(skeleton)
                                            }
                                        >
                                            {deletingId === skeleton._id ? (
                                                <LoaderCircle
                                                    size={16}
                                                    className="spin"
                                                />
                                            ) : (
                                                <Trash2
                                                    size={16}
                                                    strokeWidth={1.9}
                                                />
                                            )}

                                            <span>Delete</span>
                                        </button>

                                    </div>

                                    {/* =====================================================
                            EXPANDED CONTENT
                        ====================================================== */}
                                    {isExpanded && (
                                        <div className="skeleton-expanded">

                                            <div className="expanded-divider" />

                                            {/* DETAILS */}
                                            <div className="expanded-details">

                                                <div className="expanded-detail">
                                                    <span>
                                                        Description
                                                    </span>

                                                    <p>
                                                        {skeleton.metadata
                                                            ?.description ||
                                                            "No description provided."}
                                                    </p>
                                                </div>

                                                <div className="expanded-detail">
                                                    <span>
                                                        Duration
                                                    </span>

                                                    <p>
                                                        {skeleton.metadata
                                                            ?.durationMinutes ||
                                                            0}{" "}
                                                        minutes
                                                    </p>
                                                </div>

                                                <div className="expanded-detail">
                                                    <span>
                                                        Tags
                                                    </span>

                                                    <div className="tag-list">
                                                        {(skeleton.metadata
                                                            ?.tags || []
                                                        ).length > 0 ? (
                                                            skeleton.metadata.tags.map(
                                                                (tag) => (
                                                                    <span
                                                                        key={tag}
                                                                        className="content-tag"
                                                                    >
                                                                        #{tag}
                                                                    </span>
                                                                )
                                                            )
                                                        ) : (
                                                            <span className="muted-text">
                                                                No tags
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>

                                            {/* FILES */}
                                            <div className="expanded-files">

                                                <div className="expanded-section-header">

                                                    <div>
                                                        <h4>
                                                            Uploaded Content
                                                        </h4>

                                                        <span>
                                                            {contents.length}{" "}
                                                            {contents.length === 1
                                                                ? "file"
                                                                : "files"}
                                                        </span>
                                                    </div>

                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() =>
                                                            openUpload(
                                                                skeleton
                                                            )
                                                        }
                                                    >
                                                        <Upload
                                                            size={14}
                                                        />

                                                        Upload
                                                    </button>

                                                </div>

                                                {contents.length === 0 ? (
                                                    <div className="expanded-no-files">

                                                        <Files
                                                            size={28}
                                                            strokeWidth={1.5}
                                                        />

                                                        <div>
                                                            <strong>
                                                                No files uploaded
                                                            </strong>

                                                            <span>
                                                                Upload the first
                                                                resource for this
                                                                skeleton.
                                                            </span>
                                                        </div>

                                                    </div>
                                                ) : (
                                                    <div className="expanded-file-list">

                                                        {contents.map((file) => {
                                                            const kind =
                                                                fileKind(
                                                                    file.mimeType
                                                                );

                                                            return (
                                                                <div
                                                                    className="expanded-file"
                                                                    key={file._id}
                                                                >

                                                                    <div className="expanded-file-icon">
                                                                        {kind.label ===
                                                                            "PDF" ? (
                                                                            <FileText
                                                                                size={
                                                                                    19
                                                                                }
                                                                            />
                                                                        ) : kind.label ===
                                                                            "VIDEO" ? (
                                                                            <Video
                                                                                size={
                                                                                    19
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <File
                                                                                size={
                                                                                    19
                                                                                }
                                                                            />
                                                                        )}
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
                                                                            }{" "}
                                                                            · v
                                                                            {
                                                                                file.version
                                                                            }{" "}
                                                                            ·{" "}
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
                                                                            className="icon-btn"
                                                                            title="Preview"
                                                                            onClick={() =>
                                                                                handlePreviewFile(
                                                                                    file
                                                                                )
                                                                            }
                                                                        >
                                                                            <Eye
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>

                                                                        <button
                                                                            className="icon-btn"
                                                                            title="Download"
                                                                            onClick={() =>
                                                                                handleDownloadFile(
                                                                                    file
                                                                                )
                                                                            }
                                                                        >
                                                                            <Download
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>

                                                                        <button
                                                                            className="icon-btn icon-btn-danger"
                                                                            title="Delete"
                                                                            disabled={
                                                                                deletingFileId ===
                                                                                file._id
                                                                            }
                                                                            onClick={() =>
                                                                                handleDeleteFile(
                                                                                    file
                                                                                )
                                                                            }
                                                                        >
                                                                            {deletingFileId ===
                                                                                file._id ? (
                                                                                <LoaderCircle
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                    className="spin"
                                                                                />
                                                                            ) : (
                                                                                <Trash2
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </button>

                                                                    </div>

                                                                </div>
                                                            );
                                                        })}

                                                    </div>
                                                )}

                                            </div>

                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>


            {/* <PDFPreviewModal
                open={previewOpen}
                fileUrl={previewBlobUrl}
                fileName={previewFileName}
                onClose={closePreview}
                onDownload={() => {
                    const file = AllContents.find(
                        (f) => f.fileName === previewFileName
                    );

                    if (file) {
                        handleDownloadFile(previewFile)
                    }
                }}
            /> */}
            <PDFPreviewModal
                open={previewOpen}
                fileUrl={previewBlobUrl}
                fileName={previewFileName}
                onClose={closePreview}
                onDownload={() => handleDownloadFile(previewFile)}
            />
        </div>
    );
}




























// import { useState, useMemo } from 'react';
// import { useDashboard } from "../../../hooks/useDashboard";
// import ContentManager from './components/newcontent';
// import PDFPreviewModal from "./components/PDFPreviewModal";
// import UpdateContentSkeleton from "./components/UpdateContentSkeleton";
// import {
//     Pencil,
//     Upload,
//     Trash2,
//     LoaderCircle,
// } from "lucide-react";

// import './content.css';

// const STATUS_FILTERS = ['All', 'Draft', 'Published'];
// const FORMAT_FILTERS = ['All', 'pdf', 'video', 'doc', 'link', 'live'];
// const SORT_OPTIONS = [
//     { value: 'newest', label: 'Newest' },
//     { value: 'oldest', label: 'Oldest' },
//     { value: 'deadline', label: 'Deadline' },
// ];

// function formatDate(dateStr) {
//     if (!dateStr) return '—';
//     const d = new Date(dateStr);
//     if (Number.isNaN(d.getTime())) return '—';
//     return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// }

// function formatFileSize(bytes) {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// function fileKind(mimeType = '') {
//     if (mimeType.includes('pdf')) return { label: 'PDF', icon: '📄' };
//     if (mimeType.includes('video')) return { label: 'VIDEO', icon: '🎥' };
//     if (mimeType.includes('word') || mimeType.includes('doc')) return { label: 'DOC', icon: '📝' };
//     if (mimeType.includes('image')) return { label: 'IMAGE', icon: '🖼️' };
//     return { label: 'FILE', icon: '📎' };
// }

// function StatusBadge({ status }) {
//     const map = {
//         draft: { label: 'Draft', cls: 'badge-gray' },
//         published: { label: 'Published', cls: 'badge-green' },
//         active: { label: 'Active', cls: 'badge-blue' },
//         archived: { label: 'Archived', cls: 'badge-orange' },
//     };
//     const entry = map[status] || { label: status || 'Unknown', cls: 'badge-gray' };
//     return <span className={`badge ${entry.cls}`}>● {entry.label}</span>;
// }

// export default function Content({ token }) {
//     const {
//         AllContentSkeletons = [],
//         AllContents = [],
//         ProgramStructure = [],
//         AllCourses = [],
//         createContentSkeleton,
//         deleteContentSkeleton,
//         updateContentSkeleton,
//         createContent,
//         deleteContent,
//         previewContent,
//         downloadContent,
//     } = useDashboard(token);

//     const [showManager, setShowManager] = useState(false);
//     const [updateManager, setupdateManager] = useState(false);
//     // const [updateskeletondat, setupdateskeletondat] = useState(null);
//     const [managerMode, setManagerMode] = useState('skeleton'); // 'skeleton' | 'upload'
//     const [activeSkeleton, setActiveSkeleton] = useState(null);
//     const [deletingId, setDeletingId] = useState(null);
//     const [deletingFileId, setDeletingFileId] = useState(null);

//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState('All');
//     const [formatFilter, setFormatFilter] = useState('All');
//     const [programFilter, setProgramFilter] = useState('All');
//     const [sortBy, setSortBy] = useState('newest');
//     const [expandedId, setExpandedId] = useState(null);
//     const [previewOpen, setPreviewOpen] = useState(false);
//     const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
//     const [previewFileName, setPreviewFileName] = useState("");
//     const [previewFile, setPreviewFile] = useState(null);

//     const getProgramName = (programId) => {
//         const program = AllCourses.find((c) => c._id === programId);
//         return program?.courseCode || 'Unassigned';
//     };

//     const getCollegeName = (programId) => {
//         const program = AllCourses.find((c) => c._id === programId);
//         return program?.collegeId?.name || '';
//     };

//     const getContentsForSkeleton = (skeletonId) =>
//         AllContents.filter((c) => c.skeletonId === skeletonId);

//     const stats = useMemo(() => {
//         const totalSkeletons = AllContentSkeletons.length;
//         const totalFiles = AllContents.length;
//         const published = AllContentSkeletons.filter((s) => s.status === 'published').length;
//         const programIds = new Set(AllContentSkeletons.map((s) => s.programId).filter(Boolean));
//         const pdfCount = AllContents.filter((c) => (c.mimeType || '').includes('pdf')).length;
//         const publishedPct = totalSkeletons ? Math.round((published / totalSkeletons) * 100) : 0;

//         return {
//             totalSkeletons,
//             totalFiles,
//             published,
//             publishedPct,
//             programCount: programIds.size,
//             pdfCount,
//         };
//     }, [AllContentSkeletons, AllContents]);

//     const filteredSkeletons = useMemo(() => {
//         const term = searchTerm.trim().toLowerCase();

//         let rows = AllContentSkeletons.filter((s) => {
//             if (statusFilter !== 'All' && s.status !== statusFilter.toLowerCase()) return false;
//             if (formatFilter !== 'All' && s.expectedFormat !== formatFilter) return false;
//             if (programFilter !== 'All' && s.programId !== programFilter) return false;

//             if (!term) return true;

//             const contents = getContentsForSkeleton(s._id);
//             const programName = getProgramName(s.programId).toLowerCase();
//             const collegeName = getCollegeName(s.programId).toLowerCase();
//             const haystack = [
//                 s.title,
//                 s.metadata?.topic,
//                 s.classNumber?.toString(),
//                 programName,
//                 collegeName,
//                 ...(s.metadata?.tags || []),
//                 ...contents.map((c) => c.fileName),
//             ]
//                 .filter(Boolean)
//                 .join(' ')
//                 .toLowerCase();

//             return haystack.includes(term);
//         });

//         rows = [...rows].sort((a, b) => {
//             if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
//             if (sortBy === 'deadline')
//                 return new Date(a.timeline?.deadline || 0) - new Date(b.timeline?.deadline || 0);
//             return new Date(b.createdAt) - new Date(a.createdAt);
//         });

//         return rows;
//     }, [AllContentSkeletons, AllContents, searchTerm, statusFilter, formatFilter, programFilter, sortBy]);

//     const openNewSkeleton = () => {
//         setActiveSkeleton(null);
//         setManagerMode('skeleton');
//         setShowManager(true);
//     };

//     const openUpload = (skeleton = null) => {
//         setActiveSkeleton(skeleton);
//         setManagerMode('upload');
//         setShowManager(true);
//     };

//     const openUpdateSkeleton = (skeleton = null) => {
//         setActiveSkeleton(skeleton);
//         setupdateManager(true);
//     };


//     const closeManager = () => {
//         setShowManager(false);
//         setActiveSkeleton(null);
//     };
//     const closeUpdate = () => {
//         setupdateManager(false);
//         setActiveSkeleton(null);
//     };

//     const handleDelete = async (skeleton) => {
//         const contentCount = getContentsForSkeleton(skeleton._id).length;
//         const warning = contentCount > 0
//             ? `Delete "${skeleton.title}" (Class ${skeleton.classNumber})? This skeleton has ${contentCount} uploaded file${contentCount > 1 ? 's' : ''} attached.`
//             : `Delete "${skeleton.title}" (Class ${skeleton.classNumber})? This can't be undone.`;

//         if (!window.confirm(warning)) return;

//         setDeletingId(skeleton._id);

//         try {
//             await deleteContentSkeleton(skeleton._id, token);

//             if (expandedId === skeleton._id) setExpandedId(null);
//         } catch (err) {
//             alert(err.message || 'Failed to delete content skeleton');
//         } finally {
//             setDeletingId(null);
//         }
//     };

//     const handleDeleteFile = async (file) => {
//         if (!window.confirm(`Delete "${file.fileName}"? This can't be undone.`)) return;

//         setDeletingFileId(file._id);

//         try {
//             await deleteContent(file._id, token);
//         } catch (err) {
//             alert(err.message || 'Failed to delete content');
//         } finally {
//             setDeletingFileId(null);
//         }
//     };





//     // const handlePreviewFile = async (file) => {
//     // try {
//     //     const blob = await previewContent(file._id, token);

//     //     const url = window.URL.createObjectURL(blob);
//     //     window.open(url, "_blank", "noopener,noreferrer");

//     //     setTimeout(() => {
//     //     window.URL.revokeObjectURL(url);
//     //     }, 1000);
//     // } catch (err) {
//     //     alert(err.message || "Failed to preview content");
//     // }
//     // };

//     // const handleDownloadFile = async (file) => {
//     // try {
//     //     const blob = await downloadContent(file._id, token);

//     //     const url = window.URL.createObjectURL(blob);

//     //     const link = document.createElement("a");
//     //     link.href = url;
//     //     link.download = file.fileName;

//     //     document.body.appendChild(link);
//     //     link.click();
//     //     link.remove();

//     //     window.URL.revokeObjectURL(url);
//     // } catch (err) {
//     //     alert(err.message || "Failed to download content");
//     // }
//     // };


//     const handlePreviewFile = async (file) => {
//         try {
//             const blob = await previewContent(file._id, token);

//             if (previewBlobUrl) {
//                 URL.revokeObjectURL(previewBlobUrl);
//             }

//             const url = URL.createObjectURL(blob);

//             setPreviewBlobUrl(url);
//             setPreviewFileName(file.fileName);
//             setPreviewOpen(true);
//             setPreviewFile(file);
//         } catch (err) {
//             alert(err.message || "Failed to preview file");
//         }
//     };
//     const handleDownloadFile = async (file) => {
//         try {
//             const blob = await downloadContent(file._id, token);

//             const url = URL.createObjectURL(blob);

//             const a = document.createElement("a");

//             a.href = url;
//             a.download = file.fileName;

//             document.body.appendChild(a);
//             a.click();
//             a.remove();

//             URL.revokeObjectURL(url);

//         } catch (err) {
//             alert(err.message || "Failed to download file");
//         }
//     };




//     const closePreview = () => {
//         if (previewBlobUrl) {
//             URL.revokeObjectURL(previewBlobUrl);
//         }

//         setPreviewBlobUrl(null);
//         setPreviewFileName("");
//         setPreviewOpen(false);
//         setPreviewFile(null)
//     };
//     if (showManager) {
//         return (
//             <ContentManager
//                 token={token}
//                 mode={managerMode}
//                 skeleton={activeSkeleton}
//                 skeletonId={activeSkeleton?._id}
//                 classNumber={activeSkeleton?.classNumber}
//                 onBack={closeManager}
//                 AllContentSkeletons={AllContentSkeletons}
//                 AllCourses={AllCourses}
//                 createContentSkeleton={createContentSkeleton}
//                 createContent={createContent}
//             />
//         );
//     }
//     if (updateManager) {
//         return (
//             <UpdateContentSkeleton
//                 token={token}

//                 skeleton={activeSkeleton}
//                 // skeletonId={activeSkeleton?._id}
//                 // classNumber={activeSkeleton?.classNumber}
//                 onBack={closeUpdate}
//                 // AllContentSkeletons={AllContentSkeletons}
//                 AllCourses={AllCourses}
//                 updateContentSkeleton={updateContentSkeleton}
//             // createContent={createContent}
//             />
//         );
//     }

//     return (
//         <div className="content-library">
//             <div className="cl-header">
//                 <div>
//                     <h1>Content Library</h1>
//                     <p className="cl-subtitle">Manage content skeletons, uploaded files and program resources.</p>
//                 </div>
//                 <div className="cl-header-actions">
//                     <button className="btn btn-secondary" onClick={openNewSkeleton}>+ New Skeleton</button>
//                     <button className="btn btn-primary" onClick={() => openUpload(null)}>+ Upload Content</button>
//                 </div>
//             </div>

//             <div className="cl-stats">
//                 <div className="content-stat-card">
//                     <span className="stat-label">Skeletons</span>
//                     <span className="stat-value">{stats.totalSkeletons}</span>
//                     <span className="stat-foot">Across {stats.programCount} programs</span>
//                 </div>
//                 <div className="content-stat-card">
//                     <span className="stat-label">Uploaded Files</span>
//                     <span className="stat-value">{stats.totalFiles}</span>
//                     <span className="stat-foot">{stats.pdfCount} PDFs</span>
//                 </div>
//                 <div className="content-stat-card">
//                     <span className="stat-label">Published</span>
//                     <span className="stat-value">{stats.published}</span>
//                     <span className="stat-foot">{stats.publishedPct}% of total</span>
//                 </div>
//                 <div className="content-stat-card">
//                     <span className="stat-label">Programs</span>
//                     <span className="stat-value">{stats.programCount}</span>
//                     <span className="stat-foot">Active programs</span>
//                 </div>
//             </div>

//             <div className="cl-toolbar">
//                 <input
//                     className="cl-search"
//                     type="text"
//                     placeholder="Search by title, topic, tags, class, program or file name"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />

//                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//                     {STATUS_FILTERS.map((s) => (
//                         <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
//                     ))}
//                 </select>

//                 <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
//                     {FORMAT_FILTERS.map((f) => (
//                         <option key={f} value={f}>{f === 'All' ? 'All Formats' : f.toUpperCase()}</option>
//                     ))}
//                 </select>

//                 <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
//                     <option value="All">All Programs</option>
//                     {AllCourses.map((p) => (
//                         <option key={p._id} value={p._id}>{p.courseCode}</option>
//                     ))}
//                 </select>

//                 <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
//                     {SORT_OPTIONS.map((o) => (
//                         <option key={o.value} value={o.value}>{o.label}</option>
//                     ))}
//                 </select>
//             </div>

//             <div className="cl-table-wrap">
//                 {filteredSkeletons.length === 0 ? (
//                     <div className="cl-empty">
//                         <div className="cl-empty-icon">📂</div>
//                         <h3>No content has been created yet.</h3>
//                         <p>Create your first content skeleton to begin.</p>
//                         <button className="btn btn-primary" onClick={openNewSkeleton}>+ New Skeleton</button>
//                     </div>
//                 ) : (
//                     <table className="cl-table">
//                         <thead>
//                             <tr>
//                                 <th></th>
//                                 <th>Class</th>
//                                 <th>Title</th>
//                                 <th>Topic</th>
//                                 <th>Program</th>
//                                 <th>Format</th>
//                                 <th>Status</th>
//                                 <th>Files</th>
//                                 <th>Deadline</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filteredSkeletons.map((skeleton) => {
//                                 const contents = getContentsForSkeleton(skeleton._id);
//                                 const isExpanded = expandedId === skeleton._id;

//                                 return (
//                                     <>
//                                         <tr
//                                             key={skeleton._id}
//                                             className={`cl-row ${isExpanded ? 'cl-row-expanded' : ''}`}
//                                             onClick={() => setExpandedId(isExpanded ? null : skeleton._id)}
//                                         >
//                                             <td className="cl-caret">{isExpanded ? '▼' : '▶'}</td>
//                                             <td>{skeleton.classNumber}</td>
//                                             <td className="cl-title-cell">{skeleton.title}</td>
//                                             <td>{skeleton.metadata?.topic || '—'}</td>
//                                             <td className="cl-program-cell">
//                                                 <span className="cl-program-code">{getProgramName(skeleton.programId)}</span>
//                                                 <span className="cl-program-college">{getCollegeName(skeleton.programId)}</span>
//                                             </td>
//                                             <td className="cl-format">{skeleton.expectedFormat}</td>
//                                             <td><StatusBadge status={skeleton.status} /></td>
//                                             <td>
//                                                 {contents.length > 0 ? (
//                                                     <span className="badge badge-blue">✔ {contents.length} File{contents.length > 1 ? 's' : ''}</span>
//                                                 ) : (
//                                                     <span className="badge badge-gray">No Upload</span>
//                                                 )}
//                                             </td>
//                                             <td>{formatDate(skeleton.timeline?.deadline)}</td>
//                                             {/* <td className="cl-actions" onClick={(e) => e.stopPropagation()}>
//                                                 <button
//                                                     className="icon-btn"
//                                                     title="Edit Skeleton"
//                                                     onClick={() => openUpdateSkeleton(skeleton)}
//                                                 >✏️</button>
//                                                 <button
//                                                     className="icon-btn"
//                                                     title="Upload Content"
//                                                     onClick={() => openUpload(skeleton)}
//                                                 >📤</button>
//                                                 <button
//                                                     className="icon-btn icon-btn-danger"
//                                                     title="Delete Skeleton"
//                                                     disabled={deletingId === skeleton._id}
//                                                     onClick={() => handleDelete(skeleton)}
//                                                 >{deletingId === skeleton._id ? '…' : '🗑'}</button>
//                                             </td> */}
//                                             <td
//                                                 className="cl-actions"
//                                                 onClick={(e) => e.stopPropagation()}
//                                             >
//                                                 <button
//                                                     className="icon-btn"
//                                                     title="Edit Skeleton"
//                                                     onClick={() => openUpdateSkeleton(skeleton)}
//                                                 >
//                                                     <Pencil size={17} strokeWidth={2} />
//                                                 </button>

//                                                 <button
//                                                     className="icon-btn"
//                                                     title="Upload Content"
//                                                     onClick={() => openUpload(skeleton)}
//                                                 >
//                                                     <Upload size={17} strokeWidth={2} />
//                                                 </button>

//                                                 <button
//                                                     className="icon-btn icon-btn-danger"
//                                                     title="Delete Skeleton"
//                                                     disabled={deletingId === skeleton._id}
//                                                     onClick={() => handleDelete(skeleton)}
//                                                 >
//                                                     {deletingId === skeleton._id ? (
//                                                         <LoaderCircle
//                                                             size={17}
//                                                             strokeWidth={2}
//                                                             className="spin"
//                                                         />
//                                                     ) : (
//                                                         <Trash2 size={17} strokeWidth={2} />
//                                                     )}
//                                                 </button>
//                                             </td>
//                                         </tr>

//                                         {isExpanded && (
//                                             <tr className="cl-expand-row" key={`${skeleton._id}-detail`}>
//                                                 <td colSpan={10}>
//                                                     <div className="cl-expand-panel">
//                                                         <div className="cl-expand-grid">
//                                                             <div>
//                                                                 <span className="detail-label">Description</span>
//                                                                 <p>{skeleton.metadata?.description || '—'}</p>
//                                                             </div>
//                                                             <div>
//                                                                 <span className="detail-label">Duration</span>
//                                                                 <p>{skeleton.metadata?.durationMinutes || 0} min</p>
//                                                             </div>
//                                                             <div>
//                                                                 <span className="detail-label">Tags</span>
//                                                                 <p>
//                                                                     {(skeleton.metadata?.tags || []).length
//                                                                         ? skeleton.metadata.tags.map((t) => `#${t}`).join(' ')
//                                                                         : '—'}
//                                                                 </p>
//                                                             </div>
//                                                             <div>
//                                                                 <span className="detail-label">Scheduled</span>
//                                                                 <p>{formatDate(skeleton.timeline?.scheduledDate)}</p>
//                                                             </div>
//                                                             <div>
//                                                                 <span className="detail-label">Deadline</span>
//                                                                 <p>{formatDate(skeleton.timeline?.deadline)}</p>
//                                                             </div>
//                                                         </div>

//                                                         <div className="cl-files-section">
//                                                             <span className="detail-label">Uploaded Files</span>
//                                                             {contents.length === 0 ? (
//                                                                 <div className="cl-no-files">
//                                                                     <span>No files uploaded</span>
//                                                                     <button className="btn btn-sm btn-primary" onClick={() => openUpload(skeleton)}>
//                                                                         Upload Content
//                                                                     </button>
//                                                                 </div>
//                                                             ) : (
//                                                                 <div className="cl-file-list">
//                                                                     {contents.map((file) => {
//                                                                         const kind = fileKind(file.mimeType);
//                                                                         return (
//                                                                             <div className="cl-file-item" key={file._id}>
//                                                                                 <span className="cl-file-icon">{kind.icon}</span>
//                                                                                 <div className="cl-file-meta">
//                                                                                     <span className="cl-file-name">{file.fileName}</span>
//                                                                                     <span className="cl-file-sub">
//                                                                                         {kind.label} · v{file.version} · {formatFileSize(file.fileSize)} · Uploaded by {file.uploadedBy?.name || 'Unknown'}
//                                                                                     </span>
//                                                                                 </div>
//                                                                                 {/* <StatusBadge status={file.status} />
//                                                                                         <button
//                                                                                         className="icon-btn icon-btn-danger"
//                                                                                         title="Delete File"
//                                                                                         disabled={deletingFileId === file._id}
//                                                                                         onClick={() => handleDeleteFile(file)}
//                                                                                         >{deletingFileId === file._id ? '…' : '🗑'}
//                                                                                         </button> */}

//                                                                                 {/* <StatusBadge status={file.status} />

//                                                                                 <div className="cl-file-actions">

//                                                                                     <button
//                                                                                         className="icon-btn"
//                                                                                         title="Preview"
//                                                                                         onClick={() => handlePreviewFile(file)}
//                                                                                     >
//                                                                                         👁
//                                                                                     </button>

//                                                                                     <button
//                                                                                         className="icon-btn"
//                                                                                         title="Download"
//                                                                                         onClick={() => handleDownloadFile(file)}
//                                                                                     >
//                                                                                         ⬇
//                                                                                     </button>

//                                                                                     <button
//                                                                                         className="icon-btn icon-btn-danger"
//                                                                                         title="Delete File"
//                                                                                         disabled={deletingFileId === file._id}
//                                                                                         onClick={() => handleDeleteFile(file)}
//                                                                                     >
//                                                                                         {deletingFileId === file._id ? "…" : "🗑"}
//                                                                                     </button>

//                                                                                 </div> */}
//                                                                                 <StatusBadge status={file.status} />

//                                                                                 <div className="cl-file-actions">

//                                                                                     <button
//                                                                                         className="icon-btn"
//                                                                                         title="Preview"
//                                                                                         onClick={() => handlePreviewFile(file)}
//                                                                                     >
//                                                                                         Preview
//                                                                                     </button>

//                                                                                     <button
//                                                                                         className="icon-btn"
//                                                                                         title="Download"
//                                                                                         onClick={() => handleDownloadFile(file)}
//                                                                                     >
//                                                                                         ⬇
//                                                                                     </button>

//                                                                                     <button
//                                                                                         className="icon-btn icon-btn-danger"
//                                                                                         title="Delete File"
//                                                                                         disabled={deletingFileId === file._id}
//                                                                                         onClick={() => handleDeleteFile(file)}
//                                                                                     >
//                                                                                         {deletingFileId === file._id ? "…" : "🗑"}
//                                                                                     </button>

//                                                                                 </div>


//                                                                             </div>
//                                                                         );
//                                                                     })}
//                                                                     <button className="btn btn-sm btn-secondary" onClick={() => openUpload(skeleton)}>
//                                                                         + Upload another version
//                                                                     </button>
//                                                                 </div>
//                                                             )}

//                                                             <div className="cl-panel-footer">
//                                                                 <button
//                                                                     className="btn btn-sm btn-danger"
//                                                                     disabled={deletingId === skeleton._id}
//                                                                     onClick={() => handleDelete(skeleton)}
//                                                                 >
//                                                                     {deletingId === skeleton._id ? 'Deleting…' : '🗑 Delete Skeleton'}
//                                                                 </button>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//             {/* <PDFPreviewModal
//                 open={previewOpen}
//                 fileUrl={previewBlobUrl}
//                 fileName={previewFileName}
//                 onClose={closePreview}
//                 onDownload={() => {
//                     const file = AllContents.find(
//                         (f) => f.fileName === previewFileName
//                     );

//                     if (file) {
//                         handleDownloadFile(previewFile)
//                     }
//                 }}
//             /> */}
//             <PDFPreviewModal
//                 open={previewOpen}
//                 fileUrl={previewBlobUrl}
//                 fileName={previewFileName}
//                 onClose={closePreview}
//                 onDownload={() => handleDownloadFile(previewFile)}
//             />
//         </div>
//     );
// }








// // import { useState, useMemo } from 'react';
// // import { useDashboard } from "../../../hooks/useDashboard";
// // import ContentManager from './components/newcontent';

// // import './content.css';

// // const STATUS_FILTERS = ['All', 'Draft', 'Published'];
// // const FORMAT_FILTERS = ['All', 'pdf', 'video', 'doc', 'link', 'live'];
// // const SORT_OPTIONS = [
// //   { value: 'newest', label: 'Newest' },
// //   { value: 'oldest', label: 'Oldest' },
// //   { value: 'deadline', label: 'Deadline' },
// // ];

// // function formatDate(dateStr) {
// //   if (!dateStr) return '—';
// //   const d = new Date(dateStr);
// //   if (Number.isNaN(d.getTime())) return '—';
// //   return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// // }

// // function formatFileSize(bytes) {
// //   if (!bytes && bytes !== 0) return '';
// //   if (bytes < 1024) return `${bytes} B`;
// //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
// //   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// // }

// // function fileKind(mimeType = '') {
// //   if (mimeType.includes('pdf')) return { label: 'PDF', icon: '📄' };
// //   if (mimeType.includes('video')) return { label: 'VIDEO', icon: '🎥' };
// //   if (mimeType.includes('word') || mimeType.includes('doc')) return { label: 'DOC', icon: '📝' };
// //   if (mimeType.includes('image')) return { label: 'IMAGE', icon: '🖼️' };
// //   return { label: 'FILE', icon: '📎' };
// // }

// // function StatusBadge({ status }) {
// //   const map = {
// //     draft: { label: 'Draft', cls: 'badge-gray' },
// //     published: { label: 'Published', cls: 'badge-green' },
// //     active: { label: 'Active', cls: 'badge-blue' },
// //     archived: { label: 'Archived', cls: 'badge-orange' },
// //   };
// //   const entry = map[status] || { label: status || 'Unknown', cls: 'badge-gray' };
// //   return <span className={`badge ${entry.cls}`}>● {entry.label}</span>;
// // }

// // export default function Content({ token }) {
// //   const {
// //     AllContentSkeletons = [],
// //     AllContents = [],
// //     ProgramStructure = [],
// //     AllCourses = [],
// //     createContentSkeleton,
// //     createContent,
// //     deleteContentSkeleton,
// //   } = useDashboard(token);

// //   const [showManager, setShowManager] = useState(false);
// //   const [managerMode, setManagerMode] = useState('skeleton'); // 'skeleton' | 'upload'
// //   const [activeSkeleton, setActiveSkeleton] = useState(null);
// //   const [deletingId, setDeletingId] = useState(null);

// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [statusFilter, setStatusFilter] = useState('All');
// //   const [formatFilter, setFormatFilter] = useState('All');
// //   const [programFilter, setProgramFilter] = useState('All');
// //   const [sortBy, setSortBy] = useState('newest');
// //   const [expandedId, setExpandedId] = useState(null);

// //   const getProgramName = (programId) => {
// //     const program = AllCourses.find((c) => c._id === programId);
// //     return program?.courseCode || 'Unassigned';
// //   };

// //   const getCollegeName = (programId) => {
// //     const program = AllCourses.find((c) => c._id === programId);
// //     return program?.collegeId?.name || '';
// //   };

// //   const getContentsForSkeleton = (skeletonId) =>
// //     AllContents.filter((c) => c.skeletonId === skeletonId);

// //   const stats = useMemo(() => {
// //     const totalSkeletons = AllContentSkeletons.length;
// //     const totalFiles = AllContents.length;
// //     const published = AllContentSkeletons.filter((s) => s.status === 'published').length;
// //     const programIds = new Set(AllContentSkeletons.map((s) => s.programId).filter(Boolean));
// //     const pdfCount = AllContents.filter((c) => (c.mimeType || '').includes('pdf')).length;
// //     const publishedPct = totalSkeletons ? Math.round((published / totalSkeletons) * 100) : 0;

// //     return {
// //       totalSkeletons,
// //       totalFiles,
// //       published,
// //       publishedPct,
// //       programCount: programIds.size,
// //       pdfCount,
// //     };
// //   }, [AllContentSkeletons, AllContents]);

// //   const filteredSkeletons = useMemo(() => {
// //     const term = searchTerm.trim().toLowerCase();

// //     let rows = AllContentSkeletons.filter((s) => {
// //       if (statusFilter !== 'All' && s.status !== statusFilter.toLowerCase()) return false;
// //       if (formatFilter !== 'All' && s.expectedFormat !== formatFilter) return false;
// //       if (programFilter !== 'All' && s.programId !== programFilter) return false;

// //       if (!term) return true;

// //       const contents = getContentsForSkeleton(s._id);
// //       const programName = getProgramName(s.programId).toLowerCase();
// //       const collegeName = getCollegeName(s.programId).toLowerCase();
// //       const haystack = [
// //         s.title,
// //         s.metadata?.topic,
// //         s.classNumber?.toString(),
// //         programName,
// //         collegeName,
// //         ...(s.metadata?.tags || []),
// //         ...contents.map((c) => c.fileName),
// //       ]
// //         .filter(Boolean)
// //         .join(' ')
// //         .toLowerCase();

// //       return haystack.includes(term);
// //     });

// //     rows = [...rows].sort((a, b) => {
// //       if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
// //       if (sortBy === 'deadline')
// //         return new Date(a.timeline?.deadline || 0) - new Date(b.timeline?.deadline || 0);
// //       return new Date(b.createdAt) - new Date(a.createdAt);
// //     });

// //     return rows;
// //   }, [AllContentSkeletons, AllContents, searchTerm, statusFilter, formatFilter, programFilter, sortBy]);

// //   const openNewSkeleton = () => {
// //     setActiveSkeleton(null);
// //     setManagerMode('skeleton');
// //     setShowManager(true);
// //   };

// //   const openUpload = (skeleton = null) => {
// //     setActiveSkeleton(skeleton);
// //     setManagerMode('upload');
// //     setShowManager(true);
// //   };

// //   const closeManager = () => {
// //     setShowManager(false);
// //     setActiveSkeleton(null);
// //   };

// //   const handleDelete = async (skeleton) => {
// //     const contentCount = getContentsForSkeleton(skeleton._id).length;
// //     const warning = contentCount > 0
// //       ? `Delete "${skeleton.title}" (Class ${skeleton.classNumber})? This skeleton has ${contentCount} uploaded file${contentCount > 1 ? 's' : ''} attached.`
// //       : `Delete "${skeleton.title}" (Class ${skeleton.classNumber})? This can't be undone.`;

// //     if (!window.confirm(warning)) return;

// //     setDeletingId(skeleton._id);

// //     try {
// //       await deleteContentSkeleton(skeleton._id, token);

// //       if (expandedId === skeleton._id) setExpandedId(null);
// //     } catch (err) {
// //       alert(err.message || 'Failed to delete content skeleton');
// //     } finally {
// //       setDeletingId(null);
// //     }
// //   };

// //   if (showManager) {
// //     return (
// //       <ContentManager
// //         token={token}
// //         mode={managerMode}
// //         skeleton={activeSkeleton}
// //         skeletonId={activeSkeleton?._id}
// //         classNumber={activeSkeleton?.classNumber}
// //         onBack={closeManager}
// //         AllContentSkeletons={AllContentSkeletons}
// //         AllCourses={AllCourses}
// //         createContentSkeleton={createContentSkeleton}
// //         createContent={createContent}
// //       />
// //     );
// //   }

// //   return (
// //     <div className="content-library">
// //       <div className="cl-header">
// //         <div>
// //           <h1>Content Library</h1>
// //           <p className="cl-subtitle">Manage content skeletons, uploaded files and program resources.</p>
// //         </div>
// //         <div className="cl-header-actions">
// //           <button className="btn btn-secondary" onClick={openNewSkeleton}>+ New Skeleton</button>
// //           <button className="btn btn-primary" onClick={() => openUpload(null)}>+ Upload Content</button>
// //         </div>
// //       </div>

// //       <div className="cl-stats">
// //         <div className="content-stat-card">
// //           <span className="stat-label">Skeletons</span>
// //           <span className="stat-value">{stats.totalSkeletons}</span>
// //           <span className="stat-foot">Across {stats.programCount} programs</span>
// //         </div>
// //         <div className="content-stat-card">
// //           <span className="stat-label">Uploaded Files</span>
// //           <span className="stat-value">{stats.totalFiles}</span>
// //           <span className="stat-foot">{stats.pdfCount} PDFs</span>
// //         </div>
// //         <div className="content-stat-card">
// //           <span className="stat-label">Published</span>
// //           <span className="stat-value">{stats.published}</span>
// //           <span className="stat-foot">{stats.publishedPct}% of total</span>
// //         </div>
// //         <div className="content-stat-card">
// //           <span className="stat-label">Programs</span>
// //           <span className="stat-value">{stats.programCount}</span>
// //           <span className="stat-foot">Active programs</span>
// //         </div>
// //       </div>

// //       <div className="cl-toolbar">
// //         <input
// //           className="cl-search"
// //           type="text"
// //           placeholder="Search by title, topic, tags, class, program or file name"
// //           value={searchTerm}
// //           onChange={(e) => setSearchTerm(e.target.value)}
// //         />

// //         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
// //           {STATUS_FILTERS.map((s) => (
// //             <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
// //           ))}
// //         </select>

// //         <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
// //           {FORMAT_FILTERS.map((f) => (
// //             <option key={f} value={f}>{f === 'All' ? 'All Formats' : f.toUpperCase()}</option>
// //           ))}
// //         </select>

// //         <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
// //           <option value="All">All Programs</option>
// //           {AllCourses.map((p) => (
// //             <option key={p._id} value={p._id}>{p.courseCode}</option>
// //           ))}
// //         </select>

// //         <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
// //           {SORT_OPTIONS.map((o) => (
// //             <option key={o.value} value={o.value}>{o.label}</option>
// //           ))}
// //         </select>
// //       </div>

// //       <div className="cl-table-wrap">
// //         {filteredSkeletons.length === 0 ? (
// //           <div className="cl-empty">
// //             <div className="cl-empty-icon">📂</div>
// //             <h3>No content has been created yet.</h3>
// //             <p>Create your first content skeleton to begin.</p>
// //             <button className="btn btn-primary" onClick={openNewSkeleton}>+ New Skeleton</button>
// //           </div>
// //         ) : (
// //           <table className="cl-table">
// //             <thead>
// //               <tr>
// //                 <th></th>
// //                 <th>Class</th>
// //                 <th>Title</th>
// //                 <th>Topic</th>
// //                 <th>Program</th>
// //                 <th>Format</th>
// //                 <th>Status</th>
// //                 <th>Files</th>
// //                 <th>Deadline</th>
// //                 <th>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {filteredSkeletons.map((skeleton) => {
// //                 const contents = getContentsForSkeleton(skeleton._id);
// //                 const isExpanded = expandedId === skeleton._id;

// //                 return (
// //                   <>
// //                     <tr
// //                       key={skeleton._id}
// //                       className={`cl-row ${isExpanded ? 'cl-row-expanded' : ''}`}
// //                       onClick={() => setExpandedId(isExpanded ? null : skeleton._id)}
// //                     >
// //                       <td className="cl-caret">{isExpanded ? '▼' : '▶'}</td>
// //                       <td>{skeleton.classNumber}</td>
// //                       <td className="cl-title-cell">{skeleton.title}</td>
// //                       <td>{skeleton.metadata?.topic || '—'}</td>
// //                       <td className="cl-program-cell">
// //                         <span className="cl-program-code">{getProgramName(skeleton.programId)}</span>
// //                         <span className="cl-program-college">{getCollegeName(skeleton.programId)}</span>
// //                       </td>
// //                       <td className="cl-format">{skeleton.expectedFormat}</td>
// //                       <td><StatusBadge status={skeleton.status} /></td>
// //                       <td>
// //                         {contents.length > 0 ? (
// //                           <span className="badge badge-blue">✔ {contents.length} File{contents.length > 1 ? 's' : ''}</span>
// //                         ) : (
// //                           <span className="badge badge-gray">No Upload</span>
// //                         )}
// //                       </td>
// //                       <td>{formatDate(skeleton.timeline?.deadline)}</td>
// //                       <td className="cl-actions" onClick={(e) => e.stopPropagation()}>
// //                         <button
// //                           className="icon-btn"
// //                           title="Edit Skeleton"
// //                           onClick={() => openNewSkeleton(skeleton)}
// //                         >✏️</button>
// //                         <button
// //                           className="icon-btn"
// //                           title="Upload Content"
// //                           onClick={() => openUpload(skeleton)}
// //                         >📤</button>
// //                         <button
// //                           className="icon-btn icon-btn-danger"
// //                           title="Delete Skeleton"
// //                           disabled={deletingId === skeleton._id}
// //                           onClick={() => handleDelete(skeleton)}
// //                         >{deletingId === skeleton._id ? '…' : '🗑'}</button>
// //                       </td>
// //                     </tr>

// //                     {isExpanded && (
// //                       <tr className="cl-expand-row" key={`${skeleton._id}-detail`}>
// //                         <td colSpan={10}>
// //                           <div className="cl-expand-panel">
// //                             <div className="cl-expand-grid">
// //                               <div>
// //                                 <span className="detail-label">Description</span>
// //                                 <p>{skeleton.metadata?.description || '—'}</p>
// //                               </div>
// //                               <div>
// //                                 <span className="detail-label">Duration</span>
// //                                 <p>{skeleton.metadata?.durationMinutes || 0} min</p>
// //                               </div>
// //                               <div>
// //                                 <span className="detail-label">Tags</span>
// //                                 <p>
// //                                   {(skeleton.metadata?.tags || []).length
// //                                     ? skeleton.metadata.tags.map((t) => `#${t}`).join(' ')
// //                                     : '—'}
// //                                 </p>
// //                               </div>
// //                               <div>
// //                                 <span className="detail-label">Scheduled</span>
// //                                 <p>{formatDate(skeleton.timeline?.scheduledDate)}</p>
// //                               </div>
// //                               <div>
// //                                 <span className="detail-label">Deadline</span>
// //                                 <p>{formatDate(skeleton.timeline?.deadline)}</p>
// //                               </div>
// //                             </div>

// //                             <div className="cl-files-section">
// //                               <span className="detail-label">Uploaded Files</span>
// //                               {contents.length === 0 ? (
// //                                 <div className="cl-no-files">
// //                                   <span>No files uploaded</span>
// //                                   <button className="btn btn-sm btn-primary" onClick={() => openUpload(skeleton)}>
// //                                     Upload Content
// //                                   </button>
// //                                 </div>
// //                               ) : (
// //                                 <div className="cl-file-list">
// //                                   {contents.map((file) => {
// //                                     const kind = fileKind(file.mimeType);
// //                                     return (
// //                                       <div className="cl-file-item" key={file._id}>
// //                                         <span className="cl-file-icon">{kind.icon}</span>
// //                                         <div className="cl-file-meta">
// //                                           <span className="cl-file-name">{file.fileName}</span>
// //                                           <span className="cl-file-sub">
// //                                             {kind.label} · v{file.version} · {formatFileSize(file.fileSize)} · Uploaded by {file.uploadedBy?.name || 'Unknown'}
// //                                           </span>
// //                                         </div>
// //                                         <StatusBadge status={file.status} />
// //                                       </div>
// //                                     );
// //                                   })}
// //                                   <button className="btn btn-sm btn-secondary" onClick={() => openUpload(skeleton)}>
// //                                     + Upload another version
// //                                   </button>
// //                                 </div>
// //                               )}

// //                               <div className="cl-panel-footer">
// //                                 <button
// //                                   className="btn btn-sm btn-danger"
// //                                   disabled={deletingId === skeleton._id}
// //                                   onClick={() => handleDelete(skeleton)}
// //                                 >
// //                                   {deletingId === skeleton._id ? 'Deleting…' : '🗑 Delete Skeleton'}
// //                                 </button>
// //                               </div>
// //                             </div>
// //                           </div>
// //                         </td>
// //                       </tr>
// //                     )}
// //                   </>
// //                 );
// //               })}
// //             </tbody>
// //           </table>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }








// // // import { useState, useMemo } from 'react';
// // // import { useDashboard } from "../../../hooks/useDashboard";
// // // import ContentManager from './components/newcontent';

// // // import './content.css';

// // // const STATUS_FILTERS = ['All', 'Draft', 'Published'];
// // // const FORMAT_FILTERS = ['All', 'pdf', 'video', 'doc', 'link', 'live'];
// // // const SORT_OPTIONS = [
// // //   { value: 'newest', label: 'Newest' },
// // //   { value: 'oldest', label: 'Oldest' },
// // //   { value: 'deadline', label: 'Deadline' },
// // // ];

// // // function formatDate(dateStr) {
// // //   if (!dateStr) return '—';
// // //   const d = new Date(dateStr);
// // //   if (Number.isNaN(d.getTime())) return '—';
// // //   return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// // // }

// // // function formatFileSize(bytes) {
// // //   if (!bytes && bytes !== 0) return '';
// // //   if (bytes < 1024) return `${bytes} B`;
// // //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
// // //   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// // // }

// // // function fileKind(mimeType = '') {
// // //   if (mimeType.includes('pdf')) return { label: 'PDF', icon: '📄' };
// // //   if (mimeType.includes('video')) return { label: 'VIDEO', icon: '🎥' };
// // //   if (mimeType.includes('word') || mimeType.includes('doc')) return { label: 'DOC', icon: '📝' };
// // //   if (mimeType.includes('image')) return { label: 'IMAGE', icon: '🖼️' };
// // //   return { label: 'FILE', icon: '📎' };
// // // }

// // // function StatusBadge({ status }) {
// // //   const map = {
// // //     draft: { label: 'Draft', cls: 'badge-gray' },
// // //     published: { label: 'Published', cls: 'badge-green' },
// // //     active: { label: 'Active', cls: 'badge-blue' },
// // //     archived: { label: 'Archived', cls: 'badge-orange' },
// // //   };
// // //   const entry = map[status] || { label: status || 'Unknown', cls: 'badge-gray' };
// // //   return <span className={`badge ${entry.cls}`}>● {entry.label}</span>;
// // // }

// // // export default function Content({ token }) {
// // //   const {
// // //     AllContentSkeletons = [],
// // //     AllContents = [],
// // //     ProgramStructure = [],
// // //     AllCourses = [],
// // //     createContentSkeleton,
// // //     createContent,
// // //   } = useDashboard(token);

// // //   const [showManager, setShowManager] = useState(false);
// // //   const [managerMode, setManagerMode] = useState('skeleton'); // 'skeleton' | 'upload'
// // //   const [activeSkeleton, setActiveSkeleton] = useState(null);

// // //   const [searchTerm, setSearchTerm] = useState('');
// // //   const [statusFilter, setStatusFilter] = useState('All');
// // //   const [formatFilter, setFormatFilter] = useState('All');
// // //   const [programFilter, setProgramFilter] = useState('All');
// // //   const [sortBy, setSortBy] = useState('newest');
// // //   const [expandedId, setExpandedId] = useState(null);

// // //   const getProgramName = (programId) => {
// // //     const program = AllCourses.find((c) => c._id === programId);
// // //     return program?.courseCode || 'Unassigned';
// // //   };

// // //   const getCollegeName = (programId) => {
// // //     const program = AllCourses.find((c) => c._id === programId);
// // //     return program?.collegeId?.name || '';
// // //   };

// // //   const getContentsForSkeleton = (skeletonId) =>
// // //     AllContents.filter((c) => c.skeletonId === skeletonId);

// // //   const stats = useMemo(() => {
// // //     const totalSkeletons = AllContentSkeletons.length;
// // //     const totalFiles = AllContents.length;
// // //     const published = AllContentSkeletons.filter((s) => s.status === 'published').length;
// // //     const programIds = new Set(AllContentSkeletons.map((s) => s.programId).filter(Boolean));
// // //     const pdfCount = AllContents.filter((c) => (c.mimeType || '').includes('pdf')).length;
// // //     const publishedPct = totalSkeletons ? Math.round((published / totalSkeletons) * 100) : 0;

// // //     return {
// // //       totalSkeletons,
// // //       totalFiles,
// // //       published,
// // //       publishedPct,
// // //       programCount: programIds.size,
// // //       pdfCount,
// // //     };
// // //   }, [AllContentSkeletons, AllContents]);

// // //   const filteredSkeletons = useMemo(() => {
// // //     const term = searchTerm.trim().toLowerCase();

// // //     let rows = AllContentSkeletons.filter((s) => {
// // //       if (statusFilter !== 'All' && s.status !== statusFilter.toLowerCase()) return false;
// // //       if (formatFilter !== 'All' && s.expectedFormat !== formatFilter) return false;
// // //       if (programFilter !== 'All' && s.programId !== programFilter) return false;

// // //       if (!term) return true;

// // //       const contents = getContentsForSkeleton(s._id);
// // //       const programName = getProgramName(s.programId).toLowerCase();
// // //       const collegeName = getCollegeName(s.programId).toLowerCase();
// // //       const haystack = [
// // //         s.title,
// // //         s.metadata?.topic,
// // //         s.classNumber?.toString(),
// // //         programName,
// // //         collegeName,
// // //         ...(s.metadata?.tags || []),
// // //         ...contents.map((c) => c.fileName),
// // //       ]
// // //         .filter(Boolean)
// // //         .join(' ')
// // //         .toLowerCase();

// // //       return haystack.includes(term);
// // //     });

// // //     rows = [...rows].sort((a, b) => {
// // //       if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
// // //       if (sortBy === 'deadline')
// // //         return new Date(a.timeline?.deadline || 0) - new Date(b.timeline?.deadline || 0);
// // //       return new Date(b.createdAt) - new Date(a.createdAt);
// // //     });

// // //     return rows;
// // //   }, [AllContentSkeletons, AllContents, searchTerm, statusFilter, formatFilter, programFilter, sortBy]);

// // //   const openNewSkeleton = () => {
// // //     setActiveSkeleton(null);
// // //     setManagerMode('skeleton');
// // //     setShowManager(true);
// // //   };

// // //   const openUpload = (skeleton = null) => {
// // //     setActiveSkeleton(skeleton);
// // //     setManagerMode('upload');
// // //     setShowManager(true);
// // //   };

// // //   const closeManager = () => {
// // //     setShowManager(false);
// // //     setActiveSkeleton(null);
// // //   };

// // //   if (showManager) {
// // //     return (
// // //       <ContentManager
// // //         token={token}
// // //         mode={managerMode}
// // //         skeleton={activeSkeleton}
// // //         skeletonId={activeSkeleton?._id}
// // //         classNumber={activeSkeleton?.classNumber}
// // //         onBack={closeManager}
// // //         AllContentSkeletons={AllContentSkeletons}
// // //         AllCourses={AllCourses}
// // //         createContentSkeleton={createContentSkeleton}
// // //         createContent={createContent}
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <div className="content-library">
// // //       <div className="cl-header">
// // //         <div>
// // //           <h1>Content Library</h1>
// // //           <p className="cl-subtitle">Manage content skeletons, uploaded files and program resources.</p>
// // //         </div>
// // //         <div className="cl-header-actions">
// // //           <button className="btn btn-secondary" onClick={openNewSkeleton}>+ New Skeleton</button>
// // //           <button className="btn btn-primary" onClick={() => openUpload(null)}>+ Upload Content</button>
// // //         </div>
// // //       </div>

// // //       <div className="cl-stats">
// // //         <div className="content-stat-card">
// // //           <span className="stat-label">Skeletons</span>
// // //           <span className="stat-value">{stats.totalSkeletons}</span>
// // //           <span className="stat-foot">Across {stats.programCount} programs</span>
// // //         </div>
// // //         <div className="content-stat-card">
// // //           <span className="stat-label">Uploaded Files</span>
// // //           <span className="stat-value">{stats.totalFiles}</span>
// // //           <span className="stat-foot">{stats.pdfCount} PDFs</span>
// // //         </div>
// // //         <div className="content-stat-card">
// // //           <span className="stat-label">Published</span>
// // //           <span className="stat-value">{stats.published}</span>
// // //           <span className="stat-foot">{stats.publishedPct}% of total</span>
// // //         </div>
// // //         <div className="content-stat-card">
// // //           <span className="stat-label">Programs</span>
// // //           <span className="stat-value">{stats.programCount}</span>
// // //           <span className="stat-foot">Active programs</span>
// // //         </div>
// // //       </div>

// // //       <div className="cl-toolbar">
// // //         <input
// // //           className="cl-search"
// // //           type="text"
// // //           placeholder="Search by title, topic, tags, class, program or file name"
// // //           value={searchTerm}
// // //           onChange={(e) => setSearchTerm(e.target.value)}
// // //         />

// // //         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
// // //           {STATUS_FILTERS.map((s) => (
// // //             <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
// // //           ))}
// // //         </select>

// // //         <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
// // //           {FORMAT_FILTERS.map((f) => (
// // //             <option key={f} value={f}>{f === 'All' ? 'All Formats' : f.toUpperCase()}</option>
// // //           ))}
// // //         </select>

// // //         <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
// // //           <option value="All">All Programs</option>
// // //           {AllCourses.map((p) => (
// // //             <option key={p._id} value={p._id}>{p.courseCode}</option>
// // //           ))}
// // //         </select>

// // //         <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
// // //           {SORT_OPTIONS.map((o) => (
// // //             <option key={o.value} value={o.value}>{o.label}</option>
// // //           ))}
// // //         </select>
// // //       </div>

// // //       <div className="cl-table-wrap">
// // //         {filteredSkeletons.length === 0 ? (
// // //           <div className="cl-empty">
// // //             <div className="cl-empty-icon">📂</div>
// // //             <h3>No content has been created yet.</h3>
// // //             <p>Create your first content skeleton to begin.</p>
// // //             <button className="btn btn-primary" onClick={openNewSkeleton}>+ New Skeleton</button>
// // //           </div>
// // //         ) : (
// // //           <table className="cl-table">
// // //             <thead>
// // //               <tr>
// // //                 <th></th>
// // //                 <th>Class</th>
// // //                 <th>Title</th>
// // //                 <th>Topic</th>
// // //                 <th>Program</th>
// // //                 <th>Format</th>
// // //                 <th>Status</th>
// // //                 <th>Files</th>
// // //                 <th>Deadline</th>
// // //                 <th>Actions</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {filteredSkeletons.map((skeleton) => {
// // //                 const contents = getContentsForSkeleton(skeleton._id);
// // //                 const isExpanded = expandedId === skeleton._id;

// // //                 return (
// // //                   <>
// // //                     <tr
// // //                       key={skeleton._id}
// // //                       className={`cl-row ${isExpanded ? 'cl-row-expanded' : ''}`}
// // //                       onClick={() => setExpandedId(isExpanded ? null : skeleton._id)}
// // //                     >
// // //                       <td className="cl-caret">{isExpanded ? '▼' : '▶'}</td>
// // //                       <td>{skeleton.classNumber}</td>
// // //                       <td className="cl-title-cell">{skeleton.title}</td>
// // //                       <td>{skeleton.metadata?.topic || '—'}</td>
// // //                       <td className="cl-program-cell">
// // //                         <span className="cl-program-code">{getProgramName(skeleton.programId)}</span>
// // //                         <span className="cl-program-college">{getCollegeName(skeleton.programId)}</span>
// // //                       </td>
// // //                       <td className="cl-format">{skeleton.expectedFormat}</td>
// // //                       <td><StatusBadge status={skeleton.status} /></td>
// // //                       <td>
// // //                         {contents.length > 0 ? (
// // //                           <span className="badge badge-blue">✔ {contents.length} File{contents.length > 1 ? 's' : ''}</span>
// // //                         ) : (
// // //                           <span className="badge badge-gray">No Upload</span>
// // //                         )}
// // //                       </td>
// // //                       <td>{formatDate(skeleton.timeline?.deadline)}</td>
// // //                       <td className="cl-actions" onClick={(e) => e.stopPropagation()}>
// // //                         <button
// // //                           className="icon-btn"
// // //                           title="Edit Skeleton"
// // //                           onClick={() => openNewSkeleton(skeleton)}
// // //                         >✏️</button>
// // //                         <button
// // //                           className="icon-btn"
// // //                           title="Upload Content"
// // //                           onClick={() => openUpload(skeleton)}
// // //                         >📤</button>
// // //                       </td>
// // //                     </tr>

// // //                     {isExpanded && (
// // //                       <tr className="cl-expand-row" key={`${skeleton._id}-detail`}>
// // //                         <td colSpan={10}>
// // //                           <div className="cl-expand-panel">
// // //                             <div className="cl-expand-grid">
// // //                               <div>
// // //                                 <span className="detail-label">Description</span>
// // //                                 <p>{skeleton.metadata?.description || '—'}</p>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="detail-label">Duration</span>
// // //                                 <p>{skeleton.metadata?.durationMinutes || 0} min</p>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="detail-label">Tags</span>
// // //                                 <p>
// // //                                   {(skeleton.metadata?.tags || []).length
// // //                                     ? skeleton.metadata.tags.map((t) => `#${t}`).join(' ')
// // //                                     : '—'}
// // //                                 </p>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="detail-label">Scheduled</span>
// // //                                 <p>{formatDate(skeleton.timeline?.scheduledDate)}</p>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="detail-label">Deadline</span>
// // //                                 <p>{formatDate(skeleton.timeline?.deadline)}</p>
// // //                               </div>
// // //                             </div>

// // //                             <div className="cl-files-section">
// // //                               <span className="detail-label">Uploaded Files</span>
// // //                               {contents.length === 0 ? (
// // //                                 <div className="cl-no-files">
// // //                                   <span>No files uploaded</span>
// // //                                   <button className="btn btn-sm btn-primary" onClick={() => openUpload(skeleton)}>
// // //                                     Upload Content
// // //                                   </button>
// // //                                 </div>
// // //                               ) : (
// // //                                 <div className="cl-file-list">
// // //                                   {contents.map((file) => {
// // //                                     const kind = fileKind(file.mimeType);
// // //                                     return (
// // //                                       <div className="cl-file-item" key={file._id}>
// // //                                         <span className="cl-file-icon">{kind.icon}</span>
// // //                                         <div className="cl-file-meta">
// // //                                           <span className="cl-file-name">{file.fileName}</span>
// // //                                           <span className="cl-file-sub">
// // //                                             {kind.label} · v{file.version} · {formatFileSize(file.fileSize)} · Uploaded by {file.uploadedBy?.name || 'Unknown'}
// // //                                           </span>
// // //                                         </div>
// // //                                         <StatusBadge status={file.status} />
// // //                                       </div>
// // //                                     );
// // //                                   })}
// // //                                   <button className="btn btn-sm btn-secondary" onClick={() => openUpload(skeleton)}>
// // //                                     + Upload another version
// // //                                   </button>
// // //                                 </div>
// // //                               )}
// // //                             </div>
// // //                           </div>
// // //                         </td>
// // //                       </tr>
// // //                     )}
// // //                   </>
// // //                 );
// // //               })}
// // //             </tbody>
// // //           </table>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }








// // // // import { useState, useMemo } from 'react';
// // // // import { useDashboard } from "../../../hooks/useDashboard";
// // // // import ContentManager from './components/newcontent';

// // // // import './content.css';

// // // // const STATUS_FILTERS = ['All', 'Draft', 'Published'];
// // // // const FORMAT_FILTERS = ['All', 'pdf', 'video', 'doc', 'link', 'live'];
// // // // const SORT_OPTIONS = [
// // // //   { value: 'newest', label: 'Newest' },
// // // //   { value: 'oldest', label: 'Oldest' },
// // // //   { value: 'deadline', label: 'Deadline' },
// // // // ];

// // // // function formatDate(dateStr) {
// // // //   if (!dateStr) return '—';
// // // //   const d = new Date(dateStr);
// // // //   if (Number.isNaN(d.getTime())) return '—';
// // // //   return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// // // // }

// // // // function formatFileSize(bytes) {
// // // //   if (!bytes && bytes !== 0) return '';
// // // //   if (bytes < 1024) return `${bytes} B`;
// // // //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
// // // //   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// // // // }

// // // // function fileKind(mimeType = '') {
// // // //   if (mimeType.includes('pdf')) return { label: 'PDF', icon: '📄' };
// // // //   if (mimeType.includes('video')) return { label: 'VIDEO', icon: '🎥' };
// // // //   if (mimeType.includes('word') || mimeType.includes('doc')) return { label: 'DOC', icon: '📝' };
// // // //   if (mimeType.includes('image')) return { label: 'IMAGE', icon: '🖼️' };
// // // //   return { label: 'FILE', icon: '📎' };
// // // // }

// // // // function StatusBadge({ status }) {
// // // //   const map = {
// // // //     draft: { label: 'Draft', cls: 'badge-gray' },
// // // //     published: { label: 'Published', cls: 'badge-green' },
// // // //     active: { label: 'Active', cls: 'badge-blue' },
// // // //     archived: { label: 'Archived', cls: 'badge-orange' },
// // // //   };
// // // //   const entry = map[status] || { label: status || 'Unknown', cls: 'badge-gray' };
// // // //   return <span className={`badge ${entry.cls}`}>● {entry.label}</span>;
// // // // }

// // // // export default function Content({ token }) {
// // // //   const {
// // // //     AllContentSkeletons = [],
// // // //     AllContents = [],
// // // //     ProgramStructure = [],
// // // //     AllCourses = [],
// // // //     createContentSkeleton,
// // // //     createContent,
// // // //   } = useDashboard(token);

// // // //   const [showManager, setShowManager] = useState(false);
// // // //   const [managerMode, setManagerMode] = useState('skeleton'); // 'skeleton' | 'upload'
// // // //   const [activeSkeleton, setActiveSkeleton] = useState(null);

// // // //   const [searchTerm, setSearchTerm] = useState('');
// // // //   const [statusFilter, setStatusFilter] = useState('All');
// // // //   const [formatFilter, setFormatFilter] = useState('All');
// // // //   const [programFilter, setProgramFilter] = useState('All');
// // // //   const [sortBy, setSortBy] = useState('newest');
// // // //   const [expandedId, setExpandedId] = useState(null);

// // // //   const getProgramName = (programId) => {
// // // //     const program = AllCourses.find((c) => c._id === programId);
// // // //     return program?.name || program?.title || program?.programName || 'Unassigned';
// // // //   };

// // // //   const getContentsForSkeleton = (skeletonId) =>
// // // //     AllContents.filter((c) => c.skeletonId === skeletonId);

// // // //   const stats = useMemo(() => {
// // // //     const totalSkeletons = AllContentSkeletons.length;
// // // //     const totalFiles = AllContents.length;
// // // //     const published = AllContentSkeletons.filter((s) => s.status === 'published').length;
// // // //     const programIds = new Set(AllContentSkeletons.map((s) => s.programId).filter(Boolean));
// // // //     const pdfCount = AllContents.filter((c) => (c.mimeType || '').includes('pdf')).length;
// // // //     const publishedPct = totalSkeletons ? Math.round((published / totalSkeletons) * 100) : 0;

// // // //     return {
// // // //       totalSkeletons,
// // // //       totalFiles,
// // // //       published,
// // // //       publishedPct,
// // // //       programCount: programIds.size,
// // // //       pdfCount,
// // // //     };
// // // //   }, [AllContentSkeletons, AllContents]);

// // // //   const filteredSkeletons = useMemo(() => {
// // // //     const term = searchTerm.trim().toLowerCase();

// // // //     let rows = AllContentSkeletons.filter((s) => {
// // // //       if (statusFilter !== 'All' && s.status !== statusFilter.toLowerCase()) return false;
// // // //       if (formatFilter !== 'All' && s.expectedFormat !== formatFilter) return false;
// // // //       if (programFilter !== 'All' && s.programId !== programFilter) return false;

// // // //       if (!term) return true;

// // // //       const contents = getContentsForSkeleton(s._id);
// // // //       const programName = getProgramName(s.programId).toLowerCase();
// // // //       const haystack = [
// // // //         s.title,
// // // //         s.metadata?.topic,
// // // //         s.classNumber?.toString(),
// // // //         programName,
// // // //         ...(s.metadata?.tags || []),
// // // //         ...contents.map((c) => c.fileName),
// // // //       ]
// // // //         .filter(Boolean)
// // // //         .join(' ')
// // // //         .toLowerCase();

// // // //       return haystack.includes(term);
// // // //     });

// // // //     rows = [...rows].sort((a, b) => {
// // // //       if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
// // // //       if (sortBy === 'deadline')
// // // //         return new Date(a.timeline?.deadline || 0) - new Date(b.timeline?.deadline || 0);
// // // //       return new Date(b.createdAt) - new Date(a.createdAt);
// // // //     });

// // // //     return rows;
// // // //   }, [AllContentSkeletons, AllContents, searchTerm, statusFilter, formatFilter, programFilter, sortBy]);

// // // //   const openNewSkeleton = () => {
// // // //     setActiveSkeleton(null);
// // // //     setManagerMode('skeleton');
// // // //     setShowManager(true);
// // // //   };

// // // //   const openUpload = (skeleton = null) => {
// // // //     setActiveSkeleton(skeleton);
// // // //     setManagerMode('upload');
// // // //     setShowManager(true);
// // // //   };

// // // //   const closeManager = () => {
// // // //     setShowManager(false);
// // // //     setActiveSkeleton(null);
// // // //   };

// // // //   if (showManager) {
// // // //     return (
// // // //       <ContentManager
// // // //         token={token}
// // // //         mode={managerMode}
// // // //         skeleton={activeSkeleton}
// // // //         skeletonId={activeSkeleton?._id}
// // // //         classNumber={activeSkeleton?.classNumber}
// // // //         onBack={closeManager}
// // // //         AllContentSkeletons={AllContentSkeletons}
// // // //         AllCourses={AllCourses}
// // // //         createContentSkeleton={createContentSkeleton}
// // // //         createContent={createContent}
// // // //       />
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="content-library">
// // // //       <div className="cl-header">
// // // //         <div>
// // // //           <h1>Content Library</h1>
// // // //           <p className="cl-subtitle">Manage content skeletons, uploaded files and program resources.</p>
// // // //         </div>
// // // //         <div className="cl-header-actions">
// // // //           <button className="btn btn-secondary" onClick={openNewSkeleton}>+ New Skeleton</button>
// // // //           <button className="btn btn-primary" onClick={() => openUpload(null)}>+ Upload Content</button>
// // // //         </div>
// // // //       </div>

// // // //       <div className="cl-stats">
// // // //         <div className="content-stat-card">
// // // //           <span className="stat-label">Skeletons</span>
// // // //           <span className="stat-value">{stats.totalSkeletons}</span>
// // // //           <span className="stat-foot">Across {stats.programCount} programs</span>
// // // //         </div>
// // // //         <div className="content-stat-card">
// // // //           <span className="stat-label">Uploaded Files</span>
// // // //           <span className="stat-value">{stats.totalFiles}</span>
// // // //           <span className="stat-foot">{stats.pdfCount} PDFs</span>
// // // //         </div>
// // // //         <div className="content-stat-card">
// // // //           <span className="stat-label">Published</span>
// // // //           <span className="stat-value">{stats.published}</span>
// // // //           <span className="stat-foot">{stats.publishedPct}% of total</span>
// // // //         </div>
// // // //         <div className="content-stat-card">
// // // //           <span className="stat-label">Programs</span>
// // // //           <span className="stat-value">{stats.programCount}</span>
// // // //           <span className="stat-foot">Active programs</span>
// // // //         </div>
// // // //       </div>

// // // //       <div className="cl-toolbar">
// // // //         <input
// // // //           className="cl-search"
// // // //           type="text"
// // // //           placeholder="Search by title, topic, tags, class, program or file name"
// // // //           value={searchTerm}
// // // //           onChange={(e) => setSearchTerm(e.target.value)}
// // // //         />

// // // //         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
// // // //           {STATUS_FILTERS.map((s) => (
// // // //             <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
// // // //           ))}
// // // //         </select>

// // // //         <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
// // // //           {FORMAT_FILTERS.map((f) => (
// // // //             <option key={f} value={f}>{f === 'All' ? 'All Formats' : f.toUpperCase()}</option>
// // // //           ))}
// // // //         </select>

// // // //         <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
// // // //           <option value="All">All Programs</option>
// // // //           {AllCourses.map((p) => (
// // // //             <option key={p._id} value={p._id}>{p.name || p.title || p.programName}</option>
// // // //           ))}
// // // //         </select>

// // // //         <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
// // // //           {SORT_OPTIONS.map((o) => (
// // // //             <option key={o.value} value={o.value}>{o.label}</option>
// // // //           ))}
// // // //         </select>
// // // //       </div>

// // // //       <div className="cl-table-wrap">
// // // //         {filteredSkeletons.length === 0 ? (
// // // //           <div className="cl-empty">
// // // //             <div className="cl-empty-icon">📂</div>
// // // //             <h3>No content has been created yet.</h3>
// // // //             <p>Create your first content skeleton to begin.</p>
// // // //             <button className="btn btn-primary" onClick={openNewSkeleton}>+ New Skeleton</button>
// // // //           </div>
// // // //         ) : (
// // // //           <table className="cl-table">
// // // //             <thead>
// // // //               <tr>
// // // //                 <th></th>
// // // //                 <th>Class</th>
// // // //                 <th>Title</th>
// // // //                 <th>Topic</th>
// // // //                 <th>Program</th>
// // // //                 <th>Format</th>
// // // //                 <th>Status</th>
// // // //                 <th>Files</th>
// // // //                 <th>Deadline</th>
// // // //                 <th>Actions</th>
// // // //               </tr>
// // // //             </thead>
// // // //             <tbody>
// // // //               {filteredSkeletons.map((skeleton) => {
// // // //                 const contents = getContentsForSkeleton(skeleton._id);
// // // //                 const isExpanded = expandedId === skeleton._id;

// // // //                 return (
// // // //                   <>
// // // //                     <tr
// // // //                       key={skeleton._id}
// // // //                       className={`cl-row ${isExpanded ? 'cl-row-expanded' : ''}`}
// // // //                       onClick={() => setExpandedId(isExpanded ? null : skeleton._id)}
// // // //                     >
// // // //                       <td className="cl-caret">{isExpanded ? '▼' : '▶'}</td>
// // // //                       <td>{skeleton.classNumber}</td>
// // // //                       <td className="cl-title-cell">{skeleton.title}</td>
// // // //                       <td>{skeleton.metadata?.topic || '—'}</td>
// // // //                       <td>{getProgramName(skeleton.programId)}</td>
// // // //                       <td className="cl-format">{skeleton.expectedFormat}</td>
// // // //                       <td><StatusBadge status={skeleton.status} /></td>
// // // //                       <td>
// // // //                         {contents.length > 0 ? (
// // // //                           <span className="badge badge-blue">✔ {contents.length} File{contents.length > 1 ? 's' : ''}</span>
// // // //                         ) : (
// // // //                           <span className="badge badge-gray">No Upload</span>
// // // //                         )}
// // // //                       </td>
// // // //                       <td>{formatDate(skeleton.timeline?.deadline)}</td>
// // // //                       <td className="cl-actions" onClick={(e) => e.stopPropagation()}>
// // // //                         <button
// // // //                           className="icon-btn"
// // // //                           title="Edit Skeleton"
// // // //                           onClick={() => openNewSkeleton(skeleton)}
// // // //                         >✏️</button>
// // // //                         <button
// // // //                           className="icon-btn"
// // // //                           title="Upload Content"
// // // //                           onClick={() => openUpload(skeleton)}
// // // //                         >📤</button>
// // // //                       </td>
// // // //                     </tr>

// // // //                     {isExpanded && (
// // // //                       <tr className="cl-expand-row" key={`${skeleton._id}-detail`}>
// // // //                         <td colSpan={10}>
// // // //                           <div className="cl-expand-panel">
// // // //                             <div className="cl-expand-grid">
// // // //                               <div>
// // // //                                 <span className="detail-label">Description</span>
// // // //                                 <p>{skeleton.metadata?.description || '—'}</p>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="detail-label">Duration</span>
// // // //                                 <p>{skeleton.metadata?.durationMinutes || 0} min</p>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="detail-label">Tags</span>
// // // //                                 <p>
// // // //                                   {(skeleton.metadata?.tags || []).length
// // // //                                     ? skeleton.metadata.tags.map((t) => `#${t}`).join(' ')
// // // //                                     : '—'}
// // // //                                 </p>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="detail-label">Scheduled</span>
// // // //                                 <p>{formatDate(skeleton.timeline?.scheduledDate)}</p>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="detail-label">Deadline</span>
// // // //                                 <p>{formatDate(skeleton.timeline?.deadline)}</p>
// // // //                               </div>
// // // //                             </div>

// // // //                             <div className="cl-files-section">
// // // //                               <span className="detail-label">Uploaded Files</span>
// // // //                               {contents.length === 0 ? (
// // // //                                 <div className="cl-no-files">
// // // //                                   <span>No files uploaded</span>
// // // //                                   <button className="btn btn-sm btn-primary" onClick={() => openUpload(skeleton)}>
// // // //                                     Upload Content
// // // //                                   </button>
// // // //                                 </div>
// // // //                               ) : (
// // // //                                 <div className="cl-file-list">
// // // //                                   {contents.map((file) => {
// // // //                                     const kind = fileKind(file.mimeType);
// // // //                                     return (
// // // //                                       <div className="cl-file-item" key={file._id}>
// // // //                                         <span className="cl-file-icon">{kind.icon}</span>
// // // //                                         <div className="cl-file-meta">
// // // //                                           <span className="cl-file-name">{file.fileName}</span>
// // // //                                           <span className="cl-file-sub">
// // // //                                             {kind.label} · v{file.version} · {formatFileSize(file.fileSize)} · Uploaded by {file.uploadedBy?.name || 'Unknown'}
// // // //                                           </span>
// // // //                                         </div>
// // // //                                         <StatusBadge status={file.status} />
// // // //                                       </div>
// // // //                                     );
// // // //                                   })}
// // // //                                   <button className="btn btn-sm btn-secondary" onClick={() => openUpload(skeleton)}>
// // // //                                     + Upload another version
// // // //                                   </button>
// // // //                                 </div>
// // // //                               )}
// // // //                             </div>
// // // //                           </div>
// // // //                         </td>
// // // //                       </tr>
// // // //                     )}
// // // //                   </>
// // // //                 );
// // // //               })}
// // // //             </tbody>
// // // //           </table>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }










// // // // import { useState, useEffect } from 'react';
// // // // // import ContractsTable from './components/contractTable';
// // // // // import ContractsStats from './components/contractStats';
// // // // import { useDashboard } from "../../../hooks/useDashboard";
// // // // // import useContracts from './hooks/usecontract';
// // // // import ContentManager from './components/newcontent';
// // // // // import UpdateContractPage from './components/UpdateContractPage';


// // // // // import './contract.css';

// // // // export default function Content({ token }) {
// // // //   // const { contracts, loading, error } = useContracts();
// // // //   const [ShowContentManager, setShowContentManager] = useState(false);
// // // // //   const [showUpdatecontract, setShowUpdatecontract] = useState(false);
// // // // //   const [Updatecontractdata, setUpdatecontractdata] = useState(null);

// // // //     const {
// // // //         AllContentSkeletons = [],
// // // //         AllCourses = [],
// // // //         createContentSkeleton,
// // // //         createContent,

// // // //     } = useDashboard(token);



// // // // //   const [searchTerm, setSearchTerm] = useState('');
// // // // //   const [statusFilter, setStatusFilter] = useState('All');



// // // //     // if (ShowContentManager) {
// // // //       return (
// // // //         <ContentManager
// // // //           token={token}
// // // //           onBack={() => setShowContentManager(false)}
// // // //           AllContentSkeletons={AllContentSkeletons}
// // // //           AllCourses={AllCourses}
// // // //           createContentSkeleton={createContentSkeleton}
// // // //           createContent={createContent}
// // // //         />
// // // //       );


// // // // }