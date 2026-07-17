// Dashboard.jsx
import { useDashboard } from '../../../hooks/useDashboard';
import StatsCards from './component/StatsCards';
import CollegeSelector from './component/CollegeSelector';
import TrainT from './component/TrainT';
import UpcomingSchedule from './component/UpcomingSchedule';
import Attendance_chart from './component/AttendanceChart';
import SubjectDistribution from './component/SubjectDistribution';

import ContractExpiry from './component/ContractExpiry';


import './DashboardPage.css';

export default function DashboardPage({ token }) {
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








// use this for dark accnet #4E3C2E