import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import PhotoGalleryPost from "@/components/post/PhotoGalleryPost";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Comment, Reply } from "@/components/post/types";

interface PostDetailProps {}

const PostDetail: React.FC<PostDetailProps> = () => {
  const { postId, username } = useParams<{
    postId?: string;
    username: string;
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Mock post data - in a real app, you would fetch this from an API
  const [post, setPost] = useState({
    id: postId || "1",
    author: {
      name: username || "Kevin",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "Kevin"}`,
      timestamp: "2 hours ago",
    },
    content:
      "Tham quan thế giới thật tuyệt vời! Hôm nay tôi đã khám phá những địa điểm mới và gặp gỡ những người bạn thú vị. Chuyến đi này đã mang lại cho tôi nhiều trải nghiệm đáng nhớ và những kỷ niệm khó quên. Tôi đã học được rất nhiều điều về văn hóa địa phương và thưởng thức những món ăn đặc sản. Không thể chờ đợi để chia sẻ thêm nhiều hình ảnh và câu chuyện với mọi người!",
    engagement: {
      likes: 42,
      comments: 12,
      shares: 5,
    },
    comments: [
      {
        id: "1",
        author: {
          name: "Alex Johnson",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        },
        content: "Trông thật tuyệt vời! Bạn đã đi đâu vậy?",
        timestamp: "1 hour ago",
        likes: 3,
        replies: [],
      },
      {
        id: "2",
        author: {
          name: "Sarah Miller",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        },
        content: "Thật là một ngày đẹp! Tôi cũng đã đi leo núi hôm nay.",
        timestamp: "45 minutes ago",
        likes: 2,
        replies: [],
      },
      {
        id: "3",
        author: {
          name: "David Lee",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        },
        content: "Những bức ảnh thật tuyệt! Bạn đã sử dụng máy ảnh gì vậy?",
        timestamp: "30 minutes ago",
        likes: 1,
        replies: [],
      },
      {
        id: "4",
        author: {
          name: "Emily Wang",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        },
        content:
          "Tôi cũng muốn đến đó! Bạn có thể chia sẻ thêm thông tin về địa điểm này không?",
        timestamp: "15 minutes ago",
        likes: 0,
        replies: [],
      },
    ],
  });

  useEffect(() => {
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
  }, [post]);

  // Handlers for comment interactions in PostDetail
  const handleCommentAdded = (newComment: Comment) => {
    setPost((prevPost) => {
      // Ensure newComment has replies property
      const commentWithReplies = {
        ...newComment,
        replies: newComment.replies || [],
      };
      return {
        ...prevPost,
        comments: [commentWithReplies, ...prevPost.comments],
        engagement: {
          ...prevPost.engagement,
          comments: prevPost.engagement.comments + 1,
        },
      };
    });
  };

  const handleCommentLiked = (commentId: string) => {
    setPost((prevPost) => ({
      ...prevPost,
      comments: prevPost.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment,
      ),
    }));
  };

  const handleReplyAdded = (commentId: string, newReply: Reply) => {
    setPost((prevPost) => ({
      ...prevPost,
      comments: prevPost.comments.map((comment) => {
        if (comment.id === commentId) {
          const replies = comment.replies || [];
          return { ...comment, replies: [...replies, newReply] };
        }
        return comment;
      }),
    }));
  };

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
            {t("post.backToFeed") || "Back to Feed"}
          </Button>
        </div>

        <PhotoGalleryPost
          postId={postId || "default-post"}
          author={post.author}
          content={post.content}
          likes={post.engagement.likes}
          comments={post.engagement.comments}
          shares={post.engagement.shares}
          commentsList={post.comments}
          onCommentAdded={handleCommentAdded}
          onCommentLiked={handleCommentLiked}
          onReplyAdded={handleReplyAdded}
        />

        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("post.relatedPosts") || "Related Posts"}
          </h2>
          {/* Related posts would go here */}
          <div className="text-sm text-gray-500">
            {t("post.noRelatedPosts") || "No related posts to show right now."}
          </div>
        </div>
      </div>
    </ThreeColumnLayout>
  );
};

export default PostDetail;
