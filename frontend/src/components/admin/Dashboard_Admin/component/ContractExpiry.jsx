import './ContractExpiry.css';

export default function ContractExpiry({ contracts }) {
  // if (!contracts || contracts.length === 0) return null;

  const getUrgency = (daysLeft, isExpired) => {
    if (isExpired) return 'high';
    if (daysLeft <= 30) return 'high';
    if (daysLeft <= 90) return 'medium';
    return 'low';
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="contract-expiry no-scrollbar">
      <h3 className="contract-expiry__title">Contract Expiry</h3>

      <ul className="contract-expiry__list">
        {contracts.map((contract) => {
          const urgency = getUrgency(
            contract.daysUntilExpiry,
            contract.isExpired
          );

          return (
            <li key={contract._id} className="contract-expiry__item">
              <div className="contract-expiry__info">
                <span className="contract-expiry__name">
                  {contract.trainer.name}
                </span>

                <span className="contract-expiry__date">
                  Expires: {formatDate(contract.contractDates.endDate)}
                </span>
              </div>

              <span
                className={`contract-expiry__badge contract-expiry__badge--${urgency}`}
              >
                {contract.isExpired
                  ? 'Expired'
                  : `${contract.daysUntilExpiry} days`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}