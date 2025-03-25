import { API_BASE_URL } from "../config";
import { ApiResponse, User, UpdateUserProfileRequest, UserProfile } from "../types";
import axios from "axios";
import { getAccessToken } from "@/utils/cookieUtils";

const USER_ENDPOINTS = {
  PROFILE: "/users/profile",
  PROFILE_ME: "/users/me",
  PROFILE_PUBLIC: "/users",
  UPDATE_PROFILE: "/users/profile",
  FRIENDS: "/friends",
  FRIEND_SUGGESTIONS: "/friends/suggestions",
  FRIEND_REQUESTS: "/friends/requests",
  FRIEND_ACTION: "/friends",
  FRIEND_STATUS: "/friends/status",
  FRIEND_USER: "/friends/user",
  FRIEND_MUTUAL: "/friends/mutual",
};

// Chuẩn hóa hàm api với các header thích hợp
const makeApiRequest = async <T>(
  url: string, 
  method: string = "GET", 
  body?: any,
  requiresAuth: boolean = true
): Promise<T> => {
  try {
    const token = getAccessToken();
    
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
export const getPublicUserProfile = async (username: string): Promise<{user: UserProfile, friendship_status: string}> => {
  return makeApiRequest<{user: UserProfile, friendship_status: string}>(`${USER_ENDPOINTS.PROFILE_PUBLIC}/${username}`);
};

/**
 * Lấy danh sách bạn bè
 */
export const getFriendsList = async (page: number = 1, limit: number = 10): Promise<{friends: UserProfile[]}> => {
  return makeApiRequest<{friends: UserProfile[]}>(`${USER_ENDPOINTS.FRIENDS}?page=${page}&limit=${limit}`);
};

/**
 * Kiểm tra trạng thái bạn bè với một người dùng
 */
export const getFriendshipStatus = async (userId: number): Promise<{status: string}> => {
  return makeApiRequest<{status: string}>(`${USER_ENDPOINTS.FRIEND_STATUS}/${userId}`);
};

/**
 * Cập nhật thông tin profile người dùng
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<{message: string}> => {
  return makeApiRequest<{message: string}>(USER_ENDPOINTS.PROFILE_ME, "PUT", profileData);
};

/**
 * Cập nhật ảnh đại diện
 */
export const updateProfilePicture = async (imageFile: File): Promise<{message: string, url: string}> => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/users/me/profile-picture`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể cập nhật ảnh đại diện");
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi cập nhật ảnh đại diện");
  }
};

/**
 * Cập nhật ảnh bìa
 */
export const updateCoverPicture = async (imageFile: File): Promise<{message: string, url: string}> => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/users/me/cover-picture`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể cập nhật ảnh bìa");
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi cập nhật ảnh bìa");
  }
};

// API liên quan đến bạn bè
export const getFriends = async (status: string = 'accepted', page: number = 1, pageSize: number = 10) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    const response = await axios.get(`${API_BASE_URL}/friends`, {
      params: {
        status,
        page,
        page_size: pageSize
      },
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFriendRequests = async (type: 'incoming' | 'outgoing', page: number = 1, pageSize: number = 10) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    const response = await axios.get(`${API_BASE_URL}/friends/requests`, {
      params: {
        type,
        page,
        page_size: pageSize
      },
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFriendSuggestions = async (limit: number = 10) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    const response = await axios.get(`${API_BASE_URL}/friends/suggestions`, {
      params: { limit },
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API hành động bạn bè theo thiết kế mới
export const friendshipAction = async (action: string, friendUsername: string): Promise<{message: string}> => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    const response = await axios.post(`${API_BASE_URL}/friends/${action}`, {
      friend_username: friendUsername
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm gửi lời mời kết bạn
export const sendFriendRequest = async (username: string): Promise<{message: string}> => {
  return friendshipAction('send-request', username);
};

// Hàm chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (username: string): Promise<{message: string}> => {
  return friendshipAction('accept', username);
};

// Hàm từ chối lời mời kết bạn
export const rejectFriendRequest = async (username: string): Promise<{message: string}> => {
  return friendshipAction('reject', username);
};

// Hàm hủy lời mời kết bạn đã gửi
export const cancelFriendRequest = async (username: string): Promise<{message: string}> => {
  return friendshipAction('cancel', username);
};

// Hàm hủy kết bạn
export const unfriend = async (username: string): Promise<{message: string}> => {
  return friendshipAction('unfriend', username);
};

// Hàm chặn người dùng
export const blockUser = async (username: string): Promise<{message: string}> => {
  return friendshipAction('block', username);
};

// Hàm bỏ chặn người dùng
export const unblockUser = async (username: string): Promise<{message: string}> => {
  return friendshipAction('unblock', username);
};