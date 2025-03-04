import axios from "axios";
import { getCookie } from "./authApi";

const userApi = axios.create({
    baseURL: "http://localhost:8000/user",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

userApi.interceptors.request.use(
    (config) => {
        const accessToken = getCookie("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Lấy thông tin profile cá nhân
export const getMyProfile = async () => {
    try {
        const response = await userApi.get("/profile/me");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể lấy thông tin profile");
        }
        throw new Error("Không thể lấy thông tin profile");
    }
};

// Lấy thông tin profile công khai bằng username
export const getPublicProfileByUsername = async (username: string) => {
    try {
        const response = await userApi.get(`/profile/public/username/${username}`);
        return response.data; // { profile, friend_status }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể tìm thấy profile");
        }
        throw new Error("Không thể tìm thấy profile");
    }
};

// Lấy danh sách gợi ý bạn bè
export const getFriendSuggestions = async (limit: number = 5) => {
    try {
        const response = await userApi.get("/friends/suggestions", {
            params: { limit },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể lấy gợi ý bạn bè");
        }
        throw new Error("Không thể lấy gợi ý bạn bè");
    }
};

// Gửi yêu cầu kết bạn
export const sendFriendRequest = async (friendId: number) => {
    try {
        const response = await userApi.post("/friend/request", { friendId });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể gửi yêu cầu kết bạn");
        }
        throw new Error("Không thể gửi yêu cầu kết bạn");
    }
};

// Hủy yêu cầu kết bạn
export const cancelFriendRequest = async (friendId: number) => {
    try {
        const response = await userApi.post("/friend/cancel", { friendId });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể hủy yêu cầu kết bạn");
        }
        throw new Error("Không thể hủy yêu cầu kết bạn");
    }
};

// Chặn người dùng
export const blockUser = async (friendId: number) => {
    try {
        const response = await userApi.post("/friend/block", { friendId });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể chặn người dùng");
        }
        throw new Error("Không thể chặn người dùng");
    }
};

// Hủy chặn người dùng
export const unblockUser = async (friendId: number) => {
    try {
        const response = await userApi.post("/friend/unblock", { friendId });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể hủy chặn người dùng");
        }
        throw new Error("Không thể hủy chặn người dùng");
    }
};

// Chấp nhận yêu cầu kết bạn
export const acceptFriendRequest = async (friendId: number) => {
    try {
        const response = await userApi.put("/friend/update", { friendId, status: "ACCEPTED" });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể chấp nhận yêu cầu kết bạn");
        }
        throw new Error("Không thể chấp nhận yêu cầu kết bạn");
    }
};