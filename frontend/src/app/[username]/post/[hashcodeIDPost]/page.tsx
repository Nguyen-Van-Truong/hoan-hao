// frontend/src/app/[username]/post/[hashcodeIDPost]/page.tsx
"use client";

import Layout from "@/app/components/Layout";
import MainContent from "@/app/components/MainContent";
import { use } from "react";

export default function PostDetailPage({
                                           params,
                                       }: {
    params: Promise<{ username: string; hashcodeIDPost: string }>;
}) {
    // Sử dụng `React.use()` để unwrap params
    const { username, hashcodeIDPost } = use(params);

    return (
        <Layout>
            <MainContent username={username} hashcodeIDPost={hashcodeIDPost} />
        </Layout>
    );
}
