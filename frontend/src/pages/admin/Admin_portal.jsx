


import DashboardPage from "../../components/Dashboard_Admin/DashboardPage";


import { useState, useEffect } from 'react';
import Sidebar from "../../components/side bar/admin/sidebar";



function Admin_portal({ token, user, handleLogout }) {

    const [page, setPage] = useState("dashboard");


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

                </main>
            </div>














        </>











    );
}
export default Admin_portal;