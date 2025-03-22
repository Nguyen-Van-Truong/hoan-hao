import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Clock, User, Calendar } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  playerName: string;
  wins: number;
  losses: number;
  draws: number;
  fastestWin: number; // in seconds
  lastPlayed: string;
}

// Mock data - in a real app, this would come from an API or database
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    id: "1",
    playerName: "NguyenVanA",
    wins: 42,
    losses: 15,
    draws: 7,
    fastestWin: 45,
    lastPlayed: "2024-05-15",
  },
  {
    id: "2",
    playerName: "TranThiB",
    wins: 38,
    losses: 20,
    draws: 5,
    fastestWin: 62,
    lastPlayed: "2024-05-14",
  },
  {
    id: "3",
    playerName: "LeVanC",
    wins: 35,
    losses: 22,
    draws: 8,
    fastestWin: 58,
    lastPlayed: "2024-05-16",
  },
  {
    id: "4",
    playerName: "PhamThiD",
    wins: 30,
    losses: 25,
    draws: 10,
    fastestWin: 75,
    lastPlayed: "2024-05-13",
  },
  {
    id: "5",
    playerName: "HoangVanE",
    wins: 28,
    losses: 30,
    draws: 6,
    fastestWin: 90,
    lastPlayed: "2024-05-12",
  },
];

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const CaroLeaderboard: React.FC = () => {
  // Sort by wins (descending)
  const sortedLeaderboard = [...mockLeaderboardData].sort(
    (a, b) => b.wins - a.wins,
  );

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Bảng xếp hạng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-sm text-muted-foreground">
                <th className="py-3 px-2 text-left">Hạng</th>
                <th className="py-3 px-2 text-left">Người chơi</th>
                <th className="py-3 px-2 text-center">Thắng</th>
                <th className="py-3 px-2 text-center">Thua</th>
                <th className="py-3 px-2 text-center">Hòa</th>
                <th className="py-3 px-2 text-center">Tỉ lệ thắng</th>
                <th className="py-3 px-2 text-center">Thắng nhanh nhất</th>
                <th className="py-3 px-2 text-center">Lần chơi gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((entry, index) => {
                const winRate = (
                  (entry.wins / (entry.wins + entry.losses + entry.draws)) *
                  100
                ).toFixed(1);

                return (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      {index === 0 ? (
                        <Badge className="bg-yellow-500">
                          <Trophy className="h-3 w-3 mr-1" />1
                        </Badge>
                      ) : index === 1 ? (
                        <Badge className="bg-gray-400">
                          <Medal className="h-3 w-3 mr-1" />2
                        </Badge>
                      ) : index === 2 ? (
                        <Badge className="bg-amber-600">
                          <Medal className="h-3 w-3 mr-1" />3
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground ml-2">
                          {index + 1}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      {entry.playerName}
                    </td>
                    <td className="py-3 px-2 text-center text-green-600 font-medium">
                      {entry.wins}
                    </td>
                    <td className="py-3 px-2 text-center text-red-600">
                      {entry.losses}
                    </td>
                    <td className="py-3 px-2 text-center text-gray-600">
                      {entry.draws}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge
                        variant="outline"
                        className={`
                        ${parseFloat(winRate) >= 70 ? "border-green-500 text-green-600" : ""}
                        ${parseFloat(winRate) >= 50 && parseFloat(winRate) < 70 ? "border-blue-500 text-blue-600" : ""}
                        ${parseFloat(winRate) < 50 ? "border-orange-500 text-orange-600" : ""}
                      `}
                      >
                        {winRate}%
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      {formatTime(entry.fastestWin)}
                    </td>
                    <td className="py-3 px-2 text-center flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {entry.lastPlayed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaroLeaderboard;
