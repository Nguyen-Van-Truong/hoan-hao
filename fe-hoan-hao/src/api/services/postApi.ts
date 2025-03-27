import { API_BASE_URL } from "../config";
import { getAccessToken } from "@/utils/cookieUtils";

// Định nghĩa các endpoints
const POST_ENDPOINTS = {
  FEED: "/post/feed",
  CREATE: "/post",
  GET_BY_UUID: "/post/:uuid",
  GET_USER_POSTS: "/post/user/username/:username/posts",
  GET_POST_COMMENTS: (postId: string) => `${API_BASE_URL}/post/${postId}/comments`,
  CREATE_COMMENT: (postId: string) => `${API_BASE_URL}/post/${postId}/comment`
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
 * Định nghĩa kiểu dữ liệu cho response của API lấy bình luận
 */
export interface CommentResponse {
  id: string | number;
  content: string;
  created_at: string;
  updated_at: string;
  parent_comment_id: string | number | null;
  media_url?: string; // URL hình ảnh đính kèm với comment
  author: {
    id: string | number;
    username: string;
    full_name: string;
    profile_picture_url: string | null;
  };
  likes: Array<{ id: number; user_id: number }>;
  is_deleted: boolean;
}

export interface CommentsListResponse {
  comments: CommentResponse[];
  total: number;
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

/**
 * Lấy danh sách bài đăng của một người dùng theo username
 */
export const getUserPosts = async (username: string, limit = 5, offset = 0): Promise<PostFeedResponse> => {
  try {
    const token = getAccessToken();
    // API này không bắt buộc phải có token, nhưng nếu có token thì gửi kèm
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const endpoint = POST_ENDPOINTS.GET_USER_POSTS.replace(':username', username);
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy danh sách bài đăng của người dùng");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy danh sách bài đăng của người dùng");
  }
};

/**
 * Lấy danh sách bình luận của bài viết
 * @param postId - ID của bài viết
 * @param limit - Số lượng bình luận tối đa trả về
 * @param offset - Vị trí bắt đầu
 * @returns Promise chứa dữ liệu bình luận
 */
export const getPostComments = async (
  postId: string,
  limit: number = 10,
  offset: number = 0
): Promise<CommentsListResponse> => {
  try {
    const token = getAccessToken();
    // Tạo URL với các tham số query
    const url = new URL(POST_ENDPOINTS.GET_POST_COMMENTS(postId));
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());

    // Gọi API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Thêm token nếu có
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
    });

    // Kiểm tra response status
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy bình luận');
    }

    // Trả về dữ liệu
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy bình luận:', error);
    throw error;
  }
};

/**
 * Tạo bình luận mới cho bài viết
 * @param postId - ID của bài viết
 * @param content - Nội dung bình luận
 * @param parentCommentId - ID của bình luận cha (nếu là reply)
 * @param image - File hình ảnh đính kèm (nếu có)
 * @returns Promise chứa dữ liệu bình luận mới tạo
 */
export const createComment = async (
  postId: string,
  content: string,
  parentCommentId?: string | number | null,
  image?: File
): Promise<CommentResponse> => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error("Bạn cần đăng nhập để bình luận");
    }
    
    // Tạo FormData để gửi cả nội dung và hình ảnh
    const formData = new FormData();
    formData.append('content', content);
    
    // Nếu có parentCommentId (reply), thêm vào formData
    if (parentCommentId) {
      formData.append('parent_comment_id', parentCommentId.toString());
    }
    
    // Nếu có hình ảnh, thêm vào formData
    if (image) {
      formData.append('image', image);
    }
    
    // Gọi API
    const response = await fetch(POST_ENDPOINTS.CREATE_COMMENT(postId), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    // Kiểm tra response status
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo bình luận');
    }
    
    // Trả về dữ liệu comment mới
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi tạo bình luận:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Đã xảy ra lỗi khi tạo bình luận');
  }
};
