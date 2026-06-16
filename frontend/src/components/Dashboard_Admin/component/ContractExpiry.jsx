// ContractExpiry.jsx
export default function ContractExpiry({ contracts }) {
  if (!contracts || contracts.length === 0) return null;

  return (
    <div className="contract-expiry">
      <h3 className="contract-expiry__title">Contract expiry</h3>

      <ul className="contract-expiry__list">
        {contracts.map((c) => (
          <li key={c.id} className="contract-expiry__item">
            <div className="contract-expiry__info">
              <span className="contract-expiry__name">{c.name}</span>
              <span className="contract-expiry__date">{c.expiresLabel}</span>
            </div>

            <span className={`contract-expiry__badge contract-expiry__badge--${c.urgency}`}>
              {c.daysLeft} days
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}