import React, { useState, useEffect } from "react";

/**
 * SCAN MASTER
 * Trains visual awareness and peripheral vision by flashing squares in a 3×3 grid
 * Player must remember and click all squares that flashed
 */

type GamePhase =
  | "instructions"
  | "ready"
  | "flashing"
  | "recall"
  | "feedback"
  | "complete";

interface GameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  flashedSquares: number[]; // indices of squares that flashed this round
  selectedSquares: number[]; // indices user clicked
  score: number;
  roundResults: boolean[]; // track perfect rounds for bonus
  flashCount: number; // how many squares to flash this round
  delayBeforeRecall: number; // ms to wait before allowing clicks
}

const ScanMaster: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "instructions",
    currentRound: 1,
    totalRounds: 10,
    flashedSquares: [],
    selectedSquares: [],
    score: 0,
    roundResults: [],
    flashCount: 2,
    delayBeforeRecall: 1500,
  });

  const [isFlashing, setIsFlashing] = useState(false);
  const [activeSquare, setActiveSquare] = useState<number | null>(null);

  // Start the game
  const startGame = () => {
    setGameState({
      phase: "ready",
      currentRound: 1,
      totalRounds: 10,
      flashedSquares: [],
      selectedSquares: [],
      score: 0,
      roundResults: [],
      flashCount: 2,
      delayBeforeRecall: 1500,
    });

    // Small delay before first round
    setTimeout(() => {
      startRound(1, 2);
    }, 1000);
  };

  // Start a new round
  const startRound = (roundNum: number, flashCount: number) => {
    // Generate random unique squares to flash
    const squares: number[] = [];
    while (squares.length < flashCount) {
      const randomSquare = Math.floor(Math.random() * 9);
      if (!squares.includes(randomSquare)) {
        squares.push(randomSquare);
      }
    }

    setGameState((prev) => ({
      ...prev,
      phase: "flashing",
      flashedSquares: squares,
      selectedSquares: [],
      currentRound: roundNum,
      flashCount,
    }));

    // Flash each square sequentially
    flashSquaresSequentially(squares);
  };

  // Flash squares one by one
  const flashSquaresSequentially = (squares: number[]) => {
    setIsFlashing(!isFlashing);
    let index = 0;

    const flashInterval = setInterval(() => {
      if (index < squares.length) {
        setActiveSquare(squares[index]);

        // Turn off after 300ms
        setTimeout(() => {
          setActiveSquare(null);
        }, 300);

        index++;
      } else {
        clearInterval(flashInterval);
        setIsFlashing(false);

        // Wait before allowing recall
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, phase: "recall" }));
        }, gameState.delayBeforeRecall);
      }
    }, 600); // 600ms between flashes (300ms on, 300ms off)
  };

  // Handle square click during recall phase
  const handleSquareClick = (index: number) => {
    if (gameState.phase !== "recall") return;

    // Toggle selection
    setGameState((prev) => {
      const isSelected = prev.selectedSquares.includes(index);
      const newSelected = isSelected
        ? prev.selectedSquares.filter((i) => i !== index)
        : [...prev.selectedSquares, index];

      return { ...prev, selectedSquares: newSelected };
    });
  };

  // Submit answer
  const submitAnswer = () => {
    if (gameState.phase !== "recall") return;

    const { flashedSquares, selectedSquares } = gameState;

    // Calculate correct and incorrect selections
    const correctSelections = selectedSquares.filter((s) =>
      flashedSquares.includes(s),
    );
    const incorrectSelections = selectedSquares.filter(
      (s) => !flashedSquares.includes(s),
    );
    // const missedSquares = flashedSquares.filter(
    //   (s) => !selectedSquares.includes(s),
    // );

    // Scoring: +10 per correct, -5 per incorrect
    const roundScore =
      correctSelections.length * 10 - incorrectSelections.length * 5;
    const isPerfect =
      correctSelections.length === flashedSquares.length &&
      incorrectSelections.length === 0;
    const bonusPoints = isPerfect ? 20 : 0;

    const newScore = gameState.score + roundScore + bonusPoints;
    const newRoundResults = [...gameState.roundResults, isPerfect];

    // Show feedback briefly
    setGameState((prev) => ({
      ...prev,
      phase: "feedback",
      score: newScore,
      roundResults: newRoundResults,
    }));

    // Move to next round or end game
    setTimeout(() => {
      if (gameState.currentRound < gameState.totalRounds) {
        // Determine next round difficulty
        const nextRound = gameState.currentRound + 1;
        let nextFlashCount = 2;
        let nextDelay = 1500;

        if (nextRound <= 3) {
          nextFlashCount = 2;
          nextDelay = 1500;
        } else if (nextRound <= 6) {
          nextFlashCount = 3;
          nextDelay = 1200;
        } else {
          nextFlashCount = 4;
          nextDelay = 1000;
        }

        setGameState((prev) => ({ ...prev, delayBeforeRecall: nextDelay }));
        startRound(nextRound, nextFlashCount);
      } else {
        // Game complete
        setGameState((prev) => ({ ...prev, phase: "complete" }));
      }
    }, 1200);
  };

  // Auto-submit when user selects the right number of squares
  useEffect(() => {
    if (
      gameState.phase === "recall" &&
      gameState.selectedSquares.length === gameState.flashCount
    ) {
      setTimeout(() => submitAnswer(), 500);
    }
  }, [gameState.selectedSquares, gameState.phase]);

  // Render instructions screen
  if (gameState.phase === "instructions") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">
            👁️ Scan Master
          </h1>
          <div className="text-left space-y-3 mb-6 text-gray-700">
            <p className="font-semibold text-lg">How to Play:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Watch the grid carefully</li>
              <li>Squares will flash yellow briefly</li>
              <li>Remember which squares flashed</li>
              <li>Click all squares that flashed</li>
              <li>Get harder as you progress!</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4 italic">
              Trains visual awareness - like scanning the field before receiving
              the ball
            </p>
          </div>
          <button
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start Training
          </button>
        </div>
      </div>
    );
  }

  // Render game complete screen
  if (gameState.phase === "complete") {
    const perfectRounds = gameState.roundResults.filter((r) => r).length;
    const accuracy = (perfectRounds / gameState.totalRounds) * 100;

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
                {perfectRounds}/{gameState.totalRounds}
              </div>
              <div className="text-sm text-gray-600">Perfect Rounds</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {accuracy.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          <div className="text-sm text-gray-700 mb-6">
            {accuracy >= 80 &&
              "🔥 Elite scanning! Your field awareness is exceptional."}
            {accuracy >= 60 &&
              accuracy < 80 &&
              "💪 Good work! Keep training to improve your vision."}
            {accuracy < 60 && "⚡ Keep practicing! Scan more often in matches."}
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

  // Render active game
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-t-lg p-4 flex justify-between items-center text-white">
          <div className="text-sm">
            Round{" "}
            <span className="font-bold text-lg">{gameState.currentRound}</span>{" "}
            / {gameState.totalRounds}
          </div>
          <div className="text-sm">
            Score: <span className="font-bold text-lg">{gameState.score}</span>
          </div>
        </div>

        {/* Game Grid */}
        <div className="bg-white rounded-b-lg shadow-2xl p-8">
          {/* Status message */}
          <div className="text-center mb-6 h-8">
            {gameState.phase === "ready" && (
              <p className="text-gray-600 font-medium">Get ready...</p>
            )}
            {gameState.phase === "flashing" && (
              <p className="text-blue-600 font-bold animate-pulse">
                Watch carefully!
              </p>
            )}
            {gameState.phase === "recall" && (
              <p className="text-green-600 font-bold">
                Click the squares that flashed!
              </p>
            )}
            {gameState.phase === "feedback" && (
              <p className="text-purple-600 font-bold">Nice! Next round...</p>
            )}
          </div>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            {[...Array(9)].map((_, index) => {
              const isFlashing = activeSquare === index;
              const isSelected = gameState.selectedSquares.includes(index);
              const isRecallPhase = gameState.phase === "recall";

              return (
                <button
                  key={index}
                  onClick={() => handleSquareClick(index)}
                  disabled={!isRecallPhase}
                  className={`
                    aspect-square rounded-lg transition-all duration-200 border-4
                    ${isFlashing ? "bg-yellow-400 border-yellow-500 scale-110" : ""}
                    ${!isFlashing && isSelected ? "bg-blue-500 border-blue-600" : ""}
                    ${!isFlashing && !isSelected ? "bg-gray-200 border-gray-300 hover:bg-gray-300" : ""}
                    ${isRecallPhase && !isSelected ? "cursor-pointer" : ""}
                    ${!isRecallPhase ? "cursor-not-allowed" : ""}
                  `}
                />
              );
            })}
          </div>

          {/* Action buttons */}
          {gameState.phase === "recall" && (
            <div className="text-center text-sm text-gray-500">
              Selected: {gameState.selectedSquares.length} /{" "}
              {gameState.flashCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanMaster;
