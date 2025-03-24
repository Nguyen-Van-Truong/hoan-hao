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
      const response = await getFriends('accepted', friendsPage);
      setFriends(response.friends);
      setFriendsTotal(response.total);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bạn bè:", error);
      toast.error("Không thể tải danh sách bạn bè");
    }
  };

  // Load yêu cầu kết bạn
  const loadFriendRequests = async () => {
    try {
      const [incomingResponse, outgoingResponse] = await Promise.all([
        getFriendRequests('incoming', requestsPage),
        getFriendRequests('outgoing', requestsPage)
      ]);
      setIncomingRequests(incomingResponse.friends);
      setOutgoingRequests(outgoingResponse.friends);
    } catch (error) {
      console.error("Lỗi khi tải yêu cầu kết bạn:", error);
      toast.error("Không thể tải yêu cầu kết bạn");
    }
  };

  // Load gợi ý kết bạn
  const loadSuggestions = async () => {
    try {
      const response = await getFriendSuggestions();
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error("Lỗi khi tải gợi ý kết bạn:", error);
      toast.error("Không thể tải gợi ý kết bạn");
    }
  };

  // Load dữ liệu khi tab thay đổi
  useEffect(() => {
    setIsLoading(true);
    switch (activeTab) {
      case "friends":
        loadFriends();
        break;
      case "requests":
        loadFriendRequests();
        break;
      case "suggestions":
        loadSuggestions();
        break;
    }
    setIsLoading(false);
  }, [activeTab]);

  // Xử lý các hành động kết bạn
  const handleSendRequest = async (userId: number) => {
    try {
      await sendFriendRequest(userId);
      toast.success("Đã gửi lời mời kết bạn");
      loadSuggestions();
    } catch (error) {
      toast.error("Không thể gửi lời mời kết bạn");
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await acceptFriendRequest(requestId);
      toast.success("Đã chấp nhận lời mời kết bạn");
      loadFriendRequests();
      loadFriends();
    } catch (error) {
      toast.error("Không thể chấp nhận lời mời kết bạn");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await rejectFriendRequest(requestId);
      toast.success("Đã từ chối lời mời kết bạn");
      loadFriendRequests();
    } catch (error) {
      toast.error("Không thể từ chối lời mời kết bạn");
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await cancelFriendRequest(requestId);
      toast.success("Đã hủy lời mời kết bạn");
      loadFriendRequests();
    } catch (error) {
      toast.error("Không thể hủy lời mời kết bạn");
    }
  };

  const handleUnfriend = async (friendId: number) => {
    try {
      await unfriend(friendId);
      toast.success("Đã hủy kết bạn");
      loadFriends();
    } catch (error) {
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
                  <TabsTrigger value="requests" className="flex-1">
                    {t("friends.requests") || "Yêu cầu kết bạn"}
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
                            <Avatar className="h-20 w-20 mb-2">
                              <img
                                src={friend.friend.profile_picture_url || "/imgdefault.jpg"}
                                alt={friend.friend.full_name}
                                className="rounded-full"
                              />
                            </Avatar>
                            <h3 className="font-semibold text-center">{friend.friend.full_name}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-red-500 hover:text-red-600"
                              onClick={() => handleUnfriend(friend.friend.id)}
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              {t("friends.unfriend") || "Hủy kết bạn"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Tab Yêu cầu kết bạn */}
                <TabsContent value="requests" className="mt-4">
                  {isLoading ? (
                    <LoadingState />
                  ) : (
                    <div className="space-y-4">
                      {/* Yêu cầu đến */}
                      {incomingRequests.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {t("friends.incomingRequests") || "Yêu cầu đến"}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {incomingRequests.map((request) => (
                              <div key={request.id} className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex flex-col items-center">
                                  <Avatar className="h-20 w-20 mb-2">
                                    <img
                                      src={request.friend.profile_picture_url || "/imgdefault.jpg"}
                                      alt={request.friend.full_name}
                                      className="rounded-full"
                                    />
                                  </Avatar>
                                  <h3 className="font-semibold text-center">{request.friend.full_name}</h3>
                                  <div className="flex space-x-2 mt-2">
                                    <Button
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600"
                                      onClick={() => handleAcceptRequest(request.id)}
                                    >
                                      <UserCheck className="h-4 w-4 mr-1" />
                                      {t("friends.accept") || "Chấp nhận"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => handleRejectRequest(request.id)}
                                    >
                                      <UserX className="h-4 w-4 mr-1" />
                                      {t("friends.reject") || "Từ chối"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Yêu cầu đã gửi */}
                      {outgoingRequests.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {t("friends.outgoingRequests") || "Yêu cầu đã gửi"}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {outgoingRequests.map((request) => (
                              <div key={request.id} className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex flex-col items-center">
                                  <Avatar className="h-20 w-20 mb-2">
                                    <img
                                      src={request.friend.profile_picture_url || "/imgdefault.jpg"}
                                      alt={request.friend.full_name}
                                      className="rounded-full"
                                    />
                                  </Avatar>
                                  <h3 className="font-semibold text-center">{request.friend.full_name}</h3>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 text-red-500 hover:text-red-600"
                                    onClick={() => handleCancelRequest(request.id)}
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    {t("friends.cancel") || "Hủy yêu cầu"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                        <p className="text-center text-gray-500">
                          {t("friends.noRequests") || "Không có yêu cầu kết bạn nào"}
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
                            <Avatar className="h-20 w-20 mb-2">
                              <img
                                src={suggestion.profile_picture_url || "/imgdefault.jpg"}
                                alt={suggestion.full_name}
                                className="rounded-full"
                              />
                            </Avatar>
                            <h3 className="font-semibold text-center">{suggestion.full_name}</h3>
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => handleSendRequest(suggestion.id)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              {t("friends.addFriend") || "Kết bạn"}
                            </Button>
                          </div>
                        </div>
                      ))}
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
