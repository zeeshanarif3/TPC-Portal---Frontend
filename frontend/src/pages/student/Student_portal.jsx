


// import DashboardPage from "../../components/admin/Dashboard_Admin/DashboardPage";


import { useState, useEffect } from 'react';
import Sidebar from "../../components/student/side bar/sidebar";

// import p from "../../components/Trainer/schedules/schedules";
import PerformancePage from "../../components/student/performance/PerformancePage";
import StudentAssessment from "../../components/student/assessment/assessment";
import Content from "../../components/student/Content/content";
import SchedulesPage from "../../components/student/schedules/schedules";


function Student_portal({ token, user, handleLogout }) {

    const [page, setPage] = useState("schedule"); //Default



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
                    {/* {page === "dashboard" && <DashboardPage token={token} />}
                    {page === "college" && <CollegePage token={token} />}
                    {page === "trainer" && <TrainersPage token={token} />}
                    {page === "contracts" && <ContractsPage token={token} />}
                    {page === "sessions" && <SessionsPage token={token} />} */}
                    {/* {page === "schedule" && <SchedulesPage token={token} />} */}
                    {/* {page === "attendance" && <AttendancePage token={token} />} */}
                    {/* {page === "moderator" && <ModeratorPage token={token} />}
                    {page === "course" && <CoursesPage token={token} />} */}
                     {page === "schedule" && <SchedulesPage token={token} />} 
                     {page === "performance" && <PerformancePage token={token} />} 
                     {page === "assessment" && <StudentAssessment token={token} />} 
                     {page === "content" && <Content token={token} />} 

                </div>

                














        </>











    );
}
export default Student_portal;