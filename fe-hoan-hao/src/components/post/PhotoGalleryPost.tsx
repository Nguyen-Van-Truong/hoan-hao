import React, { useState } from "react";
import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Share2,
  Send,
  ChevronDown,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import PhotoViewer from "./PhotoViewer";
import { Comment, Reply } from "./types";
import { useNavigate } from "react-router-dom";

interface PhotoGalleryPostProps {
  author: {
    name: string;
    avatar: string;
    timestamp: string;
  };
  content: string;
  images?: string[];
  totalImages?: number;
  likes: number;
  comments: number;
  shares: number;
  commentsList?: Comment[];
  onCommentAdded?: (newComment: Comment) => void;
  onCommentLiked?: (commentId: string) => void;
  onReplyAdded?: (commentId: string, reply: Reply) => void;
  postId: string;
}

const PhotoGalleryPost = ({
  author,
  content,
  images,
  totalImages = 0,
  likes,
  comments,
  shares,
  commentsList = [],
  onCommentAdded,
  onCommentLiked,
  onReplyAdded,
  postId,
}: PhotoGalleryPostProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [visibleComments, setVisibleComments] = useState(2);
  const [liked, setLiked] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  // Number of images to display in the gallery
  const hasImages = images && images.length > 0;
  const displayCount = hasImages ? Math.min(6, images.length) : 0;
  const displayedImages = hasImages ? images.slice(0, displayCount) : [];
  const remainingCount = hasImages ? totalImages - displayCount : 0;

  const handleImageClick = (index: number) => {
    setInitialPhotoIndex(index);
    setPhotoViewerOpen(true);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      // Create a new comment
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        author: {
          name: "Current User",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
        },
        content: commentText,
        timestamp: "just now",
        likes: 0,
        replies: [],
      };

      // Clear the input
      setCommentText("");

      // Show all comments including the new one
      setShowComments(true);

      // Call the callback if provided
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  const submitReply = (commentId: string) => {
    if (replyText.trim()) {
      // In a real app, you would send this to a server
      // For now, we'll simulate adding a reply locally
      const updatedComments = [...commentsList];
      const commentIndex = updatedComments.findIndex((c) => c.id === commentId);

      if (commentIndex !== -1) {
        // Create a new reply
        const newReply: Reply = {
          id: `${commentId}-${Date.now()}`,
          author: {
            name: "Current User",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
          },
          content: replyText,
          timestamp: "just now",
          likes: 0,
        };

        // Initialize replies array if it doesn't exist
        if (!updatedComments[commentIndex].replies) {
          updatedComments[commentIndex].replies = [];
        }

        // Add the new reply
        updatedComments[commentIndex].replies!.push(newReply);

        // Update the comments list locally only
        // We don't update commentsList directly to avoid duplicate updates

        // Call the callback if provided
        if (onReplyAdded) {
          onReplyAdded(commentId, newReply);
        }
      }

      setReplyText("");
      setReplyingTo(null);
      // Auto-show replies for this comment
      toggleReplies(commentId, true);
    }
  };

  const toggleReplies = (commentId: string, forceShow?: boolean) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: forceShow !== undefined ? forceShow : !prev[commentId],
    }));
  };

  const loadMoreComments = () => {
    setVisibleComments(commentsList.length);
  };

  const toggleLike = () => {
    setLiked(!liked);
  };

  // Hàm xử lý khi bấm vào avatar để chuyển đến trang profile
  const handleAvatarClick = () => {
    const profileUrl = `/profile/${author.name.toLowerCase().replace(/ /g, "-")}`;
    navigate(profileUrl);
  };

  return (
    <Card className="w-full mb-4 overflow-hidden bg-white">
      <div className="p-4">
        {/* Post Header with Author Info and Menu */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div onClick={handleAvatarClick} className="cursor-pointer">
              <Avatar className="h-10 w-10 border-2 border-[#f2a2d2]">
                <AvatarImage src={author.avatar || "/avatardefaut.png"} alt={author.name} />
                <AvatarFallback className="bg-primary-light/20 text-primary">
                  {author.name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <a
                href={`/profile/${author.name.toLowerCase().replace(/ /g, "-")}`}
                className="hover:underline"
              >
                <h3 className="font-semibold text-sm">{author.name}</h3>
              </a>
              <a
                href={`/post/${author.name.toLowerCase().replace(/ /g, "-")}`}
                className="hover:underline"
              >
                <p className="text-xs text-gray-500">{author.timestamp}</p>
              </a>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <a
                  href={`/post/${author.name.toLowerCase().replace(/ /g, "-")}`}
                  className="w-full"
                >
                  {t("post.viewPostDetails") || "View Post Details"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>{t("post.savePost")}</DropdownMenuItem>
              <DropdownMenuItem>{t("post.hidePost")}</DropdownMenuItem>
              <DropdownMenuItem>{t("post.reportPost")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-sm">{content}</p>
        </div>

        {/* Photo Gallery - Only show if there are images */}
        {hasImages && (
          <div
            className={`grid ${displayedImages.length === 1 ? "grid-cols-1" : displayedImages.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-1 mb-3`}
          >
            {displayedImages.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-square overflow-hidden ${index === displayCount - 1 && remainingCount > 0 ? "relative" : ""} cursor-pointer`}
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === displayCount - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Photo Viewer */}
        {hasImages && (
          <PhotoViewer
            isOpen={photoViewerOpen}
            onClose={() => setPhotoViewerOpen(false)}
            images={images}
            initialIndex={initialPhotoIndex}
          />
        )}

        {/* Action Buttons */}
        <div className="flex border-t border-gray-100 pt-3">
          <Button
            variant="ghost"
            className={`flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-pink-50 ${liked ? "text-pink-500" : ""}`}
            onClick={toggleLike}
          >
            <Heart
              className={`h-5 w-5 ${liked ? "fill-pink-500 text-pink-500" : ""}`}
            />
            <span className="text-xs ml-1">{liked ? likes + 1 : likes}</span>
            <span>{t("post.like") || "Like"}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-pink-50"
            onClick={toggleComments}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs ml-1">{comments}</span>
            <span>{t("post.comment") || "Comment"}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-pink-50"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-xs ml-1">{shares}</span>
            <span>{t("post.share") || "Share"}</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 w-full border-t border-gray-100 pt-3">
            <div className="flex items-center space-x-2 mb-3">
              <Avatar className="h-8 w-8">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser"
                  alt="Current User"
                  className="rounded-full"
                />
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  placeholder={t("post.writeAComment") || "Write a comment..."}
                  className="min-h-[40px] py-2 pr-10 resize-none rounded-full bg-gray-100 border-0 focus-visible:ring-0"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-pink-500"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {[...commentsList]
                .slice(0, visibleComments)
                .reverse()
                .map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    {/* Main Comment */}
                    <div className="flex space-x-2">
                      <Avatar className="h-8 w-8">
                        <a
                          href={`/profile/${comment.author.name.toLowerCase().replace(/ /g, "-")}`}
                        >
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="rounded-full"
                          />
                        </a>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2">
                          <a
                            href={`/profile/${comment.author.name.toLowerCase().replace(/ /g, "-")}`}
                            className="font-semibold text-xs hover:underline"
                          >
                            {comment.author.name}
                          </a>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                          <span>{comment.timestamp}</span>
                          <button
                            className="font-semibold hover:text-gray-700"
                            onClick={() => {
                              // Handle comment like
                              const updatedComments = [...commentsList];
                              const commentIndex = updatedComments.findIndex(
                                (c) => c.id === comment.id,
                              );
                              if (commentIndex !== -1) {
                                updatedComments[commentIndex].likes += 1;
                                commentsList = updatedComments;
                                if (onCommentLiked) {
                                  onCommentLiked(comment.id);
                                }
                              }
                            }}
                          >
                            {t("post.like") || "Like"}
                          </button>
                          <button
                            className="font-semibold hover:text-gray-700"
                            onClick={() => handleReply(comment.id)}
                          >
                            {t("post.reply") || "Reply"}
                          </button>
                          {comment.replies && comment.replies.length > 0 && (
                            <button
                              className="font-semibold hover:text-gray-700 flex items-center"
                              onClick={() => toggleReplies(comment.id)}
                            >
                              {showReplies[comment.id]
                                ? t("post.hideReplies") || "Hide replies"
                                : `${t("post.viewReplies") || "View"} ${comment.replies.length} ${comment.replies.length === 1 ? t("post.reply") || "reply" : t("post.replies") || "replies"}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="flex items-start space-x-2 ml-10">
                        <Avatar className="h-7 w-7">
                          <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser"
                            alt="Current User"
                            className="rounded-full"
                          />
                        </Avatar>
                        <div className="flex-1 relative">
                          <Textarea
                            placeholder={`${t("post.replyTo") || "Reply to"} ${comment.author.name}...`}
                            className="min-h-[36px] py-2 pr-16 resize-none rounded-full bg-gray-100 border-0 focus-visible:ring-0 text-sm"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                submitReply(comment.id);
                              }
                            }}
                            autoFocus
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-gray-400 hover:text-gray-600"
                              onClick={cancelReply}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-pink-500"
                              onClick={() => submitReply(comment.id)}
                              disabled={!replyText.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies &&
                      comment.replies.length > 0 &&
                      showReplies[comment.id] && (
                        <div className="ml-10 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-2">
                              <Avatar className="h-7 w-7">
                                <a
                                  href={`/profile/${reply.author.name.toLowerCase().replace(/ /g, "-")}`}
                                >
                                  <img
                                    src={reply.author.avatar}
                                    alt={reply.author.name}
                                    className="rounded-full"
                                  />
                                </a>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-2xl px-3 py-2">
                                  <a
                                    href={`/profile/${reply.author.name.toLowerCase().replace(/ /g, "-")}`}
                                    className="font-semibold text-xs hover:underline"
                                  >
                                    {reply.author.name}
                                  </a>
                                  <p className="text-sm">{reply.content}</p>
                                </div>
                                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                                  <span>{reply.timestamp}</span>
                                  <button className="font-semibold hover:text-gray-700">
                                    {t("post.like") || "Like"}
                                  </button>
                                  {!replyingTo && (
                                    <button
                                      className="font-semibold hover:text-gray-700"
                                      onClick={() => handleReply(comment.id)}
                                    >
                                      {t("post.reply") || "Reply"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}

              {commentsList.length > visibleComments && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-pink-500 hover:text-pink-600 flex items-center mx-auto"
                  onClick={loadMoreComments}
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {t("post.viewMoreComments") || "View more comments"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PhotoGalleryPost;
