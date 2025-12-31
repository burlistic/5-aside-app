import React, { useState } from 'react';
import PlayerSetup from './components/PlayerSetup';
import GameScreen from './components/GameScreen';

function App() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = (playerList) => {
    setPlayers(playerList);
    setGameStarted(true);
  };

  const handleReset = () => {
    if (window.confirm("End current game and reset?")) {
      setGameStarted(false);
      setPlayers([]);
    }
  };

  const handleNextMatch = () => {
    console.log("handleNextMatch: Current players", players);
    if (players.length > 0) {
      // Rotate: Shift everyone up one seat.
      // Old Seat 0 (GK) -> goes to end (last Seat).
      const rotated = [...players.slice(1), players[0]];
      console.log("handleNextMatch: Rotated players", rotated);
      setPlayers(rotated);
    }
    setGameStarted(false);
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          5-a-side Manager
        </h1>
      </header>

      <main>
        {!gameStarted ? (
          <PlayerSetup onStartGame={handleStartGame} initialPlayers={players} />
        ) : (
          <GameScreen players={players} onReset={handleReset} onNextMatch={handleNextMatch} />
        )}
      </main>
    </div>
  );
}

export default App;
