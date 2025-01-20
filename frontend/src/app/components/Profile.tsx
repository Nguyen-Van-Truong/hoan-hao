// frontend/src/app/components/Profile.tsx
import { useState } from "react";
import styles from "./Profile.module.css";
import Image from "next/image";
import PostsTab from "@/app/components/profile/PostsTab";
import PhotosTab from "@/app/components/profile/PhotosTab";
import VideosTab from "@/app/components/profile/VideosTab";
import EditProfileDialog from "@/app/components/profile/EditProfileDialog";

export default function Profile({ username, isOwnProfile }: { username: string; isOwnProfile: boolean }) {
    const [activeTab, setActiveTab] = useState("posts");
    const [showEditDialog, setShowEditDialog] = useState(false);

    const currentDescription = "Đây là một lập trình viên yêu thích học hỏi và phát triển dự án.";
    const currentAvatar = "/user-logo.png";
    const friendCount = 123;

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
                    src={currentAvatar}
                    alt="Avatar"
                    width={150}
                    height={150}
                    className={styles.avatar}
                    unoptimized
                />
                <h1>{username}</h1>
                <p className={styles.description}>{currentDescription}</p>
                <p className={styles.friendCount}>Bạn bè: {friendCount}</p>
                {isOwnProfile && (
                    <button
                        className={styles.editProfileButton}
                        onClick={() => setShowEditDialog(true)}
                    >
                        Chỉnh sửa hồ sơ
                    </button>
                )}
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${
                        activeTab === "posts" ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("posts")}
                >
                    Bài viết
                </button>
                <button
                    className={`${styles.tabButton} ${
                        activeTab === "photos" ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("photos")}
                >
                    Ảnh
                </button>
                <button
                    className={`${styles.tabButton} ${
                        activeTab === "videos" ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("videos")}
                >
                    Video
                </button>
            </div>

            <div className={styles.contentSection}>{renderContent()}</div>

            {showEditDialog && (
                <EditProfileDialog
                    onClose={() => setShowEditDialog(false)}
                    currentName={username}
                    currentDescription={currentDescription}
                    currentAvatar={currentAvatar}
                />
            )}
        </div>
    );
}
