// frontend/src/app/components/MyFriends.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./MyFriends.module.css";
import FriendCard from "./FriendCard";

interface Friend {
    name: string;
    username: string;
    avatar: string;
}

// Danh sách bạn bè ban đầu
const initialFriends: Friend[] = Array.from({ length: 12 }, (_, i) => ({
    name: `Friend ${i + 1}`,
    username: `@friend${i + 1}`,
    avatar: "/user-logo.png",
}));

export default function MyFriends() {
    const [friends, setFriends] = useState<Friend[]>(initialFriends);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const fetchMoreFriends = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        // Mô phỏng gọi API thêm bạn bè
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
            const container = containerRef.current;
            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
                    fetchMoreFriends();
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, [fetchMoreFriends, loading]);

    return (
        <div className={styles.container} ref={containerRef}>
            <h1 className={styles.title}>Danh sách bạn bè</h1>
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
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p>Đang tải thêm bạn bè...</p>
                </div>
            )}
        </div>
    );
}
