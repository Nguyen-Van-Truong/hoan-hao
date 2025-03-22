import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Star,
  Clock,
  Trophy,
  GamepadIcon,
  Globe,
  Download,
  Play,
  Laptop,
  Server,
  Info,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Game, GameType } from "@/data/games";
import GameStatusBadge from "./GameStatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";

interface GameDialogProps {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GameDialog = ({ game, open, onOpenChange }: GameDialogProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "info" | "leaderboard" | "requirements"
  >("info");

  const handleStartGame = () => {
    if (game.status !== "playable") {
      // If game is not playable, just show the detail page
      navigate(`/games/${game.id}`);
      onOpenChange(false);
      return;
    }

    if (game.gameType === "browser") {
      // For browser games, navigate to the game detail page
      navigate(`/games/${game.id}`);
      onOpenChange(false);
    } else if (game.gameType === "desktop") {
      // Simulate download process
      setIsDownloading(true);
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsDownloading(false);
              setDownloadProgress(0);
              alert(
                `${t("games.downloadComplete")}: ${game.title}. ${t("games.openToPlay")}`,
              );
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    } else {
      // For embedded games
      console.log(`Starting game: ${game.title}`);
      alert(`Bắt đầu chơi: ${game.title}`);
      onOpenChange(false);
    }
  };

  const getGameTypeIcon = () => {
    switch (game.gameType) {
      case "browser":
        return <Globe className="h-5 w-5 text-blue-500" />;
      case "embedded":
        return <Server className="h-5 w-5 text-green-500" />;
      case "desktop":
        return <Laptop className="h-5 w-5 text-purple-500" />;
      default:
        return <GamepadIcon className="h-5 w-5 text-primary" />;
    }
  };

  const getGameTypeLabel = () => {
    switch (game.gameType) {
      case "browser":
        return "Chơi trên trình duyệt";
      case "embedded":
        return "Game tích hợp";
      case "desktop":
        return "Tải về máy tính";
      default:
        return "";
    }
  };

  const getActionButton = () => {
    // If game is not playable, show view details button instead
    if (game.status !== "playable") {
      return (
        <Button
          onClick={handleStartGame}
          className="bg-primary hover:bg-primary-dark"
        >
          <Info className="mr-2 h-4 w-4" />
          Xem chi tiết
        </Button>
      );
    }

    switch (game.gameType) {
      case "browser":
        return (
          <Button
            onClick={handleStartGame}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="mr-2 h-4 w-4" />
            Chơi ngay
          </Button>
        );
      case "embedded":
        return (
          <Button
            onClick={handleStartGame}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="mr-2 h-4 w-4" />
            Chơi ngay
          </Button>
        );
      case "desktop":
        return isDownloading ? (
          <div className="w-full max-w-[200px]">
            <Progress value={downloadProgress} className="h-2 mb-2" />
            <span className="text-xs text-center block">
              Đang tải... {downloadProgress}%
            </span>
          </div>
        ) : (
          <Button
            onClick={handleStartGame}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>
        );
      default:
        return (
          <Button
            onClick={handleStartGame}
            className="bg-primary hover:bg-primary-dark"
          >
            Bắt đầu chơi
          </Button>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <div className="relative h-56 -mt-6 -mx-6 mb-4 overflow-hidden rounded-t-lg">
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6">
              <div className="flex gap-2 mb-2">
                <Badge className="bg-primary hover:bg-primary">
                  {game.category}
                </Badge>
                <Badge
                  className={`
                    ${game.gameType === "browser" ? "bg-blue-600 hover:bg-blue-600" : ""}
                    ${game.gameType === "embedded" ? "bg-green-600 hover:bg-green-600" : ""}
                    ${game.gameType === "desktop" ? "bg-purple-600 hover:bg-purple-600" : ""}
                  `}
                >
                  {getGameTypeLabel()}
                </Badge>
                <GameStatusBadge status={game.status} />
              </div>
              <h2 className="text-2xl font-bold text-white">{game.title}</h2>
            </div>
          </div>
        </div>

        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {game.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getGameTypeIcon()}
              <span className="text-sm font-medium">{getGameTypeLabel()}</span>
            </div>
          </div>
          <DialogDescription className="text-base mt-2">
            {game.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="info"
          className="mt-6"
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">
              <Info className="h-4 w-4 mr-2" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              Bảng xếp hạng
            </TabsTrigger>
            <TabsTrigger value="requirements">
              <Laptop className="h-4 w-4 mr-2" />
              Yêu cầu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                <Users className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium">
                  {game.players} người chơi
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                <Star className="h-6 w-6 text-yellow-500 mb-2" />
                <span className="text-sm font-medium">{game.rating}/5</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                <Clock className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium">{game.playTime}</span>
              </div>
            </div>

            {game.developer && (
              <div className="text-sm mb-2">
                <span className="font-medium">Nhà phát triển:</span>{" "}
                {game.developer}
              </div>
            )}

            {game.version && (
              <div className="text-sm mb-2">
                <span className="font-medium">Phiên bản:</span> {game.version}
              </div>
            )}

            {game.releaseDate && (
              <div className="text-sm mb-2">
                <span className="font-medium">Ngày phát hành:</span>{" "}
                {game.releaseDate}
              </div>
            )}

            {game.size && game.gameType === "desktop" && (
              <div className="text-sm mb-2">
                <span className="font-medium">Kích thước:</span> {game.size}
              </div>
            )}

            {/* Status message */}
            {game.status === "maintenance" && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <p className="text-amber-700 text-sm">
                  Trò chơi này đang được bảo trì. Vui lòng quay lại sau!
                </p>
              </div>
            )}

            {game.status === "coming_soon" && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <p className="text-blue-700 text-sm">
                  Trò chơi này đang được phát triển và sẽ sớm ra mắt!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="font-medium">Bảng xếp hạng</h3>
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div
                    key={rank}
                    className="flex items-center justify-between bg-background p-2 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-300" : rank === 3 ? "bg-amber-700" : "bg-gray-200"} text-xs font-bold`}
                      >
                        {rank}
                      </div>
                      <div className="font-medium">
                        Người chơi {Math.floor(Math.random() * 1000)}
                      </div>
                    </div>
                    <div className="font-bold">
                      {Math.floor(Math.random() * 10000)} điểm
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Chơi và đạt điểm cao để lên bảng xếp hạng. Người chơi hàng đầu
                sẽ nhận được phần thưởng đặc biệt!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="mt-4">
            {game.gameType === "desktop" && game.systemRequirements ? (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Laptop className="h-4 w-4" />
                  Yêu cầu hệ thống
                </h3>
                <p className="text-sm whitespace-pre-line">
                  {game.systemRequirements}
                </p>
              </div>
            ) : game.gameType === "browser" ? (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Yêu cầu trình duyệt
                </h3>
                <p className="text-sm">
                  Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
                </p>
                <p className="text-sm">Kết nối internet ổn định</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Không có yêu cầu đặc biệt cho game này
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-2">
            <GamepadIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {Math.floor(Math.random() * 100) + 50} người đang chơi
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            {getActionButton()}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameDialog;
