// frontend/src/app/components/DetailPostDialog.tsx
import {useState, useEffect, useRef} from "react";
import Image from "next/image";
import {useLocale, useTranslations} from "next-intl";
import {toast} from "react-toastify";
import styles from "./DetailPostDialog.module.css";
import ImagePreviewSingle from "./image_preview/ImagePreviewSingle";
import ImagePreviewCarousel from "./image_preview/ImagePreviewCarousel";

interface Comment {
    avatar: string;
    name: string;
    time: string;
    content: string;
    image?: string | null;
}

interface DetailPostDialogProps {
    author: string;
    username: string;
    time: string;
    images: string[];
    content: string;
    hashcodeIDPost: string;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    onClose: () => void;
}

export default function DetailPostDialog({
                                             author,
                                             username,
                                             time,
                                             images,
                                             content,
                                             hashcodeIDPost,
                                             total_likes,
                                             total_comments,
                                             total_shares,
                                             onClose,
                                         }: DetailPostDialogProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [newCommentImage, setNewCommentImage] = useState<string | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [previewCommentImage, setPreviewCommentImage] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [liked, setLiked] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const locale = useLocale();
    const t = useTranslations("DetailPostDialog");
    const MAX_LENGTH = 100;

    useEffect(() => {
        const truncatedContent =
            content.length > MAX_LENGTH ? `${content.slice(0, MAX_LENGTH)}...` : content;
        const newUrl = `/${locale}/${username}/post/${hashcodeIDPost}`;
        window.history.pushState(null, "", newUrl);
        document.title = `${author} - ${truncatedContent} - Hoàn Hảo`;

        return () => {
            window.history.pushState(null, "", window.location.origin);
            document.title = "Hoàn Hảo";
        };
    }, [author, username, content, hashcodeIDPost, locale]);

    useEffect(() => {
        const loadInitialComments = async () => {
            const initialComments = await fetchMoreComments(0);
            setComments(initialComments);
        };
        loadInitialComments();
    }, []);

    const fetchMoreComments = async (currentCount: number): Promise<Comment[]> => {
        await new Promise((res) => setTimeout(res, 1000));
        return [
            {
                avatar: "/user-logo.png",
                name: `Người dùng ${currentCount + 1}`,
                time: "Vừa xong",
                content: "Bình luận mới.",
                image: currentCount % 2 === 0 ? "/logo.png" : null,
            },
            {
                avatar: "/user-logo.png",
                name: `Người dùng ${currentCount + 2}`,
                time: "1 phút trước",
                content: "Một bình luận nữa.",
                image: null,
            },
            {
                avatar: "/user-logo.png",
                name: `Người dùng ${currentCount + 3}`,
                time: "5 phút trước",
                content: "Lại một bình luận mới.",
                image: "/1234.jpg",
            },
        ];
    };

    const toggleContent = () => setIsExpanded(!isExpanded);
    const addComment = () => {
        if (!newComment.trim() && !newCommentImage) return;
        const newCommentData: Comment = {
            avatar: "/user-logo.png",
            name: "Bạn",
            time: "Vừa xong",
            content: newComment.trim(),
            image: newCommentImage,
        };
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
        setNewCommentImage(null);
    };

    const loadMoreComments = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        const moreComments = await fetchMoreComments(comments.length);
        setComments((prev) => [...prev, ...moreComments]);
        setIsLoadingMore(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleShare = () => {
        const currentUrl = `${window.location.origin}/${locale}/${username}/post/${hashcodeIDPost}`;
        navigator.clipboard
            .writeText(currentUrl)
            .then(() => toast.success(t("share_copy_success")))
            .catch(() => toast.error(t("share_copy_error")));
    };

    return (
        <div className={styles.dialog}>
            <div className={styles.dialogContent} ref={dialogRef}>
                <div className={styles.header}>
                    <span>{t("post_of")} {author}</span>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✖
                    </button>
                </div>
                <div className={styles.body}>
                    <div className={styles.postInfo}>
                        <Image
                            src="/user-logo.png"
                            alt={t("avatar_alt")}
                            width={50}
                            height={50}
                            className={styles.postAvatar}
                            style={{borderRadius: "50%"}}
                            loading="lazy"
                            unoptimized
                        />
                        <div className={styles.postHeaderInfo}>
                            <p className={styles.postAuthor}>{author}</p>
                            <p className={styles.postUsername}>{username}</p>
                            <p className={styles.postTime}>{time}</p>
                        </div>
                    </div>
                    <div className={styles.postDescription}>
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
                    <div className={images.length === 1 ? styles.singleImageWrapper : styles.imageGrid}>
                        {images.map((img, index) => (
                            <div key={index} className={styles.imageWrapper}>
                                <Image
                                    src={img}
                                    alt={`Post Image ${index + 1}`}
                                    width={200}
                                    height={200}
                                    className={styles.dialogImage}
                                    onClick={() => setPreviewIndex(index)}
                                    style={{objectFit: "cover"}}
                                    loading="lazy"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.actions}>
                        <div className={styles.action} onClick={() => setLiked(!liked)}>
                            <Image
                                src={liked ? "/icon/heart-like-solid.svg" : "/icon/heart-like-no-solid.svg"}
                                alt={t("like")}
                                width={28}
                                height={28}
                                className={styles.icon}
                                loading="lazy"
                                unoptimized
                            />
                            {liked ? `${total_likes + 1} ${t("liked")}` : `${total_likes} ${t("like")}`}
                        </div>
                        <div className={styles.action}>
                            <Image
                                src="/icon/comment.svg"
                                alt={t("comment")}
                                width={28}
                                height={28}
                                className={styles.icon}
                                loading="lazy"
                                unoptimized
                            />
                            {total_comments} {t("comment")}
                        </div>
                        <div className={styles.action} onClick={handleShare}>
                            <Image
                                src="/icon/share.svg"
                                alt={t("share")}
                                width={28}
                                height={28}
                                className={styles.icon}
                                loading="lazy"
                                unoptimized
                            />
                            {total_shares} {t("share")}
                        </div>
                    </div>
                    <div className={styles.commentSection}>
                        {comments.map((comment, index) => (
                            <div key={index} className={styles.commentWrapper}>
                                <Image
                                    src={comment.avatar}
                                    alt={t("avatar_alt")}
                                    width={40}
                                    height={40}
                                    className={styles.commentAvatar}
                                    style={{borderRadius: "50%"}}
                                    loading="lazy"
                                    unoptimized
                                />
                                <div className={styles.commentContent}>
                                    <div className={styles.commentHeader}>
                                        <span className={styles.commentName}>{comment.name}</span>
                                    </div>
                                    <p className={styles.commentText}>{comment.content}</p>
                                    {comment.image && (
                                        <Image
                                            src={comment.image}
                                            alt={t("image_preview")}
                                            width={100}
                                            height={100}
                                            className={styles.commentImage}
                                            onClick={() => setPreviewCommentImage(comment.image || null)}
                                            style={{objectFit: "cover"}}
                                            loading="lazy"
                                            unoptimized
                                        />
                                    )}
                                    <span className={styles.commentTime}>{comment.time}</span>
                                </div>
                            </div>
                        ))}
                        <div className={styles.loadMoreWrapper}>
                            <button
                                className={styles.loadMoreButton}
                                onClick={loadMoreComments}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? t("loading") : t("view_more_comments")}
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.footer}>
                    <textarea
                        placeholder={t("write_comment")}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                addComment();
                            }
                        }}
                        onPaste={(e) => {
                            const items = e.clipboardData.items;
                            for (const item of items) {
                                if (item.type.startsWith("image/")) {
                                    const file = item.getAsFile();
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => setNewCommentImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }
                            }
                        }}
                        className={styles.commentTextarea}
                    />
                    <label className={styles.imageUploadLabel}>
                        📷
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => setNewCommentImage(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className={styles.imageUploadInput}
                        />
                    </label>
                    <button
                        className={styles.commentButton}
                        onClick={addComment}
                        disabled={!newComment.trim() && !newCommentImage}
                    >
                        ➤
                    </button>
                </div>
                {newCommentImage && (
                    <div className={styles.previewImageWrapper}>
                        <div style={{position: "relative", display: "inline-block"}}>
                            <Image
                                src={newCommentImage}
                                alt={t("image_preview")}
                                width={100}
                                height={100}
                                className={styles.commentPreviewImage}
                                style={{objectFit: "cover", borderRadius: "8px"}}
                                unoptimized
                            />
                            <button
                                className={styles.removeImageButton}
                                onClick={() => setNewCommentImage(null)}
                            >
                                ✖
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {previewIndex !== null && (
                <ImagePreviewCarousel
                    images={images}
                    currentIndex={previewIndex}
                    onClose={() => setPreviewIndex(null)}
                    onNext={() => setPreviewIndex((prev) => (prev! + 1) % images.length)}
                    onPrevious={() => setPreviewIndex((prev) => (prev! - 1 + images.length) % images.length)}
                />
            )}
            {previewCommentImage && (
                <ImagePreviewSingle
                    imageSrc={previewCommentImage}
                    onClose={() => setPreviewCommentImage(null)}
                />
            )}
        </div>
    );
}