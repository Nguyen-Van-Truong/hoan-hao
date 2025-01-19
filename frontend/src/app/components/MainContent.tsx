import { useEffect, useRef, useState, useCallback } from "react";
import Post from "./Post";
import styles from "./MainContent.module.css";

export default function MainContent() {
    const [posts, setPosts] = useState([
        {
            author: "Truong",
            role: "User",
            content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id elit scelerisque, dapibus est ut, facilisis neque. 
            Proin tincidunt, libero a tristique suscipit, neque neque volutpat turpis, a tincidunt sapien velit in nulla. 
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.\n
            Nam id orci ut ex vehicula facilisis. Quisque vehicula accumsan odio nec dignissim. Phasellus vitae mauris felis. 
            Integer interdum orci velit, ac consectetur nunc porta vel.`,
            time: "10 phút trước",
            images: ["/1234.jpg"],
            hashcodeIDPost: "post1",
        },
        {
            author: "Truong",
            role: "User",
            content: `Hôm nay tôi cảm thấy rất vui vì dự án đang tiến triển rất tốt. 
            Đây là một cơ hội tuyệt vời để học hỏi và làm việc cùng nhau.\n
            Cảm ơn các bạn đã luôn hỗ trợ và đồng hành trong suốt hành trình này!`,
            time: "1 giờ trước",
            images: ["/123.jpg", "/1234.jpg"],
            hashcodeIDPost: "post2",
        },
        {
            author: "Truong",
            role: "User",
            content: "Không có gì tuyệt vời hơn việc hoàn thành dự án đúng thời hạn!",
            time: "2 giờ trước",
            images: ["/123.jpg", "/1234.jpg", "/123.jpg"],
            hashcodeIDPost: "post3",
        },
    ]);

    const [loading, setLoading] = useState(false);
    const mainContentRef = useRef<HTMLDivElement | null>(null);

    const fetchMorePosts = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        await new Promise((res) => setTimeout(res, 1000));

        const newPosts = [
            {
                author: "User 1",
                role: "User",
                content: "Bài viết mới với 1 hình ảnh.",
                time: "1 phút trước",
                images: ["/123.jpg"],
                hashcodeIDPost: "post7",
            },
            {
                author: "User 2",
                role: "User",
                content: "Bài viết mới không có hình ảnh.",
                time: "2 phút trước",
                images: [],
                hashcodeIDPost: "post8",
            },
        ];

        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setLoading(false);
    }, [loading]);

    useEffect(() => {
        const handleScroll = () => {
            const container = mainContentRef.current;
            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
                    fetchMorePosts();
                }
            }
        };

        const container = mainContentRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, [fetchMorePosts, loading]);

    return (
        <div
            className={styles.mainContent}
            ref={mainContentRef}
        >
            {posts.map((post, index) => (
                <Post
                    key={post.hashcodeIDPost}
                    author={post.author}
                    role={post.role}
                    content={post.content}
                    time={post.time}
                    images={post.images}
                    hashcodeIDPost={post.hashcodeIDPost}
                />
            ))}

            {loading && (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p>Đang tải thêm bài viết...</p>
                </div>
            )}
        </div>
    );
}
