import React, { useState, useEffect } from "react";

/**
 * SPLIT-SECOND STRIKER
 * Trains decision-making under pressure with tactical scenarios
 * Player must choose: Shoot or Pass based on positioning
 */

type GamePhase = "instructions" | "scenario" | "feedback" | "complete";
type Action = "shoot" | "pass" | null;

interface Position {
  x: number; // 0-100 (percentage)
  y: number; // 0-100 (percentage)
}

interface Scenario {
  player: Position;
  defenders: Position[];
  teammates: Position[];
  correctAction: Action;
  reasoning: string;
}

interface GameState {
  phase: GamePhase;
  currentScenario: number;
  totalScenarios: number;
  score: number;
  correctCount: number;
  streak: number;
  scenarios: Scenario[];
  userAction: Action;
  timeRemaining: number;
  reactionTimes: number[];
  scenarioStartTime: number;
}

const SplitSecondStriker: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "instructions",
    currentScenario: 0,
    totalScenarios: 12,
    score: 0,
    correctCount: 0,
    streak: 0,
    scenarios: [],
    userAction: null,
    timeRemaining: 1200,
    reactionTimes: [],
    scenarioStartTime: 0,
  });

  // Generate all scenarios at game start
  const generateScenarios = (): Scenario[] => {
    const scenarios: Scenario[] = [
      // Easy scenarios - clear shots
      {
        player: { x: 50, y: 70 },
        defenders: [
          { x: 30, y: 40 },
          { x: 70, y: 40 },
        ],
        teammates: [{ x: 20, y: 60 }],
        correctAction: "shoot",
        reasoning: "Clear shot - defenders too far!",
      },
      {
        player: { x: 45, y: 65 },
        defenders: [{ x: 80, y: 50 }],
        teammates: [{ x: 70, y: 70 }],
        correctAction: "shoot",
        reasoning: "Wide open - take the shot!",
      },
      // Scenarios where passing is better
      {
        player: { x: 30, y: 70 },
        defenders: [
          { x: 35, y: 65 },
          { x: 50, y: 60 },
        ],
        teammates: [{ x: 60, y: 75 }],
        correctAction: "pass",
        reasoning: "Teammate wide open on right!",
      },
      {
        player: { x: 70, y: 70 },
        defenders: [{ x: 68, y: 65 }],
        teammates: [{ x: 45, y: 70 }],
        correctAction: "pass",
        reasoning: "Defender blocking - pass to center!",
      },
      // Medium difficulty
      {
        player: { x: 50, y: 75 },
        defenders: [{ x: 50, y: 55 }],
        teammates: [{ x: 30, y: 70 }],
        correctAction: "shoot",
        reasoning: "Good angle despite defender!",
      },
      {
        player: { x: 40, y: 65 },
        defenders: [
          { x: 42, y: 62 },
          { x: 58, y: 62 },
        ],
        teammates: [{ x: 70, y: 68 }],
        correctAction: "pass",
        reasoning: "Two defenders - pass right!",
      },
      {
        player: { x: 55, y: 70 },
        defenders: [{ x: 45, y: 50 }],
        teammates: [{ x: 25, y: 65 }],
        correctAction: "shoot",
        reasoning: "Central position - shoot!",
      },
      // Harder scenarios
      {
        player: { x: 25, y: 68 },
        defenders: [{ x: 28, y: 62 }],
        teammates: [
          { x: 50, y: 72 },
          { x: 70, y: 65 },
        ],
        correctAction: "pass",
        reasoning: "Bad angle - pass to center!",
      },
      {
        player: { x: 60, y: 68 },
        defenders: [
          { x: 40, y: 55 },
          { x: 75, y: 60 },
        ],
        teammates: [{ x: 35, y: 70 }],
        correctAction: "shoot",
        reasoning: "Gap between defenders!",
      },
      {
        player: { x: 48, y: 72 },
        defenders: [
          { x: 48, y: 58 },
          { x: 60, y: 65 },
        ],
        teammates: [{ x: 30, y: 68 }],
        correctAction: "pass",
        reasoning: "Crowded - pass left!",
      },
      {
        player: { x: 52, y: 67 },
        defenders: [{ x: 65, y: 55 }],
        teammates: [{ x: 40, y: 65 }],
        correctAction: "shoot",
        reasoning: "Clear lane to goal!",
      },
      {
        player: { x: 35, y: 70 },
        defenders: [
          { x: 38, y: 64 },
          { x: 50, y: 58 },
        ],
        teammates: [{ x: 65, y: 72 }],
        correctAction: "pass",
        reasoning: "Teammate in better position!",
      },
    ];

    // Shuffle scenarios for variety
    return scenarios.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const scenarios = generateScenarios();
    setGameState({
      phase: "scenario",
      currentScenario: 0,
      totalScenarios: 12,
      score: 0,
      correctCount: 0,
      streak: 0,
      scenarios,
      userAction: null,
      timeRemaining: 1200,
      reactionTimes: [],
      scenarioStartTime: Date.now(),
    });
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.phase !== "scenario") return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const newTime = prev.timeRemaining - 10;

        if (newTime <= 0) {
          // Timeout - wrong answer
          handleAction(null);
          return prev;
        }

        return { ...prev, timeRemaining: newTime };
      });
    }, 10);

    return () => clearInterval(timer);
  }, [gameState.phase, gameState.currentScenario]);

  // Handle user action (shoot or pass)
  const handleAction = (action: Action) => {
    if (gameState.phase !== "scenario") return;

    const currentScenario = gameState.scenarios[gameState.currentScenario];
    const isCorrect = action === currentScenario.correctAction;
    const reactionTime = Date.now() - gameState.scenarioStartTime;

    // Calculate score
    let roundScore = 0;
    let newStreak = gameState.streak;

    if (action === null) {
      // Timeout
      roundScore = -5;
      newStreak = 0;
    } else if (isCorrect) {
      roundScore = 10;
      newStreak = gameState.streak + 1;

      // Streak bonus (3+ in a row)
      if (newStreak >= 3) {
        roundScore += 5;
      }
    } else {
      // Wrong action
      roundScore = 0;
      newStreak = 0;
    }

    const newScore = Math.max(0, gameState.score + roundScore);
    const newCorrectCount = isCorrect
      ? gameState.correctCount + 1
      : gameState.correctCount;
    const newReactionTimes =
      action !== null
        ? [...gameState.reactionTimes, reactionTime]
        : gameState.reactionTimes;

    setGameState((prev) => ({
      ...prev,
      userAction: action,
      phase: "feedback",
      score: newScore,
      correctCount: newCorrectCount,
      streak: newStreak,
      reactionTimes: newReactionTimes,
    }));

    // Move to next scenario or complete
    setTimeout(() => {
      if (gameState.currentScenario + 1 < gameState.totalScenarios) {
        setGameState((prev) => ({
          ...prev,
          phase: "scenario",
          currentScenario: prev.currentScenario + 1,
          userAction: null,
          timeRemaining: 1200,
          scenarioStartTime: Date.now(),
        }));
      } else {
        setGameState((prev) => ({ ...prev, phase: "complete" }));
      }
    }, 1500);
  };

  // Keyboard controls
  useEffect(() => {
    if (gameState.phase !== "scenario") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "s" || e.key === "S") {
        handleAction("shoot");
      } else if (e.key === "p" || e.key === "P") {
        handleAction("pass");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.phase, gameState.currentScenario]);

  // Instructions screen
  if (gameState.phase === "instructions") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-green-900 mb-4">
            ⚡ Split-Second Striker
          </h1>
          <div className="text-left space-y-3 mb-6 text-gray-700">
            <p className="font-semibold text-lg">How to Play:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>You'll see tactical scenarios from the box</li>
              <li>Green dot = You (with ball)</li>
              <li>Red dots = Defenders</li>
              <li>Blue dots = Teammates</li>
              <li>
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-200 rounded font-mono">S</kbd>{" "}
                to SHOOT
              </li>
              <li>
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-200 rounded font-mono">P</kbd>{" "}
                to PASS
              </li>
              <li>You have 1.2 seconds to decide!</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4 italic">
              Trains split-second decision-making in the final third
            </p>
          </div>
          <button
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start Training
          </button>
        </div>
      </div>
    );
  }

  // Complete screen
  if (gameState.phase === "complete") {
    const accuracy = (gameState.correctCount / gameState.totalScenarios) * 100;
    const avgReactionTime =
      gameState.reactionTimes.length > 0
        ? gameState.reactionTimes.reduce((a, b) => a + b, 0) /
          gameState.reactionTimes.length
        : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-green-900 mb-4">
            Training Complete!
          </h1>

          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {gameState.score}
            </div>
            <div className="text-gray-600">Total Score</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {gameState.correctCount}/{gameState.totalScenarios}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {(avgReactionTime / 1000).toFixed(2)}s
              </div>
              <div className="text-sm text-gray-600">Avg Speed</div>
            </div>
          </div>

          <div className="text-sm text-gray-700 mb-6">
            {accuracy >= 80 &&
              "🔥 Elite decision-making! You read the game perfectly."}
            {accuracy >= 60 &&
              accuracy < 80 &&
              "💪 Solid decisions! Keep training your tactical awareness."}
            {accuracy < 60 &&
              "⚡ Keep practicing! Watch more game film to improve."}
          </div>

          <button
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Train Again
          </button>
        </div>
      </div>
    );
  }

  // Active game
  const currentScenario = gameState.scenarios[gameState.currentScenario];
  const isCorrect = gameState.userAction === currentScenario?.correctAction;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-t-lg p-4 flex justify-between items-center text-white">
          <div className="text-sm">
            Scenario{" "}
            <span className="font-bold text-lg">
              {gameState.currentScenario + 1}
            </span>{" "}
            / {gameState.totalScenarios}
          </div>
          <div className="text-sm">
            Score: <span className="font-bold text-lg">{gameState.score}</span>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-b-lg shadow-2xl p-8">
          {/* Timer */}
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-100"
                style={{ width: `${(gameState.timeRemaining / 1200) * 100}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-600 mt-1">
              {(gameState.timeRemaining / 1000).toFixed(1)}s
            </div>
          </div>

          {/* Field View */}
          <div
            className="relative bg-green-600 rounded-lg mb-6"
            style={{ height: "400px" }}
          >
            {/* Goal */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-yellow-400 rounded-b" />

            {/* Penalty box outline */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-48 border-2 border-white/50" />

            {/* Feedback overlay */}
            {gameState.phase === "feedback" && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <div
                    className={`text-4xl font-bold mb-2 ${isCorrect ? "text-green-400" : "text-red-400"}`}
                  >
                    {gameState.userAction === null && "⏱️ Too Slow!"}
                    {gameState.userAction !== null &&
                      (isCorrect ? "✓ Correct!" : "✗ Wrong Choice")}
                  </div>
                  <div className="text-lg">{currentScenario.reasoning}</div>
                </div>
              </div>
            )}

            {/* Player (You) - Green */}
            {currentScenario && (
              <div
                className="absolute w-6 h-6 bg-green-300 border-4 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${currentScenario.player.x}%`,
                  top: `${currentScenario.player.y}%`,
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold whitespace-nowrap">
                  YOU
                </div>
              </div>
            )}

            {/* Defenders - Red */}
            {currentScenario?.defenders.map((defender, idx) => (
              <div
                key={`def-${idx}`}
                className="absolute w-5 h-5 bg-red-500 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${defender.x}%`,
                  top: `${defender.y}%`,
                }}
              />
            ))}

            {/* Teammates - Blue */}
            {currentScenario?.teammates.map((teammate, idx) => (
              <div
                key={`team-${idx}`}
                className="absolute w-5 h-5 bg-blue-400 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${teammate.x}%`,
                  top: `${teammate.y}%`,
                }}
              />
            ))}
          </div>

          {/* Controls */}
          {gameState.phase === "scenario" && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAction("shoot")}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                <div className="text-2xl mb-1">⚽</div>
                <div>SHOOT</div>
                <div className="text-xs opacity-75">Press S</div>
              </button>
              <button
                onClick={() => handleAction("pass")}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                <div className="text-2xl mb-1">🎯</div>
                <div>PASS</div>
                <div className="text-xs opacity-75">Press P</div>
              </button>
            </div>
          )}

          {/* Streak indicator */}
          {gameState.streak >= 3 && gameState.phase === "scenario" && (
            <div className="mt-4 text-center">
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold">
                🔥 {gameState.streak} Streak! +5 bonus
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitSecondStriker;
