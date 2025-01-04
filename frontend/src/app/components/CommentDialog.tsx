import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./CommentDialog.module.css";
import ImagePreviewSingle from "./image_preview/ImagePreviewSingle";
import ImagePreviewCarousel from "./image_preview/ImagePreviewCarousel";

interface Comment {
    avatar: string;
    name: string;
    time: string;
    content: string;
    image?: string | null;
}

interface CommentDialogProps {
    author: string;
    role: string;
    time: string;
    images: string[];
    fetchMoreComments: (currentCount: number) => Promise<Comment[]>; // API call for comments
    onClose: () => void;
}

export default function CommentDialog({
                                          author,
                                          role,
                                          time,
                                          images,
                                          fetchMoreComments,
                                          onClose,
                                      }: CommentDialogProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [newCommentImage, setNewCommentImage] = useState<string | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [previewCommentImage, setPreviewCommentImage] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [liked, setLiked] = useState(false);

    // Load initial comments
    useEffect(() => {
        const loadInitialComments = async () => {
            const initialComments = await fetchMoreComments(0); // Fetch first 3 comments
            setComments(initialComments);
        };
        loadInitialComments();
    }, [fetchMoreComments]);

    const addComment = () => {
        const trimmedComment = newComment.trim();
        if (trimmedComment === "") return; // Prevent empty comments
        const newCommentData: Comment = {
            avatar: "/user-logo.png",
            name: "Bạn",
            time: "Vừa xong",
            content: trimmedComment,
            image: newCommentImage,
        };
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
        setNewCommentImage(null);
    };

    const loadMoreComments = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        const moreComments = await fetchMoreComments(comments.length); // Fetch more comments
        setComments((prev) => [...prev, ...moreComments]);
        setIsLoadingMore(false);
    };

    return (
        <div className={styles.dialog}>
            <div className={styles.dialogContent}>
                <div className={styles.header}>
                    <span>Bài viết của {author}</span>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✖
                    </button>
                </div>
                <div className={styles.body}>
                    {/* Author info */}
                    <div className={styles.postInfo}>
                        <Image
                            src="/user-logo.png"
                            alt="Author Avatar"
                            width={50}
                            height={50}
                            className={styles.postAvatar}
                            style={{borderRadius: "50%"}}
                            loading="lazy"
                            unoptimized
                        />
                        <div className={styles.postHeaderInfo}>
                            <p className={styles.postAuthor}>{author}</p>
                            <p className={styles.postRole}>{role}</p>
                            <p className={styles.postTime}>{time}</p>
                        </div>
                    </div>


                    {/* Post images */}
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
                                src={
                                    liked
                                        ? "/icon/heart-like-solid.svg"
                                        : "/icon/heart-like-no-solid.svg"
                                }
                                alt="Like"
                                width={28}
                                height={28}
                                className={styles.icon}
                                loading="lazy"
                                unoptimized
                            />
                            {liked ? "13 Thích" : "12 Thích"}
                        </div>
                        <div className={styles.action}>
                            <Image
                                src="/icon/share.svg"
                                alt="Share"
                                width={28}
                                height={28}
                                className={styles.icon}
                                loading="lazy"
                                unoptimized
                            />
                            {"187 Chia sẻ"}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className={styles.commentSection}>
                        {comments.map((comment, index) => (
                            <div key={index} className={styles.commentWrapper}>
                                <Image
                                    src={comment.avatar}
                                    alt="Avatar"
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
                                            alt="Comment Image"
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
                        {/* Load more comments */}
                        <div className={styles.loadMoreWrapper}>
                            <button
                                className={styles.loadMoreButton}
                                onClick={loadMoreComments}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? "Đang tải..." : "Xem thêm bình luận"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer for adding comments */}
                <div className={styles.footer}>
          <textarea
              placeholder="Viết bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // Prevent new line
                      addComment(); // Submit comment
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
                    <button className={styles.commentButton} onClick={addComment}>
                        ➤
                    </button>
                </div>
            </div>

            {/* Image preview */}
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
                <ImagePreviewSingle imageSrc={previewCommentImage} onClose={() => setPreviewCommentImage(null)} />
            )}
        </div>
    );
}
