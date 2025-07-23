const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors()); // allow requests from frontend

// Read player data from JSON file
const rawData = fs.readFileSync('./data/players.json');
const players = JSON.parse(rawData);

// Route: Get all players
app.get('/players', (req, res) => {
  res.json(players);
});

// Route: Get a single player by name (optional)
app.get('/players/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const player = players.find(p => p.name.toLowerCase() === name);
  
  if (player) {
    res.json(player);
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});

// Route: Compare two players by name
app.get('/compare', (req, res) => {
  const { player1, player2 } = req.query;

  const p1 = players.find(p => p.name.toLowerCase() === player1?.toLowerCase());
  const p2 = players.find(p => p.name.toLowerCase() === player2?.toLowerCase());

  if (p1 && p2) {
    res.json({ player1: p1, player2: p2 });
  } else {
    res.status(404).json({ error: 'One or both players not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
