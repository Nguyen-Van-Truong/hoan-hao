// frontend/src/components/SidebarLeft.tsx
import SearchBar from "./SearchBar";
import styles from "./SidebarLeft.module.css";
import Image from "next/image";

export default function SidebarLeft() {
    return (
        <div className={styles.sidebarLeft}>
            {/* Phần logo */}
            <div className={styles.logo} onClick={() => window.location.href = "/"}>
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

            {/* Thanh tìm kiếm */}
            <SearchBar />

            {/* Điều hướng */}
            <div className={styles.navigation}>
                <div className={styles.navItem} onClick={() => window.location.href = "/"}>
                    <span className={styles.icon}>🏠</span>
                    <span className={styles.label}>Trang chủ</span>
                    <span className={styles.badge}>10</span>
                </div>
                <div
                    className={styles.navItem}
                    onClick={() => window.location.href = "/friends/list"}
                >
                    <span className={styles.icon}>👥</span>
                    <span className={styles.label}>Bạn bè</span>
                    <span className={styles.badge}>2</span>
                </div>
            </div>
        </div>
    );
}
