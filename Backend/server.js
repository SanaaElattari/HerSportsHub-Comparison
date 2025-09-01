// server.js
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import express from "express";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001; 

app.use(express.static(path.join(__dirname, "frontend", "build"))); 

let offenseData = [];
let defenseData = [];
let allTeams = [];

// Utility to load a CSV file
const loadCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });

// Load CSVs
const loadData = async () => {
  try {
    offenseData = await loadCSV(path.resolve("./nwsl_players_2025.csv"));
    console.log(`✅ Loaded offense CSV. Total players: ${offenseData.length}`);

    defenseData = await loadCSV(path.resolve("./nwsl_defense_2025.csv"));
    console.log(`✅ Loaded defense CSV. Total defenders: ${defenseData.length}`);

    // Get unique teams from offense CSV only (no totals)
    allTeams = [...new Set(offenseData.map((p) => p.Team))]
      .filter((team) => team && !team.toLowerCase().includes("total"));
    console.log("Teams:", allTeams);
  } catch (err) {
    console.error("❌ Error loading CSVs:", err);
  }
};

// Get all teams
app.get("/teams", (req, res) => {
  res.json(allTeams);
});

// Get players for a team
app.get("/players", (req, res) => {
  const team = req.query.team;
  if (!team) return res.json([]);

  // Filter offense CSV for team
  const teamPlayers = offenseData
    .filter((p) => p.Team === team)
    .filter((p) => p[`Unnamed: 0_level_0_Player`] && !p[`Unnamed: 0_level_0_Player`].toLowerCase().includes("total"))
    .map((p) => {
      // Find defensive stats if player exists in defense CSV
      const defStats = defenseData.find(
        (d) => d[`Unnamed: 0_level_0_Player`] === p[`Unnamed: 0_level_0_Player`]
      ) || {};

      return {
        name: p[`Unnamed: 0_level_0_Player`],
        nationality: p[`Unnamed: 1_level_0_Nation`],
        age: p[`Unnamed: 3_level_0_Age`], // parse on frontend to show years only
        position: p[`Unnamed: 2_level_0_Pos`],
        team: p.Team,
        stats: {
          goals: Number(p.Performance_Gls || 0),
          assists: Number(p.Performance_Ast || 0),
          starts: Number(p["Playing Time_Starts"] || 0),
          minutes: Number(p["Playing Time_Min"] || 0),
          xG: Number(p.Expected_xG || 0),
          xA: Number(p.Expected_xAG || 0),
          tackles: Number(defStats.Tackles_Tkl || 0),
          interceptions: Number(defStats[`Unnamed: 17_level_0_Int`] || 0),
        },
      };
    });

  res.json(teamPlayers);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

// Start server
loadData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
