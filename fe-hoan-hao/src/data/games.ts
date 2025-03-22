export type GameType = "browser" | "embedded" | "desktop";
export type GameStatus = "playable" | "coming_soon" | "maintenance";

export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  players: number;
  category: string;
  rating: number;
  playTime: string;
  gameType: GameType;
  status: GameStatus;
  size?: string;
  version?: string;
  developer?: string;
  releaseDate?: string;
  systemRequirements?: string;
}

export const GAMES_DATA: Game[] = [
  {
    id: "1",
    title: "Cờ Caro",
    description:
      "Trò chơi cờ caro cổ điển, người chơi đầu tiên tạo được 5 quân liên tiếp sẽ thắng.",
    image:
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=500&q=80",
    players: 2,
    category: "Cờ",
    rating: 4.8,
    playTime: "5-15 phút",
    gameType: "browser",
    status: "playable",
    developer: "Tempo Games",
    version: "1.2.0",
    releaseDate: "15/05/2023",
  },
  {
    id: "2",
    title: "Đoán Từ",
    description: "Trò chơi đoán từ vui nhộn, thử thách vốn từ vựng của bạn.",
    image:
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=500&q=80",
    players: 2,
    category: "Từ vựng",
    rating: 4.5,
    playTime: "10-20 phút",
    gameType: "embedded",
    status: "playable",
    developer: "WordPlay Studio",
    version: "2.1.3",
    releaseDate: "22/07/2023",
  },
  {
    id: "3",
    title: "Xếp Hình",
    description:
      "Trò chơi xếp hình giúp rèn luyện tư duy logic và khả năng phản xạ.",
    image:
      "https://images.unsplash.com/photo-1642456074142-92f75cb84ad2?w=500&q=80",
    players: 1,
    category: "Giải đố",
    rating: 4.7,
    playTime: "Không giới hạn",
    gameType: "desktop",
    status: "playable",
    developer: "PuzzleMaster",
    version: "3.0.1",
    releaseDate: "10/01/2024",
    size: "250MB",
    systemRequirements:
      "Windows 10/11 hoặc macOS 11+\nRAM: 4GB\nCPU: Intel Core i3 hoặc tương đương\nGPU: Intel HD Graphics 4000 hoặc tương đương",
  },
  {
    id: "4",
    title: "Đua Xe",
    description: "Trò chơi đua xe hấp dẫn với nhiều cấp độ và thử thách.",
    image:
      "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=500&q=80",
    players: 1,
    category: "Đua xe",
    rating: 4.6,
    playTime: "5-10 phút",
    gameType: "desktop",
    status: "maintenance",
    developer: "SpeedRacer Games",
    version: "2.5.0",
    releaseDate: "05/03/2024",
    size: "1.2GB",
    systemRequirements:
      "Windows 10/11 hoặc macOS 12+\nRAM: 8GB\nCPU: Intel Core i5 hoặc tương đương\nGPU: NVIDIA GeForce GTX 1050 hoặc tương đương\nDung lượng trống: 2GB",
  },
  {
    id: "5",
    title: "Bắn Bóng",
    description: "Trò chơi bắn bóng màu sắc, phá hủy các nhóm bóng cùng màu.",
    image:
      "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=500&q=80",
    players: 1,
    category: "Giải trí",
    rating: 4.4,
    playTime: "Không giới hạn",
    gameType: "browser",
    status: "playable",
    developer: "BubbleShooter Inc",
    version: "1.8.2",
    releaseDate: "18/09/2023",
  },
  {
    id: "6",
    title: "Sudoku",
    description: "Trò chơi giải đố Sudoku kinh điển với nhiều cấp độ khó.",
    image:
      "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=500&q=80",
    players: 1,
    category: "Giải đố",
    rating: 4.9,
    playTime: "15-30 phút",
    gameType: "embedded",
    status: "playable",
    developer: "LogicGames",
    version: "4.2.0",
    releaseDate: "30/11/2023",
  },
  {
    id: "7",
    title: "Minecraft Pocket",
    description:
      "Phiên bản di động của trò chơi xây dựng thế giới mở nổi tiếng.",
    image:
      "https://images.unsplash.com/photo-1587573089734-599851ce7967?w=500&q=80",
    players: 4,
    category: "Thế giới mở",
    rating: 4.8,
    playTime: "Không giới hạn",
    gameType: "desktop",
    status: "coming_soon",
    developer: "BlockCraft Studios",
    version: "1.19.2",
    releaseDate: "12/02/2024",
    size: "850MB",
    systemRequirements:
      "Windows 10/11 hoặc macOS 11+\nRAM: 6GB\nCPU: Intel Core i3 hoặc tương đương\nGPU: Intel HD Graphics 5000 hoặc tương đương\nDung lượng trống: 1GB",
  },
  {
    id: "8",
    title: "Candy Crush",
    description: "Trò chơi ghép kẹo phổ biến với hàng trăm cấp độ thử thách.",
    image:
      "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&q=80",
    players: 1,
    category: "Giải trí",
    rating: 4.7,
    playTime: "5-15 phút",
    gameType: "embedded",
    status: "coming_soon",
    developer: "Sweet Games",
    version: "3.5.1",
    releaseDate: "25/04/2023",
  },
  {
    id: "9",
    title: "Chiến Thuật Quân Sự",
    description:
      "Trò chơi chiến thuật quân sự thời gian thực với nhiều phe phái.",
    image:
      "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=500&q=80",
    players: 8,
    category: "Chiến thuật",
    rating: 4.6,
    playTime: "30-60 phút",
    gameType: "desktop",
    status: "coming_soon",
    developer: "WarStrategy Games",
    version: "2.0.5",
    releaseDate: "08/12/2023",
    size: "3.5GB",
    systemRequirements:
      "Windows 10/11 hoặc macOS 12+\nRAM: 16GB\nCPU: Intel Core i7 hoặc tương đương\nGPU: NVIDIA GeForce GTX 1660 hoặc tương đương\nDung lượng trống: 5GB",
  },
];
