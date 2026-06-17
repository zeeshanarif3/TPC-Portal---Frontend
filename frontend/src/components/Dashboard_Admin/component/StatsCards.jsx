
// import './StatsCard.css';
import './StatsCards.css';





// StatsCards.jsx



export default function StatsCards({ stats }) {


    if (!stats) return null;

    const cards = [
        {
            label: 'Total trainers',
            value: stats.totalTrainers,
            sub: `${stats.activeTrainers} active`,
        },
        {
            label: 'Total colleges',
            value: stats.totalColleges,
        },
        {
            label: 'Active sessions',
            value: stats.activeSessions,
            sub: `${stats.sessionsStartingThisWeek} starting this week`,
        },
    ];

    return (
        <div className="stats-cards">
            {cards.map((card) => (
                <div key={card.label} className="stats-card">
                    <span className="stats-card__label">{card.label}</span>
                    <span className="stats-card__value">{card.value}</span>
                    {card.sub && <span className="stats-card__sub">{card.sub}</span>}
                </div>
            ))}
        </div>
    );
}