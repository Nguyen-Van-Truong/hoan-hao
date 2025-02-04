// frontend/src/app/components/LanguageSwitcher.tsx
"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useLocale} from "next-intl"; // Dùng useLocale để lấy locale hiện tại

interface LanguageSwitcherProps {
    className?: string;
}

export default function LanguageSwitcher({className}: LanguageSwitcherProps) {
    const router = useRouter();
    const locale = useLocale(); // Lấy locale hiện tại
    const [selectedLanguage, setSelectedLanguage] = useState(locale); // Khởi tạo với locale hiện tại

    const handleChangeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = event.target.value;

        // Kiểm tra locale hợp lệ
        const validLocales = ['en', 'vi']; // Danh sách các locale hợp lệ
        if (validLocales.includes(newLocale)) {
            setSelectedLanguage(newLocale);

            // Cập nhật lại URL với locale mới, sau đó là phần còn lại của đường dẫn
            const newPath = window.location.pathname.replace(`/${locale}`, ''); // Loại bỏ locale cũ khỏi URL
            router.push(`/${newLocale}${newPath}`); // Thêm locale mới vào đường dẫn
        } else {
            console.error('Locale không hợp lệ');
        }
    };

    return (
        <div className={className}>
            <select
                value={selectedLanguage}
                onChange={handleChangeLanguage}
                className="selectBoxInMenu"
            >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
            </select>
        </div>
    );
}
