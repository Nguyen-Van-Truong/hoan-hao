import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, FileText, Users, GamepadIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchResultItemProps {
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  to: string;
  type: string;
  onClick?: () => void;
}

const SearchResultItem = ({
  icon,
  primary,
  secondary,
  to,
  type,
  onClick,
}: SearchResultItemProps) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 hover:bg-pink-50 rounded-md transition-colors"
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{primary}</p>
        {secondary && (
          <p className="text-xs text-gray-500 truncate">{secondary}</p>
        )}
      </div>
      <div className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded-full">
        {type}
      </div>
    </Link>
  );
};

interface SearchResultsProps {
  query: string;
  onClose: () => void;
  visible: boolean;
}

const SearchResults = ({ query, onClose, visible }: SearchResultsProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!visible || !query.trim()) return null;

  // Handle Enter key press to navigate to search page
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  // Mock data - in a real app, this would come from an API call
  const keywordResults = [
    {
      id: "keyword-1",
      text: query,
      to: `/search?q=${encodeURIComponent(query)}`,
    },
  ];

  const userResults = [
    {
      id: "user-1",
      name: `Nguyễn Văn A (${query})`,
      info: "2 bạn chung",
      to: "/profile/user1",
    },
    {
      id: "user-2",
      name: `Trần Thị B (${query})`,
      info: "5 bạn chung",
      to: "/profile/user2",
    },
  ];

  const postResults = [
    {
      id: "post-1",
      title: `Bài viết về ${query}`,
      author: "Nguyễn Văn A",
      to: "/post/user1/post1",
    },
    {
      id: "post-2",
      title: `Chia sẻ kinh nghiệm ${query}`,
      author: "Trần Thị B",
      to: "/post/user2/post2",
    },
  ];

  const groupResults = [
    {
      id: "group-1",
      name: `Nhóm ${query} Việt Nam`,
      members: "1.2K thành viên",
      to: "/groups/group1",
    },
    {
      id: "group-2",
      name: `Cộng đồng ${query}`,
      members: "3.5K thành viên",
      to: "/groups/group2",
    },
  ];

  const gameResults = [
    {
      id: "game-1",
      name: `${query} Adventure`,
      players: "5K người chơi",
      to: "/games/game1",
    },
  ];

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <div className="p-2">
        {/* Keywords */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 px-3 py-1">
            {t("search.keywords") || "Từ khóa"}
          </h3>
          {keywordResults.map((item) => (
            <SearchResultItem
              key={item.id}
              icon={<Search className="h-5 w-5" />}
              primary={item.text}
              to={item.to}
              type={t("search.keyword") || "Từ khóa"}
              onClick={onClose}
            />
          ))}
        </div>

        {/* Users */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 px-3 py-1">
            {t("search.people") || "Người dùng"}
          </h3>
          {userResults.map((user) => (
            <SearchResultItem
              key={user.id}
              icon={<User className="h-5 w-5" />}
              primary={user.name}
              secondary={user.info}
              to={user.to}
              type={t("search.person") || "Người dùng"}
              onClick={onClose}
            />
          ))}
        </div>

        {/* Posts */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 px-3 py-1">
            {t("search.posts") || "Bài viết"}
          </h3>
          {postResults.map((post) => (
            <SearchResultItem
              key={post.id}
              icon={<FileText className="h-5 w-5" />}
              primary={post.title}
              secondary={post.author}
              to={post.to}
              type={t("search.post") || "Bài viết"}
              onClick={onClose}
            />
          ))}
        </div>

        {/* Groups */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 px-3 py-1">
            {t("search.groups") || "Nhóm"}
          </h3>
          {groupResults.map((group) => (
            <SearchResultItem
              key={group.id}
              icon={<Users className="h-5 w-5" />}
              primary={group.name}
              secondary={group.members}
              to={group.to}
              type={t("search.group") || "Nhóm"}
              onClick={onClose}
            />
          ))}
        </div>

        {/* Games */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 px-3 py-1">
            {t("search.games") || "Trò chơi"}
          </h3>
          {gameResults.map((game) => (
            <SearchResultItem
              key={game.id}
              icon={<GamepadIcon className="h-5 w-5" />}
              primary={game.name}
              secondary={game.players}
              to={game.to}
              type={t("search.game") || "Trò chơi"}
              onClick={onClose}
            />
          ))}
        </div>

        {/* View all results */}
        <div className="px-3 py-2 border-t border-gray-100">
          <Link
            to={`/search?q=${encodeURIComponent(query)}`}
            className="text-pink-600 text-sm font-medium hover:text-pink-700 flex items-center justify-center"
            onClick={onClose}
          >
            {t("search.viewAll") || "Xem tất cả kết quả"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
