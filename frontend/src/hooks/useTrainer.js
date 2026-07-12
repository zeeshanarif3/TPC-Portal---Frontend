// // useDashboard.js
// import { useState, useEffect, useCallback } from 'react';
// import {
  
//     fetchSchedules,
  




// } from '../services/dashboardapi';



// // ─── Hook ─────────────────────────────────────────────────────────────────────

// export function useTrainer(token) {
//     // const [selectedCollege, setSelectedCollege] = useState('6a4107cea7404a5a7f287dd9');
//     const [selectedCollege, setSelectedCollege] = useState('6a4107cea7404a5a7f287ddb');
   
//     const [AllSchedules, setAllSchedules] = useState([]);



//         try {
//             const all= fetchSchedules(token);
            
//             setAllSchedules(all);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch schedules');
//         }

   




//     return {
       
//         // deleteSchedule: handleDeleteSchedule,
//         // appendSlotsViaCSV,
//         // UpcomingScheduleByColl,
//         AllSchedules,
//         // // fetchUpcomingScheduleByCollege,
        

//         // refresh,
//     };
// }
























// useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import {
    // fetchDashboardStats,
    
    // // colleges

    // fetchColleges,
    // createCollege,
    // deleteCollege,
    // updateCollege,


    // // attendance
    // fetchAttendanceChart,
    // fetchSubjectDistribution,
    // fetchAttendanceByCollegeAndSession,
    // createAttendance,
    // updateAttendance,

    // // schedules
    // // fetchUpcomingSchedule,
    // // fetchSchedules,
    // // createSchedule,
    // // updateSchedule,
    // // deleteSchedule,
    // appendSlotsViaCSV,
    // fetchUpcomingScheduleByCollege,
    // deleteSchedule,
    // updateSchedule,
    fetchSchedules,
    // createSchedule,
    // fetchScheduleById,

    // contracts
    // fetchContracts,
    // fetchContractExpiry,
    // createContract,
    // updateContract,
    // deleteContract,


    // // sessions
    // fetchSessions,
    // createSession,
    // updateSession,
    // deleteSession,

    // // students
    // fetchStudents,
    // createStudent,
    // updateStudent,
    // deleteStudent,

    // // course
    // fetchCourses,
    // createCourse,
    // fetchCourseById,
    // updateCourse,
    // deleteCourse,

    // // trainers
    // fetchTrainers,
    // fetchTrainersByCollege,
    // createTrainer,
    // deleteTrainer,
    // updateTrainer,

    // // moderator
    // getAllModerators,
    // createModerator,
    // updateModerator,
    // deleteModerator,




} from '../services/dashboardapi';

// ─── Config ───────────────────────────────────────────────────────────────────

const USE_MOCK = false;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_COLLEGES = [
    { id: '1', label: 'AUP' },
    { id: 'thapar', label: 'Thapar' },
    { id: 'nit', label: 'NIT Jalandhar' },
];

const MOCK_STATS = {
    totalTrainers: 24,
    activeTrainers: 24,
    totalColleges: 3,
    activeSessions: 14,
    sessionsStartingThisWeek: 3,
};

const MOCK_TRAINERS = [
    { id: 1, name: 'Rahul Kumar', subject: 'Data Science', contract: 'C-001', sessions: 12, status: 'Active' },
    { id: 2, name: 'Priya Sharma', subject: 'Web Dev', contract: 'C-002', sessions: 9, status: 'Active' },
    { id: 3, name: 'Arjun Mehta', subject: 'ML/AI', contract: 'C-003', sessions: 7, status: 'Pending' },
    { id: 4, name: 'Neha Patel', subject: 'UI/UX', contract: 'C-004', sessions: 5, status: 'Active' },
];

const MOCK_SCHEDULE = [
    { id: 1, trainer: 'Rahul Kumar', course: 'DS-101', day: 'Mon', time: '09:00–11:00', status: 'Confirmed' },
    { id: 2, trainer: 'Priya Sharma', course: 'WD-204', day: 'Mon', time: '11:30–13:30', status: 'Confirmed' },
    { id: 3, trainer: 'Arjun Mehta', course: 'ML-301', day: 'Tue', time: '09:00–12:00', status: 'Pending' },
    { id: 4, trainer: 'Neha Patel', course: 'UX-102', day: 'Wed', time: '14:00–16:00', status: 'Confirmed' },
];

const MOCK_ATTENDANCE = [
    { day: 'Mon', value: 60 },
    { day: 'Tue', value: 80 },
    { day: 'Wed', value: 55 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 70 },
    { day: 'Sat', value: 40 },
    { day: 'Sun', value: 30 },
];

