import { API_BASE_URL } from "../config";
import { ApiResponse, User, UpdateUserProfileRequest, UserProfile } from "../types";

const USER_ENDPOINTS = {
  PROFILE: "/users/profile",
  PROFILE_ME: "/user/profile/me",
  PROFILE_PUBLIC: "/user/profile/public/username",
  UPDATE_PROFILE: "/users/profile",
  FRIENDS: "/user/friends",
  FRIEND_SUGGESTIONS: "/user/friends/suggestions",
  FRIEND_REQUESTS: "/user/friends/requests",
  FRIEND_REQUEST: "/user/friend/request",
  FRIEND_CANCEL: "/user/friend/cancel",
  FRIEND_ACCEPT: "/user/friend/accept",
  FRIEND_REJECT: "/user/friend/reject",
};

/**
 * Lấy thông tin profile người dùng
 */
export const getUserProfile = async (
  userId?: string
): Promise<ApiResponse<User>> => {
  try {
    const endpoint = userId 
      ? `${USER_ENDPOINTS.PROFILE}/${userId}` 
      : USER_ENDPOINTS.PROFILE;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy thông tin người dùng");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy thông tin người dùng");
  }
};

/**
 * Cập nhật thông tin profile người dùng
 */
export const updateUserProfile = async (
  profileData: UpdateUserProfileRequest
): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${USER_ENDPOINTS.UPDATE_PROFILE}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(profileData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể cập nhật thông tin người dùng");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi cập nhật thông tin người dùng");
  }
};

/**
 * Lấy thông tin profile của người dùng đăng nhập hiện tại
 */
export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.PROFILE_ME}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy thông tin người dùng");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy thông tin người dùng");
  }
};

/**
 * Lấy thông tin profile người dùng công khai theo username
 */
export const getPublicUserProfile = async (username: string): Promise<{profile: UserProfile, friend_status: string}> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.PROFILE_PUBLIC}/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy thông tin người dùng");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy thông tin người dùng");
  }
};

/**
 * Lấy danh sách bạn bè
 */
export const getFriendsList = async (page: number = 1, limit: number = 10): Promise<{friends: UserProfile[]}> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.FRIENDS}?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy danh sách bạn bè");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy danh sách bạn bè");
  }
};

/**
 * Lấy danh sách gợi ý bạn bè
 */
export const getFriendSuggestions = async (limit: number = 5): Promise<UserProfile[]> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.FRIEND_SUGGESTIONS}?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy danh sách gợi ý bạn bè");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy danh sách gợi ý bạn bè");
  }
};

/**
 * Gửi lời mời kết bạn
 */
export const sendFriendRequest = async (friendID: number): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.FRIEND_REQUEST}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ friendID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể gửi lời mời kết bạn");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi gửi lời mời kết bạn");
  }
};

/**
 * Hủy lời mời kết bạn
 */
export const cancelFriendRequest = async (friendId: number): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.FRIEND_CANCEL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ friendId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể hủy lời mời kết bạn");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi hủy lời mời kết bạn");
  }
};

/**
 * Chấp nhận lời mời kết bạn
 */
export const acceptFriendRequest = async (requestId: number): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.FRIEND_ACCEPT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể chấp nhận lời mời kết bạn");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi chấp nhận lời mời kết bạn");
  }
};

/**
 * Từ chối lời mời kết bạn
 */
export const rejectFriendRequest = async (requestId: number): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.FRIEND_REJECT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể từ chối lời mời kết bạn");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi từ chối lời mời kết bạn");
  }
};

/**
 * Lấy danh sách yêu cầu kết bạn
 */
export const getFriendRequests = async (page: number = 1, limit: number = 10): Promise<{requests: any[]}> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }
    
    const response = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.FRIEND_REQUESTS}?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể lấy danh sách yêu cầu kết bạn");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi lấy danh sách yêu cầu kết bạn");
  }
}; 