// API configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// Auth service
export const AUTH_SERVICE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || API_BASE_URL;

// User service
export const USER_SERVICE_URL =
  import.meta.env.VITE_USER_SERVICE_URL || API_BASE_URL;

// Post service
export const POST_SERVICE_URL =
  import.meta.env.VITE_POST_SERVICE_URL || API_BASE_URL;

// Common HTTP request options
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

