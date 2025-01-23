"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchResults.module.css";

interface SearchResult {
    id: number;
    type: string; // "user" hoặc "post"
    name: string; // Tên bài viết hoặc người dùng
    description?: string; // Mô tả bài viết
    avatar?: string; // Avatar nếu là người dùng
    author?: string; // Tên tác giả nếu là bài viết
    hashcodeIDPost?: string; // Mã bài viết nếu là bài viết
}

const mockSearchResults = (keyword: string): Promise<SearchResult[]> => {
    return new Promise((resolve) =>
        setTimeout(() => {
            const results = [
                { id: 1, type: "user", name: "Nguyễn Văn A", avatar: "/user-logo.png" },
                { id: 2, type: "user", name: "Trần Thị B", avatar: "/user-logo.png" },
                {
                    id: 3,
                    type: "post",
                    name: "Bài viết về ReactJS",
                    description: "Giới thiệu thư viện ReactJS",
                    author: "Nguyễn Văn A",
                    hashcodeIDPost: "reactjs-post",
                },
                {
                    id: 4,
                    type: "post",
                    name: "Bài viết về NextJS",
                    description: "Hướng dẫn sử dụng NextJS",
                    author: "Trần Thị B",
                    hashcodeIDPost: "nextjs-post",
                },
            ];
            resolve(
                results.filter((item) =>
                    item.name.toLowerCase().includes(keyword.toLowerCase())
                )
            );
        }, 500)
    );
};

export default function SearchResults({ keyword }: { keyword: string }) {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            const data = await mockSearchResults(keyword);
            setResults(data);
            setLoading(false);
        };

        fetchResults();
    }, [keyword]);

    const handleResultClick = (result: SearchResult) => {
        if (result.type === "user") {
            // Điều hướng đến trang hồ sơ của người dùng
            router.push(`/profile/${result.name}`);
        } else if (result.type === "post" && result.author && result.hashcodeIDPost) {
            // Điều hướng đến trang bài viết
            router.push(`/${result.author}/post/${result.hashcodeIDPost}`);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Đang tải kết quả...</div>;
    }

    if (results.length === 0) {
        return (
            <div className={styles.noResults}>
                Không tìm thấy kết quả nào cho "{keyword}"
            </div>
        );
    }

    return (
        <div className={styles.resultsContainer}>
            <h2 className={styles.resultsHeader}>
                Kết quả tìm kiếm cho: <span className={styles.keyword}>{keyword}</span>
            </h2>
            <ul className={styles.resultsList}>
                {results.map((result) => (
                    <li
                        key={result.id}
                        className={styles.resultItem}
                        onClick={() => handleResultClick(result)}
                    >
                        {result.type === "user" ? (
                            <>
                                <img
                                    src={result.avatar || "/default-avatar.png"}
                                    alt={result.name}
                                    className={styles.avatar}
                                />
                                <div>
                                    <p className={styles.resultName}>{result.name}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <p className={styles.resultName}>{result.name}</p>
                                    <p className={styles.resultDescription}>
                                        {result.description}
                                    </p>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
