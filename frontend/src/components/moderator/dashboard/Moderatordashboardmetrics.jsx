import { useEffect, useMemo, useState } from "react";
import { useModer } from "../../../hooks/useModer";

import GeneralMetrics, {
    KPICard,
    BarChart,
} from "../../ganaral_metrices/ Generalmetrics";
import "../../ganaral_metrices/Dashboardmetrics.css";

import './moderdash.css'


export const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_BASE = BASE_URL;

async function getJSON(path, token) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`${path} failed: ${res.status}`);
    }

    return res.json();
}

/*
 * Groups slots by year.
 */
function groupByYear(slots) {
    const byYear = {};

    slots.forEach((slot) => {
        const date = new Date(slot.date);

        if (isNaN(date.getTime())) return;

        const year = date.getFullYear();

        if (!byYear[year]) {
            byYear[year] = [];
        }

        byYear[year].push(slot);
    });

    return byYear;
}

/*
 * Calculate actual attendance from slots.
 *
 * Each slot contains:
 * attendanceTaken: true/false
 * presentStudents: [...]
 * headCount: number
 *
 * headCount represents the number of students present,
 * so presentStudents.length is also used as a fallback.
 */
function calculateAttendance(slots, allStudents) {
    const attendanceSlots = slots.filter(
        (slot) =>
            slot.status !== "cancelled" &&
            slot.attendanceTaken === true &&
            Array.isArray(slot.presentStudents)
    );

    if (!attendanceSlots.length || !allStudents.length) {
        return 0;
    }

    let totalPresent = 0;
    let totalExpected = 0;

    attendanceSlots.forEach((slot) => {
        const courseId =
            slot.courseId?._id || slot.courseId;

        if (!courseId) return;

        // Students belonging to this slot's course
        const courseStudents = allStudents.filter(
            (student) =>
                String(student.courseId?._id || student.courseId) ===
                String(courseId)
        );

        if (!courseStudents.length) return;

        const courseStudentIds = new Set(
            courseStudents.map((student) =>
                String(student._id)
            )
        );

        // Only count present students who actually belong
        // to this course.
        const present = slot.presentStudents.filter(
            (studentId) =>
                courseStudentIds.has(String(studentId))
        ).length;

        totalPresent += present;
        totalExpected += courseStudents.length;
    });

    if (!totalExpected) {
        return 0;
    }

    return Math.round(
        (totalPresent / totalExpected) * 100
    );
}
export default function ModeratorDashboardMetrics({ token }) {
    const {
        AllSessions = [],
        AllSlots = [],
        AllCourses = [],
        Allstudents = [],
    } = useModer(token);

    const [stats, setStats] = useState(null);

    // const [attendanceChart, setAttendanceChart] = useState([]);
    // const [subjectDistribution, setSubjectDistribution] = useState([]); 
    const [feedback, setFeedback] = useState([]);
    const [error, setError] = useState(null);




    // const attendanceChart = useMemo(() => {
    //     return AllSlots
    //         .filter(
    //             (slot) =>
    //                 slot.status !== "cancelled" &&
    //                 slot.attendanceTaken === true
    //         )
    //         .map((slot, index) => {
    //             const date = slot.date
    //                 ? new Date(slot.date).toLocaleDateString(
    //                     "en-IN",
    //                     {
    //                         day: "2-digit",
    //                         month: "short",
    //                     }
    //                 )
    //                 : "";

    //             const courseId =
    //                 slot.courseId?._id || slot.courseId;

    //             const course =
    //                 slot.courseId?.courseCode ||
    //                 "Unknown Course";

    //             // Find all students belonging to this course
    //             const courseStudents = Allstudents.filter(
    //                 (student) =>
    //                     String(
    //                         student.courseId?._id ||
    //                         student.courseId
    //                     ) === String(courseId)
    //             );

    //             const totalStudents = courseStudents.length;

    //             const courseStudentIds = new Set(
    //                 courseStudents.map((student) =>
    //                     String(student._id)
    //                 )
    //             );

    //             // Count only students from this course
    //             // who are present in the slot.
    //             const presentStudents = Array.isArray(
    //                 slot.presentStudents
    //             )
    //                 ? slot.presentStudents.filter((studentId) =>
    //                     courseStudentIds.has(String(studentId))
    //                 ).length
    //                 : 0;

    //             const percentage =
    //                 totalStudents > 0
    //                     ? Math.round(
    //                         (presentStudents /
    //                             totalStudents) *
    //                         100
    //                     )
    //                     : 0;

    //             return {
    //                 label: `${course} - ${date}`,
    //                 value: percentage,

    //                 // Useful if you want these later
    //                 present: presentStudents,
    //                 total: totalStudents,
    //             };
    //         });
    // }, [AllSlots, Allstudents]);


    const attendanceChart = useMemo(() => {
        return AllSlots
            .filter(
                (slot) =>
                    slot.status !== "cancelled" &&
                    slot.attendanceTaken === true
            )
            .map((slot) => {
                const dateLabel = slot.date
                    ? new Date(slot.date).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                        }
                    )
                    : "Unknown";

                const courseId =
                    slot.courseId?._id || slot.courseId;

                const courseStudents = Allstudents.filter(
                    (student) =>
                        String(
                            student.courseId?._id ||
                            student.courseId
                        ) === String(courseId)
                );

                const totalStudents = courseStudents.length;

                const courseStudentIds = new Set(
                    courseStudents.map((student) =>
                        String(student._id)
                    )
                );

                const presentStudents = Array.isArray(
                    slot.presentStudents
                )
                    ? slot.presentStudents.filter((studentId) =>
                        courseStudentIds.has(String(studentId))
                    ).length
                    : 0;

                const percentage =
                    totalStudents > 0
                        ? Math.round(
                            (presentStudents /
                                totalStudents) *
                            100
                        )
                        : 0;

                return {
                    label: dateLabel,
                    dateLabel,
                    course:
                        slot.courseId?.courseCode ||
                        "Unknown Course",
                    value: percentage,
                    present: presentStudents,
                    total: totalStudents,
                };
            });
    }, [AllSlots, Allstudents]);









    const subjectDistribution = useMemo(() => {
        const distribution = {};

        AllSlots
            .filter((slot) => slot.status !== "cancelled")
            .forEach((slot) => {
                const course =
                    slot.courseId?.courseCode ||
                    "Unknown Course";

                distribution[course] =
                    (distribution[course] || 0) + 1;
            });

        return Object.entries(distribution).map(
            ([label, value]) => ({
                label,
                value,
            })
        );
    }, [AllSlots]);

    useEffect(() => {
        if (!token) return;

        (async () => {
            try {
                const [statsRaw, fbRaw] = await Promise.all([
                    getJSON("/dashboard/stats", token),
                    getJSON("/feedback", token),
                ]);

                setStats(statsRaw);

                setFeedback(
                    Array.isArray(fbRaw)
                        ? fbRaw
                        : fbRaw?.data || []
                );
            } catch (err) {
                setError(err.message);
            }
        })();
    }, [token]);

    /*
     * ALL slots are considered here.
     *
     * Cancelled slots are ignored.
     * Slots without attendanceTaken=true are ignored for
     * actual attendance calculation.
     */
    // const attendancePct = useMemo(() => {
    //     return calculateAttendance(AllSlots);
    // }, [AllSlots]);
    const attendancePct = useMemo(() => {
        return calculateAttendance(
            AllSlots,
            Allstudents
        );
    }, [AllSlots, Allstudents]);
    /*
     * Completed slots are still useful for hours delivered.
     */
    const completedSlots = useMemo(() => {
        return AllSlots.filter(
            (slot) => slot.status === "completed"
        );
    }, [AllSlots]);

    /*
     * Feedback average.
     */
    const avgFeedbackPct = useMemo(() => {
        if (!feedback.length) {
            return 0;
        }

        const totalRating = feedback.reduce(
            (sum, f) => sum + (Number(f.rating) || 0),
            0
        );

        return Math.round(
            (totalRating / feedback.length / 5) * 100
        );
    }, [feedback]);

    /*
     * Yearly attendance.
     *
     * Uses ALL slots for that year and calculates actual
     * attendance from presentStudents.
     */
    const yearlyTimeline = useMemo(() => {
        const byYear = groupByYear(AllSlots);

        return Object.keys(byYear)
            .sort()
            .map((year) => {
                const yearSlots = byYear[year];

                // const attendance = calculateAttendance(yearSlots);
                const attendance = calculateAttendance(
                    yearSlots,
                    Allstudents
                );
                const completed = yearSlots.filter(
                    (slot) => slot.status === "completed"
                );

                return {
                    year,
                    attendance,
                    performance: 0,
                    hours: completed.length,
                };
            });
    }, [AllSlots, Allstudents]);

    const currentYear = new Date().getFullYear();

    const thisYearData = yearlyTimeline.find(
        (year) => Number(year.year) === currentYear
    );

    if (error) {
        return (
            <div className="metricsEmpty">
                Couldn't load moderator dashboard: {error}
            </div>
        );
    }

    return (
        <div className="metricsSection">
            {/* <pre>{JSON.stringify(Allstudents, null, 2)}</pre> */}
            <div className="topL">


                <div className="metricsGrid">

                    <KPICard
                        label="Total sessions"
                        value={
                            stats?.statistics?.totalSessions ?? "—"
                        }
                    />

                    <KPICard
                        label="Total courses"
                        value={
                            stats?.statistics?.totalCourses ?? "—"
                        }
                    />

                    <KPICard
                        label="Total students"
                        value={
                            stats?.statistics?.totalStudents ?? "—"
                        }
                    />

                    <KPICard
                        label="Total trainers"
                        value={
                            stats?.statistics?.totalTrainers ?? "—"
                        }
                    />

                    <KPICard
                        label="Active contracts"
                        value={
                            stats?.statistics?.activeContracts ?? "—"
                        }
                    />

                    {/* <KPICard
                    label="Attendance"
                    value={attendancePct}
                    unit="%"
                    /> */}

                </div>

                <GeneralMetrics
                    hoursDelivered={completedSlots.length}
                    performanceAvg={0}

                    attendanceSeries={yearlyTimeline.map((year) => ({
                        label: year.year,
                        value: year.attendance,
                    }))}

                    yearlyTimeline={yearlyTimeline}

                    thisYear={
                        thisYearData
                            ? {
                                attendance:
                                    thisYearData.attendance,

                                performance:
                                    thisYearData.performance,

                                feedback:
                                    avgFeedbackPct,

                                hours:
                                    thisYearData.hours,
                            }
                            : null
                    }
                />

            </div>
            <BarChart
                title="Attendance by session"
                data={attendanceChart.map((slot, index) => ({
                    label: slot.dateLabel || `S${index + 1}`,
                    value: slot.value ?? 0,
                }))}
            />
            {/* <BarChart
                title="Subject distribution"
                valueSuffix=""
                data={subjectDistribution.map((subject) => ({
                    label:
                        subject.courseCode ||
                        subject.subject ||
                        subject.label,

                    value:
                        subject.count ??
                        subject.value ??
                        0,
                }))}
            /> */}

        </div>
    );
}









