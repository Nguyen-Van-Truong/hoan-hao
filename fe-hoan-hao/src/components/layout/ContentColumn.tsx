import React from "react";
import PostCreator from "../post/PostCreator";
import PostFeed from "../post/PostFeed";

interface ContentColumnProps {
  className?: string;
}

const ContentColumn = ({ className = "" }: ContentColumnProps) => {
  return (
    <div
      className={`w-full max-w-[950px] mx-auto min-h-screen ${className}`}
      style={{ backgroundColor: "var(--secondary)" }} // Blue background as requested
    >
      <div className="px-4 py-6 space-y-4">
        <PostCreator
          userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Jess"
          userName="Jessica Smith"
          placeholder="What's on your mind, Jessica?"
        />

        <PostFeed />
      </div>
    </div>
  );
};

export default ContentColumn;
