import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface FriendSuggestion {
  id: string;
  name: string;
  avatar: string;
  mutualFriends: number;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status?: "online" | "offline";
  lastActive?: string;
}

interface SuggestedFriendsSectionProps {
  friends?: Friend[];
  suggestions?: FriendSuggestion[];
  onSeeAll?: () => void;
  onAddFriend?: (id: string) => void;
}

const SuggestedFriendsSection = ({
  friends = [
    {
      id: "f1",
      name: "Alex Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      status: "online",
    },
    {
      id: "f2",
      name: "Sarah Williams",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      status: "offline",
      lastActive: "2 hours ago",
    },
    {
      id: "f3",
      name: "David Lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      status: "online",
    },
  ],
  suggestions = [
    {
      id: "1",
      name: "Emma Thompson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      mutualFriends: 12,
    },
    {
      id: "2",
      name: "Michael Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      mutualFriends: 8,
    },
    {
      id: "3",
      name: "Sophia Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
      mutualFriends: 5,
    },
    {
      id: "4",
      name: "James Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      mutualFriends: 3,
    },
    {
      id: "5",
      name: "Olivia Parker",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
      mutualFriends: 7,
    },
  ],
  onSeeAll,
  onAddFriend = (id) => console.log(`Add friend ${id} clicked`),
}: SuggestedFriendsSectionProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar,
            status: friend.status,
            lastActive: friend.lastActive,
          },
        },
      },
    });
  };

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
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden relative">
                    <a
                      href={`/profile/${friend.name.toLowerCase().replace(" ", "-")}`}
                    >
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                    {friend.status && (
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${friend.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      <a
                        href={`/profile/${friend.name.toLowerCase().replace(" ", "-")}`}
                        className="hover:underline"
                      >
                        {friend.name}
                      </a>
                    </p>
                    <p className="text-xs text-gray-500">
                      {friend.status === "online"
                        ? t("friends.online") || "Online"
                        : friend.lastActive}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-pink-500 border-pink-200 hover:bg-pink-50"
                  onClick={() => handleMessageClick(friend)}
                >
                  {t("friends.message") || "Message"}
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
                    href={`/profile/${friend.name.toLowerCase().replace(" ", "-")}`}
                  >
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="h-full w-full object-cover"
                    />
                  </a>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    <a
                      href={`/profile/${friend.name.toLowerCase().replace(" ", "-")}`}
                      className="hover:underline"
                    >
                      {friend.name}
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    {friend.mutualFriends} {t("friends.mutualFriends")}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-[#f2a2d2] hover:bg-pink-400 text-white"
                onClick={() => onAddFriend(friend.id)}
              >
                {t("friends.add")}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SuggestedFriendsSection;
