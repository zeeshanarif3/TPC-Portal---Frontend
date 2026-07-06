
import { useDashboard } from "../hooks/useDashboard";
import { useState, useEffect } from 'react';
import Main from './Main'



function Debug() {
    const [token, setT] = useState(null);


    const {
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

        upcomingClasses,
        AttendanceChart,
        SubjectDistributionAttendance,
        AttendanceByCollegeAndSession,


        // schedules
        UpcomingScheduleByColl,
        AllSchedules,


        //contracts

        AllContracts,
        ExpContracts,


        //sessions

        AllSessions,


        //students

        Allstudents,

        //Courses

        AllCourses,

        //Trainers
        AllTrainers,
        TrainersByColl,
    } = useDashboard(token);



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
                {/* <br />
                Dash











                <br />






                selected coll id  :   {selectedCollege}
                
                
                <br />
                colledges : 
                <pre>{JSON.stringify(colleges, null, 2)}</pre>
                
                
                
                
                
                
                <br />
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
                {/* AttendanceByCollegeAndSession :
                
                 <pre>{JSON.stringify(AttendanceByCollegeAndSession, null, 2)}</pre> 
                <br />
                <br />
                    
                <br /> */}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                <br />

                    schedules
                <br />
                <br />
                <br />
                <br />
                UpcomingScheduleByColl :
                
                 {/* <pre>{JSON.stringify(UpcomingScheduleByColl, null, 2)}</pre>  too long , but working */}
                <br />
                <br />
                <br />
                AllSchedules :
                
                 {/* <pre>{JSON.stringify(AllSchedules, null, 2)}</pre>   same, too long , but working */}
                <br />
                <br />
              
                <br />
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
                <br />
{/* 
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
                <br />

                    Courses
                <br />
                <br />
                <br />
                <br />
                AllCourses :
                
                 <pre>{JSON.stringify(AllCourses, null, 2)}</pre>   
                 <br />

                <br />
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////??
                <br />

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




            </div>


        </>
    );


}

export default Debug;