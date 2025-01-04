import { useState } from "react";
import Image from "next/image";
import styles from "./CommentDialog.module.css";
import ImagePreviewSingle from "./image_preview/ImagePreviewSingle";
import ImagePreviewCarousel from "./image_preview/ImagePreviewCarousel";

interface CommentDialogProps {
    author: string;
    role: string;
    time: string;
    images: string[];
    initialComments: {
        avatar: string;
        name: string;
        time: string;
        content: string;
        image?: string | null;
    }[];
    onClose: () => void;
}

export default function CommentDialog({
                                          author,
                                          role,
                                          time,
                                          images,
                                          initialComments,
                                          onClose,
                                      }: CommentDialogProps) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const [newCommentImage, setNewCommentImage] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [shared, setShared] = useState(false);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [previewCommentImage, setPreviewCommentImage] = useState<string | null>(null);

    const addComment = () => {
        if (newComment.trim() === "") return;
        const newCommentData = {
            avatar: "/user-logo.png",
            name: "Bạn",
            time: "Vừa xong",
            content: newComment,
            image: newCommentImage,
        };
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
        setNewCommentImage(null);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setNewCommentImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const closePreview = () => {
        setPreviewIndex(null);
        setPreviewCommentImage(null);
    };

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
                    <div className={styles.authorInfo}>
                        <Image
                            src="/user-logo.png"
                            alt="User Avatar"
                            width={50}
                            height={50}
                            className={styles.avatar}
                            style={{ borderRadius: "50%" }}
                            loading="lazy"
                            unoptimized
                        />
                        <div className={styles.headerInfo}>
                            <p className={styles.author}>{author}</p>
                            <p className={styles.role}>{role}</p>
                            <p className={styles.time}>{time}</p>
                        </div>
                    </div>
                    <div
                        className={
                            images.length === 1 ? styles.singleImageWrapper : styles.imageGrid
                        }
                    >
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
                        <div className={styles.action} onClick={() => setShared(!shared)}>
                            <Image
                                src="/icon/share.svg"
                                alt="Share"
                                width={28}
                                height={28}
                                className={styles.icon}
                                loading="lazy"
                                unoptimized
                            />
                            {shared ? "Đã chia sẻ" : "187 Chia sẻ"}
                        </div>
                    </div>
                    <div className={styles.commentSection}>
                        {comments.map((comment, index) => (
                            <div key={index} className={styles.commentWrapper}>
                                <Image
                                    src={comment.avatar}
                                    alt="Avatar"
                                    width={40}
                                    height={40}
                                    className={styles.commentAvatar}
                                    style={{ borderRadius: "50%" }}
                                    loading="lazy"
                                    unoptimized
                                />
                                <div className={styles.commentContent}>
                                    <div className={styles.commentHeader}>
                                        <span className={styles.commentName}>{comment.name}</span>
                                        <span className={styles.commentTime}>{comment.time}</span>
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
                                            style={{ objectFit: "cover" }}
                                            loading="lazy"
                                            unoptimized
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.footer}>
                    <input
                        type="text"
                        placeholder="Viết bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className={styles.commentInput}
                    />
                    <label className={styles.imageUploadLabel}>
                        📷
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className={styles.imageUploadInput}
                        />
                    </label>
                    <button className={styles.commentButton} onClick={addComment}>
                        ➤
                    </button>
                </div>
            </div>

            {/* Preview ảnh bài viết */}
            {previewIndex !== null && (
                <ImagePreviewCarousel
                    images={images}
                    currentIndex={previewIndex}
                    onClose={closePreview}
                    onNext={showNextImage}
                    onPrevious={showPreviousImage}
                />
            )}

            {/* Preview ảnh bình luận */}
            {previewCommentImage && (
                <ImagePreviewSingle imageSrc={previewCommentImage} onClose={closePreview} />
            )}
        </div>
    );
}
