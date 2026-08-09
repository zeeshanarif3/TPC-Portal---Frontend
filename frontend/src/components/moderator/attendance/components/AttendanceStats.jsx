import "./AttendanceStats.css";
import {
  Users,
  BookOpen,
  ClipboardList,
} from "lucide-react";

export default function AttendanceStats({ stats }) {
  const statistics = stats?.statistics || {};

  return (
    <section className="attendance-stats">
      <div className="attendance-card attendance-card--primary">
        <div className="attendance-card__header">
          <div className="attendance-card__icon">
            <Users size={18} />
          </div>

          <span className="attendance-card__title">
            Total Students
          </span>
        </div>

        <div className="attendance-card__value">
          {statistics.totalStudents ?? 0}
        </div>

        <div className="attendance-card__meta">
          Registered Students
        </div>
      </div>

      <div className="attendance-card">
        <div className="attendance-card__header">
          <div className="attendance-card__icon">
            <BookOpen size={18} />
          </div>

          <span className="attendance-card__title">
            Total Courses
          </span>
        </div>

        <div className="attendance-card__value">
          {statistics.totalCourses ?? 0}
        </div>

        <div className="attendance-card__meta">
          Active Courses
        </div>
      </div>

      <div className="attendance-card">
        <div className="attendance-card__header">
          <div className="attendance-card__icon">
            <ClipboardList size={18} />
          </div>

          <span className="attendance-card__title">
            Attendance Records
          </span>
        </div>

        <div className="attendance-card__value">
          {statistics.totalAttendanceRecords ?? 0}
        </div>

        <div className="attendance-card__meta">
          Total Records
        </div>
      </div>
    </section>
  );
}



// import "./AttendanceStats.css";
// import {
//   Users,
//   TrendingUp,
//   TriangleAlert,
// } from "lucide-react";

// export default function AttendanceStats({ stats }) {
//   return (
//     <section className="attendance-stats">

//       <div className="attendance-card attendance-card--primary">
//         <div className="attendance-card__header">
//           <div className="attendance-card__icon">
//             <Users size={18} />
//           </div>

//           <span className="attendance-card__title">
//             Attendance Today
//           </span>
//         </div>

//         <div className="attendance-card__value">
//           {stats.todayHeadcount}
//         </div>

//         <div className="attendance-card__meta">
//           {stats.sessionsToday} Sessions
//         </div>
//       </div>

//       <div className="attendance-card">
//         <div className="attendance-card__header">
//           <div className="attendance-card__icon">
//             <TrendingUp size={18} />
//           </div>

//           <span className="attendance-card__title">
//             Weekly Average
//           </span>
//         </div>

//         <div className="attendance-card__value">
//           {stats.weeklyAverage}%
//         </div>

//         <div className="attendance-card__meta">
//           Last 7 Days
//         </div>
//       </div>

//       <div className="attendance-card">
//         <div className="attendance-card__header">
//           <div className="attendance-card__icon">
//             <TriangleAlert size={18} />
//           </div>

//           <span className="attendance-card__title">
//             At Risk Subjects
//           </span>
//         </div>

//         <div className="attendance-card__value">
//           {stats.belowThreshold}
//         </div>

//         <div className="attendance-card__meta">
//           Below 75%
//         </div>
//       </div>

//     </section>
//   );
// }