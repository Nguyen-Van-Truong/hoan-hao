// frontend/src/app/components/SearchBar.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl"; // ✅ Thêm hỗ trợ i18n
import styles from "./SearchBar.module.css";
import Image from "next/image";

// Định nghĩa kiểu dữ liệu cho gợi ý
interface Suggestion {
    id: number;
    type: "user" | "keyword"; // Gợi ý có thể là người dùng hoặc từ khóa
    name: string; // Tên của người dùng hoặc từ khóa
    avatar?: string; // Hình đại diện (nếu là người dùng)
}

// Hàm giả lập fetch gợi ý
const fetchSuggestions = async (query: string): Promise<Suggestion[]> => {
    if (!query) return [];
    return new Promise((resolve) =>
        setTimeout(() => {
            const mockSearchSuggestions: Suggestion[] = [
                { id: 1, type: "user", name: "Nguyễn Văn A", avatar: "/user-logo.png" },
                { id: 2, type: "user", name: "Trần Thị B", avatar: "/user-logo.png" },
                { id: 3, type: "keyword", name: "ReactJS" },
                { id: 4, type: "keyword", name: "NextJS" },
                { id: 5, type: "user", name: "Hoàng Minh C", avatar: "/user-logo.png" },
                { id: 6, type: "keyword", name: "JavaScript" },
            ];

            const filtered = mockSearchSuggestions.filter((item) =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );

            if (filtered.length === 0) {
                resolve([{ id: 0, type: "keyword", name: query }]);
            } else {
                resolve(filtered);
            }
        }, 500)
    );
};

export default function SearchBar() {
    const [searchValue, setSearchValue] = useState<string>(""); // Giá trị ô tìm kiếm
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // Danh sách gợi ý
    const [loading, setLoading] = useState<boolean>(false); // Trạng thái đang tải
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false); // Hiển thị dropdown
    const router = useRouter(); // Điều hướng Next.js
    const locale = useLocale(); // ✅ Lấy locale hiện tại
    const t = useTranslations("SearchBar"); // ✅ Lấy nội dung dịch từ JSON

    // ✅ Hàm điều hướng với locale
    const navigate = (path: string) => {
        router.push(`/${locale}${path}`);
    };

    // Xử lý thay đổi nội dung tìm kiếm
    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);

        if (value.trim() === "") {
            setSuggestions([]);
            setDropdownVisible(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        setDropdownVisible(true);

        const data = await fetchSuggestions(value);
        setLoading(false);

        setSuggestions(data);
    };

    // Xử lý nhấn phím Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchValue.trim() !== "") {
            navigate(`/search?keyword=${searchValue.trim()}`);
        }
    };

    // Xử lý chọn gợi ý
    const handleSelectSuggestion = (suggestion: Suggestion) => {
        if (suggestion.type === "user") {
            navigate(`/profile/${suggestion.id}`);
        } else {
            navigate(`/search?keyword=${suggestion.name}`);
        }
    };

    // Ẩn dropdown khi mất focus
    const handleBlur = () => {
        setTimeout(() => setDropdownVisible(false), 200);
    };

    return (
        <div className={styles.searchBar} style={{ position: "relative" }}>
            <input
                type="text"
                placeholder={t("search_placeholder")} // ✅ Placeholder theo locale
                className={styles.searchInput}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
            />
            {dropdownVisible && (
                <div className={styles.suggestionsDropdown}>
                    {loading && (
                        <div className={styles.spinnerContainer}>
                            <div className={styles.spinner}></div>
                        </div>
                    )}
                    {!loading &&
                        suggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className={styles.suggestionItem}
                                onClick={() => handleSelectSuggestion(suggestion)}
                            >
                                {suggestion.type === "user" ? (
                                    <>
                                        <Image
                                            src={suggestion.avatar || "/user-logo.png"}
                                            alt={suggestion.name}
                                            width={30}
                                            height={30}
                                            className={styles.avatar}
                                        />
                                        <span className={styles.suggestionText}>
                                            {suggestion.name}
                                        </span>
                                    </>
                                ) : (
                                    <span className={styles.suggestionText}>
                                        🔍 {suggestion.name}
                                    </span>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
