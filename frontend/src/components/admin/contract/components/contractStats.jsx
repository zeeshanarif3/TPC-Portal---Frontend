
import './contractStats.css';

export default function ContractsStats({ stats }) {
  return (
    <div className="contracts-stats">
      <div className="stat-card stat-active">
        <div className="stat-number">{stats.active}</div>
        <div className="stat-label">● Active</div>
      </div>
      <div className="stat-card stat-expiring">
        <div className="stat-number">{stats.expiringSoon}</div>
        <div className="stat-label">● Expiring Soon</div>
      </div>
      <div className="stat-card stat-expired">
        <div className="stat-number">{stats.expired}</div>
        <div className="stat-label">● Expired</div>
      </div>
    </div>
  );
}