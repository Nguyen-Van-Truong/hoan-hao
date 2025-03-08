"use client";

import {useState, useEffect, useCallback} from "react";
import {useTranslations} from "next-intl";
import styles from "./SuggestedFriends.module.css";
import FriendCard from "./FriendCard";
import {getFriendSuggestions} from "../api/userApi";

// Định nghĩa kiểu cho hàm debounce
type DebouncedFunction = () => void;

// Hàm debounce với kiểu rõ ràng
const debounce = (func: DebouncedFunction, wait: number): EventListener => {
    let timeout: NodeJS.Timeout;
    return (() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(), wait);
    }) as EventListener;
};

interface Friend {
    id: number;
    username: string;
    full_name: string;
    profile_picture_url: string;
    bio?: string;
    location?: string;
}

export default function SuggestedFriends() {
    const t = useTranslations("SuggestedFriends");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchSuggestions = useCallback(
        async (isInitial = false) => {
            if (loading || !hasMore) return;
            setLoading(true);

            try {
                const data = await getFriendSuggestions(5); // Lấy 5 gợi ý mỗi lần
                const newFriends = data.filter(
                    (newFriend: Friend) => !friends.some((f) => f.id === newFriend.id)
                );

                if (isInitial) {
                    setFriends(newFriends); // Reset danh sách khi fetch lần đầu
                } else {
                    setFriends((prevFriends) => [...prevFriends, ...newFriends]);
                }

                if (data.length < 5 || newFriends.length === 0) {
                    setHasMore(false); // Hết dữ liệu nếu ít hơn limit hoặc không có bạn mới
                }
                setPage((prevPage) => prevPage + 1);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        },
        [loading, hasMore, friends]
    );

    // Fetch lần đầu khi component mount
    useEffect(() => {
        fetchSuggestions(true); // Reset danh sách khi mount
    }, [fetchSuggestions]);

    // Infinite scroll với debounce
    useEffect(() => {
        const handleScroll = debounce(() => {
            const {scrollTop, clientHeight, scrollHeight} = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) {
                fetchSuggestions();
            }
        }, 300);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [fetchSuggestions, loading, hasMore]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("title")}</h1>
            <div className={styles.friendList}>
                {friends.length > 0 ? (
                    friends.map((friend) => (
                        <FriendCard
                            key={friend.id} // Đảm bảo key là duy nhất
                            name={friend.full_name}
                            username={`@${friend.username}`}
                            avatar={friend.profile_picture_url || "/user-logo.png"}
                        />
                    ))
                ) : (
                    !loading && <p>{t("noSuggestions") || "No suggestions available"}</p>
                )}
            </div>
            {loading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>{t("loading")}</p>
                </div>
            )}
        </div>
    );
}