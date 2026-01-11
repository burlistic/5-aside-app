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

    // If 7+ players, sub 2 at a time (rotationStep = 2)
    const rotationStep = playerCount >= 7 ? 2 : 1;

    // To ensure fairness (everyone is GK), we still need playerCount shifts.
    // If rotationStep and playerCount are coprime (e.g. 7 and 2), they naturally hit all seats.
    // If not (e.g. 8 and 2), we use a leap logic to ensure everyone visits every seat.
    const numShifts = playerCount;
    const shiftDuration = totalTimeSeconds / numShifts;

    const schedule = [];
    let previousTime = 0;

    for (let s = 0; s < numShifts; s++) {
        const startTime = previousTime;
        const endTime = startTime + shiftDuration;
        previousTime = endTime;

        const assignments = {};

        let offset;
        if (rotationStep === 1) {
            offset = s % playerCount;
        } else {
            // For rotationStep > 1, we ensure all seats are visited
            if (playerCount % rotationStep === 0) {
                // Not coprime (e.g. 8 and 2). 
                // We add a leap of 1 every (playerCount/step) shifts.
                const cycleLength = playerCount / rotationStep;
                offset = (s * rotationStep + Math.floor(s / cycleLength)) % playerCount;
            } else {
                // Coprime (e.g. 7 and 2).
                offset = (s * rotationStep) % playerCount;
            }
        }

        players.forEach((player, index) => {
            const seat = (index + offset) % playerCount;

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
