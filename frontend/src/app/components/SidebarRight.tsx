// frontend/src/app/components/SidebarRight.tsx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styles from "./SidebarRight.module.css";

export default function SidebarRight() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [language, setLanguage] = useState("vi"); // Default language is Vietnamese
    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navigateToProfile = (username: string) => {
        router.push(`/profile/${username}`);
    };

    // Hàm đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success(language === "vi" ? "Đăng xuất thành công!" : "Logout successful!");
        router.push("/login");
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
        toast.info(language === "vi" ? "Chuyển sang tiếng Anh" : "Switched to Vietnamese");
    };

    return (
        <div className={styles.sidebarRight}>
            {/* Logo người dùng */}
            <div className={styles.userProfile}>
                <Image
                    src="/user-logo.png"
                    alt="User Profile"
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
                            <li onClick={() => navigateToProfile("my-profile")}>
                                <span className={styles.menuIcon}>👤</span>
                                {language === "vi" ? "Trang cá nhân" : "Profile"}
                            </li>
                            <li>
                                <span className={styles.menuIcon}>🌐</span>
                                <select
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className={styles.selectBoxInMenu}
                                >
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">English</option>
                                </select>
                            </li>
                            <li onClick={handleLogout}>
                                <span className={styles.menuIcon}>🚪</span>
                                {language === "vi" ? "Đăng xuất" : "Logout"}
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Quảng cáo */}
            <div className={styles.ads}>
                <h3 className={styles.adsTitle}>Quảng cáo</h3>
                <div className={styles.adBox}>
                    <div className={styles.adContent}>
                        <p>Nội dung quảng cáo</p>
                    </div>
                </div>
                <div className={styles.adBox}>
                    <div className={styles.adContent}>
                        <p>Nội dung quảng cáo</p>
                    </div>
                </div>
            </div>

            {/* Đề xuất bạn bè */}
            <div className={styles.suggestedFriends}>
                <div className={styles.friendsHeader}>
                    <h3>Đề xuất bạn bè</h3>
                    <Link href="../friends/suggestions" className={styles.viewAll}>
                        Xem tất cả →
                    </Link>
                </div>
                <div className={styles.friendList}>
                    {[{ name: "Julia Smith", username: "juliasmith" }, { name: "Vermillion D. Gray", username: "vermilliongray" }, { name: "Mai Senpai", username: "maisenpai" }, { name: "Azunyan U. Wu", username: "azunyanudesu" }, { name: "Oarack Babama", username: "obama21" }]
                        .map((friend, index) => (
                            <div className={styles.friendItem} key={index}>
                                <div className={styles.friendInfo} onClick={() => navigateToProfile(friend.username)}>
                                    <Image
                                        src="/user-logo.png"
                                        alt={friend.name}
                                        className={styles.friendAvatar}
                                        width={40}
                                        height={40}
                                        unoptimized
                                        loading="lazy"
                                    />
                                    <div>
                                        <p className={styles.friendName}>{friend.name}</p>
                                        <p className={styles.friendUsername}>@{friend.username}</p>
                                    </div>
                                </div>
                                <button className={styles.addFriendButton}>+</button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