const MOCK_COURSE_DISTRIBUTION = [
    { subject: 'Data Science', count: 8, color: '#6C8EF5' },
    { subject: 'Web Dev', count: 5, color: '#4CD9A0' },
    { subject: 'ML/AI', count: 4, color: '#F5A623' },
    { subject: 'UI/UX', count: 3, color: '#A78BFA' },
    { subject: 'DevOps', count: 2, color: '#F97316' },
];

const MOCK_CONTRACT_EXPIRY = [
    { id: 1, name: 'Arjun Mehta', expiresLabel: 'Expires Jul 15', daysLeft: 12, urgency: 'high' },
    { id: 2, name: 'Sana Iqbal', expiresLabel: 'Expires Jul 22', daysLeft: 19, urgency: 'medium' },
    { id: 3, name: 'Dev Anand', expiresLabel: 'Expires Aug 1', daysLeft: 29, urgency: 'low' },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTrainer(token) {
    // const [selectedCollege, setSelectedCollege] = useState('6a4107cea7404a5a7f287dd9');
    // const [colleges, setColleges] = useState([]);
    // const [stats, setStats] = useState(null);
    // const [trainers, setTrainers] = useState([]);
    // const [schedule, setSchedule] = useState([]);
    // const [attendance, setAttendance] = useState([]);
    // const [courseDist, setCourseDist] = useState([]);
    // const [contractExpiry, setContractExpiry] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);

    // // attendance
    // const [UpcomingClasses, setUpcomingClasses] = useState(null);
    // const [Analytics, setAnalytics] = useState(null);
    // const [AttendanceChart, setAttendanceChart] = useState([]);
    // const [SubjectDistributionAttendance, setSubjectDistributionAttendance] = useState([]);
    // const [AttendanceByCollegeAndSession, setAttendanceByCollegeAndSession] = useState([]);

    // schedule
    // const [UpcomingScheduleByColl, setUpcomingScheduleByColl] = useState([]);
    const [AllSchedules, setAllSchedules] = useState([]);


    // // contracts
    // const [AllContracts, setAllContracts] = useState([]);
    // const [ExpContracts, setExpContracts] = useState([]);

    // // sessions
    // const [AllSessions, setAllSessions] = useState([]);
    // const [CurrentSession, setCurrentSession] = useState('');

    // // students
    // const [Allstudents, setAllstudents] = useState([]);

    // // courses
    // const [AllCourses, setAllCourses] = useState([]);

    // // trainers
    // const [AllTrainers, setAllTrainers] = useState([]);
    // const [TrainersByColl, setTrainersByColl] = useState([]);

    // // moderator
    // const [AllModerators, setAllModerators] = useState([]);
    // ── Load colleges once on mount ────────────────────────────────────────

    // useEffect(() => {
    //     if (USE_MOCK) {
    //         setColleges(MOCK_COLLEGES);
    //         return;
    //     }

    //     fetchColleges(token)
    //         .then(setColleges)
    //         .catch(err => setError(err.message || 'Failed to fetch colleges'));
    // }, [token]);

    // ── Feature loaders ─────────────────────────────────────────────────────

    // const refreshDashboard = useCallback(async () => {
    //     if (USE_MOCK) {
    //         setStats(MOCK_STATS);
    //         return;
    //     }
    //     try {
    //         const data = await fetchDashboardStats(selectedCollege, token);
    //         const chart = await fetchAttendanceChart(selectedCollege, token);
    //         const subjectDist = await fetchSubjectDistribution(selectedCollege, token);

    //         setStats(data);
    //         setAttendanceChart(chart);
    //         setSubjectDistributionAttendance(subjectDist);
    //     } catch (err) {
    //         setError(err.message || 'Failed to fetch dashboard stats');
    //     }
    // }, [selectedCollege, token]);


const refreshSchedules = useCallback(async () => {
  try {
    const all = await fetchSchedules(token, {
      date: "2026-07-13"
    });

    setAllSchedules(all);

  } catch (err) {
    setError(err.message || "Failed to fetch schedules");
  }
}, [token]);
    // ── Effect: college changes ─────────────────────────────────────────────
    // Loads everything that only depends on the college, then resolves session

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                    await Promise.all([
                        refreshSchedules(),
                    ]);
                
            } finally {
                
            }
        })();

        return () => { cancelled = true; };
    }, [refreshSchedules]);

    // ── Effect: session changes ─────────────────────────────────────────────
    // Only reloads attendance-related data, never runs without a valid session


















    return {
        AllSchedules,

    };
}





















