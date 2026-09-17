import { useMemo } from "react";
import { useTrainer } from "../../../hooks/useTrainer";

import WeeklySlots from './component/WeeklySlots'
import WeeklySlotsDummy from './component/WeeklyDummy'
import GeneralMetrics, {
    KPICard,
    BarChart,
} from "../../ganaral_metrices/ Generalmetrics";

import "../../ganaral_metrices/Dashboardmetrics.css";

import './trainerDash.css'

function normalizeData(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
}


function groupByYear(slots) {
    const byYear = {};

    slots.forEach((slot) => {
        const date = new Date(slot.date);

        if (Number.isNaN(date.getTime())) return;

        const year = date.getFullYear();

        if (!byYear[year]) {
            byYear[year] = [];
        }

        byYear[year].push(slot);
    });

    return byYear;
}


export default function TrainerDashboardMetrics({
    token,
    trainerId,
    userId,
}) {
    const {
        AllSlots=[],
        // AllUpcommingSlots = [],
        AllFeedback = [],
    } = useTrainer(token);

    const AllUpcommingSlots = AllSlots;


    /* =========================================================
       NORMALIZE DATA
    ========================================================= */

    const slots = useMemo(
        () => normalizeData(AllUpcommingSlots),
        [AllUpcommingSlots]
    );

    const allFeedback = useMemo(
        () => normalizeData(AllFeedback),
        [AllFeedback]
    );


    /* =========================================================
       TRAINER FEEDBACK
    ========================================================= */

    const feedback = useMemo(() => {
        return allFeedback.filter((item) => {
            const feedbackTrainerId =
                item.trainerId?._id ||
                item.trainerId;

            return (
                !userId ||
                String(feedbackTrainerId) === String(userId)
            );
        });
    }, [allFeedback, userId]);


    /* =========================================================
       SLOT DATA
    ========================================================= */

    const mySlots = useMemo(() => {
        /*
         * AllUpcommingSlots is already trainer-specific in useTrainer,
         * so there is no need to filter using trainerId here.
         */
        return slots;
    }, [slots]);


    const activeSlots = useMemo(
        () =>
            mySlots.filter(
                (slot) => slot.status !== "cancelled"
            ),
        [mySlots]
    );


    const completedSlots = useMemo(
        () =>
            mySlots.filter(
                (slot) => slot.status === "completed"
            ),
        [mySlots]
    );


    /* =========================================================
       ATTENDANCE / COMPLETION
    ========================================================= */

    const attendancePct =
        activeSlots.length > 0
            ? Math.round(
                (completedSlots.length /
                    activeSlots.length) *
                100
            )
            : 0;


    /* =========================================================
       STUDENT PERFORMANCE
       
       No performance route is used here.
       Until performance data is exposed by a hook,
       this remains 0 instead of making a broken API request.
    ========================================================= */

    const studentPerf = [];


    const avgStudentPerf =
        studentPerf.length > 0
            ? Math.round(
                studentPerf.reduce(
                    (sum, student) =>
                        sum + student.avgPct,
                    0
                ) / studentPerf.length
            )
            : 0;


    /* =========================================================
       FEEDBACK RATING
    ========================================================= */

    const avgFeedbackGiven =
        feedback.length > 0
            ? Math.round(
                (feedback.reduce(
                    (sum, item) =>
                        sum +
                        (Number(item.rating) || 0),
                    0
                ) /
                    feedback.length /
                    5) *
                100
            )
            : 0;


    /* =========================================================
       YEARLY TIMELINE
    ========================================================= */

    const yearlyTimeline = useMemo(() => {
        const byYear = groupByYear(mySlots);

        return Object.keys(byYear)
            .sort()
            .map((year) => {
                const yearSlots = byYear[year];

                const active = yearSlots.filter(
                    (slot) =>
                        slot.status !== "cancelled"
                );

                const completed = yearSlots.filter(
                    (slot) =>
                        slot.status === "completed"
                );

                return {
                    year,

                    attendance:
                        active.length > 0
                            ? Math.round(
                                (completed.length /
                                    active.length) *
                                100
                            )
                            : 0,

                    performance:
                        studentPerf.length > 0
                            ? Math.round(
                                studentPerf.reduce(
                                    (sum, student) =>
                                        sum +
                                        student.avgPct,
                                    0
                                ) /
                                studentPerf.length
                            )
                            : 0,

                    hours: completed.length,
                };
            });
    }, [mySlots, studentPerf]);


    /* =========================================================
       CURRENT YEAR
    ========================================================= */

    const currentYear =
        new Date().getFullYear();

    const thisYearData =
        yearlyTimeline.find(
            (item) =>
                Number(item.year) === currentYear
        );


    /* =========================================================
       RENDER
    ========================================================= */
    
    const loading = !(AllUpcommingSlots&& feedback&&AllSlots&&completedSlots  &&yearlyTimeline &&attendancePct &&thisYearData);
    
                    
    if (loading) 
    
        return (
            <div className="performance-page">

                <div className="performance-loading">
                    <div className="loading-ring" />
                    <span>
                        Loading 
                    </span>
                </div>

            </div>
        );



    return (
        <div className="metricsSection">


            <div className="topL">


                <div className="metricsGrid">

                    <KPICard
                        label="Hours delivered"
                        value={completedSlots.length}
                        unit="hrs"
                    />

                    <KPICard
                        label="Attendance (own classes)"
                        value={attendancePct}
                        unit="%"
                    />

                    {/* <KPICard
                        label="Avg. student performance"
                        value={avgStudentPerf}
                        unit="%"
                    /> */}


                </div>


                <GeneralMetrics
                    hoursDelivered={completedSlots.length}
                    performanceAvg={avgStudentPerf}

                    attendanceSeries={yearlyTimeline.map(
                        (year) => ({
                            label: year.year,
                            value: year.attendance,
                        })
                    )}

                    yearlyTimeline={yearlyTimeline}

                    thisYear={
                        thisYearData
                            ? {
                                attendance:
                                    thisYearData.attendance,

                                performance:
                                    thisYearData.performance,

                                feedback:
                                    avgFeedbackGiven,

                                hours:
                                    thisYearData.hours,
                            }
                            : null
                    }
                />


            </div>


            <div className="trainerLowerRight">


                <BarChart
                    title="Feedback given"
                    meta={`${feedback.length} entries`}
                    data={feedback
                        .slice(-8)
                        .map((item, index) => ({
                            label: `#${index + 1}`,

                            value: Math.round(
                                ((Number(item.rating) || 0) /
                                    5) *
                                100
                            ),
                        }))}
                />
                <WeeklySlots slots={AllUpcommingSlots} />
            </div>

        </div>
    );
}












