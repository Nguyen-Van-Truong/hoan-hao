// frontend/src/app/[locale]/test/page.tsx
import { useTranslations } from "next-intl";

export default function TestPage() {
    const t = useTranslations("SidebarRight"); // Lấy dữ liệu dịch từ `messages/[locale].json`

    return (
        <div style={{ padding: "20px", fontSize: "18px" }}>
            <h1>🛠 Kiểm tra dịch JSON</h1>
            <p><strong>Profile:</strong> {t("profile")}</p>
            <p><strong>Logout:</strong> {t("logout")}</p>
            <p><strong>Ads:</strong> {t("ads")}</p>
            <p><strong>Suggested Friends:</strong> {t("suggested_friends")}</p>
            <p><strong>View All:</strong> {t("view_all")}</p>
        </div>
    );
}
