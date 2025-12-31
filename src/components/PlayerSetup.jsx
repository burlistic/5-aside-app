import React, { useState, useRef } from 'react';

export default function PlayerSetup({ onStartGame }) {
    const [players, setPlayers] = useState([]);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const addPlayer = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
            setError("Name already exists");
            return;
        }
        if (players.length >= 10) {
            setError("Max 10 players allowed");
            return;
        }

        setPlayers([...players, { id: crypto.randomUUID(), name: trimmed }]);
        setName('');
        setError('');
        inputRef.current?.focus();
    };

    const removePlayer = (id) => {
        setPlayers(players.filter(p => p.id !== id));
    };

    const handleStart = () => {
        if (players.length < 5) {
            setError("Minimum 5 players required");
            return;
        }
        onStartGame(players);
    };

    return (
        <div className="setup-container">
            <div className="card">
                <h2>Team Setup</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Add 5-10 players to generate the rotation schedule.
                </p>

                <form onSubmit={addPlayer}>
                    <div className="input-group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter player name"
                            autoFocus
                        />
                        <button type="submit" className="primary" disabled={!name.trim()}>
                            Add
                        </button>
                    </div>
                </form>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

                <div className="player-list">
                    {players.map((p, idx) => (
                        <div key={p.id} className="player-item">
                            <span>
                                <span style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>#{idx + 1}</span>
                                {p.name}
                            </span>
                            <button
                                onClick={() => removePlayer(p.id)}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--danger)', background: 'transparent' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <span style={{ marginRight: '1rem', color: 'var(--text-secondary)' }}>
                        {players.length} / 10 Players
                    </span>
                    <button
                        className="primary"
                        onClick={handleStart}
                        disabled={players.length < 5}
                    >
                        Start Match
                    </button>
                </div>
            </div>
        </div>
    );
}
