// useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import {
    fetchDashboardStats,
    fetchColleges,

    // attendance
    fetchAttendanceChart,
    fetchSubjectDistribution,
    fetchAttendanceByCollegeAndSession,

    // schedules
    fetchUpcomingSchedule,
    fetchSchedules,
    createSchedule,

    // contracts
    fetchContracts,
    fetchContractExpiry,

    // sessions
    fetchSessions,

    // students
    fetchStudents,

    // courses
    fetchCourses,

    // trainers
    fetchTrainers,
    fetchTrainersByCollege,
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

export function useDashboard(token) {
    const [selectedCollege, setSelectedCollege] = useState('6a4107cea7404a5a7f287dd9');
    const [colleges, setColleges] = useState([]);
    const [stats, setStats] = useState(null);
    const [trainers, setTrainers] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [courseDist, setCourseDist] = useState([]);
    const [contractExpiry, setContractExpiry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // attendance
    const [UpcomingClasses, setUpcomingClasses] = useState(null);
    const [Analytics, setAnalytics] = useState(null);
    const [AttendanceChart, setAttendanceChart] = useState([]);
    const [SubjectDistributionAttendance, setSubjectDistributionAttendance] = useState([]);
    const [AttendanceByCollegeAndSession, setAttendanceByCollegeAndSession] = useState([]);

    // schedule
    const [UpcomingScheduleByColl, setUpcomingScheduleByColl] = useState([]);
    const [AllSchedules, setAllSchedules] = useState([]);


    // contracts
    const [AllContracts, setAllContracts] = useState([]);
    const [ExpContracts, setExpContracts] = useState([]);

    // sessions
    const [AllSessions, setAllSessions] = useState([]);
    const [CurrentSession, setCurrentSession] = useState('');

    // students
    const [Allstudents, setAllstudents] = useState([]);

    // courses
    const [AllCourses, setAllCourses] = useState([]);

    // trainers
    const [AllTrainers, setAllTrainers] = useState([]);
    const [TrainersByColl, setTrainersByColl] = useState([]);

    // ── Load colleges once on mount ────────────────────────────────────────

    useEffect(() => {
        if (USE_MOCK) {
            setColleges(MOCK_COLLEGES);
            return;
        }

        fetchColleges(token)
            .then(setColleges)
            .catch(err => setError(err.message || 'Failed to fetch colleges'));
    }, [token]);

    // ── Feature loaders ─────────────────────────────────────────────────────

    const refreshDashboard = useCallback(async () => {
        if (USE_MOCK) {
            setStats(MOCK_STATS);
            return;
        }
        try {
            const data = await fetchDashboardStats(selectedCollege, token);
            const chart = await fetchAttendanceChart(selectedCollege, token);
            const subjectDist = await fetchSubjectDistribution(selectedCollege, token);

            setStats(data);
            setAttendanceChart(chart);
            setSubjectDistributionAttendance(subjectDist);
        } catch (err) {
            setError(err.message || 'Failed to fetch dashboard stats');
        }
    }, [selectedCollege, token]);

    const refreshSchedules = useCallback(async () => {
        if (USE_MOCK) {
            setSchedule(MOCK_SCHEDULE);
            return;
        }
        try {
            const [upcoming, all] = await Promise.all([
                fetchUpcomingSchedule(selectedCollege, token),
                fetchSchedules(token),
            ]);
            setUpcomingScheduleByColl(upcoming);
            setAllSchedules(all);
        } catch (err) {
            setError(err.message || 'Failed to fetch schedules');
        }
    }, [selectedCollege, token]);

    const refreshContracts = useCallback(async () => {
        if (USE_MOCK) {
            setContractExpiry(MOCK_CONTRACT_EXPIRY);
            return;
        }
        try {
            const [all, expiring] = await Promise.all([
                fetchContracts(token),
                fetchContractExpiry(selectedCollege, token),
            ]);
            setAllContracts(all);
            setExpContracts(expiring);
        } catch (err) {
            setError(err.message || 'Failed to fetch contracts');
        }
    }, [selectedCollege, token]);

    const refreshStudents = useCallback(async () => {
        if (USE_MOCK) return;
        try {
            const data = await fetchStudents(token);
            setAllstudents(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch students');
        }
    }, [token]);

    const refreshCourses = useCallback(async () => {
        if (USE_MOCK) return;
        try {
            const data = await fetchCourses(token);
            setAllCourses(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
        }
    }, [token]);

    const refreshTrainers = useCallback(async () => {
        if (USE_MOCK) {
            setTrainers(MOCK_TRAINERS);
            return;
        }
        try {
            const [all, byCollege] = await Promise.all([
                fetchTrainers(token),
                fetchTrainersByCollege(selectedCollege, token),
            ]);
            setAllTrainers(all);
            setTrainersByColl(byCollege);
        } catch (err) {
            setError(err.message || 'Failed to fetch trainers');
        }
    }, [selectedCollege, token]);

    // Loads sessions for the college and auto-selects the first one
    const refreshSessions = useCallback(async () => {
        if (USE_MOCK) return;
        try {
            const sessions = await fetchSessions(token);
            setAllSessions(sessions);

            setCurrentSession(prev => {
                const stillValid = sessions.some(s => s._id === prev || s.id === prev);
                if (stillValid) return prev;
                const first = sessions[0];
                return first ? (first._id || first.id) : '';
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch sessions');
        }
    }, [token]);

    // Only runs once a valid session exists
    const refreshAttendance = useCallback(async () => {
        if (USE_MOCK) {
            setAttendance(MOCK_ATTENDANCE);
            setCourseDist(MOCK_COURSE_DISTRIBUTION);
            return;
        }
        if (!selectedCollege || !CurrentSession) return;
        try {
            const [ byCollegeAndSession] = await Promise.all([
                fetchAttendanceByCollegeAndSession(selectedCollege, CurrentSession, token),
            ]);

            setAttendanceByCollegeAndSession(byCollegeAndSession);
        } catch (err) {
            setError(err.message || 'Failed to fetch attendance');
        }
    }, [CurrentSession, token]);

    // ── Effect: college changes ─────────────────────────────────────────────
    // Loads everything that only depends on the college, then resolves session

    useEffect(() => {
        if (!selectedCollege) return;

        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                if (USE_MOCK) {
                    await new Promise(r => setTimeout(r, 300));
                    if (cancelled) return;
                    setStats(MOCK_STATS);
                    setTrainers(MOCK_TRAINERS);
                    setSchedule(MOCK_SCHEDULE);
                    setCourseDist(MOCK_COURSE_DISTRIBUTION);
                    setContractExpiry(MOCK_CONTRACT_EXPIRY);
                } else {
                    await Promise.all([
                        refreshDashboard(),
                        refreshSchedules(),
                        refreshContracts(),
                        refreshStudents(),
                        refreshCourses(),
                        refreshTrainers(),
                        refreshSessions(),
                    ]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [selectedCollege, refreshDashboard, refreshSchedules, refreshContracts, refreshStudents, refreshCourses, refreshTrainers, refreshSessions]);

    // ── Effect: session changes ─────────────────────────────────────────────
    // Only reloads attendance-related data, never runs without a valid session

    useEffect(() => {
        refreshAttendance();
    }, [refreshAttendance]);

    // ── Manual full refresh ─────────────────────────────────────────────────

    const refresh = useCallback(async () => {
        await Promise.all([
            refreshDashboard(),
            refreshSchedules(),
            refreshContracts(),
            refreshStudents(),
            refreshCourses(),
            refreshTrainers(),
            refreshSessions(),
        ]);
        await refreshAttendance();
    }, [refreshDashboard, refreshSchedules, refreshContracts, refreshStudents, refreshCourses, refreshTrainers, refreshSessions, refreshAttendance]);

    return {
        selectedCollege,
        setSelectedCollege,
        colleges,
        stats,
        trainers,
        schedule,
        attendance,
        courseDist,
        contractExpiry,
        loading,
        error,

        // attendance
        UpcomingClasses,
        Analytics,
        AttendanceChart,
        SubjectDistributionAttendance,
        AttendanceByCollegeAndSession,

        // schedule
        UpcomingScheduleByColl,
        AllSchedules,
        createSchedule,

        // contracts
        AllContracts,
        ExpContracts,

        // sessions
        AllSessions,
        setCurrentSession,
        CurrentSession,

        // students
        Allstudents,

        // courses
        AllCourses,

        // trainers
        AllTrainers,
        TrainersByColl,

        refresh,
    };
}















// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
// // useDashboard.js
// import { useState, useEffect, useCallback } from 'react';
// import {
//     fetchDashboardStats,
//     fetchColleges,
//     // fetchTrainers,
//     // fetchUpcomingSchedule,
//     // fetchAttendanceChart,
//     // fetchCourseDistribution,
//     // fetchContractExpiry,
    
//     // attendance

//     fetchUpcomingClasses,
//     fetchAnalytics,
//     fetchAttendanceChart,
//     fetchSubjectDistribution,
//     fetchAttendanceByCollegeAndSession,







//     // schedules

//     fetchUpcomingSchedule,
//     fetchSchedules,
//     // fetchScheduleById, will require an extra state for schedule id 


//     // contracts

//     fetchContracts,
//     fetchContractExpiry,


//     // sessions
//     fetchSessions,


//     //students

//     fetchStudents,


//     //cources

//     fetchCourses,

//     //trainers
//     fetchTrainers,
//     fetchTrainersByCollege,

// } from '../services/dashboardapi';

// import { lazy } from 'react';






// // ─── Config ───────────────────────────────────────────────────────────────────

// const USE_MOCK = false; // flip to true to use mock data
// // const USE_MOCK = true; // flip to true to use mock data

// // ─── Hook ─────────────────────────────────────────────────────────────────────






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
//     { id: 5, name: 'Rahul Kumar', subject: 'Data Science', contract: 'C-001', sessions: 12, status: 'Active' },
//     { id: 6, name: 'Priya Sharma', subject: 'Web Dev', contract: 'C-002', sessions: 9, status: 'Active' },
//     { id: 7, name: 'Arjun Mehta', subject: 'ML/AI', contract: 'C-003', sessions: 7, status: 'Pending' },
//     { id: 8, name: 'Neha Patel', subject: 'UI/UX', contract: 'C-004', sessions: 5, status: 'Active' },
//     { id: 9, name: 'Rahul Kumar', subject: 'Data Science', contract: 'C-001', sessions: 12, status: 'Active' },
//     { id: 10, name: 'Priya Sharma', subject: 'Web Dev', contract: 'C-002', sessions: 9, status: 'Active' },
//     { id: 11, name: 'Arjun Mehta', subject: 'ML/AI', contract: 'C-003', sessions: 7, status: 'Pending' },
//     { id: 12, name: 'Neha Patel', subject: 'UI/UX', contract: 'C-004', sessions: 5, status: 'Active' },
//     { id: 13, name: 'Rahul Kumar', subject: 'Data Science', contract: 'C-001', sessions: 12, status: 'Active' },
//     { id: 14, name: 'Priya Sharma', subject: 'Web Dev', contract: 'C-002', sessions: 9, status: 'Active' },
//     { id: 15, name: 'Arjun Mehta', subject: 'ML/AI', contract: 'C-003', sessions: 7, status: 'Pending' },
//     { id: 16, name: 'Neha Patel', subject: 'UI/UX', contract: 'C-004', sessions: 5, status: 'Active' },
// ];

// const MOCK_SCHEDULE = [
//     { id: 1, trainer: 'Rahul Kumar', course: 'DS-101', day: 'Mon', time: '09:00–11:00', status: 'Confirmed' },
//     { id: 2, trainer: 'Priya Sharma', course: 'WD-204', day: 'Mon', time: '11:30–13:30', status: 'Confirmed' },
//     { id: 3, trainer: 'Arjun Mehta', course: 'ML-301', day: 'Tue', time: '09:00–12:00', status: 'Pending' },
//     { id: 4, trainer: 'Neha Patel', course: 'UX-102', day: 'Wed', time: '14:00–16:00', status: 'Confirmed' },
//     { id: 5, trainer: 'Rahul Kumar', course: 'DS-101', day: 'Mon', time: '09:00–11:00', status: 'Confirmed' },
//     { id: 6, trainer: 'Priya Sharma', course: 'WD-204', day: 'Mon', time: '11:30–13:30', status: 'Confirmed' },
//     { id: 7, trainer: 'Arjun Mehta', course: 'ML-301', day: 'Tue', time: '09:00–12:00', status: 'Pending' },
//     { id: 8, trainer: 'Neha Patel', course: 'UX-102', day: 'Wed', time: '14:00–16:00', status: 'Confirmed' },
//     { id: 9, trainer: 'Rahul Kumar', course: 'DS-101', day: 'Mon', time: '09:00–11:00', status: 'Confirmed' },
//     { id: 10, trainer: 'Priya Sharma', course: 'WD-204', day: 'Mon', time: '11:30–13:30', status: 'Confirmed' },
//     { id: 11, trainer: 'Arjun Mehta', course: 'ML-301', day: 'Tue', time: '09:00–12:00', status: 'Pending' },
//     { id: 12, trainer: 'Neha Patel', course: 'UX-102', day: 'Wed', time: '14:00–16:00', status: 'Confirmed' },
//     { id: 13, trainer: 'Rahul Kumar', course: 'DS-101', day: 'Mon', time: '09:00–11:00', status: 'Confirmed' },
//     { id: 14, trainer: 'Priya Sharma', course: 'WD-204', day: 'Mon', time: '11:30–13:30', status: 'Confirmed' },
//     { id: 15, trainer: 'Arjun Mehta', course: 'ML-301', day: 'Tue', time: '09:00–12:00', status: 'Pending' },
//     { id: 16, trainer: 'Neha Patel', course: 'UX-102', day: 'Wed', time: '14:00–16:00', status: 'Confirmed' },
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


// export function useDashboard(token) {

//     // console.log("1",token)
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
    
    
//     //contracts
    
//     const [AllContracts, setAllContracts] = useState([]);
//     const [ExpContracts, setExpContracts] = useState([]);
    
//     // sessions
    
//     const [AllSessions, setAllSessions] = useState([]);
//     const [CurrentSession, setCurrentSession] = useState('6a4107d0a7404a5a7f287e19');


//     // students
    
//     const [Allstudents, setAllstudents] = useState([]);
//     // Courses
    
//     const [AllCourses, setAllCourses] = useState([]);
//     // Trainers
    
//     const [AllTrainers, setAllTrainers] = useState([]);
//     const [TrainersByColl, setTrainersByColl] = useState([]);


//     // Load colleges once on mount
//     useEffect(() => {

//         if (USE_MOCK) {
//             setColleges(MOCK_COLLEGES);
//             return;
//         }

//         fetchColleges(token)
//             .then(setColleges)
//             .catch(err => setError(err.message || 'Failed to fetch colleges'));

//     }, [token]);
//     // Reload all dashboard data when college or token changes
//     const load = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             if (USE_MOCK) {
//                 await new Promise(r => setTimeout(r, 300));
//                 setStats(MOCK_STATS);
//                 setTrainers(MOCK_TRAINERS);
//                 setSchedule(MOCK_SCHEDULE);
//                 setAttendance(MOCK_ATTENDANCE);
//                 setCourseDist(MOCK_COURSE_DISTRIBUTION);
//                 setContractExpiry(MOCK_CONTRACT_EXPIRY);
//             } else {
//                 // const [stat,t, sc, a, cd, ce ] = await Promise.all([
//                 const [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p] = await Promise.all([
//                     fetchDashboardStats(selectedCollege, token),
//                     // fetchTrainers(selectedCollege, token),
//                     // fetchUpcomingSchedule(selectedCollege, token),
//                     // fetchCourseDistribution(selectedCollege, token),
//                     // fetchContractExpiry(selectedCollege, token),


//                     // attendance
//                     // fetchUpcomingClasses(token), for trainer
//                     // fetchAnalytics(token), for trainer
//                     fetchAttendanceChart(selectedCollege,token),
//                     fetchSubjectDistribution(selectedCollege,token),
//                     fetchAttendanceByCollegeAndSession(selectedCollege,CurrentSession,token),

//                     // schedule
//                     fetchUpcomingSchedule(selectedCollege,token),
//                     fetchSchedules(token),

//                     //contracts

//                     fetchContracts(token),
//                     fetchContractExpiry(selectedCollege,token),

//                     //sessions

//                     fetchSessions(token),

//                     //students
                    
//                     fetchStudents(token),
                    
//                     //Courses

//                     fetchCourses(token),

//                     //trainers

//                     fetchTrainers(token),
//                     fetchTrainersByCollege(selectedCollege,token),

                    
//                 ]);
//                 // dashboard
//                 setStats(a);
                
//                 // attendance
//                 setAttendanceChart(b);
//                 setSubjectDistributionAttendance(c);
//                 setAttendanceByCollegeAndSession(d)
//                 // schedule
//                 setUpcomingScheduleByColl(e);
//                 setAllSchedules(f);

//                 // contracts
//                 setAllContracts(g);
//                 setExpContracts(h);

//                 //sessions

//                 setAllSessions(i);


//                 //students


//                 setAllstudents(j);

//                 //Courses

//                 setAllCourses(k);

//                 //trainers

//                 setAllTrainers(l);
//                 setTrainersByColl(m);

//                 // setTrainers(t);
//                 // setSchedule(sc);
//                 // setAttendance(a);
//                 // setCourseDist(cd);
//                 // setContractExpiry(ce);
                
//                 // setUpcomingClasses(upclass);
//                 // setAnalytics(analytic);

//             }
//         } catch (err) {
//             setError(err.message || 'Something went wrong');
//         } finally {
//             setLoading(false);
//         }
//     }, [CurrentSession, selectedCollege, token]);

//     useEffect(() => { load(); }, [load]);

//     return {
//         selectedCollege,
//         setSelectedCollege,
//         colleges,
//         stats,
//         trainers,
//         schedule,
//         attendance,
//         courseDist,
//         contractExpiry,
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


//         //contracts

//         AllContracts,
//         ExpContracts,


//         //sessions

//         AllSessions,
//         setCurrentSession,
//         CurrentSession,


//         //students
//         Allstudents,


//         //Courses

//         AllCourses,

//         //trainers
//         AllTrainers,
//         TrainersByColl,
//         refresh: load,
//     };
// }

// // // useDashboard.js
// // import { useState, useEffect, useCallback } from 'react';
// // // import {
// // //   fetchDashboardStats,
// // //   fetchColleges,
// // //   fetchTrainers,
// // //   fetchUpcomingSchedule,
// // //   fetchAttendanceChart,
// // //   fetchSubjectDistribution,
// // //   fetchContractExpiry,
// // // } from '../services/dashboardapi';
// // import {
// //     fetchDashboardStats,
// //     fetchColleges,
// //     fetchTrainers,
// //     fetchUpcomingSchedule,
// //     fetchAttendanceChart,
// //     fetchSubjectDistribution,
// //     fetchContractExpiry
// // } from '../services/dashboardapi';

// // // ─── Mock data (used until real API is wired up) ──────────────────────────────

// // const MOCK_COLLEGES = [
// //     { id: 'aup', label: 'AUP' },
// //     { id: 'thapar', label: 'Thapar' },
// //     { id: 'nit', label: 'NIT Jalandhar' },
// // ];

// // const MOCK_STATS = {
// //     totalTrainers: 24,
// //     activeTrainers: 24,
// //     totalColleges: 3,
// //     activeSessions: 14,
// //     sessionsStartingThisWeek: 3,
// // };

// // const MOCK_TRAINERS = [
// //     { id: 1, name: 'Rahul Kumar', subject: 'Data Science', contract: 'C-001', sessions: 12, status: 'Active' },
// //     { id: 2, name: 'Priya Sharma', subject: 'Web Dev', contract: 'C-002', sessions: 9, status: 'Active' },
// //     { id: 3, name: 'Arjun Mehta', subject: 'ML/AI', contract: 'C-003', sessions: 7, status: 'Pending' },
// //     { id: 4, name: 'Neha Patel', subject: 'UI/UX', contract: 'C-004', sessions: 5, status: 'Active' },
// // ];

// // const MOCK_SCHEDULE = [
// //     { id: 1, trainer: 'Rahul Kumar', course: 'DS-101', day: 'Mon', time: '09:00–11:00', status: 'Confirmed' },
// //     { id: 2, trainer: 'Priya Sharma', course: 'WD-204', day: 'Mon', time: '11:30–13:30', status: 'Confirmed' },
// //     { id: 3, trainer: 'Arjun Mehta', course: 'ML-301', day: 'Tue', time: '09:00–12:00', status: 'Pending' },
// //     { id: 4, trainer: 'Neha Patel', course: 'UX-102', day: 'Wed', time: '14:00–16:00', status: 'Confirmed' },
// // ];


// // // colledge[ course[day,val] , course[day,val] , course[day,val] , course[day,val] , course[day,val]] , colledge
// // const MOCK_ATTENDANCE = [

// //     { day: 'Mon', value: 60 },
// //     { day: 'Tue', value: 80 },
// //     { day: 'Wed', value: 55 },
// //     { day: 'Thu', value: 90 },
// //     { day: 'Fri', value: 70 },
// //     { day: 'Sat', value: 40 },
// //     { day: 'Sun', value: 30 }


// // ];
// // // const MOCK_ATTENDANCE = [
// // //     {
// // //         college: "Amity University",
// // //         courses: [
// // //             {
// // //                 name: "CSE",
// // //                 attendance: [
// // //                     { day: "Mon", value: 60 },
// // //                     { day: "Tue", value: 80 },
// // //                     { day: "Wed", value: 55 },
// // //                     { day: "Thu", value: 90 },
// // //                     { day: "Fri", value: 70 }
// // //                 ]
// // //             },
// // //             {
// // //                 name: "AI & ML",
// // //                 attendance: [
// // //                     { day: "Mon", value: 75 },
// // //                     { day: "Tue", value: 85 },
// // //                     { day: "Wed", value: 65 },
// // //                     { day: "Thu", value: 95 },
// // //                     { day: "Fri", value: 80 }
// // //                 ]
// // //             }
// // //         ]
// // //     },
// // //     {
// // //         college: "Chandigarh University",
// // //         courses: [
// // //             {
// // //                 name: "CSE",
// // //                 attendance: [
// // //                     { day: "Mon", value: 50 },
// // //                     { day: "Tue", value: 70 },
// // //                     { day: "Wed", value: 60 },
// // //                     { day: "Thu", value: 85 },
// // //                     { day: "Fri", value: 75 }
// // //                 ]
// // //             },
// // //             {
// // //                 name: "Mechanical",
// // //                 attendance: [
// // //                     { day: "Mon", value: 65 },
// // //                     { day: "Tue", value: 78 },
// // //                     { day: "Wed", value: 72 },
// // //                     { day: "Thu", value: 88 },
// // //                     { day: "Fri", value: 82 }
// // //                 ]
// // //             }
// // //         ]
// // //     }
// // // ];
// // const MOCK_SUBJECT_DISTRIBUTION = [
// //     { subject: 'Data Science', count: 8, color: '#6C8EF5' },
// //     { subject: 'Web Dev', count: 5, color: '#4CD9A0' },
// //     { subject: 'ML/AI', count: 4, color: '#F5A623' },
// //     { subject: 'UI/UX', count: 3, color: '#A78BFA' },
// //     { subject: 'DevOps', count: 2, color: '#F97316' },
// // ];

// // const MOCK_CONTRACT_EXPIRY = [
// //     { id: 1, name: 'Arjun Mehta', expiresLabel: 'Expires Jul 15', daysLeft: 12, urgency: 'high' },
// //     { id: 2, name: 'Sana Iqbal', expiresLabel: 'Expires Jul 22', daysLeft: 19, urgency: 'medium' },
// //     { id: 3, name: 'Dev Anand', expiresLabel: 'Expires Aug 1', daysLeft: 29, urgency: 'low' },
// // ];

// // // ─── Hook ─────────────────────────────────────────────────────────────────────

// // // const USE_MOCK = true; // flip to false when real API is ready
// // const USE_MOCK = false; // flip to false when real API is ready

// // export function useDashboard(token) {
// //     const [selectedCollege, setSelectedCollege] = useState('aup');
// //     const [colleges, setColleges] = useState([]);
// //     const [stats, setStats] = useState(null);
// //     const [trainers, setTrainers] = useState([]);
// //     const [schedule, setSchedule] = useState([]);
// //     const [attendance, setAttendance] = useState([]);
// //     const [subjectDist, setSubjectDist] = useState([]);
// //     const [contractExpiry, setContractExpiry] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState(null);
// //     // const [selectedCourse, setSelectedCourse] = useState('');

// //     // Load colleges once
// //     useEffect(() => {
// //         if (USE_MOCK) { setColleges(MOCK_COLLEGES); return; }
// //         fetchColleges().then(setColleges).catch(setError);
// //     }, []);
// //     // if (USE_MOCK) {
// //     //     await new Promise(r => setTimeout(r, 300));

// //     //     setStats(MOCK_STATS);
// //     //     setTrainers(MOCK_TRAINERS);
// //     //     setSchedule(MOCK_SCHEDULE);
// //     //     setAttendance(MOCK_ATTENDANCE);
// //     //     setSubjectDist(MOCK_SUBJECT_DISTRIBUTION);
// //     //     setContractExpiry(MOCK_CONTRACT_EXPIRY);

// //     //     if (!selectedCourse && MOCK_ATTENDANCE.length > 0) {
// //     //         setSelectedCourse(
// //     //             MOCK_ATTENDANCE[0].courses[0]?.name || ''
// //     //         );
// //     //     }
// //     // }
// //     // Reload everything when selected college changes
// //     const load = useCallback(async () => {
// //         setLoading(true);
// //         setError(null);
// //         try {
// //             if (USE_MOCK) {
// //                 // Simulate async delay
// //                 await new Promise(r => setTimeout(r, 300));
// //                 setStats(MOCK_STATS);
// //                 setTrainers(MOCK_TRAINERS);
// //                 setSchedule(MOCK_SCHEDULE);
// //                 setAttendance(MOCK_ATTENDANCE);
// //                 setSubjectDist(MOCK_SUBJECT_DISTRIBUTION);
// //                 setContractExpiry(MOCK_CONTRACT_EXPIRY);
// //                 // if (!selectedCourse && MOCK_ATTENDANCE.length > 0) {
// //                 //     setSelectedCourse(
// //                 //         MOCK_ATTENDANCE[0].courses[0]?.name || ''
// //                 //     );
// //                 // }

// //             } else {
// //                 const [s, t, sc, a, sd, ce] = await Promise.all([
// //                     fetchDashboardStats(selectedCollege , token),
// //                     fetchTrainers(selectedCollege, token),
// //                     fetchUpcomingSchedule(selectedCollege, token),
// //                     fetchAttendanceChart(selectedCollege, token),
// //                     fetchSubjectDistribution(selectedCollege, token),
// //                     fetchContractExpiry(selectedCollege, token),
// //                 ]);
// //                 setStats(s);
// //                 setTrainers(t);
// //                 setSchedule(sc);
// //                 setAttendance(a);
// //                 setSubjectDist(sd);
// //                 setContractExpiry(ce);
// //             }
// //         } catch (err) {
// //             setError(err.message || 'Something went wrong');
// //         } finally {
// //             setLoading(false);
// //         }
// //     }, [selectedCollege]);

// //     useEffect(() => { load(); }, [load]);

// //     return {


// //         selectedCollege,
// //         setSelectedCollege,
// //         colleges,
// //         stats,
// //         trainers,
// //         schedule,
// //         attendance,
// //         subjectDist,
// //         contractExpiry,
// //         loading,
// //         error,
// //         refresh: load,

// //     };
// // }