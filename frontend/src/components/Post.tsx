import {useState} from "react";
import styles from "./Post.module.css";

export default function Post({
                                 author,
                                 role,
                                 content,
                                 hashtags,
                                 time,
                                 images = [],
                             }: {
    author: string;
    role: string;
    content: string;
    hashtags: string[];
    time: string;
    images?: string[];
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const MAX_LENGTH = 100; // Số ký tự giới hạn

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
                <div className={styles.hashtags}>
                    {hashtags.map((tag, index) => (
                        <span key={index} className={styles.hashtag}>
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Images */}
            {renderImages()}

            {/* Actions */}
            <div className={styles.actions}>
                <div className={styles.action}>
                    <span>❤️</span> 12 Thích
                </div>
                <div className={styles.action}>
                    <span>💬</span> 25 Bình luận
                </div>
                <div className={styles.action}>
                    <span>🔗</span> 187 Chia sẻ
                </div>
            </div>

            {/* Comment Box */}
            <div className={styles.commentBox}>
                <input
                    type="text"
                    placeholder="Bình luận của bạn"
                    className={styles.commentInput}
                />
                <button className={styles.commentButton}>➤</button>
            </div>
        </div>
    );
}
