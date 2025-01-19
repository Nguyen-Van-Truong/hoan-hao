import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Sử dụng Link để chuyển hướng
import styles from "./Post.module.css";
import CommentDialog from "./CommentDialog";
import ImagePreviewCarousel from "./image_preview/ImagePreviewCarousel";

export default function Post({
                                 author,
                                 role,
                                 content,
                                 time,
                                 images = [],
                                 hashcodeIDPost, // Nhận thêm hashcodeIDPost từ props
                             }: {
    author: string;
    role: string;
    content: string;
    time: string;
    images?: string[];
    hashcodeIDPost: string;
}) {
    const MAX_LENGTH = 100; // Số ký tự giới hạn
    const [isExpanded, setIsExpanded] = useState(false);
    const [liked, setLiked] = useState(false); // Trạng thái nút Thích
    const [filledShare, setFilledShare] = useState(false); // Trạng thái nút Chia sẻ
    const [showDialog, setShowDialog] = useState(false); // Trạng thái hiển thị Dialog
    const [previewIndex, setPreviewIndex] = useState<number | null>(null); // Chỉ số ảnh đang preview

    // Khi mở form bình luận, thay đổi URL và tiêu đề trang
    const openCommentDialog = () => {
        setShowDialog(true);

        // Cập nhật URL
        const newUrl = `/pages/${author}/post/${hashcodeIDPost}?showComments=true`;
        window.history.pushState(null, "", newUrl);

        // Lấy nội dung bài viết tối đa 100 ký tự
        const truncatedContent = content.length > MAX_LENGTH
            ? `${content.slice(0, MAX_LENGTH)}...`
            : content;

        // Cập nhật tiêu đề theo định dạng
        document.title = `${author} - ${truncatedContent} - Hoàn Hảo`;
    };

    // Đóng form bình luận và reset URL và tiêu đề
    const closeCommentDialog = () => {
        setShowDialog(false);

        // Reset URL về tên miền hiện tại
        const defaultUrl = window.location.origin; // Lấy tên miền hiện tại
        window.history.pushState(null, "", defaultUrl);

        // Reset tiêu đề về mặc định
        document.title = "Hoàn Hảo";
    };

    // Khi tải lại trang, kiểm tra URL để mở form bình luận nếu cần
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shouldShowComments = params.get("showComments") === "true";
        if (shouldShowComments) {
            setShowDialog(true);
        }
    }, []);

    const toggleLike = () => setLiked(!liked);
    const toggleShare = () => setFilledShare(!filledShare);
    const toggleContent = () => setIsExpanded(!isExpanded);

    const closePreview = () => setPreviewIndex(null); // Đóng preview
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
                        onClick={() => setPreviewIndex(0)} // Mở preview
                        unoptimized
                        loading="lazy"
                    />
                </div>
            );
        }

        const displayImages = images.slice(0, 6); // Hiển thị tối đa 6 ảnh
        const isMoreImages = numImages > 6;

        return (
            <div className={styles.imageGrid}>
                {displayImages.map((image, index) => (
                    <div
                        key={index}
                        className={styles.imageWrapper}
                        onClick={() => setPreviewIndex(index)} // Mở preview
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
                />
                <div className={styles.headerInfo}>
                    <div>
                        <p className={styles.author}>{author}</p>
                        <p className={styles.role}>{role}</p>
                    </div>
                    {/* Thêm Link tới trang chi tiết bài viết */}
                    <Link
                        href={`/pages/${author}/post/${hashcodeIDPost}`}
                        className={styles.time}
                    >
                        {time}
                    </Link>
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
                <div className={styles.action} onClick={toggleLike}>
                    <Image
                        src={
                            liked
                                ? "/icon/heart-like-solid.svg"
                                : "/icon/heart-like-no-solid.svg"
                        }
                        alt="Like"
                        className={styles.icon}
                        width={28}
                        height={28}
                        unoptimized
                        loading="lazy"
                    />
                    {liked ? "13 Thích" : "12 Thích"}
                </div>

                <div className={styles.action} onClick={openCommentDialog}>
                    <Image
                        src="/icon/comment.svg"
                        alt="Comment"
                        className={styles.icon}
                        width={28}
                        height={28}
                        unoptimized
                        loading="lazy"
                    />
                    25 Bình luận
                </div>

                <div className={styles.action} onClick={toggleShare}>
                    <Image
                        src="/icon/share.svg"
                        alt="Share"
                        className={styles.icon}
                        width={28}
                        height={28}
                        unoptimized
                        loading="lazy"
                    />
                    187 Chia sẻ
                </div>
            </div>

            {/* Comment Dialog */}
            {/* Comment Dialog */}
            {showDialog && (
                <CommentDialog
                    author={author}
                    role={role}
                    time={time}
                    images={images}
                    content={content} // Truyền thêm content
                    fetchMoreComments={async (currentCount) => {
                        // API giả lập
                        await new Promise((res) => setTimeout(res, 1000)); // Đợi 1 giây
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
                    }}
                    onClose={closeCommentDialog}
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
