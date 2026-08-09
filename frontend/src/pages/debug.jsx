
import { useState, useEffect } from 'react';
import Main from './Main'
import { useDashboard } from "../hooks/useDashboard";
import { useTrainer } from "../hooks/useTrainer";
import { useModer } from "../hooks/useModer";
import { useStu } from "../hooks/useStu";



function Debug() {
    const [token, setT] = useState(null);
    // const {
    //     myPerformance,
    //     //     AllAssessments,
        
    //     AllContentSkeletons,
        
    //     // // Content
    //     AllContents,
    //     ProgramStructure,
    // } = useStu(token);
    // const {
    //     colleges,


    //     stats,

    //     loading,
    //     error,

    //     UpcomingClasses,
    //     Analytics,
    //     AttendanceChart,
    //     SubjectDistributionAttendance,
    //     AttendanceByCollegeAndSession,

    //     // slots
    //     AllSlots,
    //     UpcomingSlotsByColl,

    //     fetchSlotById,
    //     fetchAttendanceById,
    //     // submitAttendance,
    //     fetchUpcomingClasses,
    //     fetchSlotAnalytics,

    //     selectedDate,
    //     setSelectedDate,




    //     // sessions
    //     AllSessions,
    //     setCurrentSession,
    //     CurrentSession,

    //     // students
    //     Allstudents,

    //     fetchStudentsByCourse,

    //     // courses
    //     AllCourses,
    //     fetchCourseById,

    //     AllContentSkeletons,

    //     // Content
    //     AllContents,
    //     ProgramStructure,

    //     previewContent,


    //     // Assessments,
    //     AllAssessments,
    //     AssessmentSubmissions,
    //     getAssessmentSubmissions,


    //     // Feedback
    //     AllFeedback,


    //     // performance
    //     StudentPerformance,
    //     getStuPerformance,    
    
    
    // } = useModer(token);
    
    
    // const {
        //     // AllSchedules,
        //     AllSlots,
        //     Allstudents,
        //     AllUpcommingSlots,
        //     studentsbycoll,
        // } = useTrainer(token);
        
        // const {
            //     selectedCollege,
            //     setSelectedCollege,
            //     colleges,
            // stats,
            //     trainers,
            //     schedule,
            //     attendance,
            //     courseDist,
            //     contractExpiry,
            //     loading,
            //     //stats
    //     error,

    //     // attendance

    //     upcomingClasses,
    //     AttendanceChart,
    //     SubjectDistributionAttendance,
        // AttendanceByCollegeAndSession,


    //     // schedules
    //     UpcomingScheduleByColl,
    //     AllSchedules,


    //     //contracts

    //     AllContracts,
    //     ExpContracts,


    //     //sessions

    //     AllSessions,


    //     //students

        // Allstudents,

    //     //Courses

        // AllCourses,
        
        //     //Trainers
        //     AllTrainers,
        //     TrainersByColl,
        
        //     //Moderator
        //     AllModerators,
        
        //      AllUsers,
        
        // AllSlots,

        // AllContentSkeletons,

        // // Content
        // AllContents,
        // ProgramStructure,

        // // Assessments,
        // AllAssessments,

        // // Feedback
        // AllFeedback,
        // MyFeedback,

        // // performance
        // StudentPerformance,

    // } = useDashboard(token);



// console.log(typeof(AttendanceChart));

    return (
        <>
            <Main t={setT} />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <div className="dash">
                {token}
                <br />
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                <br />
        colleges,


        stats,

        loading,
        error,

        UpcomingClasses,
        Analytics,
        AttendanceChart,
        SubjectDistributionAttendance,
        AttendanceByCollegeAndSession,

        // slots
        AllSlots,
        UpcomingSlotsByColl,

        fetchSlotById,
        fetchAttendanceById,
        // submitAttendance,
        fetchUpcomingClasses,
        fetchSlotAnalytics,

        selectedDate,
        setSelectedDate,




        // sessions
        AllSessions,
        setCurrentSession,
        CurrentSession,

        // students
        Allstudents,

        fetchStudentsByCourse,

        // courses
        AllCourses,
        fetchCourseById,

        AllContentSkeletons,

        // Content
        AllContents,
        ProgramStructure,

        previewContent,


        // Assessments,
        AllAssessments,
        AssessmentSubmissions,
        getAssessmentSubmissions,


        // Feedback
        AllFeedback,


        // performance
        StudentPerformance,
        getStuPerformance,    
    
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??

                 {/* <br />
                    colleges
                <br />
                <br />
                <br />
                <br />
                -colleges :
                
                 <pre>{JSON.stringify(colleges, null, 2)}</pre>
                <br />
                <br />
                <br />
                stats :
                
                 <pre>{JSON.stringify(stats, null, 2)}</pre> 
                <br />
                <br />
                <br />
                AttendanceChart :
                
                 <pre>{JSON.stringify(AttendanceChart, null, 2)}</pre> 
                <br />
                <br />
                <br /> 
                SubjectDistribution :
                
                 <pre>{JSON.stringify(SubjectDistribution, null, 2)}</pre> 
                <br />
                <br />
                <br /> 
                AllSessions :
                
                 <pre>{JSON.stringify(AllSessions, null, 2)}</pre> 
                <br />
                <br />
                <br /> 
                CurrentSession :
                
                 <pre>{JSON.stringify(CurrentSession, null, 2)}</pre> 
                <br />
                <br />
                <br /> 
                AllSlots :
                
                 <pre>{JSON.stringify(AllSlots, null, 2)}</pre> 
                 {console.log(AllSlots)}
                <br />
                <br />
                <br /> 
                UpcomingSlotsByColl :
                
                 <pre>{JSON.stringify(UpcomingSlotsByColl, null, 2)}</pre> 
                <br />
                <br />
                <br /> 
                Allstudents :
                
                 <pre>{JSON.stringify(Allstudents, null, 2)}</pre> 
                <br />
                <br />
                <br />  */}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
{/* 











                Dash











                <br />






                {/* selected coll id  :   {selectedCollege} */}
                
                
                {/* <br />
                colledges : 
                <pre>{JSON.stringify(colleges, null, 2)}</pre> */}
                
                
                
                
                
                
                {/* <br />
                stats  :
                 <pre>{JSON.stringify(stats, null, 2)}</pre>
                
                
                
                
                
                
                
                
                
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
{/* 
                 <br />
                    attendance
                <br />
                <br />
                <br />
                <br />
                upcoming-classes :
                
                 <pre>{JSON.stringify(upcomingClasses, null, 2)}</pre> it will work , trainer login is currently not made
                <br />
                <br />
                <br />
                AttendanceChart :
                
                 <pre>{JSON.stringify(AttendanceChart, null, 2)}</pre> 
                <br />
                <br />
                <br />
                SubjectDistributionAttendance :
                
                 <pre>{JSON.stringify(SubjectDistributionAttendance, null, 2)}</pre> 
                <br />
                <br />
                <br /> */}
                {/* AllUsers :
                
                 <pre>{JSON.stringify(AllUsers, null, 2)}</pre> 
                <br />
                <br />
                    
                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??

                 {/* <br />
                    myPerformance
                <br />
                <br />
                <br />
                <br />
                myPerformance :
                
                 <pre>{JSON.stringify(myPerformance, null, 2)}</pre> 
                <br /> */}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??

                 {/* <br />
                    AllContentSkeletons
                <br />
                <br />
                <br />
                <br />
                uAllContentSkeletons :
                
                 <pre>{JSON.stringify(AllContentSkeletons, null, 2)}</pre> 
                <br />

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??

                 <br />
                            AllContents,
                            ProgramStructure,

                <br />
                <br />
                <br />
                <br />
                        AllContents,

                
                 <pre>{JSON.stringify(AllContents, null, 2)}</pre> 
                <br />

                        ProgramStructure,
           
                 <pre>{JSON.stringify(ProgramStructure, null, 2)}</pre> 
                <br /> */}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
{/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??

                 <br />
                            AllAssessments,

                <br />
                <br />
                <br />
                <br />
                        AllAssessments,

                
                 <pre>{JSON.stringify(AllAssessments, null, 2)}</pre> 
                <br />

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////?? */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
{/* 
                 <br />
                                    AllFeedback,
        MyFeedback

                <br />
                <br />
                <br />
                <br />
                        AllFeedback,

                
                 <pre>{JSON.stringify(AllFeedback, null, 2)}</pre> 
                <br />
                <br />
                MyFeedback, 

                
                 <pre>{JSON.stringify(MyFeedback, null, 2)}</pre> //student
                <br /> */}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??

                 {/* <br />
                                    fetchStudentPerformance

                <br />
                <br />
                <br />
                <br />
                        fetchStudentPerformance

                
                 <pre>{JSON.stringify(StudentPerformance, null, 2)}</pre> 
                <br /> */}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
{/* 
                 <br />
                    attendance
                <br />
                <br />
                <br />
                <br />
                upcoming-classes :
                
                 <pre>{JSON.stringify(upcomingClasses, null, 2)}</pre> it will work , trainer login is currently not made
                <br />
                <br />
                <br />
                AttendanceChart :
                
                 <pre>{JSON.stringify(AttendanceChart, null, 2)}</pre> 
                <br />
                <br />
                <br />
                SubjectDistributionAttendance :
                
                 <pre>{JSON.stringify(SubjectDistributionAttendance, null, 2)}</pre> 
                <br />
                <br />
                <br /> */}
                {/* AttendanceByCollegeAndSession :
                
                 <pre>{JSON.stringify(AttendanceByCollegeAndSession, null, 2)}</pre> 
                <br />
                <br />
                    
                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??

                 {/* <br />
                    Moderators
                <br />
                <br />
                <br />
                <br />
                AllModerators :
                
                 <pre>{JSON.stringify(AllModerators, null, 2)}</pre> it will work , trainer login is currently not made
                <br />
                <br /> */}
            
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
{/* 
                 <br />
                    studentsbycoll
                <br />
                <br />
                <br />
                <br />
                studentsbycoll :
                
                 <pre>{JSON.stringify(studentsbycoll, null, 2)}</pre> 
                <br />
                <br /> */}
            
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                {/* <br />

                    schedules
                <br />
                <br />
                <br />
                <br /> */}
                {/* UpcomingScheduleByColl :
                
                 <pre>{JSON.stringify(UpcomingScheduleByColl, null, 2)}</pre>  too long , but working
                <br /> */}
                {/* <br />
                <br />
                AllSlots :
                
                 <pre>{JSON.stringify(AllSlots, null, 2)}</pre>   same, too long , but working
                <br />
                <br />
              
                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                {/* <br />

                    schedules
                <br />
                <br />
                <br />
                <br /> */}
                {/* UpcomingScheduleByColl :
                
                 <pre>{JSON.stringify(UpcomingScheduleByColl, null, 2)}</pre>  too long , but working
                <br /> */}
                {/* <br />
                <br />
                AllUpcommingSlots :
                
                 <pre>{JSON.stringify(AllUpcommingSlots, null, 2)}</pre>   same, too long , but working
                <br />
                <br />
              
                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                {/* <br />

                    contracts
                <br />
                <br />
                <br />
                <br />
                AllContracts :
                
                 <pre>{JSON.stringify(AllContracts, null, 2)}</pre>                  
                 <br />

                <br />
                <br />
                ExpContracts :
                
                 <pre>{JSON.stringify(ExpContracts, null, 2)}</pre>                  
                 <br />

                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                {/* <br />

                    sessions
                <br />
                <br />
                <br />
                <br />
                AllSessions :
                
                 <pre>{JSON.stringify(AllSessions, null, 2)}</pre>                  
                 <br />

                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                {/* <br />

                    students
                <br />
                <br />
                <br />
                <br />
                Allstudents :
                
                 <pre>{JSON.stringify(Allstudents, null, 2)}</pre>                   working , but too long
                 <br />

                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                {/* <br />

                    Courses
                <br />
                <br />
                <br />
                <br />
                AllCourses :
                
                 <pre>{JSON.stringify(AllCourses, null, 2)}</pre>   
                 <br />

                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                {/* <br />

                    Trainers
                <br />
                <br />
                <br />
                <br />
                AllTrainers :
                
                 <pre>{JSON.stringify(AllTrainers, null, 2)}</pre>   
                 <br />

                <br />
                <br />
                TrainersByColl :
                
                 <pre>{JSON.stringify(TrainersByColl, null, 2)}</pre>   
                 <br />

                <br />



 */}
            </div>


        </>
    );


}

export default Debug;