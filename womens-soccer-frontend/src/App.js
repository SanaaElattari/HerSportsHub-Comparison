
import React, { useState, useEffect } from 'react';

function AvatarIcon() {
  return (
    <svg
      width="150"
      height="150"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: '50%', backgroundColor: '#dceddb', margin: '0 auto 15px' }}
    >
      <circle cx="32" cy="20" r="12" fill="#4caf50" />
      <path d="M10 54c0-12 44-12 44 0v4H10v-4z" fill="#4caf50" />
    </svg>
  );
}

function App() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlayer1, setSelectedPlayer1] = useState('');
  const [selectedPlayer2, setSelectedPlayer2] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/players')
      .then((response) => response.json())
      .then((data) => {
        setClubs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching players:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading players...</div>;

  const allPlayers = clubs.flatMap((club) => club.players);

  const player1 = allPlayers.find((p) => p.name === selectedPlayer1);
  const player2 = allPlayers.find((p) => p.name === selectedPlayer2);

  const highlightBackground = (stat1, stat2) => {
    if (stat1 > stat2) return '#a8d5ba'; // warm green highlight
    if (stat1 < stat2) return '#f8b4b4'; // soft red highlight
    return '#d3d3d3'; // gray highlight if equal
  };

  const theme = {
    background: '#f9f9f7',
    cardBackground: '#ffffff',
    textPrimary: '#2f4f4f',
    accent: '#4caf50',
    selectBackground: '#e6f2e6',
    selectText: '#2f4f4f',
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: theme.background,
        minHeight: '100vh',
        color: theme.textPrimary,
      }}
    >
      <h1
        style={{
          marginBottom: '30px',
          color: theme.accent,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        HerSportsData
      </h1>

      {/* Dropdowns side by side centered */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '310px', // was 60
          marginBottom: '40px',
          flexWrap: 'wrap',
        }}
      >
        {/* Player 1 Select */}
        <div style={{ minWidth: '220px' }}>
          <label
            htmlFor="player1-select"
            style={{ display: 'block', marginBottom: '8px' }}
          >
            Player 1:
          </label>
          <select
            id="player1-select"
            value={selectedPlayer1}
            onChange={(e) => setSelectedPlayer1(e.target.value)}
            style={{
              backgroundColor: theme.selectBackground,
              color: theme.selectText,
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '16px',
              width: '220px',
              border: '1.5px solid #a8d5ba',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select Player</option>
            {allPlayers.map((player) => (
              <option key={player.name} value={player.name}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        {/* Player 2 Select */}
        <div style={{ minWidth: '220px' }}>
          <label
            htmlFor="player2-select"
            style={{ display: 'block', marginBottom: '8px' }}
          >
            Player 2:
          </label>
          <select
            id="player2-select"
            value={selectedPlayer2}
            onChange={(e) => setSelectedPlayer2(e.target.value)}
            style={{
              backgroundColor: theme.selectBackground,
              color: theme.selectText,
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '16px',
              width: '220px',
              border: '1.5px solid #a8d5ba',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select Player</option>
            {allPlayers.map((player) => (
              <option key={player.name} value={player.name}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Player cards side by side */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          flexWrap: 'wrap',
        }}
      >
        {/* Player 1 Card */}
        <div
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '12px',
            padding: '20px',
            width: '320px',
            boxShadow: '0 4px 15px rgba(72, 129, 85, 0.3)',
            textAlign: 'center',
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          {player1 ? (
            <>
              <AvatarIcon />
              <h2 style={{ marginBottom: '6px' }}>{player1.name}</h2>
              <p
                style={{
                  fontStyle: 'italic',
                  marginTop: '0',
                  marginBottom: '10px',
                  color: '#6b8e6b',
                }}
              >
                {clubs.find((c) => c.players.includes(player1))?.club || 'Unknown Club'}
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Position:</strong> {player1.position}
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Country:</strong> {player1.country}
              </p>

              <div style={{ marginTop: '15px', textAlign: 'left' }}>
                <p
                  style={{
                    margin: '5px 0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: highlightBackground(
                      player1.goals,
                      player2?.goals ?? 0
                    ),
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Goals: {player1.goals}
                </p>
                <p
                  style={{
                    margin: '5px 0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: highlightBackground(
                      player1.assists,
                      player2?.assists ?? 0
                    ),
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Assists: {player1.assists}
                </p>
                <p
                  style={{
                    margin: '5px 0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: highlightBackground(
                      player1.appearances,
                      player2?.appearances ?? 0
                    ),
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Appearances: {player1.appearances}
                </p>
                <p
                  style={{
                    margin: '5px 0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: highlightBackground(
                      player1.minutesPlayed,
                      player2?.minutesPlayed ?? 0
                    ),
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Minutes Played: {player1.minutesPlayed}
                </p>
              </div>
            </>
          ) : (
            <p>Select Player 1</p>
          )}
        </div>

        {/* Player 2 Card */}
        <div
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '12px',
            padding: '20px',
            width: '320px',
            boxShadow: '0 4px 15px rgba(72, 129, 85, 0.3)',
            textAlign: 'center',
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          {player2 ? (
            <>
              <AvatarIcon />
              <h2 style={{ marginBottom: '6px' }}>{player2.name}</h2>
              <p
                style={{
                  fontStyle: 'italic',
                  marginTop: '0',
                  marginBottom: '10px',
                  color: '#6b8e6b',
                }}
              >
                {clubs.find((c) => c.players.includes(player2))?.club || 'Unknown Club'}
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Position:</strong> {player2.position}
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Country:</strong> {player2.country}
              </p>

              <div style={{ marginTop: '15px', textAlign: 'left' }}>
                <p
                  style={{
                    margin: '5px 0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: highlightBackground(
                      player2.goals,
                      player1?.goals ?? 0
                    ),
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Goals: {player2.goals}
                </p>
                <p
                  style={{
                    margin: '5px 0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: highlightBackground(
                      player2.assists,
                      player1?.assists ?? 0
                    ),
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Assists: {player2.assists}
                </p>
                <p
                  style={{
                    margin: '5px 0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: highlightBackground(
                      player2.appearances,
                      player1?.appearances ?? 0
                    ),
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Appearances: {player2.appearances}
                </p>
                <p
                  style={{
                    margin: '5px 0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: highlightBackground(
                      player2.minutesPlayed,
                      player1?.minutesPlayed ?? 0
                    ),
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  Minutes Played: {player2.minutesPlayed}
                </p>
              </div>
            </>
          ) : (
            <p>Select Player 2</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
