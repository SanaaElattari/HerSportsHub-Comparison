import React, { useState, useEffect } from "react";

const PlayerSelector = ({ player, setPlayer, label, otherPlayer, setSelectedTeamGlobal }) => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  // Fetch teams
  useEffect(() => {
    fetch("http://localhost:3001/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Failed to load teams:", err));
  }, []);

  // Fetch players when a team is selected
  useEffect(() => {
    if (!selectedTeam) return;

    fetch(`http://localhost:3001/players?team=${encodeURIComponent(selectedTeam)}`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (p) =>
            p.name &&
            !p.name.toLowerCase().includes("total") &&
            !p.name.toLowerCase().includes("opponent")
        );
        setPlayers(filtered);
      })
      .catch((err) => console.error("Failed to load players:", err));
  }, [selectedTeam]);

  // Helpers
  const getAgeYears = (ageStr) => {
    if (!ageStr) return "-";
    const match = ageStr.match(/^(\d+)-/);
    return match ? match[1] : ageStr;
  };
  const getNationality = (natStr) => {
    if (!natStr) return "-";
    const parts = natStr.split(" ");
    return parts.length > 1 ? parts[1] : natStr;
  };

  // Softer stat colors
  const statColorBlock = (stat, otherStat) => {
    if (otherStat === null || otherStat === undefined) return "bg-gray-300";
    if (stat > otherStat) return "bg-green-400"; // softer green
    if (stat < otherStat) return "bg-red-400";   // softer red
    return "bg-gray-400";
  };

  // Reset function
  const resetSelection = () => {
    setPlayer(null);
    setSelectedTeam("");
    setPlayers([]);
    if (setSelectedTeamGlobal) setSelectedTeamGlobal("");
  };

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white">
      <h2 className="text-lg font-bold mb-3 text-purple-700">{label}</h2>

      {/* Team Dropdown */}
      <select
        className="w-full p-2 mb-3 border-2 border-green-500 rounded"
        value={selectedTeam}
        onChange={(e) => {
          setSelectedTeam(e.target.value);
          setPlayer(null);
        }}
      >
        <option value="">Select Team</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>

      {/* Player Dropdown */}
      <select
        className="w-full p-2 mb-3 border-2 border-green-500 rounded"
        value={player?.name || ""}
        onChange={(e) =>
          setPlayer(players.find((p) => p.name === e.target.value))
        }
      >
        <option value="">Select Player</option>
        {players.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Reset Button */}
      {(player || selectedTeam) && (
        <button
          onClick={resetSelection}
          className="w-full mb-3 p-2 bg-gray-300 rounded hover:bg-gray-400 text-black font-semibold"
        >
          Reset Selection
        </button>
      )}

      {/* Player Card */}
      {player && (
        <div className="mt-4 p-4 border rounded-lg bg-green-50 shadow-inner">
          <h3 className="text-2xl font-bold text-center text-purple-700">{player.name}</h3>
          <p className="text-center text-lg italic text-teal-600">
            {getAgeYears(player.age)} yrs | {getNationality(player.nationality)}
          </p>

          <div className="mt-4 space-y-2">
            <div className={`w-full p-2 text-white ${statColorBlock(player.stats.goals, otherPlayer?.stats.goals)}`}>Goals: {player.stats.goals}</div>
            <div className={`w-full p-2 text-white ${statColorBlock(player.stats.assists, otherPlayer?.stats.assists)}`}>Assists: {player.stats.assists}</div>
            <div className={`w-full p-2 text-white ${statColorBlock(player.stats.starts, otherPlayer?.stats.starts)}`}>Starts: {player.stats.starts}</div>
            <div className={`w-full p-2 text-white ${statColorBlock(player.stats.minutes, otherPlayer?.stats.minutes)}`}>Minutes: {player.stats.minutes}</div>

            {/* Conditional Stats */}
            {player.position.includes("FW") || player.position.includes("MF") ? (
              <>
                <div className={`w-full p-2 text-white ${statColorBlock(player.stats.xG, otherPlayer?.stats.xG)}`}>xG: {player.stats.xG}</div>
                <div className={`w-full p-2 text-white ${statColorBlock(player.stats.xA, otherPlayer?.stats.xA)}`}>xA: {player.stats.xA}</div>
              </>
            ) : (
              <>
                <div className={`w-full p-2 text-white ${statColorBlock(player.stats.tackles, otherPlayer?.stats.tackles)}`}>Tackles: {player.stats.tackles}</div>
                <div className={`w-full p-2 text-white ${statColorBlock(player.stats.interceptions, otherPlayer?.stats.interceptions)}`}>Interceptions: {player.stats.interceptions}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSelector;
