import { API_BASE_URL } from "../config";
import { 
  ApiResponse, 
  Post, 
  CreatePostRequest, 
  UpdatePostRequest, 
  CommentRequest 
} from "../types";

const POST_ENDPOINTS = {
  POSTS: "/posts",
  COMMENTS: "/posts/comments",
  LIKES: "/posts/likes",
  FEED: "/posts/feed",
  SAVED: "/posts/saved",
};

/**
 * Lấy feed bài viết
 */
export const getFeed = async (
  page: number = 1, 
  limit: number = 10
): Promise<ApiResponse<Post[]>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POST_ENDPOINTS.FEED}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy feed bài viết");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy feed bài viết");
  }
};

/**
 * Lấy bài viết của người dùng
 */
export const getUserPosts = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<Post[]>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POST_ENDPOINTS.POSTS}/user/${userId}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy bài viết của người dùng");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy bài viết của người dùng");
  }
};

/**
 * Tạo bài viết mới
 */
export const createPost = async (
  postData: CreatePostRequest
): Promise<ApiResponse<Post>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POST_ENDPOINTS.POSTS}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(postData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể tạo bài viết");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi tạo bài viết");
  }
};

/**
 * Cập nhật bài viết
 */
export const updatePost = async (
  postId: string,
  postData: UpdatePostRequest
): Promise<ApiResponse<Post>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POST_ENDPOINTS.POSTS}/${postId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(postData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể cập nhật bài viết");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi cập nhật bài viết");
  }
};

/**
 * Xóa bài viết
 */
export const deletePost = async (
  postId: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POST_ENDPOINTS.POSTS}/${postId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa bài viết");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi xóa bài viết");
  }
};

/**
 * Thêm bình luận vào bài viết
 */
export const addComment = async (
  postId: string,
  commentData: CommentRequest
): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POST_ENDPOINTS.COMMENTS}/${postId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(commentData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể thêm bình luận");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi thêm bình luận");
  }
};

/**
 * Thích/bỏ thích bài viết
 */
export const toggleLike = async (
  postId: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POST_ENDPOINTS.LIKES}/${postId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể thích/bỏ thích bài viết");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi thích/bỏ thích bài viết");
  }
}; 