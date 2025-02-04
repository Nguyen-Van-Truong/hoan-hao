// frontend/src/app/components/profile/PostsTab.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl"; // ✅ Hỗ trợ i18n
import Post from "../Post"; // ✅ Tái sử dụng Post component
import styles from "./PostsTab.module.css";

interface PostType {
    author: string;
    username: string;
    content: string;
    time: string;
    images: string[];
    hashcodeIDPost: string;
}

export default function PostsTab() {
    const t = useTranslations("PostsTab"); // ✅ Lấy dữ liệu dịch từ JSON
    const [posts, setPosts] = useState<PostType[]>([
        {
            author: "User 1",
            username: "@user1",
            content: "Bài viết đầu tiên.",
            time: "10 phút trước",
            images: ["/123.jpg"],
            hashcodeIDPost: `post1`,
        },
        {
            author: "User 2",
            username: "@user2",
            content: "Bài viết thứ hai.",
            time: "20 phút trước",
            images: ["/1234.jpg"],
            hashcodeIDPost: `post2`,
        },
        {
            author: "User 3",
            username: "@user3",
            content: "Bài viết thứ ba.",
            time: "30 phút trước",
            images: ["/123.jpg", "/1234.jpg"],
            hashcodeIDPost: `post3`,
        },
    ]);

    const [loading, setLoading] = useState(false);
    const userCounter = useRef(4); // Để tiếp tục tăng số user trong bài viết mới

    const fetchMorePosts = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        // Mô phỏng việc tải thêm bài viết
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newPosts: PostType[] = [
            {
                author: `User ${userCounter.current}`,
                username: `@user${userCounter.current}`,
                content: "Bài viết mới với 1 hình ảnh.",
                time: "1 phút trước",
                images: ["/123.jpg"],
                hashcodeIDPost: uuidv4(),
            },
            {
                author: `User ${userCounter.current + 1}`,
                username: `@user${userCounter.current + 1}`,
                content: "Bài viết mới không có hình ảnh.",
                time: "2 phút trước",
                images: [],
                hashcodeIDPost: uuidv4(),
            },
            {
                author: `User ${userCounter.current + 2}`,
                username: `@user${userCounter.current + 2}`,
                content: "Bài viết mới với 2 hình ảnh.",
                time: "3 phút trước",
                images: ["/123.jpg", "/1234.jpg"],
                hashcodeIDPost: uuidv4(),
            },
        ];

        userCounter.current += 3;

        setPosts((prevPosts) => {
            const uniquePosts = newPosts.filter(
                (newPost) =>
                    !prevPosts.some((post) => post.hashcodeIDPost === newPost.hashcodeIDPost)
            );
            return [...prevPosts, ...uniquePosts];
        });

        setLoading(false);
    }, [loading]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Kiểm tra khi người dùng cuộn đến cuối trang và ít nhất có 3 bài viết
            if (scrollTop + windowHeight >= documentHeight - 5 && !loading && posts.length >= 3) {
                fetchMorePosts();
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [fetchMorePosts, loading, posts.length]);

    return (
        <div className={styles.postsTab}>
            {posts.map((post) => (
                <Post
                    key={post.hashcodeIDPost}
                    author={post.author}
                    username={post.username}
                    content={post.content}
                    time={post.time}
                    images={post.images}
                    hashcodeIDPost={post.hashcodeIDPost}
                />
            ))}

            {loading && (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>{t("loading")}</p>
                </div>
            )}
        </div>
    );
}
