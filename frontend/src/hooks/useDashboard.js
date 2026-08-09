// useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import {
    fetchDashboardStats,
    updateUserActiveStatus,
    fetchUsersForAdmin,
    
    // colleges

    fetchColleges,
    createCollege,
    deleteCollege,
    updateCollege,


    // attendance
    // fetchAttendanceChart,
    // fetchSubjectDistribution,
    // fetchAttendanceByCollegeAndSession,
    // createAttendance,
    // updateAttendance,

    // schedules
    // fetchUpcomingSchedule,
    // fetchSchedules,
    // createSchedule,
    // updateSchedule,
    // deleteSchedule,
    // appendSlotsViaCSV,
    // fetchUpcomingScheduleByCollege,
    // deleteSchedule,
    // updateSchedule,
    // fetchSchedules,
    // createSchedule,
    // fetchScheduleById,

    // contracts
    fetchContracts,
    fetchContractExpiry,
    createContract,
    updateContract,
    deleteContract,


    // sessions
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,

    // students
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    fetchStudentsByCourse,

    // course
    fetchCourses,
    createCourse,
    fetchCourseById,
    updateCourse,
    deleteCourse,

    // trainers
    fetchTrainers,
    fetchTrainersByCollege,
    createTrainer,
    deleteTrainer,
    updateTrainer,
    fetchTrainerById,


    // moderator
    getAllModerators,
    createModerator,
    updateModerator,
    deleteModerator,

    // slots
    // slots
    fetchSlots,
    fetchSlotById,
    createSlot,
    updateSlot,
    deleteSlot,
    fetchUpcomingSlots,
    appendSlotsViaCSV,
    updateTopicAndFeedback,
    fetchUpcomingClasses,
    submitAttendance,
    fetchAttendanceById,
    fetchSlotAnalytics,
    fetchAttendanceChart,
    fetchSubjectDistribution,
    fetchAttendanceByCollegeAndSession,




    // ==========================
    // Content Skeleton
    // ==========================
    createContentSkeleton,
    fetchContentSkeletons,
    fetchContentSkeletonById,
    updateContentSkeleton,
    deleteContentSkeleton,

    // ==========================
    // Content
    // ==========================
    createContent,
    fetchContents,
    fetchContentById,
    updateContent,
    deleteContent,
    // downloadContent,
    fetchProgramStructure,
    handlePreviewFile,
    handleDownloadFile,

    // ==========================
    // Assessments
    // ==========================
    createAssessment,
    fetchAssessments,
    fetchAssessmentById,
    updateAssessment,
    deleteAssessment,

    // Assessment Submissions
    submitAssessment,
    fetchMyAssessmentSubmission,
    fetchAssessmentSubmissions,

    // ==========================
    // Feedback
    // ==========================
    createFeedback,
    fetchFeedback,
    // fetchMyFeedback,
    updateFeedback,
    deleteFeedback,

    // ==========================
    // Performance
    // ==========================
    // fetchMyPerformance,
    fetchStudentPerformance,



} from '../services/dashboardapi';

