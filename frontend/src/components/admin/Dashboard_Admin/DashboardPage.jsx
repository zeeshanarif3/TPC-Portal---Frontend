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

            {/* ── Row 1: stats + college selector + attendance chart ── */}
            <div className="dashboard__top-row">
                <div className="left dashboard-card">
                    <StatsCards stats={stats} />
                </div>
                <div className="right dashboard-card">
                    <CollegeSelector
                        colleges={colleges}
                        selected={selectedCollege}
                        onSelect={setSelectedCollege}
                    />
                    <AttendanceChart data={attendance} />


                </div>

            </div>

            {/* ── Row 2: trainers table + subject distribution ──
            <div className="dashboard__mid-row">
                <TrainersTable trainers={loading ? [] : trainers} />
                <SubjectDistribution data={loading ? [] : courseDist} />
            </div>

            ── Row 3: upcoming schedule + contract expiry ──
            <div className="dashboard__bottom-row">
                <UpcomingSchedule
                    schedule={loading ? [] : schedule}
                    onViewAll={() => {}}
                />
                <ContractExpiry contracts={loading ? [] : contractExpiry} />
            </div> */}

            <div className="dashboard__mid-row">

                <div className="dashboard-card trainers-card">
                    <TrainT
                        trainers={loading ? [] : trainers}
                    />
                </div>


                <div className="dashboard-card subject-card">

                    <SubjectDistribution
                        data={loading ? [] : courseDist}
                    />

                </div>

            </div>



            <div className="dashboard__bottom-row">


                <div className="dashboard-card schedule-card">

                    <UpcomingSchedule
                        schedule={loading ? [] : schedule}
                        onViewAll={() => { }}
                    />

                </div>


                <div className="dashboard-card expiry-card">

                    <ContractExpiry
                        contracts={loading ? [] : contractExpiry}
                    />

                </div>


            </div>

        </div>
    );
}