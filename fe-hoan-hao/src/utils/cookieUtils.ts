/**
 * Utility functions for managing cookies
 */

// Thiết lập các options mặc định cho cookie
const defaultOptions = {
  path: '/',
  secure: import.meta.env.PROD, // Chỉ dùng Secure trong production
  sameSite: 'strict' as const,
  maxAge: 86400 // 1 day in seconds
};

// Đặt tên cookie
export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token'
};

/**
 * Set cookie với options cho bảo mật
 */
export const setCookie = (name: string, value: string, options: Record<string, any> = {}) => {
  const cookieOptions = {
    ...defaultOptions,
    ...options
  };
  
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (cookieOptions.maxAge) {
    cookie += `; max-age=${cookieOptions.maxAge}`;
  }
  
  if (cookieOptions.path) {
    cookie += `; path=${cookieOptions.path}`;
  }
  
  if (cookieOptions.secure) {
    cookie += '; secure';
  }
  
  if (cookieOptions.sameSite) {
    cookie += `; samesite=${cookieOptions.sameSite}`;
  }
  
  document.cookie = cookie;
};

/**
 * Lấy giá trị cookie theo tên
 */
export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(encodeURIComponent(name) + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

/**
 * Xóa cookie theo tên
 */
export const removeCookie = (name: string) => {
  setCookie(name, '', { maxAge: -1 });
};

/**
 * Set access token vào cookie
 */
export const setAccessToken = (token: string) => {
  setCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, token, {
    maxAge: 3600 // 1 hour
  });
};

/**
 * Set refresh token vào cookie
 */
export const setRefreshToken = (token: string) => {
  setCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, token, {
    maxAge: 2592000 // 30 days
  });
};

/**
 * Lấy access token từ cookie
 */
export const getAccessToken = (): string | null => {
  return getCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
};

/**
 * Lấy refresh token từ cookie
 */
export const getRefreshToken = (): string | null => {
  return getCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
};

/**
 * Xóa tất cả cookie liên quan đến auth
 */
export const clearAuthCookies = () => {
  removeCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
  removeCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
};