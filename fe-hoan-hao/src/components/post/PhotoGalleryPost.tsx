import React, { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import PhotoViewer from "./PhotoViewer";
import { Comment, Reply } from "./types";
import { useNavigate } from "react-router-dom";
import { getPostComments, CommentResponse } from "@/api/services/postApi";
import { toast } from "react-hot-toast";

interface PhotoGalleryPostProps {
  author: {
    name: string;
    username?: string;
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
  commentsList: initialCommentsList = [],
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
  const [visibleComments, setVisibleComments] = useState(5);
  const [commentOffset, setCommentOffset] = useState(0);
  const [liked, setLiked] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [commentsList, setCommentsList] = useState<Comment[]>(initialCommentsList);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  // Number of images to display in the gallery
  const hasImages = images && images.length > 0;
  const displayCount = hasImages ? Math.min(6, images.length) : 0;
  const displayedImages = hasImages ? images.slice(0, displayCount) : [];
  const remainingCount = hasImages ? totalImages - displayCount : 0;

  // Hàm chuyển đổi dữ liệu bình luận từ API
  const convertApiComment = useCallback((apiComment: CommentResponse): Comment => {
    return {
      id: apiComment.id,
      parent_comment_id: apiComment.parent_comment_id,
      author: {
        name: apiComment.author.full_name,
        username: apiComment.author.username,
        avatar: apiComment.author.profile_picture_url || 
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiComment.author.username}`,
      },
      content: apiComment.content,
      timestamp: new Date(apiComment.created_at).toLocaleString(),
      created_at: apiComment.created_at, // Lưu lại created_at gốc để sắp xếp
      likes: apiComment.likes.length,
      is_deleted: apiComment.is_deleted,
      replies: [],
    };
  }, []);
  
  // Hàm tổ chức bình luận theo cấu trúc cha-con
  const organizeComments = useCallback((comments: Comment[]): Comment[] => {
    // Tạo một Map với key là ID của comment để truy cập nhanh
    const commentMap = new Map<string | number, Comment>();
    
    // Danh sách comment cha (không có parent_comment_id)
    const parentComments: Comment[] = [];
    
    // Đầu tiên, xử lý tất cả các comment
    comments.forEach(comment => {
      // Tạo bản sao của comment và đảm bảo có mảng replies
      const commentCopy = { ...comment, replies: [] };
      
      // Thêm vào Map để truy cập nhanh sau này
      commentMap.set(comment.id, commentCopy);
      
      // Nếu là comment cha, thêm vào danh sách riêng
      if (comment.parent_comment_id === null) {
        parentComments.push(commentCopy);
      }
    });
    
    // Sau đó, xử lý các mối quan hệ cha-con
    comments.forEach(comment => {
      if (comment.parent_comment_id !== null) {
        // Tìm comment cha trong Map
        const parentComment = commentMap.get(comment.parent_comment_id);
        if (parentComment && parentComment.replies) {
          // Thêm comment con vào mảng replies của cha
          parentComment.replies.push(comment as Reply);
        } else {
          // Nếu không tìm thấy cha (có thể do dữ liệu không nhất quán),
          // thêm vào danh sách comment cha để không bị mất
          parentComments.push(commentMap.get(comment.id) || comment);
        }
      }
    });
    
    // Sắp xếp các comment cha theo thời gian mới nhất lên trên
    return parentComments.sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp);
      const dateB = new Date(b.created_at || b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  // Tải bình luận khi hiển thị phần bình luận
  const fetchComments = useCallback(async (reset = false) => {
    if (!postId) return;
    
    try {
      setLoadingComments(true);
      const currentOffset = reset ? 0 : commentOffset;
      
      // Nếu đã hiển thị tất cả bình luận và không phải reset, không cần gọi API
      if (!hasMoreComments && !reset) {
        setLoadingComments(false);
        return;
      }
      
      const response = await getPostComments(postId, visibleComments, currentOffset);
      const convertedComments = response.comments.map(convertApiComment);
      
      // Kiểm tra xem còn bình luận để tải không dựa trên tổng số bình luận từ API
      if (currentOffset + response.comments.length >= response.total) {
        setHasMoreComments(false);
      } else {
        setHasMoreComments(true);
      }
      
      // Cập nhật danh sách bình luận
      if (reset) {
        // Nếu reset, thay thế toàn bộ danh sách
        const organizedComments = organizeComments(convertedComments);
        setCommentsList(organizedComments);
        setCommentOffset(response.comments.length);
      } else {
        // Nếu load more, thêm vào danh sách hiện tại
        setCommentsList(prevComments => {
          // Tạo Map các comment hiện tại để tránh trùng lặp
          const existingCommentIds = new Set(prevComments.map(c => c.id.toString()));
          
          // Lọc ra các comment mới chưa có trong danh sách
          const newComments = convertedComments.filter(
            c => !existingCommentIds.has(c.id.toString())
          );
          
          // Tổ chức lại toàn bộ danh sách comment (cả cũ và mới)
          const allComments = [...prevComments, ...newComments];
          return organizeComments(allComments);
        });
        
        setCommentOffset(currentOffset + response.comments.length);
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoadingComments(false);
    }
  }, [postId, commentOffset, visibleComments, hasMoreComments, convertApiComment, organizeComments]);

  // Tải bình luận khi người dùng bấm vào phần bình luận
  useEffect(() => {
    if (showComments && commentsList.length === 0) {
      fetchComments(true);
    }
  }, [showComments, commentsList.length, fetchComments]);

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

  const handleReply = (commentId: string | number) => {
    setReplyingTo(commentId);
    setReplyText("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  const submitReply = (commentId: string | number) => {
    if (replyText.trim()) {
      // In a real app, you would send this to a server
      // For now, we'll simulate adding a reply locally
      const updatedComments = [...commentsList];
      const commentIndex = updatedComments.findIndex((c) => c.id === commentId);

      if (commentIndex !== -1) {
        // Create a new reply
        const newReply: Reply = {
          id: `${commentId}-${Date.now()}`,
          parent_id: commentId,
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
        
        // Update the comments list
        setCommentsList(updatedComments);

        // Call the callback if provided
        if (onReplyAdded) {
          onReplyAdded(commentId.toString(), newReply);
        }
      }

      setReplyText("");
      setReplyingTo(null);
      // Auto-show replies for this comment
      toggleReplies(commentId.toString(), true);
    }
  };

  const toggleReplies = (commentId: string, forceShow?: boolean) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: forceShow !== undefined ? forceShow : !prev[commentId],
    }));
  };

  const loadMoreComments = () => {
    fetchComments();
  };

  const toggleLike = () => {
    setLiked(!liked);
  };

  // Hàm xử lý khi bấm vào avatar để chuyển đến trang profile
  const handleAvatarClick = () => {
    const profileUrl = `/profile/${author.username || author.name.toLowerCase().replace(/ /g, "-")}`;
    navigate(profileUrl);
  };

  // Hàm xử lý khi bấm vào nút chia sẻ để copy link
  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${author.username || author.name.toLowerCase().replace(/ /g, "-")}/${postId}`;
    
    // Copy URL vào clipboard
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        toast.success(t("post.linkCopied") || "Đã sao chép liên kết vào bộ nhớ tạm");
      })
      .catch((error) => {
        console.error("Không thể sao chép:", error);
        toast.error(t("post.copyFailed") || "Không thể sao chép liên kết");
      });
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
                href={`/profile/${author.username || author.name.toLowerCase().replace(/ /g, "-")}`}
                className="hover:underline"
              >
                <h3 className="font-semibold text-sm">{author.name}</h3>
              </a>
              <div 
                className="text-xs text-gray-500 cursor-pointer hover:underline"
                onClick={() => navigate(`/post/${author.username || author.name.toLowerCase().replace(/ /g, "-")}/${postId}`)}
              >
                {author.timestamp}
              </div>
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
              <DropdownMenuItem onClick={() => navigate(`/post/${author.username || author.name.toLowerCase().replace(/ /g, "-")}/${postId}`)}>
                {t("post.viewPostDetails") || "View Post Details"}
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
            onClick={handleShare}
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

            {/* Hiển thị trạng thái loading nếu đang tải bình luận */}
            {loadingComments && commentsList.length === 0 && (
              <div className="flex justify-center py-4">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                  <p className="text-sm text-gray-500 mt-2">
                    {t("post.loadingComments") || "Đang tải bình luận..."}
                  </p>
                </div>
              </div>
            )}

            {/* Hiển thị thông báo nếu không có bình luận */}
            {!loadingComments && commentsList.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  {t("post.noComments") || "Chưa có bình luận nào"}
                </p>
              </div>
            )}

            {/* Danh sách bình luận */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {commentsList.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  {/* Main Comment */}
                  {!comment.is_deleted && (
                    <div className="flex space-x-2">
                      <Avatar className="h-8 w-8">
                        <a
                          href={`/profile/${comment.author.username || comment.author.name.toLowerCase().replace(/ /g, "-")}`}
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
                            href={`/profile/${comment.author.username || comment.author.name.toLowerCase().replace(/ /g, "-")}`}
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
                                setCommentsList(updatedComments);
                                if (onCommentLiked) {
                                  onCommentLiked(comment.id.toString());
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
                              onClick={() => toggleReplies(comment.id.toString())}
                            >
                              {showReplies[comment.id]
                                ? t("post.hideReplies") || "Hide replies"
                                : `${t("post.viewReplies") || "View"} ${comment.replies.length} ${comment.replies.length === 1 ? t("post.reply") || "reply" : t("post.replies") || "replies"}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thông báo bình luận đã bị xóa */}
                  {comment.is_deleted && (
                    <div className="text-center text-gray-500 text-sm italic py-1">
                      {t("post.commentDeleted") || "Bình luận này đã bị xóa"}
                    </div>
                  )}

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
                                href={`/profile/${reply.author.username || reply.author.name.toLowerCase().replace(/ /g, "-")}`}
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
                                  href={`/profile/${reply.author.username || reply.author.name.toLowerCase().replace(/ /g, "-")}`}
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

              {/* Nút tải thêm bình luận */}
              {hasMoreComments && !loadingComments && commentsList.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-pink-500 hover:text-pink-600 flex items-center mx-auto"
                  onClick={loadMoreComments}
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {t("post.loadMoreComments") || "Tải thêm bình luận"}
                </Button>
              )}
              
              {/* Hiển thị trạng thái đang tải thêm bình luận */}
              {loadingComments && commentsList.length > 0 && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PhotoGalleryPost;
