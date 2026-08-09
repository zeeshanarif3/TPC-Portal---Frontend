


// import DashboardPage from "../../components/admin/Dashboard_Admin/DashboardPage";


import { useState, useEffect } from 'react';
import Sidebar from "../../components/Trainer/side bar/sidebar";

import SchedulesPage from "../../components/Trainer/schedules/schedules";
import Content from "../../components/Trainer/Content/content"

import Assessment from "../../components/Trainer/assessment/assessment"
import FeedbackList from "../../components/Trainer/feedback/feedback"
import StudentPerformancePage from "../../components/Trainer/StudentPerformance/StudentPerformance"



function Trainer_portal({ token, user, handleLogout }) {

    const [page, setPage] = useState("schedule"); //Default
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
                
                    {page === "schedule" && <SchedulesPage token={token} />}
                    {page === "content" && <Content token={token} />}
                    {page === "assessment" && <Assessment token={token} />}
                    {page === "feedback" && <FeedbackList token={token} />}
                    {page === "StudentPerformance" && <StudentPerformancePage token={token} />}

                </div>

                














        </>











    );
}
export default Trainer_portal;