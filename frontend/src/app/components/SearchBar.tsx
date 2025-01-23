import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css";
import Image from "next/image";

const fetchSuggestions = async (query: string) => {
    if (!query) return [];
    return new Promise<{ id: number; type: string; name: string; avatar?: string }[]>((resolve) =>
        setTimeout(() => {
            const mockSearchSuggestions = [
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
    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false); // Trạng thái đang tải
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const router = useRouter(); // Sử dụng router để điều hướng

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
        setDropdownVisible(true); // Luôn hiển thị dropdown khi đang gõ

        const data = await fetchSuggestions(value);
        setLoading(false); // Kết thúc trạng thái đang tải

        setSuggestions(data); // Cập nhật danh sách gợi ý
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchValue.trim() !== "") {
            router.push(`/search?keyword=${searchValue.trim()}`); // Điều hướng đến trang tìm kiếm
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        if (suggestion.type === "user") {
            router.push(`/profile/${suggestion.id}`); // Điều hướng đến trang profile
        } else {
            router.push(`/search?keyword=${suggestion.name}`); // Điều hướng đến trang tìm kiếm
        }
    };

    const handleBlur = () => {
        // Ẩn dropdown khi input mất focus
        setTimeout(() => setDropdownVisible(false), 200);
    };

    return (
        <div className={styles.searchBar} style={{ position: "relative" }}>
            <input
                type="text"
                placeholder="Tìm kiếm..."
                className={styles.searchInput}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown} // Lắng nghe phím Enter
                onBlur={handleBlur}
            />
            {/* Dropdown gợi ý */}
            {dropdownVisible && (
                <div className={styles.suggestionsDropdown}>
                    {loading && (
                        // Spinner hiển thị khi đang tải
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
                                        <span className={styles.suggestionText}>{suggestion.name}</span>
                                    </>
                                ) : (
                                    <span className={styles.suggestionText}>🔍 {suggestion.name}</span>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
