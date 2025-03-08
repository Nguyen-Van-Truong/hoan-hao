// frontend/src/app/[locale]/friends/list/page.tsx
"use client";

import Layout from "@/app/layout/Layout";
import MyFriends from "@/app/components/MyFriends";

export default function MyFriendsPage() {
    return (
        <Layout>
            <MyFriends />
        </Layout>
    );
}
