// frontend/src/app/components/SidebarRight.tsx
"use client";

import {useState, useEffect, useContext} from "react";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import {useTranslations, useLocale} from "next-intl";
import {removeCookie} from "../api/authApi";
import {UserContext} from "../providers"; // Import UserContext
import {getFriendSuggestions, sendFriendRequest} from "../api/userApi"; // Import hàm API mới
import styles from "./SidebarRight.module.css";
import LanguageSwitcher from "./LanguageSwitcher";

type FriendSuggestion = {
    id: number;
    username: string;
    full_name: string;
    profile_picture_url: string;
};

export default function SidebarRight() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("SidebarRight");
    const currentUser = useContext(UserContext); // Lấy thông tin người dùng hiện tại

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navigate = (path: string) => {
        router.push(`/${locale}${path}`);
    };

    const navigateToProfile = (username: string) => {
        navigate(`/profile/${username}`);
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            removeCookie("accessToken", {path: "/"});
            removeCookie("refreshToken", {path: "/"});
            console.log("Cookies removed");
        }
        toast.success(t("logout_success"));
        navigate("/login");
    };

    const handleAddFriend = async (friendId: number) => {
        try {
            await sendFriendRequest(friendId); // Hàm API mới, thêm vào userApi.ts
            toast.success(t("friend_request_sent"));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định");
            console.error(err); // Log the error to the console if needed
        }

    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                setLoading(true);
                const data = await getFriendSuggestions(5); // Lấy 5 gợi ý bạn bè
                setSuggestions(data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Lỗi không xác định");
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    return (
        <div className={styles.sidebarRight}>
            {/* Logo người dùng */}
            <div className={styles.userProfile}>
                <Image
                    src={currentUser?.profile_picture_url || "/user-logo.png"}
                    alt={currentUser?.username || "User Profile"}
                    className={styles.userImage}
                    width={50}
                    height={50}
                    unoptimized
                    loading="lazy"
                    onClick={toggleMenu}
                />
                {isMenuOpen && (
                    <div className={styles.userMenu}>
                        <ul>
                            <li onClick={() => navigateToProfile(currentUser?.username || "my-profile")}>
                                <span className={styles.menuIcon}>👤</span>
                                {t("profile")}
                            </li>
                            <li>
                                <span className={styles.menuIcon}>🌐</span>
                                <LanguageSwitcher className={styles.languageSwitcher}/>
                            </li>
                            <li onClick={handleLogout}>
                                <span className={styles.menuIcon}>🚪</span>
                                {t("logout")}
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Quảng cáo */}
            <div className={styles.ads}>
                <h3 className={styles.adsTitle}>{t("ads")}</h3>
                <div className={styles.adBox}>
                    <div className={styles.adContent}>
                        <p>{t("ads_content")}</p>
                    </div>
                </div>
                <div className={styles.adBox}>
                    <div className={styles.adContent}>
                        <p>{t("ads_content")}</p>
                    </div>
                </div>
            </div>

            {/* Đề xuất bạn bè */}
            <div className={styles.suggestedFriends}>
                <div className={styles.friendsHeader}>
                    <h3>{t("suggested_friends")}</h3>
                    <Link href={`/${locale}/friends/suggestions`} className={styles.viewAll}>
                        {t("view_all")}
                    </Link>
                </div>
                {loading ? (
                    <p>Đang tải gợi ý bạn bè...</p>
                ) : error ? (
                    <p>Lỗi: {error}</p>
                ) : (
                    <div className={styles.friendList}>
                        {suggestions.map((friend) => (
                            <div className={styles.friendItem} key={friend.id}>
                                <div
                                    className={styles.friendInfo}
                                    onClick={() => navigateToProfile(friend.username)}
                                >
                                    <Image
                                        src={friend.profile_picture_url || "/user-logo.png"}
                                        alt={friend.full_name}
                                        className={styles.friendAvatar}
                                        width={40}
                                        height={40}
                                        unoptimized
                                        loading="lazy"
                                    />
                                    <div>
                                        <p className={styles.friendName}>{friend.full_name}</p>
                                        <p className={styles.friendUsername}>@{friend.username}</p>
                                    </div>
                                </div>
                                <button
                                    className={styles.addFriendButton}
                                    onClick={() => handleAddFriend(friend.id)}
                                >
                                    +
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}