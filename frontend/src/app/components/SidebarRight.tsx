// frontend/src/app/components/SidebarRight.tsx
import {useState} from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link từ Next.js
import { useRouter } from "next/navigation"; // Sử dụng điều hướng
import { toast } from "react-toastify"; // Thông báo lỗi thành công
import styles from "./SidebarRight.module.css";

export default function SidebarRight() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navigateToProfile = (username: string) => {
        router.push(`/profile/${username}`);
    };

    // Hàm đăng xuất
    const handleLogout = () => {
        // Xóa token khỏi localStorage hoặc cookies (tùy vào cách lưu trữ của bạn)
        localStorage.removeItem("token"); // Hoặc xóa cookie nếu dùng cookies
        toast.success("Đăng xuất thành công!");

        // Chuyển hướng về trang đăng nhập
        router.push("/login");
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
                    onClick={toggleMenu} /* Xử lý click để mở menu */
                />
                {isMenuOpen && (
                    <div className={styles.userMenu}>
                        <ul>
                            <li onClick={() => navigateToProfile("my-profile")}>
                                <span className={styles.menuIcon}>👤</span>
                                Trang cá nhân
                            </li>
                            <li onClick={handleLogout}>
                                <span className={styles.menuIcon}>🚪</span>
                                Đăng xuất
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
                    {[
                        { name: "Julia Smith", username: "juliasmith" },
                        { name: "Vermillion D. Gray", username: "vermilliongray" },
                        { name: "Mai Senpai", username: "maisenpai" },
                        { name: "Azunyan U. Wu", username: "azunyanudesu" },
                        { name: "Oarack Babama", username: "obama21" },
                    ].map((friend, index) => (
                        <div className={styles.friendItem} key={index}>
                            <div
                                className={styles.friendInfo}
                                onClick={() => navigateToProfile(friend.username)}
                            >
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
