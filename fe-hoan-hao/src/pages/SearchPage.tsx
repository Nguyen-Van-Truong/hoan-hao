import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  User,
  FileText,
  Users,
  GamepadIcon,
  Filter,
} from "lucide-react";
import ThreeColumnLayout from "../components/layout/ThreeColumnLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
}: SearchResultItemProps) => {
  return (
    <a
      href={to}
      className="flex items-center gap-3 p-4 hover:bg-pink-50 rounded-lg transition-colors border border-gray-100 mb-2"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-gray-900 truncate">
          {primary}
        </p>
        {secondary && (
          <p className="text-sm text-gray-500 truncate">{secondary}</p>
        )}
      </div>
      <div className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded-full">
        {type}
      </div>
    </a>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState("all");
  const [searchInput, setSearchInput] = useState(query);
  const { t } = useLanguage();

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchInput });
  };

  // Mock data - in a real app, this would come from an API call
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
    {
      id: "user-3",
      name: `Lê Văn C (${query})`,
      info: "1 bạn chung",
      to: "/profile/user3",
    },
    {
      id: "user-4",
      name: `Phạm Thị D (${query})`,
      info: "3 bạn chung",
      to: "/profile/user4",
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
    {
      id: "post-3",
      title: `Hướng dẫn ${query} cho người mới bắt đầu`,
      author: "Lê Văn C",
      to: "/post/user3/post3",
    },
    {
      id: "post-4",
      title: `${query} và những điều cần biết`,
      author: "Phạm Thị D",
      to: "/post/user4/post4",
    },
    {
      id: "post-5",
      title: `Tổng hợp về ${query}`,
      author: "Hoàng Văn E",
      to: "/post/user5/post5",
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
    {
      id: "group-3",
      name: `Hội những người yêu thích ${query}`,
      members: "5.7K thành viên",
      to: "/groups/group3",
    },
  ];

  const gameResults = [
    {
      id: "game-1",
      name: `${query} Adventure`,
      players: "5K người chơi",
      to: "/games/game1",
    },
    {
      id: "game-2",
      name: `${query} World`,
      players: "3.2K người chơi",
      to: "/games/game2",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <ThreeColumnLayout>
        <div className="w-full max-w-[950px] mx-auto p-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            {/* Search header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {t("search.results") || "Kết quả tìm kiếm"}
              </h1>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    t("search.placeholder") || "Tìm kiếm trên PinkSocial..."
                  }
                  className="flex-1"
                />
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                  <Search className="h-4 w-4 mr-2" />
                  {t("search.search") || "Tìm kiếm"}
                </Button>
              </form>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="w-full bg-gray-100">
                  <TabsTrigger value="all" className="flex-1">
                    {t("search.all") || "Tất cả"}
                  </TabsTrigger>
                  <TabsTrigger value="people" className="flex-1">
                    <User className="h-4 w-4 mr-2" />
                    {t("search.people") || "Người dùng"}
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    {t("search.posts") || "Bài viết"}
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    {t("search.groups") || "Nhóm"}
                  </TabsTrigger>
                  <TabsTrigger value="games" className="flex-1">
                    <GamepadIcon className="h-4 w-4 mr-2" />
                    {t("search.games") || "Trò chơi"}
                  </TabsTrigger>
                </TabsList>

                {/* Filter sidebar - only shown on larger screens */}
                <div className="hidden md:block float-left w-64 pr-6 mt-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 sticky top-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      {t("search.filters") || "Bộ lọc"}
                    </h3>

                    <div className="space-y-4">
                      {/* Date filter */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          {t("search.date") || "Thời gian"}
                        </h4>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="radio" name="date" className="mr-2" />
                            <span className="text-sm">
                              {t("search.anyTime") || "Bất kỳ lúc nào"}
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="date" className="mr-2" />
                            <span className="text-sm">
                              {t("search.past24h") || "24 giờ qua"}
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="date" className="mr-2" />
                            <span className="text-sm">
                              {t("search.pastWeek") || "Tuần qua"}
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="date" className="mr-2" />
                            <span className="text-sm">
                              {t("search.pastMonth") || "Tháng qua"}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Source filter */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          {t("search.source") || "Nguồn"}
                        </h4>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">
                              {t("search.fromFriends") || "Từ bạn bè"}
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">
                              {t("search.fromGroups") || "Từ nhóm"}
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">
                              {t("search.public") || "Công khai"}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="mt-6 md:ml-64">
                  <TabsContent value="all" className="space-y-6">
                    {/* People section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {t("search.people") || "Người dùng"}
                        </h2>
                        {userResults.length > 2 && (
                          <Button variant="link" className="text-pink-600">
                            {t("search.seeAll") || "Xem tất cả"}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {userResults.slice(0, 2).map((user) => (
                          <SearchResultItem
                            key={user.id}
                            icon={<User className="h-6 w-6" />}
                            primary={user.name}
                            secondary={user.info}
                            to={user.to}
                            type={t("search.person") || "Người dùng"}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Posts section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {t("search.posts") || "Bài viết"}
                        </h2>
                        {postResults.length > 3 && (
                          <Button variant="link" className="text-pink-600">
                            {t("search.seeAll") || "Xem tất cả"}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {postResults.slice(0, 3).map((post) => (
                          <SearchResultItem
                            key={post.id}
                            icon={<FileText className="h-6 w-6" />}
                            primary={post.title}
                            secondary={post.author}
                            to={post.to}
                            type={t("search.post") || "Bài viết"}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Groups section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {t("search.groups") || "Nhóm"}
                        </h2>
                        {groupResults.length > 2 && (
                          <Button variant="link" className="text-pink-600">
                            {t("search.seeAll") || "Xem tất cả"}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {groupResults.slice(0, 2).map((group) => (
                          <SearchResultItem
                            key={group.id}
                            icon={<Users className="h-6 w-6" />}
                            primary={group.name}
                            secondary={group.members}
                            to={group.to}
                            type={t("search.group") || "Nhóm"}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Games section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {t("search.games") || "Trò chơi"}
                        </h2>
                        {gameResults.length > 2 && (
                          <Button variant="link" className="text-pink-600">
                            {t("search.seeAll") || "Xem tất cả"}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {gameResults.slice(0, 2).map((game) => (
                          <SearchResultItem
                            key={game.id}
                            icon={<GamepadIcon className="h-6 w-6" />}
                            primary={game.name}
                            secondary={game.players}
                            to={game.to}
                            type={t("search.game") || "Trò chơi"}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="people">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("search.people") || "Người dùng"}
                    </h2>
                    <div className="space-y-2">
                      {userResults.map((user) => (
                        <SearchResultItem
                          key={user.id}
                          icon={<User className="h-6 w-6" />}
                          primary={user.name}
                          secondary={user.info}
                          to={user.to}
                          type={t("search.person") || "Người dùng"}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="posts">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("search.posts") || "Bài viết"}
                    </h2>
                    <div className="space-y-2">
                      {postResults.map((post) => (
                        <SearchResultItem
                          key={post.id}
                          icon={<FileText className="h-6 w-6" />}
                          primary={post.title}
                          secondary={post.author}
                          to={post.to}
                          type={t("search.post") || "Bài viết"}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="groups">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("search.groups") || "Nhóm"}
                    </h2>
                    <div className="space-y-2">
                      {groupResults.map((group) => (
                        <SearchResultItem
                          key={group.id}
                          icon={<Users className="h-6 w-6" />}
                          primary={group.name}
                          secondary={group.members}
                          to={group.to}
                          type={t("search.group") || "Nhóm"}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="games">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("search.games") || "Trò chơi"}
                    </h2>
                    <div className="space-y-2">
                      {gameResults.map((game) => (
                        <SearchResultItem
                          key={game.id}
                          icon={<GamepadIcon className="h-6 w-6" />}
                          primary={game.name}
                          secondary={game.players}
                          to={game.to}
                          type={t("search.game") || "Trò chơi"}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </ThreeColumnLayout>
    </div>
  );
};

export default SearchPage;
