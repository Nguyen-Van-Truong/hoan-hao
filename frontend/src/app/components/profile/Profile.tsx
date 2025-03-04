// frontend/src/app/components/profile/Profile.tsx
import {useState, useEffect} from "react";
import {useTranslations} from "next-intl";
import styles from "./Profile.module.css";
import Image from "next/image";
import PostsTab from "@/app/components/profile/PostsTab";
import PhotosTab from "@/app/components/profile/PhotosTab";
import VideosTab from "@/app/components/profile/VideosTab";
import EditProfileDialog from "@/app/components/profile/EditProfileDialog";
import {getMyProfile, getPublicProfileByUsername} from "@/app/api/userApi"; // Cập nhật import

type ProfileData = {
    id: number;
    username: string;
    full_name: string;
    bio: string;
    location: string;
    website: string;
    profile_picture_url: string;
    friend_count?: number;
};

export default function Profile({username, isOwnProfile}: { username: string; isOwnProfile: boolean }) {
    const [activeTab, setActiveTab] = useState("posts");
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations("Profile");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let data;
                if (isOwnProfile) {
                    data = await getMyProfile();
                } else {
                    data = await getPublicProfileByUsername(username); // Sử dụng username thay vì ID
                }
                setProfileData({
                    id: data.id,
                    username: data.username,
                    full_name: data.full_name,
                    bio: data.bio || "",
                    location: data.location || "",
                    website: data.website || "",
                    profile_picture_url: data.profile_picture_url || "/user-logo.png",
                    friend_count: data.friend_count || 0,
                });
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Lỗi không xác định");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, isOwnProfile]);

    const renderContent = () => {
        switch (activeTab) {
            case "posts":
                return <PostsTab/>;
            case "photos":
                return <PhotosTab/>;
            case "videos":
                return <VideosTab/>;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className={styles.profile}>Đang tải...</div>;
    }

    if (error || !profileData) {
        return <div className={styles.profile}>Lỗi: {error || "Không tìm thấy thông tin profile"}</div>;
    }

    return (
        <div className={styles.profile}>
            <div className={styles.infoSection}>
                <Image
                    src={profileData.profile_picture_url}
                    alt={t("avatar_alt")}
                    width={150}
                    height={150}
                    className={styles.avatar}
                    unoptimized
                />
                <h1>{profileData.full_name || profileData.username}</h1>
                <p className={styles.description}>{profileData.bio}</p>
                {profileData.location && (
                    <p className={styles.location}>{t("location", {location: profileData.location})}</p>
                )}
                <p className={styles.friendCount}>{t("friends_count", {count: profileData.friend_count})}</p>
                {profileData.website && (
                    <a href={profileData.website} className={styles.website} target="_blank" rel="noopener noreferrer">
                        {profileData.website}
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
                    currentName={profileData.full_name || profileData.username}
                    currentDescription={profileData.bio}
                    currentAvatar={profileData.profile_picture_url}
                />
            )}
        </div>
    );
}