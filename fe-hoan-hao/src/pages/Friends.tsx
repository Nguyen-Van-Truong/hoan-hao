import React, { useState, useEffect } from "react";
import ThreeColumnLayout from "../components/layout/ThreeColumnLayout";
import { Avatar } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  getFriendsList, 
  getFriendSuggestions, 
  getFriendRequests,
  sendFriendRequest, 
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest
} from "@/api/services/userApi";
import { UserProfile } from "@/api/types";
import { toast } from "react-hot-toast";

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  mutualFriends?: number;
}

interface FriendRequest {
  id: string;
  user: Friend;
}

interface FriendsProps {
  initialTab?: string;
}

const Friends = ({ initialTab = "all" }: FriendsProps) => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for actual data
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  
  // Loading states
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [pendingActions, setPendingActions] = useState<string[]>([]);

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl && ["all", "requests", "suggestions"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoadingFriends(true);
      try {
        const response = await getFriendsList(1, 20);
        // Transform API data to component format
        const formattedFriends = response.friends.map((friend: UserProfile) => ({
          id: friend.id.toString(),
          name: friend.full_name,
          username: friend.username,
          avatar: friend.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`,
        }));
        setFriends(formattedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error);
        toast.error("Không thể tải danh sách bạn bè");
      } finally {
        setIsLoadingFriends(false);
      }
    };

    fetchFriends();
  }, []);

  // Fetch friend suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (activeTab === "suggestions") {
        setIsLoadingSuggestions(true);
        try {
          const data = await getFriendSuggestions(10);
          // Transform API data to component format
          const formattedSuggestions = data.map((user: UserProfile) => ({
            id: user.id.toString(),
            name: user.full_name,
            username: user.username,
            avatar: user.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
            mutualFriends: Math.floor(Math.random() * 10) + 1 // Mock mutual friends count
          }));
          setSuggestions(formattedSuggestions);
        } catch (error) {
          console.error("Error fetching friend suggestions:", error);
          toast.error("Không thể tải gợi ý kết bạn");
        } finally {
          setIsLoadingSuggestions(false);
        }
      }
    };

    fetchSuggestions();
  }, [activeTab]);

  // Fetch friend requests
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (activeTab === "requests") {
        setIsLoadingRequests(true);
        try {
          const data = await getFriendRequests(1, 20);
          // Transform API data to component format
          const formattedRequests = data.requests.map((request: any) => ({
            id: request.id.toString(),
            user: {
              id: request.sender.id.toString(),
              name: request.sender.full_name,
              username: request.sender.username,
              avatar: request.sender.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.sender.username}`,
            }
          }));
          setFriendRequests(formattedRequests);
        } catch (error) {
          console.error("Error fetching friend requests:", error);
          toast.error("Không thể tải danh sách lời mời kết bạn");
        } finally {
          setIsLoadingRequests(false);
        }
      }
    };

    fetchFriendRequests();
  }, [activeTab]);

  // Handle send friend request
  const handleSendFriendRequest = async (userId: string) => {
    try {
      setPendingActions((prev) => [...prev, userId]);
      await sendFriendRequest(parseInt(userId));
      toast.success("Đã gửi lời mời kết bạn");
      // Update suggestions list
      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Không thể gửi lời mời kết bạn");
    } finally {
      setPendingActions((prev) => prev.filter((id) => id !== userId));
    }
  };

  // Handle accept friend request
  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      setPendingActions((prev) => [...prev, requestId]);
      await acceptFriendRequest(parseInt(requestId));
      toast.success("Đã chấp nhận lời mời kết bạn");
      // Remove from requests and add to friends
      const request = friendRequests.find(req => req.id === requestId);
      if (request) {
        setFriends((prev) => [...prev, request.user]);
        setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Không thể chấp nhận lời mời kết bạn");
    } finally {
      setPendingActions((prev) => prev.filter((id) => id !== requestId));
    }
  };

  // Handle reject friend request
  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      setPendingActions((prev) => [...prev, requestId]);
      await rejectFriendRequest(parseInt(requestId));
      toast.success("Đã từ chối lời mời kết bạn");
      // Remove from requests
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Không thể từ chối lời mời kết bạn");
    } finally {
      setPendingActions((prev) => prev.filter((id) => id !== requestId));
    }
  };

  const handleNavigateToProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handleNavigateToMessages = (friend: Friend) => {
    navigate("/messages", {
      state: {
        newConversation: {
          user: {
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar,
          },
        },
      },
    });
  };

  const filterFriends = (friends: Friend[]) => {
    if (!searchQuery) return friends;
    return friends.filter((friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getDisplayedFriends = () => {
    return filterFriends(friends);
  };

  const displayedFriends = getDisplayedFriends();

  // For styling
  const getTabClassNames = (isActive: boolean) => {
    return isActive
      ? "font-semibold border-b-2 border-primary"
      : "text-gray-600";
  };

  return (
    <ThreeColumnLayout>
      <div className="max-w-3xl mx-auto p-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-6">{t("friends.title") || "Bạn bè"}</h1>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder={t("friends.searchPlaceholder") || "Tìm bạn bè..."}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="all">
                  {t("friends.allFriends") || "Tất cả bạn bè"}
                </TabsTrigger>
                <TabsTrigger value="requests">
                  {t("friends.requests") || "Lời mời"}
                </TabsTrigger>
                <TabsTrigger value="suggestions">
                  {t("friends.suggestions") || "Gợi ý"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {isLoadingFriends ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : displayedFriends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-14 w-14 cursor-pointer" onClick={() => handleNavigateToProfile(friend.username)}>
                            <img src={friend.avatar} alt={friend.name} />
                          </Avatar>
                          <div>
                            <h3 
                              className="font-medium text-base cursor-pointer hover:underline" 
                              onClick={() => handleNavigateToProfile(friend.username)}
                            >
                              {friend.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              @{friend.username}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:bg-primary/10"
                          onClick={() => handleNavigateToMessages(friend)}
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          {t("friends.message") || "Nhắn tin"}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    {t("friends.noFriendsFound") || "Không tìm thấy bạn bè nào."}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requests">
                {isLoadingRequests ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : friendRequests.length > 0 ? (
                  <div className="space-y-4">
                    {friendRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-14 w-14 cursor-pointer" onClick={() => handleNavigateToProfile(request.user.username)}>
                            <img src={request.user.avatar} alt={request.user.name} />
                          </Avatar>
                          <div>
                            <h3 
                              className="font-medium text-base cursor-pointer hover:underline" 
                              onClick={() => handleNavigateToProfile(request.user.username)}
                            >
                              {request.user.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              @{request.user.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-primary hover:bg-primary-dark"
                            onClick={() => handleAcceptFriendRequest(request.id)}
                            disabled={pendingActions.includes(request.id)}
                          >
                            {pendingActions.includes(request.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                {t("friends.accept") || "Chấp nhận"}
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300"
                            onClick={() => handleRejectFriendRequest(request.id)}
                            disabled={pendingActions.includes(request.id)}
                          >
                            {pendingActions.includes(request.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                {t("friends.decline") || "Từ chối"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    {t("friends.noRequests") || "Không có lời mời kết bạn nào."}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="suggestions">
                {isLoadingSuggestions ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-14 w-14 cursor-pointer" onClick={() => handleNavigateToProfile(suggestion.username)}>
                            <img src={suggestion.avatar} alt={suggestion.name} />
                          </Avatar>
                          <div>
                            <h3 
                              className="font-medium text-base cursor-pointer hover:underline" 
                              onClick={() => handleNavigateToProfile(suggestion.username)}
                            >
                              {suggestion.name}
                            </h3>
                            {suggestion.mutualFriends && (
                              <p className="text-xs text-gray-500">
                                {suggestion.mutualFriends} {t("friends.mutualFriends") || "bạn chung"}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary-dark"
                          onClick={() => handleSendFriendRequest(suggestion.id)}
                          disabled={pendingActions.includes(suggestion.id)}
                        >
                          {pendingActions.includes(suggestion.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              {t("friends.add") || "Kết bạn"}
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    {t("friends.noSuggestions") || "Không có gợi ý kết bạn nào."}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ThreeColumnLayout>
  );
};

export default Friends;
