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

type Post = PostData;

interface PostFeedProps {
  posts?: Post[];
  showFilters?: boolean;
}

// Initial posts data
const initialPosts = [
  {
    id: "1",
    type: "regular",
    author: {
      name: "Jane Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      timestamp: "2 hours ago",
    },
    content:
      "Just had the most amazing day! The weather was perfect for a picnic in the park. Anyone else enjoying this beautiful day? #SunnyDays #WeekendVibes",
    engagement: {
      likes: 42,
      comments: 12,
      shares: 5,
    },
  },
  {
    id: "2",
    type: "gallery",
    author: {
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      timestamp: "3 hours ago",
    },
    content:
      "Just had an amazing weekend with friends! Here are some highlights from our trip to the mountains. The views were breathtaking and the weather was perfect!",
    engagement: {
      likes: 124,
      comments: 43,
      shares: 12,
    },
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80",
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=500&q=80",
      "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=500&q=80",
      "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=500&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80",
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=500&q=80",
      "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=500&q=80",
      "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=500&q=80",
    ],
    totalImages: 8,
  },
  {
    id: "3",
    type: "regular",
    author: {
      name: "John Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      timestamp: "5 hours ago",
    },
    content:
      "Just finished reading an amazing book! I highly recommend 'The Midnight Library' by Matt Haig. Has anyone else read it? What did you think? #BookRecommendations #Reading",
    engagement: {
      likes: 78,
      comments: 25,
      shares: 8,
    },
  },
  {
    id: "4",
    type: "regular",
    author: {
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      timestamp: "Yesterday",
    },
    content:
      "Just got a promotion at work! So excited for this new chapter in my career. Thanks to everyone who supported me along the way! #CareerMilestone #Grateful",
    engagement: {
      likes: 156,
      comments: 64,
      shares: 12,
    },
  },
  {
    id: "5",
    type: "gallery",
    author: {
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      timestamp: "4 hours ago",
    },
    content: "My new apartment view! What do you think? #NewHome #CityLife",
    engagement: {
      likes: 89,
      comments: 31,
      shares: 7,
    },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80",
    ],
    totalImages: 1,
  },
  {
    id: "6",
    type: "gallery",
    author: {
      name: "Emily Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      timestamp: "6 hours ago",
    },
    content:
      "Cooking class was amazing today! Made these two dishes from scratch. #FoodLover #Cooking",
    engagement: {
      likes: 112,
      comments: 28,
      shares: 9,
    },
    images: [
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
    ],
    totalImages: 2,
  },
];

// Function to generate random posts
const generateRandomPosts = (count: number): Post[] => {
  const randomPosts: Post[] = [];
  const authors = [
    {
      name: "Emma Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    },
    {
      name: "James Brown",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    },
    {
      name: "Sophia Lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia2",
    },
    {
      name: "Noah Garcia",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
    },
    {
      name: "Olivia Martinez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia2",
    },
  ];

  const contents = [
    "Just got back from an amazing vacation! Can't wait to share more photos soon. #Travel #Vacation",
    "Tried a new recipe today and it turned out perfect! Who wants the recipe? #Cooking #FoodLover",
    "Finally finished that book I've been reading for months. Highly recommend it! #Reading #BookClub",
    "Beautiful sunset today! Sometimes you just need to stop and appreciate nature. #Nature #Sunset",
    "Had the best coffee this morning at this new café downtown. Anyone else been there? #Coffee #CaféHopping",
  ];

  const timestamps = [
    "Just now",
    "5 minutes ago",
    "10 minutes ago",
    "30 minutes ago",
    "1 hour ago",
    "2 hours ago",
  ];

  const galleryImages = [
    [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80",
    ],
    [
      "https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=500&q=80",
      "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=500&q=80",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80",
    ],
    ["https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=500&q=80"],
    [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80",
      "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=500&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=500&q=80",
      "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=500&q=80",
    ],
  ];

  for (let i = 0; i < count; i++) {
    const isGallery = Math.random() > 0.5;
    const authorIndex = Math.floor(Math.random() * authors.length);
    const contentIndex = Math.floor(Math.random() * contents.length);
    const timestampIndex = Math.floor(Math.random() * timestamps.length);

    const post: Post = {
      id: `random-${Date.now()}-${i}`,
      type: isGallery ? "gallery" : "regular",
      author: {
        name: authors[authorIndex].name,
        avatar: authors[authorIndex].avatar,
        timestamp: timestamps[timestampIndex],
      },
      content: contents[contentIndex],
      engagement: {
        likes: Math.floor(Math.random() * 200) + 10,
        comments: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 20) + 1,
      },
    };

    if (isGallery) {
      const galleryIndex = Math.floor(Math.random() * galleryImages.length);
      post.images = galleryImages[galleryIndex];
      post.totalImages = post.images.length;
    }

    randomPosts.push(post);
  }

  return randomPosts;
};

