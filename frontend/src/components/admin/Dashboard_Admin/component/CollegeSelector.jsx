// CollegeSelector.jsx
import { useState } from 'react';
import './CollegeSelector.css';

export default function CollegeSelector({ colleges, selected, onSelect }) {
    const [search, setSearch] = useState('');

    const filtered = colleges.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="college-selector no-scrollbar">

            <div className="parts">
                <span className="college-selector__heading">College</span>

                <div className="college-selector__search">
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="college-selector__input"
                    />
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            <div className="college-selector__pills">
                {filtered.map((c) => (
                    <button
                        key={c._id}
                        className={`college-selector__pill ${
                            selected === c._id
                                ? 'college-selector__pill--active'
                                : ''
                        }`}
                        onClick={() => onSelect(c._id)}
                    >
                        {c.name}
                    </button>
                ))}
            </div>
        </div>
    );
}