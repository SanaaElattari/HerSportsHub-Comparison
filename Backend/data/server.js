const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors()); // allow requests from frontend

// Serve players.json
app.get("/players", (req, res) => {
  res.sendFile(__dirname + "/players.json");
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
