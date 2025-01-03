import { useState } from "react";
import styles from "./CommentDialog.module.css";

interface CommentDialogProps {
    author: string;
    role: string;
    time: string;
    images: string[];
    initialComments: string[];
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
    const [comments, setComments] = useState(initialComments); // Danh sách bình luận
    const [newComment, setNewComment] = useState(""); // Nội dung bình luận mới
    const [liked, setLiked] = useState(false); // Trạng thái nút Thích
    const [shared, setShared] = useState(false); // Trạng thái nút Chia sẻ

    const addComment = () => {
        if (newComment.trim() === "") return; // Không cho phép gửi bình luận rỗng
        setComments((prev) => [...prev, newComment]);
        setNewComment(""); // Reset thanh nhập liệu
    };

    return (
        <div className={styles.dialog}>
            <div className={styles.dialogContent}>
                {/* Header */}
                <div className={styles.header}>
                    <span>Bài viết của {author}</span>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✖
                    </button>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {/* Author Info */}
                    <div className={styles.authorInfo}>
                        <img src="/user-logo.png" alt="User Avatar" className={styles.avatar} />
                        <div className={styles.headerInfo}>
                            <div>
                                <p className={styles.author}>{author}</p>
                                <p className={styles.role}>{role}</p>
                            </div>
                            <p className={styles.time}>{time}</p>
                        </div>
                    </div>

                    {/* Images */}
                    <div className={styles.imageGrid}>
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Post Image ${index + 1}`}
                                className={styles.dialogImage}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <div className={styles.action} onClick={() => setLiked(!liked)}>
                            <img
                                src={
                                    liked
                                        ? "/icon/heart-like-solid.svg"
                                        : "/icon/heart-like-no-solid.svg"
                                }
                                alt="Like"
                                className={styles.icon}
                            />
                            {liked ? "13 Thích" : "12 Thích"}
                        </div>

                        <div className={styles.action} onClick={() => setShared(!shared)}>
                            <img
                                src="/icon/share.svg"
                                alt="Share"
                                className={styles.icon}
                            />
                            {shared ? "Đã chia sẻ" : "187 Chia sẻ"}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className={styles.commentSection}>
                        {comments.map((comment, index) => (
                            <p key={index} className={styles.comment}>
                                {comment}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <input
                        type="text"
                        placeholder="Viết bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className={styles.commentInput}
                    />
                    <button className={styles.commentButton} onClick={addComment}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
