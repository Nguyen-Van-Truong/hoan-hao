// frontend/src/app/components/SearchResults.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl"; // ✅ Thêm i18n
import styles from "./SearchResults.module.css";
import Image from "next/image";

interface SearchResult {
    id: number;
    type: "user" | "post";
    name: string;
    description?: string;
    avatar?: string;
    author?: string;
    hashcodeIDPost?: string;
}

const mockSearchResults = (keyword: string): Promise<SearchResult[]> => {
    return new Promise((resolve) =>
        setTimeout(() => {
            const results: SearchResult[] = [
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
    const t = useTranslations("SearchResults"); // ✅ Dùng next-intl để lấy nội dung dịch

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
            router.push(`/profile/${result.name}`);
        } else if (result.type === "post" && result.author && result.hashcodeIDPost) {
            router.push(`/${result.author}/post/${result.hashcodeIDPost}`);
        }
    };

    if (loading) {
        return <div className={styles.loading}>{t("loading")}</div>;
    }

    if (results.length === 0) {
        return (
            <div className={styles.noResults}>
                {t("no_results", { keyword })}
            </div>
        );
    }

    return (
        <div className={styles.resultsContainer}>
            <h2 className={styles.resultsHeader}>
                {t("search_results_for")} <span className={styles.keyword}>{keyword}</span>
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
                                <Image
                                    src={result.avatar || "/default-avatar.png"}
                                    alt={result.name}
                                    width={40}
                                    height={40}
                                    className={styles.avatar}
                                    loading={"lazy"}
                                />
                                <div>
                                    <p className={styles.resultName}>{result.name}</p>
                                    <p className={styles.resultDescription}>{t("profile")}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <p className={styles.resultName}>{result.name}</p>
                                    <p className={styles.resultDescription}>
                                        {result.description}
                                    </p>
                                    <p className={styles.resultDescription}>{t("post")}</p>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
