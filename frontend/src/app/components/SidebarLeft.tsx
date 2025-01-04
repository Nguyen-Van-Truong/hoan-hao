// frontend/src/components/SidebarLeft.tsx
import styles from "./SidebarLeft.module.css";
import Link from "next/link";

export default function SidebarLeft() {
    return (
        <div className={styles.sidebarLeft}>
            {/* Phần logo */}
            <Link href="/" passHref>
                <div className={styles.logo}>
                    <img src="/logo.png" alt="Logo" className={styles.logoImage} />
                </div>
            </Link>

            {/* Thanh tìm kiếm */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Search..."
                    className={styles.searchInput}
                />
            </div>

            {/* Điều hướng */}
            <div className={styles.navigation}>
                <div className={styles.navItem}>
                    <span className={styles.icon}>🏠</span>
                    <span className={styles.label}>Trang chủ</span>
                    <span className={styles.badge}>10</span>
                </div>
                <div className={styles.navItem}>
                    <span className={styles.icon}>👥</span>
                    <span className={styles.label}>Bạn bè</span>
                    <span className={styles.badge}>2</span>
                </div>
                <div className={styles.navItem}>
                    <span className={styles.icon}>⚙️</span>
                    <span className={styles.label}>Cài đặt</span>
                </div>
            </div>
        </div>
    );
}
