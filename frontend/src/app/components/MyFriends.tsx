// frontend/src/app/components/MyFriends.tsx
"use client";

import {useState, useEffect, useCallback} from "react";
import {useTranslations, useLocale} from "next-intl";
import styles from "./MyFriends.module.css";
import FriendCard from "./FriendCard";

interface Friend {
    name: string;
    username: string;
    avatar: string;
}

// Danh sách bạn bè ban đầu
const initialFriends: Friend[] = Array.from({length: 12}, (_, i) => ({
    name: `Friend ${i + 1}`,
    username: `@friend${i + 1}`,
    avatar: "/user-logo.png",
}));

export default function MyFriends() {
    const t = useTranslations("MyFriends"); // ✅ Hỗ trợ i18n
    useLocale();
// ✅ Lấy locale hiện tại
    const [friends, setFriends] = useState<Friend[]>(initialFriends);
    const [loading, setLoading] = useState(false);

    const fetchMoreFriends = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        // Mô phỏng gọi API thêm bạn bè
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newFriends: Friend[] = Array.from({length: 8}, (_, i) => ({
            name: `New Friend ${friends.length + i + 1}`,
            username: `@newfriend${friends.length + i + 1}`,
            avatar: "/user-logo.png",
        }));

        setFriends((prevFriends) => [...prevFriends, ...newFriends]);
        setLoading(false);
    }, [loading, friends.length]);

    useEffect(() => {
        const handleScroll = () => {
            const {scrollTop, clientHeight, scrollHeight} = document.documentElement;

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
            <h1 className={styles.title}>{t("title")}</h1>
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
                    <div className={styles.spinner}/>
                    <p>{t("loading")}</p>
                </div>
            )}
        </div>
    );
}
