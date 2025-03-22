import React from "react";
import { cn } from "@/lib/utils";
import LeftColumn from "./LeftColumn";
import ContentColumn from "./ContentColumn";
import RightColumn from "./RightColumn";

interface ThreeColumnLayoutProps {
  className?: string;
  leftColumnProps?: React.ComponentProps<typeof LeftColumn>;
  contentColumnProps?: React.ComponentProps<typeof ContentColumn>;
  rightColumnProps?: React.ComponentProps<typeof RightColumn>;
  children?: React.ReactNode;
}

const ThreeColumnLayout = ({
  className,
  leftColumnProps = {},
  contentColumnProps = {},
  rightColumnProps = {},
  children,
}: ThreeColumnLayoutProps) => {
  return (
    <div
      className={cn("flex w-full min-h-screen", className)}
      style={{ backgroundColor: "#a2d2f2" }} // Pink background as requested
    >
      {/* Left Column - Navigation */}
      <div className="hidden md:block sticky top-0 h-screen">
        <LeftColumn {...leftColumnProps} />
      </div>

      {/* Center Column - Content */}
      <div className="flex-1 flex justify-center">
        {children ? children : <ContentColumn {...contentColumnProps} />}
      </div>

      {/* Right Column - Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <RightColumn {...rightColumnProps} />
      </div>

      {/* Mobile Navigation Bar - Only visible on small screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50">
        <div className="flex justify-around items-center">
          <a
            href="/"
            className={`p-2 ${window.location.pathname === "/" ? "text-pink-500" : "text-gray-500"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-home"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </a>
          <a
            href="/messages"
            className={`p-2 ${window.location.pathname.includes("/messages") ? "text-pink-500" : "text-gray-500"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-square"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </a>
          <a
            href="/friends"
            className={`p-2 ${window.location.pathname.includes("/friends") ? "text-pink-500" : "text-gray-500"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-users"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </a>
          <a
            href="/groups"
            className={`p-2 ${window.location.pathname.includes("/groups") ? "text-pink-500" : "text-gray-500"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-users-round"
            >
              <path d="M18 21a8 8 0 0 0-16 0" />
              <circle cx="10" cy="8" r="5" />
              <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
            </svg>
          </a>
          <a
            href="/games"
            className={`p-2 ${window.location.pathname.includes("/games") ? "text-pink-500" : "text-gray-500"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-gamepad-2"
            >
              <line x1="6" x2="10" y1="11" y2="11" />
              <line x1="8" x2="8" y1="9" y2="13" />
              <line x1="15" x2="15.01" y1="12" y2="12" />
              <line x1="18" x2="18.01" y1="10" y2="10" />
              <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5z" />
            </svg>
          </a>
          <button className="p-2 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-menu"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
