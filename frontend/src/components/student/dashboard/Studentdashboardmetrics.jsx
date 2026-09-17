import { useMemo } from "react";
import GeneralMetrics , { KPICard,YearTimeline, BarChart } from "../../ganaral_metrices/ Generalmetrics";
import { useStu } from "../../../hooks/useStu";
import "../../ganaral_metrices/Dashboardmetrics.css";
import './dash.css'
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";

export default function StudentDashboardMetrics({ token }) {
    const { myPerformance } = useStu(token);
    

    const attendance = useMemo(() => {
        const a = myPerformance?.data?.attendance;
        return {
            pct: a?.percentage ?? 0,
            present: a?.present ?? 0,
            totalClasses: a?.totalClasses ?? 0,
        };
    }, [myPerformance]);

    const performance = useMemo(() => {
        const p = myPerformance?.data?.assessments;
        return {
            avgPct: p?.averageScorePercent ?? 0,
            bestPct: p?.bestScorePercent ?? 0,
            totalAttempted: p?.totalAttempted ?? 0,
            submissions: p?.submissions ?? [],
        };
    }, [myPerformance]);

    const feedback = useMemo(() => {
        const records = myPerformance?.data?.feedback ?? [];
        const avgRating = records.length
            ? records.reduce((sum, f) => sum + (f.rating || 0), 0) / records.length
            : 0;
        return { records, avgPct: Math.round((avgRating / 5) * 100) };
    }, [myPerformance]);

    // Class participation = avg(test marks %, attendance %, feedback %)
    const participation = useMemo(() => {
        return Math.round((performance.avgPct + attendance.pct + feedback.avgPct) / 3);
    }, [performance.avgPct, attendance.pct, feedback.avgPct]);

    const currentYear = new Date().getFullYear();
    
    // No dated per-record data is available from /performance/me — attendance
    // and assessments only come back as aggregate totals. Until a dated
    // endpoint exists, treat the whole aggregate as a single "this year"
    // bucket rather than leaving these panels empty. This will misrepresent
    // data that actually spans multiple years.
    const yearlyTimeline = useMemo(() => {
        if (!myPerformance) return [];
        return [
            {
                year: currentYear,
                attendance: attendance.pct,
                performance: performance.avgPct,
                hours: attendance.present,
            },
        ];
    }, [myPerformance, attendance.pct, performance.avgPct, attendance.present]);
    
    const thisYearData = yearlyTimeline[0] || null;
    const loading = !myPerformance;
    
    
    
    
    if (loading) 
    
        return (
            <div className="performance-page">

                <div className="performance-loading">
                    <div className="loading-ring" />
                    <span>
                        Loading your performance...
                    </span>
                </div>

            </div>
        );
    return (
        <div className="metricsSection">


            <div className="topL">
                <div className="metricsGrid">
                    {/* <KPICard label="Attendance" value={attendance.pct} unit="%" /> */}
                    <KPICard label="Performance" value={performance.avgPct} unit="%" />
                    <KPICard label="Class participation" value={participation} unit="%" />
                    <KPICard label="Hours delivered" value={attendance.present} unit="hrs" />
                    {/* <KPICard label="Performance rating" value={performance.avgPct} unit="%" /> */}
                </div>

                {/* 
                                <div className="rightS"> */}


                {/* </div> */}
            <GeneralMetrics
                    hoursDelivered={attendance.present}
                    performanceAvg={performance.avgPct}
                    attendanceSeries={yearlyTimeline.map((y) => ({ label: y.year, value: y.attendance }))}
                    yearlyTimeline={yearlyTimeline}
                    thisYear={
                        thisYearData
                        ? {
                            attendance: thisYearData.attendance,
                            performance: thisYearData.performance,
                            feedback: feedback.avgPct,
                            hours: thisYearData.hours,
                        }
                        : null
                    }
                    />

                    {/* <div className="YearTimeCont">
                        <YearTimeline years={yearlyTimeline} />
                    </div>     */}


            
            </div>
            
            <div className="loweL">


                <BarChart
                    title="Feedback received"
                    meta={`${feedback.records.length} entries`}
                    data={feedback.records.slice(-8).map((f, i) => ({
                        label: new Date(f.date).toLocaleDateString("en-IN", { month: "short" }) || `#${i + 1}`,
                        value: Math.round(((f.rating || 0) / 5) * 100),
                    }))}
                    />
                {/* <div className="listCard">
                    <div className="chartCardHeader">
                        <span className="chartCardTitle">Assessment history</span>
                        <span className="chartCardMeta">{performance.totalAttempted} attempted</span>
                    </div>

                    {performance.submissions.length === 0 ? (
                        <div className="metricsEmpty">No assessments attempted yet</div>
                    ) : (
                        performance.submissions.map((s) => (
                            <div className="listRow" key={s.assessmentId}>
                                <div className="listRowMain">
                                    <span className="listRowTitle">{s.title}</span>
                                </div>
                                <span className={`listRowValue ${s.percentageScore >= 50 ? "pass" : "fail"}`}>
                                    {s.score}/{s.totalMarks} ({s.percentageScore}%)
                                </span>
                            </div>
                        ))
                    )}
                </div> */}

                <div className="listCard assessmentChartCard AssessmentPerformanceCont">
                    <div className="chartCardHeader">
                        <span className="chartCardTitle">Assessment performance</span>
                        <span className="chartCardMeta">
                            {performance.totalAttempted} attempted
                        </span>
                    </div>

                {performance.submissions.length === 0 ? (
                    <div className="metricsEmpty">No assessments attempted yet</div>
                ) : (
                    <>
                        <div className="assessmentPie">
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    {/* <Pie
                                        data={[
                                            {
                                                name: "Passed",
                                                value: performance.submissions.filter(
                                                    s => s.percentageScore >= 50
                                                ).length,
                                            },
                                            {
                                                name: "Failed",
                                                value: performance.submissions.filter(
                                                    s => s.percentageScore < 50
                                                ).length,
                                            },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={90}
                                        outerRadius={115}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell />
                                        <Cell />
                                    </Pie> */}

                                    <Pie
                                        data={[
                                            {
                                                name: "Passed",
                                                value: performance.submissions.filter(
                                                    s => s.percentageScore >= 50
                                                ).length,
                                            },
                                            {
                                                name: "Failed",
                                                value: performance.submissions.filter(
                                                    s => s.percentageScore < 50
                                                ).length,
                                            },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={90}
                                        outerRadius={115}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="var(--accent)" />
                                        <Cell fill="var(--text-primary)" />
                                        {/* <Cell fill="#22c55e" />
                                        <Cell fill="#ef4444" /> */}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [
                                            `${value} assessment${value !== 1 ? "s" : ""}`,
                                            name,
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="assessmentPieCenter">
                                <strong>{performance.totalAttempted}</strong>
                                <span>Attempts</span>
                            </div>
                        </div>

                        <div className="assessmentLegend">
                            <div className="legendItem">
                                <span className="legendDot passed"></span>
                                <span>Passed</span>
                                <strong>
                                    {
                                        performance.submissions.filter(
                                            s => s.percentageScore >= 50
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="legendItem">
                                <span className="legendDot failed"></span>
                                <span>Failed</span>
                                <strong>
                                    {
                                        performance.submissions.filter(
                                            s => s.percentageScore < 50
                                        ).length
                                    }
                                </strong>
                            </div>
                    </div>
                    </>
                )}
            </div>
        </div>
    </div>
    );
}










// import { useEffect, useMemo, useState } from "react";
// // import "./dashboardMetrics.css";
// import GeneralMetrics, { KPICard, BarChart } from "../../ganaral_metrices/ Generalmetrics";
// import { useStu } from "../../../hooks/useStu";
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
 
// function normalizeAttendance(raw) {
//     // These are real attendance records from /students/my/attendance, not
//     // Slot.status. Each entry should carry a per-student "present" flag
//     // (attendanceTaken/presentStudents on the backend). Do NOT fall back to
//     // slot.status === "completed" here — that measures whether the class
//     // happened, not whether this student showed up, and conflating the two
//     // was the bug in the previous version.
//     const records = Array.isArray(raw) ? raw : raw?.slots || raw?.data || [];
//     const presentCount = records.filter((r) => r.present === true).length;
//     const pct = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;
//     return { slots: records, pct };
// }
//  function normalizePerformance(raw) {
//     let submissions = [];

//     if (Array.isArray(raw)) {
//         submissions = raw;
//     } else if (Array.isArray(raw?.submissions)) {
//         submissions = raw.submissions;
//     } else if (Array.isArray(raw?.data)) {
//         submissions = raw.data;
//     } else if (Array.isArray(raw?.results)) {
//         submissions = raw.results;
//     } else if (raw?.submissions?.data && Array.isArray(raw.submissions.data)) {
//         submissions = raw.submissions.data;
//     }

//     const totalPct = submissions.reduce((sum, s) => {
//         const score = Number(s?.score ?? s?.marksObtained ?? 0);
//         const totalMarks = Number(s?.totalMarks ?? s?.maxMarks ?? 0);

//         const pct = totalMarks > 0
//             ? (score / totalMarks) * 100
//             : 0;

//         return sum + pct;
//     }, 0);

//     const avgPct = submissions.length > 0
//         ? Math.round(totalPct / submissions.length)
//         : 0;

//     return {
//         submissions,
//         avgPct,
//     };
// }
// // function normalizePerformance(raw) {
// //     const submissions = Array.isArray(raw) ? raw : raw?.submissions || raw?.data || [];
// //     const totalPct = submissions.reduce((sum, s) => {
// //         const pct = s.totalMarks > 0 ? (s.score / s.totalMarks) * 100 : 0;
// //         return sum + pct;
// //     }, 0);
// //     const avgPct = submissions.length > 0 ? Math.round(totalPct / submissions.length) : 0;
// //     return { submissions, avgPct };
// // }
 
// function normalizeFeedback(raw) {
//     const records = Array.isArray(raw) ? raw : raw?.feedback || raw?.data || [];
//     const avgRating =
//         records.length > 0
//             ? records.reduce((sum, f) => sum + (f.rating || 0), 0) / records.length
//             : 0;
//     return { records, avgPct: Math.round((avgRating / 5) * 100) };
// }
 
// /* group anything with a date/sessionId by calendar year */
// function groupByYear(items, getDate) {
//     const byYear = {};
//     items.forEach((item) => {
//         const d = new Date(getDate(item));
//         if (isNaN(d.getTime())) return;
//         const y = d.getFullYear();
//         if (!byYear[y]) byYear[y] = [];
//         byYear[y].push(item);
//     });
//     return byYear;
// }
 
// export default function StudentDashboardMetrics({ token }) {
//     const [attendance, setAttendance] = useState({ slots: [], pct: 0 });
//     const [performance, setPerformance] = useState({ submissions: [], avgPct: 0 });
//     const [feedback, setFeedback] = useState({ records: [], avgPct: 0 });
//     const [assessments, setAssessments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
 
//     useEffect(() => {
//         if (!token) return;
 
//         (async () => {
//             try {
//                 setLoading(true);
 
//                 const [attRaw, perfRaw, fbRaw, assessmentList] = await Promise.all([
//                     getJSON("/students/my/attendance", token),
//                     getJSON("/performance/me", token),
//                     getJSON("/feedback/me", token),
//                     getJSON("/assessments", token),
//                 ]);
 
//                 // Own submissions: no bulk endpoint, so pull per-assessment.
//                 // Fine at current scale; move to a batch endpoint if the
//                 // assessment list grows large.
//                 const list = Array.isArray(assessmentList)
//                     ? assessmentList
//                     : assessmentList?.assessments || [];
 
//                 const withSubmissions = await Promise.all(
//                     list.map(async (a) => {
//                         try {
//                             const sub = await getJSON(
//                                 `/assessments/${a._id}/submissions/me`,
//                                 token
//                             );
//                             return { assessment: a, submission: sub };
//                         } catch {
//                             return { assessment: a, submission: null };
//                         }
//                     })
//                 );
 
//                 setAttendance(normalizeAttendance(attRaw));
//                 setPerformance(normalizePerformance(perfRaw));
//                 setFeedback(normalizeFeedback(fbRaw));
//                 setAssessments(withSubmissions.filter((x) => x.submission));
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [token]);
 
//     // Class participation = avg(test marks %, attendance %, feedback %)
//     const participation = useMemo(() => {
//         return Math.round((performance.avgPct + attendance.pct + feedback.avgPct) / 3);
//     }, [performance.avgPct, attendance.pct, feedback.avgPct]);
 
//     // year-wise timeline, derived from attendance / submission dates
//     const yearlyTimeline = useMemo(() => {
//         const attByYear = groupByYear(attendance.slots, (r) => r.date);
//         const perfByYear = groupByYear(performance.submissions, (s) => s.submittedAt);
//         const years = Array.from(
//             new Set([...Object.keys(attByYear), ...Object.keys(perfByYear)])
//         ).sort();
 
//         return years.map((y) => {
//             const yAtt = attByYear[y] || [];
//             const presentCount = yAtt.filter((r) => r.present === true).length;
//             const attPct = yAtt.length ? Math.round((presentCount / yAtt.length) * 100) : 0;
 
//             const yPerf = perfByYear[y] || [];
//             const perfPct = yPerf.length
//                 ? Math.round(
//                       yPerf.reduce(
//                           (sum, s) => sum + (s.totalMarks > 0 ? (s.score / s.totalMarks) * 100 : 0),
//                           0
//                       ) / yPerf.length
//                   )
//                 : 0;
 
//             // "hours" here means classes attended, not hours delivered
//             // (that's a trainer-side concept) — kept as a count so the
//             // shared YearTimeline/ThisYearSummary widgets still render.
//             return { year: y, attendance: attPct, performance: perfPct, hours: presentCount };
//         });
//     }, [attendance.slots, performance.submissions]);
 
//     const currentYear = new Date().getFullYear();
//     const thisYearData = yearlyTimeline.find((y) => Number(y.year) === currentYear);
 
//     if (loading) return <div className="metricsLoading">Loading your dashboard…</div>;
//     if (error) return <div className="metricsEmpty">Couldn't load your dashboard: {error}</div>;
 
//     return (
//         <div className="metricsSection">
//             1<pre>{JSON.stringify(attendance, null, 2)}</pre>
//             2<pre>{JSON.stringify(performance, null, 2)}</pre>
//             3<pre>{JSON.stringify(feedback, null, 2)}</pre>
//             4<pre>{JSON.stringify(assessments, null, 2)}</pre>
//             <div className="metricsGrid">
//                 <KPICard label="Attendance" value={attendance.pct} unit="%" />
//                 <KPICard label="Performance" value={performance.avgPct} unit="%" />
//                 <KPICard label="Class participation" value={participation} unit="%" />
//             </div>
 
//             {/* GeneralMetrics' KPI is labeled "Hours delivered" — for a
//                 student this reads as classes attended, not delivered.
//                 Fine to reuse the component, just flagging the label. */}
//             <GeneralMetrics
//                 hoursDelivered={attendance.slots.filter((r) => r.present === true).length}
//                 performanceAvg={performance.avgPct}
//                 attendanceSeries={yearlyTimeline.map((y) => ({ label: y.year, value: y.attendance }))}
//                 yearlyTimeline={yearlyTimeline}
//                 thisYear={
//                     thisYearData
//                         ? {
//                               attendance: thisYearData.attendance,
//                               performance: thisYearData.performance,
//                               feedback: feedback.avgPct,
//                               hours: thisYearData.hours,
//                           }
//                         : null
//                 }
//             />
 
//             <BarChart
//                 title="Feedback received"
//                 meta={`${feedback.records.length} entries`}
//                 data={feedback.records.slice(-8).map((f, i) => ({
//                     label: new Date(f.date).toLocaleDateString("en-IN", { month: "short" }) || `#${i + 1}`,
//                     value: Math.round(((f.rating || 0) / 5) * 100),
//                 }))}
//             />
 
//             <div className="listCard">
//                 <div className="chartCardHeader">
//                     <span className="chartCardTitle">Assessment history</span>
//                     <span className="chartCardMeta">{assessments.length} attempted</span>
//                 </div>
 
//                 {assessments.length === 0 ? (
//                     <div className="metricsEmpty">No assessments attempted yet</div>
//                 ) : (
//                     assessments.map(({ assessment, submission }) => {
//                         const pct =
//                             submission.totalMarks > 0
//                                 ? Math.round((submission.score / submission.totalMarks) * 100)
//                                 : 0;
//                         return (
//                             <div className="listRow" key={assessment._id}>
//                                 <div className="listRowMain">
//                                     <span className="listRowTitle">{assessment.title}</span>
//                                     <span className="listRowSub">
//                                         {new Date(submission.submittedAt).toLocaleDateString("en-IN", {
//                                             day: "2-digit",
//                                             month: "short",
//                                             year: "numeric",
//                                         })}
//                                     </span>
//                                 </div>
//                                 <span className={`listRowValue ${pct >= 50 ? "pass" : "fail"}`}>
//                                     {submission.score}/{submission.totalMarks} ({pct}%)
//                                 </span>
//                             </div>
//                         );
//                     })
//                 )}
//             </div>
//         </div>
//     );
// }
 