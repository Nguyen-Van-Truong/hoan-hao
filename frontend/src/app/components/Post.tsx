import {useState, useRef, useEffect} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {toast} from "react-toastify";
import styles from "./Post.module.css";
import DetailPostDialog from "./DetailPostDialog";
import ImagePreviewCarousel from "./image_preview/ImagePreviewCarousel";

interface PostProps {
    author: string;
    username: string;
    avatarUrl: string;
    content: string;
    time: string;
    images?: string[];
    hashcodeIDPost: string;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    onUpdate: (postId: number, content: string, images: File[]) => Promise<void>;
}

export default function Post({
                                 author,
                                 username,
                                 avatarUrl,
                                 content,
                                 time,
                                 images = [],
                                 hashcodeIDPost,
                                 total_likes,
                                 total_comments,
                                 total_shares,
                                 onUpdate,
                             }: PostProps) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("Post");
    const MAX_LENGTH = 100;
    const MAX_IMAGES = 8; // Giới hạn tối đa 8 ảnh
    const [isExpanded, setIsExpanded] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const [editImages, setEditImages] = useState<File[]>([]);
    const optionsRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setShowOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const renderImages = () => {
        if (!images || images.length === 0) return null;
        console.log("Rendering images in Post:", images);

        if (images.length === 1) {
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

        const displayImages = images.slice(0, 8); // Hiển thị tối đa 8 ảnh
        const isMoreImages = images.length > 8;

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
                        {isMoreImages && index === 7 && (
                            <div className={styles.overlay}>
                                <span>+{images.length - 8}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const navigateToProfile = () => {
        router.push(`/${locale}/profile/${username}`);
    };

    const handleShare = () => {
        const currentUrl = `${window.location.origin}/${locale}/${username}/post/${hashcodeIDPost}`;
        navigator.clipboard
            .writeText(currentUrl)
            .then(() => toast.success(t("share_copy_success")))
            .catch(() => toast.error(t("share_copy_error")));
    };

    const handleSavePost = () => {
        toast.success(t("save_post_success"));
        setShowOptions(false);
    };

    const handleEditFiles = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/")); // Chỉ cho phép ảnh
        if (editImages.length + imageFiles.length > MAX_IMAGES) {
            toast.error(t("max_images_error", {max: MAX_IMAGES}));
            return;
        }
        if (files.some((file) => file.type.startsWith("video/"))) {
            toast.error(t("video_not_supported"));
            return;
        }
        setEditImages((prev) => [...prev, ...imageFiles]);
    };

    const handleEditSubmit = () => {
        const postId = parseInt(hashcodeIDPost.replace("post-", ""), 10);
        if (isNaN(postId)) {
            toast.error("Invalid post ID");
            return;
        }
        onUpdate(postId, editContent, editImages);
        setIsEditing(false);
        setShowOptions(false);
    };

    const handleCancelEdit = () => {
        setEditContent(content); // Reset về nội dung gốc
        setEditImages([]); // Xóa các ảnh mới chọn
        setIsEditing(false);
        setShowOptions(false);
    };

    return (
        <div className={styles.post}>
            <div className={styles.header}>
                <Image
                    src={avatarUrl}
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
                        <p className={styles.author} onClick={navigateToProfile}>
                            {author}
                        </p>
                        <p className={styles.username} onClick={navigateToProfile}>
                            {username}
                        </p>
                    </div>
                    <p className={styles.time} onClick={() => setShowDialog(true)}>
                        {time}
                    </p>
                </div>
                <div className={styles.moreOptions} ref={optionsRef}>
                    <button className={styles.moreButton} onClick={() => setShowOptions(!showOptions)}>
                        ⋮
                    </button>
                    {showOptions && (
                        <div className={styles.optionsMenu}>
                            <button onClick={handleSavePost}>{t("save_post")}</button>
                            <button onClick={() => setIsEditing(true)}>{t("edit_post")}</button>
                        </div>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className={styles.editContainer}>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={styles.editInput}
                        placeholder={t("edit_post_placeholder")}
                    />
                    <div className={styles.editImageUpload}>
                        <label htmlFor={`editFileInput-${hashcodeIDPost}`} className={styles.uploadLabel}>
                            <Image
                                src="/icon/icon_choose_image.svg"
                                alt={t("image_select_icon_alt")}
                                width={30}
                                height={30}
                                unoptimized
                            />
                            <span>{t("add_images")}</span>
                        </label>
                        <input
                            id={`editFileInput-${hashcodeIDPost}`}
                            type="file"
                            multiple
                            accept="image/*" // Chỉ cho phép ảnh
                            onChange={(e) => handleEditFiles(Array.from(e.target.files || []))}
                            className={styles.hiddenInput}
                        />
                    </div>
                    <div className={styles.previewImages}>
                        {editImages.map((file, index) => (
                            <div key={index} className={styles.previewImageWrapper}>
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt={`preview-${index}`}
                                    width={80}
                                    height={80}
                                    className={styles.previewImage}
                                    loading="lazy"
                                />
                                <button
                                    className={styles.removeImage}
                                    onClick={() => setEditImages((prev) => prev.filter((_, i) => i !== index))}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className={styles.editActions}>
                        <button className={styles.saveButton} onClick={handleEditSubmit}>
                            {t("save")}
                        </button>
                        <button className={styles.cancelButton} onClick={handleCancelEdit}>
                            {t("cancel")}
                        </button>
                    </div>
                </div>
            ) : (
                <>
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

                    {renderImages()}

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
                            {liked ? `${total_likes + 1} ${t("liked")}` : `${total_likes} ${t("like")}`}
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
                            {total_comments} {t("comment")}
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
                            {total_shares} {t("share")}
                        </div>
                    </div>
                </>
            )}

            {showDialog && (
                <DetailPostDialog
                    author={author}
                    username={username}
                    avatarUrl={avatarUrl}
                    time={time}
                    images={images}
                    content={content}
                    hashcodeIDPost={hashcodeIDPost}
                    total_likes={total_likes}
                    total_comments={total_comments}
                    total_shares={total_shares}
                    onClose={() => setShowDialog(false)}
                />
            )}

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