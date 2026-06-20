


import DashboardPage from "../../components/admin/Dashboard_Admin/DashboardPage";


import { useState, useEffect } from 'react';
import Sidebar from "../../components/admin/side bar/sidebar";
import CollegePage from "../../components/admin/colledge/colledge";
import TrainersPage from "../../components/admin/trainer/trainer";
import ContractsPage from "../../components/admin/contract/contract";



function Admin_portal({ token, user, handleLogout }) {

    // const [page, setPage] = useState("dashboard"); //Default
    const [page, setPage] = useState("contracts");


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

                </main>
            </div>














        </>











    );
}
export default Admin_portal;