// // useDashboard.js
// import { useState, useEffect, useCallback } from 'react';
// import {
//     fetchDashboardStats,
    
//     // colleges

//     fetchColleges,
//     createCollege,
//     deleteCollege,

//     // attendance
//     fetchAttendanceChart,
//     fetchSubjectDistribution,
//     fetchAttendanceByCollegeAndSession,

//     // schedules
//     fetchUpcomingSchedule,
//     fetchSchedules,
//     createSchedule,

//     // contracts
//     fetchContracts,
//     fetchContractExpiry,
//     createContract,


//     // sessions
//     fetchSessions,
//     createSession,

//     // students
//     fetchStudents,

//     // course
//     fetchCourses,
//     createCourse,
//     fetchCourseById,
//     updateCourse,
//     deleteCourse,

//     // trainers
//     fetchTrainers,
//     fetchTrainersByCollege,
//     createTrainer,

//     // moderator
//     getAllModerators,
//     createModerator,



// } from '../services/dashboardapi';

// // ─── Config ───────────────────────────────────────────────────────────────────

// const USE_MOCK = false;

// // ─── Mock data ────────────────────────────────────────────────────────────────

// const MOCK_COLLEGES = [
//     { id: '1', label: 'AUP' },
//     { id: 'thapar', label: 'Thapar' },
//     { id: 'nit', label: 'NIT Jalandhar' },
// ];

// const MOCK_STATS = {
//     totalTrainers: 24,
//     activeTrainers: 24,
//     totalColleges: 3,
//     activeSessions: 14,
//     sessionsStartingThisWeek: 3,
// };

// const MOCK_TRAINERS = [
//     { id: 1, name: 'Rahul Kumar', subject: 'Data Science', contract: 'C-001', sessions: 12, status: 'Active' },
//     { id: 2, name: 'Priya Sharma', subject: 'Web Dev', contract: 'C-002', sessions: 9, status: 'Active' },
//     { id: 3, name: 'Arjun Mehta', subject: 'ML/AI', contract: 'C-003', sessions: 7, status: 'Pending' },
//     { id: 4, name: 'Neha Patel', subject: 'UI/UX', contract: 'C-004', sessions: 5, status: 'Active' },
// ];

// const MOCK_SCHEDULE = [
//     { id: 1, trainer: 'Rahul Kumar', course: 'DS-101', day: 'Mon', time: '09:00–11:00', status: 'Confirmed' },
//     { id: 2, trainer: 'Priya Sharma', course: 'WD-204', day: 'Mon', time: '11:30–13:30', status: 'Confirmed' },
//     { id: 3, trainer: 'Arjun Mehta', course: 'ML-301', day: 'Tue', time: '09:00–12:00', status: 'Pending' },
//     { id: 4, trainer: 'Neha Patel', course: 'UX-102', day: 'Wed', time: '14:00–16:00', status: 'Confirmed' },
// ];

// const MOCK_ATTENDANCE = [
//     { day: 'Mon', value: 60 },
//     { day: 'Tue', value: 80 },
//     { day: 'Wed', value: 55 },
//     { day: 'Thu', value: 90 },
//     { day: 'Fri', value: 70 },
//     { day: 'Sat', value: 40 },
//     { day: 'Sun', value: 30 },
// ];

// const MOCK_COURSE_DISTRIBUTION = [
//     { subject: 'Data Science', count: 8, color: '#6C8EF5' },
//     { subject: 'Web Dev', count: 5, color: '#4CD9A0' },
//     { subject: 'ML/AI', count: 4, color: '#F5A623' },
//     { subject: 'UI/UX', count: 3, color: '#A78BFA' },
//     { subject: 'DevOps', count: 2, color: '#F97316' },
// ];

// const MOCK_CONTRACT_EXPIRY = [
//     { id: 1, name: 'Arjun Mehta', expiresLabel: 'Expires Jul 15', daysLeft: 12, urgency: 'high' },
//     { id: 2, name: 'Sana Iqbal', expiresLabel: 'Expires Jul 22', daysLeft: 19, urgency: 'medium' },
//     { id: 3, name: 'Dev Anand', expiresLabel: 'Expires Aug 1', daysLeft: 29, urgency: 'low' },
// ];

// // ─── Hook ─────────────────────────────────────────────────────────────────────

