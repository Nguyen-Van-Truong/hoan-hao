// frontend/src/components/SidebarLeft.tsx
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl"; // ✅ Hỗ trợ đa ngôn ngữ
import SearchBar from "./SearchBar";
import styles from "./SidebarLeft.module.css";
import Image from "next/image";

export default function SidebarLeft() {
    const router = useRouter();
    const locale = useLocale(); // ✅ Lấy locale hiện tại
    const t = useTranslations("SidebarLeft"); // ✅ Lấy nội dung dịch từ JSON

    // ✅ Hàm chuyển hướng theo `locale`
    const navigate = (path: string) => {
        router.push(`/${locale}${path}`);
    };

    return (
        <div className={styles.sidebarLeft}>
            {/* Phần logo */}
            <div className={styles.logo} onClick={() => navigate("/")}>
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
                <div className={styles.navItem} onClick={() => navigate("/")}>
                    <span className={styles.icon}>🏠</span>
                    <span className={styles.label}>{t("home")}</span>
                </div>
                <div className={styles.navItem} onClick={() => navigate("/friends/list")}>
                    <span className={styles.icon}>👥</span>
                    <span className={styles.label}>{t("friends")}</span>
                </div>
            </div>
        </div>
    );
}
