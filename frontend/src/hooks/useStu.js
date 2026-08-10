// useDashboard.js
import { useState, useEffect, useCallback ,setError} from "react";
import {
    fetchMyPerformance,
    submitAssessment,
    fetchAssessments,
    fetchContentSkeletons,
    fetchContents,
    fetchProgramStructure,
    handlePreviewFile,
    fetchStudentUpcomingClasses,

} from "../services/dashboardapi";

export function useStu(token) {

    const [myPerformance, setMyPerformance] = useState(null);
    const [AllAssessments, setAllAssessments] = useState([]);
    // ContentSkeletons
    const [AllContentSkeletons, setAllContentSkeletons] = useState([]);
    // Content
    const [AllContents, setAllContents] = useState([]);
    const [ProgramStructure, setProgramStructure] = useState([]);
    //slots
    const [AllSlots, setAllSlots] = useState([]);


    const fetchMyPerformanceData = useCallback(async () => {
        try {
            const data = await fetchMyPerformance(token);
            setMyPerformance(data);
        } catch (error) {
            console.error("Error fetching my performance:", error);
        }
    }, [token]);





    const refreshAssessments = useCallback(async () => {
        try {
            const data = await fetchAssessments(token);
            setAllAssessments(data.data);
        } catch (err) {
            setError(err.message || "Failed to fetch assessments");
        }
    }, [token]);

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


    const refreshUpcomingClasses = useCallback(async () => {
    try {
        const classes = await fetchStudentUpcomingClasses(token);

        setAllSlots(classes);
    } catch (err) {
        setError(err.message || "Failed to fetch upcoming classes");
    }
}, [token]);



    // -------------------- Initial Load  --------------------
    useEffect(() => {
        fetchMyPerformanceData();
        refreshAssessments();
        refreshContents();
        refreshContentSkeletons();
        refreshUpcomingClasses();
    }, [fetchMyPerformanceData, refreshAssessments, refreshContents, refreshContentSkeletons,refreshUpcomingClasses]);




    return {
        // Data
        myPerformance,
        submitAssessment,
        AllAssessments,
        refreshAssessments,


        AllContentSkeletons,

        AllContents,
        ProgramStructure,

        previewContent:handlePreviewFile,

        AllSlots,
    };
}



