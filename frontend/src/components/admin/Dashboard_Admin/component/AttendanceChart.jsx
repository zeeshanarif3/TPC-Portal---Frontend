import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts';

import './AttendanceChart.css';

export default function Attendance_chart({
  data,
  currentWeekOnly = false,
}) {
  // if (!data?.length) return null;

  const chartData = (() => {
    let filtered = [...data];

    if (currentWeekOnly) {
      const today = new Date();

      const monday = new Date(today);
      const day = monday.getDay();
      const diff = day === 0 ? -6 : 1 - day;

      monday.setDate(monday.getDate() + diff);
      monday.setHours(0, 0, 0, 0);

      const friday = new Date(monday);
      friday.setDate(friday.getDate() + 4);
      friday.setHours(23, 59, 59, 999);

      filtered = filtered.filter((item) => {
        const d = new Date(item.date);
        return d >= monday && d <= friday;
      });
    } else {
      filtered = filtered.slice(0, 5);
    }

    return filtered.map((item) => ({
      ...item,
      day: new Date(item.date).toLocaleDateString('en-IN', {
        weekday: 'short',
      }),
      fullDate: new Date(item.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }));
  })();

  // if (!chartData.length) return null;


  if (!data || data.length === 0) {
  return (
    <div className="attendance-chart no-scrollbar">
        <div className="log">
      No Data Available
       </div>
      </div>
  );
}

  return (
    <div className="attendance-chart no-scrollbar">
      <div className="attendance-chart__header">
        <span className="attendance-chart__title">
          Daily Attendance
        </span>
      </div>

      <div className="attendance-chart__content">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 0,
              right: 8,
              left: 8,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="attendanceGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  // stopColor="#644f38"
                  stopColor="var(--accent)"
                  stopOpacity={0.10}
                />
                <stop
                  offset="100%"
                  stopColor="var(--accent)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              interval={0}
              padding={{ left: 10, right: 10 }}
              axisLine={false}
              tickLine={false}
              tickMargin={14}
              tick={{
                fontSize: 12,
                fill: 'var(--accent)',
              }}
            />

            <Tooltip
              cursor={false}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullDate ?? ''
              }
              formatter={(value) => [value, 'Attendance']}
              contentStyle={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                // boxShadow: '0 8px 20px rgba(0,0,0,.08)',
                padding: '8px 12px',
              }}
            />

            <Area
              type="natural"
              dataKey="count"
              stroke="var(--accent)"
              strokeWidth={2.75}
              fill="url(#attendanceGradient)"
              dot={false}
              activeDot={false}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   Tooltip,
// } from 'recharts';

// import './AttendanceChart.css';

// export default function Attendance_chart({ data }) {
//   if (!data?.length) return null;

//   const chartData = data.map((item) => ({
//     ...item,
//     day: new Date(item.date).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//     }),
//   }));

//   return (
//     <div className="attendance-chart">
//       <div className="attendance-chart__header">
//         <span className="attendance-chart__title">
//           Daily Attendance
//         </span>
//       </div>

//       <div className="attendance-chart__content">
//         <ResponsiveContainer width="100%" height={220}>
//           <AreaChart
//             data={chartData}
//             margin={{
//               top: 10,
//               right: 0,
//               left: -20,
//               bottom: 0,
//             }}
//           >
//             <defs>
//               <linearGradient
//                 id="attendanceGradient"
//                 x1="0"
//                 y1="0"
//                 x2="0"
//                 y2="1"
//               >
//                 <stop
//                   offset="0%"
//                   stopColor="#644f38"
//                   stopOpacity={0.18}
//                 />
//                 <stop
//                   offset="100%"
//                   stopColor="#644f38"
//                   stopOpacity={0}
//                 />
//               </linearGradient>
//             </defs>

//             <XAxis
//               dataKey="day"
//               axisLine={false}
//               tickLine={false}
//               tick={{
//                 fontSize: 12,
//                 fill: '#64748B',
//               }}
//             />

//             <Tooltip
//               cursor={false}
//               labelFormatter={(label) => `Date: ${label}`}
//               formatter={(value) => [value, 'Attendance']}
//               contentStyle={{
//                 border: 'none',
//                 borderRadius: '12px',
//                 boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
//               }}
//             />

//             <Area
//               type="monotone"
//               dataKey="count"
//               stroke="#644f38"
//               strokeWidth={3}
//               fill="url(#attendanceGradient)"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
// // import './AttendanceChart.css';

// // export default function AttendanceChart({
// //   college,
// //   selectedCourse,
// // //   onCourseChange
// // }) {
// //   if (!college) return null;

// //   const course =
// //     college.courses.find((c) => c.name === selectedCourse) ||
// //     college.courses[0];

// //   const attendance = course?.attendance || [];

// //   const max = Math.max(
// //     ...attendance.map((d) => d.value),
// //     1
// //   );

// //   return (
// //     <div className="attendance-chart">
// //       <div className="attendance-chart__header">
// //         <span className="attendance-chart__title">
// //           {college.college}
// //         </span>

// //         <select
// //           className="attendance-chart__action"
// //           value={course.name}
// //         //   onChange={(e) => onCourseChange(e.target.value)}
// //         >
// //           {college.courses.map((c) => (
// //             <option key={c.name} value={c.name}>
// //               {c.name}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       <div className="attendance-chart__bars">
// //         {attendance.map((d) => (
// //           <div
// //             key={d.day}
// //             className="attendance-chart__bar-group"
// //           >
// //             <div className="attendance-chart__bar-wrap">
// //               <div
// //                 className="attendance-chart__bar"
// //                 style={{
// //                   height: `${(d.value / max) * 100}%`
// //                 }}
// //               />
// //             </div>

// //             <span className="attendance-chart__day">
// //               {d.day}
// //             </span>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }







// // AttendanceChart.jsx
// // Lightweight bar chart — no external chart library needed.
// // Swap for Recharts/Chart.js if you prefer.
// // import './AttendanceChart.css';

// // export default function AttendanceChart({ data }) {
// //   if (!data || data.length === 0) return null;

// //   const max = Math.max(...data.map((d) => d.value));

// //   return (
// //     <div className="attendance-chart">
// //       <div className="attendance-chart__header">
// //         <span className="attendance-chart__title">Daily Attendance</span>
// //         {/* <button className="attendance-chart__action">Btech</button> */}
// //       </div>

// //       <div className="attendance-chart__bars">
        
// //         {data.map((d) => (
// //           <div key={d.day} className="attendance-chart__bar-group">
// //             <div className="attendance-chart__bar-wrap">
// //                 <span className="attendance-chart__value">
// //                   {d.value}
// //                 </span>
// //               <div
// //                 className="attendance-chart__bar"
// //                 style={{ height: `${(d.value / max) * 100}%` }}
// //               />
// //             </div>
// //             <span className="attendance-chart__day">{d.day}</span>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }