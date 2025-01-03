// frontend/src/components/Post.tsx
import {useState} from "react";
import styles from "./Post.module.css";
import CommentDialog from "./CommentDialog";

export default function Post({
                                 author,
                                 role,
                                 content,
                                 time,
                                 images = [],
                             }: {
    author: string;
    role: string;
    content: string;
    time: string;
    images?: string[];
}) {

    const MAX_LENGTH = 100; // Số ký tự giới hạn
    const [isExpanded, setIsExpanded] = useState(false);
    const [liked, setLiked] = useState(false); // Trạng thái nút Thích
    const [filledShare, setFilledShare] = useState(false); // Trạng thái nút Chia sẻ
    const [showDialog, setShowDialog] = useState(false); // Trạng thái hiển thị Dialog

    const toggleLike = () => setLiked(!liked);
    const toggleShare = () => setFilledShare(!filledShare);

    const toggleContent = () => {
        setIsExpanded(!isExpanded);

    };

    const renderImages = () => {
        const numImages = images.length;

        if (numImages === 0) return null;

        if (numImages === 1) {
            return (
                <div className={styles.singleImageWrapper}>
                    <img src={images[0]} alt="Post Image" className={styles.singlePostImage} />
                </div>
            );
        }

        const displayImages = images.slice(0, 6); // Hiển thị tối đa 6 ảnh
        const isMoreImages = numImages > 6;

        return (
            <div className={styles.imageGrid}>
                {displayImages.map((image, index) => (
                    <div key={index} className={styles.imageWrapper}>
                        <img src={image} alt={`Post Image ${index + 1}`} className={styles.postImage} />
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

    return (
        <div className={styles.post}>
            {/* Header */}
            <div className={styles.header}>
                <img
                    src="/user-logo.png"
                    alt="User Avatar"
                    className={styles.avatar}
                />
                <div className={styles.headerInfo}>
                    <div>
                        <p className={styles.author}>{author}</p>
                        <p className={styles.role}>{role}</p>
                    </div>
                    <p className={styles.time}>{time}</p>
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
                        {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                )}
            </div>

            {/* Images */}
            {renderImages()}

            {/* Actions */}
            <div className={styles.actions}>
                {/* Like Icon */}
                <div className={styles.action} onClick={toggleLike}>
                    <img
                        src={
                            liked
                                ? "/icon/heart-like-solid.svg" // Hiển thị icon khi đã thích
                                : "/icon/heart-like-no-solid.svg" // Hiển thị icon khi chưa thích
                        }
                        alt="Like"
                        className={styles.icon}
                    />
                    {liked ? "13 Thích" : "12 Thích"}
                </div>

                {/* Comment Icon */}
                <div
                    className={styles.action}
                    onClick={() => setShowDialog(true)} // Hiển thị Dialog
                >
                    <img src="/icon/comment.svg" alt="Comment" className={styles.icon}/>
                    25 Bình luận
                </div>

                {/* Share Icon */}
                <div className={styles.action} onClick={toggleShare}>
                    <img
                        src="/icon/share.svg"
                        alt="Share"
                        className={styles.icon}
                        style={{
                            fill: filledShare ? "#ec86bf" : "none",
                            stroke: "#ec86bf",
                            strokeWidth: "2",
                        }}
                    />
                    187 Chia sẻ
                </div>

            </div>

            {/* Comment Dialog */}
            {showDialog && (
                <CommentDialog
                    author={author}
                    role={role}
                    time={time}
                    images={images}
                    initialComments={[
                        "Bài viết rất hay!",
                        "Mình rất thích nội dung này.",
                        "Cảm ơn bạn đã chia sẻ!",
                    ]}
                    onClose={() => setShowDialog(false)}
                />
            )}

        </div>
    );
}
