import { API_BASE_URL } from "../config";
import { ApiResponse, User, UpdateUserProfileRequest, UserProfile } from "../types";

const USER_ENDPOINTS = {
  PROFILE: "/users/profile",
  PROFILE_ME: "/users/me",
  PROFILE_PUBLIC: "/users/profile/public/username",
  UPDATE_PROFILE: "/users/profile",
  FRIENDS: "/users/friends",
  FRIEND_SUGGESTIONS: "/users/friends/suggestions",
  FRIEND_REQUESTS: "/users/friends/requests",
  FRIEND_ACTION: "/users/friends/actions",
  FRIEND_STATUS: "/users/friends/status",
};

// Chuẩn hóa hàm api với các header thích hợp
const makeApiRequest = async <T>(
  url: string, 
  method: string = "GET", 
  body?: any,
  requiresAuth: boolean = true
): Promise<T> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (requiresAuth && !token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const headers: HeadersInit = {};
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    if (requiresAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: "include"
    };
    
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Không thể thực hiện yêu cầu ${method} tới ${url}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(`Đã xảy ra lỗi khi thực hiện yêu cầu ${method} tới ${url}`);
  }
};

/**
 * Lấy thông tin profile của người dùng đăng nhập hiện tại
 */
export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  return makeApiRequest<UserProfile>(USER_ENDPOINTS.PROFILE_ME);
};

/**
 * Lấy thông tin profile người dùng công khai theo username
 */
export const getPublicUserProfile = async (username: string): Promise<{profile: UserProfile, friend_status: string}> => {
  return makeApiRequest<{profile: UserProfile, friend_status: string}>(`${USER_ENDPOINTS.PROFILE_PUBLIC}/${username}`);
};

/**
 * Lấy danh sách bạn bè
 */
export const getFriendsList = async (page: number = 1, limit: number = 10): Promise<{friends: UserProfile[]}> => {
  return makeApiRequest<{friends: UserProfile[]}>(`${USER_ENDPOINTS.FRIENDS}?page=${page}&limit=${limit}`);
};

/**
 * Lấy danh sách gợi ý bạn bè
 */
export const getFriendSuggestions = async (limit: number = 5): Promise<UserProfile[]> => {
  return makeApiRequest<UserProfile[]>(`${USER_ENDPOINTS.FRIEND_SUGGESTIONS}?limit=${limit}`);
};

/**
 * Gửi lời mời kết bạn
 */
export const sendFriendRequest = async (friendID: number): Promise<ApiResponse> => {
  return makeApiRequest<ApiResponse>(USER_ENDPOINTS.FRIEND_REQUESTS, "POST", { friendID });
};

/**
 * Hủy lời mời kết bạn
 */
export const cancelFriendRequest = async (friendId: number): Promise<ApiResponse> => {
  return makeApiRequest<ApiResponse>(USER_ENDPOINTS.FRIEND_ACTION, "POST", { action: "cancel", friendId });
};

/**
 * Chấp nhận lời mời kết bạn
 */
export const acceptFriendRequest = async (requestId: number): Promise<ApiResponse> => {
  return makeApiRequest<ApiResponse>(USER_ENDPOINTS.FRIEND_ACTION, "POST", { action: "accept", requestId });
};

/**
 * Từ chối lời mời kết bạn
 */
export const rejectFriendRequest = async (requestId: number): Promise<ApiResponse> => {
  return makeApiRequest<ApiResponse>(USER_ENDPOINTS.FRIEND_ACTION, "POST", { action: "reject", requestId });
};

/**
 * Lấy danh sách lời mời kết bạn
 */
export const getFriendRequests = async (page: number = 1, limit: number = 10): Promise<{requests: any[]}> => {
  return makeApiRequest<{requests: any[]}>(`${USER_ENDPOINTS.FRIEND_REQUESTS}?page=${page}&limit=${limit}`);
};

/**
 * Kiểm tra trạng thái bạn bè với một người dùng
 */
export const getFriendshipStatus = async (userId: number): Promise<{status: string}> => {
  return makeApiRequest<{status: string}>(`${USER_ENDPOINTS.FRIEND_STATUS}/${userId}`);
}; 