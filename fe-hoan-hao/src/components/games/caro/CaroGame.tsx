import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, RefreshCw, Trophy, Clock } from "lucide-react";

type Player = "X" | "O" | "draw" | null;
type BoardState = Player[][];

interface GameHistoryItem {
  player: Player;
  position: { row: number; col: number };
  timestamp: number;
}

interface CaroGameProps {
  boardSize?: number;
  winCondition?: number;
  firstPlayer?: Player;
  onGameEnd?: (winner: Player, history: GameHistoryItem[]) => void;
}

const CaroGame: React.FC<CaroGameProps> = ({
  boardSize = 10,
  winCondition = 5,
  firstPlayer = "X",
  onGameEnd,
}) => {
  const [board, setBoard] = useState<BoardState>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(firstPlayer);
  const [winner, setWinner] = useState<Player>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [gameTime, setGameTime] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  // Initialize the board
  useEffect(() => {
    initializeBoard();
  }, [boardSize]);

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameActive && !winner) {
      timer = setInterval(() => {
        setGameTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameActive, winner]);

  const initializeBoard = () => {
    const newBoard: BoardState = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(null));
    setBoard(newBoard);
    setCurrentPlayer(firstPlayer);
    setWinner(null);
    setGameHistory([]);
    setGameTime(0);
    setIsGameActive(true);
  };

  const handleCellClick = (row: number, col: number) => {
    if (winner || board[row][col]) return;

    // Create a deep copy of the board
    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Add move to history
    const historyItem: GameHistoryItem = {
      player: currentPlayer,
      position: { row, col },
      timestamp: Date.now(),
    };
    const updatedHistory = [...gameHistory, historyItem];
    setGameHistory(updatedHistory);

    // Check for winner
    if (checkWinner(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
      setIsGameActive(false);
      if (onGameEnd) onGameEnd(currentPlayer, updatedHistory);
      return;
    }

    // Check for draw
    if (updatedHistory.length === boardSize * boardSize) {
      setWinner("draw" as Player);
      setIsGameActive(false);
      if (onGameEnd) onGameEnd(null, updatedHistory);
      return;
    }

    // Switch player
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const checkWinner = (
    board: BoardState,
    row: number,
    col: number,
    player: Player,
  ): boolean => {
    const directions = [
      { dr: 0, dc: 1 }, // horizontal
      { dr: 1, dc: 0 }, // vertical
      { dr: 1, dc: 1 }, // diagonal down-right
      { dr: 1, dc: -1 }, // diagonal down-left
    ];

    for (const { dr, dc } of directions) {
      let count = 1; // Start with 1 for the current cell

      // Check in positive direction
      for (let i = 1; i < winCondition; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (
          r >= 0 &&
          r < boardSize &&
          c >= 0 &&
          c < boardSize &&
          board[r][c] === player
        ) {
          count++;
        } else {
          break;
        }
      }

      // Check in negative direction
      for (let i = 1; i < winCondition; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (
          r >= 0 &&
          r < boardSize &&
          c >= 0 &&
          c < boardSize &&
          board[r][c] === player
        ) {
          count++;
        } else {
          break;
        }
      }

      if (count >= winCondition) {
        return true;
      }
    }

    return false;
  };

  const resetGame = () => {
    initializeBoard();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Cờ Caro</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(gameTime)}
            </Badge>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RefreshCw className="h-4 w-4 mr-1" /> Chơi lại
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Badge
              className={`px-3 py-1 ${currentPlayer === "X" && !winner ? "bg-blue-600" : "bg-gray-200 text-gray-700"}`}
            >
              Người chơi X
            </Badge>
            <Badge
              className={`px-3 py-1 ${currentPlayer === "O" && !winner ? "bg-red-600" : "bg-gray-200 text-gray-700"}`}
            >
              Người chơi O
            </Badge>
          </div>
          {winner && (
            <Badge className="bg-green-600 px-3 py-1 flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {winner === "draw" ? "Hòa" : `Người chơi ${winner} thắng!`}
            </Badge>
          )}
        </div>

        <div className="overflow-auto">
          <div
            className="grid gap-[1px] bg-gray-300"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(30px, 1fr))`,
              width: "fit-content",
              margin: "0 auto",
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center 
                    bg-white cursor-pointer hover:bg-gray-100 transition-colors
                    ${cell === "X" ? "text-blue-600 font-bold" : ""}
                    ${cell === "O" ? "text-red-600 font-bold" : ""}
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell}
                </div>
              )),
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="text-sm text-gray-500">
          Luật chơi: Tạo {winCondition} quân liên tiếp để thắng
        </div>
        <Button variant="ghost" size="sm" onClick={() => resetGame()}>
          <RotateCcw className="h-4 w-4 mr-1" /> Bắt đầu lại
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CaroGame;
