import React, { useState, useEffect, memo } from "react";
import ThreeColumnLayout from "../layout/ThreeColumnLayout";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MessageItem from "./MessageItem";
import ConversationList from "./ConversationList";
import MessageComposer from "./MessageComposer";

// Memoize components that don't need frequent re-renders
const MemoizedMessageItem = memo(MessageItem);
const MemoizedConversationList = memo(ConversationList);
const MemoizedMessageComposer = memo(MessageComposer);

const MessagesStoryboard = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >("c1"); // Default to first conversation
  const [messages, setMessages] = useState<any[]>([]);

  // Mock data for conversations - moved outside component to prevent recreation
  const [conversations] = useState(() => [
    {
      id: "c1",
      user: {
        name: "Jane Doe",
        username: "janedoe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      },
      lastMessage: {
        text: "Hey, how are you doing today?",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
      },
      isActive: true,
    },
    {
      id: "c2",
      user: {
        name: "John Smith",
        username: "johnsmith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      },
      lastMessage: {
        text: "Did you see the new movie that just came out?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true,
      },
      isActive: false,
    },
    {
      id: "c3",
      user: {
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      lastMessage: {
        text: "Thanks for the help with the project!",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isRead: true,
      },
      isActive: false,
    },
    {
      id: "c4",
      user: {
        name: "Michael Chen",
        username: "mikechen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      },
      lastMessage: {
        text: "Let's meet up for coffee next week!",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isRead: true,
      },
      isActive: false,
    },
  ]);

  // Initial conversation messages - moved outside component and memoized
  const initialConversationMessages = React.useMemo(
    () => ({
      c1: [
        {
          id: "m1",
          author: {
            name: "Jane Doe",
            username: "janedoe",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
          },
          content: "Hey there! How's your day going?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "m2",
          author: {
            name: "Current User",
            username: "currentuser",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
          },
          content:
            "Hi Jane! It's going pretty well, thanks for asking. Just working on some new features for the app.",
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        },
        {
          id: "m3",
          author: {
            name: "Jane Doe",
            username: "janedoe",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
          },
          content:
            "That sounds exciting! What kind of features are you working on?",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: "m4",
          author: {
            name: "Current User",
            username: "currentuser",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
          },
          content:
            "I'm adding a new messaging system with better media sharing.",
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
        },
        {
          id: "m5",
          author: {
            name: "Jane Doe",
            username: "janedoe",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
          },
          content:
            "That sounds really cool! I'd love to test it out when it's ready.",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
      ],
      c2: [
        {
          id: "m6",
          author: {
            name: "John Smith",
            username: "johnsmith",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
          },
          content: "Did you see the new movie that just came out?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "m7",
          author: {
            name: "Current User",
            username: "currentuser",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
          },
          content: "Not yet! Is it good?",
          timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
        },
      ],
      c3: [
        {
          id: "m8",
          author: {
            name: "Sarah Johnson",
            username: "sarahj",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
          },
          content: "Thanks for the help with the project!",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
      c4: [
        {
          id: "m9",
          author: {
            name: "Michael Chen",
            username: "mikechen",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
          },
          content: "Let's meet up for coffee next week!",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m10",
          author: {
            name: "Current User",
            username: "currentuser",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
          },
          content: "Sounds good! How about Tuesday at 2pm?",
          timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m11",
          author: {
            name: "Michael Chen",
            username: "mikechen",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
          },
          content: "Perfect! See you then at the usual place.",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    }),
    [],
  );

  // Initialize messages with the first conversation
  useEffect(() => {
    if (selectedConversation) {
      // Use a small timeout to prevent UI blocking
      const timer = setTimeout(() => {
        setMessages(
          initialConversationMessages[
            selectedConversation as keyof typeof initialConversationMessages
          ] || [],
        );
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [selectedConversation, initialConversationMessages]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSendMessage = React.useCallback(
    (content: string) => {
      // Debounce message sending to prevent UI lag
      if (content.trim() && selectedConversation) {
        const newMsg = {
          id: `m${Date.now()}`,
          author: {
            name: "Current User",
            username: "currentuser",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
          },
          content: content,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMsg]);
      }
    },
    [selectedConversation],
  );

  const handleSelectConversation = React.useCallback((id: string) => {
    setSelectedConversation(id);
  }, []);

  const isCurrentUser = React.useCallback(
    (username: string) => username === "currentuser",
    [],
  );

  // Find current conversation - memoized to prevent recalculation
  const currentConversation = React.useMemo(
    () => conversations.find((c) => c.id === selectedConversation),
    [conversations, selectedConversation],
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <ThreeColumnLayout>
        <div className="w-full max-w-[950px] mx-auto p-4">
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-screen flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={
                    t("messages.searchMessages") || "Tìm kiếm tin nhắn"
                  }
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Messages Interface */}
            <div className="flex-1 flex flex-col">
              <div className="flex h-full">
                <div className="w-1/3 border-r border-gray-200 h-full">
                  <MemoizedConversationList
                    conversations={conversations}
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation}
                  />
                </div>

                <div className="w-2/3 h-full flex flex-col">
                  {selectedConversation ? (
                    <>
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            <img
                              src={currentConversation?.user.avatar}
                              alt={t("messages.userAvatar") || "User avatar"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <h2 className="font-bold">
                            {currentConversation?.user.name}
                          </h2>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto bg-white p-2">
                        {messages.map((message) => (
                          <MemoizedMessageItem
                            key={message.id}
                            message={message}
                            isCurrentUser={isCurrentUser(
                              message.author.username,
                            )}
                          />
                        ))}
                      </div>

                      <MemoizedMessageComposer
                        userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser"
                        onSendMessage={handleSendMessage}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      {t("messages.selectConversation") ||
                        "Chọn một cuộc trò chuyện để bắt đầu nhắn tin"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThreeColumnLayout>
    </div>
  );
};

export default MessagesStoryboard;
