// frontend/src/app/components/SuggestedFriends.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./SuggestedFriends.module.css";
import FriendCard from "./FriendCard";

interface Friend {
    name: string;
    username: string;
    avatar: string;
}

// Khởi tạo danh sách bạn bè ban đầu với 12 mục
const initialFriends: Friend[] = Array.from({ length: 12 }, (_, i) => ({
    name: `Friend ${i + 1}`,
    username: `@friend${i + 1}`,
    avatar: "/user-logo.png",
}));

export default function SuggestedFriends() {
    const [friends, setFriends] = useState<Friend[]>(initialFriends);
    const [loading, setLoading] = useState(false);

    const fetchMoreFriends = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        // Mô phỏng gọi API với thêm 8 bạn bè
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newFriends: Friend[] = Array.from({ length: 8 }, (_, i) => ({
            name: `New Friend ${friends.length + i + 1}`,
            username: `@newfriend${friends.length + i + 1}`,
            avatar: "/user-logo.png",
        }));

        setFriends((prevFriends) => [...prevFriends, ...newFriends]);
        setLoading(false);
    }, [loading, friends.length]);

    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

            // Kiểm tra nếu cuộn đến gần cuối trang
            if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
                fetchMoreFriends();
            }
        };

        // Lắng nghe sự kiện cuộn của toàn bộ trang
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [fetchMoreFriends, loading]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Đề xuất bạn bè</h1>
            <div className={styles.friendList}>
                {friends.map((friend, index) => (
                    <FriendCard
                        key={index}
                        name={friend.name}
                        username={friend.username}
                        avatar={friend.avatar}
                    />
                ))}
            </div>
            {loading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải thêm bạn bè...</p>
                </div>
            )}
        </div>
    );
}
