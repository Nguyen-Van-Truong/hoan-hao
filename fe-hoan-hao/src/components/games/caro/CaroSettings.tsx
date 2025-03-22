import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Save, RotateCcw } from "lucide-react";

interface CaroSettingsProps {
  boardSize: number;
  winCondition: number;
  onBoardSizeChange: (size: number) => void;
  onWinConditionChange: (condition: number) => void;
}

const CaroSettings: React.FC<CaroSettingsProps> = ({
  boardSize,
  winCondition,
  onBoardSizeChange,
  onWinConditionChange,
}) => {
  const [localBoardSize, setLocalBoardSize] = React.useState(boardSize);
  const [localWinCondition, setLocalWinCondition] =
    React.useState(winCondition);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [timerEnabled, setTimerEnabled] = React.useState(true);
  const [highlightWinningLine, setHighlightWinningLine] = React.useState(true);

  const handleSaveSettings = () => {
    onBoardSizeChange(localBoardSize);
    onWinConditionChange(localWinCondition);
    // In a real app, you would save other settings to localStorage or a backend
  };

  const handleResetSettings = () => {
    setLocalBoardSize(10);
    setLocalWinCondition(5);
    setSoundEnabled(true);
    setTimerEnabled(true);
    setHighlightWinningLine(true);
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Cài đặt trò chơi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="board-size">
                Kích thước bàn cờ: {localBoardSize}x{localBoardSize}
              </Label>
              <span className="text-sm text-muted-foreground">
                ({localBoardSize}x{localBoardSize})
              </span>
            </div>
            <Slider
              id="board-size"
              min={5}
              max={20}
              step={1}
              value={[localBoardSize]}
              onValueChange={(value) => setLocalBoardSize(value[0])}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Bàn cờ nhỏ hơn cho trận đấu nhanh, bàn cờ lớn hơn cho trận đấu
              chiến thuật.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="win-condition">
                Số quân liên tiếp để thắng: {localWinCondition}
              </Label>
              <span className="text-sm text-muted-foreground">
                ({localWinCondition} quân)
              </span>
            </div>
            <Slider
              id="win-condition"
              min={3}
              max={Math.min(10, localBoardSize)}
              step={1}
              value={[localWinCondition]}
              onValueChange={(value) => setLocalWinCondition(value[0])}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tiêu chuẩn là 5 quân. Giảm xuống để trò chơi dễ hơn, tăng lên để
              thử thách hơn.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-toggle" className="font-medium">
                Âm thanh
              </Label>
              <p className="text-sm text-muted-foreground">
                Bật/tắt âm thanh trong trò chơi
              </p>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="timer-toggle" className="font-medium">
                Hiển thị thời gian
              </Label>
              <p className="text-sm text-muted-foreground">
                Hiển thị đồng hồ đếm thời gian trận đấu
              </p>
            </div>
            <Switch
              id="timer-toggle"
              checked={timerEnabled}
              onCheckedChange={setTimerEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="highlight-toggle" className="font-medium">
                Đánh dấu đường thắng
              </Label>
              <p className="text-sm text-muted-foreground">
                Tự động đánh dấu đường thắng khi kết thúc trò chơi
              </p>
            </div>
            <Switch
              id="highlight-toggle"
              checked={highlightWinningLine}
              onCheckedChange={setHighlightWinningLine}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleResetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Khôi phục mặc định
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Lưu cài đặt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaroSettings;
