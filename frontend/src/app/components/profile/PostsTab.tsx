// frontend/src/app/components/profile/PostsTab.tsx
"use client";

import styles from "./PostsTab.module.css";
import Post from "../Post";

const mockPosts = [
    {
        author: "Nguyễn Văn A",
        role: "User",
        content: "Bài viết đầu tiên",
        time: "10 phút trước",
        images: [
            "/1234.jpg", "/123.jpg", "/boji2.webp", "/logo.png", "/next.svg", "/123.jpg",
            "/1234.jpg", "/boji2.webp", "/logo.png",
        ],        hashcodeIDPost: "post1",
    },
    {
        author: "Trần Thị B",
        role: "Admin",
        content: "Hôm nay trời đẹp quá!",
        time: "1 giờ trước",
        images: [],
        hashcodeIDPost: "post2",
    },
    {
        author: "Lê Văn C",
        role: "Moderator",
        content: "Mình vừa hoàn thành dự án lớn.",
        time: "3 giờ trước",
        images: [
            "/1234.jpg", "/123.jpg", "/boji2.webp",
        ],
        hashcodeIDPost: "post3",
    },
];

export default function PostsTab() {
    return (
        <div className={styles.posts}>
            {mockPosts.map((post) => (
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
        </div>
    );
}
