import React, { useState, useEffect, useMemo } from 'react';
import { calculateSchedule, formatTime } from '../utils/rotation';

export default function GameScreen({ players, onReset, onNextMatch }) {
    // Game state
    const totalTimeInMinutes = 1; // 18 min halves
    const totalTimeInSeconds = totalTimeInMinutes * 60;
    const halfTimeDurationSeconds = 10; // 2 minutes

    const [timeRemaining, setTimeRemaining] = useState(totalTimeInSeconds);
    const [isPlaying, setIsPlaying] = useState(false);

    // Half-time state
    const [isHalfTime, setIsHalfTime] = useState(false);
    const [halfTimeRemaining, setHalfTimeRemaining] = useState(halfTimeDurationSeconds);
    const [hasHadHalfTime, setHasHadHalfTime] = useState(false);

    const schedule = useMemo(() => calculateSchedule(players, totalTimeInMinutes), [players, totalTimeInMinutes]);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            if (isHalfTime) {
                if (halfTimeRemaining > 0) {
                    interval = setInterval(() => {
                        setHalfTimeRemaining(prev => prev - 1);
                    }, 1000);
                } else {
                    setIsHalfTime(false);
                }
            } else if (timeRemaining > 0) {
                // Check for half-time trigger (midpoint)
                if (!hasHadHalfTime && timeRemaining <= totalTimeInSeconds / 2) {
                    setIsHalfTime(true);
                    setHasHadHalfTime(true);
                    return;
                }

                interval = setInterval(() => {
                    setTimeRemaining(prev => prev - 1);
                }, 1000);
            } else {
                setIsPlaying(false);
            }
        }
        return () => clearInterval(interval);
    }, [isPlaying, isHalfTime, halfTimeRemaining, timeRemaining, totalTimeInSeconds, hasHadHalfTime]);

    // Reset half-time when resetting game
    const handleReset = () => {
        setHasHadHalfTime(false);
        setIsHalfTime(false);
        setHalfTimeRemaining(halfTimeDurationSeconds);
        onReset();
    };

    const skipHalfTime = () => {
        setIsHalfTime(false);
    };

    // Current Shift Logic
    const timeElapsed = totalTimeInSeconds - timeRemaining;

    // Find current shift based on elapsed time
    const currentShift = schedule.find(s => timeElapsed >= s.startTime && timeElapsed < s.endTime) || schedule[schedule.length - 1];

    // Upcoming shift
    const nextShift = schedule.find(s => s.startTime > timeElapsed);

    const timeUntilNextShift = currentShift ? currentShift.endTime - timeElapsed : 0;

    const isSubstitutionSoon = timeUntilNextShift <= 30 && timeUntilNextShift > 0 && !isHalfTime;

    // Sorting players for display
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
                {isHalfTime && (
                    <div style={{
                        color: 'var(--accent-timer)',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        ⏸️ Half Time Break
                    </div>
                )}

                <div className="timer" style={{ color: isHalfTime ? 'var(--accent-timer)' : (timeRemaining < 60 ? 'var(--danger)' : 'inherit') }}>
                    {isHalfTime ? formatTime(halfTimeRemaining) : formatTime(timeRemaining)}
                </div>

                {!isHalfTime && hasHadHalfTime && timeRemaining > 0 && timeRemaining > totalTimeInSeconds / 2 - 60 && (
                    <div style={{ color: 'var(--accent-timer)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        2nd Half
                    </div>
                )}

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {timeRemaining === 0 ? (
                        <button
                            className="primary"
                            onClick={onNextMatch}
                            style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', color: '#fff' }}
                        >
                            Next Match &rarr;
                        </button>
                    ) : (
                        <>
                            <button
                                className={isPlaying ? "secondary" : "primary"}
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? "Pause" : (
                                    isHalfTime ? "Resume Break" : (timeRemaining < totalTimeInSeconds ? "Resume Game" : "Start Game")
                                )}
                            </button>

                            {isHalfTime && (
                                <button className="primary" onClick={skipHalfTime} style={{ background: 'var(--accent-timer)' }}>
                                    Skip Break
                                </button>
                            )}
                        </>
                    )}

                    <button className="secondary" onClick={handleReset}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="badge gk">GK</span>
                            <strong>{gk.name}</strong>
                        </div>
                        {isSubstitutionSoon && nextShift && nextShift.assignments[gk.id] !== 'GK' && (
                            <div className={`status-badge ${nextShift.assignments[gk.id] === 'Bench' ? 'sub-out' : 'rotation'}`}>
                                {nextShift.assignments[gk.id] === 'Bench' ? (
                                    <><span>↓</span> BENCH Next</>
                                ) : (
                                    <><span>⬇️</span> {nextShift.assignments[gk.id]} Next</>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {outfield.map(p => (
                    <div key={p.id} className="field-player outfield">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="badge outfield">FLD</span>
                            <span>{p.name}</span>
                        </div>
                        {isSubstitutionSoon && nextShift && nextShift.assignments[p.id] !== 'Outfield' && (
                            <div className={`status-badge ${nextShift.assignments[p.id] === 'Bench' ? 'sub-out' : 'rotation'}`}>
                                {nextShift.assignments[p.id] === 'Bench' ? (
                                    <><span>↓</span> BENCH Next</>
                                ) : (
                                    <><span>🔄</span> {nextShift.assignments[p.id]}</>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {bench.length > 0 ? (
                <div className="card bench-section">
                    <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Bench / Rotation Queue
                    </h3>
                    <div className="player-list">
                        {bench.map(p => {
                            // Find when this player next enters the pitch
                            const nextEntryShift = schedule.find(s => s.startTime >= currentShift.endTime && s.assignments[p.id] !== 'Bench');
                            const timeToWait = nextEntryShift ? (nextEntryShift.startTime - timeElapsed) : null;
                            const isEnteringNext = nextShift && nextShift.assignments[p.id] !== 'Bench';

                            return (
                                <div key={p.id} className="player-item" style={{ padding: '0.6rem 0.75rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '500' }}>{p.name}</span>
                                        {nextEntryShift && !isEnteringNext && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                Enters in {Math.round(timeToWait / 60)}m ({formatTime(timeToWait)})
                                            </span>
                                        )}
                                    </div>
                                    {!isHalfTime && (
                                        <div className={`status-badge ${isEnteringNext ? 'sub-in' : ''}`} style={{ border: isEnteringNext ? '' : '1px solid #334155', background: isEnteringNext ? '' : 'rgba(51, 65, 85, 0.3)', color: isEnteringNext ? '' : 'var(--text-secondary)' }}>
                                            {isEnteringNext ? (
                                                isSubstitutionSoon ? (
                                                    <>{nextShift.assignments[p.id] === 'GK' ? '🧤' : '🏃'} NEXT {nextShift.assignments[p.id].toUpperCase()}</>
                                                ) : (
                                                    <>NEXT IN: {formatTime(timeUntilNextShift)}</>
                                                )
                                            ) : (
                                                <>WAITING</>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="card bench-section">
                    <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Next Rotation
                    </h3>
                    <div style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                        {nextShift ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Next GK: <strong style={{ color: 'var(--text-primary)' }}>{players.find(p => nextShift.assignments[p.id] === 'GK')?.name}</strong></span>
                                {!isHalfTime && (
                                    isSubstitutionSoon ? (
                                        <div className="status-badge sub-in">↑ GK</div>
                                    ) : (
                                        <span style={{ fontSize: '0.875rem', color: 'var(--accent-timer)' }}>in {formatTime(timeUntilNextShift)}</span>
                                    )
                                )}
                            </div>
                        ) : (
                            <span>No more rotations</span>
                        )}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
                Shift {currentShift ? currentShift.shiftIndex : '-'} / {schedule.length} • Duration: {formatTime(schedule[0].endTime - schedule[0].startTime)}
            </div>
        </div>
    );
}