// import { useEffect, useMemo, useState } from "react";
// import { useTrainer } from "../../../hooks/useTrainer";
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

// function groupByYear(slots) {
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


// export default function TrainerDashboardMetrics({ token, trainerId, userId }) {
//     const { 
//         AllSlots = []
//     } = useTrainer(token);

//     const [feedback, setFeedback] = useState([]);
//     const [studentPerf, setStudentPerf] = useState([]); // [{ studentId, avgPct }]
//     const [contracts, setContracts] = useState(null); // null = not available yet
//     const [error, setError] = useState(null);

//     const mySlots = AllSlots
//     // const mySlots = useMemo(
//     //     () => AllSlots.filter((s) => (s.trainerId?._id || s.trainerId) === trainerId),
//     //     [AllSlots, trainerId]
//     // );

//     const activeSlots = mySlots.filter((s) => s.status !== "cancelled");
//     const completedSlots = mySlots.filter((s) => s.status === "completed");
//     const attendancePct =
//         activeSlots.length > 0
//             ? Math.round((completedSlots.length / activeSlots.length) * 100)
//             : 0;

//     useEffect(() => {
//         if (!token || !userId) return;

//         (async () => {
//             try {
//                 // Feedback authored by this trainer
//                 const fbRaw = await getJSON("/feedback", token);
//                 const allFeedback = Array.isArray(fbRaw) ? fbRaw : fbRaw?.data || [];
//                 const mine = allFeedback.filter(
//                     (f) => (f.trainerId?._id || f.trainerId) === userId
//                 );
//                 setFeedback(mine);

//                 // Performance of students this trainer has given feedback to.
//                 // There's no bulk "my students" endpoint today — this derives
//                 // the student list from feedback records as a stand-in. If
//                 // trainers regularly have students with no feedback yet,
//                 // this will undercount; a dedicated
//                 // GET /performance/students?trainerId= would be cleaner.
//                 const studentIds = Array.from(
//                     new Set(mine.map((f) => f.studentId?._id || f.studentId))
//                 );
//                 const perf = await Promise.all(
//                     studentIds.map(async (sid) => {
//                         try {
//                             const p = await getJSON(`/performance/${sid}`, token);
//                             const subs = Array.isArray(p) ? p : p?.submissions || [];
//                             const avgPct = subs.length
//                                 ? Math.round(
//                                       subs.reduce(
//                                           (sum, s) =>
//                                               sum + (s.totalMarks > 0 ? (s.score / s.totalMarks) * 100 : 0),
//                                           0
//                                       ) / subs.length
//                                   )
//                                 : 0;
//                             return { studentId: sid, avgPct };
//                         } catch {
//                             return { studentId: sid, avgPct: 0 };
//                         }
//                     })
//                 );
//                 setStudentPerf(perf);

