import { API_BASE_URL } from "../config";
import { getAccessToken } from "@/utils/cookieUtils";

// Định nghĩa các endpoints
const POST_ENDPOINTS = {
  FEED: "/post/feed",
  CREATE: "/post",
  GET_BY_UUID: "/post/:uuid"
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

// Định nghĩa kiểu dữ liệu cho tham số của hàm createPost
export interface CreatePostParams {
  content: string;
  visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  images?: File[];
}

// Định nghĩa kiểu dữ liệu cho response từ API tạo bài đăng
export interface CreatePostResponse {
  id: number;
  uuid: string;
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

/**
 * Tạo bài đăng mới
 */
export const createPost = async ({
  content,
  visibility,
  images = []
}: CreatePostParams): Promise<CreatePostResponse> => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error("Bạn cần đăng nhập để tạo bài đăng");
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('visibility', visibility);
    
    // Thêm tối đa 8 ảnh
    const maxImages = Math.min(images.length, 8);
    for (let i = 0; i < maxImages; i++) {
      formData.append('images', images[i]);
    }

    const response = await fetch(`${API_BASE_URL}${POST_ENDPOINTS.CREATE}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể tạo bài đăng");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi tạo bài đăng");
  }
};

/**
 * Lấy chi tiết bài đăng theo UUID
 */
export const getPostDetail = async (uuid: string): Promise<PostFeedResponse['posts'][0]> => {
  try {
    const token = getAccessToken();
    // API này không yêu cầu token, nhưng nếu có token thì gửi kèm
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const endpoint = POST_ENDPOINTS.GET_BY_UUID.replace(':uuid', uuid);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy chi tiết bài đăng");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy chi tiết bài đăng");
  }
};
