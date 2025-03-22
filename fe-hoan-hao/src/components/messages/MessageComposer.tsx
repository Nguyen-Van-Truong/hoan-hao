import React, { useState } from "react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Image, Smile, Calendar, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MessageComposerProps {
  userAvatar?: string;
  onSendMessage?: (content: string) => void;
}

const MessageComposer = ({
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
  onSendMessage = () => {},
}: MessageComposerProps) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <img src={userAvatar} alt="Your avatar" loading="lazy" />
        </Avatar>

        <div className="flex-1">
          <Textarea
            placeholder={t("messages.whatsHappening") || "What's happening?"}
            className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0 text-lg placeholder:text-gray-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-pink-500 hover:bg-pink-50"
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-pink-500 hover:bg-pink-50"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-pink-500 hover:bg-pink-50"
              >
                <Calendar className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-pink-500 hover:bg-pink-50"
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </div>

            <Button
              className="rounded-full bg-pink-500 hover:bg-pink-600 px-4"
              size="sm"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              {t("messages.send") || "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;
