// frontend/src/app/components/SearchBar.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
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

            // Nếu không có kết quả, trả về chính từ khóa như gợi ý
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

        setLoading(true); // Hiển thị trạng thái đang tải
        setDropdownVisible(true); // Hiển thị dropdown

        const data = await fetchSuggestions(value);
        setLoading(false); // Kết thúc trạng thái đang tải

        setSuggestions(data); // Cập nhật danh sách gợi ý
    };

    // Xử lý nhấn phím Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchValue.trim() !== "") {
            router.push(`/search?keyword=${searchValue.trim()}`); // Điều hướng đến trang tìm kiếm
        }
    };

    // Xử lý chọn gợi ý
    const handleSelectSuggestion = (suggestion: Suggestion) => {
        if (suggestion.type === "user") {
            router.push(`/profile/${suggestion.id}`); // Điều hướng đến trang hồ sơ
        } else {
            router.push(`/search?keyword=${suggestion.name}`); // Điều hướng đến trang tìm kiếm
        }
    };

    // Ẩn dropdown khi mất focus
    const handleBlur = () => {
        setTimeout(() => setDropdownVisible(false), 200); // Trễ để không ảnh hưởng đến onClick
    };

    return (
        <div className={styles.searchBar} style={{ position: "relative" }}>
            <input
                type="text"
                placeholder="Tìm kiếm..."
                className={styles.searchInput}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
            />
            {/* Dropdown gợi ý */}
            {dropdownVisible && (
                <div className={styles.suggestionsDropdown}>
                    {loading && (
                        // Hiển thị spinner khi đang tải
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
