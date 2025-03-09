// frontend/src/app/api/postApi.ts
import axios from "axios";
import { getCookie } from "./authApi";

export interface Media {
    id: number;
    post_id: number;
    media_url: string;
    media_type: string;
    created_at: string;
}

export interface RawPost {
    id: number;
    user_id: number;
    content: string;
    visibility: string;
    created_at: string;
    updated_at: string;
    media: Media[];
    total_likes: number;
    total_comments: number;
    total_shares: number;
}

export interface FeedResponse {
    posts: RawPost[];
    total: number;
    limit: number;
    offset: number;
}

const postApi = axios.create({
    baseURL: "http://localhost:8000/post",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

postApi.interceptors.request.use(
    (config) => {
        const accessToken = getCookie("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const fetchFeed = async (
    limit: number,
    offset: number,
    mode: "latest" | "popular"
): Promise<FeedResponse> => {
    try {
        const response = await postApi.get("/feed", { params: { limit, offset, mode } });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message ?? "Failed to fetch posts");
        }
        throw new Error("Failed to fetch posts");
    }
};