//                 // Contracts: current /api/contracts routes are admin-only,
//                 // so this call will 403 until a trainer-scoped route (e.g.
//                 // GET /contracts/me) exists. Left in place so it lights up
//                 // automatically once that route is added.
//                 try {
//                     const c = await getJSON(`/contracts?trainerId=${trainerId}`, token);
//                     setContracts(Array.isArray(c) ? c : c?.data || []);
//                 } catch {
//                     setContracts(null);
//                 }
//             } catch (err) {
//                 setError(err.message);
//             }
//         })();
//     }, [token, userId, trainerId]);

//     const yearlyTimeline = useMemo(() => {
//         const byYear = groupByYear(mySlots);
//         return Object.keys(byYear)
//             .sort()
//             .map((y) => {
//                 const yearSlots = byYear[y];
//                 const active = yearSlots.filter((s) => s.status !== "cancelled");
//                 const done = yearSlots.filter((s) => s.status === "completed");
//                 return {
//                     year: y,
//                     attendance: active.length ? Math.round((done.length / active.length) * 100) : 0,
//                     performance:
//                         studentPerf.length > 0
//                             ? Math.round(
//                                   studentPerf.reduce((sum, s) => sum + s.avgPct, 0) / studentPerf.length
//                               )
//                             : 0,
//                     hours: done.length,
//                 };
//             });
//     }, [mySlots, studentPerf]);

//     const currentYear = new Date().getFullYear();
//     const thisYearData = yearlyTimeline.find((y) => Number(y.year) === currentYear);
//     const avgStudentPerf = studentPerf.length
//         ? Math.round(studentPerf.reduce((sum, s) => sum + s.avgPct, 0) / studentPerf.length)
//         : 0;
//     const avgFeedbackGiven = feedback.length
//         ? Math.round(
//               (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length / 5) * 100
//           )
//         : 0;

//     if (error) return <div className="metricsEmpty">Couldn't load trainer dashboard: {error}</div>;

//     return (
//         <div className="metricsSection">
//             <div className="metricsGrid">
//                 <KPICard label="Hours delivered" value={completedSlots.length} unit="hrs" />
//                 <KPICard label="Attendance (own classes)" value={attendancePct} unit="%" />
//                 <KPICard label="Avg. student performance" value={avgStudentPerf} unit="%" />
//             </div>

//             <GeneralMetrics
//                 hoursDelivered={completedSlots.length}
//                 performanceAvg={avgStudentPerf}
//                 attendanceSeries={yearlyTimeline.map((y) => ({ label: y.year, value: y.attendance }))}
//                 yearlyTimeline={yearlyTimeline}
//                 thisYear={
//                     thisYearData
//                         ? {
//                               attendance: thisYearData.attendance,
//                               performance: thisYearData.performance,
//                               feedback: avgFeedbackGiven,
//                               hours: thisYearData.hours,
//                           }
//                         : null
//                 }
//             />

//             <BarChart
//                 title="Feedback given"
//                 meta={`${feedback.length} entries`}
//                 data={feedback.slice(-8).map((f, i) => ({
//                     label: `#${i + 1}`,
//                     value: Math.round(((f.rating || 0) / 5) * 100),
//                 }))}
//             />

//             {/* <div className="listCard">
//                 <div className="chartCardHeader">
//                     <span className="chartCardTitle">Contracts</span>
//                 </div>
//                 {contracts === null ? (
//                     <div className="metricsEmpty">
//                         Contract details need a trainer-facing endpoint (current routes are admin-only)
//                     </div>
//                 ) : contracts.length === 0 ? (
//                     <div className="metricsEmpty">No contracts found</div>
//                 ) : (
//                     contracts.map((c) => (
//                         <div className="listRow" key={c._id}>
//                             <div className="listRowMain">
//                                 <span className="listRowTitle">
//                                     {c.sessionId?.collegeId?.name || "Session"}
//                                 </span>
//                                 <span className="listRowSub">
//                                     {new Date(c.startDate).toLocaleDateString("en-IN")} –{" "}
//                                     {new Date(c.endDate).toLocaleDateString("en-IN")}
//                                 </span>
//                             </div>
//                             <span className="listRowValue">{c.status}</span>
//                         </div>
//                     ))
//                 )}
//             </div> */}
//         </div>
//     );
// }