// export function useDashboard(token) {
//     const [selectedCollege, setSelectedCollege] = useState('6a4107cea7404a5a7f287dd9');
//     const [colleges, setColleges] = useState([]);
//     const [stats, setStats] = useState(null);
//     const [trainers, setTrainers] = useState([]);
//     const [schedule, setSchedule] = useState([]);
//     const [attendance, setAttendance] = useState([]);
//     const [courseDist, setCourseDist] = useState([]);
//     const [contractExpiry, setContractExpiry] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // attendance
//     const [UpcomingClasses, setUpcomingClasses] = useState(null);
//     const [Analytics, setAnalytics] = useState(null);
//     const [AttendanceChart, setAttendanceChart] = useState([]);
//     const [SubjectDistributionAttendance, setSubjectDistributionAttendance] = useState([]);
//     const [AttendanceByCollegeAndSession, setAttendanceByCollegeAndSession] = useState([]);

//     // schedule
//     const [UpcomingScheduleByColl, setUpcomingScheduleByColl] = useState([]);
//     const [AllSchedules, setAllSchedules] = useState([]);


//     // contracts
//     const [AllContracts, setAllContracts] = useState([]);
//     const [ExpContracts, setExpContracts] = useState([]);

//     // sessions
//     const [AllSessions, setAllSessions] = useState([]);
//     const [CurrentSession, setCurrentSession] = useState('');

//     // students
//     const [Allstudents, setAllstudents] = useState([]);

//     // courses
//     const [AllCourses, setAllCourses] = useState([]);

//     // trainers
//     const [AllTrainers, setAllTrainers] = useState([]);
//     const [TrainersByColl, setTrainersByColl] = useState([]);

//     // moderator
//     const [AllModerators, setAllModerators] = useState([]);
//     // ── Load colleges once on mount ────────────────────────────────────────

//     useEffect(() => {
//         if (USE_MOCK) {
//             setColleges(MOCK_COLLEGES);
//             return;
//         }

//         fetchColleges(token)
//             .then(setColleges)
//             .catch(err => setError(err.message || 'Failed to fetch colleges'));
//     }, [token]);

//     // ── Feature loaders ─────────────────────────────────────────────────────

//     const refreshDashboard = useCallback(async () => {
//         if (USE_MOCK) {
//             setStats(MOCK_STATS);
//             return;
//         }
//         try {
//             const data = await fetchDashboardStats(selectedCollege, token);
//             const chart = await fetchAttendanceChart(selectedCollege, token);
//             const subjectDist = await fetchSubjectDistribution(selectedCollege, token);

//             setStats(data);
//             setAttendanceChart(chart);
//             setSubjectDistributionAttendance(subjectDist);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch dashboard stats');
//         }
//     }, [selectedCollege, token]);

//     const refreshSchedules = useCallback(async () => {
//         if (USE_MOCK) {
//             setSchedule(MOCK_SCHEDULE);
//             return;
//         }
//         try {
//             const [upcoming, all] = await Promise.all([
//                 fetchUpcomingSchedule(selectedCollege, token),
//                 fetchSchedules(token),
//             ]);
//             setUpcomingScheduleByColl(upcoming);
//             setAllSchedules(all);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch schedules');
//         }
//     }, [selectedCollege, token]);

//     const refreshContracts = useCallback(async () => {
//         if (USE_MOCK) {
//             setContractExpiry(MOCK_CONTRACT_EXPIRY);
//             return;
//         }
//         try {
//             const [all, expiring] = await Promise.all([
//                 fetchContracts(token),
//                 fetchContractExpiry(selectedCollege, token),
//             ]);
//             setAllContracts(all);
//             setExpContracts(expiring);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch contracts');
//         }
//     }, [selectedCollege, token]);

//     const refreshStudents = useCallback(async () => {
//         if (USE_MOCK) return;
//         try {
//             const data = await fetchStudents(token);
//             setAllstudents(data);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch students');
//         }
//     }, [token]);

//     const refreshCourses = useCallback(async () => {
//         if (USE_MOCK) return;
//         try {
//             const data = await fetchCourses(token);
//             setAllCourses(data);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch courses');
//         }
//     }, [token]);

//     const refreshTrainers = useCallback(async () => {
//         if (USE_MOCK) {
//             setTrainers(MOCK_TRAINERS);
//             return;
//         }
//         try {
//             const [all, byCollege] = await Promise.all([
//                 fetchTrainers(token),
//                 fetchTrainersByCollege(selectedCollege, token),
//             ]);
//             setAllTrainers(all);
//             setTrainersByColl(byCollege);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch trainers');
//         }
//     }, [selectedCollege, token]);

//     const refreshModerators = useCallback(async () => {
//         if (USE_MOCK) {
//             setAllModerators(MOCK_TRAINERS);
//             return;
//         }
//         try {
//             const [all] = await Promise.all([
//                 getAllModerators(token),

