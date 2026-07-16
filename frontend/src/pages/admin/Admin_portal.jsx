


import DashboardPage from "../../components/admin/Dashboard_Admin/DashboardPage";


import { useState, useEffect } from 'react';
import Sidebar from "../../components/admin/side bar/sidebar";
import CollegePage from "../../components/admin/colledge/colledge";
import TrainersPage from "../../components/admin/trainer/trainer";
import ContractsPage from "../../components/admin/contract/contract";
import SessionsPage from "../../components/admin/session/sessions";
import SchedulesPage from "../../components/admin/schedules/schedules";
import AttendancePage from "../../components/admin/attendance/attendance";
import ModeratorPage from "../../components/admin/moderator/moderator";
import CoursesPage from "../../components/admin/course/course";
import StudentsPage from "../../components/admin/students/students"

function Admin_portal({ token, user, handleLogout }) {

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
                    {page === "dashboard" && <DashboardPage token={token} />}
                    {page === "college" && <CollegePage token={token} />}
                    {page === "trainer" && <TrainersPage token={token} />}
                    {page === "contracts" && <ContractsPage token={token} />}
                    {page === "sessions" && <SessionsPage token={token} />}
                    {page === "schedule" && <SchedulesPage token={token} />}
                    {page === "attendance" && <AttendancePage token={token} />}
                    {page === "moderator" && <ModeratorPage token={token} />}
                    {page === "course" && <CoursesPage token={token} />}
                    {page === "students" && <StudentsPage token={token} />}

                </div>

                

        </>











    );
}
export default Admin_portal;