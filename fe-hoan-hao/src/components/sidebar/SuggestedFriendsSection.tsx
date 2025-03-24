import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getFriends, getFriendSuggestions, sendFriendRequest } from "@/api/services/userApi";

interface FriendSuggestion {
  id: number;
  username: string;
  email: string;
  full_name: string;
  profile_picture_url?: string;
  cover_picture_url?: string;
  mutual_friends?: number;
}

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

interface SuggestedFriendsSectionProps {
  onSeeAll?: () => void;
  onAddFriend?: (id: number) => void;
}

const SuggestedFriendsSection = ({
  onSeeAll,
  onAddFriend,
}: SuggestedFriendsSectionProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingActions, setPendingActions] = useState<number[]>([]);

  // Load danh sách bạn bè
  const loadFriends = async () => {
    try {
      const response = await getFriends('accepted', 1, 3); // Lấy 3 bạn bè mới nhất
      if (response && response.friends) {
        setFriends(response.friends);
        console.log("Loaded friends:", response.friends);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách bạn bè:", error);
      toast.error("Không thể tải danh sách bạn bè");
    }
  };

  // Load gợi ý kết bạn
  const loadSuggestions = async () => {
    try {
      const response = await getFriendSuggestions(5); // Lấy 5 gợi ý
      if (response && response.suggestions) {
        setSuggestions(response.suggestions);
        console.log("Loaded suggestions:", response.suggestions);
      }
    } catch (error) {
      console.error("Lỗi khi tải gợi ý kết bạn:", error);
      toast.error("Không thể tải gợi ý kết bạn");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
    loadSuggestions();
  }, []);

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
    } else {
      navigate("/friends?tab=suggestions");
    }
  };

  const handleMessageClick = (friend: Friend) => {
    navigate("/messages", {
      state: {
        newConversation: {
          user: {
            id: friend.friend.id,
            name: friend.friend.full_name,
            avatar: friend.friend.profile_picture_url,
            status: "online", // Giả định online
          },
        },
      },
    });
  };

  const handleAddFriend = async (id: number) => {
    try {
      setPendingActions(prev => [...prev, id]);
      await sendFriendRequest(id);
      toast.success("Đã gửi lời mời kết bạn");
      // Cập nhật lại danh sách gợi ý
      loadSuggestions();
      if (onAddFriend) {
        onAddFriend(id);
      }
    } catch (error) {
      toast.error("Không thể gửi lời mời kết bạn");
    } finally {
      setPendingActions(prev => prev.filter(friendId => friendId !== id));
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white rounded-lg shadow-sm">
      {/* Your Friends Section */}
      {friends && friends.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t("friends.yourFriends")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
              onClick={() => navigate("/friends?tab=all")}
            >
              {t("friends.seeAll")}
            </Button>
          </div>

          <div className="space-y-3">
            {friends.map((friendItem) => (
              <div
                key={friendItem.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden relative">
                    <a
                      href={`/profile/${friendItem.friend.username}`}
                    >
                      <img
                        src={friendItem.friend.profile_picture_url || "/avatardefaut.png"}
                        alt={friendItem.friend.full_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/avatardefaut.png";
                        }}
                      />
                    </a>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      <a
                        href={`/profile/${friendItem.friend.username}`}
                        className="hover:underline"
                      >
                        {friendItem.friend.full_name}
                      </a>
                    </p>
                    <p className="text-xs text-gray-500">
                      @{friendItem.friend.username}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-pink-500 border-pink-200 hover:bg-pink-50"
                  onClick={() => handleMessageClick(friendItem)}
                >
                  {t("friends.message") || "Nhắn tin"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Friends Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {t("friends.suggestedFriends")}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
            onClick={handleSeeAll}
          >
            {t("friends.seeAll")}
          </Button>
        </div>

        <div className="space-y-3">
          {suggestions.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <a
                    href={`/profile/${friend.username}`}
                  >
                    <img
                      src={friend.profile_picture_url || "/avatardefaut.png"}
                      alt={friend.full_name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/avatardefaut.png";
                      }}
                    />
                  </a>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    <a
                      href={`/profile/${friend.username}`}
                      className="hover:underline"
                    >
                      {friend.full_name}
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    {friend.mutual_friends || 0} {t("friends.mutualFriends") || "bạn chung"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-[#f2a2d2] hover:bg-pink-400 text-white"
                onClick={() => handleAddFriend(friend.id)}
                disabled={pendingActions.includes(friend.id)}
              >
                {pendingActions.includes(friend.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("friends.add") || "Kết bạn"
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SuggestedFriendsSection;
