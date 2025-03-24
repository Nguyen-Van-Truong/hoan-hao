import { API_BASE_URL } from "../config";
import { ApiResponse, User, UpdateUserProfileRequest, UserProfile } from "../types";

const USER_ENDPOINTS = {
  USER_ME: "/users/me",
  USER_BY_ID: "/users",
  USERS_LIST: "/users",
  UPDATE_PROFILE: "/users/me",
  UPLOAD_PROFILE_PICTURE: "/users/me/profile-picture",
  UPLOAD_COVER_PICTURE: "/users/me/cover-picture",
  
  FRIENDS: "/friends",
  FRIEND_SUGGESTIONS: "/friends/suggestions",
  FRIEND_REQUESTS: "/friends/requests",
  FRIEND_STATUS: "/friends/status",
  FRIEND_MUTUAL: "/friends/mutual",
  FRIEND_ACTION: "/friends",
  
  GROUPS: "/groups",
  GROUP_BY_ID: "/groups",
  GROUP_ME: "/groups/me",
  GROUP_MEMBERS: "/groups",
  GROUP_JOIN: "/groups/join",
  GROUP_LEAVE: "/groups",
  GROUP_INVITE: "/groups",
  GROUP_MEMBER_ACTION: "/groups",
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
  return makeApiRequest<UserProfile>(USER_ENDPOINTS.USER_ME);
};

/**
 * Lấy thông tin profile người dùng công khai theo ID
 */
export const getUserProfileById = async (userId: number): Promise<UserProfile> => {
  return makeApiRequest<UserProfile>(`${USER_ENDPOINTS.USER_BY_ID}/${userId}`, "GET", undefined, false);
};

/**
 * Cập nhật thông tin profile
 */
export const updateUserProfile = async (profileData: UpdateUserProfileRequest): Promise<UserProfile> => {
  return makeApiRequest<UserProfile>(USER_ENDPOINTS.UPDATE_PROFILE, "PUT", profileData);
};

/**
 * Tải lên ảnh đại diện
 */
export const uploadProfilePicture = async (fileUrl: string): Promise<UserProfile> => {
  return makeApiRequest<UserProfile>(USER_ENDPOINTS.UPLOAD_PROFILE_PICTURE, "PUT", { file_url: fileUrl });
};

/**
 * Lấy danh sách bạn bè
 */
export const getFriendsList = async (page: number = 1, pageSize: number = 10): Promise<{friends: UserProfile[]}> => {
  return makeApiRequest<{friends: UserProfile[]}>(`${USER_ENDPOINTS.FRIENDS}?page=${page}&page_size=${pageSize}`);
};

/**
 * Lấy danh sách gợi ý bạn bè
 */
export const getFriendSuggestions = async (page: number = 1, pageSize: number = 5): Promise<{suggestions: UserProfile[]}> => {
  return makeApiRequest<{suggestions: UserProfile[]}>(`${USER_ENDPOINTS.FRIEND_SUGGESTIONS}?page=${page}&page_size=${pageSize}`);
};

/**
 * Gửi lời mời kết bạn
 */
export const sendFriendRequest = async (userId: number): Promise<ApiResponse> => {
  return makeApiRequest<ApiResponse>(`${USER_ENDPOINTS.FRIEND_ACTION}/send-request`, "POST", { user_id: userId });
};

/**
 * Hủy kết bạn
 */
export const unfriend = async (userId: number): Promise<ApiResponse> => {
  return makeApiRequest<ApiResponse>(`${USER_ENDPOINTS.FRIEND_ACTION}/unfriend`, "POST", { user_id: userId });
};

/**
 * Chấp nhận lời mời kết bạn
 */
export const acceptFriendRequest = async (userId: number): Promise<ApiResponse> => {
  return makeApiRequest<ApiResponse>(`${USER_ENDPOINTS.FRIEND_ACTION}/accept-request`, "POST", { user_id: userId });
};

/**
 * Từ chối lời mời kết bạn
 */
export const rejectFriendRequest = async (userId: number): Promise<ApiResponse> => {
  return makeApiRequest<ApiResponse>(`${USER_ENDPOINTS.FRIEND_ACTION}/reject-request`, "POST", { user_id: userId });
};

/**
 * Lấy danh sách lời mời kết bạn
 */
export const getFriendRequests = async (page: number = 1, pageSize: number = 10): Promise<{requests: any[]}> => {
  return makeApiRequest<{requests: any[]}>(`${USER_ENDPOINTS.FRIEND_REQUESTS}?page=${page}&page_size=${pageSize}`);
};

/**
 * Kiểm tra trạng thái bạn bè với một người dùng
 */
export const getFriendshipStatus = async (userId: number): Promise<{status: string}> => {
  return makeApiRequest<{status: string}>(`${USER_ENDPOINTS.FRIEND_STATUS}/${userId}`);
}; 