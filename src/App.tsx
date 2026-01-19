import React, { useState } from "react";
import ScanMaster from "./games/ScanMaster";
import SplitSecondStriker from "./games/SplitSecondStriker";
import ArrowSprint from "./games/ArrowSprint";

/**
 * Main App Shell
 * Simple navigation between three soccer cognitive training games
 */

type GameSelection = "menu" | "scan" | "striker" | "arrow";

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameSelection>("menu");

  // Render selected game
  if (currentGame === "scan") {
    return (
      <div>
        <button
          onClick={() => setCurrentGame("menu")}
          className="fixed top-4 left-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors z-50"
        >
          ← Back to Menu
        </button>
        <ScanMaster />
      </div>
    );
  }

  if (currentGame === "striker") {
    return (
      <div>
        <button
          onClick={() => setCurrentGame("menu")}
          className="fixed top-4 left-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors z-50"
        >
          ← Back to Menu
        </button>
        <SplitSecondStriker />
      </div>
    );
  }

  if (currentGame === "arrow") {
    return (
      <div>
        <button
          onClick={() => setCurrentGame("menu")}
          className="fixed top-4 left-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors z-50"
        >
          ← Back to Menu
        </button>
        <ArrowSprint />
      </div>
    );
  }

  // Main menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            ⚽ Soccer Cognitive Training
          </h1>
          <p className="text-xl text-gray-300">
            Train your mind. Elevate your game.
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Scan Master */}
          <button
            onClick={() => setCurrentGame("scan")}
            className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all text-left group"
          >
            <div className="text-4xl mb-3">👁️</div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2 group-hover:text-blue-600">
              Scan Master
            </h2>
            <p className="text-gray-600 mb-4">
              Train visual awareness and peripheral vision
            </p>
            <div className="text-sm text-gray-500">⏱️ 45-60 seconds</div>
            <div className="mt-4 text-sm font-semibold text-blue-600">
              → Start Training
            </div>
          </button>

          {/* Split-Second Striker */}
          <button
            onClick={() => setCurrentGame("striker")}
            className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all text-left group"
          >
            <div className="text-4xl mb-3">⚡</div>
            <h2 className="text-2xl font-bold text-green-900 mb-2 group-hover:text-green-600">
              Split-Second Striker
            </h2>
            <p className="text-gray-600 mb-4">
              Master decision-making under pressure
            </p>
            <div className="text-sm text-gray-500">⏱️ 60-75 seconds</div>
            <div className="mt-4 text-sm font-semibold text-green-600">
              → Start Training
            </div>
          </button>

          {/* Arrow Sprint */}
          <button
            onClick={() => setCurrentGame("arrow")}
            className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all text-left group"
          >
            <div className="text-4xl mb-3">🏃</div>
            <h2 className="text-2xl font-bold text-purple-900 mb-2 group-hover:text-purple-600">
              Arrow Sprint
            </h2>
            <p className="text-gray-600 mb-4">
              Improve reaction time and processing speed
            </p>
            <div className="text-sm text-gray-500">⏱️ 30-45 seconds</div>
            <div className="mt-4 text-sm font-semibold text-purple-600">
              → Start Training
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>
            No login required • All data stays in your browser • Train anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
