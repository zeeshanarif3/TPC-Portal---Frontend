import Dashboard from "./admin/Dash";
import LandingPage from "./login/LabdingPage";
import { useState, useEffect } from 'react';
import Sidebar from "./sidebar/sidebar";

import './Main.css'
import useLenis from "../hooks/useLenis";

function Main() {
    // useLenis()

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null); // {name, email, role}
    
    const [page, setPage] = useState("dashboard");



    const handleLogout = () => {
        setUser(null);
        setToken(null);

        // localStorage.removeItem('tpctoken');
        // localStorage.removeItem('tpcuser');

        // alert('Logged out');
    };

    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (user && token) {
            const timer = setTimeout(() => {
                setReady(true);
            }, 1000);

            return () => clearTimeout(timer);
        } else {
            setReady(false);
        }
    }, [user, token]);

    return (
        <>
            {ready ? (
                <div className="app-layout">
                    <Sidebar
                        activeItem={page}
                        onNavigate={setPage}
                        role={user}
                        handleLogout={handleLogout}
                    />
                    <main className="app-content">
                        {page === "dashboard" && <Dashboard token={token} />}

                    </main>
                </div>
            ) : (
                <LandingPage
                    setUser={setUser}
                    setToken={setToken}
                    user={user}
                    token={token}
                    handleLogout={handleLogout}
                />
            )}
        </>
    );



    // return (
    //     <>


    //     {(user && token) ? (
    //         <div className="app-layout">
    //             <Sidebar
    //                 activeItem={page}
    //                 onNavigate={setPage}
    //                 role={user}
    //                 handleLogout={handleLogout}
    //             />
    //             <main className="app-content">
    //                 <Dashboard token={token} page={page} />
    //                 <button
    //                     className="lp-btn-primary"
    //                     onClick={handleLogout}
    //                 >
    //                     Log out
    //                 </button>
    //             </main>
    //         </div>
    //     ) : (
    //         <LandingPage
    //             setUser={setUser}
    //             setToken={setToken}
    //             user={user}
    //             token={token}
    //             handleLogout={handleLogout}
    //         />
    //     )}







            {/* {(pass == true) ? (
                <div>
                    <Dashboard token={token} />
                    <button
                        className="lp-btn-primary"
                        onClick={handleLogout}
                    >
                        Log out {token}
                    </button>
                </div>
            ) : (
                <LandingPage
                    setPass={setPass}
                    setUser={setUser}
                    setToken={setToken}
                    user={user}
                    token={token}
                    handleLogout={handleLogout}
                />
            )} */}

            {/* <Sidebar
                activeItem={page}
                onNavigate={setPage}
                // defaultCollapsed={defaultCollapsed} */}
            {/* /> */}




    //     </>
    // );
}

export default Main;