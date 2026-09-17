import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../../hooks/useDashboard";

import CollegeSelector from "../Dashboard_Admin/component/CollegeSelector";

import GeneralMetrics, {
    KPICard,
    BarChart,
} from "../../ganaral_metrices/ Generalmetrics";

import "../../ganaral_metrices/Dashboardmetrics.css";
import './Adash.css';


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

/* =========================================================
   HELPERS
========================================================= */

function getId(value) {
    if (!value) return null;

    if (typeof value === "object") {
        return value._id ? String(value._id) : null;
    }

    return String(value);
}

function groupByYear(slots) {
    const byYear = {};

    slots.forEach((slot) => {
        if (!slot?.date) return;

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

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminDashboardMetrics({ token }) {
    const {
        AllSessions = [],
        AllSlots = [],
        colleges = [],
        selectedCollege,
        setSelectedCollege,
        ExpContracts = []
        // AllFeedback=[]
    } = useDashboard(token);

    const [collegeStats, setCollegeStats] = useState([]);
    const [expiringContracts, setExpiringContracts] = useState([]);
    const [error, setError] = useState(null);

    /* =====================================================
       SYNC EXPIRING CONTRACTS
    ===================================================== */

    useEffect(() => {
        setExpiringContracts(
            Array.isArray(ExpContracts)
                ? ExpContracts
                : []
        );
    }, [ExpContracts]);

    /* =====================================================
       FETCH COLLEGE STATISTICS
    ===================================================== */

    useEffect(() => {
        if (!token || colleges.length === 0) {
            setCollegeStats([]);
            return;
        }

        let cancelled = false;

        const fetchCollegeStats = async () => {
            try {
                setError(null);

                const results = await Promise.all(
                    colleges.map(async (college) => {
                        try {
                            return await getJSON(
                                `/dashboard/stats?college=${college._id}`,
                                token
                            );
                        } catch (err) {
                            console.error(
                                `Failed to load stats for ${college?.name}`,
                                err
                            );

                            return null;
                        }
                    })
                );

                if (!cancelled) {
                    setCollegeStats(
                        results.filter(Boolean)
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            }
        };

        fetchCollegeStats();

        return () => {
            cancelled = true;
        };
    }, [token, colleges]);

    /* =====================================================
       SLOT STATUS
    ===================================================== */

    const activeSlots = useMemo(
        () =>
            AllSlots.filter(
                (slot) => slot?.status !== "cancelled"
            ),
        [AllSlots]
    );

    const completedSlots = useMemo(
        () =>
            AllSlots.filter(
                (slot) => slot?.status === "completed"
            ),
        [AllSlots]
    );

    /*
      NOTE:
      This is currently completion rate, not actual
      student attendance because slot status does not
      contain individual attendance records.
    */

    const completionPct = activeSlots.length
        ? Math.round(
              (completedSlots.length /
                  activeSlots.length) *
                  100
          )
        : 0;

    /* =====================================================
       ORGANIZATION TOTALS
    ===================================================== */

    const orgTotals = useMemo(() => {
        return collegeStats.reduce(
            (acc, college) => {
                const stats = college?.statistics || {};

                return {
                    totalSessions:
                        acc.totalSessions +
                        Number(stats.totalSessions || 0),

                    totalCourses:
                        acc.totalCourses +
                        Number(stats.totalCourses || 0),

                    totalStudents:
                        acc.totalStudents +
                        Number(stats.totalStudents || 0),

                    totalTrainers:
                        acc.totalTrainers +
                        Number(stats.totalTrainers || 0),

                    activeContracts:
                        acc.activeContracts +
                        Number(stats.activeContracts || 0),
                };
            },
            {
                totalSessions: 0,
                totalCourses: 0,
                totalStudents: 0,
                totalTrainers: 0,
                activeContracts: 0,
            }
        );
    }, [collegeStats]);

    /* =====================================================
       YEARLY TIMELINE
    ===================================================== */

    const yearlyTimeline = useMemo(() => {
        const byYear = groupByYear(AllSlots);

        return Object.keys(byYear)
            .sort((a, b) => Number(a) - Number(b))
            .map((year) => {
                const yearSlots = byYear[year];

                const active = yearSlots.filter(
                    (slot) =>
                        slot?.status !== "cancelled"
                );

                const completed = yearSlots.filter(
                    (slot) =>
                        slot?.status === "completed"
                );

                return {
                    year,

                    /*
                     * Currently completion rate.
                     * Replace with actual attendance aggregation
                     * when attendance records are available.
                     */
                    attendance: active.length
                        ? Math.round(
                              (completed.length /
                                  active.length) *
                                  100
                          )
                        : 0,

                    performance: 0,

                    hours: completed.length,
                };
            });
    }, [AllSlots]);

    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const currentYear = new Date().getFullYear();

    const thisYearData = useMemo(
        () =>
            yearlyTimeline.find(
                (item) =>
                    Number(item.year) === currentYear
            ),
        [yearlyTimeline, currentYear]
    );

    /* =====================================================
       GENERAL METRICS
    ===================================================== */

    const attendanceSeries = useMemo(
        () =>
            yearlyTimeline.map((item) => ({
                label: item.year,
                value: item.attendance,
            })),
        [yearlyTimeline]
    );

const generalMetricsThisYear = thisYearData
    ? {
          attendance: thisYearData.attendance,
          performance: thisYearData.performance,
          feedback: 0,
          hours: thisYearData.hours,
      }
    : null;

    /* =====================================================
       ATTENDANCE / COMPLETION BY COLLEGE
       
       IMPORTANT:
       AllSlots.sessionId only contains the session ID.
       We therefore find that session inside AllSessions
       and get its collegeId from there.
    ===================================================== */

    const attendanceByCollege = useMemo(() => {
        return collegeStats.map((collegeStat) => {
            const collegeId = getId(
                collegeStat?.college?._id
            );

            if (!collegeId) {
                return {
                    label:
                        collegeStat?.college?.name ||
                        "—",
                    value: 0,
                };
            }

            /* Find sessions belonging to this college */

            const collegeSessions = AllSessions.filter(
                (session) => {
                    const sessionCollegeId = getId(
                        session?.collegeId
                    );

                    return (
                        sessionCollegeId ===
                        collegeId
                    );
                }
            );

            /* Create session ID lookup */

            const collegeSessionIds = new Set(
                collegeSessions
                    .map((session) =>
                        getId(session?._id)
                    )
                    .filter(Boolean)
            );

            /* Find slots belonging to those sessions */

            const collegeSlots = AllSlots.filter(
                (slot) => {
                    const sessionId = getId(
                        slot?.sessionId
                    );

                    return collegeSessionIds.has(
                        sessionId
                    );
                }
            );

            const active = collegeSlots.filter(
                (slot) =>
                    slot?.status !== "cancelled"
            );

            const completed = collegeSlots.filter(
                (slot) =>
                    slot?.status === "completed"
            );

            const value = active.length
                ? Math.round(
                      (completed.length /
                          active.length) *
                          100
                  )
                : 0;

            return {
                label:
                    collegeStat?.college?.name ||
                    "—",
                value,
            };
        });
    }, [
        collegeStats,
        AllSessions,
        AllSlots,
    ]);





    
    /* =====================================================
       loading
    ===================================================== */




    // const loading = !myPerformance;
    const loading = !( AllSessions && AllSlots&&colleges&&ExpContracts && completedSlots &&attendanceSeries &&yearlyTimeline &&generalMetricsThisYear && attendanceByCollege && orgTotals );
    
                    
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

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {
        return (
            <div className="metricsEmpty">
                Couldn't load admin dashboard: {error}
            </div>
        );
    }

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="metricsSection">
            {/* coll
            <pre>{JSON.stringify(AllFeedback, null, 2)}</pre> */}
            {/* completedSlots
            <pre>{JSON.stringify(completedSlots, null, 2)}</pre> */}
            {/* attendanceSeries
            <pre>{JSON.stringify(attendanceSeries, null, 2)}</pre> */}
            {/* yearlyTimeline
            <pre>{JSON.stringify(yearlyTimeline, null, 2)}</pre> */}
            {/* generalMetricsThisYear
            <pre>{JSON.stringify(generalMetricsThisYear, null, 2)}</pre> */}
            {/* attendanceByCollege
            <pre>{JSON.stringify(attendanceByCollege, null, 2)}</pre> */}
            {/* orgTotals
            <pre>{JSON.stringify(orgTotals, null, 2)}</pre> */}


            {/* <div className="right">
                <CollegeSelector
                    colleges={colleges}
                    selected={selectedCollege}
                    onSelect={setSelectedCollege}
                />
            </div> */}

            <div className="adminTopL">


                <div className="adminmetricsGrid">

                    <KPICard
                        label="Colleges"
                        value={colleges.length}
                    />

                    <KPICard
                        label="Sessions"
                        value={orgTotals.totalSessions}
                    />

                    <KPICard
                        label="Courses"
                        value={orgTotals.totalCourses}
                    />

                    <KPICard
                        label="Students"
                        value={orgTotals.totalStudents}
                    />

                    <KPICard
                        label="Trainers"
                        value={orgTotals.totalTrainers}
                    />

                    <KPICard
                        label="Active contracts"
                        value={orgTotals.activeContracts}
                    />

                    {/* <KPICard
                        label="Attendance"
                        value={completionPct}
                        unit="%"
                    /> */}

                </div>

                <div className="adminRight">
                    
                    <GeneralMetrics
                        hoursDelivered={completedSlots.length}
                        performanceAvg={0}
                        attendanceSeries={attendanceSeries}
                        yearlyTimeline={yearlyTimeline}
                        thisYear={generalMetricsThisYear}
                        />

                    <BarChart
                        title="Attendance by college"
                        data={attendanceByCollege}
                        />
                </div>
            </div>



            {/* ================= EXPIRING CONTRACTS ================= */}

            {/* <div className="listCard">

                <div className="chartCardHeader">

                    <span className="chartCardTitle">
                        Contracts expiring soon
                    </span>

                    <span className="chartCardMeta">
                        {expiringContracts.length}
                    </span>

                </div>

                {expiringContracts.length === 0 ? (
                    <div className="metricsEmpty">
                        No contracts expiring soon
                    </div>
                ) : (
                    expiringContracts.map(
                        (contract) => (
                            <div
                                className="listRow"
                                key={contract?._id}
                            >

                                <div className="listRowMain">

                                    <span className="listRowTitle">
                                        {contract
                                            ?.sessionId
                                            ?.collegeId
                                            ?.name ||
                                            "Session"}
                                    </span>

                                    <span className="listRowSub">
                                        Trainer:{" "}
                                        {contract
                                            ?.trainerId
                                            ?.name ||
                                            "—"}
                                    </span>

                                </div>

                                <span className="listRowValue">
                                    {contract?.endDate
                                        ? new Date(
                                              contract.endDate
                                          ).toLocaleDateString(
                                              "en-IN"
                                          )
                                        : "—"}
                                </span>

                            </div>
                        )
                    )
                )}

            </div> */}

        </div>
    );
}















// import { useEffect, useMemo, useState } from "react";
// import { useDashboard } from "../../../hooks/useDashboard";

// import CollegeSelector from "../Dashboard_Admin/component/CollegeSelector";

// import GeneralMetrics, {
//     KPICard,
//     BarChart,
// } from "../../ganaral_metrices/ Generalmetrics";

// import "../../ganaral_metrices/Dashboardmetrics.css";

// export const BASE_URL =
//     import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// const API_BASE = BASE_URL;

// async function getJSON(path, token) {
//     console.log("========================================");
//     console.log("🌐 API REQUEST");
//     console.log("Path:", path);
//     console.log("API_BASE:", API_BASE);
//     console.log("Full URL:", `${API_BASE}${path}`);
//     console.log("Token exists:", !!token);

//     const res = await fetch(`${API_BASE}${path}`, {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     });

//     console.log("📡 API RESPONSE");
//     console.log("Path:", path);
//     console.log("Status:", res.status);
//     console.log("OK:", res.ok);

//     if (!res.ok) {
//         console.error("❌ API FAILED:", path, res.status);
//         throw new Error(`${path} failed: ${res.status}`);
//     }

//     const data = await res.json();

//     console.log("📦 API DATA:", data);
//     console.log("========================================");

//     return data;
// }

// function groupByYear(slots) {
//     console.log("🗓️ groupByYear INPUT:", slots);

//     const byYear = {};

//     slots.forEach((s, index) => {
//         console.log(`Slot ${index}:`, s);
//         console.log(`Slot ${index} date:`, s?.date);

//         const d = new Date(s.date);

//         if (isNaN(d.getTime())) {
//             console.warn("⚠️ INVALID DATE:", {
//                 index,
//                 date: s?.date,
//                 slot: s,
//             });

//             return;
//         }

//         const y = d.getFullYear();

//         if (!byYear[y]) {
//             byYear[y] = [];
//         }

//         byYear[y].push(s);
//     });

//     console.log("🗓️ groupByYear OUTPUT:", byYear);

//     return byYear;
// }

// export default function AdminDashboardMetrics({ token }) {
//     const {
//         AllSessions = [],
//         AllSlots = [],
//         colleges = [],
//         selectedCollege,
//         setSelectedCollege,
//         ExpContracts,
//     } = useDashboard(token);

//     const [collegeStats, setCollegeStats] = useState([]);
//     const [expiringContracts, setExpiringContracts] = useState([]);
//     const [error, setError] = useState(null);

//     /*
//     ==================================================
//     🔥 MAIN DASHBOARD DATA DEBUG
//     ==================================================
//     */

//     useEffect(() => {
//         console.log("========================================");
//         console.log("🔥 ADMIN DASHBOARD DATA");
//         console.log("========================================");

//         console.log("Token:", token);
//         console.log("Token exists:", !!token);

//         console.log("AllSessions:", AllSessions);
//         console.log("AllSessions length:", AllSessions?.length);

//         console.log("AllSlots:", AllSlots);
//         console.log("AllSlots length:", AllSlots?.length);

//         console.log("Colleges:", colleges);
//         console.log("Colleges length:", colleges?.length);

//         console.log("Selected College:", selectedCollege);

//         console.log("ExpContracts:", ExpContracts);
//         console.log(
//             "ExpContracts length:",
//             Array.isArray(ExpContracts)
//                 ? ExpContracts.length
//                 : "NOT AN ARRAY"
//         );

//         console.log("========================================");
//     }, [
//         token,
//         AllSessions,
//         AllSlots,
//         colleges,
//         selectedCollege,
//         ExpContracts,
//     ]);

//     /*
//     ==================================================
//     🔥 LOG EVERY SLOT
//     ==================================================
//     */

//     useEffect(() => {
//         console.log("========================================");
//         console.log("📚 ALL SLOTS DETAILED DEBUG");
//         console.log("Total Slots:", AllSlots.length);

//         AllSlots.forEach((slot, index) => {
//             console.group(`SLOT ${index}`);

//             console.log("Full Slot:", slot);

//             console.log("_id:", slot?._id);
//             console.log("status:", slot?.status);
//             console.log("date:", slot?.date);

//             console.log("sessionId:", slot?.sessionId);
//             console.log(
//                 "sessionId type:",
//                 typeof slot?.sessionId
//             );

//             console.log(
//                 "sessionId.collegeId:",
//                 slot?.sessionId?.collegeId
//             );

//             console.log(
//                 "collegeId._id:",
//                 slot?.sessionId?.collegeId?._id
//             );

//             console.log(
//                 "collegeId.name:",
//                 slot?.sessionId?.collegeId?.name
//             );

//             console.groupEnd();
//         });

//         console.log("========================================");
//     }, [AllSlots]);

//     /*
//     ==================================================
//     🔥 FETCH COLLEGE STATS
//     ==================================================
//     */

//     useEffect(() => {
//         console.log("========================================");
//         console.log("🏫 COLLEGE STATS FETCH EFFECT");

//         console.log("Token exists:", !!token);
//         console.log("Colleges:", colleges);
//         console.log("Colleges length:", colleges.length);

//         if (!token) {
//             console.warn("⚠️ STOPPED: No token");
//             return;
//         }

//         if (colleges.length === 0) {
//             console.warn("⚠️ STOPPED: No colleges yet");
//             return;
//         }

//         (async () => {
//             try {
//                 console.log("🚀 Starting college stats requests...");

//                 const results = await Promise.all(
//                     colleges.map(async (c, index) => {
//                         try {
//                             console.group(
//                                 `🏫 COLLEGE ${index} API DEBUG`
//                             );

//                             console.log("College object:", c);
//                             console.log("College ID:", c?._id);
//                             console.log("College Name:", c?.name);

//                             const stats = await getJSON(
//                                 `/dashboard/stats?college=${c._id}`,
//                                 token
//                             );

//                             console.log(
//                                 "RAW STATS RESPONSE:",
//                                 stats
//                             );

//                             console.log(
//                                 "stats.college:",
//                                 stats?.college
//                             );

//                             console.log(
//                                 "stats.statistics:",
//                                 stats?.statistics
//                             );

//                             console.log(
//                                 "totalSessions:",
//                                 stats?.statistics?.totalSessions
//                             );

//                             console.log(
//                                 "totalCourses:",
//                                 stats?.statistics?.totalCourses
//                             );

//                             console.log(
//                                 "totalStudents:",
//                                 stats?.statistics?.totalStudents
//                             );

//                             console.log(
//                                 "totalTrainers:",
//                                 stats?.statistics?.totalTrainers
//                             );

//                             console.log(
//                                 "activeContracts:",
//                                 stats?.statistics?.activeContracts
//                             );

//                             console.groupEnd();

//                             return stats;
//                         } catch (err) {
//                             console.error(
//                                 `❌ FAILED FOR COLLEGE ${c?.name}`,
//                                 err
//                             );

//                             return null;
//                         }
//                     })
//                 );

//                 console.log("========================================");
//                 console.log("📊 ALL COLLEGE RESULTS:", results);

//                 const validResults = results.filter(Boolean);

//                 console.log(
//                     "📊 VALID COLLEGE RESULTS:",
//                     validResults
//                 );

//                 console.log(
//                     "📊 VALID RESULTS LENGTH:",
//                     validResults.length
//                 );

//                 setCollegeStats(validResults);

//                 console.log(
//                     "📜 SETTING EXPIRING CONTRACTS:",
//                     ExpContracts
//                 );

//                 setExpiringContracts(
//                     Array.isArray(ExpContracts)
//                         ? ExpContracts
//                         : []
//                 );

//                 console.log("========================================");
//             } catch (err) {
//                 console.error(
//                     "❌ COLLEGE STATS MAIN ERROR:",
//                     err
//                 );

//                 setError(err.message);
//             }
//         })();
//     }, [token, colleges, ExpContracts]);

//     /*
//     ==================================================
//     🔥 ACTIVE / COMPLETED SLOTS
//     ==================================================
//     */

//     const activeSlots = AllSlots.filter(
//         (s) => s.status !== "cancelled"
//     );

//     const completedSlots = AllSlots.filter(
//         (s) => s.status === "completed"
//     );

//     const attendancePct = activeSlots.length
//         ? Math.round(
//               (completedSlots.length / activeSlots.length) * 100
//           )
//         : 0;

//     useEffect(() => {
//         console.log("========================================");
//         console.log("📈 ATTENDANCE DEBUG");

//         console.log("AllSlots:", AllSlots.length);

//         console.log(
//             "Active Slots:",
//             activeSlots.length,
//             activeSlots
//         );

//         console.log(
//             "Completed Slots:",
//             completedSlots.length,
//             completedSlots
//         );

//         console.log(
//             "Attendance Percentage:",
//             attendancePct
//         );

//         console.log(
//             "All statuses:",
//             AllSlots.map((s) => s?.status)
//         );

//         console.log("========================================");
//     }, [AllSlots, attendancePct]);

//     /*
//     ==================================================
//     🔥 ORGANIZATION TOTALS
//     ==================================================
//     */

//     const orgTotals = useMemo(() => {
//         console.log("========================================");
//         console.log("🏢 ORG TOTALS DEBUG");
//         console.log("collegeStats INPUT:", collegeStats);

//         const totals = collegeStats.reduce(
//             (acc, c, index) => {
//                 console.group(`College Stats ${index}`);

//                 console.log("Full college stats:", c);
//                 console.log("College:", c?.college);
//                 console.log("Statistics:", c?.statistics);

//                 console.log(
//                     "totalSessions:",
//                     c?.statistics?.totalSessions
//                 );

//                 console.log(
//                     "totalCourses:",
//                     c?.statistics?.totalCourses
//                 );

//                 console.log(
//                     "totalStudents:",
//                     c?.statistics?.totalStudents
//                 );

//                 console.log(
//                     "totalTrainers:",
//                     c?.statistics?.totalTrainers
//                 );

//                 console.log(
//                     "activeContracts:",
//                     c?.statistics?.activeContracts
//                 );

//                 console.groupEnd();

//                 return {
//                     totalSessions:
//                         acc.totalSessions +
//                         (c.statistics?.totalSessions || 0),

//                     totalCourses:
//                         acc.totalCourses +
//                         (c.statistics?.totalCourses || 0),

//                     totalStudents:
//                         acc.totalStudents +
//                         (c.statistics?.totalStudents || 0),

//                     totalTrainers:
//                         acc.totalTrainers +
//                         (c.statistics?.totalTrainers || 0),

//                     activeContracts:
//                         acc.activeContracts +
//                         (c.statistics?.activeContracts || 0),
//                 };
//             },
//             {
//                 totalSessions: 0,
//                 totalCourses: 0,
//                 totalStudents: 0,
//                 totalTrainers: 0,
//                 activeContracts: 0,
//             }
//         );

//         console.log("🏢 FINAL ORG TOTALS:", totals);
//         console.log("========================================");

//         return totals;
//     }, [collegeStats]);

//     /*
//     ==================================================
//     🔥 YEARLY TIMELINE
//     ==================================================
//     */

//     const yearlyTimeline = useMemo(() => {
//         console.log("========================================");
//         console.log("📅 YEARLY TIMELINE DEBUG");

//         const byYear = groupByYear(AllSlots);

//         console.log("Grouped by year:", byYear);

//         const timeline = Object.keys(byYear)
//             .sort()
//             .map((y) => {
//                 const yearSlots = byYear[y];

//                 const active = yearSlots.filter(
//                     (s) => s.status !== "cancelled"
//                 );

//                 const done = yearSlots.filter(
//                     (s) => s.status === "completed"
//                 );

//                 const data = {
//                     year: y,

//                     attendance: active.length
//                         ? Math.round(
//                               (done.length / active.length) * 100
//                           )
//                         : 0,

//                     performance: 0,

//                     hours: done.length,
//                 };

//                 console.log(`YEAR ${y}:`, data);

//                 console.log(
//                     `Year ${y} Slots:`,
//                     yearSlots
//                 );

//                 console.log(
//                     `Year ${y} Active:`,
//                     active.length
//                 );

//                 console.log(
//                     `Year ${y} Completed:`,
//                     done.length
//                 );

//                 return data;
//             });

//         console.log(
//             "📅 FINAL YEARLY TIMELINE:",
//             timeline
//         );

//         console.log("========================================");

//         return timeline;
//     }, [AllSlots]);

//     const currentYear = new Date().getFullYear();

//     const thisYearData = yearlyTimeline.find(
//         (y) => Number(y.year) === currentYear
//     );

//     useEffect(() => {
//         console.log("========================================");
//         console.log("📆 CURRENT YEAR DEBUG");

//         console.log("Current Year:", currentYear);

//         console.log(
//             "Yearly Timeline:",
//             yearlyTimeline
//         );

//         console.log(
//             "This Year Data:",
//             thisYearData
//         );

//         console.log("========================================");
//     }, [yearlyTimeline, currentYear, thisYearData]);

//     /*
//     ==================================================
//     🔥 GENERAL METRICS DATA
//     ==================================================
//     */

//     const attendanceSeries = yearlyTimeline.map((y) => ({
//         label: y.year,
//         value: y.attendance,
//     }));

//     const generalMetricsThisYear = thisYearData
//         ? {
//               attendance: thisYearData.attendance,
//               performance: thisYearData.performance,
//               feedback: 0,
//               hours: thisYearData.hours,
//           }
//         : null;

//     useEffect(() => {
//         console.log("========================================");
//         console.log("🎯 GENERAL METRICS PROPS");

//         console.log(
//             "hoursDelivered:",
//             completedSlots.length
//         );

//         console.log("performanceAvg:", 0);

//         console.log(
//             "attendanceSeries:",
//             attendanceSeries
//         );

//         console.log(
//             "yearlyTimeline:",
//             yearlyTimeline
//         );

//         console.log(
//             "thisYear:",
//             generalMetricsThisYear
//         );

//         console.log("========================================");
//     }, [
//         completedSlots.length,
//         yearlyTimeline,
//         thisYearData,
//     ]);

//     /*
//     ==================================================
//     🔥 ATTENDANCE BY COLLEGE
//     ==================================================
//     */

//     const attendanceByCollege = collegeStats.map(
//         (c, index) => {
//             console.group(
//                 `🏫 ATTENDANCE BY COLLEGE ${index}`
//             );

//             console.log("College Stats Object:", c);

//             console.log(
//                 "College ID:",
//                 c?.college?._id
//             );

//             console.log(
//                 "College Name:",
//                 c?.college?.name
//             );

//             const collegeSlots = AllSlots.filter((s) => {
//                 const slotCollegeId =
//                     s?.sessionId?.collegeId?._id;

//                 const statsCollegeId =
//                     c?.college?._id;

//                 console.log(
//                     "Comparing:",
//                     slotCollegeId,
//                     "===",
//                     statsCollegeId
//                 );

//                 return (
//                     slotCollegeId ===
//                     statsCollegeId
//                 );
//             });

//             const active = collegeSlots.filter(
//                 (s) => s.status !== "cancelled"
//             );

//             const done = collegeSlots.filter(
//                 (s) => s.status === "completed"
//             );

//             const result = {
//                 label: c?.college?.name || "—",

//                 value: active.length
//                     ? Math.round(
//                           (done.length /
//                               active.length) *
//                               100
//                       )
//                     : 0,
//             };

//             console.log(
//                 "College Slots:",
//                 collegeSlots
//             );

//             console.log(
//                 "Active:",
//                 active.length
//             );

//             console.log(
//                 "Completed:",
//                 done.length
//             );

//             console.log(
//                 "Final Result:",
//                 result
//             );

//             console.groupEnd();

//             return result;
//         }
//     );

//     useEffect(() => {
//         console.log("========================================");
//         console.log("📊 FINAL ATTENDANCE BY COLLEGE");

//         console.log(attendanceByCollege);

//         console.log("========================================");
//     }, [collegeStats, AllSlots]);

//     /*
//     ==================================================
//     🔥 CONTRACTS DEBUG
//     ==================================================
//     */

//     useEffect(() => {
//         console.log("========================================");
//         console.log("📜 EXPIRING CONTRACTS DEBUG");

//         console.log(
//             "expiringContracts:",
//             expiringContracts
//         );

//         expiringContracts.forEach(
//             (contract, index) => {
//                 console.group(
//                     `CONTRACT ${index}`
//                 );

//                 console.log(
//                     "Full contract:",
//                     contract
//                 );

//                 console.log(
//                     "College:",
//                     contract?.sessionId?.collegeId
//                 );

//                 console.log(
//                     "College Name:",
//                     contract?.sessionId?.collegeId?.name
//                 );

//                 console.log(
//                     "Trainer:",
//                     contract?.trainerId
//                 );

//                 console.log(
//                     "Trainer Name:",
//                     contract?.trainerId?.name
//                 );

//                 console.log(
//                     "End Date:",
//                     contract?.endDate
//                 );

//                 console.groupEnd();
//             }
//         );

//         console.log("========================================");
//     }, [expiringContracts]);

//     if (error) {
//         return (
//             <div className="metricsEmpty">
//                 Couldn't load admin dashboard: {error}
//             </div>
//         );
//     }

//     return (
//         <div className="metricsSection">

//             <div className="right">
//                 <CollegeSelector
//                     colleges={colleges}
//                     selected={selectedCollege}
//                     onSelect={setSelectedCollege}
//                 />
//             </div>

//             <div className="metricsGrid">
//                 <KPICard
//                     label="Colleges"
//                     value={colleges.length}
//                 />

//                 <KPICard
//                     label="Sessions"
//                     value={orgTotals.totalSessions}
//                 />

//                 <KPICard
//                     label="Courses"
//                     value={orgTotals.totalCourses}
//                 />

//                 <KPICard
//                     label="Students"
//                     value={orgTotals.totalStudents}
//                 />

//                 <KPICard
//                     label="Trainers"
//                     value={orgTotals.totalTrainers}
//                 />

//                 <KPICard
//                     label="Active contracts"
//                     value={orgTotals.activeContracts}
//                 />

//                 <KPICard
//                     label="Attendance"
//                     value={attendancePct}
//                     unit="%"
//                 />
//             </div>

//             <GeneralMetrics
//                 hoursDelivered={completedSlots.length}
//                 performanceAvg={0}
//                 attendanceSeries={attendanceSeries}
//                 yearlyTimeline={yearlyTimeline}
//                 thisYear={generalMetricsThisYear}
//             />

//             <BarChart
//                 title="Attendance by college"
//                 data={attendanceByCollege}
//             />

//             <div className="listCard">

//                 <div className="chartCardHeader">
//                     <span className="chartCardTitle">
//                         Contracts expiring soon
//                     </span>

//                     <span className="chartCardMeta">
//                         {expiringContracts.length}
//                     </span>
//                 </div>

//                 {expiringContracts.length === 0 ? (
//                     <div className="metricsEmpty">
//                         No contracts expiring soon
//                     </div>
//                 ) : (
//                     expiringContracts.map((c) => (
//                         <div
//                             className="listRow"
//                             key={c._id}
//                         >
//                             <div className="listRowMain">

//                                 <span className="listRowTitle">
//                                     {c.sessionId?.collegeId?.name ||
//                                         "Session"}
//                                 </span>

//                                 <span className="listRowSub">
//                                     Trainer:{" "}
//                                     {c.trainerId?.name || "—"}
//                                 </span>

//                             </div>

//                             <span className="listRowValue">
//                                 {c.endDate
//                                     ? new Date(
//                                           c.endDate
//                                       ).toLocaleDateString(
//                                           "en-IN"
//                                       )
//                                     : "—"}
//                             </span>

//                         </div>
//                     ))
//                 )}

//             </div>

//         </div>
//     );
// }











// // import { useEffect, useMemo, useState } from "react";
// // import { useDashboard } from "../../../hooks/useDashboard";
// // // import CollegeSelector from './component/CollegeSelector';
// // import CollegeSelector from '../Dashboard_Admin/component/CollegeSelector';
// // // import GeneralMetrics, { KPICard, BarChart } from "./GeneralMetrics";
// // // import "./dashboardMetrics.css";

// // // const API_BASE = "/api";

// // // import GeneralMetrics, { KPICard, BarChart } from "../../ganaral_metrices/GeneralMetrics";
// // import GeneralMetrics, { KPICard, BarChart } from "../../ganaral_metrices/ Generalmetrics";

// // import "../../ganaral_metrices/Dashboardmetrics.css";


// // export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// // const API_BASE = BASE_URL; // adjust to match your axios instance / base url







// // async function getJSON(path, token) {
// //     const res = await fetch(`${API_BASE}${path}`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //     });
// //     if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
// //     return res.json();
// // }

// // function groupByYear(slots) {
// //     const byYear = {};
// //     slots.forEach((s) => {
// //         const d = new Date(s.date);
// //         if (isNaN(d.getTime())) return;
// //         const y = d.getFullYear();
// //         if (!byYear[y]) byYear[y] = [];
// //         byYear[y].push(s);
// //     });
// //     return byYear;
// // }

// // export default function AdminDashboardMetrics({ token }) {
// //     // useDashboard is unfiltered for admin, so AllSessions/AllSlots here
// //     // already cover every college.
// //     const { 
// //         AllSessions = [], 
// //         AllSlots = [], 
// //         colleges = [],
// //         selectedCollege,
// //         setSelectedCollege,
// //         ExpContracts,
// //     } = useDashboard(token);

// //     const [collegeStats, setCollegeStats] = useState([]); // [{ college, statistics }]
// //     const [expiringContracts, setExpiringContracts] = useState([]);
// //     const [error, setError] = useState(null);

// //     useEffect(() => {
// //         if (!token || colleges.length === 0) return;

// //         (async () => {
// //             try {
// //                 // getDashboardStats is per-college only — no batch mode yet,
// //                 // so this fires one call per college. Fine at current scale;
// //                 // worth adding a ?collegeIds=a,b,c batch endpoint if the
// //                 // number of colleges grows a lot.
// //                 const results = await Promise.all(
// //                     colleges.map(async (c) => {
// //                         try {
// //                             const stats = await getJSON(`/dashboard/stats?college=${c._id}`, token);
// //                             return stats;
// //                         } catch {
// //                             return null;
// //                         }
// //                     })
// //                 );
// //                 setCollegeStats(results.filter(Boolean));

// //                 setExpiringContracts(ExpContracts);
// //                 // const expiry = await getJSON("/contracts/expiry", token);
// //                 // setExpiringContracts(Array.isArray(expiry) ? expiry : expiry?.data || []);
// //             } catch (err) {
// //                 setError(err.message);
// //             }
// //         })();
// //     }, [token, colleges]);

// //     const activeSlots = AllSlots.filter((s) => s.status !== "cancelled");
// //     const completedSlots = AllSlots.filter((s) => s.status === "completed");
// //     const attendancePct = activeSlots.length
// //         ? Math.round((completedSlots.length / activeSlots.length) * 100)
// //         : 0;

// //     const orgTotals = useMemo(() => {
// //         return collegeStats.reduce(
// //             (acc, c) => ({
// //                 totalSessions: acc.totalSessions + (c.statistics?.totalSessions || 0),
// //                 totalCourses: acc.totalCourses + (c.statistics?.totalCourses || 0),
// //                 totalStudents: acc.totalStudents + (c.statistics?.totalStudents || 0),
// //                 totalTrainers: acc.totalTrainers + (c.statistics?.totalTrainers || 0),
// //                 activeContracts: acc.activeContracts + (c.statistics?.activeContracts || 0),
// //             }),
// //             { totalSessions: 0, totalCourses: 0, totalStudents: 0, totalTrainers: 0, activeContracts: 0 }
// //         );
// //     }, [collegeStats]);

// //     const yearlyTimeline = useMemo(() => {
// //         const byYear = groupByYear(AllSlots);
// //         return Object.keys(byYear)
// //             .sort()
// //             .map((y) => {
// //                 const yearSlots = byYear[y];
// //                 const active = yearSlots.filter((s) => s.status !== "cancelled");
// //                 const done = yearSlots.filter((s) => s.status === "completed");
// //                 return {
// //                     year: y,
// //                     attendance: active.length ? Math.round((done.length / active.length) * 100) : 0,
// //                     performance: 0, // needs an org-wide performance aggregate endpoint
// //                     hours: done.length,
// //                 };
// //             });
// //     }, [AllSlots]);

// //     const currentYear = new Date().getFullYear();
// //     const thisYearData = yearlyTimeline.find((y) => Number(y.year) === currentYear);

// //     if (error) return <div className="metricsEmpty">Couldn't load admin dashboard: {error}</div>;

// //     return (
// //         <div className="metricsSection">
// //                  <div className="right  ">
// //                      <CollegeSelector
// //                          colleges={colleges}
// //                          selected={selectedCollege}
// //                          onSelect={setSelectedCollege}
// //                      />
// //                  </div>
// //             <div className="metricsGrid">
// //                 <KPICard label="Colleges" value={colleges.length} />
// //                 <KPICard label="Sessions" value={orgTotals.totalSessions} />
// //                 <KPICard label="Courses" value={orgTotals.totalCourses} />
// //                 <KPICard label="Students" value={orgTotals.totalStudents} />
// //                 <KPICard label="Trainers" value={orgTotals.totalTrainers} />
// //                 <KPICard label="Active contracts" value={orgTotals.activeContracts} />
// //                 <KPICard label="Attendance" value={attendancePct} unit="%" />
// //             </div>
    
// //     {/* hoursDelivered,
// //     hoursTrend,
// //     performanceAvg,
// //     performanceTrend,
// //     attendanceSeries = [],      // [{ label, value }] recent periods, for the aggregate chart
// //     yearlyTimeline = [],        // [{ year, attendance, performance, hours }]
// //     thisYear,  */}
// //             <GeneralMetrics
// //                 hoursDelivered={completedSlots.length}
// //                 performanceAvg={0}
// //                 attendanceSeries={yearlyTimeline.map((y) => ({ label: y.year, value: y.attendance }))}
// //                 yearlyTimeline={yearlyTimeline}
// //                 thisYear={
// //                     thisYearData
// //                         ? {
// //                               attendance: thisYearData.attendance,
// //                               performance: thisYearData.performance,
// //                               feedback: 0,
// //                               hours: thisYearData.hours,
// //                           }
// //                         : null
// //                 }
// //             />

// //             <BarChart
// //                 title="Attendance by college"
// //                 data={collegeStats.map((c) => {
// //                     const collegeSlots = AllSlots.filter(
// //                         (s) => s.sessionId?.collegeId?._id === c.college?._id
// //                     );
// //                     const active = collegeSlots.filter((s) => s.status !== "cancelled");
// //                     const done = collegeSlots.filter((s) => s.status === "completed");
// //                     return {
// //                         label: c.college?.name || "—",
// //                         value: active.length ? Math.round((done.length / active.length) * 100) : 0,
// //                     };
// //                 })}
// //             />

// //             <div className="listCard">
// //                 <div className="chartCardHeader">
// //                     <span className="chartCardTitle">Contracts expiring soon</span>
// //                     <span className="chartCardMeta">{expiringContracts.length}</span>
// //                 </div>

// //                 {expiringContracts.length === 0 ? (
// //                     <div className="metricsEmpty">No contracts expiring soon</div>
// //                 ) : (
// //                     expiringContracts.map((c) => (
// //                         <div className="listRow" key={c._id}>
// //                             <div className="listRowMain">
// //                                 <span className="listRowTitle">
// //                                     {c.sessionId?.collegeId?.name || "Session"}
// //                                 </span>
// //                                 <span className="listRowSub">
// //                                     Trainer: {c.trainerId?.name || "—"}
// //                                 </span>
// //                             </div>
// //                             <span className="listRowValue">
// //                                 {new Date(c.endDate).toLocaleDateString("en-IN")}
// //                             </span>
// //                         </div>
// //                     ))
// //                 )}
// //             </div>
// //         </div>
// //     );
// // }