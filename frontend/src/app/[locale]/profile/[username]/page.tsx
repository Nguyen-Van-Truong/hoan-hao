// frontend/src/app/[lang]/profile/[username]/page.tsx
"use client";

import Layout from "@/app/layout/Layout";
import Profile from "@/app/components/profile/Profile";
import {use} from "react";
import {useContext} from "react";
import {UserContext} from "@/app/providers";

export default function ProfilePage({params}: { params: Promise<{ username: string }> }) {
    const {username} = use(params);
    const currentUser = useContext(UserContext);

    const isOwnProfile = currentUser?.username === username;

    return (
        <Layout>
            <Profile username={username} isOwnProfile={isOwnProfile}/>
        </Layout>
    );
}