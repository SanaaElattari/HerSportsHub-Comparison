import React, { useState, useEffect, useCallback } from "react";
import PlayerSelector from "./PlayerSelector";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const Comparison = () => {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const safeNum = (x) => Number(x || 0);

  const normalizePosition = (pos) => {
    if (!pos) return "NA";
    const p = pos.toUpperCase();
    if (p.startsWith("F")) return "FW";
    if (p.startsWith("M")) return "MF";
    if (p.startsWith("D")) return "DF";
    if (p.startsWith("G")) return "GK";
    return "NA";
  };

  useEffect(() => {
    const fetchAllPlayers = async () => {
      try {
        const teamsRes = await fetch("https://node-service-production.up.railway.app/teams");
        const teams = await teamsRes.json();

        const allPlayersData = [];
        for (const team of teams) {
          const res = await fetch(`https://node-service-production.up.railway.app/players?team=${encodeURIComponent(team)}`);
          const teamPlayers = await res.json();
          allPlayersData.push(...teamPlayers);
        }

        const filtered = allPlayersData.filter(
          (p) =>
            p.name &&
            !p.name.toLowerCase().includes("total") &&
            !p.name.toLowerCase().includes("opponent")
        );

        setAllPlayers(filtered);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAllPlayers();
  }, []);

  const calculateBetterPlayerScore = (player) => {
    if (!player || !player.stats) return "N/A";
    const minutes = safeNum(player.stats.minutes);
    if (minutes < 90) return "N/A";
    const posKey = normalizePosition(player.position);
    if (posKey === "GK") return "N/A";

    const stats = ["goals", "assists", "xG", "xA", "tackles", "interceptions"];
    const posPlayers = allPlayers.filter(
      (p) => normalizePosition(p.position) === posKey
    );

    const statDistributions = {};
    stats.forEach((stat) => {
      statDistributions[stat] = posPlayers.map((p) =>
        safeNum(p.stats[stat])
      );
    });

    const normalize = (val, arr, isDef = false) => {
      if (!arr.length) return 0;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const variance =
        arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
      const std = Math.sqrt(variance) || 1;
      const z = (val - mean) / std;
      const base = isDef ? 0.63 : 0.62;
      const divisor = isDef ? 5 : 4.5;
      const scaled = base + z / divisor;
      return Math.max(0, Math.min(1, scaled));
    };

    const statsPer90 = {};
    stats.forEach((s) => {
      statsPer90[s] = safeNum(player.stats[s]); // raw totals
    });

    const normStats = {};
    stats.forEach((s) => {
      const isDef = posKey === "DF" && (s === "tackles" || s === "interceptions");
      normStats[s] = normalize(statsPer90[s], statDistributions[s], isDef);
    });

    const weights = {
      FW: { goals: 0.35, assists: 0.2, xG: 0.2, xA: 0.15, defense: 0.1 },
      MF: { goals: 0.15, assists: 0.25, xG: 0.15, xA: 0.2, defense: 0.25 },
      DF: { goals: 0.05, assists: 0.1, xG: 0.05, xA: 0.1, defense: 0.7 },
    };
    const w = weights[posKey] || weights["MF"];

    const offense =
      w.goals * normStats.goals +
      w.assists * normStats.assists +
      w.xG * normStats.xG +
      w.xA * normStats.xA;

    const defense =
      w.defense * ((normStats.tackles + normStats.interceptions) / 2);

    return ((offense + defense) * 100).toFixed(1);
  };

  const getColor = (score) => {
    if (score === "N/A") return "text-gray-400";
    if (score <= 50) return "text-red-500";
    if (score <= 70) return "text-yellow-400 font-semibold";
    if (score <= 84) return "text-green-500 font-semibold";
    return "text-yellow-500 font-bold";
  };

  const radarData =
    player1 && player2
      ? [
          {
            stat: "Goals",
            [player1?.name]: safeNum(player1.stats.goals),
            [player2?.name]: safeNum(player2.stats.goals),
          },
          {
            stat: "Assists",
            [player1?.name]: safeNum(player1.stats.assists),
            [player2?.name]: safeNum(player2.stats.assists),
          },
          {
            stat: "xG",
            [player1?.name]: safeNum(player1.stats.xG),
            [player2?.name]: safeNum(player2.stats.xG),
          },
          {
            stat: "xA",
            [player1?.name]: safeNum(player1.stats.xA),
            [player2?.name]: safeNum(player2.stats.xA),
          },
          {
            stat: "Tackles",
            [player1?.name]: safeNum(player1.stats.tackles),
            [player2?.name]: safeNum(player2.stats.tackles),
          },
          {
            stat: "Interceptions",
            [player1?.name]: safeNum(player1.stats.interceptions),
            [player2?.name]: safeNum(player2.stats.interceptions),
          },
        ]
      : [];

  const score1 = calculateBetterPlayerScore(player1);
  const score2 = calculateBetterPlayerScore(player2);

  let betterPlayer = null;
  let percentDiff = null;
  if (score1 !== "N/A" && score2 !== "N/A") {
    if (parseFloat(score1) > parseFloat(score2)) betterPlayer = player1.name;
    else if (parseFloat(score2) > parseFloat(score1)) betterPlayer = player2.name;
    else betterPlayer = "Tie";
    percentDiff = Math.abs(parseFloat(score1) - parseFloat(score2)).toFixed(1);
  }

  const getStatsForLineGraph = useCallback(
    (player) => {
      if (!player) return [];
      const posKey = normalizePosition(player.position);
      const statsToShow =
        posKey === "FW"
          ? ["goals", "xG"]
          : posKey === "MF"
          ? ["xG", "xA"]
          : posKey === "DF"
          ? ["tackles", "interceptions"]
          : [];
      return statsToShow.map((s) => {
        const posPlayers = allPlayers.filter(
          (p) => normalizePosition(p.position) === posKey
        );
        const leagueTotal = posPlayers.reduce((a, b) => a + safeNum(b.stats[s]), 0);
        const leagueAvg = leagueTotal / (posPlayers.length || 1);
        return {
          stat: s,
          playerValue: safeNum(player.stats[s]),
          leagueAverage: leagueAvg,
        };
      });
    },
    [allPlayers]
  );

  if (loading) return <p className="text-center mt-20">Loading players...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-5xl font-extrabold text-center mb-4">
        <span className="text-purple-700">Her</span>
        <span className="text-green-500">Sports</span>
        <span className="text-purple-700">Hub</span>
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Compare players' stats relative to league averages. The Better Player Score reflects raw totals weighted by position.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-10">
        <PlayerSelector
          label="Player 1"
          player={player1}
          setPlayer={setPlayer1}
          otherPlayer={player2}
        />
        <PlayerSelector
          label="Player 2"
          player={player2}
          setPlayer={setPlayer2}
          otherPlayer={player1}
        />
      </div>

      {player1 && player2 && (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="stat" />
                <PolarRadiusAxis angle={30} />
                <Radar
                  name={player1?.name}
                  dataKey={player1?.name}
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.4}
                />
                <Radar
                  name={player2?.name}
                  dataKey={player2?.name}
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.4}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="md:w-1/3 p-4 border rounded-xl bg-green-50">
            <h2 className="text-lg font-bold text-center mb-4 text-purple-700">
              Better Player Score
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-bold">{player1?.name}</p>
                <p className={`text-xl text-center ${getColor(score1)}`}>
                  {score1 !== "N/A" ? `${score1}%` : "N/A"}
                  {betterPlayer === player1?.name && score1 > 80 ? " ⭐" : ""}
                </p>
              </div>
              <div>
                <p className="font-bold">{player2?.name}</p>
                <p className={`text-xl text-center ${getColor(score2)}`}>
                  {score2 !== "N/A" ? `${score2}%` : "N/A"}
                  {betterPlayer === player2?.name && score2 > 80 ? " ⭐" : ""}
                </p>
              </div>
            </div>
            {betterPlayer && betterPlayer !== "Tie" && (
              <p className="mt-4 text-center text-gray-700">
                Better player: <span className="font-bold">{betterPlayer}</span>{" "}
                (Difference: {percentDiff}%)
              </p>
            )}
            {betterPlayer === "Tie" && (
              <p className="mt-4 text-center text-gray-700 font-bold">Tie</p>
            )}
            <p className="mt-2 text-center text-gray-600 text-sm">
              Score and radar stats are raw totals, scaled relative to positional averages. Players with &lt;90 mins are N/A. Goalkeepers are N/A.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {player1 && <PlayerLineGraph player={player1} getStatsForLineGraph={getStatsForLineGraph} />}
        {player2 && <PlayerLineGraph player={player2} getStatsForLineGraph={getStatsForLineGraph} />}
      </div>
    </div>
  );
};

const PlayerLineGraph = ({ player, getStatsForLineGraph }) => {
  const [selectedStat, setSelectedStat] = useState("");

  useEffect(() => {
    const stats = getStatsForLineGraph(player);
    if (stats.length) setSelectedStat(stats[0].stat);
  }, [player, getStatsForLineGraph]);

  if (!player) return null;

  const lineData = getStatsForLineGraph(player);
  const displayedData = lineData.find((d) => d.stat === selectedStat);

  const chartData = displayedData
    ? [
        { category: "Player", value: displayedData.playerValue },
        { category: "League Avg", value: displayedData.leagueAverage },
      ]
    : [];

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <h3 className="text-center font-bold text-purple-700 mb-2">{player.name}</h3>

      <div className="flex justify-center gap-4 mb-4">
        {lineData.map((d) => (
          <button
            key={d.stat}
            className={`px-3 py-1 rounded-full border ${
              selectedStat === d.stat
                ? "bg-purple-700 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setSelectedStat(d.stat)}
          >
            {d.stat}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ r: 6 }}
            name={player.name}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Comparison;