type SortOption = "newest" | "popular";

const PostFeed = ({ posts: propPosts, showFilters = true }: PostFeedProps) => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>(propPosts || initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(
    propPosts || initialPosts,
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const loaderRef = useRef<HTMLDivElement>(null);

  // Function to load more posts
  const loadMorePosts = useCallback(() => {
    if (loading) return;

    setLoading(true);

    // Simulate API call with setTimeout
    setTimeout(() => {
      // Generate random posts
      const newPosts = generateRandomPosts(3);

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage((prevPage) => prevPage + 1);
      setLoading(false);
    }, 1500); // Simulate network delay
  }, [loading, page]);

  // Apply filters to posts
  useEffect(() => {
    let sorted = [...posts];

    // Sort by selected option
    if (sortBy === "newest") {
      // For demo purposes, we'll just use the existing order as "newest"
      // In a real app, you would sort by actual timestamps
    } else if (sortBy === "popular") {
      // Sort by engagement (likes + comments + shares)
      sorted = sorted.sort((a, b) => {
        const engagementA =
          a.engagement.likes + a.engagement.comments + a.engagement.shares;
        const engagementB =
          b.engagement.likes + b.engagement.comments + b.engagement.shares;
        return engagementB - engagementA;
      });
    }

    // In a real app, you would filter by the selected time range
    // For this demo, we'll just use the sorted posts
    setFilteredPosts(sorted);
  }, [posts, sortBy]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMorePosts]);

  // Handlers for comment interactions
  const handleCommentAdded = (postId: string, newComment: Comment) => {
    setPosts((prevPosts) => {
      return prevPosts.map((post) => {
        if (post.id === postId) {
          // Initialize commentsList if it doesn't exist
          const commentsList = post.commentsList || [];

          // Update comments count
          return {
            ...post,
            commentsList: [newComment, ...commentsList],
            engagement: {
              ...post.engagement,
              comments: post.engagement.comments + 1,
            },
          };
        }
        return post;
      });
    });
  };

  const handleCommentLiked = (postId: string, commentId: string) => {
    setPosts((prevPosts) => {
      return prevPosts.map((post) => {
        if (post.id === postId && post.commentsList) {
          const updatedComments = post.commentsList.map((comment) => {
            if (comment.id === commentId) {
              return { ...comment, likes: comment.likes + 1 };
            }
            return comment;
          });

          return { ...post, commentsList: updatedComments };
        }
        return post;
      });
    });
  };

  const handleReplyAdded = (
    postId: string,
    commentId: string,
    newReply: Reply,
  ) => {
    setPosts((prevPosts) => {
      return prevPosts.map((post) => {
        if (post.id === postId && post.commentsList) {
          const updatedComments = post.commentsList.map((comment) => {
            if (comment.id === commentId) {
              const replies = comment.replies || [];
              return { ...comment, replies: [...replies, newReply] };
            }
            return comment;
          });

          return { ...post, commentsList: updatedComments };
        }
        return post;
      });
    });
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
  };


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
                  {t("post.newest") || "Newest"}
                </SelectItem>
                <SelectItem value="popularToday">
                  {t("post.popularToday") || "popularToday"}
                </SelectItem>
                <SelectItem value="popularThisWeek">
                  {t("post.popularThisWeek") || "popularThisWeek"}
                </SelectItem>
                <SelectItem value="popularThisMonth">
                  {t("post.popularThisMonth") || "popularThisMonth"}
                </SelectItem>
                <SelectItem value="popularThisYear">
                  {t("post.popularThisYear") || "popularThisYear"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filteredPosts.map((post) => (
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
      ))}

      {/* Loading indicator */}
      <div ref={loaderRef} className="flex justify-center py-4">
        {loading && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <p className="text-sm text-gray-500 mt-2">
              {t("post.loadingMorePosts") || "Loading more posts..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostFeed;
