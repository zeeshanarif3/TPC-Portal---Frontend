import Admin_portal from "./admin/Admin_portal";
import LandingPage from "./login/LabdingPage";
import { useState, useEffect } from 'react';
import useLenis from "../hooks/useLenis";

import './Main.css'
import Anim from "../anim/anim";

function Main() {

    // for smooth scrolling , for future components, currently not used
    // useLenis()




    // main states
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null); // {name, email, role}
    const [ready, setReady] = useState(false);


    // reset states
    const handleLogout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem('tpctoken');
        localStorage.removeItem('tpcuser');

        // alert('Logged out');
    };




    // 1 sec break
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








    ////////// for animation ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    const [animDone, setAnimDone] = useState(false);

useEffect(() => {
    const timer = setTimeout(() => {
        console.log("setting true");
        setAnimDone(true);
    }, 2500);

    return () => clearTimeout(timer);
}, []);

useEffect(() => {
    console.log("animDone =", animDone);
}, [animDone]);



    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <>
            {!animDone ? (

                <Anim />
            ) : (ready && user ? (
                <main>
                    {user.role === "admin" && (
                        <Admin_portal
                            token={token}
                            user={user}
                            handleLogout={handleLogout}
                        />
                    )}
                </main>
            ) : (
                <LandingPage
                    setUser={setUser}
                    setToken={setToken}
                    user={user}
                    token={token}
                    handleLogout={handleLogout}
                />
            ))}
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
    {/* /> */ }




    //     </>
    // );
}

export default Main;