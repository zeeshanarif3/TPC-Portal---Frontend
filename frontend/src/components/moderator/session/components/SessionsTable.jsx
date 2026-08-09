// SessionsTable.jsx
import "./SessionsTable.css";
import {
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import useTable from "../../hook/useTable";

export default function SessionsTable({
  sessions = [],
  // onDelete,
  onRefresh,
  token,
  setShowUpdateSession,
  setSelectedSession,
}) {
  const getSessionStatus = (session) => {
    const today = new Date();
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);

    if (today < start) return "Upcoming";
    if (today > end) return "Completed";
    return "Active";
  };

  const {
    sortedData: sortedSessions,
    selected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSort,
    copyID,
  } = useTable(sessions, {
    id: (s) => s._id || "",
    college: (s) => s.collegeId?.name || "",
    start: (s) =>
      new Date(s.startDate || 0).getTime(),
    end: (s) =>
      new Date(s.endDate || 0).getTime(),
    courses: (s) => s.courseIds?.length || 0,
    status: (s) => getSessionStatus(s),
  });

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const shortId = (id) => {
    if (!id) return "—";
    return id.length > 10
      ? `${id.slice(0, 10)}...`
      : id;
  };

  const getCourseLabel = (course) => {
    if (!course) return "—";
    if (typeof course === "string")
      return course;

    return (
      course.courseCode ||
      course.name ||
      "—"
    );
  };

  const handleDelete = async (
    sessionId
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this session?"
      )
    )
      return;

    await onDelete?.(sessionId, token);
    onRefresh?.();
  };

  const handleBulkDelete =
    async () => {
      if (!selected.length) return;

      if (
        !window.confirm(
          `Delete ${selected.length} session${selected.length === 1
            ? ""
            : "s"
          }?`
        )
      )
        return;

      for (const id of selected) {
        await onDelete?.(id, token);
      }

      clearSelection();
      onRefresh?.();
    };

  return (
    <div className="sessions-table-container">
      {/* {selected.length > 0 && ( */}
        {/* // <div className="sessions-bulk-bar">
        //   <span>
        //     {selected.length} selected
        //   </span>

        //   <button
        //     className="btn-delete-selected"
        //     onClick={
        //       handleBulkDelete
        //     }
        //   >
        //     <Trash2 size={16} />
        //     Delete Selected
        //   </button> 
        // </div> */}
      {/* )} */}

      <table className="sessions-table">
        <thead>
          <tr>
            {/* <th>
              <input
                type="checkbox"
                checked={
                  sortedSessions.length >
                  0 &&
                  selected.length ===
                  sortedSessions.length
                }
                onChange={
                  selectAll
                }
              />
            </th> */}

            <th
              onClick={() =>
                toggleSort("id")
              }
            >
              SESSION ID
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort(
                  "college"
                )
              }
            >
              COLLEGE
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort(
                  "start"
                )
              }
            >
              START DATE
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort("end")
              }
            >
              END DATE
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort(
                  "courses"
                )
              }
            >
              COURSES
              <ArrowUpDown size={14} />
            </th>

            <th
              onClick={() =>
                toggleSort(
                  "status"
                )
              }
            >
              STATUS
              <ArrowUpDown size={14} />
            </th>

            {/* <th className="actions-column">
              ACTIONS
            </th> */}
          </tr>
        </thead>

        <tbody>
          {sortedSessions.map(
            (session) => {
              const status =
                getSessionStatus(
                  session
                );

              const courses =
                session.courseIds ||
                [];

              return (
                <tr
                  key={
                    session._id
                  }
                  className={
                    selected.includes(
                      session._id
                    )
                      ? "selected-row"
                      : ""
                  }
                >
                  {/* <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(
                        session._id
                      )}
                      onChange={() =>
                        toggleSelection(
                          session._id
                        )
                      }
                    />
                  </td> */}

                  <td className="session-id">
                    <span
                      title={
                        session._id
                      }
                    >
                      {shortId(
                        session._id
                      )}
                    </span>

                    <button
                      className="btn-copy"
                      onClick={() =>
                        copyID(
                          session._id
                        )
                      }
                    >
                      <Copy
                        size={14}
                      />
                    </button>
                  </td>

                  <td className="session-college">
                    {session
                      .collegeId
                      ?.name ||
                      "—"}
                  </td>

                  <td>
                    {formatDate(
                      session.startDate
                    )}
                  </td>

                  <td>
                    {formatDate(
                      session.endDate
                    )}
                  </td>

                  <td>
                    {courses.length >
                      0 ? (
                      <div className="session-courses">
                        {courses
                          .slice(
                            0,
                            2
                          )
                          .map(
                            (
                              course,
                              index
                            ) => (
                              <span
                                key={
                                  index
                                }
                                className="course-chip"
                              >
                                {getCourseLabel(
                                  course
                                )}
                              </span>
                            )
                          )}

                        {courses.length >
                          2 && (
                            <span className="course-chip course-more">
                              +
                              {courses.length -
                                2}{" "}
                              more
                            </span>
                          )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${status.toLowerCase()}`}
                    >
                      {status}
                    </span>
                  </td>
                  {/* 
                  <td className="session-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => {
                        setSelectedSession(
                          session
                        );
                        setShowUpdateSession(
                          true
                        );
                      }}
                    >
                      <Pencil />
                    </button>

                    <button
                      className="btn-action btn-delete"
                      onClick={() =>
                        handleDelete(
                          session._id
                        )
                      }
                    >
                      <Trash2 />
                    </button>
                  </td> */}
                </tr>
              );
            }
          )}
        </tbody>
      </table>

      {sessions.length ===
        0 && (
          <div className="no-data">
            <h3>
              No sessions
              found
            </h3>
            <p>
              Try changing
              the search or
              status filter.
            </p>
          </div>
        )}
    </div>
  );
}









// // SessionsTable.jsx
// import "./SessionsTable.css";
// import { Pencil, Trash2, Copy } from "lucide-react";

// export default function SessionsTable({
//   sessions = [],
//   onDelete,
//   onRefresh,
//   token,
//   setShowUpdateSession,
//   setSelectedSession,
// }) {
//   const getSessionStatus = (session) => {
//     const today = new Date();
//     const start = new Date(session.startDate);
//     const end = new Date(session.endDate);

//     if (today < start) return "Upcoming";
//     if (today > end) return "Completed";
//     return "Active";
//   };

//   const formatDate = (date) => {
//     if (!date) return "—";
//     return new Date(date).toLocaleDateString(undefined, {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const shortId = (id) => {
//     if (!id) return "—";
//     return id.length > 10 ? `${id.slice(0, 10)}...` : id;
//   };

//   const copyToClipboard = async (text) => {
//     try {
//       await navigator.clipboard.writeText(text);
//     } catch (error) {
//       console.error("Failed to copy:", error);
//     }
//   };

//   const handleDelete = async (sessionId) => {
//     if (
//       window.confirm("Are you sure you want to delete this session?")
//     ) {
//       if (onDelete) {
//         await onDelete(sessionId, token);
//       }

//       onRefresh?.();
//     }
//   };

//   const getCourseLabel = (course) => {
//     if (!course) return "—";
//     if (typeof course === "string") return course;
//     return course.courseCode || course.name || "—";
//   };

//   return (
//     <div className="sessions-table-container">
//       <table className="sessions-table">
//         <thead>
//           <tr>
//             <th>SESSION ID</th>
//             <th>COLLEGE</th>
//             <th>START DATE</th>
//             <th>END DATE</th>
//             <th>COURSES</th>
//             <th>STATUS</th>
//             <th className="actions-column">ACTIONS</th>
//           </tr>
//         </thead>

//         <tbody>
//           {sessions.map((session) => {
//             const status = getSessionStatus(session);
//             const courses = session.courseIds || [];

//             return (
//               <tr key={session._id}>
//                 <td className="session-id">
//                   <span title={session._id}>{shortId(session._id)}</span>

//                   <button
//                     className="btn-copy"
//                     title="Copy Session ID"
//                     onClick={() => copyToClipboard(session._id)}
//                   >
//                     <Copy size={14} />
//                   </button>
//                 </td>

//                 <td className="session-college">
//                   {session.collegeId?.name || "—"}
//                 </td>

//                 <td>{formatDate(session.startDate)}</td>

//                 <td>{formatDate(session.endDate)}</td>

//                 <td>
//                   {courses.length > 0 ? (
//                     <div className="session-courses">
//                       {courses.slice(0, 2).map((course, index) => (
//                         <span key={index} className="course-chip">
//                           {getCourseLabel(course)}
//                         </span>
//                       ))}

//                       {courses.length > 2 && (
//                         <span className="course-chip course-more">
//                           +{courses.length - 2} more
//                         </span>
//                       )}
//                     </div>
//                   ) : (
//                     "—"
//                   )}
//                 </td>

//                 <td>
//                   <span
//                     className={`status-badge status-${status.toLowerCase()}`}
//                   >
//                     {status}
//                   </span>
//                 </td>

//                 <td className="session-actions">
//                   <button
//                     className="btn-action btn-edit"
//                     // title={
//                     //   status === "Completed"
//                     //     ? "Completed sessions cannot be edited"
//                     //     : "Edit Session"
//                     // }
//                     // disabled={status === "Completed"}
//                     onClick={() => {
//                       setSelectedSession(session);
//                       setShowUpdateSession(true);
//                     }}
//                   >
//                     <Pencil />
//                   </button>

//                   <button
//                     className="btn-action btn-delete"
//                     title="Delete Session"
//                     onClick={() => handleDelete(session._id)}
//                   >
//                     <Trash2 />
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       {sessions.length === 0 && (
//         <div className="no-data">
//           <h3>No sessions found</h3>
//           <p>Try changing the search or status filter.</p>
//         </div>
//       )}
//     </div>
//   );
// }








// // import "./SessionsTable.css";

// // import {
// //   Eye,
// //   Pencil,
// //   Trash2,
// // } from "lucide-react";

// // export default function SessionsTable({
// //   sessions = [],
// //   onDelete,
// //   onRefresh,
// //   token,
// //   setShowUpdateSession,
// //   setSelectedSession,
// // }) {
// //   const getSessionStatus = (session) => {
// //     const today = new Date();
// //     const start = new Date(session.startDate);
// //     const end = new Date(session.endDate);

// //     if (today < start) return "Upcoming";
// //     if (today > end) return "Completed";
// //     return "Active";
// //   };

// //   const handleDelete = async (sessionId) => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to delete this session?"
// //       )
// //     ) {
// //       if (onDelete) {
// //         await onDelete(sessionId, token);
// //       }

// //       onRefresh?.();
// //     }
// //   };

// //   return (
// //     <div className="sessions-table-container">
// //       <table className="sessions-table">
// //         <thead>
// //           <tr>
// //             <th>SESSION ID</th>
// //             <th>COLLEGE</th>
// //             <th>START DATE</th>
// //             <th>END DATE</th>
// //             <th>COURSES</th>
// //             <th>STATUS</th>
// //             <th className="actions-column">
// //               ACTIONS
// //             </th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {sessions.map((session) => {
// //             const status = getSessionStatus(session);

// //             return (
// //               <tr key={session._id}>
// //                 <td className="session-id">
// //                   {session._id}
// //                 </td>

// //                 <td className="session-college">
// //                   {session.collegeId?.name || "—"}
// //                 </td>

// //                 <td>
// //                   {new Date(
// //                     session.startDate
// //                   ).toLocaleDateString()}
// //                 </td>

// //                 <td>
// //                   {new Date(
// //                     session.endDate
// //                   ).toLocaleDateString()}
// //                 </td>

// //                 <td>
// //                   {session.courseIds?.length || 0}
// //                 </td>

// //                 <td>
// //                   <span
// //                     className={`status-badge status-${status.toLowerCase()}`}
// //                   >
// //                     {status}
// //                   </span>
// //                 </td>

// //                 <td className="session-actions">
// //                   {/* <button
// //                     className="btn-action btn-view"
// //                     title="View Session"
// //                     onClick={() =>
// //                       (window.location.href = `/sessions/${session._id}`)
// //                     }
// //                   >
// //                     <Eye />
// //                   </button> */}

// //                   <button
// //                     className="btn-action btn-edit"
// //                     title="Edit Session"
// //                     onClick={() =>
// //                       {
// //                         setSelectedSession(session);
// //                         setShowUpdateSession(true);
// //                       }
// //                     }
// //                   >
// //                     <Pencil />
// //                   </button>

// //                   <button
// //                     className="btn-action btn-delete"
// //                     title="Delete Session"
// //                     onClick={() =>
// //                       handleDelete(session._id)
// //                     }
// //                   >
// //                     <Trash2 />
// //                   </button>
// //                 </td>
// //               </tr>
// //             );
// //           })}
// //         </tbody>
// //       </table>

// //       {sessions.length === 0 && (
// //         <div className="no-data">
// //           No sessions found
// //         </div>
// //       )}
// //     </div>
// //   );
// // }