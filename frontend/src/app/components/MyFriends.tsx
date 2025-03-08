"use client";

import {useState, useEffect, useCallback} from "react";
import {useTranslations} from "next-intl";
import styles from "./MyFriends.module.css";
import FriendCard from "./FriendCard";
import {getFriends} from "../api/userApi";

// Định nghĩa kiểu cho hàm debounce tương thích với EventListener
type DebouncedFunction = () => void; // Không cần tham số vì scroll không truyền args trực tiếp

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

export default function MyFriends() {
    const t = useTranslations("MyFriends");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchFriends = useCallback(
        async (pageNum: number, isInitial = false) => {
            if (loading || pageNum > totalPages || !hasMore) return;
            setLoading(true);

            try {
                const data = await getFriends(pageNum, 10);
                const newFriends = data.friends.filter(
                    (newFriend: Friend) => !friends.some((f) => f.id === newFriend.id)
                );

                if (isInitial) {
                    setFriends(newFriends); // Reset danh sách khi fetch lần đầu
                } else {
                    setFriends((prevFriends) => [...prevFriends, ...newFriends]);
                }

                if (newFriends.length < 10 || data.total === friends.length + newFriends.length) {
                    setHasMore(false); // Hết dữ liệu nếu ít hơn limit hoặc đạt tổng số
                }
                setTotalPages(data.pages);
                setPage(pageNum + 1);
            } catch (error) {
                console.error("Error fetching friends:", error);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        },
        [loading, totalPages, friends, hasMore]
    );

    // Fetch lần đầu khi component mount
    useEffect(() => {
        fetchFriends(1, true); // Reset danh sách khi mount
    }, [fetchFriends]);

    // Infinite scroll với debounce
    useEffect(() => {
        const handleScroll = debounce(() => {
            const {scrollTop, clientHeight, scrollHeight} = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) {
                fetchFriends(page);
            }
        }, 300);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [fetchFriends, loading, page, hasMore]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("title")}</h1>
            <div className={styles.friendList}>
                {friends.length > 0 ? (
                    friends.map((friend) => (
                        <FriendCard
                            key={friend.id}
                            name={friend.full_name}
                            username={`@${friend.username}`}
                            avatar={friend.profile_picture_url || "/user-logo.png"}
                        />
                    ))
                ) : (
                    !loading && <p>{t("noFriends") || "No friends found"}</p>
                )}
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