// src/config/config.ts

// 🌎 Ngôn ngữ được hỗ trợ
export const SUPPORTED_LOCALES = ["en", "vi"];

// 🛠️ Các route không cần đăng nhập
export const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

// 🌐 API Base URL (Thay đổi theo môi trường)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// ⚙️ Các config khác
export const APP_CONFIG = {
    defaultLocale: "vi",
    fallbackLocale: "en",
    accessTokenStorageKey: "accessToken",
};
