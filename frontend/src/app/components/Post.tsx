// frontend/src/app/components/Post.tsx
import {useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {useLocale} from "next-intl"; // Lấy locale hiện tại
import {toast} from "react-toastify"; // Đảm bảo toast được import
import {useTranslations} from "next-intl"; // ✅ Thêm i18n
import styles from "./Post.module.css";
import DetailPostDialog from "./DetailPostDialog";
import ImagePreviewCarousel from "./image_preview/ImagePreviewCarousel";

export default function Post({
                                 author,
                                 username,
                                 content,
                                 time,
                                 images = [],
                                 hashcodeIDPost,
                             }: {
    author: string;
    username: string;
    content: string;
    time: string;
    images?: string[];
    hashcodeIDPost: string;
    onClick?: () => void;
}) {
    const router = useRouter();
    const locale = useLocale(); // Lấy locale hiện tại
    const t = useTranslations("Post"); // ✅ Thêm i18n cho Post
    const MAX_LENGTH = 100;
    const [isExpanded, setIsExpanded] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    const toggleLike = () => setLiked(!liked);
    const toggleContent = () => setIsExpanded(!isExpanded);

    const closePreview = () => setPreviewIndex(null);
    const showNextImage = () => {
        if (previewIndex !== null) {
            setPreviewIndex((prev) => (prev! + 1) % images.length);
        }
    };
    const showPreviousImage = () => {
        if (previewIndex !== null) {
            setPreviewIndex((prev) => (prev! - 1 + images.length) % images.length);
        }
    };

    const renderImages = () => {
        const numImages = images.length;
        if (numImages === 0) return null;
        if (numImages === 1) {
            return (
                <div className={styles.singleImageWrapper}>
                    <Image
                        src={images[0]}
                        alt="Post Image"
                        className={styles.singlePostImage}
                        width={500}
                        height={500}
                        onClick={() => setPreviewIndex(0)}
                        unoptimized
                        loading="lazy"
                    />
                </div>
            );
        }

        const displayImages = images.slice(0, 6);
        const isMoreImages = numImages > 6;

        return (
            <div className={styles.imageGrid}>
                {displayImages.map((image, index) => (
                    <div
                        key={index}
                        className={styles.imageWrapper}
                        onClick={() => setPreviewIndex(index)}
                    >
                        <Image
                            src={image}
                            alt={`Post Image ${index + 1}`}
                            className={styles.postImage}
                            width={200}
                            height={200}
                            unoptimized
                            loading="lazy"
                        />
                        {isMoreImages && index === 5 && (
                            <div className={styles.overlay}>
                                <span>+{numImages - 6}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Cập nhật hàm navigateToProfile để thêm locale vào URL
    const navigateToProfile = () => {
        router.push(`/${locale}/profile/${username}`);
    };

    // Hàm sao chép đường dẫn và hiển thị thông báo
    const handleShare = () => {
        const currentUrl = `${window.location.origin}/${locale}/${username}/post/${hashcodeIDPost}`;

        // Kiểm tra xem navigator.clipboard có hỗ trợ hay không
        if (navigator.clipboard) {
            // Dùng Clipboard API khi có hỗ trợ
            navigator.clipboard.writeText(currentUrl)
                .then(() => {
                    toast.success(t("share_copy_success"));
                })
                .catch((err) => {
                    toast.error(t("share_copy_error"));
                    console.error('Error copying to clipboard', err); // Xem chi tiết lỗi
                });
        } else {
            // Sử dụng phương pháp thủ công cho các trình duyệt không hỗ trợ clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = currentUrl;
            document.body.appendChild(textArea);
            textArea.select();  // Chọn toàn bộ văn bản trong textarea
            try {
                // Sử dụng phương pháp cũ document.execCommand('copy')
                document.execCommand('copy');
                toast.success(t("share_copy_success"));
            } catch (err) {
                toast.error(t("share_copy_error:" + err));
            }
            document.body.removeChild(textArea);  // Xóa textarea sau khi sao chép
        }
    };


    return (
        <div className={styles.post}>
            {/* Header */}
            <div className={styles.header}>
                <Image
                    src="/user-logo.png"
                    alt="User Avatar"
                    className={styles.avatar}
                    width={50}
                    height={50}
                    unoptimized
                    loading="lazy"
                    onClick={navigateToProfile}
                />
                <div className={styles.headerInfo}>
                    <div>
                        <p className={styles.author} onClick={navigateToProfile}>{author}</p>
                        <p className={styles.username} onClick={navigateToProfile}>{username}</p>
                    </div>
                    <p
                        className={styles.time}
                        onClick={() => setShowDialog(true)}
                    >
                        {time}
                    </p>
                </div>
                <div className={styles.moreOptions}>⋮</div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                <p>
                    {isExpanded
                        ? content
                        : content.length > MAX_LENGTH
                            ? content.slice(0, MAX_LENGTH) + "..."
                            : content}
                </p>
                {content.length > MAX_LENGTH && (
                    <button onClick={toggleContent} className={styles.toggleButton}>
                        {isExpanded ? t("view_less") : t("view_more")}
                    </button>
                )}
            </div>

            {/* Images */}
            {renderImages()}

            {/* Actions */}
            <div className={styles.actions}>
                <div className={styles.action} onClick={toggleLike}>
                    <Image
                        src={liked ? "/icon/heart-like-solid.svg" : "/icon/heart-like-no-solid.svg"}
                        alt={t("like")}
                        className={styles.icon}
                        width={28}
                        height={28}
                        unoptimized
                        loading="lazy"
                    />
                    {liked ? `13 ${t("liked")}` : `12 ${t("like")}`}
                </div>

                <div className={styles.action} onClick={() => setShowDialog(true)}>
                    <Image
                        src="/icon/comment.svg"
                        alt={t("comment")}
                        className={styles.icon}
                        width={28}
                        height={28}
                        unoptimized
                        loading="lazy"
                    />
                    25 {t("comment")}
                </div>

                <div className={styles.action} onClick={handleShare}>
                    <Image
                        src="/icon/share.svg"
                        alt={t("share")}
                        className={styles.icon}
                        width={28}
                        height={28}
                        unoptimized
                        loading="lazy"
                    />
                    {t("share")}
                </div>
            </div>

            {/* Detail Post Dialog */}
            {showDialog && (
                <DetailPostDialog
                    author={author}
                    username={username}
                    time={time}
                    images={images}
                    content={content}
                    hashcodeIDPost={hashcodeIDPost}
                    onClose={() => setShowDialog(false)}
                />
            )}

            {/* Image Preview */}
            {previewIndex !== null && (
                <ImagePreviewCarousel
                    images={images}
                    currentIndex={previewIndex}
                    onClose={closePreview}
                    onNext={showNextImage}
                    onPrevious={showPreviousImage}
                />
            )}
        </div>
    );
}
