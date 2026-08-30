
import "./SessionCard.css";

export default function SessionCard({
  session,
  onClick,
  selected = false,
}) {
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={`session-card ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="session-card-header">
        <span className="session-college">
          {session?.collegeId?.name || "—"}
        </span>
      </div>

      <div className="session-courses">
        {session?.courseIds?.map((course) => (
          <span
            className="course-badge"
            key={course._id}
          >
            {course.courseCode}
          </span>
        ))}
      </div>

      <div className="session-dates">

        <div className="session-date">
          <span className="date-label">
            START DATE
          </span>

          <span className="date-value">
            {formatDate(session?.startDate)}
          </span>
        </div>

        <div className="date-line">
          <span />
        </div>

        <div className="session-date end">
          <span className="date-label">
            END DATE
          </span>

          <span className="date-value">
            {formatDate(session?.endDate)}
          </span>
        </div>

      </div>
    </div>
  );
}

// import "./SessionCard.css";

// export default function SessionCard({ session, onClick, selected = false, }) {
//   const formatDate = (date) => {
//     if (!date) return "—";

//     const parsedDate = new Date(date);

//     if (isNaN(parsedDate.getTime())) {
//       return "—";
//     }

//     return parsedDate.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   return (
//     <div className="session-card">
//       <div className="session-card-header">
//         {/* <span className="session-label">
//           SESSION
//         </span> */}

//         <span className="session-college">
//           {session?.collegeId?.name || "—"}
//         </span>
//       </div>


//       <div className="session-courses">
//         {session?.courseIds?.map((course) => (
//           <span
//             className="course-badge"
//             key={course._id}
//           >
//             {course.courseCode}
//           </span>
//         ))}
//       </div>


//       <div className="session-dates">

//         <div className="session-date">
//           <span className="date-label">
//             START DATE
//           </span>

//           <span className="date-value">
//             {formatDate(session?.startDate)}
//           </span>
//         </div>


//         <div className="date-line">
//           <span />
//         </div>


//         <div className="session-date end">
//           <span className="date-label">
//             END DATE
//           </span>

//           <span className="date-value">
//             {formatDate(session?.endDate)}
//           </span>
//         </div>

//       </div>

//     </div>
//   );
// }






// // import "./SessionCard.css";

// // export default function SessionCard({ session }) {
// //   const formatDate = (date) =>
// //     new Date(date).toLocaleDateString("en-IN", {
// //       day: "2-digit",
// //       month: "short",
// //       year: "numeric",
// //     });

// //   return (
// //     <div className="session-card">
// //       <div className="session-card-header">
// //         <span className="session-label">SESSION</span>

// //         <span className="session-college">
// //           {session.collegeId?.name}
// //         </span>
// //       </div>

// //       <div className="session-courses">
// //         {session.courseIds?.map((course) => (
// //           <span className="course-badge" key={course._id}>
// //             {course.courseCode}
// //           </span>
// //         ))}
// //       </div>

// //       <div className="session-dates">
// //         <div className="session-date">
// //           <span className="date-label">START DATE</span>
// //           <span className="date-value">
// //             {formatDate(session.startDate)}
// //           </span>
// //         </div>

// //         <div className="date-line">
// //           <span />
// //         </div>

// //         <div className="session-date end">
// //           <span className="date-label">END DATE</span>
// //           <span className="date-value">
// //             {formatDate(session.endDate)}
// //           </span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }