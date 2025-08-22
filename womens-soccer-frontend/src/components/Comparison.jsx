import React, { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Comparison = () => {
  const [playersData, setPlayersData] = useState({});
  const [loading, setLoading] = useState(true);

  const [league1, setLeague1] = useState("");
  const [team1, setTeam1] = useState("");
  const [player1, setPlayer1] = useState(null);

  const [league2, setLeague2] = useState("");
  const [team2, setTeam2] = useState("");
  const [player2, setPlayer2] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/players")
      .then((res) => res.json())
      .then((data) => {
        setPlayersData(data);
        setLoading(false);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // --- Scoring Algorithm ---
  const calculateOverallScore = (player, leagueStats = {}) => {
    if (!player) return 0;
    if (player.league === "International") return null;

    const MIN_PLAY_PERCENT = 0.25;
    const totalGames = leagueStats.totalGames || 20;
    if (player.appearances / totalGames < MIN_PLAY_PERCENT) return 0;

    const goalScore = Math.min(player.goals / (player.predictedGoals || 10), 2);
    const assistScore = Math.min(player.assists / (player.predictedAssists || 5), 2);
    const passScore = Math.min(player.completedPasses / (leagueStats.avgCompletedPasses || 400), 2);

    let defenseScore = 0;
    const defensivePositions = ["Defender", "Midfielder"];
    if (defensivePositions.includes(player.position)) {
      const tacklesScore = player.tacklesWon / (leagueStats.avgTackles || 50);
      const interceptionsScore = player.interceptions / (leagueStats.avgInterceptions || 30);
      defenseScore = (tacklesScore + interceptionsScore) / 2;
    }

    let keeperScore = 0;
    if (player.position === "Goalkeeper") {
      const cleanSheetScore = player.cleanSheets / (leagueStats.avgCleanSheets || 10);
      const saveScore = player.saves / (leagueStats.avgSaves || 50);
      keeperScore = (cleanSheetScore + saveScore) / 2;
    }

    const cardPenalty = player.yellowCards * 0.05 + player.redCards * 0.15;

    let finalScore = 0;
    if (player.position === "Goalkeeper") {
      finalScore = keeperScore * 100 - cardPenalty * 100;
    } else {
      finalScore =
        goalScore * 0.4 * 100 +
        assistScore * 0.2 * 100 +
        passScore * 0.2 * 100 +
        defenseScore * 0.2 * 100 -
        cardPenalty * 100;
    }

    return Math.max(0, Math.min(100, finalScore));
  };

  const statColor = (stat, otherStat) => {
    if (otherStat === null || otherStat === undefined) return "text-gray-500";
    if (stat > otherStat) return "text-green-600";
    if (stat < otherStat) return "text-red-600";
    return "text-gray-400";
  };

  if (loading) return <p className="text-center mt-20">Loading players...</p>;

  const renderDropdowns = (league, setLeague, team, setTeam, player, setPlayer) => (
    <div className="p-4 border-2 border-purple-700 rounded-2xl bg-white shadow-md">
      <h2 className="text-lg font-bold mb-3 text-purple-700">
        {player ? player.name : "Select Player"}
      </h2>

      <select
        className="w-full p-2 mb-2 border-2 border-green-500 rounded"
        value={league}
        onChange={(e) => {
          setLeague(e.target.value);
          setTeam("");
          setPlayer(null);
        }}
      >
        <option value="">Choose League</option>
        {Object.keys(playersData).map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>

      {league && (
        <select
          className="w-full p-2 mb-2 border-2 border-green-500 rounded"
          value={team}
          onChange={(e) => {
            setTeam(e.target.value);
            setPlayer(null);
          }}
        >
          <option value="">Choose Team</option>
          {Object.keys(playersData[league]).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      )}

      {team && (
        <select
          className="w-full p-2 mb-2 border-2 border-green-500 rounded"
          value={player?.name || ""}
          onChange={(e) => {
            const p = playersData[league][team].find((p) => p.name === e.target.value);
            p.league = league;
            setPlayer(p);
          }}
        >
          <option value="">Choose Player</option>
          {playersData[league][team].map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
      )}
    </div>
  );

  const radarData =
    player1 && player2
      ? [
          { stat: "Goals", [player1.name]: player1.goals, [player2.name]: player2.goals },
          { stat: "Assists", [player1.name]: player1.assists, [player2.name]: player2.assists },
          { stat: "Completed Passes", [player1.name]: player1.completedPasses, [player2.name]: player2.completedPasses },
          { stat: "Tackles Won", [player1.name]: player1.tacklesWon || 0, [player2.name]: player2.tacklesWon || 0 },
          { stat: "Interceptions", [player1.name]: player1.interceptions || 0, [player2.name]: player2.interceptions || 0 },
        ]
      : [];

  const score1 = calculateOverallScore(player1);
  const score2 = calculateOverallScore(player2);

  let betterPlayer = null;
  let percentDifference = null;
  if (score1 !== null && score2 !== null) {
    if (score1 > score2) betterPlayer = player1.name;
    else if (score2 > score1) betterPlayer = player2.name;
    else betterPlayer = "Tie";
    percentDifference = Math.abs(score1 - score2).toFixed(1);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-5xl font-extrabold text-center mb-10">
        <span className="text-purple-700">Her</span>
        <span className="text-green-500">Sports</span>
        <span className="text-purple-700">Hub</span>
      </h1>

      {/* Player Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-10">
        {renderDropdowns(league1, setLeague1, team1, setTeam1, player1, setPlayer1)}
        {renderDropdowns(league2, setLeague2, team2, setTeam2, player2, setPlayer2)}
      </div>

      {/* Player Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-10">
        {player1 && (
          <div className="p-4 border rounded-xl shadow-md bg-green-50">
            <img
              src={player1.avatar}
              alt={player1.name}
              className="w-24 h-24 rounded-full mx-auto mb-2 border-2 border-teal-400"
            />
            <h3 className="text-center font-bold text-purple-700">{player1.name}</h3>
            <p className="text-center italic text-teal-600">{player1.team}</p>
            <p className={statColor(player1.goals, player2?.goals)}>Goals: {player1.goals}</p>
            <p className={statColor(player1.assists, player2?.assists)}>Assists: {player1.assists}</p>
            <p className={statColor(player1.completedPasses, player2?.completedPasses)}>
              Completed Passes: {player1.completedPasses}
            </p>
          </div>
        )}
        {player2 && (
          <div className="p-4 border rounded-xl shadow-md bg-green-50">
            <img
              src={player2.avatar}
              alt={player2.name}
              className="w-24 h-24 rounded-full mx-auto mb-2 border-2 border-teal-400"
            />
            <h3 className="text-center font-bold text-purple-700">{player2.name}</h3>
            <p className="text-center italic text-teal-600">{player2.team}</p>
            <p className={statColor(player2.goals, player1?.goals)}>Goals: {player2.goals}</p>
            <p className={statColor(player2.assists, player1?.assists)}>Assists: {player2.assists}</p>
            <p className={statColor(player2.completedPasses, player1?.completedPasses)}>
              Completed Passes: {player2.completedPasses}
            </p>
          </div>
        )}
      </div>

      {/* Radar Chart + Info Box on Right */}
      {player1 && player2 && (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row gap-6">
          {/* Radar Chart */}
          <div className="md:w-2/3">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="stat" />
                <PolarRadiusAxis angle={30} />
                <Radar name={player1.name} dataKey={player1.name} stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                <Radar name={player2.name} dataKey={player2.name} stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Info Box */}
          <div className="md:w-1/3 p-4 border rounded-xl bg-green-50 shadow-inner">
            <p className="text-lg font-bold text-purple-700">{player1.name}: {score1.toFixed(1)} / 100</p>
            <p className="text-lg font-bold text-purple-700">{player2.name}: {score2.toFixed(1)} / 100</p>
            {betterPlayer && (
              <>
                <p className="text-xl font-bold mt-2 text-teal-600">Winner: {betterPlayer}</p>
                <p className="text-md font-semibold text-gray-700">Percent difference: {percentDifference}%</p>
              </>
            )}
            <p className="text-sm mt-3 text-gray-600">
              Player scores are calculated based on multiple factors:
              <br />• Goals and assists relative to predicted amounts
              <br />• Completed passes compared to league averages
              <br />• Defensive contributions (tackles, interceptions) weighted by position
              <br />• Goalkeeper stats (clean sheets, saves) for keepers
              <br />• Card penalties for yellow/red cards
              <br />• Minimum 25% season participation required
              <br />• Overall score reflects the player's responsibilities based on their position
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparison;
