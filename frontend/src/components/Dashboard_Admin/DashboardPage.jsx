// Dashboard.jsx
import { useDashboard } from './hooks/useDashboard';
import StatsCards          from './component/StatsCards';
import CollegeSelector     from './component/CollegeSelector';
import TrainersTable       from './component/TrainersTable';
import UpcomingSchedule    from './component/UpcomingSchedule';
import AttendanceChart     from './component/AttendanceChart';
import SubjectDistribution from './component/SubjectDistribution';
import ContractExpiry      from './component/ContractExpiry';
// import ContractExpiry      from './component/ContractExpiry';

export default function DashboardPage() {
  const {
    selectedCollege,
    setSelectedCollege,
    colleges,
    stats,
    trainers,
    schedule,
    attendance,
    subjectDist,
    contractExpiry,
    loading,
    error,
  } = useDashboard();

  if (error) {
    return <div className="dashboard__error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">

      {/* ── Row 1: stats + college selector + attendance chart ── */}
      <div className="dashboard__top-row">
        <StatsCards stats={stats} />

        <CollegeSelector
          colleges={colleges}
          selected={selectedCollege}
          onSelect={setSelectedCollege}
        />

        <AttendanceChart data={attendance} />
      </div>

      {/* ── Row 2: trainers table + subject distribution ── */}
      <div className="dashboard__mid-row">
        <TrainersTable trainers={loading ? [] : trainers} />
        <SubjectDistribution data={loading ? [] : subjectDist} />
      </div>

      {/* ── Row 3: upcoming schedule + contract expiry ── */}
      <div className="dashboard__bottom-row">
        <UpcomingSchedule
          schedule={loading ? [] : schedule}
          onViewAll={() => {/* navigate to schedule page */}}
        />
        <ContractExpiry contracts={loading ? [] : contractExpiry} />
      </div>

    </div>
  );
}