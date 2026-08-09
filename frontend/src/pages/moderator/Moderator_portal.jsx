


// import DashboardPage from "../../components/moderator/Dashboard_Admin/DashboardPage";


import { useState, useEffect } from 'react';
import Sidebar from "../../components/moderator/side bar/sidebar";

// import TrainersPage from "../../components/moderator/trainer/trainer";

import SessionsPage from "../../components/moderator/session/sessions";
import SchedulesPage from "../../components/moderator/schedules/schedules";
import AttendancePage from "../../components/moderator/attendance/attendance";

import CoursesPage from "../../components/moderator/course/course";
import StudentsPage from "../../components/moderator/students/students"
import Content from "../../components/moderator/Content/content"
import Assessment from "../../components/moderator/assessment/assessment"
import FeedbackList from "../../components/moderator/feedback/feedback"
import StudentPerformance from "../../components/moderator/StudentPerformance/StudentPerformance"

function Moderator_portal({ token, user, handleLogout }) {

    const [page, setPage] = useState("dashboard"); //Default
    // const [page, setPage] = useState("sessions"); //Default


    return (
        <>

                <Sidebar
                    activeItem={page}
                    onNavigate={setPage}
                    role={user}
                    handleLogout={handleLogout}
                />
                <div className="app-content">
                    
                    {/* {page === "dashboard" && <div>v</div> } */}
                    {/* {/* {page === "dashboard" && <DashboardPage token={token} />}     */}

                    {/* {page === "trainer" && <TrainersPage token={token} />} */}
                    {page === "sessions" && <SessionsPage token={token} />}       
                    {page === "schedule" && <SchedulesPage token={token} />}
                    {page === "attendance" && <AttendancePage token={token} />}
                    {page === "course" && <CoursesPage token={token} />}         
                    {page === "students" && <StudentsPage token={token} />}
                    {page === "content" && <Content token={token} />} 
                    {page === "assessment" && <Assessment token={token} />}
                    {page === "feedback" && <FeedbackList token={token} />}                     
                    {page === "performance" && <StudentPerformance token={token} />} 

                </div>

                

        </>











    );
}
export default Moderator_portal;