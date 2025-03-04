// frontend/src/app/api/userApi.ts
import axios from "axios";
import { getCookie } from "./authApi";

const userApi = axios.create({
    baseURL: "http://localhost:8000/user", // Base URL cho UserService qua Kong
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Cho phép gửi cookie
});

// Interceptor để thêm token vào header
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

// Lấy thông tin profile công khai của người dùng khác
export const getPublicProfile = async (userId: string) => {
    try {
        const response = await userApi.get(`/profile/public/${userId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể lấy thông tin profile công khai");
        }
        throw new Error("Không thể lấy thông tin profile công khai");
    }
};

// Lấy danh sách gợi ý bạn bè
export const getFriendSuggestions = async (limit: number = 5) => {
    try {
        const response = await userApi.get("/friends/suggestions", {
            params: { limit },
        });
        return response.data; // Giả sử trả về array [{id, username, full_name, profile_picture_url}]
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
        return response.data; // Giả sử trả về { message: "Friend request sent successfully" }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || "Không thể gửi yêu cầu kết bạn");
        }
        throw new Error("Không thể gửi yêu cầu kết bạn");
    }
};