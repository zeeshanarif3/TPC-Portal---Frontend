// courses

// router.post('/', verifyToken, adminModeratorMiddleware, createCourse);
// router.get('/', verifyToken, adminModeratorMiddleware, getAllCourses);
// router.get('/:id', verifyToken, adminModeratorMiddleware, getCourseById);
// router.put('/:id', verifyToken, adminModeratorMiddleware, updateCourse);
// router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteCourse);

// Dashboard route for stats
// router.get('/stats', verifyToken, adminModeratorMiddleware, getDashboardStats);


// Admin Routes for Sessions
// router.post('/', verifyToken, adminModeratorMiddleware, createSession);
// router.get('/', verifyToken, adminModeratorMiddleware, getAllSessions);
// router.get('/:id', verifyToken, adminModeratorMiddleware, getSessionById);
// router.put('/:id', verifyToken, adminModeratorMiddleware, updateSession);
// router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteSession);



// Standard Scheduling / Slot Routes
// router.get('/upcoming', verifyToken, adminModeratorMiddleware, getUpcomingSlotsByCollege);
// router.get('/analytics', verifyToken, moderatorMiddleware, getAnalytics);
// router.get('/chart', verifyToken, adminModeratorMiddleware, getAttendanceChartByCollege);
// router.get('/distribution', verifyToken, adminModeratorMiddleware, getSubjectDistributionByCollege);
// router.get('/college/:collegeId/session/:sessionId', verifyToken, adminModeratorMiddleware, getAttendanceByCollegeAndSession);
// router.post('/', verifyToken, adminModeratorMiddleware, createSlot);
// router.post('/append-slots-csv', verifyToken, adminModeratorMiddleware, appendSlotsViaCSV);
// router.get('/:id', verifyToken, adminModeratorMiddleware, getSlotById);
// router.put('/:id', verifyToken, adminModeratorMiddleware, updateSlot);
// router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteSlot);
// router.get('/:id/attendance', verifyToken, adminModeratorMiddleware, getAttendanceById);



// // Admin Routes for Students
// router.post('/', verifyToken, adminModeratorMiddleware, createStudent);
// router.get('/:id', verifyToken, adminModeratorMiddleware, getStudentById);
// router.put('/:id', verifyToken, adminModeratorMiddleware, updateStudent);
// router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteStudent);


// useModer.js
import { useState, useEffect, useCallback } from 'react';
import {
    fetchDashboardStats,




    // sessions
    fetchSessions,
    // createSession,
    // updateSession,
    // deleteSession,

    // students
    fetchStudents,
    // createStudent,
    // updateStudent,
    // deleteStudent,
    fetchStudentsByCourse,

    // course
    fetchCourses,
    // createCourse,
    fetchCourseById,
    // updateCourse,
    // deleteCourse,

    // // trainers
    // fetchTrainers,
    // fetchTrainersByCollege,
    // createTrainer,
    // deleteTrainer,
    // updateTrainer,
    // fetchTrainerById,


    // // moderator
    // getAllModerators,
    // createModerator,
    // updateModerator,
    // deleteModerator,

    // slots
    // slots
    fetchSlots,
    fetchSlotById,
    // createSlot,
    // updateSlot,
    // deleteSlot,
    fetchUpcomingSlots,
    // appendSlotsViaCSV,
    // updateTopicAndFeedback,
    fetchUpcomingClasses,
    // submitAttendance,
    fetchAttendanceById,
    fetchSlotAnalytics,
    fetchAttendanceChart,
    fetchSubjectDistribution,
    fetchAttendanceByCollegeAndSession,




    // ==========================
    // Content Skeleton
    // ==========================
    // createContentSkeleton,
    fetchContentSkeletons,
    fetchContentSkeletonById,
    // updateContentSkeleton,
    // deleteContentSkeleton,

    // ==========================
    // Content
    // ==========================
    // createContent,
    fetchContents,
    fetchContentById,
    // updateContent,
    // deleteContent,
    // downloadContent,
    fetchProgramStructure,
    handlePreviewFile,
    handleDownloadFile,

    // ==========================
    // Assessments
    // ==========================
    // createAssessment,
    fetchAssessments,
    fetchAssessmentById,
    // updateAssessment,
    // deleteAssessment,

    // Assessment Submissions
    // submitAssessment,
    fetchMyAssessmentSubmission,
    fetchAssessmentSubmissions,

    // ==========================
    // Feedback
    // ==========================
    // createFeedback,
    fetchFeedback,
    // fetchMyFeedback,
    // updateFeedback,
    // deleteFeedback,

    // ==========================
    // Performance
    // ==========================
    // fetchMyPerformance,
    fetchStudentPerformance,



} from '../services/dashboardapi';

