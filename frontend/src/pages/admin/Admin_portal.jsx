


import DashboardPage from "../../components/admin/Dashboard_Admin/DashboardPage";


import { useState, useEffect } from 'react';
import Sidebar from "../../components/admin/side bar/sidebar";
import CollegePage from "../../components/admin/colledge/colledge";
import TrainersPage from "../../components/admin/trainer/trainer";
import ContractsPage from "../../components/admin/contract/contract";
import SessionsPage from "../../components/admin/session/sessions";
import SchedulesPage from "../../components/admin/schedules/schedules";
import AttendancePage from "../../components/admin/attendance/attendance";

function Admin_portal({ token, user, handleLogout }) {

    // const [page, setPage] = useState("dashboard"); //Default
    const [page, setPage] = useState("attendance");


    return (
        <>
            <div className="app-layout">
                <Sidebar
                    activeItem={page}
                    onNavigate={setPage}
                    role={user}
                    handleLogout={handleLogout}
                />
                <main className="app-content">
                    {page === "dashboard" && <DashboardPage token={token} />}
                    {page === "college" && <CollegePage token={token} />}
                    {page === "trainer" && <TrainersPage token={token} />}
                    {page === "contracts" && <ContractsPage token={token} />}
                    {page === "sessions" && <SessionsPage token={token} />}
                    {page === "schedule" && <SchedulesPage token={token} />}
                    {page === "attendance" && <AttendancePage token={token} />}


                </main>
            </div>














        </>











    );
}
export default Admin_portal;