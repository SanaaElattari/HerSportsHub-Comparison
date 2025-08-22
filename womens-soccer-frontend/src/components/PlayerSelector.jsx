import React from "react";

const PlayerSelector = ({ player, label }) => {
  return (
    <div className="p-4 border rounded-xl shadow-md bg-white">
      <h2 className="text-lg font-bold mb-3 text-purple-700">{label}</h2>

      {player ? (
        <div className="mt-4 p-3 border rounded-lg bg-green-50 shadow-inner">
          <img
            src={player.avatar}
            alt={player.name}
            className="w-24 h-24 rounded-full mx-auto mb-2 border-2 border-teal-400"
          />
          <h3 className="text-center font-bold text-purple-700">{player.name}</h3>
          <p className="text-center italic text-teal-600">{player.team}</p>
        </div>
      ) : (
        <p className="text-center text-gray-400">Select a player from the dropdowns above</p>
      )}
    </div>
  );
};

export default PlayerSelector;
