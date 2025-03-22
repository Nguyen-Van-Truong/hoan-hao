import React from "react";
import { Avatar } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface Conversation {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  lastMessage: {
    text: string;
    timestamp: Date;
    isRead: boolean;
  };
  isActive: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

const ConversationList = ({
  conversations = [],
  onSelectConversation = () => {},
  selectedConversationId = null,
}: ConversationListProps) => {
  const { t } = useLanguage();

  return (
    <div className="border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">
          {t("messages.conversations") || "Conversations"}
        </h2>
      </div>

      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {t("messages.noConversations") || "No conversations yet"}
        </div>
      ) : (
        <div>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedConversationId === conversation.id ? "bg-pink-50" : ""}`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <img
                      src={conversation.user.avatar}
                      alt={conversation.user.name}
                      loading="lazy"
                    />
                  </Avatar>
                  {!conversation.lastMessage.isRead && (
                    <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-pink-500 border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">
                      {conversation.user.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(conversation.lastMessage.timestamp, {
                        addSuffix: false,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.text}
                    </p>
                    {!conversation.lastMessage.isRead && (
                      <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
