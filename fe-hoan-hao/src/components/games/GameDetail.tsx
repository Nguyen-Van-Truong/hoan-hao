import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GAMES_DATA } from "@/data/games";
import ThreeColumnLayout from "../layout/ThreeColumnLayout";
import CaroGamePage from "./caro/CaroGamePage";
import GameStatusBadge from "./GameStatusBadge";
import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    const foundGame = GAMES_DATA.find((g) => g.id === gameId);
    if (foundGame) {
      setGame(foundGame);
    } else {
      navigate("/games");
    }
  }, [gameId, navigate]);

  if (!game) return null;

  // Render status message based on game status
  const renderStatusMessage = () => {
    switch (game.status) {
      case "coming_soon":
        return (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-blue-700">
                Trò chơi này đang được phát triển và sẽ sớm ra mắt!
              </p>
            </div>
        );
      case "maintenance":
        return (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-amber-700">
                Trò chơi này đang được bảo trì. Vui lòng quay lại sau!
              </p>
            </div>
        );
      default:
        return null;
    }
  };

  // If game is playable and implemented, render the game component
  if (game.status === "playable") {
    switch (game.title) {
      case "Cờ Caro":
        return <CaroGamePage gameId={gameId} />;
      default:
        return renderGamePlaceholder(game, renderStatusMessage);
    }
  } else {
    return renderGamePlaceholder(game, renderStatusMessage);
  }
};

// Helper function to render a placeholder for games that are not yet implemented or not playable
const renderGamePlaceholder = (game: any, renderStatusMessage: () => JSX.Element | null) => {
  return (
      <div className="min-h-screen bg-gray-100">
        <ThreeColumnLayout>
          <div className="w-full max-w-[950px] mx-auto p-4">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{game.title}</h1>
                <GameStatusBadge status={game.status} />
              </div>
              <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <p className="text-gray-600 mb-6">{game.description}</p>

              {/* Game details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Thể loại</p>
                  <p className="font-medium">{game.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số người chơi</p>
                  <p className="font-medium">{game.players}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thời gian chơi</p>
                  <p className="font-medium">{game.playTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đánh giá</p>
                  <p className="font-medium">{game.rating}/5</p>
                </div>
              </div>

              {/* Status message */}
              {renderStatusMessage()}

              {/* Back button */}
              <div className="mt-6">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Quay lại
                </Button>
              </div>
            </div>
          </div>
        </ThreeColumnLayout>
      </div>
  );
};

export default GameDetail;