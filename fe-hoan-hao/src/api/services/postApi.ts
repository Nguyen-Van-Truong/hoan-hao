import { API_BASE_URL } from "../config";
import { getAccessToken } from "@/utils/cookieUtils";

// Định nghĩa các endpoints
const POST_ENDPOINTS = {
  FEED: "/post/feed",
};

// Định nghĩa kiểu dữ liệu cho response từ API
export interface PostFeedResponse {
  limit: number;
  offset: number;
  posts: Array<{
    id: number;
    uuid: string;
    user_id: number;
    author: {
      id: number;
      username: string;
      full_name: string;
      profile_picture_url: string;
    };
    content: string;
    visibility: string;
    created_at: string;
    updated_at: string;
    media: Array<{
      id: number;
      post_id: number;
      media_type: string;
      media_url: string;
      thumbnail_url?: string;
    }>;
    total_likes: number;
    total_comments: number;
    total_shares: number;
  }>;
}

// Định nghĩa kiểu dữ liệu cho tham số của hàm getFeed
export interface GetFeedParams {
  mode?: 'newest' | 'popular_today' | 'popular_week' | 'popular_month' | 'popular_year';
  limit?: number;
  offset?: number;
}

/**
 * Lấy danh sách bài đăng cho feed
 */
export const getFeed = async ({
  mode = 'newest',
  limit = 10,
  offset = 0,
}: GetFeedParams = {}): Promise<PostFeedResponse> => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error("Bạn cần đăng nhập để xem feed");
    }

    const url = new URL(`${API_BASE_URL}${POST_ENDPOINTS.FEED}`);
    url.searchParams.append('mode', mode);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy dữ liệu feed");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy dữ liệu feed");
  }
};
