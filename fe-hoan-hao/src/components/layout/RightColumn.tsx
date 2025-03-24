import React, { useState } from "react";
import UserProfileSection from "../sidebar/UserProfileSection";
import AdvertisingSection from "../sidebar/AdvertisingSection";
import SuggestedFriendsSection from "../sidebar/SuggestedFriendsSection";
import { useToast } from "../ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RightColumnProps {
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
                     }: RightColumnProps) => {
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const { user, logout } = useAuth();

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
    logout();
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
          style={{ backgroundColor: "#f2a2d2" }}
      >
        {user && (
            <UserProfileSection
                onLanguageChange={handleLanguageChange}
            />
        )}

        <AdvertisingSection ads={ads} />

        <SuggestedFriendsSection />
      </div>
  );
};

export default RightColumn;
