


import DashboardPage from "../../components/admin/Dashboard_Admin/DashboardPage";


import { useState, useEffect } from 'react';
import Sidebar from "../../components/Trainer/side bar/sidebar";
// import CollegePage from "../../components/admin/colledge/colledge";
// import TrainersPage from "../../components/admin/trainer/trainer";
// import ContractsPage from "../../components/admin/contract/contract";
// import SessionsPage from "../../components/admin/session/sessions";
import SchedulesPage from "../../components/Trainer/schedules/schedules";
// import AttendancePage from "../../components/admin/attendance/attendance";
// import AttendancePage from "../../components/Trainer/attendance/attendance";
// import ModeratorPage from "../../components/admin/moderator/moderator";
// import CoursesPage from "../../components/admin/course/course";

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
                    
                    {/* {page === "dashboard" && <div>v</div> } */}
                    {/* {page === "dashboard" && <DashboardPage token={token} />}
                    {page === "college" && <CollegePage token={token} />}
                    {page === "trainer" && <TrainersPage token={token} />}
                    {page === "contracts" && <ContractsPage token={token} />}
                    {page === "sessions" && <SessionsPage token={token} />} */}
                    {page === "schedule" && <SchedulesPage token={token} />}
                    {/* {page === "attendance" && <AttendancePage token={token} />} */}
                    {/* {page === "moderator" && <ModeratorPage token={token} />}
                    {page === "course" && <CoursesPage token={token} />} */}

                </div>

                














        </>











    );
}
export default Trainer_portal;