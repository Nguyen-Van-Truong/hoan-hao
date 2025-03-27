export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

export interface PostData {
  id: string;
  type: "regular" | "gallery" | string;
  author: {
    name: string;
    username?: string;
    avatar: string;
    timestamp: string;
  };
  content: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  images?: string[];
  totalImages?: number;
  commentsList?: Comment[];
}