// import { useEffect, useMemo, useState } from "react";
// import { useModer } from "../../../hooks/useModer";
// // import GeneralMetrics, { KPICard, BarChart } from "./GeneralMetrics";
// // import "./dashboardMetrics.css";

// // const API_BASE = "/api";


// import GeneralMetrics, { KPICard, BarChart } from "../../ganaral_metrices/ Generalmetrics";
// import "../../ganaral_metrices/Dashboardmetrics.css";


// export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// const API_BASE = BASE_URL; // adjust to match your axios instance / base url










// async function getJSON(path, token) {
//     const res = await fetch(`${API_BASE}${path}`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
//     return res.json();
// }

// function groupByYear(sessions, slots) {
//     const byYear = {};
//     slots.forEach((s) => {
//         const d = new Date(s.date);
//         if (isNaN(d.getTime())) return;
//         const y = d.getFullYear();
//         if (!byYear[y]) byYear[y] = [];
//         byYear[y].push(s);
//     });
//     return byYear;
// }

// export default function ModeratorDashboardMetrics({ token }) {
//     // Moderator token auto-scopes /dashboard/stats and /slots/* to their
//     // own college server-side, so no collegeId needs to be passed here.
//     const { 
//         AllSessions = [], 
//         AllSlots = [] 
//     } = useModer(token);

