export interface Comment {
  id: string | number;
  author: {
    name: string;
    username?: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  created_at?: string;
  likes: number;
  parent_comment_id?: string | number | null;
  media_url?: string;
  replies?: Reply[];
  is_deleted?: boolean;
}

export interface Reply extends Comment {
  parent_id?: string | number;
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
