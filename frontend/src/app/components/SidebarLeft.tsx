// frontend/src/components/SidebarLeft.tsx
import styles from "./SidebarLeft.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SidebarLeft() {
    const router = useRouter();

    const navigateTo = (path: string) => {
        router.push(path);
    };

    return (
        <div className={styles.sidebarLeft}>
            {/* Phần logo */}
            <div className={styles.logo} onClick={() => navigateTo("/")}>
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
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Search..."
                    className={styles.searchInput}
                />
            </div>

            {/* Điều hướng */}
            <div className={styles.navigation}>
                <div
                    className={styles.navItem}
                    onClick={() => navigateTo("/")}
                >
                    <span className={styles.icon}>🏠</span>
                    <span className={styles.label}>Trang chủ</span>
                    <span className={styles.badge}>10</span>
                </div>
                <div
                    className={styles.navItem}
                    onClick={() => navigateTo("/friends/list")}
                >
                    <span className={styles.icon}>👥</span>
                    <span className={styles.label}>Bạn bè</span>
                    <span className={styles.badge}>2</span>
                </div>
                {/*<div*/}
                {/*    className={styles.navItem}*/}
                {/*    onClick={() => navigateTo("/settings")}*/}
                {/*>*/}
                {/*    <span className={styles.icon}>⚙️</span>*/}
                {/*    <span className={styles.label}>Cài đặt</span>*/}
                {/*</div>*/}
            </div>
        </div>
    );
}
