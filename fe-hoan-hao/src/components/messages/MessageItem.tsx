import React from "react";
import { Avatar } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface MessageItemProps {
  message: {
    id: string;
    author: {
      name: string;
      username: string;
      avatar: string;
    };
    content: string;
    timestamp: Date;
    attachments?: string[];
  };
  isCurrentUser?: boolean;
}

const MessageItem = ({ message, isCurrentUser = false }: MessageItemProps) => {
  const { t } = useLanguage();

  return (
    <div className={`py-2 px-4 ${isCurrentUser ? "flex justify-end" : ""}`}>
      <div
        className={`flex gap-2 max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}
      >
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <img
              src={message.author.avatar}
              alt={message.author.name}
              loading="lazy"
            />
          </Avatar>
        )}

        <div className="flex flex-col">
          {!isCurrentUser && (
            <span className="text-xs text-gray-500 mb-1">
              {message.author.name}
            </span>
          )}

          <div
            className={`rounded-2xl p-3 ${isCurrentUser ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-800"}`}
          >
            <p>{message.content}</p>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 rounded-xl overflow-hidden">
                <img
                  src={message.attachments[0]}
                  alt="Attachment"
                  className="w-full h-auto max-h-60 object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          <span className="text-xs text-gray-500 mt-1 self-end">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
