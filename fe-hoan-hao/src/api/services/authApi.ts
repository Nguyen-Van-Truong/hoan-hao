import { API_BASE_URL } from "../config";
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest } from "../types";

const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
};

/**
 * Đăng ký người dùng mới
 */
export const registerUser = async (
  userData: RegisterRequest
): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${AUTH_ENDPOINTS.REGISTER}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Đăng ký thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi đăng ký");
  }
};

/**
 * Đăng nhập
 */
export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi đăng nhập");
  }
};

/**
 * Yêu cầu khôi phục mật khẩu
 */
export const requestPasswordReset = async (
  email: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Yêu cầu khôi phục mật khẩu thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi yêu cầu khôi phục mật khẩu");
  }
};

/**
 * Đặt lại mật khẩu với token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đặt lại mật khẩu thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi khi đặt lại mật khẩu");
  }
}; 