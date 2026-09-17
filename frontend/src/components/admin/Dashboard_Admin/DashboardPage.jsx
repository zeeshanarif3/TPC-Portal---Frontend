// Dashboard.jsx

import { useEffect, useState } from "react";





import { useDashboard } from '../../../hooks/useDashboard';
import StatsCards from './component/StatsCards';
import CollegeSelector from './component/CollegeSelector';
import TrainT from './component/TrainT';
import UpcomingSchedule from './component/UpcomingSchedule';
import Attendance_chart from './component/AttendanceChart';
import SubjectDistribution from './component/SubjectDistribution';

import ContractExpiry from './component/ContractExpiry';


import './DashboardPage.css';


import AdminDashboardMetrics from "../dashboard/ Admindashboardmetrics";
import Program from "../Program/program";





export default function DashboardPage({ token }) {

    return (
        <>


            <ComponentSlides token={token} />


        </>
    );
}

function ComponentSlides({ token }) {
    const [current, setCurrent] = useState(0);
    const [slideDirection, setSlideDirection] = useState("next");

    const components = [
        <AdminMainDashboard token={token} />,
        <Program token={token} />,
        <AdminDashboardMetrics token={token} />,
    ];

    const next = () => {
        setSlideDirection("next");
        setCurrent((prev) =>
            Math.min(prev + 1, components.length - 1)
        );
    };

    const previous = () => {
        setSlideDirection("prev");
        setCurrent((prev) => Math.max(prev - 1, 0));
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't hijack keyboard while typing
            if (
                e.target.tagName === "INPUT" ||
                e.target.tagName === "TEXTAREA" ||
                e.target.isContentEditable
            ) {
                return;
            }

            if (e.key === "ArrowRight") {
                next();
            }

            if (e.key === "ArrowLeft") {
                previous();
            }

            if (e.key === "Home") {
                setCurrent(0);
            }

            if (e.key === "End") {
                setCurrent(components.length - 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="componentSlides">

            {/* Component */}
            {/* <div className="slideContent">
                {components[current]}
            </div> */}
            <div
                key={current}
                className={`slideContent slide${slideDirection === "next" ? "Next" : "Prev"}`}
            >
                {components[current]}
            </div>

            {/* Navigation */}
            {/* <div className="slideNavigation">

                <button
                    onClick={previous}
                    disabled={current === 0}
                >
                    ← Previous
                </button>

                <div className="slideIndicator">
                    {current + 1} / {components.length}
                </div>

                <button
                    onClick={next}
                    disabled={current === components.length - 1}
                >
                    Next →
                </button>

            </div> */}
            <div className="slideNavigation">

                <button
                    onClick={previous}
                    disabled={current === 0}
                    aria-label="Previous slide"
                >
                    ‹
                </button>

                <div className="slideIndicator">
                    {current + 1} / {components.length}
                </div>

                <button
                    onClick={next}
                    disabled={current === components.length - 1}
                    aria-label="Next slide"
                >
                    ›
                </button>

            </div>
        </div>
    );
}




function AdminMainDashboard({ token }) {
    const {
        selectedCollege,
        setSelectedCollege,
        colleges,
        stats,
        loading,
        error,

        // attendance

        // upcomingClasses,
        AttendanceChart,
        SubjectDistributionAttendance,


        // schedules
        UpcomingSlotsByColl,
        // AllSchedules,


        //contracts

        // AllContracts,
        ExpContracts,


        //sessions

        // AllSessions,


        //students

        // Allstudents,

        //Courses

        // AllCourses,

        //Trainers
        // AllTrainers,
        TrainersByColl,




    } = useDashboard(token);

    if (error) {
        return <div className="dashboard__error">Error: {error}</div>;
    }

    return (
        <div className="dashboard no-scrollbar">

            <div className="dashboard__top-row">
                <div className="left  ">
                    <StatsCards stats={stats} />
                    <div className="  disp_cont">

                        <SubjectDistribution
                            data={loading ? [] : SubjectDistributionAttendance}
                        />

                        <ContractExpiry
                            contracts={loading ? [] : ExpContracts}
                        />


                    </div>
                </div>
                <div className="right  ">
                    <CollegeSelector
                        colleges={colleges}
                        selected={selectedCollege}
                        onSelect={setSelectedCollege}
                    />
                    <Attendance_chart data={AttendanceChart} />
                </div>

            </div>

            {/* <div className="dashboard__mid-row">
            </div> */}

            <div className="dashboard__bottom-row">
                <div className="Schedulle-card">
                    <UpcomingSchedule
                        schedule={loading ? [] : UpcomingSlotsByColl}
                        onViewAll={() => { }}
                    />
                </div>
                <TrainT
                    trainers={loading ? [] : TrainersByColl}
                />
            </div>

        </div>
    );



}

//     return (
//         <div className="dashboard no-scrollbar">

//              <div className="dashboard__top-row">
//                 <div className="left  ">
//                     <StatsCards stats={stats} />
//                     <div className="  disp_cont">

//                         <SubjectDistribution
//                             data={loading ? [] : SubjectDistributionAttendance}
//                         />

//                         <ContractExpiry
//                             contracts={loading ? [] : ExpContracts}
//                         />


//                     </div>
//                 </div> 
//                 <div className="right  ">
//                     <CollegeSelector
//                         colleges={colleges}
//                         selected={selectedCollege}
//                         onSelect={setSelectedCollege}
//                     />
//                     <Attendance_chart data={AttendanceChart} />
//                 </div>

//             </div>

//             {/* <div className="dashboard__mid-row">
//             </div> */}

//             <div className="dashboard__bottom-row">
//                 <div className="Schedulle-card">
//                     <UpcomingSchedule
//                         schedule={loading ? [] : UpcomingSlotsByColl}
//                         onViewAll={() => { }}
//                     />
//                 </div>
//                 <TrainT
//                     trainers={loading ? [] : TrainersByColl}
//                 />
//             </div>

//         </div>
//     );










// use this for dark accnet #4E3C2E 
// na its old , just kept for emotion :D