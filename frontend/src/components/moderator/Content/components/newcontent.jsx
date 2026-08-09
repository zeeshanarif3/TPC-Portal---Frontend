import { useState, useEffect } from "react";

import "./newcontent.css";

const EMPTY_SKELETON = {
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
};

const EMPTY_CONTENT = {
    skeletonId: "",
    title: "",
    file: null,
};

export default function ContentManager(
    {
        token,
        mode = "skeleton",
        skeleton: activeSkeleton = null,
        onBack,
        AllContentSkeletons = [],
        AllCourses = [],
        createContentSkeleton,
        createContent,
    }
) {
    const [activeTab, setActiveTab] = useState(mode);

    // ----------------------------
    // Skeleton Form
    // ----------------------------

    const [skeleton, setSkeleton] = useState(EMPTY_SKELETON);
    const [savingSkeleton, setSavingSkeleton] = useState(false);

    // ----------------------------
    // Content Upload Form
    // ----------------------------

    const [content, setContent] = useState({
        ...EMPTY_CONTENT,
        skeletonId: activeSkeleton?._id || "",
    });
    const [savingContent, setSavingContent] = useState(false);
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        if (activeSkeleton?._id) {
            setContent((c) => ({ ...c, skeletonId: activeSkeleton._id }));
        }
    }, [activeSkeleton]);

    const skeletonList = Array.isArray(AllContentSkeletons)
        ? AllContentSkeletons
        : AllContentSkeletons?.data || [];

    // ----------------------------
    // Skeleton Submit
    // ----------------------------

    const handleSkeletonSubmit = async (e) => {
        e.preventDefault();
        setSavingSkeleton(true);

        try {
            await createContentSkeleton({
                ...skeleton,

                classNumber: Number(skeleton.classNumber),

                metadata: {
                    ...skeleton.metadata,
                    durationMinutes: Number(
                        skeleton.metadata.durationMinutes
                    ),
                    tags: skeleton.metadata.tags
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                },
            });

            setSkeleton(EMPTY_SKELETON);

            if (onBack) onBack();
        } catch (err) {
            alert(err.message);
        } finally {
            setSavingSkeleton(false);
        }
    };

    // ----------------------------
    // Content Submit
    // ----------------------------

    const handleContentSubmit = async (e) => {
        e.preventDefault();

        if (!content.skeletonId) {
            return alert("Select a skeleton to attach this file to");
        }

        if (!content.file) {
            return alert("Choose a file");
        }

        const fd = new FormData();

        fd.append("skeletonId", content.skeletonId);
        fd.append("title", content.title);
        fd.append("file", content.file);

        setSavingContent(true);

        try {
            await createContent(fd);

            setContent(EMPTY_CONTENT);
            setFileName("");

            if (onBack) onBack();
        } catch (err) {
            alert(err.message);
        } finally {
            setSavingContent(false);
        }
    };

    return (
        <div className="cm-wrap">
            <div className="cm-header">
                <button type="button" className="cm-back" onClick={onBack}>
                    ← Back
                </button>

                <div>
                    <h1>
                        {activeTab === "skeleton" ? "New Content Skeleton" : "Upload Content"}
                    </h1>
                    <p className="cm-subtitle">
                        {activeTab === "skeleton"
                            ? "Define a class placeholder before uploading its content."
                            : "Attach a file to an existing content skeleton."}
                    </p>
                </div>
            </div>

            <div className="cm-tabs">
                <button
                    type="button"
                    className={`cm-tab ${activeTab === "skeleton" ? "cm-tab-active" : ""}`}
                    onClick={() => setActiveTab("skeleton")}
                >
                    Create Skeleton
                </button>
                <button
                    type="button"
                    className={`cm-tab ${activeTab === "upload" ? "cm-tab-active" : ""}`}
                    onClick={() => setActiveTab("upload")}
                >
                    Upload Content
                </button>
            </div>

            {activeTab === "skeleton" && (
                <form className="cm-card" onSubmit={handleSkeletonSubmit}>
                    <div className="cm-section">
                        <h3>Basics</h3>
                        <div className="cm-grid">
                            <div className="cm-field cm-field-full">
                                <label>Title</label>
                                <input
                                    placeholder="e.g. Introduction to Arrays"
                                    value={skeleton.title}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="cm-field">
                                <label>Program</label>
                                <select
                                    value={skeleton.programId}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            programId: e.target.value,
                                        })
                                    }
                                    required
                                >
                                    <option value="">Select Program</option>

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
                                    value={skeleton.classNumber}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            classNumber: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="cm-field">
                                <label>Expected Format</label>
                                <select
                                    value={skeleton.expectedFormat}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            expectedFormat: e.target.value,
                                        })
                                    }
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="doc">DOC</option>
                                    <option value="video">VIDEO</option>
                                    <option value="link">LINK</option>
                                    <option value="live">LIVE</option>
                                </select>
                            </div>

                            <div className="cm-field">
                                <label>Status</label>
                                <select
                                    value={skeleton.status}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            status: e.target.value,
                                        })
                                    }
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
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
                                    value={skeleton.timeline.scheduledDate}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            timeline: {
                                                ...skeleton.timeline,
                                                scheduledDate: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div className="cm-field">
                                <label>Deadline</label>
                                <input
                                    type="date"
                                    value={skeleton.timeline.deadline}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            timeline: {
                                                ...skeleton.timeline,
                                                deadline: e.target.value,
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
                                    placeholder="e.g. Arrays"
                                    value={skeleton.metadata.topic}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            metadata: {
                                                ...skeleton.metadata,
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
                                    value={skeleton.metadata.durationMinutes}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            metadata: {
                                                ...skeleton.metadata,
                                                durationMinutes: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div className="cm-field cm-field-full">
                                <label>Description</label>
                                <textarea
                                    placeholder="Short description of this class"
                                    rows={3}
                                    value={skeleton.metadata.description}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            metadata: {
                                                ...skeleton.metadata,
                                                description: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div className="cm-field cm-field-full">
                                <label>Tags</label>
                                <input
                                    placeholder="comma separated, e.g. dsa, arrays, intro"
                                    value={skeleton.metadata.tags}
                                    onChange={(e) =>
                                        setSkeleton({
                                            ...skeleton,
                                            metadata: {
                                                ...skeleton.metadata,
                                                tags: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="cm-footer">
                        <button type="button" className="btn btn-secondary" onClick={onBack}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={savingSkeleton}>
                            {savingSkeleton ? "Creating…" : "Create Skeleton"}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === "upload" && (
                <form className="cm-card" onSubmit={handleContentSubmit}>
                    <div className="cm-section">
                        <h3>Attach File</h3>
                        <div className="cm-grid">
                            <div className="cm-field cm-field-full">
                                <label>Content Skeleton</label>
                                <select
                                    value={content.skeletonId}
                                    onChange={(e) =>
                                        setContent({
                                            ...content,
                                            skeletonId: e.target.value,
                                        })
                                    }
                                    required
                                >
                                    <option value="">Select Skeleton</option>

                                    {skeletonList.map((s) => (
                                        <option
                                            key={s._id}
                                            value={s._id}
                                        >
                                            Class {s.classNumber} — {s.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="cm-field cm-field-full">
                                <label>Content Title</label>
                                <input
                                    placeholder="e.g. DSA Reference Book"
                                    value={content.title}
                                    onChange={(e) =>
                                        setContent({
                                            ...content,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="cm-field cm-field-full">
                                <label>File</label>
                                <label className="cm-dropzone">
                                    <input
                                        type="file"
                                        className="cm-file-input"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setContent({
                                                ...content,
                                                file,
                                            });
                                            setFileName(file?.name || "");
                                        }}
                                        required
                                    />
                                    <span className="cm-dropzone-icon">📤</span>
                                    <span>
                                        {fileName ? fileName : "Click to choose a file, or drag it here"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="cm-footer">
                        <button type="button" className="btn btn-secondary" onClick={onBack}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={savingContent}>
                            {savingContent ? "Uploading…" : "Upload Content"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}












// import { useState } from "react";
// // import { useDashboard } from "../hooks/useDashboard";

// export default function ContentManager(
//     { 
//         token, 
//         AllContentSkeletons = [],
//         AllCourses = [],
//         createContentSkeleton,
//         createContent,
//     }
// ) {
//     // const {

//     // } = useDashboard(token);

//     // ----------------------------
//     // Skeleton Form
//     // ----------------------------

//     const [skeleton, setSkeleton] = useState({
//         title: "",
//         programId: "",
//         classNumber: 1,
//         expectedFormat: "pdf",
//         status: "draft",

//         timeline: {
//             scheduledDate: "",
//             deadline: "",
//         },

//         metadata: {
//             topic: "",
//             description: "",
//             tags: "",
//             durationMinutes: 0,
//         },
//     });

//     // ----------------------------
//     // Content Upload Form
//     // ----------------------------

//     const [content, setContent] = useState({
//         skeletonId: "",
//         title: "",
//         file: null,
//     });

//     // ----------------------------
//     // Skeleton Submit
//     // ----------------------------

//     const handleSkeletonSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             await createContentSkeleton({
//                 ...skeleton,

//                 classNumber: Number(skeleton.classNumber),

//                 metadata: {
//                     ...skeleton.metadata,
//                     durationMinutes: Number(
//                         skeleton.metadata.durationMinutes
//                     ),
//                     tags: skeleton.metadata.tags
//                         .split(",")
//                         .map((x) => x.trim())
//                         .filter(Boolean),
//                 },
//             });

//             alert("Skeleton Created");

//             setSkeleton({
//                 title: "",
//                 programId: "",
//                 classNumber: 1,
//                 expectedFormat: "pdf",
//                 status: "draft",

//                 timeline: {
//                     scheduledDate: "",
//                     deadline: "",
//                 },

//                 metadata: {
//                     topic: "",
//                     description: "",
//                     tags: "",
//                     durationMinutes: 0,
//                 },
//             });
//         } catch (err) {
//             alert(err.message);
//         }
//     };

//     // ----------------------------
//     // Content Submit
//     // ----------------------------

//     const handleContentSubmit = async (e) => {
//         e.preventDefault();

//         if (!content.file) {
//             return alert("Choose a file");
//         }

//         const fd = new FormData();

//         fd.append("skeletonId", content.skeletonId);
//         fd.append("title", content.title);
//         fd.append("file", content.file);

//         try {
//             await createContent(fd);

//             alert("Content Uploaded");

//             setContent({
//                 skeletonId: "",
//                 title: "",
//                 file: null,
//             });
//         } catch (err) {
//             alert(err.message);
//         }
//     };

//     return (
//         <div>

//             <h1>Create Content Skeleton</h1>

//             <form onSubmit={handleSkeletonSubmit}>

//                 <input
//                     placeholder="Title"
//                     value={skeleton.title}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             title: e.target.value,
//                         })
//                     }
//                 />

//                 <select
//                     value={skeleton.programId}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             programId: e.target.value,
//                         })
//                     }
//                 >
//                     <option value="">Select Program</option>

//                     {AllCourses.map((course) => (
//                         <option
//                             key={course._id}
//                             value={course._id}
//                         >
//                             {course.courseCode}
//                         </option>
//                     ))}
//                 </select>

//                 <input
//                     type="number"
//                     placeholder="Class Number"
//                     value={skeleton.classNumber}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             classNumber: e.target.value,
//                         })
//                     }
//                 />

//                 <select
//                     value={skeleton.expectedFormat}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             expectedFormat: e.target.value,
//                         })
//                     }
//                 >
//                     <option value="pdf">PDF</option>
//                     <option value="doc">DOC</option>
//                     <option value="video">VIDEO</option>
//                     <option value="link">LINK</option>
//                     <option value="live">LIVE</option>
//                 </select>

//                 <select
//                     value={skeleton.status}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             status: e.target.value,
//                         })
//                     }
//                 >
//                     <option value="draft">Draft</option>
//                     <option value="published">Published</option>
//                 </select>

//                 <h3>Timeline</h3>

//                 <input
//                     type="date"
//                     value={skeleton.timeline.scheduledDate}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             timeline: {
//                                 ...skeleton.timeline,
//                                 scheduledDate: e.target.value,
//                             },
//                         })
//                     }
//                 />

//                 <input
//                     type="date"
//                     value={skeleton.timeline.deadline}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             timeline: {
//                                 ...skeleton.timeline,
//                                 deadline: e.target.value,
//                             },
//                         })
//                     }
//                 />

//                 <h3>Metadata</h3>

//                 <input
//                     placeholder="Topic"
//                     value={skeleton.metadata.topic}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             metadata: {
//                                 ...skeleton.metadata,
//                                 topic: e.target.value,
//                             },
//                         })
//                     }
//                 />

//                 <textarea
//                     placeholder="Description"
//                     value={skeleton.metadata.description}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             metadata: {
//                                 ...skeleton.metadata,
//                                 description: e.target.value,
//                             },
//                         })
//                     }
//                 />

//                 <input
//                     placeholder="Tags (comma separated)"
//                     value={skeleton.metadata.tags}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             metadata: {
//                                 ...skeleton.metadata,
//                                 tags: e.target.value,
//                             },
//                         })
//                     }
//                 />

//                 <input
//                     type="number"
//                     placeholder="Duration (minutes)"
//                     value={skeleton.metadata.durationMinutes}
//                     onChange={(e) =>
//                         setSkeleton({
//                             ...skeleton,
//                             metadata: {
//                                 ...skeleton.metadata,
//                                 durationMinutes: e.target.value,
//                             },
//                         })
//                     }
//                 />

//                 <button type="submit">
//                     Create Skeleton
//                 </button>

//             </form>

//             <hr />

//             <h1>Upload Content</h1>

//             <form onSubmit={handleContentSubmit}>

//                 <select
//                     value={content.skeletonId}
//                     onChange={(e) =>
//                         setContent({
//                             ...content,
//                             skeletonId: e.target.value,
//                         })
//                     }
//                 >
//                     <option value="">Select Skeleton</option>

//                     {/* {AllContentSkeletons.map((s) => ( */}
//                     {(AllContentSkeletons?.data || []).map((s) => (
//                         <option
//                             key={s._id}
//                             value={s._id}
//                         >
//                             Class {s.classNumber} - {s.title}
//                         </option>
//                     ))}
//                 </select>

//                 <input
//                     placeholder="Content Title"
//                     value={content.title}
//                     onChange={(e) =>
//                         setContent({
//                             ...content,
//                             title: e.target.value,
//                         })
//                     }
//                 />

//                 <input
//                     type="file"
//                     onChange={(e) =>
//                         setContent({
//                             ...content,
//                             file: e.target.files[0],
//                         })
//                     }
//                 />

//                 <button type="submit">
//                     Upload Content
//                 </button>

//             </form>

//         </div>
//     );
// }