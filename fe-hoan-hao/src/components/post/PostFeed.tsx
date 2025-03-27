import React, { useState, useEffect, useRef, useCallback } from "react";
import PhotoGalleryPost from "./PhotoGalleryPost";
import { Loader2, TrendingUp, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Comment, Reply } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PostData } from "./types";
import { getFeed, PostFeedResponse, GetFeedParams } from "@/api/services/postApi";
import { toast } from "react-hot-toast";
import PostCreator from "./PostCreator";

type Post = PostData;

interface PostFeedProps {
  posts?: Post[];
  showFilters?: boolean;
}

// Hàm chuyển đổi dữ liệu API thành định dạng Post hiện tại
const convertApiPostToPost = (apiPost: PostFeedResponse['posts'][0]): Post => {
  const hasMedia = apiPost.media && apiPost.media.length > 0;
  
  return {
    id: apiPost.uuid,
    type: hasMedia ? "gallery" : "regular",
    author: {
      name: apiPost.author.full_name,
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

type FeedMode = 'newest' | 'popular_today' | 'popular_week' | 'popular_month' | 'popular_year';

const PostFeed = ({ posts: propPosts, showFilters = true }: PostFeedProps) => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true); // Bắt đầu với loading = true
  const [sortBy, setSortBy] = useState<FeedMode>("newest");
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // State để lưu trữ thông tin phân trang API
  const [apiOffset, setApiOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5; // Giống limit trong API

  // Hàm tạo độ trễ
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Hàm lấy bài đăng từ API
  const fetchPosts = useCallback(async (reset = false) => {
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
      
      const params: GetFeedParams = {
        mode: sortBy,
        limit: ITEMS_PER_PAGE,
        offset: currentOffset
      };
      
      // Thêm độ trễ 1 giây trước khi gọi API
      await delay(1000);
      
      const response = await getFeed(params);
      
      const convertedPosts = response.posts.map(convertApiPostToPost);
      
      // Nếu không còn bài đăng nào nữa, đánh dấu là không còn trang nào
      if (convertedPosts.length === 0 || convertedPosts.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      // Nếu đang reset hoặc đang tải trang đầu tiên
      if (reset || currentOffset === 0) {
        setPosts(convertedPosts);
        setFilteredPosts(convertedPosts);
      } else {
        // Nếu đang tải thêm bài đăng
        setPosts(prev => [...prev, ...convertedPosts]);
        setFilteredPosts(prev => [...prev, ...convertedPosts]);
      }
      
      // Cập nhật offset mới chỉ khi có bài đăng mới
      if (convertedPosts.length > 0) {
        setApiOffset(currentOffset + convertedPosts.length);
      }
    } catch (error) {
      console.error("Không thể lấy bài đăng:", error);
      toast.error("Không thể tải bài đăng");
      
      // Nếu reset, thiết lập danh sách rỗng để không hiển thị dữ liệu mẫu
      if (reset) {
        setPosts([]);
        setFilteredPosts([]);
      }
      
      // Đặt hasMore thành false khi xảy ra lỗi để tránh gọi API liên tục
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [sortBy, apiOffset, hasMore]);

  // Lấy bài đăng khi component được tải lần đầu
  useEffect(() => {
    // Nếu không có bài đăng từ props, lấy từ API
    if (!propPosts) {
      fetchPosts(true);
    } else {
      setPosts(propPosts);
      setFilteredPosts(propPosts);
      setLoading(false);
    }
  }, []);

  // Thay đổi khi sortBy thay đổi
  useEffect(() => {
    if (!propPosts) {
      fetchPosts(true);
    }
  }, [sortBy]);

  // Xử lý intersection observer để tải thêm bài đăng khi cuộn
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          // Nếu không có bài đăng từ props, lấy thêm bài đăng từ API
          if (!propPosts) {
            fetchPosts();
          }
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, propPosts, hasMore, fetchPosts]);

  // Giữ nguyên phần xử lý comments cho tích hợp sau
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

    // Cập nhật danh sách bài đăng đã lọc với bình luận mới
    setFilteredPosts((prevPosts) =>
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

    // Cũng cập nhật cho filtered posts
    setFilteredPosts((prevPosts) =>
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
    newReply: Reply,
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
                    ? [...comment.replies, newReply]
                    : [newReply],
                };
              }
              return comment;
            }),
          };
        }
        return post;
      }),
    );

    // Cũng cập nhật cho filtered posts
    setFilteredPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId && post.commentsList) {
          return {
            ...post,
            commentsList: post.commentsList.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: comment.replies
                    ? [...comment.replies, newReply]
                    : [newReply],
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

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (value: FeedMode) => {
    setSortBy(value);
  };

  // Hàm refresh feed khi có bài đăng mới
  useCallback(() => {
    // Chỉ refresh nếu không có posts từ props
    if (!propPosts) {
      fetchPosts(true);
    }
  }, [propPosts, fetchPosts]);
  return (
    <div className="w-full space-y-4 bg-gray-50 p-4">

      {showFilters && (
        <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm mb-4">
          <h2 className="text-lg font-medium text-gray-700">
            {t("post.feed") || "Feed"}
          </h2>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px] h-9 bg-white border-gray-200">
                <div className="flex items-center gap-2">
                  {sortBy === "newest" ? (
                    <Clock className="h-4 w-4 text-gray-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                  )}
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  {t("post.newest") || "Mới nhất"}
                </SelectItem>
                <SelectItem value="popular_today">
                  {t("post.popularToday") || "Phổ biến hôm nay"}
                </SelectItem>
                <SelectItem value="popular_week">
                  {t("post.popularThisWeek") || "Phổ biến tuần này"}
                </SelectItem>
                <SelectItem value="popular_month">
                  {t("post.popularThisMonth") || "Phổ biến tháng này"}
                </SelectItem>
                <SelectItem value="popular_year">
                  {t("post.popularThisYear") || "Phổ biến năm nay"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filteredPosts.length === 0 && !loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t("post.noPosts") || "Không có bài đăng nào"}</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
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
        
        {!loading && filteredPosts.length > 0 && !hasMore && (
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

export default PostFeed;
