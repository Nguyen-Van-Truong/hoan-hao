import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { fetchCommentsByPostId, createComment, replyComment, likePost, unlikePost, likeComment, unlikeComment } from "../api/postApi";
import styles from "./DetailPostDialog.module.css";
import ImagePreviewSingle from "./image_preview/ImagePreviewSingle";
import ImagePreviewCarousel from "./image_preview/ImagePreviewCarousel";

interface DetailPostDialogProps {
    author: string;
    username: string;
    avatarUrl: string;
    time: string;
    images: string[];
    content: string;
    hashcodeIDPost: string;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    onClose: () => void;
}

interface Comment {
    id: number;
    author: {
        full_name: string;
        username: string;
        profile_picture_url: string;
    };
    time: string;
    content: string;
    image?: string | null;
    parent_comment_id?: number | null;
    replies?: Comment[];
    liked?: boolean;
    likeCount?: number;
}

export default function DetailPostDialog({
                                             author,
                                             username,
                                             avatarUrl,
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
    const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [previewCommentImage, setPreviewCommentImage] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(total_likes);
    const [isExpanded, setIsExpanded] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const locale = useLocale();
    const t = useTranslations("DetailPostDialog");
    const MAX_LENGTH = 100;
    const LIMIT = 10;

    const postId = parseInt(hashcodeIDPost.replace("post-", ""), 10);

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
            try {
                const { comments: fetchedComments, total } = await fetchCommentsByPostId(postId, LIMIT, 0);
                const transformedComments = fetchedComments.map((c) => ({
                    id: c.id,
                    author: {
                        full_name: c.author.full_name,
                        username: c.author.username,
                        profile_picture_url: c.author.profile_picture_url,
                    },
                    time: new Date(c.created_at).toLocaleString(),
                    content: c.content,
                    image: null,
                    parent_comment_id: c.parent_comment_id,
                    replies: [],
                    liked: false,
                    likeCount: c.likes?.length ?? 0,
                }));
                const nestedComments = nestComments(transformedComments);
                setComments(nestedComments);
                setOffset(LIMIT);
                setHasMoreComments(transformedComments.length === LIMIT && LIMIT < total);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                toast.error(`${t("fetch_comments_error")}: ${errorMessage}`);
            }
        };
        loadInitialComments();
    }, [postId, t]);

    const nestComments = (comments: Comment[]): Comment[] => {
        const commentMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];

        comments.forEach((comment) => {
            comment.replies = [];
            commentMap.set(comment.id, comment);
        });

        comments.forEach((comment) => {
            if (comment.parent_comment_id) {
                const parent = commentMap.get(comment.parent_comment_id);
                if (parent) {
                    parent.replies!.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        return rootComments;
    };

    const toggleContent = () => setIsExpanded(!isExpanded);

    const addComment = async () => {
        if (!newComment.trim() && !newCommentImage) return;

        try {
            if (replyToCommentId) {
                const newReply = await replyComment(replyToCommentId, newComment.trim());
                const transformedReply: Comment = {
                    id: newReply.id,
                    author: {
                        full_name: newReply.author.full_name,
                        username: newReply.author.username,
                        profile_picture_url: newReply.author.profile_picture_url,
                    },
                    time: new Date(newReply.created_at).toLocaleString(),
                    content: newReply.content,
                    image: newCommentImage,
                    parent_comment_id: newReply.parent_comment_id,
                    replies: [],
                    liked: false,
                    likeCount: 0,
                };
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === replyToCommentId
                            ? { ...c, replies: [transformedReply, ...(c.replies || [])] }
                            : c
                    )
                );
            } else {
                const newCommentData = await createComment(postId, newComment.trim());
                const transformedComment: Comment = {
                    id: newCommentData.id,
                    author: {
                        full_name: newCommentData.author.full_name,
                        username: newCommentData.author.username,
                        profile_picture_url: newCommentData.author.profile_picture_url,
                    },
                    time: new Date(newCommentData.created_at).toLocaleString(),
                    content: newCommentData.content,
                    image: newCommentImage,
                    parent_comment_id: null,
                    replies: [],
                    liked: false,
                    likeCount: 0,
                };
                setComments((prev) => [transformedComment, ...prev]);
            }
            setNewComment("");
            setNewCommentImage(null);
            setReplyToCommentId(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(`${t("create_comment_error")}: ${errorMessage}`);
        }
    };

    const loadMoreComments = async () => {
        if (isLoadingMore || !hasMoreComments) return;
        setIsLoadingMore(true);
        try {
            const { comments: fetchedComments, total } = await fetchCommentsByPostId(postId, LIMIT, offset);
            const transformedComments = fetchedComments.map((c) => ({
                id: c.id,
                author: {
                    full_name: c.author.full_name,
                    username: c.author.username,
                    profile_picture_url: c.author.profile_picture_url,
                },
                time: new Date(c.created_at).toLocaleString(),
                content: c.content,
                image: null,
                parent_comment_id: c.parent_comment_id,
                replies: [],
                liked: false,
                likeCount: c.likes?.length ?? 0,
            }));
            const nestedComments = nestComments([...comments, ...transformedComments]);
            setComments(nestedComments);
            setOffset((prev) => prev + LIMIT);
            setHasMoreComments(transformedComments.length === LIMIT && offset + LIMIT < total);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(`${t("fetch_comments_error")}: ${errorMessage}`);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const toggleLike = async () => {
        try {
            if (liked) {
                await unlikePost(postId);
                setLikeCount((prev) => prev - 1);
            } else {
                await likePost(postId);
                setLikeCount((prev) => prev + 1);
            }
            setLiked(!liked);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (errorMessage.includes("Duplicate entry")) {
                toast.error(t("already_liked"));
            } else {
                toast.error(`${t("like_error")}: ${errorMessage}`);
            }
        }
    };

    const toggleCommentLike = async (commentId: number, currentLiked: boolean, currentLikeCount: number) => {
        try {
            if (currentLiked) {
                await unlikeComment(commentId);
                updateCommentLike(commentId, false, currentLikeCount - 1);
            } else {
                await likeComment(commentId);
                updateCommentLike(commentId, true, currentLikeCount + 1);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (errorMessage.includes("Duplicate entry")) {
                toast.error(t("already_liked_comment"));
            } else {
                toast.error(`${t("like_comment_error")}: ${errorMessage}`);
            }
        }
    };

    const updateCommentLike = (commentId: number, liked: boolean, likeCount: number) => {
        const updateComments = (comments: Comment[]): Comment[] =>
            comments.map((c) => {
                if (c.id === commentId) {
                    return { ...c, liked, likeCount };
                }
                if (c.replies) {
                    return { ...c, replies: updateComments(c.replies) };
                }
                return c;
            });
        setComments((prev) => updateComments(prev));
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

    const renderComments = (comments: Comment[], depth = 0) => {
        return comments.map((comment) => (
            <div key={comment.id} className={styles.commentWrapper} style={{ marginLeft: `${depth * 20}px` }}>
                <Image
                    src={comment.author.profile_picture_url}
                    alt={t("avatar_alt")}
                    width={40}
                    height={40}
                    className={styles.commentAvatar}
                    style={{ borderRadius: "50%" }}
                    loading="lazy"
                    unoptimized
                />
                <div className={styles.commentContent}>
                    <div className={styles.commentHeader}>
                        <span className={styles.commentName}>{comment.author.full_name}</span>
                    </div>
                    <p className={styles.commentText}>{comment.content}</p>
                    <div className={styles.commentActions}>
                        <button
                            className={styles.replyButton}
                            onClick={() => setReplyToCommentId(comment.id)}
                        >
                            {t("reply")}
                        </button>
                        <div
                            className={styles.likeButton}
                            onClick={() => toggleCommentLike(comment.id, comment.liked ?? false, comment.likeCount ?? 0)}
                        >
                            <Image
                                src={comment.liked ? "/icon/heart-like-solid.svg" : "/icon/heart-like-no-solid.svg"}
                                alt={t("like")}
                                width={16}
                                height={16}
                                className={styles.likeIcon}
                                loading="lazy"
                                unoptimized
                            />
                            <span>{comment.likeCount ?? 0}</span>
                        </div>
                    </div>
                    <span className={styles.commentTime}>{comment.time}</span>
                </div>
                {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, depth + 1)}
            </div>
        ));
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
                            src={avatarUrl}
                            alt={t("avatar_alt")}
                            width={50}
                            height={50}
                            className={styles.postAvatar}
                            style={{ borderRadius: "50%" }}
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
                                    style={{ objectFit: "cover" }}
                                    loading="lazy"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.actions}>
                        <div className={styles.action} onClick={toggleLike}>
                            <Image
                                src={liked ? "/icon/heart-like-solid.svg" : "/icon/heart-like-no-solid.svg"}
                                alt={t("like")}
                                width={28}
                                height={28}
                                className={styles.icon}
                                loading="lazy"
                                unoptimized
                            />
                            {likeCount} {liked ? t("liked") : t("like")}
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
                    <div className={styles.commentSection}>{renderComments(comments)}</div>
                    {hasMoreComments && (
                        <div className={styles.loadMoreWrapper}>
                            <button
                                className={styles.loadMoreButton}
                                onClick={loadMoreComments}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? t("loading") : t("view_more_comments")}
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.footer}>
                    <textarea
                        placeholder={replyToCommentId ? t("write_reply") : t("write_comment")}
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
                    {replyToCommentId && (
                        <button
                            className={styles.cancelReplyButton}
                            onClick={() => setReplyToCommentId(null)}
                        >
                            {t("cancel_reply")}
                        </button>
                    )}
                </div>
                {newCommentImage && (
                    <div className={styles.previewImageWrapper}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                            <Image
                                src={newCommentImage}
                                alt={t("image_preview")}
                                width={100}
                                height={100}
                                className={styles.commentPreviewImage}
                                style={{ objectFit: "cover", borderRadius: "8px" }}
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