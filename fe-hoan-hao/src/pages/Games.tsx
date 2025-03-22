import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameStatusBadge from "@/components/games/GameStatusBadge";
import {
  GamepadIcon,
  Trophy,
  Users,
  Star,
  Clock,
  ArrowRight,
  Search,
  Globe,
  Laptop,
  Server,
  Download,
  Play,
  Filter,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import LazyThreeColumnLayout from "../components/layout/LazyThreeColumnLayout";
import LazyGameDialog from "@/components/games/LazyGameDialog";
import { Game, GameType, GameStatus, GAMES_DATA } from "@/data/games";

const getGameTypeIcon = (gameType: GameType) => {
  switch (gameType) {
    case "browser":
      return <Globe className="h-4 w-4 text-blue-500" />;
    case "embedded":
      return <Server className="h-4 w-4 text-green-500" />;
    case "desktop":
      return <Laptop className="h-4 w-4 text-purple-500" />;
    default:
      return <GamepadIcon className="h-4 w-4 text-primary" />;
  }
};

const getGameTypeLabel = (gameType: GameType) => {
  switch (gameType) {
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

const getActionButton = (game: Game, onPlay: () => void) => {
  // If game is under maintenance, disable the button
  if (game.status === "maintenance") {
    return (
      <Button disabled className="w-full opacity-70">
        <AlertTriangle className="mr-2 h-4 w-4" />
        Đang bảo trì
      </Button>
    );
  }

  // If game is coming soon, show a different button
  if (game.status === "coming_soon") {
    return (
      <Button
        disabled
        className="w-full bg-blue-500 opacity-80 hover:bg-blue-500"
      >
        <Clock className="mr-2 h-4 w-4" />
        Sắp ra mắt
      </Button>
    );
  }

  // For playable games, show the normal button based on game type
  const gameType = game.gameType;
  switch (gameType) {
    case "browser":
      return (
        <Button
          onClick={onPlay}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Play className="mr-2 h-4 w-4" />
          Chơi ngay
        </Button>
      );
    case "embedded":
      return (
        <Button
          onClick={onPlay}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Play className="mr-2 h-4 w-4" />
          Chơi ngay
        </Button>
      );
    case "desktop":
      return (
        <Button
          onClick={onPlay}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Tải xuống
        </Button>
      );
    default:
      return (
        <Button
          onClick={onPlay}
          className="w-full bg-primary hover:bg-primary-dark"
        >
          Chơi ngay
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      );
  }
};

const GameCard = ({
  game,
  onPlay,
}: {
  game: Game;
  onPlay: (game: Game) => void;
}) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className={`w-full h-full object-cover transition-transform hover:scale-105 ${game.status === "maintenance" ? "opacity-70 grayscale" : ""}`}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Badge
            className={`
              ${game.gameType === "browser" ? "bg-blue-600 hover:bg-blue-600" : ""}
              ${game.gameType === "embedded" ? "bg-green-600 hover:bg-green-600" : ""}
              ${game.gameType === "desktop" ? "bg-purple-600 hover:bg-purple-600" : ""}
            `}
          >
            <div className="flex items-center gap-1">
              {getGameTypeIcon(game.gameType)}
              <span className="text-xs">
                {getGameTypeLabel(game.gameType).split(" ")[0]}
              </span>
            </div>
          </Badge>
          <GameStatusBadge status={game.status} />
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-bold">{game.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {game.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm line-clamp-2">{game.description}</p>
        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{game.players} người chơi</span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            <span>{game.rating}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{game.playTime}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {getActionButton(game, () => onPlay(game))}
      </CardFooter>
    </Card>
  );
};

const Games = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState<GameType | "all">(
    "all",
  );
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    GameStatus | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let filtered = GAMES_DATA;

    // Filter by category
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (game) => game.category.toLowerCase() === activeTab,
      );
    }

    // Filter by game type
    if (activeTypeFilter !== "all") {
      filtered = filtered.filter((game) => game.gameType === activeTypeFilter);
    }

    // Filter by game status
    if (activeStatusFilter !== "all") {
      filtered = filtered.filter((game) => game.status === activeStatusFilter);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.category.toLowerCase().includes(query),
      );
    }

    // Sort games by status (maintenance games at the bottom)
    filtered = [...filtered].sort((a, b) => {
      if (a.status === "maintenance" && b.status !== "maintenance") return 1;
      if (a.status !== "maintenance" && b.status === "maintenance") return -1;
      return 0;
    });

    setSearchResults(filtered);
  }, [searchQuery, activeTab, activeTypeFilter, activeStatusFilter]);

  const handlePlayGame = (game: Game) => {
    // Don't do anything for maintenance or coming soon games
    if (game.status === "maintenance" || game.status === "coming_soon") {
      return;
    }

    if (game.gameType === "browser") {
      // For browser games, navigate to the game detail page
      navigate(`/games/${game.id}`);
    } else {
      // For other game types, show the dialog
      setSelectedGame(game);
      setDialogOpen(true);
    }
  };

  const filteredGames = searchResults;

  const categories = [
    "all",
    ...new Set(GAMES_DATA.map((game) => game.category.toLowerCase())),
  ];

  const gameTypes: (GameType | "all")[] = [
    "all",
    "browser",
    "embedded",
    "desktop",
  ];

  const gameStatuses: (GameStatus | "all")[] = [
    "all",
    "playable",
    "coming_soon",
    "maintenance",
  ];

  const getStatusLabel = (status: GameStatus | "all") => {
    switch (status) {
      case "playable":
        return "Có thể chơi";
      case "coming_soon":
        return "Sắp ra mắt";
      case "maintenance":
        return "Bảo trì";
      case "all":
        return "Tất cả trạng thái";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <LazyThreeColumnLayout>
        <div className="w-full max-w-[950px] mx-auto p-4">
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-primary">
                      {t("games.title")}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      {t("games.explore")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <span className="font-medium">
                      {t("games.leaderboard")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t("games.searchGames")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full bg-white"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <div className="flex gap-2 mr-4">
                      <span className="text-sm font-medium text-muted-foreground self-center">
                        {t("games.type")}:
                      </span>
                      {gameTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={
                            activeTypeFilter === type ? "default" : "outline"
                          }
                          className={`cursor-pointer px-3 py-1 ${type === "browser" && activeTypeFilter === type ? "bg-blue-600" : ""} ${type === "embedded" && activeTypeFilter === type ? "bg-green-600" : ""} ${type === "desktop" && activeTypeFilter === type ? "bg-purple-600" : ""}`}
                          onClick={() => setActiveTypeFilter(type)}
                        >
                          {type === "all" ? (
                            <>
                              <Filter className="h-3 w-3 mr-1" />
                              {t("games.all")}
                            </>
                          ) : type === "browser" ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              {t("games.browser")}
                            </>
                          ) : type === "embedded" ? (
                            <>
                              <Server className="h-3 w-3 mr-1" />
                              {t("games.embedded")}
                            </>
                          ) : (
                            <>
                              <Laptop className="h-3 w-3 mr-1" />
                              {t("games.desktop")}
                            </>
                          )}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <span className="text-sm font-medium text-muted-foreground self-center">
                        {t("games.status")}:
                      </span>
                      {gameStatuses.map((status) => (
                        <Badge
                          key={status}
                          variant={
                            activeStatusFilter === status
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer px-3 py-1 
                            ${status === "playable" && activeStatusFilter === status ? "bg-green-600 hover:bg-green-700" : ""}
                            ${status === "coming_soon" && activeStatusFilter === status ? "bg-blue-500 hover:bg-blue-600" : ""}
                            ${status === "maintenance" && activeStatusFilter === status ? "bg-red-500 hover:bg-red-600" : ""}
                          `}
                          onClick={() => setActiveStatusFilter(status)}
                        >
                          {status === "all" ? (
                            <>
                              <Filter className="h-3 w-3 mr-1" />
                              {t("games.all")}
                            </>
                          ) : status === "playable" ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("games.playable")}
                            </>
                          ) : status === "coming_soon" ? (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              {t("games.comingSoon")}
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {t("games.maintenance")}
                            </>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="all" className="mb-8">
                <TabsList className="mb-6">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      onClick={() => setActiveTab(category)}
                      className="capitalize"
                    >
                      {category === "all" ? t("games.all") : category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredGames.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          onPlay={handlePlayGame}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <GamepadIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        {t("games.noGamesFound")}
                      </h3>
                      <p className="text-muted-foreground mt-2 max-w-md">
                        {t("games.noGamesFoundDesc")}
                      </p>
                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setSearchQuery("")}
                        >
                          {t("games.clearSearch")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveTab("all");
                            setActiveTypeFilter("all");
                            setActiveStatusFilter("all");
                          }}
                        >
                          {t("games.clearFilters")}
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary rounded-full p-3">
                    <GamepadIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">
                    {t("games.recommended")}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="overflow-hidden border-blue-200 bg-gradient-to-b from-blue-50 to-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-blue-700">
                          {t("games.browserGames")}
                        </CardTitle>
                        <Globe className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardDescription>
                        {t("games.playInstantly")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          {t("games.playInBrowser")}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          {t("games.noInstallation")}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          {t("games.smoothExperience")}
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Globe className="mr-2 h-4 w-4" />
                        {t("games.viewAll")}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="overflow-hidden border-green-200 bg-gradient-to-b from-green-50 to-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-green-700">
                          {t("games.embeddedGames")}
                        </CardTitle>
                        <Server className="h-5 w-5 text-green-500" />
                      </div>
                      <CardDescription>
                        {t("games.fromGameService")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          {t("games.integratedFromGameService")}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          {t("games.playDirectly")}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          {t("games.continuousUpdates")}
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Server className="mr-2 h-4 w-4" />
                        {t("games.viewAll")}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="overflow-hidden border-purple-200 bg-gradient-to-b from-purple-50 to-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-purple-700">
                          {t("games.desktopGames")}
                        </CardTitle>
                        <Laptop className="h-5 w-5 text-purple-500" />
                      </div>
                      <CardDescription>
                        {t("games.downloadAndPlay")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          {t("games.highQualityGraphics")}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          {t("games.downloadFromGameService")}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          {t("games.fullGameExperience")}
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Download className="mr-2 h-4 w-4" />
                        {t("games.viewAll")}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LazyThreeColumnLayout>

      {selectedGame && (
        <LazyGameDialog
          game={selectedGame}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
};

export default Games;
