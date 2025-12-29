import { calculateSchedule, formatTime } from './src/utils/rotation.js';

function runTest() {
    console.log("Running Rotation Logic Tests...");

    // Test case 1: 6 players, 40 mins
    // Expected: 6 shifts. 40*60 / 6 = 400s = 6m 40s per shift.
    // Each player: 1 GK shift, 4 Outfield shifts, 1 Bench shift.

    const players = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
        { id: '3', name: 'C' },
        { id: '4', name: 'D' },
        { id: '5', name: 'E' },
        { id: '6', name: 'F' },
    ];

    const schedule = calculateSchedule(players, 40);

    if (schedule.length !== 6) {
        console.error(`FAIL: Expected 6 shifts, got ${schedule.length}`);
        return;
    }

    const shiftDuration = schedule[0].endTime - schedule[0].startTime;
    if (Math.abs(shiftDuration - 400) > 1) {
        console.error(`FAIL: Expected shift duration 400s, got ${shiftDuration}`);
    } else {
        console.log(`PASS: Shift duration is ${formatTime(shiftDuration)}`);
    }

    // Verify fairness
    const stats = {};
    players.forEach(p => stats[p.id] = { gk: 0, field: 0, bench: 0 });

    schedule.forEach(shift => {
        for (const [pid, role] of Object.entries(shift.assignments)) {
            if (role === 'GK') stats[pid].gk++;
            else if (role === 'Outfield') stats[pid].field++;
            else stats[pid].bench++;
        }
    });

    let fair = true;
    for (const pid in stats) {
        if (stats[pid].gk !== 1 || stats[pid].field !== 4) {
            console.error(`FAIL: Player ${pid} unfair distribution: `, stats[pid]);
            fair = false;
        }
    }

    if (fair) console.log("PASS: 6 Players - Perfectly Fair Distribution");

    // Test Case 2: 5 Players (No bench)
    const p5 = players.slice(0, 5);
    const s5 = calculateSchedule(p5, 40);

    // Shift duration: 40*60 / 5 = 480s = 8 mins.
    // Each player: 1 GK, 4 Outfield, 0 Bench.
    const dur5 = s5[0].endTime - s5[0].startTime;
    if (Math.abs(dur5 - 480) > 1) {
        console.error(`FAIL: 5 Players duration expected 480s, got ${dur5}`);
    } else {
        console.log(`PASS: 5 Players - Shift duration ${formatTime(dur5)}`);
    }

    // Test Case 3: 10 Players
    const p10 = [
        ...players,
        { id: '7', name: 'G' }, { id: '8', name: 'H' }, { id: '9', name: 'I' }, { id: '10', name: 'J' }
    ];
    const s10 = calculateSchedule(p10, 40);
    // Shift duration: 40*60 / 10 = 240s = 4 mins.
    const dur10 = s10[0].endTime - s10[0].startTime;
    if (Math.abs(dur10 - 240) > 1) {
        console.error(`FAIL: 10 Players duration expected 240s, got ${dur10}`);
    } else {
        console.log(`PASS: 10 Players - Shift duration ${formatTime(dur10)}`);
    }
}

try {
    runTest();
} catch (e) {
    console.error(e);
}
