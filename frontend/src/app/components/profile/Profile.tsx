import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import PostsTab from "./PostsTab";
import PhotosTab from "./PhotosTab";
import VideosTab from "./VideosTab";
import EditProfileDialog from "./EditProfileDialog";
import {
    getMyProfile,
    getPublicProfileByUsername,
    sendFriendRequest,
    cancelFriendRequest,
    blockUser,
    unblockUser,
    acceptFriendRequest
} from "@/app/api/userApi";
import styles from "./Profile.module.css";

type ProfileData = {
    id: number;
    username: string;
    full_name: string;
    bio: string;
    location: string;
    website: string;
    profile_picture_url: string;
    friend_count?: number;
    friend_status?: "SELF" | "NONE" | "PENDING" | "REQUESTED" | "FRIENDS" | "BLOCKED";
};

export default function Profile({ username, isOwnProfile }: { username: string; isOwnProfile: boolean }) {
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
                    setProfileData({
                        id: data.id,
                        username: data.username,
                        full_name: data.full_name,
                        bio: data.bio || "",
                        location: data.location || "",
                        website: data.website || "",
                        profile_picture_url: data.profile_picture_url || "/user-logo.png",
                        friend_count: data.friend_count || 0,
                        friend_status: "SELF",
                    });
                } else {
                    const response = await getPublicProfileByUsername(username);
                    setProfileData({
                        id: response.profile.id,
                        username: response.profile.username,
                        full_name: response.profile.full_name,
                        bio: response.profile.bio || "",
                        location: response.profile.location || "",
                        website: response.profile.website || "",
                        profile_picture_url: response.profile.profile_picture_url || "/user-logo.png",
                        friend_count: response.profile.friend_count || 0,
                        friend_status: response.friend_status || "NONE",
                    });
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Lỗi không xác định");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username, isOwnProfile]);

    const handleSendFriendRequest = async () => {
        if (!profileData) return;
        try {
            await sendFriendRequest(profileData.id);
            setProfileData({ ...profileData, friend_status: "PENDING" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể gửi yêu cầu kết bạn");
        }
    };

    const handleCancelFriendRequest = async () => {
        if (!profileData) return;
        try {
            await cancelFriendRequest(profileData.id);
            setProfileData({ ...profileData, friend_status: "NONE" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể hủy yêu cầu");
        }
    };

    const handleAcceptFriendRequest = async () => {
        if (!profileData) return;
        try {
            await acceptFriendRequest(profileData.id);
            setProfileData({ ...profileData, friend_status: "FRIENDS" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể chấp nhận yêu cầu");
        }
    };

    const handleBlockUser = async () => {
        if (!profileData) return;
        try {
            await blockUser(profileData.id);
            setProfileData({ ...profileData, friend_status: "BLOCKED" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể chặn người dùng");
        }
    };

    const handleUnblockUser = async () => {
        if (!profileData) return;
        try {
            await unblockUser(profileData.id);
            setProfileData({ ...profileData, friend_status: "NONE" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể hủy chặn người dùng");
        }
    };

    const handleRejectFriendRequest = async () => {
        if (!profileData) return;
        try {
            await cancelFriendRequest(profileData.id);
            setProfileData({ ...profileData, friend_status: "NONE" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể từ chối yêu cầu");
        }
    };

    const renderFriendActions = () => {
        if (isOwnProfile || !profileData) return null;

        switch (profileData.friend_status) {
            case "NONE":
                return (
                    <div className={styles.actions}>
                        <button className={styles.actionButton} onClick={handleSendFriendRequest}>
                            {t("add_friend")}
                        </button>
                        <button className={styles.actionButton} onClick={handleBlockUser}>
                            {t("block")}
                        </button>
                    </div>
                );
            case "PENDING":
                return (
                    <div className={styles.actions}>
                        <span className={styles.statusText}>{t("pending")}</span>
                        <button className={styles.actionButton} onClick={handleCancelFriendRequest}>
                            {t("cancel_request")}
                        </button>
                        <button className={styles.actionButton} onClick={handleBlockUser}>
                            {t("block")}
                        </button>
                    </div>
                );
            case "REQUESTED":
                return (
                    <div className={styles.actions}>
                        <span className={styles.statusText}>{t("requested")}</span>
                        <button className={styles.actionButton} onClick={handleAcceptFriendRequest}>
                            {t("accept")}
                        </button>
                        <button className={styles.actionButton} onClick={handleRejectFriendRequest}>
                            {t("reject")}
                        </button>
                        <button className={styles.actionButton} onClick={handleBlockUser}>
                            {t("block")}
                        </button>
                    </div>
                );
            case "FRIENDS":
                return (
                    <div className={styles.actions}>
                        <span className={styles.statusText}>{t("friends")}</span>
                        <button className={styles.actionButton} onClick={handleBlockUser}>
                            {t("block")}
                        </button>
                    </div>
                );
            case "BLOCKED":
                return (
                    <div className={styles.actions}>
                        <span className={styles.statusText}>{t("blocked")}</span>
                        <button className={styles.actionButton} onClick={handleUnblockUser}>
                            {t("unblock")}
                        </button>
                    </div>
                );
            default:
                return null;
        }
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

    if (loading) return <div className={styles.profile}>Đang tải...</div>;
    if (error || !profileData) return <div className={styles.profile}>Lỗi: {error || "Không tìm thấy profile"}</div>;

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
                {profileData.location && <p>{t("location", { location: profileData.location })}</p>}
                <p>{t("friends_count", { count: profileData.friend_count })}</p>
                {profileData.website && (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className={styles.website}>
                        {profileData.website}
                    </a>
                )}
                <div className={styles.actions}>
                    {isOwnProfile ? (
                        <button className={styles.editButton} onClick={() => setShowEditDialog(true)}>
                            {t("edit_profile")}
                        </button>
                    ) : (
                        renderFriendActions()
                    )}
                </div>
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