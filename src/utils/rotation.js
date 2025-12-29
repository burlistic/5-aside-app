/**
 * Calculates the rotation schedule for a 5-a-side game.
 * 
 * @param {Array<{id: string, name: string}>} players - List of players.
 * @param {number} totalTimeMinutes - Total game duration (default 40).
 * @returns {Array} List of shifts.
 */
export function calculateSchedule(players, totalTimeMinutes = 40) {
    const playerCount = players.length;
    if (playerCount < 5) {
        throw new Error("Minimum 5 players required");
    }

    // Convert to seconds for better precision
    const totalTimeSeconds = totalTimeMinutes * 60;
    
    // Number of shifts = Number of players (so everyone cycles through all roles)
    // Shift duration in seconds
    const shiftDuration = totalTimeSeconds / playerCount;

    const schedule = [];
    let previousTime = 0;

    for (let i = 0; i < playerCount; i++) {
        const startTime = previousTime;
        const endTime = startTime + shiftDuration;
        previousTime = endTime;

        // Determine roles for this shift based on cyclic index
        // Shift i:
        // GK: Player i
        // Outfield: Player (i+1), (i+2), (i+3), (i+4) (all modulo N)
        // Bench: The rest

        const assignments = {};

        // Goalkeeper
        const gkIndex = i % playerCount;
        assignments[players[gkIndex].id] = 'GK';

        // Outfield
        for (let j = 1; j <= 4; j++) {
            const playerIndex = (i + j) % playerCount;
            assignments[players[playerIndex].id] = 'Outfield';
        }

        // Bench (implicitly anyone not assigned, but explicit is good)
        for (let k = 0; k < playerCount; k++) {
            if (!assignments[players[k].id]) {
                assignments[players[k].id] = 'Bench';
            }
        }

        schedule.push({
            shiftIndex: i + 1,
            startTime: Math.floor(startTime), // seconds
            endTime: Math.floor(endTime),     // seconds
            assignments // Map of playerId -> Role
        });
    }

    return schedule;
}

/**
 * Helper to format seconds as MM:SS
 */
export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
