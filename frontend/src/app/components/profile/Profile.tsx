// frontend/src/app/components/profile/Profile.tsx
import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./Profile.module.css";
import Image from "next/image";
import PostsTab from "@/app/components/profile/PostsTab";
import PhotosTab from "@/app/components/profile/PhotosTab";
import VideosTab from "@/app/components/profile/VideosTab";
import EditProfileDialog from "@/app/components/profile/EditProfileDialog";

export default function Profile({ username, isOwnProfile }: { username: string; isOwnProfile: boolean }) {
    const [activeTab, setActiveTab] = useState("posts");
    const [showEditDialog, setShowEditDialog] = useState(false);
    const t = useTranslations("Profile");

    // Dữ liệu giả lập từ user_profiles
    const mockProfileData = {
        username: username,
        full_name: "John Doe",
        bio: "Đây là một lập trình viên yêu thích học hỏi và phát triển dự án.",
        location: "Hà Nội",
        website: "https://example.com",
        profile_picture_url: "/user-logo.png",
        friend_count: 123,
    };

    const renderContent = () => {
        switch (activeTab) {
            case "posts":
                return <PostsTab />;
            case "photos":
                return <PhotosTab />;
            case "videos":
                return <VideosTab />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.profile}>
            <div className={styles.infoSection}>
                <Image
                    src={mockProfileData.profile_picture_url}
                    alt={t("avatar_alt")}
                    width={150}
                    height={150}
                    className={styles.avatar}
                    unoptimized
                />
                <h1>{mockProfileData.full_name || mockProfileData.username}</h1>
                <p className={styles.description}>{mockProfileData.bio}</p>
                {mockProfileData.location && (
                    <p className={styles.location}>{t("location", { location: mockProfileData.location })}</p>
                )}
                <p className={styles.friendCount}>{t("friends_count", { count: mockProfileData.friend_count })}</p>
                {mockProfileData.website && (
                    <a href={mockProfileData.website} className={styles.website} target="_blank" rel="noopener noreferrer">
                        {mockProfileData.website}
                    </a>
                )}
                {isOwnProfile && (
                    <button className={styles.editProfileButton} onClick={() => setShowEditDialog(true)}>
                        {t("edit_profile")}
                    </button>
                )}
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === "posts" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("posts")}
                >
                    {t("posts")}
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === "photos" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("photos")}
                >
                    {t("photos")}
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === "videos" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("videos")}
                >
                    {t("videos")}
                </button>
            </div>

            <div className={styles.contentSection}>{renderContent()}</div>

            {showEditDialog && (
                <EditProfileDialog
                    onClose={() => setShowEditDialog(false)}
                    currentName={mockProfileData.full_name || mockProfileData.username}
                    currentDescription={mockProfileData.bio}
                    currentAvatar={mockProfileData.profile_picture_url}
                />
            )}
        </div>
    );
}