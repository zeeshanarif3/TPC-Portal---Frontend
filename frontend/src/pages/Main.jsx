import Admin_portal from "./admin/Admin_portal";
import Trainer_portal from "./Trainer/Trainer_portal";
import Student_portal from "./student/Student_portal";
import Moderator_portal from "./moderator/Moderator_portal";



import LandingPage from "./login/LabdingPage";
import { useState, useEffect } from 'react';
import useLenis from "../hooks/useLenis";

import './Main.css'
import Anim from "../anim/anim";

function Main() {
// function Main({t}) {   //comment this , its for debug purposes
    
    ////////// for smooth scrolling , for future components, currently not used ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // useLenis()
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
    // main states
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null); // {name, email, role}
    const [ready, setReady] = useState(false);
    
    // t(token) //comment this , its for debug purposes

    // main func states
    const handleLogout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem('tpctoken');
        localStorage.removeItem('tpcuser');

        // alert('Logged out');
    };




    ///////////////////// 1 sec break for login/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



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



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////// for animation ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    const [animDone, setAnimDone] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            // console.log("setting true");
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
        <div className="theme-overlay"/>

       
        <div className="app-layout ">
            {!animDone ? (

                <Anim />
            ) : (ready && user ? (
                <>
                    {/* {user.role === "admin" && (  */}
                    {((user.role === "admin")) && (
                        <Admin_portal
                            token={token}
                            user={user}
                            handleLogout={handleLogout}
                        />
                    )}
                    {((user.role === "trainer"))  && (
                        <Trainer_portal
                            token={token}
                            user={user}
                            handleLogout={handleLogout}
                        />
                    )}
                    {((user.role === "moderator"))  && (
                        <Moderator_portal
                            token={token}
                            user={user}
                            handleLogout={handleLogout}
                        />
                    )}
                    {((user.role === "student"))  && (
                        <Student_portal
                            token={token}
                            user={user}
                            handleLogout={handleLogout}
                        />
                    )}
                </>
            ) : (
                <LandingPage
                    setUser={setUser}
                    setToken={setToken}
                    user={user}
                    token={token}
                    handleLogout={handleLogout}
                />
            ))}

        </div>

        </>
    );


}

export default Main;