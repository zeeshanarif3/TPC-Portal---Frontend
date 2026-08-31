import './contractStats.css';

export default function ContractsStats({
  stats = {
    active: 0,
    expiringSoon: 0,
    expired: 0,
  },
}) {
  return (
    <div className="contracts-stats">
      <div className="contract-stat-card stat-active">
        <div className="stat-number">{stats.active}</div>
        <div className="stat-label">Active</div>
      </div>

      <div className="contract-stat-card stat-expiring">
        <div className="stat-number">{stats.expiringSoon}</div>
        <div className="stat-label">Expiring Soon</div>
      </div>

      <div className="contract-stat-card stat-expired">
        <div className="stat-number">{stats.Completed}</div>
        <div className="stat-label">Completed</div>
      </div>
      <div className="contract-stat-card stat-expired">
        <div className="stat-number">{stats.Cancelled}</div>
        <div className="stat-label">Cancelled</div>
      </div>
    </div>
  );
}