// ─── Config ───────────────────────────────────────────────────────────────────

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useModer(token) {
    // const [selectedCollege, setSelectedCollege] = useState('');
    // const [colleges, setColleges] = useState([]);
    // const [stats, setStats] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    // const [trainers, setTrainers] = useState([]);
    // const [schedule, setSchedule] = useState([]);
    // const [attendance, setAttendance] = useState([]);
    // const [courseDist, setCourseDist] = useState([]);
    // const [contractExpiry, setContractExpiry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // attendance
    // const [UpcomingClasses, setUpcomingClasses] = useState(null);
    const [Analytics, setAnalytics] = useState(null);
    // const [AttendanceChart, setAttendanceChart] = useState([]);
    // const [SubjectDistributionAttendance, setSubjectDistributionAttendance] = useState([]);
    const [AttendanceByCollegeAndSession, setAttendanceByCollegeAndSession] = useState([]);

    // schedule
    // const [UpcomingScheduleByColl, setUpcomingScheduleByColl] = useState([]);
    // const [AllSchedules, setAllSchedules] = useState([]);

    // slots
    const [AllSlots, setAllSlots] = useState([]);
    const [UpcomingSlotsByColl, setUpcomingSlotsByColl] = useState([]);

    // contracts
    // const [AllContracts, setAllContracts] = useState([]);
    // const [ExpContracts, setExpContracts] = useState([]);

    // sessions
    const [AllSessions, setAllSessions] = useState([]);
    const [CurrentSession, setCurrentSession] = useState('');

    // students
    const [Allstudents, setAllstudents] = useState([]);

    // courses
    const [AllCourses, setAllCourses] = useState([]);

    // trainers
    // const [AllTrainers, setAllTrainers] = useState([]);
    // const [TrainersByColl, setTrainersByColl] = useState([]);

    // moderator
    // const [AllModerators, setAllModerators] = useState([]);

    // const [AllUsers, setAllUsers] = useState([]);

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
    // const [MyFeedback, setMyFeedback] = useState([]);

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

    // useEffect(() => {

    // // if (USE_MOCK) {
    // //     setColleges(MOCK_COLLEGES);

    // //     if (MOCK_COLLEGES.length > 0) {
    // //         setSelectedCollege(MOCK_COLLEGES[0]._id);
    // //     }

    // //     return;
    // // }

    // fetchColleges(token)
    //     .then((data) => {
    //         setColleges(data);

    //         // Select first college if none is selected
    //         if (data.length > 0) {
    //             setSelectedCollege(data[0]._id);
    //         }
    //     })
    //     .catch(err => setError(err.message || 'Failed to fetch colleges'));
    // }, [token]);
    // ── Feature loaders ─────────────────────────────────────────────────────

    // const refreshDashboard = useCallback(async () => {
    //     // if (USE_MOCK) {
    //     //     setStats(MOCK_STATS);
    //     //     return;
    //     // }
    //     try {
    //         const data = await fetchDashboardStats(token);
    //         const chart = await fetchAttendanceChart( token);
    //         const subjectDist = await fetchSubjectDistribution(token);

    //         setStats(data);
    //         setAttendanceChart(chart);
    //         setSubjectDistributionAttendance(subjectDist);
    //     } catch (err) {
    //         setError(err.message || 'Failed to fetch dashboard stats');
    //     }
    // }, [token]);

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
                // fetchUpcomingSlots("a", token),
                fetchSlots({}, token),
            ]);

            // setUpcomingSlotsByColl(upcoming);
            setAllSlots(all);

        } catch (err) {
            setError(err.message || 'Failed to fetch slots');
        }

    }, [token]);




    // const refreshContracts = useCallback(async () => {
    //     // if (USE_MOCK) {
    //     //     setContractExpiry(MOCK_CONTRACT_EXPIRY);
    //     //     return;
    //     // }
    //     try {
    //         const [all, expiring] = await Promise.all([
    //             fetchContracts(token),
    //             fetchContractExpiry("", token),
    //         ]);
    //         setAllContracts(all);
    //         setExpContracts(expiring);
    //     } catch (err) {
    //         setError(err.message || 'Failed to fetch contracts');
    //     }
    // }, ["", token]);

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

    // const refreshTrainers = useCallback(async () => {
    //     // if (USE_MOCK) {
    //     //     setTrainers(MOCK_TRAINERS);
    //     //     return;
    //     // }
    //     try {
    //         const [all, byCollege] = await Promise.all([
    //             fetchTrainers(token),
    //             fetchTrainersByCollege("", token),
    //         ]);
    //         setAllTrainers(all);
    //         setTrainersByColl(byCollege);
    //     } catch (err) {
    //         setError(err.message || 'Failed to fetch trainers');
    //     }
    // }, ["", token]);

    // const refreshAllUsers = useCallback(async () => {
    //     try {
    //         const [all] = await Promise.all([
    //             fetchUsersForAdmin(token),
    //         ]);
    //         setAllUsers(all);
    //     } catch (err) {
    //         setError(err.message || 'Failed to fetch trainers');
    //     }
    // }, [token]);

    // const refreshModerators = useCallback(async () => {
    //     // if (USE_MOCK) {
    //     //     setAllModerators(MOCK_TRAINERS);
    //     //     return;
    //     // }
    //     try {
    //         const [all] = await Promise.all([
    //             getAllModerators(token),

    //         ]);
    //         setAllModerators(all);
    //     } catch (err) {
    //         setError(err.message || 'Failed to fetch moderators');
    //     }
    // }, [selectedCollege, token]);

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
        // if (!selectedCollege || !CurrentSession) return;
        try {
            const [byCollegeAndSession] = await Promise.all([
                fetchAttendanceByCollegeAndSession("", CurrentSession, token),
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
        // if (!selectedCollege) return;

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
                                                            // refreshDashboard(),
                                                            // // refreshSchedules()
                    refreshSlots(),
                                                       // refreshContracts(),
                    // refreshStudents(),
                    // refreshCourses(),
                                                    // refreshTrainers(),
                                                    // refreshAllUsers(),
                    // refreshSessions(),
                                                             // refreshModerators(),
                    // refreshContentSkeletons(),
                    // refreshContents(),
                    // refreshAssessments(),
                    // refreshFeedback(),
                                                          // refreshPerformance(),
                ]);
                // }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };

        // }, [refreshDashboard, refreshSlots, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshAllUsers , refreshModerators, refreshContentSkeletons, refreshSessions, refreshAttendance ,refreshContents ,refreshAssessments , refreshFeedback ]);
    }, [refreshSlots]);

    // ── Effect: session changes ─────────────────────────────────────────────
    // Only reloads attendance-related data, never runs without a valid session

    useEffect(() => {
        refreshAttendance();
    }, [refreshAttendance]);












    // ── Manual full refresh ─────────────────────────────────────────────────


    const refresh = useCallback(async () => {
        await Promise.all([
            // refreshDashboard(),
            // // refreshSchedules()
            refreshSlots(),
            // refreshContracts(),
            refreshStudents(),
            refreshCourses(),
            // refreshTrainers(),
            // refreshAllUsers(),
            refreshSessions(),
            // refreshModerators(),
            refreshContentSkeletons(),
            refreshContents(),
            refreshAssessments(),
            refreshFeedback(),
            // refreshPerformance(),
        ]);
        await refreshAttendance();
        // }, [refreshDashboard, refreshSchedules, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshModerators, refreshSessions, refreshAttendance]);
        // }, [refreshDashboard, refreshSlots, refreshContracts, refreshStudents, refreshCourses, refreshTrainers , refreshAllUsers , refreshModerators, refreshContentSkeletons, refreshSessions, refreshAttendance ,refreshContents ,refreshAssessments , refreshFeedback , refreshPerformance]);
    }, [ refreshSlots , refreshStudents, refreshCourses, refreshContentSkeletons, refreshSessions, refreshAttendance, refreshContents, refreshAssessments, refreshFeedback]);











    return {
        // updateUserActiveStatus:handleupdateUserActiveStatus,
        // selectedCollege,
        // setSelectedCollege,
        // colleges,

        // createCollege: handleCreateCollege,
        // updateCollege: handleUpdateCollege,
        // deleteCollege: handleDeleteCollege,
        // stats,

        loading,
        error,

        // attendance
        // UpcomingClasses,
        Analytics,
        // AttendanceChart,
        // SubjectDistributionAttendance,
        AttendanceByCollegeAndSession,

        // slots
        AllSlots,
        UpcomingSlotsByColl,

        // createSlot: handleCreateSlot,
        // updateSlot: handleUpdateSlot,
        // deleteSlot: handleDeleteSlot,
        // appendSlotsViaCSV: handleAppendSlotsCSV,
        // updateTopicAndFeedback: handleUpdateTopicFeedback,
        fetchSlotById,
        fetchAttendanceById,
        // submitAttendance,
        fetchUpcomingClasses,
        fetchSlotAnalytics,

        selectedDate,
        setSelectedDate,


        // contracts
        // AllContracts,
        // ExpContracts,
        // createContract,
        // createContract: handleCreateContract,
        // updateContract: handleUpdateContract,
        // deleteContract: handleDeleteContract,

        // sessions
        AllSessions,
        setCurrentSession,
        CurrentSession,
        // createSession,
        // createSession: handleCreateSession,
        // updateSession: handleUpdateSession,
        // deleteSession: handleDeleteSession,

        // students
        Allstudents,
        // createStudent: handleCreateStudent,
        // updateStudent: handleUpdateStudent,
        // deleteStudent: handleDeleteStudent,
        fetchStudentsByCourse,

        // courses
        AllCourses,
        fetchCourseById,
        // createCourse,
        // updateCourse,
        // deleteCourse,
        // createCourse: handleCreateCourse,
        // updateCourse: handleUpdateCourse,
        // deleteCourse: handleDeleteCourse,

        // trainers
        // AllTrainers,
        // TrainersByColl,
        // fetchTrainerById,
        // createTrainer,
        // createTrainer: handleCreateTrainer,
        // updateTrainer: handleUpdateTrainer,
        // deleteTrainer: handleDeleteTrainer,

        // Moderator 
        // AllModerators,
        // createModerator,
        // createModerator: handleCreateModerator,
        // updateModerator: handleUpdateModerator,
        // deleteModerator: handleDeleteModerator,



        // ContentSkeleton
        // createContentSkeleton: handleCreateContentSkeleton,
        // updateContentSkeleton: handleUpdateContentSkeleton,
        // deleteContentSkeleton: handleDeleteContentSkeleton,
        AllContentSkeletons,

        // Content
        AllContents,
        ProgramStructure,
        // createContent: handleCreateContent,
        // updateContent: handleUpdateContent,
        // deleteContent: handleDeleteContent,
        // downloadContent:handleDownloadFile,
        previewContent: handlePreviewFile,


        // Assessments,
        AllAssessments,
        AssessmentSubmissions,
        getAssessmentSubmissions,
        // createAssessment: handleCreateAssessment,
        // updateAssessment: handleUpdateAssessment,
        // deleteAssessment :handleDeleteAssessment,


        // Feedback
        AllFeedback,
        // MyFeedback,
        // createFeedback: handleCreateFeedback,
        // updateFeedback: handleUpdateFeedback,
        // deleteFeedback: handleDeleteFeedback,



        // performance
        StudentPerformance,
        getStuPerformance,



        // AllUsers,

        refresh,
    };
}



