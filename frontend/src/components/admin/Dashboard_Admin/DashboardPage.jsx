// Dashboard.jsx
import { useDashboard } from './hooks/useDashboard';
import StatsCards from './component/StatsCards';
import CollegeSelector from './component/CollegeSelector';
import TrainT from './component/TrainT';
import UpcomingSchedule from './component/UpcomingSchedule';
import AttendanceChart from './component/AttendanceChart';
import SubjectDistribution from './component/SubjectDistribution';

import ContractExpiry from './component/ContractExpiry';


import './DashboardPage.css';

export default function DashboardPage({ token }) {
    const {
        selectedCollege,
        setSelectedCollege,
        colleges,
        stats,
        trainers,
        schedule,
        attendance,
        courseDist,
        contractExpiry,
        loading,
        error,
    } = useDashboard(token);

    if (error) {
        return <div className="dashboard__error">Error: {error}</div>;
    }

    return (
        <div className="dashboard">

            <div className="dashboard__top-row">
                <div className="left  ">
                    <StatsCards stats={stats} />
                    <div className="  disp_cont">

                        <SubjectDistribution
                            data={loading ? [] : courseDist}
                        />

                        <ContractExpiry
                            contracts={loading ? [] : contractExpiry}
                        />


                    </div>
                </div>
                <div className="right  ">
                    <CollegeSelector
                        colleges={colleges}
                        selected={selectedCollege}
                        onSelect={setSelectedCollege}
                    />
                    <AttendanceChart data={attendance} />
                </div>

            </div>

            <div className="dashboard__mid-row">

                <div className="Schedulle-card">

                    <UpcomingSchedule
                        schedule={loading ? [] : schedule}
                        onViewAll={() => { }}
                    />

                </div>

            </div>



            <div className="dashboard__bottom-row">




                <TrainT
                    trainers={loading ? [] : trainers}
                />




            </div>

        </div>
    );
}