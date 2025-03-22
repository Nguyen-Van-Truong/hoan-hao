import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LogOut, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileSectionProps {
  user?: {
    name: string;
    username: string;
    avatar: string;
  };
  onLanguageChange?: (language: string) => void;
  onLogout?: () => void;
}

const UserProfileSection = ({
  user = {
    name: "Jane Doe",
    username: "@janedoe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  onLanguageChange = () => {},
  onLogout = () => {
    window.location.href = "/login";
  }, // Default to redirect to login
}: UserProfileSectionProps) => {
  const { language, setLanguage, t } = useLanguage();
  const auth = useAuth();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as "english" | "vietnamese");
    // Save language preference to localStorage
    localStorage.setItem("user-language-preference", value);
    onLanguageChange(value);
  };

  const handleLogout = () => {
    if (auth && auth.logout) {
      auth.logout();
    } else {
      onLogout();
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white shadow-sm w-full">
      <div className="flex items-center gap-3">
        <a href="/profile">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src={user.avatar} alt={user.name} loading="lazy" />
            <AvatarFallback className="bg-primary-light/20 text-primary">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </a>

        <div className="flex-1">
          <a href="/profile" className="hover:underline">
            <h3 className="font-medium text-gray-900">{user.name}</h3>
          </a>
          <p className="text-sm text-gray-500">{user.username}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-primary hover:bg-primary/10 flex items-center gap-1 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis"
            >
              <span className="truncate">{t("profile.profile")}</span>{" "}
              <ChevronDown size={14} className="flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto min-w-[14rem] p-2" align="end">
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 hover:bg-primary/10"
              onClick={() => (window.location.href = "/profile")}
            >
              <span>{t("profile.profile")}</span>
            </DropdownMenuItem>
            <div className="mb-2 px-2 py-1.5 mt-2">
              <p className="text-sm font-medium mb-1">
                {t("profile.language")}
              </p>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="vietnamese">Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>{t("profile.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default UserProfileSection;
