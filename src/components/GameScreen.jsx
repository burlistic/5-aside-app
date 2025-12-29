import React, { useState, useEffect, useMemo } from 'react';
import { calculateSchedule, formatTime } from '../utils/rotation';

export default function GameScreen({ players, onReset }) {
    // Game state
    const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes in seconds
    const [isPlaying, setIsPlaying] = useState(false);
    const totalTime = 40 * 60;

    const schedule = useMemo(() => calculateSchedule(players, 40), [players]);

    useEffect(() => {
        let interval;
        if (isPlaying && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timeRemaining]);

    // Current Shift Logic
    const timeElapsed = totalTime - timeRemaining;

    // Find current shift based on elapsed time
    // Note: Shifts are [start, end).
    // If timeElapsed == end, we are technically in next shift (or game over).
    const currentShift = schedule.find(s => timeElapsed >= s.startTime && timeElapsed < s.endTime) || schedule[schedule.length - 1];

    // Upcoming shift
    const nextShift = schedule.find(s => s.startTime > timeElapsed);

    const timeUntilNextShift = currentShift ? currentShift.endTime - timeElapsed : 0;

    const isSubstitutionSoon = timeUntilNextShift <= 30 && timeUntilNextShift > 0;

    // Sorting players for display
    // GK first, then Outfield, then Bench
    const getPlayersByRole = (role) => {
        if (!currentShift) return [];
        return players.filter(p => currentShift.assignments[p.id] === role);
    };

    const gk = getPlayersByRole('GK')[0];
    const outfield = getPlayersByRole('Outfield');
    const bench = getPlayersByRole('Bench');

    return (
        <div>
            <div className="card timer-container">
                <div className="timer" style={{ color: timeRemaining < 60 ? 'var(--danger)' : 'inherit' }}>
                    {formatTime(timeRemaining)}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        className={isPlaying ? "secondary" : "primary"}
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? "Pause" : (timeRemaining < totalTime ? "Resume" : "Start Game")}
                    </button>
                    <button className="secondary" onClick={onReset}>
                        Reset
                    </button>
                </div>
            </div>

            {isSubstitutionSoon && isPlaying && (
                <div className="status-bar">
                    ⚠️ SUBSTITUTION IN {formatTime(timeUntilNextShift)} ⚠️
                </div>
            )}

            <div className="pitch">
                {gk && (
                    <div className="field-player gk">
                        <span className="badge gk">GK</span>
                        <strong>{gk.name}</strong>
                    </div>
                )}

                {outfield.map(p => (
                    <div key={p.id} className="field-player outfield">
                        <span className="badge outfield">FLD</span>
                        <span>{p.name}</span>
                    </div>
                ))}
            </div>

            {bench.length > 0 && (
                <div className="card bench-section">
                    <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Bench / Next In
                    </h3>
                    <div className="player-list">
                        {bench.map(p => (
                            <div key={p.id} className="player-item" style={{ padding: '0.5rem' }}>
                                <span style={{ opacity: 0.7 }}>{p.name}</span>
                                {nextShift && nextShift.assignments[p.id] !== 'Bench' && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-timer)' }}>
                                        &uarr; {nextShift.assignments[p.id]} in {formatTime(timeUntilNextShift)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
                Shift {currentShift ? currentShift.shiftIndex : '-'} / {schedule.length} • Duration: {formatTime(schedule[0].endTime - schedule[0].startTime)}
            </div>
        </div>
    );
}