//     const [stats, setStats] = useState(null);
//     const [attendanceChart, setAttendanceChart] = useState([]);
//     const [subjectDistribution, setSubjectDistribution] = useState([]);
//     const [feedback, setFeedback] = useState([]);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         if (!token) return;

//         (async () => {
//             try {
//                 // const [statsRaw, chartRaw, distRaw, fbRaw] = await Promise.all([
//                 const [statsRaw, fbRaw] = await Promise.all([
//                     getJSON("/dashboard/stats", token),
//                     // getJSON("/slots/chart", token),
//                     // getJSON("/slots/distribution", token),
//                     getJSON("/feedback", token),
//                 ]);

//                 setStats(statsRaw);
//                 // setAttendanceChart(
//                 //     Array.isArray(chartRaw) ? chartRaw : chartRaw?.data || []
//                 // );
//                 // setSubjectDistribution(
//                 //     Array.isArray(distRaw) ? distRaw : distRaw?.data || []
//                 // );
//                 // NOTE: Feedback has no collegeId — it only links to
//                 // studentId/trainerId. Scoping this list to "students at my
//                 // college" needs a join against Student.courseId →
//                 // Course.collegeId (either here client-side, using
//                 // AllSessions'/AllSlots' course info, or better, server-side
//                 // in feedbackController). Left unscoped for now.
//                 setFeedback(Array.isArray(fbRaw) ? fbRaw : fbRaw?.data || []);
//             } catch (err) {
//                 setError(err.message);
//             }
//         })();
//     }, [token]);

