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

  return (
    <div>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          5-a-side Manager
        </h1>
      </header>

      <main>
        {!gameStarted ? (
          <PlayerSetup onStartGame={handleStartGame} />
        ) : (
          <GameScreen players={players} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

export default App;
