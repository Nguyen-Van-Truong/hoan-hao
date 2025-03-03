import axios from "axios";

const authApi = axios.create({
    baseURL: "http://localhost:8000/auth", // Base URL cho AuthService qua Kong
    headers: {
        "Content-Type": "application/json",
    },
});

// Hàm đăng nhập
export const login = async (usernameOrEmailOrPhone: string, password: string) => {
    try {
        const response = await authApi.post("/login", {
            usernameOrEmailOrPhone,
            password,
        });
        return response.data; // { accessToken, refreshToken }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            // Handle the case where the error is an AxiosError
            throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
        } else {
            // Handle the case where the error is not an AxiosError
            throw new Error("Đăng nhập thất bại");
        }
    }
};
