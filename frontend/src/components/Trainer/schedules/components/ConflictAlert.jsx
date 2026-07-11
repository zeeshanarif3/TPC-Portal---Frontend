
import './ConflictAlert.css'


export default function ConflictAlert({ conflicts, onResolve }) {
  if (conflicts.length === 0) return null;

  return (
    <div className="conflict-alert-container">
      {conflicts.map((conflict) => (
        <div key={conflict.id} className="conflict-alert">
          <div className="conflict-content">
            <span className="conflict-icon">⚠️</span>
            <span className="conflict-text">
              <strong>Schedule Conflict Detected:</strong> {conflict.message}
            </span>
          </div>
          <button 
            className="btn-resolve"
            onClick={() => onResolve(conflict.id)}
          >
            Resolve
          </button>
        </div>
      ))}
    </div>
  );
}