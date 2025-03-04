// frontend/src/app/api/authApi.ts
import axios from "axios";
import {setCookie, getCookie, removeCookie} from "typescript-cookie"; // Thêm removeCookie để đồng bộ

const authApi = axios.create({
    baseURL: "http://localhost:8000/auth", // Base URL cho AuthService qua Kong
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Cho phép gửi cookie trong request
});

// Hàm đăng nhập
export const login = async (usernameOrEmailOrPhone: string, password: string) => {
    try {
        const response = await authApi.post("/login", {
            usernameOrEmailOrPhone,
            password,
        });
        const {accessToken, refreshToken} = response.data;
        // Lưu token vào cookie (chỉ chạy ở client-side)
        if (typeof window !== "undefined") {
            setCookie("accessToken", accessToken, {expires: 1, secure: true, sameSite: "Strict", path: "/"});
            setCookie("refreshToken", refreshToken, {expires: 7, secure: true, sameSite: "Strict", path: "/"});
            console.log("Cookies set:", {accessToken, refreshToken}); // Log để kiểm tra
        } else {
            console.error("Window is undefined, cookies not set");
        }
        return response.data; // { accessToken, refreshToken }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
        } else {
            throw new Error("Đăng nhập thất bại");
        }
    }
};

// Hàm đăng ký
export const register = async (
    username: string,
    email: string,
    password: string,
    fullName: string,
    dateOfBirth: string,
    countryCode: string,
    phoneNumber: string
) => {
    try {
        const response = await authApi.post("/register", {
            username,
            email,
            password,
            fullName,
            dateOfBirth,
            countryCode,
            phoneNumber,
        });
        return response.data; // { message: "User registered successfully" }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Đăng ký thất bại");
        } else {
            throw new Error("Đăng ký thất bại");
        }
    }
};

// Export các hàm để sử dụng
export {getCookie, removeCookie};