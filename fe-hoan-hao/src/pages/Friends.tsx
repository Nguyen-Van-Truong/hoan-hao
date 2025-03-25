import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LazyThreeColumnLayout from "@/components/layout/LazyThreeColumnLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, UserPlus, UserCheck, UserX, UserMinus } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getFriends,
  getFriendRequests,
  getFriendSuggestions,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  unfriend,
} from "@/api/services/userApi";

interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  friend: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    profile_picture_url?: string;
    cover_picture_url?: string;
  };
}

interface FriendSuggestion {
  id: number;
  username: string;
  email: string;
  full_name: string;
  profile_picture_url?: string;
  cover_picture_url?: string;
}

const Friends = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("friends");
  const [isLoading, setIsLoading] = useState(true);

  // States cho danh sách bạn bè
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsTotal, setFriendsTotal] = useState(0);
  const [friendsPage, setFriendsPage] = useState(1);

  // States cho yêu cầu kết bạn
  const [incomingRequests, setIncomingRequests] = useState<Friend[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Friend[]>([]);
  const [requestsPage, setRequestsPage] = useState(1);

  // States cho gợi ý kết bạn
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);

  // Load danh sách bạn bè
  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const response = await getFriends('accepted', friendsPage);
      setFriends(response.friends);
      setFriendsTotal(response.total);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bạn bè:", error);
      toast.error("Không thể tải danh sách bạn bè");
    } finally {
      setIsLoading(false);
    }
  };

  // Load yêu cầu kết bạn
  const loadFriendRequests = async () => {
    try {
      setIsLoading(true);
      const [incomingResponse, outgoingResponse] = await Promise.all([
        getFriendRequests('incoming', requestsPage),
        getFriendRequests('outgoing', requestsPage)
      ]);
      setIncomingRequests(incomingResponse.friends);
      setOutgoingRequests(outgoingResponse.friends);
    } catch (error) {
      console.error("Lỗi khi tải yêu cầu kết bạn:", error);
      toast.error("Không thể tải yêu cầu kết bạn");
    } finally {
      setIsLoading(false);
    }
  };

  // Load gợi ý kết bạn
  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await getFriendSuggestions();
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error("Lỗi khi tải gợi ý kết bạn:", error);
      toast.error("Không thể tải gợi ý kết bạn");
    } finally {
      setIsLoading(false);
    }
  };

  // Load dữ liệu khi tab thay đổi
  useEffect(() => {
    switch (activeTab) {
      case "friends":
        loadFriends();
        break;
      case "incoming":
      case "requests":
        loadFriendRequests();
        break;
      case "suggestions":
        loadSuggestions();
        break;
    }
  }, [activeTab]);

  // Xử lý các hành động kết bạn
  const handleSendRequest = async (username: string) => {
    try {
      await sendFriendRequest(username);
      toast.success("Đã gửi lời mời kết bạn");
      loadSuggestions();
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
      toast.error("Không thể gửi lời mời kết bạn");
    }
  };

  const handleAcceptRequest = async (username: string) => {
    try {
      await acceptFriendRequest(username);
      toast.success("Đã chấp nhận lời mời kết bạn");
      loadFriendRequests();
      // Tải lại danh sách bạn bè sau khi chấp nhận lời mời
      setActiveTab("friends");
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
      toast.error("Không thể chấp nhận lời mời kết bạn");
    }
  };

  const handleRejectRequest = async (username: string) => {
    try {
      await rejectFriendRequest(username);
      toast.success("Đã từ chối lời mời kết bạn");
      loadFriendRequests();
    } catch (error) {
      console.error("Lỗi khi từ chối lời mời kết bạn:", error);
      toast.error("Không thể từ chối lời mời kết bạn");
    }
  };

  const handleCancelRequest = async (username: string) => {
    try {
      await cancelFriendRequest(username);
      toast.success("Đã hủy lời mời kết bạn");
      loadFriendRequests();
    } catch (error) {
      console.error("Lỗi khi hủy lời mời kết bạn:", error);
      toast.error("Không thể hủy lời mời kết bạn");
    }
  };

  const handleUnfriend = async (username: string) => {
    try {
      await unfriend(username);
      toast.success("Đã hủy kết bạn");
      loadFriends();
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      toast.error("Không thể hủy kết bạn");
    }
  };

  // Component hiển thị loading
  const LoadingState = () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <LazyThreeColumnLayout>
        <div className="w-full max-w-[950px] mx-auto">
          <Card className="mt-4">
            <CardContent className="p-6">
              <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-white rounded-lg shadow-sm">
                  <TabsTrigger value="friends" className="flex-1">
                    {t("friends.friends") || "Bạn bè"}
                  </TabsTrigger>
                  <TabsTrigger value="incoming" className="flex-1">
                    {t("friends.incomingRequests") || "Lời mời kết bạn"}
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex-1">
                    {t("friends.outgoingRequests") || "Yêu cầu đã gửi"}
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="flex-1">
                    {t("friends.suggestions") || "Gợi ý kết bạn"}
                  </TabsTrigger>
                </TabsList>

                {/* Tab Danh sách bạn bè */}
                <TabsContent value="friends" className="mt-4">
                  {isLoading ? (
                    <LoadingState />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {friends.map((friend) => (
                        <div key={friend.id} className="bg-white rounded-lg shadow-sm p-4">
                          <div className="flex flex-col items-center">
                            <a href={`/profile/${friend.friend.username}`} className="block group">
                              <Avatar className="h-20 w-20 mb-2">
                                <img
                                  src={friend.friend.profile_picture_url || "/avatardefaut.png"}
                                  alt={friend.friend.full_name}
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/avatardefaut.png";
                                  }}
                                />
                              </Avatar>
                            </a>
                            <h3 className="font-semibold text-center">
                              <a href={`/profile/${friend.friend.username}`} className="hover:text-pink-500 transition-colors">
                                {friend.friend.full_name}
                              </a>
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">@{friend.friend.username}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-red-500 hover:text-red-600"
                              onClick={() => handleUnfriend(friend.friend.username)}
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              {t("friends.unfriend") || "Hủy kết bạn"}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {friends.length === 0 && (
                        <p className="text-center text-gray-500 col-span-full">
                          {t("friends.noFriends") || "Bạn chưa có người bạn nào"}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Tab Lời mời kết bạn */}
                <TabsContent value="incoming" className="mt-4">
                  {isLoading ? (
                    <LoadingState />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {incomingRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-lg shadow-sm p-4">
                          <div className="flex flex-col items-center">
                            <a href={`/profile/${request.friend.username}`} className="block group">
                              <Avatar className="h-20 w-20 mb-2">
                                <img
                                  src={request.friend.profile_picture_url || "/avatardefaut.png"}
                                  alt={request.friend.full_name}
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/avatardefaut.png";
                                  }}
                                />
                              </Avatar>
                            </a>
                            <h3 className="font-semibold text-center">
                              <a href={`/profile/${request.friend.username}`} className="hover:text-pink-500 transition-colors">
                                {request.friend.full_name}
                              </a>
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">@{request.friend.username}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleAcceptRequest(request.friend.username)}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                {t("friends.accept") || "Chấp nhận"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleRejectRequest(request.friend.username)}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                {t("friends.reject") || "Từ chối"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {incomingRequests.length === 0 && (
                        <p className="text-center text-gray-500 col-span-full">
                          {t("friends.noIncomingRequests") || "Không có lời mời kết bạn nào"}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Tab Yêu cầu đã gửi */}
                <TabsContent value="requests" className="mt-4">
                  {isLoading ? (
                    <LoadingState />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {outgoingRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-lg shadow-sm p-4">
                          <div className="flex flex-col items-center">
                            <a href={`/profile/${request.friend.username}`} className="block group">
                              <Avatar className="h-20 w-20 mb-2">
                                <img
                                  src={request.friend.profile_picture_url || "/avatardefaut.png"}
                                  alt={request.friend.full_name}
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/avatardefaut.png";
                                  }}
                                />
                              </Avatar>
                            </a>
                            <h3 className="font-semibold text-center">
                              <a href={`/profile/${request.friend.username}`} className="hover:text-pink-500 transition-colors">
                                {request.friend.full_name}
                              </a>
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">@{request.friend.username}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-red-500 hover:text-red-600"
                              onClick={() => handleCancelRequest(request.friend.username)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              {t("friends.cancel") || "Hủy yêu cầu"}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {outgoingRequests.length === 0 && (
                        <p className="text-center text-gray-500 col-span-full">
                          {t("friends.noOutgoingRequests") || "Không có yêu cầu kết bạn nào đã gửi"}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Tab Gợi ý kết bạn */}
                <TabsContent value="suggestions" className="mt-4">
                  {isLoading ? (
                    <LoadingState />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="bg-white rounded-lg shadow-sm p-4">
                          <div className="flex flex-col items-center">
                            <a href={`/profile/${suggestion.username}`} className="block group">
                              <Avatar className="h-20 w-20 mb-2">
                                <img
                                  src={suggestion.profile_picture_url || "/avatardefaut.png"}
                                  alt={suggestion.full_name}
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/avatardefaut.png";
                                  }}
                                />
                              </Avatar>
                            </a>
                            <h3 className="font-semibold text-center">
                              <a href={`/profile/${suggestion.username}`} className="hover:text-pink-500 transition-colors">
                                {suggestion.full_name}
                              </a>
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">@{suggestion.username}</p>
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => handleSendRequest(suggestion.username)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              {t("friends.addFriend") || "Kết bạn"}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {suggestions.length === 0 && (
                        <p className="text-center text-gray-500 col-span-full">
                          {t("friends.noSuggestions") || "Không có gợi ý kết bạn nào"}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </LazyThreeColumnLayout>
    </div>
  );
};

export default Friends;
