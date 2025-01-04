// frontend/src/components/SidebarLeft.tsx
import styles from "./SidebarLeft.module.css";
import Link from "next/link";
import Image from "next/image";

export default function SidebarLeft() {
    return (
        <div className={styles.sidebarLeft}>
            {/* Phần logo */}
            <Link href="/" passHref>
                <div className={styles.logo}>
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        className={styles.logoImage}
                        width={100}
                        height={100}
                        unoptimized
                        loading="lazy"
                    />
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
