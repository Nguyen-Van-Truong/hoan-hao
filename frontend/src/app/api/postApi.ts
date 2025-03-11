import axios from "axios";
import {getCookie} from "./authApi";

export interface Media {
    id: number;
    post_id: number;
    media_url: string;
    media_type: string;
    created_at: string;
}

export interface Author {
    id: number;
    username: string;
    full_name: string;
    profile_picture_url: string;
}

interface Like {
    user_id: number;
    created_at: string;
}

export interface RawPost {
    id: number;
    user_id: number;
    author: Author | null;
    content: string;
    visibility: string;
    created_at: string;
    updated_at: string;
    media: Media[];
    total_likes: number;
    total_comments: number;
    total_shares: number;
}

export interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    author: Author;
    parent_comment_id: number | null;
    content: string;
    media_url?: string | null; // Thêm media_url để đồng bộ với backend
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    likes: Like[] | null;
}

export interface FeedResponse {
    posts: RawPost[];
    total: number;
    limit: number;
    offset: number;
}

export interface CommentsResponse {
    comments: Comment[];
    total: number;
    limit: number;
    offset: number;
}

const postApi = axios.create({
    baseURL: "http://localhost:8000", // Cập nhật port backend nếu cần (8000 thay vì 8082)
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

// Tạo bài đăng mới với file ảnh hoặc media_urls
export const createPost = async (
    content: string,
    visibility: "PUBLIC" | "FRIENDS" | "PRIVATE",
    files?: File[],
    media_urls?: string[]
): Promise<RawPost> => {
    try {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("visibility", visibility);

        if (files && files.length > 0) {
            files.forEach((file) => formData.append("images", file));
        } else if (media_urls && media_urls.length > 0) {
            media_urls.forEach((url) => formData.append("media_urls[]", url));
        }

        const response = await postApi.post("/post", formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error ?? "Failed to create post");
        }
        throw new Error("Failed to create post");
    }
};

export const fetchFeed = async (
    limit: number,
    offset: number,
    mode: "latest" | "popular"
): Promise<FeedResponse> => {
    try {
        const response = await postApi.get("/post/feed", {params: {limit, offset, mode}});
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message ?? "Failed to fetch posts");
        }
        throw new Error("Failed to fetch posts");
    }
};

export const fetchPostById = async (postId: number): Promise<RawPost> => {
    try {
        const response = await postApi.get(`/post/${postId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message ?? "Failed to fetch post");
        }
        throw new Error("Failed to fetch post");
    }
};

// Tạo bình luận mới với ảnh (nếu có)
export const createComment = async (postId: number, content: string, image?: File): Promise<Comment> => {
    try {
        const formData = new FormData();
        formData.append("content", content);
        if (image) {
            formData.append("image", image); // Key phải là "image" để khớp backend
        }

        const response = await postApi.post(`/post/${postId}/comment`, formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error ?? "Failed to create comment");
        }
        throw new Error("Failed to create comment");
    }
};

// Trả lời bình luận với ảnh (nếu có)
export const replyComment = async (commentId: number, content: string, image?: File): Promise<Comment> => {
    try {
        const formData = new FormData();
        formData.append("content", content);
        if (image) {
            formData.append("image", image); // Key phải là "image" để khớp backend
        }

        const response = await postApi.post(`/comment/${commentId}/reply`, formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error ?? "Failed to reply comment");
        }
        throw new Error("Failed to reply comment");
    }
};

// Các hàm khác giữ nguyên
export const fetchCommentsByPostId = async (
    postId: number,
    limit: number,
    offset: number
): Promise<CommentsResponse> => {
    try {
        const response = await postApi.get(`/post/${postId}/comments`, {params: {limit, offset}});
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message ?? "Failed to fetch comments");
        }
        throw new Error("Failed to fetch comments");
    }
};

export const likePost = async (postId: number): Promise<void> => {
    try {
        await postApi.post(`/post/${postId}/like`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error ?? "Failed to like post");
        }
        throw new Error("Failed to like post");
    }
};

// Bỏ thích bài đăng
export const unlikePost = async (postId: number): Promise<void> => {
    try {
        await postApi.delete(`/post/${postId}/like`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error ?? "Failed to unlike post");
        }
        throw new Error("Failed to unlike post");
    }
};

// Thích bình luận
export const likeComment = async (commentId: number): Promise<void> => {
    try {
        await postApi.post(`/comment/${commentId}/like`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error ?? "Failed to like comment");
        }
        throw new Error("Failed to like comment");
    }
};

// Bỏ thích bình luận
export const unlikeComment = async (commentId: number): Promise<void> => {
    try {
        await postApi.delete(`/comment/${commentId}/like`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error ?? "Failed to unlike comment");
        }
        throw new Error("Failed to unlike comment");
    }
};