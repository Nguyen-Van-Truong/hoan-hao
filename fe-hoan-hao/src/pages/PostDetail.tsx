import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import PhotoGalleryPost from "@/components/post/PhotoGalleryPost";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Comment, Reply, PostData } from "@/components/post/types";
import { getPostDetail } from "@/api/services/postApi";
import { toast } from "react-hot-toast";

interface PostDetailProps {}

const PostDetail: React.FC<PostDetailProps> = () => {
  const { postId, username } = useParams<{
    postId?: string;
    username?: string;
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tải chi tiết bài đăng
  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!postId) {
        setError("Không tìm thấy bài viết");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const postData = await getPostDetail(postId);
        
        // Chuyển đổi dữ liệu từ API sang định dạng PostData
        const formattedPost: PostData = {
          id: postData.uuid,
          type: postData.media && postData.media.length > 0 ? "gallery" : "regular",
          author: {
            name: postData.author.full_name,
            username: postData.author.username,
            avatar: postData.author.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${postData.author.username}`,
            timestamp: new Date(postData.created_at).toLocaleString(),
          },
          content: postData.content,
          engagement: {
            likes: postData.total_likes,
            comments: postData.total_comments,
            shares: postData.total_shares,
          },
          images: postData.media?.map(media => media.media_url) || [],
          totalImages: postData.media?.length || 0,
          commentsList: [] // Comments sẽ được tải riêng trong tương lai
        };
        
        setPost(formattedPost);
        setError(null);
      } catch (err) {
        console.error("Không thể tải chi tiết bài đăng:", err);
        setError("Không thể tải chi tiết bài đăng");
        toast.error("Không thể tải chi tiết bài đăng");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostDetail();
  }, [postId]);

  // Cập nhật meta tags cho SEO
  useEffect(() => {
    if (post) {
      // Update page title for SEO
      document.title = `${post.author.name} - ${post.content.substring(0, 30)}... | Hoàn Hảo`;

      // Update meta tags for SEO
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `${post.author.name} đã chia sẻ: ${post.content.substring(0, 150)}...`,
        );
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute(
          "content",
          `${post.author.name} - ${post.content.substring(0, 30)}... | Hoàn Hảo`,
        );
      }

      const ogDescription = document.querySelector(
        'meta[property="og:description"]',
      );
      if (ogDescription) {
        ogDescription.setAttribute("content", post.content.substring(0, 200));
      }
    }
  }, [post]);

  // Xử lý tương tác với comments (giữ nguyên từ code cũ)
  const handleCommentAdded = (newComment: Comment) => {
    if (!post) return;
    
    setPost((prevPost) => {
      if (!prevPost) return prevPost;
      
      // Ensure newComment has replies property
      const commentWithReplies = {
        ...newComment,
        replies: newComment.replies || [],
      };
      return {
        ...prevPost,
        commentsList: [commentWithReplies, ...(prevPost.commentsList || [])],
        engagement: {
          ...prevPost.engagement,
          comments: prevPost.engagement.comments + 1,
        },
      };
    });
  };

  const handleCommentLiked = (commentId: string) => {
    if (!post) return;
    
    setPost((prevPost) => {
      if (!prevPost || !prevPost.commentsList) return prevPost;
      
      return {
        ...prevPost,
        commentsList: prevPost.commentsList.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : comment,
        ),
      };
    });
  };

  const handleReplyAdded = (commentId: string, newReply: Reply) => {
    if (!post) return;
    
    setPost((prevPost) => {
      if (!prevPost || !prevPost.commentsList) return prevPost;
      
      return {
        ...prevPost,
        commentsList: prevPost.commentsList.map((comment) => {
          if (comment.id === commentId) {
            const replies = comment.replies || [];
            return { ...comment, replies: [...replies, newReply] };
          }
          return comment;
        }),
      };
    });
  };

  if (loading) {
    return (
      <ThreeColumnLayout>
        <div className="w-full max-w-[950px] mx-auto py-4 px-4 flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500 mb-2" />
            <p className="text-gray-500">Đang tải bài viết...</p>
          </div>
        </div>
      </ThreeColumnLayout>
    );
  }

  if (error || !post) {
    return (
      <ThreeColumnLayout>
        <div className="w-full max-w-[950px] mx-auto py-4 px-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              className="flex items-center text-gray-600 hover:text-pink-500"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("post.backToFeed") || "Quay lại"}
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài viết</h2>
            <p className="text-gray-500 mb-4">{error || "Bài viết không tồn tại hoặc đã bị xóa"}</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </ThreeColumnLayout>
    );
  }

  return (
    <ThreeColumnLayout>
      <div className="w-full max-w-[950px] mx-auto py-4 px-4">
        <div className="mb-4">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-pink-500"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("post.backToFeed") || "Quay lại"}
          </Button>
        </div>

        <PhotoGalleryPost
          postId={post.id}
          author={post.author}
          content={post.content}
          images={post.images}
          totalImages={post.totalImages}
          likes={post.engagement.likes}
          comments={post.engagement.comments}
          shares={post.engagement.shares}
          commentsList={post.commentsList}
          onCommentAdded={handleCommentAdded}
          onCommentLiked={handleCommentLiked}
          onReplyAdded={handleReplyAdded}
        />

        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("post.relatedPosts") || "Bài viết liên quan"}
          </h2>
          {/* Related posts would go here */}
          <div className="text-sm text-gray-500">
            {t("post.noRelatedPosts") || "Không có bài viết liên quan để hiển thị."}
          </div>
        </div>
      </div>
    </ThreeColumnLayout>
  );
};

export default PostDetail;
