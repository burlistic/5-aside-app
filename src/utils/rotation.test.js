import { describe, it, expect } from 'vitest';
import { calculateSchedule, formatTime } from './rotation';

describe('rotation utilities', () => {
    describe('formatTime', () => {
        it('formats zero seconds correctly', () => {
            expect(formatTime(0)).toBe('00:00');
        });

        it('formats less than a minute correctly', () => {
            expect(formatTime(45)).toBe('00:45');
        });

        it('formats exactly one minute correctly', () => {
            expect(formatTime(60)).toBe('01:00');
        });

        it('formats multiple minutes correctly', () => {
            expect(formatTime(605)).toBe('10:05');
        });
    });

    describe('calculateSchedule', () => {
        const mockPlayers = [
            { id: '1', name: 'Player 1' },
            { id: '2', name: 'Player 2' },
            { id: '3', name: 'Player 3' },
            { id: '4', name: 'Player 4' },
            { id: '5', name: 'Player 5' }
        ];

        it('throws error if less than 5 players', () => {
            expect(() => calculateSchedule(mockPlayers.slice(0, 4))).toThrow("Minimum 5 players required");
        });

        it('generates a schedule with one shift per player', () => {
            const schedule = calculateSchedule(mockPlayers, 5); // 5 players, 5 minutes
            expect(schedule.length).toBe(mockPlayers.length);
        });

        it('assigns correctly for 5 players (no bench)', () => {
            const schedule = calculateSchedule(mockPlayers, 5);

            // In a 5 player game, everyone should be GK once and Outfield 4 times
            const stats = mockPlayers.reduce((acc, p) => ({ ...acc, [p.id]: { GK: 0, Outfield: 0, Bench: 0 } }), {});

            schedule.forEach(shift => {
                mockPlayers.forEach(p => {
                    const role = shift.assignments[p.id];
                    stats[p.id][role]++;
                });
            });

            mockPlayers.forEach(p => {
                expect(stats[p.id].GK).toBe(1);
                expect(stats[p.id].Outfield).toBe(4);
                expect(stats[p.id].Bench).toBe(0);
            });
        });

        it('assigns correctly for 6 players (1 bench)', () => {
            const players6 = [...mockPlayers, { id: '6', name: 'Player 6' }];
            const schedule = calculateSchedule(players6, 6);

            expect(schedule.length).toBe(6);

            const stats = players6.reduce((acc, p) => ({ ...acc, [p.id]: { GK: 0, Outfield: 0, Bench: 0 } }), {});

            schedule.forEach(shift => {
                players6.forEach(p => {
                    const role = shift.assignments[p.id];
                    stats[p.id][role]++;
                });
            });

            players6.forEach(p => {
                expect(stats[p.id].GK).toBe(1);
                expect(stats[p.id].Outfield).toBe(4);
                expect(stats[p.id].Bench).toBe(1);
            });
        });

        it('calculates shift times correctly', () => {
            const schedule = calculateSchedule(mockPlayers, 10); // 10 minutes total
            // 10 mins = 600s. 5 players = 120s per shift.
            expect(schedule[0].startTime).toBe(0);
            expect(schedule[0].endTime).toBe(120);
            expect(schedule[1].startTime).toBe(120);
            expect(schedule[1].endTime).toBe(240);
            expect(schedule[4].endTime).toBe(600);
        });

        describe('Fixed GK mode (excludeGK=true)', () => {
            it('throws error if less than 4 players (for outfield)', () => {
                const outfieldCandidates = mockPlayers.slice(0, 3); // 3 players
                expect(() => calculateSchedule(outfieldCandidates, 5, true)).toThrow("Minimum 4 players required for outfield");
            });

            it('assigns only Outfield and Bench roles (no GK)', () => {
                // 4 Outfield candidates (min required)
                const outfieldCandidates = mockPlayers.slice(0, 4);
                const schedule = calculateSchedule(outfieldCandidates, 5, true);

                expect(schedule.length).toBe(4);

                schedule.forEach(shift => {
                    outfieldCandidates.forEach(p => {
                        const role = shift.assignments[p.id];
                        expect(role).not.toBe('GK');
                        expect(['Outfield', 'Bench']).toContain(role);
                    });
                });
            });

            it('rotates 5 outfield candidates correctly', () => {
                // 5 candidates: 4 Outfield, 1 Bench
                const candidates = mockPlayers; // 5 players
                const schedule = calculateSchedule(candidates, 5, true);

                // Should have 5 shifts to rotate everyone
                expect(schedule.length).toBe(5);

                const stats = candidates.reduce((acc, p) => ({ ...acc, [p.id]: { Outfield: 0, Bench: 0, GK: 0 } }), {});

                schedule.forEach(shift => {
                    candidates.forEach(p => {
                        const role = shift.assignments[p.id];
                        stats[p.id][role]++;
                    });
                });

                candidates.forEach(p => {
                    expect(stats[p.id].GK).toBe(0);
                    expect(stats[p.id].Outfield).toBe(4);
                    expect(stats[p.id].Bench).toBe(1);
                });
            });

            it('generates shifts with NO role changes for 4 outfield candidates', () => {
                // 4 candidates: 4 Outfield. Fixed GK mode.
                const candidates = mockPlayers.slice(0, 4);
                const schedule = calculateSchedule(candidates, 5, true);

                expect(schedule.length).toBe(4);

                // Verify that for every player, their role is 'Outfield' in EVERY shift
                // Meaning NO substitution ever happens.
                schedule.forEach(shift => {
                    candidates.forEach(p => {
                        expect(shift.assignments[p.id]).toBe('Outfield');
                    });
                });
            });
        });
    });
});
