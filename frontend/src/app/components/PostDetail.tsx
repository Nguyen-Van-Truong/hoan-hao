// frontend/src/app/components/PostDetail.tsx
interface PostDetailProps {
    username: string;
    hashcodeIDPost: string;
}

export default function PostDetail({ username, hashcodeIDPost }: PostDetailProps) {
    return (
        <div className="post-detail">
            <h1>Chi tiết bài viết</h1>
            <p>
                <strong>Người dùng:</strong> {username}
            </p>
            <p>
                <strong>ID bài viết:</strong> {hashcodeIDPost}
            </p>
            <p>
                Đây là nội dung chi tiết của bài viết. Bạn có thể tùy chỉnh thêm thông tin tại đây.
            </p>
        </div>
    );
}
