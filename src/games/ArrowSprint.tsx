import React, { useState, useEffect } from "react";

/**
 * ARROW SPRINT
 * Trains reaction time and processing speed
 * Player must press the correct arrow key as quickly as possible
 */

type GamePhase = "instructions" | "ready" | "active" | "waiting" | "complete";
type Direction = "↑" | "↓" | "←" | "→" | null;

interface ArrowAttempt {
  direction: Direction;
  reactionTime: number;
  correct: boolean;
}

interface GameState {
  phase: GamePhase;
  currentArrow: number;
  totalArrows: number;
  currentDirection: Direction;
  arrowStartTime: number;
  attempts: ArrowAttempt[];
  score: number;
}

const ArrowSprint: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "instructions",
    currentArrow: 0,
    totalArrows: 20,
    currentDirection: null,
    arrowStartTime: 0,
    attempts: [],
    score: 0,
  });

  const [countdown, setCountdown] = useState<number>(3);

  // Direction mappings
  const directions: Direction[] = ["↑", "↓", "←", "→"];
  const keyMap: { [key: string]: Direction } = {
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
  };

  const startGame = () => {
    setGameState((prev) => ({
      ...prev,
      phase: "ready",
    }));
    setCountdown(3);

    // Countdown before starting
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          showNextArrow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showNextArrow = () => {
    // Random delay before showing arrow (0.8s - 1.5s)
    const delay = 800 + Math.random() * 700;

    setGameState((prev) => ({
      ...prev,
      phase: "waiting",
      currentDirection: null,
    }));

    setTimeout(() => {
      // Pick random direction
      const randomDirection =
        directions[Math.floor(Math.random() * directions.length)];

      setGameState((prev) => ({
        ...prev,
        phase: "active",
        currentDirection: randomDirection,
        arrowStartTime: Date.now(),
      }));
    }, delay);
  };

  const handleKeyPress = (
    direction: Direction,
    reactionTime: number,
    isPremature: boolean = false,
  ) => {
    if (gameState.phase !== "active") return;

    const isCorrect = direction === gameState.currentDirection;

    // Calculate actual reaction time with penalties
    let finalReactionTime = reactionTime;
    if (!isCorrect) {
      finalReactionTime += 200; // +200ms penalty for wrong direction
    }
    if (isPremature) {
      finalReactionTime += 300; // +300ms penalty for premature press
    }

    const attempt: ArrowAttempt = {
      direction,
      reactionTime: finalReactionTime,
      correct: isCorrect && !isPremature,
    };

    const newAttempts = [...gameState.attempts, attempt];

    setGameState((prev) => ({
      ...prev,
      attempts: newAttempts,
      currentArrow: prev.currentArrow + 1,
    }));

    // Check if game is complete
    if (gameState.currentArrow + 1 >= gameState.totalArrows) {
      setGameState((prev) => ({ ...prev, phase: "complete" }));
    } else {
      // Show next arrow
      setTimeout(() => showNextArrow(), 400);
    }
  };

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default arrow key behavior (scrolling)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      const direction = keyMap[e.key];
      if (!direction) return;

      if (gameState.phase === "waiting") {
        // Premature press
        handleKeyPress(direction, 300, true);
      } else if (gameState.phase === "active") {
        // Normal press
        const reactionTime = Date.now() - gameState.arrowStartTime;
        handleKeyPress(direction, reactionTime, false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.phase, gameState.currentDirection, gameState.arrowStartTime]);

  // Instructions screen
  if (gameState.phase === "instructions") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-purple-900 mb-4">
            ⚡ Arrow Sprint
          </h1>
          <div className="text-left space-y-3 mb-6 text-gray-700">
            <p className="font-semibold text-lg">How to Play:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>An arrow will appear on screen</li>
              <li>Press the matching arrow key as fast as possible</li>
              <li>React quickly and accurately!</li>
              <li>Complete 20 arrows</li>
              <li>Beat your reaction time!</li>
            </ul>
            <div className="bg-purple-50 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold mb-2">Penalties:</p>
              <ul className="text-sm space-y-1">
                <li>• Wrong direction: +200ms</li>
                <li>• Pressing too early: +300ms</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-4 italic">
              Trains first-step quickness - react to teammates' runs instantly
            </p>
          </div>
          <button
            onClick={startGame}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start Training
          </button>
        </div>
      </div>
    );
  }

  // Complete screen
  if (gameState.phase === "complete") {
    const validAttempts = gameState.attempts.filter((a) => a.correct);
    const avgReactionTime =
      validAttempts.length > 0
        ? validAttempts.reduce((sum, a) => sum + a.reactionTime, 0) /
          validAttempts.length
        : 0;
    const accuracy = (validAttempts.length / gameState.totalArrows) * 100;

    let performanceTier = "";
    let tierColor = "";
    if (avgReactionTime < 200) {
      performanceTier = "Pro reflexes ⚡";
      tierColor = "text-yellow-600";
    } else if (avgReactionTime < 250) {
      performanceTier = "First-team ready 🔥";
      tierColor = "text-orange-600";
    } else if (avgReactionTime < 300) {
      performanceTier = "Training needed 💪";
      tierColor = "text-blue-600";
    } else {
      performanceTier = "Work on reaction drills ⏱️";
      tierColor = "text-gray-600";
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-purple-900 mb-4">
            Training Complete!
          </h1>

          <div className="bg-purple-50 rounded-lg p-6 mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {avgReactionTime.toFixed(0)}ms
            </div>
            <div className="text-gray-600">Average Reaction Time</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {validAttempts.length}/{gameState.totalArrows}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {accuracy.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          <div className={`text-lg font-bold mb-6 ${tierColor}`}>
            {performanceTier}
          </div>

          {validAttempts.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left">
              <div className="font-semibold mb-2">Your Performance:</div>
              <div className="space-y-1 text-gray-700">
                <div>
                  Best:{" "}
                  {Math.min(
                    ...validAttempts.map((a) => a.reactionTime),
                  ).toFixed(0)}
                  ms
                </div>
                <div>
                  Worst:{" "}
                  {Math.max(
                    ...validAttempts.map((a) => a.reactionTime),
                  ).toFixed(0)}
                  ms
                </div>
                <div>
                  Consistency:{" "}
                  {accuracy >= 90
                    ? "Excellent"
                    : accuracy >= 75
                      ? "Good"
                      : "Needs work"}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={startGame}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Train Again
          </button>
        </div>
      </div>
    );
  }

  // Ready/Countdown screen
  if (gameState.phase === "ready") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-8xl font-bold mb-4 animate-pulse">
            {countdown}
          </div>
          <div className="text-white text-2xl">Get ready...</div>
        </div>
      </div>
    );
  }

  // Active game screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 flex flex-col items-center justify-center p-4">
      {/* Progress */}
      <div className="text-white text-xl mb-8">
        Arrow {gameState.currentArrow + 1} / {gameState.totalArrows}
      </div>

      {/* Arrow display area */}
      <div
        className="bg-white rounded-lg shadow-2xl p-16 mb-8"
        style={{ width: "400px", height: "400px" }}
      >
        <div className="w-full h-full flex items-center justify-center">
          {gameState.phase === "waiting" && (
            <div className="text-gray-300 text-2xl animate-pulse">
              Wait for it...
            </div>
          )}

          {gameState.phase === "active" && gameState.currentDirection && (
            <div className="text-purple-600 text-9xl font-bold animate-pulse">
              {gameState.currentDirection}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-white text-center space-y-2">
        <div className="text-lg">Press the corresponding arrow key</div>
        <div className="flex gap-2 justify-center text-4xl">
          <span className="opacity-50">←</span>
          <span className="opacity-50">↑</span>
          <span className="opacity-50">↓</span>
          <span className="opacity-50">→</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-purple-950">
        <div
          className="h-full bg-purple-400 transition-all duration-300"
          style={{
            width: `${(gameState.currentArrow / gameState.totalArrows) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ArrowSprint;