//             ]);
//             setAllModerators(all);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch moderators');
//         }
//     }, [selectedCollege, token]);

//     // Loads sessions for the college and auto-selects the first one
//     const refreshSessions = useCallback(async () => {
//         if (USE_MOCK) return;
//         try {
//             const sessions = await fetchSessions(token);
//             setAllSessions(sessions);

//             setCurrentSession(prev => {
//                 const stillValid = sessions.some(s => s._id === prev || s.id === prev);
//                 if (stillValid) return prev;
//                 const first = sessions[0];
//                 return first ? (first._id || first.id) : '';
//             });
//         } catch (err) {
//             setError(err.message || 'Failed to fetch sessions');
//         }
//     }, [token]);

//     // Only runs once a valid session exists
//     const refreshAttendance = useCallback(async () => {
//         if (USE_MOCK) {
//             setAttendance(MOCK_ATTENDANCE);
//             setCourseDist(MOCK_COURSE_DISTRIBUTION);
//             return;
//         }
//         if (!selectedCollege || !CurrentSession) return;
//         try {
//             const [ byCollegeAndSession] = await Promise.all([
//                 fetchAttendanceByCollegeAndSession(selectedCollege, CurrentSession, token),
//             ]);

//             setAttendanceByCollegeAndSession(byCollegeAndSession);
//         } catch (err) {
//             setError(err.message || 'Failed to fetch attendance');
//         }
//     }, [CurrentSession, token]);

//     // ── Effect: college changes ─────────────────────────────────────────────
//     // Loads everything that only depends on the college, then resolves session

//     useEffect(() => {
//         if (!selectedCollege) return;

//         let cancelled = false;

//         (async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 if (USE_MOCK) {
//                     await new Promise(r => setTimeout(r, 300));
//                     if (cancelled) return;
//                     setStats(MOCK_STATS);
//                     setTrainers(MOCK_TRAINERS);
//                     setSchedule(MOCK_SCHEDULE);
//                     setCourseDist(MOCK_COURSE_DISTRIBUTION);
//                     setContractExpiry(MOCK_CONTRACT_EXPIRY);
//                 } else {
//                     await Promise.all([
//                         refreshDashboard(),
//                         refreshSchedules(),
//                         refreshContracts(),
//                         refreshStudents(),
//                         refreshCourses(),
//                         refreshTrainers(),
//                         refreshSessions(),
//                         refreshModerators(),
//                     ]);
//                 }
//             } finally {
//                 if (!cancelled) setLoading(false);
//             }
//         })();

//         return () => { cancelled = true; };
//     }, [selectedCollege, refreshDashboard, refreshSchedules, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshModerators, refreshSessions]);

//     // ── Effect: session changes ─────────────────────────────────────────────
//     // Only reloads attendance-related data, never runs without a valid session

//     useEffect(() => {
//         refreshAttendance();
//     }, [refreshAttendance]);

//     // ── Manual full refresh ─────────────────────────────────────────────────

//     const refresh = useCallback(async () => {
//         await Promise.all([
//             refreshDashboard(),
//             refreshSchedules(),
//             refreshContracts(),
//             refreshStudents(),
//             refreshCourses(),
//             refreshTrainers(),
//             refreshModerators(),
//             refreshSessions(),
//         ]);
//         await refreshAttendance();
//     }, [refreshDashboard, refreshSchedules, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshModerators, refreshSessions, refreshAttendance]);

//     return {
//         selectedCollege,
//         setSelectedCollege,
//         colleges,
//         deleteCollege,
//         createCollege,
//         stats,
//         // trainers,
//         // schedule,
//         // attendance,
//         // courseDist,
//         // contractExpiry,
//         loading,
//         error,

//         // attendance
//         UpcomingClasses,
//         Analytics,
//         AttendanceChart,
//         SubjectDistributionAttendance,
//         AttendanceByCollegeAndSession,

//         // schedule
//         UpcomingScheduleByColl,
//         AllSchedules,
//         createSchedule,

//         // contracts
//         AllContracts,
//         ExpContracts,
//         createContract,

//         // sessions
//         AllSessions,
//         setCurrentSession,
//         CurrentSession,
//         createSession,

//         // students
//         Allstudents,

//         // courses
//         AllCourses,
//         createCourse,
//         fetchCourseById,
//         updateCourse,
//         deleteCourse,

//         // trainers
//         AllTrainers,
//         TrainersByColl,
//         createTrainer,

//         // Moderator 
//         AllModerators,
//         createModerator,

//         refresh,
//     };
// }







