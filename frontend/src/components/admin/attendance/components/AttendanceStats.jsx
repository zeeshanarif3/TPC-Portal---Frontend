import './AttendanceStats.css'


export default function AttendanceStats({ stats }) {
  return (
    <div className="attendance-stats">
      <div className="stat-card stat-headcount">
        <div className="stat-icon">✓</div>
        <div className="stat-info">
          <div className="stat-number">{stats.todayHeadcount}</div>
          <div className="stat-label">Today's Headcount</div>
          <div className="stat-detail">Across {stats.sessionsToday} sessions</div>
        </div>
      </div>

      <div className="stat-card stat-average">
        <div className="stat-icon">📈</div>
        <div className="stat-info">
          <div className="stat-number">{stats.weeklyAverage}%</div>
          <div className="stat-label">Weekly Average</div>
        </div>
      </div>

      <div className="stat-card stat-alert">
        <div className="stat-icon">⚠️</div>
        <div className="stat-info">
          <div className="stat-number">{stats.belowThreshold}</div>
          <div className="stat-label">Below 75%</div>
          <div className="stat-detail">courses need attention</div>
        </div>
      </div>
    </div>
  );
}