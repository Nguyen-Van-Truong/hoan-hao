// frontend/src/app/[locale]/not-found.tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./not-found.module.css"; // Đảm bảo tạo file CSS cho trang 404

export default function NotFoundPage() {
    const t = useTranslations("NotFound");

    return (
        <div className={styles.notFoundContainer}>
            <h1 className={styles.title}>404</h1>
            <p className={styles.message}>{t("message")}</p>
            <Link href="/" className={styles.homeLink}>
                {t("go_home")}
            </Link>
        </div>
    );
}
