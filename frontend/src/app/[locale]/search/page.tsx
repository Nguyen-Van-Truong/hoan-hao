"use client";

import Layout from "@/app/layout/Layout";
import SearchResults from "@/app/components/SearchResults";
import { use } from "react";

export default function SearchResultsPage({
                                              searchParams,
                                          }: {
    searchParams: Promise<{ keyword?: string }>;
}) {
    const { keyword = "" } = use(searchParams); // Sử dụng `React.use()` để giải nén `searchParams`

    return (
        <Layout>
            <SearchResults keyword={keyword} />
        </Layout>
    );
}
