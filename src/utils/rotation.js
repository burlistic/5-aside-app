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

    for (let s = 0; s < playerCount; s++) {
        const startTime = previousTime;
        const endTime = startTime + shiftDuration;
        previousTime = endTime;

        const assignments = {};

        players.forEach((player, index) => {
            // Calculate "Seat" for this player at this shift
            // Shift 0: P0->Seat0(GK), P1->Seat1(F), P5->Seat5(Bench)
            // Shift 1: P0->Seat1(F), P5->Seat0(GK) -- This satisfies Bench->GK
            const seat = (index + s) % playerCount;

            let role = 'Bench';
            if (seat === 0) {
                role = 'GK';
            } else if (seat >= 1 && seat <= 4) {
                role = 'Outfield';
            }

            assignments[player.id] = role;
        });

        schedule.push({
            shiftIndex: s + 1,
            startTime: Math.floor(startTime),
            endTime: Math.floor(endTime),
            assignments
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
