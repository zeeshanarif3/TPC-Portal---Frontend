// import './AttendanceChart.css';

// export default function AttendanceChart({
//   college,
//   selectedCourse,
// //   onCourseChange
// }) {
//   if (!college) return null;

//   const course =
//     college.courses.find((c) => c.name === selectedCourse) ||
//     college.courses[0];

//   const attendance = course?.attendance || [];

//   const max = Math.max(
//     ...attendance.map((d) => d.value),
//     1
//   );

//   return (
//     <div className="attendance-chart">
//       <div className="attendance-chart__header">
//         <span className="attendance-chart__title">
//           {college.college}
//         </span>

//         <select
//           className="attendance-chart__action"
//           value={course.name}
//         //   onChange={(e) => onCourseChange(e.target.value)}
//         >
//           {college.courses.map((c) => (
//             <option key={c.name} value={c.name}>
//               {c.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="attendance-chart__bars">
//         {attendance.map((d) => (
//           <div
//             key={d.day}
//             className="attendance-chart__bar-group"
//           >
//             <div className="attendance-chart__bar-wrap">
//               <div
//                 className="attendance-chart__bar"
//                 style={{
//                   height: `${(d.value / max) * 100}%`
//                 }}
//               />
//             </div>

//             <span className="attendance-chart__day">
//               {d.day}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }







// AttendanceChart.jsx
// Lightweight bar chart — no external chart library needed.
// Swap for Recharts/Chart.js if you prefer.
import './AttendanceChart.css';

export default function AttendanceChart({ data }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="attendance-chart">
      <div className="attendance-chart__header">
        <span className="attendance-chart__title">Daily Attendance</span>
        {/* <button className="attendance-chart__action">Btech</button> */}
      </div>

      <div className="attendance-chart__bars">
        {data.map((d) => (
          <div key={d.day} className="attendance-chart__bar-group">
            <div className="attendance-chart__bar-wrap">
              <div
                className="attendance-chart__bar"
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="attendance-chart__day">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}