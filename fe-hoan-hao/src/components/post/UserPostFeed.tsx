import React, { useState, useEffect, useRef, useCallback } from "react";
import PhotoGalleryPost from "./PhotoGalleryPost";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Comment, Reply } from "./types";
import { PostData } from "./types";
import { getUserPosts, PostFeedResponse } from "@/api/services/postApi";
import { toast } from "react-hot-toast";

type Post = PostData;

interface UserPostFeedProps {
  username: string;
}

// Hàm chuyển đổi dữ liệu API thành định dạng Post hiện tại
const convertApiPostToPost = (apiPost: PostFeedResponse['posts'][0]): Post => {
  const hasMedia = apiPost.media && apiPost.media.length > 0;
  
  return {
    id: apiPost.uuid,
    type: hasMedia ? "gallery" : "regular",
    author: {
      name: apiPost.author.full_name,
      username: apiPost.author.username,
      avatar: apiPost.author.profile_picture_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
      timestamp: new Date(apiPost.created_at).toLocaleString(),
    },
    content: apiPost.content,
    engagement: {
      likes: apiPost.total_likes,
      comments: apiPost.total_comments,
      shares: apiPost.total_shares,
    },
    ...(hasMedia && {
      images: apiPost.media.map(m => m.media_url),
      totalImages: apiPost.media.length
    })
  };
};

const UserPostFeed = ({ username }: UserPostFeedProps) => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // State để lưu trữ thông tin phân trang API
  const [apiOffset, setApiOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;

  // Hàm tạo độ trễ
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Hàm lấy bài đăng từ API
  const fetchUserPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      // Nếu đã đánh dấu không còn bài đăng và không phải đang reset, dừng lại
      if (!hasMore && !reset) {
        setLoading(false);
        return;
      }
      
      // Nếu reset, đặt lại offset về 0
      if (reset) {
        setApiOffset(0);
        setHasMore(true); // Reset lại hasMore khi tải lại từ đầu
      }
      
      const currentOffset = reset ? 0 : apiOffset;
      
      // Thêm độ trễ 1 giây trước khi gọi API
      await delay(1000);
      
      // Gọi API để lấy danh sách bài đăng của user
      const response = await getUserPosts(username, ITEMS_PER_PAGE, currentOffset);
      
      const convertedPosts = response.posts.map(convertApiPostToPost);
      
      // Nếu không còn bài đăng nào nữa, đánh dấu là không còn trang nào
      if (convertedPosts.length === 0 || convertedPosts.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      // Cập nhật state
      if (reset || currentOffset === 0) {
        setPosts(convertedPosts);
      } else {
        // Nếu đang tải thêm bài đăng
        setPosts(prev => [...prev, ...convertedPosts]);
      }
      
      // Cập nhật offset mới chỉ khi có bài đăng mới
      if (convertedPosts.length > 0) {
        setApiOffset(currentOffset + convertedPosts.length);
      }
    } catch (error) {
      // console.error("Không thể lấy bài đăng của người dùng:", error);
      // toast.error("Không thể tải bài đăng");
      
      // Nếu reset, thiết lập danh sách rỗng
      if (reset) {
        setPosts([]);
      }
      
      // Đặt hasMore thành false khi xảy ra lỗi để tránh gọi API liên tục
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [username, apiOffset, hasMore]);

  // Lấy bài đăng khi component được tải lần đầu hoặc khi username thay đổi
  useEffect(() => {
    fetchUserPosts(true);
  }, [username]);

  // Xử lý intersection observer để tải thêm bài đăng khi cuộn
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchUserPosts();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loading, hasMore, fetchUserPosts]);

  // Xử lý comments
  const handleCommentAdded = (postId: string, newComment: Comment) => {
    // Cập nhật danh sách bài đăng với bình luận mới
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              comments: post.engagement.comments + 1,
            },
            commentsList: post.commentsList
              ? [...post.commentsList, newComment]
              : [newComment],
          };
        }
        return post;
      }),
    );
  };

  const handleCommentLiked = (postId: string, commentId: string) => {
    // Cập nhật danh sách bài đăng với lượt thích mới trên bình luận
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId && post.commentsList) {
          return {
            ...post,
            commentsList: post.commentsList.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  likes: comment.likes + 1,
                };
              }
              return comment;
            }),
          };
        }
        return post;
      }),
    );
  };

  const handleReplyAdded = (
    postId: string,
    commentId: string,
    reply: Reply
  ) => {
    // Cập nhật danh sách bài đăng với phản hồi mới
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId && post.commentsList) {
          return {
            ...post,
            commentsList: post.commentsList.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: comment.replies
                    ? [...comment.replies, reply]
                    : [reply],
                };
              }
              return comment;
            }),
          };
        }
        return post;
      }),
    );
  };

  return (
    <div className="space-y-4">
      {posts.length === 0 && !loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t("post.noPosts") || "Không có bài đăng nào"}</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <PhotoGalleryPost
              postId={post.id}
              author={post.author}
              content={post.content}
              images={post.type === "gallery" ? post.images : undefined}
              totalImages={post.type === "gallery" ? post.totalImages : 0}
              likes={post.engagement.likes}
              comments={post.engagement.comments}
              shares={post.engagement.shares}
              commentsList={post.commentsList}
              onCommentAdded={(newComment) =>
                handleCommentAdded(post.id, newComment)
              }
              onCommentLiked={(commentId) =>
                handleCommentLiked(post.id, commentId)
              }
              onReplyAdded={(commentId, reply) =>
                handleReplyAdded(post.id, commentId, reply)
              }
            />
          </div>
        ))
      )}

      {/* Loading indicator */}
      <div ref={loaderRef} className="flex justify-center py-4">
        {loading && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <p className="text-sm text-gray-500 mt-2">
              {t("post.loadingMorePosts") || "Đang tải bài đăng..."}
            </p>
          </div>
        )}
        
        {!loading && posts.length > 0 && !hasMore && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t("post.noMorePosts") || "Đã hiển thị tất cả bài đăng"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPostFeed; 