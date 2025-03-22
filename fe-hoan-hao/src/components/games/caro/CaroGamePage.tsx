import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Info, Trophy } from "lucide-react";
import CaroGame from "./CaroGame";
import CaroLeaderboard from "./CaroLeaderboard";
import CaroSettings from "./CaroSettings";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

interface CaroGamePageProps {
  gameId?: string;
}

const CaroGamePage: React.FC<CaroGamePageProps> = ({ gameId = "1" }) => {
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState<number>(10);
  const [winCondition, setWinCondition] = useState<number>(5);

  return (
    <div className="min-h-screen bg-gray-100">
      <ThreeColumnLayout>
        <div className="w-full max-w-[950px] mx-auto p-4">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate("/games")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-primary">Cờ Caro</h1>
          </div>

          <Tabs defaultValue="play" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="play">Chơi ngay</TabsTrigger>
              <TabsTrigger value="leaderboard">Bảng xếp hạng</TabsTrigger>
              <TabsTrigger value="settings">Cài đặt</TabsTrigger>
              <TabsTrigger value="help">Hướng dẫn</TabsTrigger>
            </TabsList>

            <TabsContent value="play" className="mt-0">
              <CaroGame boardSize={boardSize} winCondition={winCondition} />
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-0">
              <CaroLeaderboard />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <CaroSettings
                boardSize={boardSize}
                winCondition={winCondition}
                onBoardSizeChange={setBoardSize}
                onWinConditionChange={setWinCondition}
              />
            </TabsContent>

            <TabsContent value="help" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Luật chơi</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cờ Caro là trò chơi cổ điển, người chơi lần lượt đánh
                          dấu X hoặc O vào bàn cờ. Người chơi đầu tiên tạo được
                          5 quân liên tiếp theo hàng ngang, dọc hoặc chéo sẽ
                          thắng.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Tùy chỉnh</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Bạn có thể thay đổi kích thước bàn cờ và số quân liên
                          tiếp cần để thắng trong phần Cài đặt.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Bảng xếp hạng</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Theo dõi thành tích của bạn và những người chơi khác
                          trong phần Bảng xếp hạng.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ThreeColumnLayout>
    </div>
  );
};

export default CaroGamePage;