//     const activeSlots = AllSlots.filter((s) => s.status !== "cancelled");
//     const completedSlots = AllSlots.filter((s) => s.status === "completed");
//     const attendancePct = activeSlots.length
//         ? Math.round((completedSlots.length / activeSlots.length) * 100)
//         : 0;
//     const avgFeedbackPct = feedback.length
//         ? Math.round(
//               (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length / 5) * 100
//           )
//         : 0;

//     const yearlyTimeline = useMemo(() => {
//         const byYear = groupByYear(AllSessions, AllSlots);
//         return Object.keys(byYear)
//             .sort()
//             .map((y) => {
//                 const yearSlots = byYear[y];
//                 const active = yearSlots.filter((s) => s.status !== "cancelled");
//                 const done = yearSlots.filter((s) => s.status === "completed");
//                 return {
//                     year: y,
//                     attendance: active.length ? Math.round((done.length / active.length) * 100) : 0,
//                     performance: 0, // needs a college-scoped performance aggregate, see below
//                     hours: done.length,
//                 };
//             });
//     }, [AllSessions, AllSlots]);

//     const currentYear = new Date().getFullYear();
//     const thisYearData = yearlyTimeline.find((y) => Number(y.year) === currentYear);

//     if (error) return <div className="metricsEmpty">Couldn't load moderator dashboard: {error}</div>;

//     return (
//         <div className="metricsSection">
//         <pre>{JSON.stringify(AllSlots, null, 2)}</pre>
//             <div className="metricsGrid">
//                 <KPICard label="Total sessions" value={stats?.statistics?.totalSessions ?? "—"} />
//                 <KPICard label="Total courses" value={stats?.statistics?.totalCourses ?? "—"} />
//                 <KPICard label="Total students" value={stats?.statistics?.totalStudents ?? "—"} />
//                 <KPICard label="Total trainers" value={stats?.statistics?.totalTrainers ?? "—"} />
//                 <KPICard label="Active contracts" value={stats?.statistics?.activeContracts ?? "—"} />
//                 <KPICard label="Attendance" value={attendancePct} unit="%" />
//             </div>

//             <GeneralMetrics
//                 hoursDelivered={completedSlots.length}
//                 performanceAvg={0}
//                 attendanceSeries={yearlyTimeline.map((y) => ({ label: y.year, value: y.attendance }))}
//                 yearlyTimeline={yearlyTimeline}
//                 thisYear={
//                     thisYearData
//                         ? {
//                               attendance: thisYearData.attendance,
//                               performance: thisYearData.performance,
//                               feedback: avgFeedbackPct,
//                               hours: thisYearData.hours,
//                           }
//                         : null
//                 }
//             />

//             <BarChart
//                 title="Attendance by session"
//                 data={attendanceChart.map((s, i) => ({
//                     label: s.label || s.sessionName || `S${i + 1}`,
//                     value: s.percentage ?? s.value ?? 0,
//                 }))}
//             />

//             <BarChart
//                 title="Subject distribution"
//                 valueSuffix=""
//                 data={subjectDistribution.map((s) => ({
//                     label: s.courseCode || s.subject || s.label,
//                     value: s.count ?? s.value ?? 0,
//                 }))}
//             />
//         </div>
//     );
// }