// ─── Config ───────────────────────────────────────────────────────────────────

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboard(token) {
    const [selectedCollege, setSelectedCollege] = useState('');
    const [colleges, setColleges] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    // const [trainers, setTrainers] = useState([]);
    // const [schedule, setSchedule] = useState([]);
    // const [attendance, setAttendance] = useState([]);
    // const [courseDist, setCourseDist] = useState([]);
    // const [contractExpiry, setContractExpiry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // attendance
    const [UpcomingClasses, setUpcomingClasses] = useState(null);
    const [Analytics, setAnalytics] = useState(null);
    const [AttendanceChart, setAttendanceChart] = useState([]);
    const [SubjectDistributionAttendance, setSubjectDistributionAttendance] = useState([]);
    const [AttendanceByCollegeAndSession, setAttendanceByCollegeAndSession] = useState([]);

    // schedule
    // const [UpcomingScheduleByColl, setUpcomingScheduleByColl] = useState([]);
    // const [AllSchedules, setAllSchedules] = useState([]);
    
    // slots
    const [AllSlots, setAllSlots] = useState([]);
    const [UpcomingSlotsByColl, setUpcomingSlotsByColl] = useState([]);

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

    // moderator
    const [AllModerators, setAllModerators] = useState([]);
    
    const [AllUsers, setAllUsers] = useState([]);
    
    // ContentSkeletons
    const [AllContentSkeletons, setAllContentSkeletons] = useState([]);


    // Content
    const [AllContents, setAllContents] = useState([]);
    const [ProgramStructure, setProgramStructure] = useState([]);

    // Assessments
    const [AllAssessments, setAllAssessments] = useState([]);
    const [AssessmentSubmissions, setAssessmentSubmissions] = useState([]);
    // Feedback
    const [AllFeedback, setAllFeedback] = useState([]); 
    const [MyFeedback, setMyFeedback] = useState([]);

    // performance
    const [StudentPerformance, setStudentPerformance] = useState(null);


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

useEffect(() => {
    // if (USE_MOCK) {
    //     setColleges(MOCK_COLLEGES);

    //     if (MOCK_COLLEGES.length > 0) {
    //         setSelectedCollege(MOCK_COLLEGES[0]._id);
    //     }

    //     return;
    // }

    fetchColleges(token)
        .then((data) => {
            setColleges(data);

            // Select first college if none is selected
            if (data.length > 0) {
                setSelectedCollege(data[0]._id);
            }
        })
        .catch(err => setError(err.message || 'Failed to fetch colleges'));
}, [token]);
    // ── Feature loaders ─────────────────────────────────────────────────────

    const refreshDashboard = useCallback(async () => {
        // if (USE_MOCK) {
        //     setStats(MOCK_STATS);
        //     return;
        // }
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

    // const refreshSchedules = useCallback(async () => {
    //     if (USE_MOCK) {
    //         setSchedule(MOCK_SCHEDULE);
    //         return;
    //     }
    //     try {
    //         const [upcoming, all] = await Promise.all([
    //             fetchUpcomingScheduleByCollege(selectedCollege, token),
    //             fetchSchedules(token),
    //         ]);
    //         setUpcomingScheduleByColl(upcoming);
    //         setAllSchedules(all);
    //     } catch (err) {
    //         setError(err.message || 'Failed to fetch schedules');
    //     }
    // }, [selectedCollege, token]);



    const refreshSlots = useCallback(async () => {
        // if (USE_MOCK) {
        //     setAllSlots(MOCK_SCHEDULE);
        //     return;
        // }

        try {
            const [upcoming, all] = await Promise.all([
                fetchUpcomingSlots(selectedCollege, token),
                fetchSlots({}, token),
            ]);

            setUpcomingSlotsByColl(upcoming);
            setAllSlots(all);

        } catch (err) {
            setError(err.message || 'Failed to fetch slots');
        }

    }, [selectedCollege, token]);




    const refreshContracts = useCallback(async () => {
        // if (USE_MOCK) {
        //     setContractExpiry(MOCK_CONTRACT_EXPIRY);
        //     return;
        // }
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
        // if (USE_MOCK) return;
        try {
            const data = await fetchStudents(token);
            setAllstudents(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch students');
        }
    }, [token]);

    const refreshCourses = useCallback(async () => {
        // if (USE_MOCK) return;
        try {
            const data = await fetchCourses(token);
            setAllCourses(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
        }
    }, [token]);

    const refreshTrainers = useCallback(async () => {
        // if (USE_MOCK) {
        //     setTrainers(MOCK_TRAINERS);
        //     return;
        // }
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

    const refreshAllUsers = useCallback(async () => {
        try {
            const [all] = await Promise.all([
                fetchUsersForAdmin(token),
            ]);
            setAllUsers(all);
        } catch (err) {
            setError(err.message || 'Failed to fetch trainers');
        }
    }, [token]);

    const refreshModerators = useCallback(async () => {
        // if (USE_MOCK) {
        //     setAllModerators(MOCK_TRAINERS);
        //     return;
        // }
        try {
            const [all] = await Promise.all([
                getAllModerators(token),

            ]);
            setAllModerators(all);
        } catch (err) {
            setError(err.message || 'Failed to fetch moderators');
        }
    }, [selectedCollege, token]);

    // Loads sessions for the college and auto-selects the first one
    const refreshSessions = useCallback(async () => {
        // if (USE_MOCK) return;
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
        // if (USE_MOCK) {
        //     setAttendance(MOCK_ATTENDANCE);
        //     setCourseDist(MOCK_COURSE_DISTRIBUTION);
        //     return;
        // }
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


    const refreshContentSkeletons = useCallback(async (query = {}) => {
        try {
            const data = await fetchContentSkeletons(token, query);
            setAllContentSkeletons(data?.data ?? []);
        } catch (err) {
            setError(err.message || "Failed to fetch content skeletons");
        }
    }, [token]);


    const refreshContents = useCallback(async (query = {}) => {
    try {
        const [contents, structure] = await Promise.all([
            fetchContents(token, query),
            fetchProgramStructure(token),
        ]);

        setAllContents(contents?.data ?? []);
        setProgramStructure(structure);
        } catch (err) {
            setError(err.message || "Failed to fetch content");
        }
    }, [token]);


    const refreshAssessments = useCallback(async () => {
    try {
        const data = await fetchAssessments(token);
        setAllAssessments(data);
        } catch (err) {
            setError(err.message || "Failed to fetch assessments");
        }
    }, [token]);


    const getAssessmentSubmissions = async (assessmentId) => {
        try {
            const res = await fetchAssessmentSubmissions(assessmentId, token);
            setAssessmentSubmissions(res.data || []);
            return res.data || [];
        } catch (err) {
            console.error(err);
            setAssessmentSubmissions([]);
            throw err;
        }
    };

    const refreshFeedback = useCallback(async () => {
    try {
        const [all, mine] = await Promise.all([
            fetchFeedback(token),
            // fetchMyFeedback(token).catch(() => null),
        ]);

        setAllFeedback(all);
        // if (mine) setMyFeedback(mine);
        } catch (err) {
            setError(err.message || "Failed to fetch feedback");
        }
    }, [token]);


    // const refreshPerformance = useCallback(async () => {
    //     try {
    //         const data = await fetchStudentPerformance(token);
    //         setStudentPerformance(data);
    //     } catch {
    //         // Ignore for non-student users
    //     }
    // }, [token]);


    const getStuPerformance = async (stuId) => {
        try {
            const res = await fetchStudentPerformance(stuId, token);

            setStudentPerformance(res.data || {});
        } catch (err) {
            console.error(err);
            setStudentPerformance({});
            throw err;
        }
    };


    // ── Effect: college changes ─────────────────────────────────────────────
    // Loads everything that only depends on the college, then resolves session

    useEffect(() => {
        if (!selectedCollege) return;

        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                // if (USE_MOCK) {
                //     await new Promise(r => setTimeout(r, 300));
                //     if (cancelled) return;
                //     setStats(MOCK_STATS);
                //     setTrainers(MOCK_TRAINERS);
                //     setSchedule(MOCK_SCHEDULE);
                //     setCourseDist(MOCK_COURSE_DISTRIBUTION);
                //     setContractExpiry(MOCK_CONTRACT_EXPIRY);
                // } else {
                    await Promise.all([
                        refreshDashboard(),
                        // // refreshSchedules()
                        refreshSlots(), 
                        refreshContracts(),
                        refreshStudents(),
                        refreshCourses(),
                        refreshTrainers(),
                        refreshAllUsers(),
                        refreshSessions(),
                        refreshModerators(),
                        refreshContentSkeletons(),
                        refreshContents(),
                        refreshAssessments(),
                        refreshFeedback(),
                        // refreshPerformance(),
                    ]);
                    // }
                } finally {
                    if (!cancelled) setLoading(false);
                }
        })();
        
        return () => { cancelled = true; };
        // }, [selectedCollege, refreshDashboard, refreshSchedules,refreshSlots, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshModerators, refreshSessions]);
    }, [refreshDashboard, refreshSlots, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshAllUsers , refreshModerators, refreshContentSkeletons, refreshSessions, refreshAttendance ,refreshContents ,refreshAssessments , refreshFeedback ]);
    // }, [selectedCollege, refreshDashboard,refreshSlots, refreshContracts, refreshStudents, refreshCourses, refreshTrainers ,refreshAllUsers, refreshModerators, refreshSessions , refreshContentSkeletons ,refreshContents,refreshAssessments ,refreshFeedback ,refreshPerformance]);

    // ── Effect: session changes ─────────────────────────────────────────────
    // Only reloads attendance-related data, never runs without a valid session

    useEffect(() => {
        refreshAttendance();
    }, [refreshAttendance]);
    






    




    // ── Manual full refresh ─────────────────────────────────────────────────

    
    const refresh = useCallback(async () => {
        await Promise.all([
            refreshDashboard(),
            // refreshSchedules()
            refreshSlots(),
            refreshContracts(),
            refreshStudents(),
            refreshCourses(),
            refreshTrainers(),
            refreshAllUsers(),
            refreshModerators(),
            refreshSessions(),
            refreshContentSkeletons(),
            refreshContents(),
            refreshAssessments(),
            refreshFeedback(),
            // refreshPerformance(),
        ]);
        await refreshAttendance();
    // }, [refreshDashboard, refreshSchedules, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshModerators, refreshSessions, refreshAttendance]);
    // }, [refreshDashboard, refreshSlots, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshAllUsers , refreshModerators, refreshContentSkeletons, refreshSessions, refreshAttendance ,refreshContents ,refreshAssessments , refreshFeedback , refreshPerformance]);
    }, [refreshDashboard, refreshSlots, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshAllUsers , refreshModerators, refreshContentSkeletons, refreshSessions, refreshAttendance ,refreshContents ,refreshAssessments , refreshFeedback ]);








// ─────────────────────────────────────────────
// CRUD WRAPPERS WITH AUTO REFRESH
// ─────────────────────────────────────────────


// Colleges

const handleCreateCollege = async (data) => {
    const res = await createCollege(data, token);
    await fetchColleges(token).then(setColleges);
    await refresh();
    return res;
};


const handleUpdateCollege = async (id, data) => {
    const res = await updateCollege(id, data, token);
    await fetchColleges(token).then(setColleges);
    await refresh();
    return res;
};


const handleDeleteCollege = async (id) => {
    await deleteCollege(id, token);
    await fetchColleges(token).then(setColleges);
    await refresh();
};


// Slots

const handleCreateSlot = async (data) => {
    const res = await createSlot(data, token);
    await refreshSlots();
    return res;
};


const handleUpdateSlot = async (id, data) => {
    const res = await updateSlot(id, data, token);
    await refreshSlots();
    return res;
};


const handleDeleteSlot = async (id) => {
    await deleteSlot(id, token);
    await refreshSlots();
};


const handleAppendSlotsCSV = async (data) => {
    const res = await appendSlotsViaCSV(data, token);
    await refreshSlots();
    return res;
};


const handleUpdateTopicFeedback = async (id, data) => {
    const res = await updateTopicAndFeedback(id, data, token);
    await refreshSlots();
    return res;
};


// Contracts

const handleCreateContract = async (data) => {
    const res = await createContract(data, token);
    await refresh();
    return res;
};


const handleUpdateContract = async (id, data) => {
    const res = await updateContract(id, data, token);
    await refresh();
    return res;
};


const handleDeleteContract = async (id) => {
    await deleteContract(id, token);
    await refresh();
};




// Sessions

const handleCreateSession = async (data) => {
    const res = await createSession(data, token);
    await refresh();
    return res;
};


const handleUpdateSession = async (id, data) => {
    const res = await updateSession(id, data, token);
    await refresh();
    return res;
};


const handleDeleteSession = async (id) => {
    await deleteSession(id, token);
    await refresh();
};




// Students

const handleCreateStudent = async (data) => {
    const res = await createStudent(data, token);
    await refreshStudents();
    return res;
};


const handleUpdateStudent = async (id, data) => {
    const res = await updateStudent(id, data, token);
    await refreshStudents();
    return res;
};


const handleDeleteStudent = async (id) => {
    await deleteStudent(id, token);
    await refreshStudents();
};




// Courses

const handleCreateCourse = async (data) => {
    const res = await createCourse(data, token);
    await refresh();
    return res;
};


const handleUpdateCourse = async (id, data) => {
    const res = await updateCourse(id, data, token);
    await refresh();
    return res;
};


const handleDeleteCourse = async (id) => {
    await deleteCourse(id, token);
    await refresh();
};




// Trainers

const handleCreateTrainer = async (data) => {
    const res = await createTrainer(data, token);
    await refresh();
    return res;
};
// const handleCreateTrainer = async (data) => {
//     try {
//         const res = await createTrainer(data, token);

//         console.log("Trainer created");

//         await refresh();

//         console.log("Refresh completed");

//         return res;

//     } catch(err) {
//         console.log("CREATE/REFRESH ERROR:", err);
//         throw err;
//     }
// };

const handleUpdateTrainer = async (id, data) => {
    const res = await updateTrainer(id, data, token);
    await refresh();
    return res;
};
const handleupdateUserActiveStatus = async (id, active) => {
    const res = await updateUserActiveStatus(id, active, token);
    await refreshTrainers();
    await refreshAllUsers();
    return res;
};


const handleDeleteTrainer = async (id) => {
    await deleteTrainer(id, token);
    await refresh();
};




// Moderators

const handleCreateModerator = async (data) => {
    const res = await createModerator(data, token);
    await refresh();
    return res;
};


const handleUpdateModerator = async (id, data) => {
    const res = await updateModerator(id, data, token);
    await refresh();
    return res;
};


const handleDeleteModerator = async (id) => {
    await deleteModerator(id, token);
    await refresh();
};


// ContentSkeleton

const handleCreateContentSkeleton = async (data) => {
    const res = await createContentSkeleton(data, token);
    await refreshContentSkeletons();
    return res;
};

const handleUpdateContentSkeleton = async (id, data) => {
    const res = await updateContentSkeleton(id, data, token);
    await refreshContentSkeletons();
    return res;
};

const handleDeleteContentSkeleton = async (id) => {
    const res = await deleteContentSkeleton(id, token);
    await refreshContentSkeletons();
    return res;
};


// Content

const handleCreateContent = async (data) => {
    const res = await createContent(data, token);
    await refreshContents();
    return res;
};

const handleUpdateContent = async (id, data) => {
    const res = await updateContent(id, data, token);
    await refreshContents();
    return res;
};

const handleDeleteContent = async (id) => {
    const res = await deleteContent(id, token);
    await refreshContents();
    return res;
};





// assessments
const handleCreateAssessment = async (data) => {
    const res = await createAssessment(data, token);
    await refreshAssessments();
    return res;
};

const handleUpdateAssessment = async (id, data) => {
    const res = await updateAssessment(id, data, token);
    await refreshAssessments();
    return res;
};

const handleDeleteAssessment = async (id) => {
    const res = await deleteAssessment(id, token);
    await refreshAssessments();
    return res;
};



// Feedback
const handleCreateFeedback = async (data) => {
    const res = await createFeedback(data, token);
    await refreshFeedback();
    return res;
};

const handleUpdateFeedback = async (id, data) => {
    const res = await updateFeedback(id, data, token);
    await refreshFeedback();
    return res;
};

const handleDeleteFeedback = async (id) => {
    const res = await deleteFeedback(id, token);
    await refreshFeedback();
    return res;
};



    return {
        updateUserActiveStatus:handleupdateUserActiveStatus,
        selectedCollege,
        setSelectedCollege,
        colleges,
        // deleteCollege,
        // createCollege,
        createCollege: handleCreateCollege,
        updateCollege: handleUpdateCollege,
        deleteCollege: handleDeleteCollege,
        stats,
        // trainers,
        // schedule,
        // attendance,
        // courseDist,
        // contractExpiry,
        loading,
        error,

        // attendance
        UpcomingClasses,
        Analytics,
        AttendanceChart,
        SubjectDistributionAttendance,
        AttendanceByCollegeAndSession,
        // createAttendance: handleCreateAttendance,
        // updateAttendance: handleUpdateAttendance,


        // // schedule
        // // UpcomingScheduleByColl,
        // // AllSchedules,
        // // createSchedule,
        // createSchedule: handleCreateSchedule,
        // updateSchedule: handleUpdateSchedule,
        // deleteSchedule: handleDeleteSchedule,
        // // appendSlotsViaCSV,
        // UpcomingScheduleByColl,
        // AllSchedules,
        // // fetchUpcomingScheduleByCollege,
        // // deleteSchedule,
        // // updateSchedule,`
        // // fetchSchedules,
        // // createSchedule,
        // // fetchScheduleById,

        // slots
        AllSlots,
        UpcomingSlotsByColl,

        createSlot: handleCreateSlot,
        updateSlot: handleUpdateSlot,
        deleteSlot: handleDeleteSlot,
        appendSlotsViaCSV: handleAppendSlotsCSV,
        updateTopicAndFeedback: handleUpdateTopicFeedback,
        fetchSlotById,
        fetchAttendanceById,
        submitAttendance,
        fetchUpcomingClasses,
        fetchSlotAnalytics,

        selectedDate,
        setSelectedDate,


        // contracts
        AllContracts,
        ExpContracts,
        // createContract,
        createContract: handleCreateContract,
        updateContract: handleUpdateContract,
        deleteContract: handleDeleteContract,

        // sessions
        AllSessions,
        setCurrentSession,
        CurrentSession,
        // createSession,
        createSession: handleCreateSession,
        updateSession: handleUpdateSession,
        deleteSession: handleDeleteSession,

        // students
        Allstudents,
        createStudent: handleCreateStudent,
        updateStudent: handleUpdateStudent,
        deleteStudent: handleDeleteStudent,
        fetchStudentsByCourse,

        // courses
        AllCourses,
        fetchCourseById,
        // createCourse,
        // updateCourse,
        // deleteCourse,
        createCourse: handleCreateCourse,
        updateCourse: handleUpdateCourse,
        deleteCourse: handleDeleteCourse,

        // trainers
        AllTrainers,
        TrainersByColl,
        fetchTrainerById,
        // createTrainer,
        createTrainer: handleCreateTrainer,
        updateTrainer: handleUpdateTrainer,
        deleteTrainer: handleDeleteTrainer,

        // Moderator 
        AllModerators,
        // createModerator,
        createModerator: handleCreateModerator,
        updateModerator: handleUpdateModerator,
        deleteModerator: handleDeleteModerator,



        // ContentSkeleton
        createContentSkeleton: handleCreateContentSkeleton,
        updateContentSkeleton: handleUpdateContentSkeleton,
        deleteContentSkeleton: handleDeleteContentSkeleton,
        AllContentSkeletons,

        // Content
        AllContents,
        ProgramStructure,
        createContent: handleCreateContent,
        updateContent: handleUpdateContent,
        deleteContent: handleDeleteContent,
        downloadContent:handleDownloadFile,
        previewContent:handlePreviewFile,


        // Assessments,
        AllAssessments,
        AssessmentSubmissions,
        getAssessmentSubmissions,
        createAssessment: handleCreateAssessment,
        updateAssessment: handleUpdateAssessment,
        deleteAssessment :handleDeleteAssessment,


        // Feedback
        AllFeedback,
        MyFeedback,
        createFeedback: handleCreateFeedback,
        updateFeedback: handleUpdateFeedback,
        deleteFeedback: handleDeleteFeedback,



        // performance
        StudentPerformance,
        getStuPerformance,



        AllUsers,

        refresh,
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







