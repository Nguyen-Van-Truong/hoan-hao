import React, { useState } from "react";
import UserProfileSection from "../sidebar/UserProfileSection";
import AdvertisingSection from "../sidebar/AdvertisingSection";
import SuggestedFriendsSection from "../sidebar/SuggestedFriendsSection";
import { useToast } from "../ui/use-toast";

interface RightColumnProps {
  userProfile?: {
    name: string;
    username: string;
    avatar: string;
  };
  ads?: Array<{
    title: string;
    description: string;
    imageUrl: string;
    ctaText: string;
    onClick?: () => void;
  }>;
  friendSuggestions?: Array<{
    id: string;
    name: string;
    avatar: string;
    mutualFriends: number;
  }>;
}

const RightColumn = ({
  userProfile = {
    name: "Jane Doe",
    username: "@janedoe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  ads = [
    {
      title: "Summer Sale",
      description: "Get 50% off on all summer items. Limited time offer!",
      imageUrl:
        "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400&q=80",
      ctaText: "Shop Now",
    },
    {
      title: "New Collection",
      description: "Discover our latest fashion arrivals for this season.",
      imageUrl:
        "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&q=80",
      ctaText: "View Collection",
    },
  ],
  friendSuggestions = [
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
}: RightColumnProps) => {
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState("english");

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    toast({
      title:
        language === "english" ? "Language Changed" : "Đã Thay Đổi Ngôn Ngữ",
      description:
        language === "english"
          ? "Your language preference has been updated to English"
          : "Tùy chọn ngôn ngữ của bạn đã được cập nhật thành Tiếng Việt",
      duration: 3000,
    });
  };

  const handleLogout = () => {
    toast({
      title: currentLanguage === "english" ? "Logged Out" : "Đã Đăng Xuất",
      description:
        currentLanguage === "english"
          ? "You have been successfully logged out"
          : "Bạn đã đăng xuất thành công",
      duration: 3000,
    });
  };

  return (
    <div
      className="w-full h-full max-w-[280px] p-4 flex flex-col gap-6 overflow-y-auto shadow-md rounded-lg"
      style={{ backgroundColor: "#f2a2d2" }} // Pink background as requested
    >
      <UserProfileSection
        user={userProfile}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
      />

      <AdvertisingSection ads={ads} />

      <SuggestedFriendsSection suggestions={friendSuggestions} />
    </div>
  );
};

export default RightColumn;
