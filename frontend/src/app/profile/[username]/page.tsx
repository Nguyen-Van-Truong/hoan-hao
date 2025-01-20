// frontend/src/app/profile/[username]/page.tsx
"use client";

import Layout from "@/app/components/Layout";
import Profile from "@/app/components/Profile";
import { use } from "react";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params); // Giải nén params bằng hook use
    const currentUser = "my-profile"; // Người dùng hiện tại (có thể lấy từ session hoặc context)

    const isOwnProfile = username === currentUser; // Kiểm tra xem có phải profile cá nhân không

    return (
        <Layout>
            <Profile username={username} isOwnProfile={isOwnProfile} />
        </Layout>
    );
}
