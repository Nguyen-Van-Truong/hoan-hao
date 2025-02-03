// frontend/src/app/components/MainContent.tsx
import {useEffect, useRef, useState, useCallback} from "react";
import {v4 as uuidv4} from "uuid";
import {toast} from "react-toastify";
import Post from "./Post";
import DetailPostDialog from "./DetailPostDialog";
import styles from "./MainContent.module.css";
import Image from "next/image";
import {useTranslations} from "next-intl";

// Định nghĩa kiểu dữ liệu cho bài viết
interface PostType {
    author: string;
    username: string;
    content: string;
    time: string;
    images: string[];
    hashcodeIDPost: string;
}

interface MainContentProps {
    username?: string; // Tùy chọn nhận username từ route
    hashcodeIDPost?: string; // Tùy chọn nhận hashcodeIDPost từ route
}

export default function MainContent({username, hashcodeIDPost}: MainContentProps) {
    const [posts, setPosts] = useState<PostType[]>([
        {
            author: "Truong",
            username: "@truong",
            content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id elit scelerisque, dapibus est ut, facilisis neque. 
            Proin tincidunt, libero a tristique suscipit, neque neque volutpat turpis, a tincidunt sapien velit in nulla. 
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.\n
            Nam id orci ut ex vehicula facilisis. Quisque vehicula accumsan odio nec dignissim. Phasellus vitae mauris felis. 
            Integer interdum orci velit, ac consectetur nunc porta vel.`,
            time: "10 phút trước",
            images: ["/1234.jpg"],
            hashcodeIDPost: "post1",
        },
        {
            author: "Truong",
            username: "@truong",
            content: `Hôm nay tôi cảm thấy rất vui vì dự án đang tiến triển rất tốt. 
            Đây là một cơ hội tuyệt vời để học hỏi và làm việc cùng nhau.\n
            Cảm ơn các bạn đã luôn hỗ trợ và đồng hành trong suốt hành trình này!`,
            time: "1 giờ trước",
            images: ["/123.jpg", "/1234.jpg"],
            hashcodeIDPost: "post2",
        },
        {
            author: "Truong",
            username: "@truong",
            content: "Không có gì tuyệt vời hơn việc hoàn thành dự án đúng thời hạn!",
            time: "2 giờ trước",
            images: ["/123.jpg", "/1234.jpg", "/123.jpg"],
            hashcodeIDPost: "post3",
        },
        {
            author: "Truong",
            username: "@truong",
            content: "Làm việc nhóm giúp tôi học hỏi được rất nhiều điều từ các đồng nghiệp!",
            time: "3 giờ trước",
            images: ["/123.jpg", "/boji2.webp", "/123.jpg", "/1234.jpg"],
            hashcodeIDPost: "post4",
        },
        {
            author: "Truong",
            username: "@truong",
            content: "Hoàn thành dự án này là một cột mốc lớn trong sự nghiệp của tôi.",
            time: "4 giờ trước",
            images: ["/123.jpg", "/1234.jpg", "/123.jpg", "/1234.jpg", "/1234.jpg"],
            hashcodeIDPost: "post5",
        },
        {
            author: "Long",
            username: "@long",
            content:
                "Dự án này không chỉ giúp tôi nâng cao kỹ năng mà còn mở rộng các cơ hội hợp tác mới.",
            time: "5 giờ trước",
            images: [
                "/1234.jpg", "/123.jpg", "/boji2.webp", "/logo.png", "/next.svg", "/123.jpg",
                "/1234.jpg", "/boji2.webp", "/logo.png",
            ],
            hashcodeIDPost: "post6",
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null); // Cập nhật kiểu dữ liệu
    const mainContentRef = useRef<HTMLDivElement | null>(null);
    useRef<number>(0);
    const userCounter = useRef(1); // Giữ giá trị giữa các lần render
    const [newPostContent, setNewPostContent] = useState<string>("");
    const [newPostImages, setNewPostImages] = useState<File[]>([]); // Quản lý ảnh tải lên
    const MAX_IMAGES = 6;
    const t = useTranslations("MainContent"); // ✅ Thêm i18n cho các thông báo

    const fetchMorePosts = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        // Lưu vị trí hiện tại
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;

        await new Promise((res) => setTimeout(res, 1000));

        const newPosts: PostType[] = [
            {
                author: `User ${userCounter.current}`,
                username: `@user${userCounter.current}`,
                content: "Bài viết mới với 1 hình ảnh.",
                time: "1 phút trước",
                images: ["/123.jpg"],
                hashcodeIDPost: uuidv4(),
            },
            {
                author: `User ${userCounter.current + 1}`,
                username: `@user${userCounter.current + 1}`,
                content: "Bài viết mới không có hình ảnh.",
                time: "2 phút trước",
                images: [],
                hashcodeIDPost: uuidv4(),
            },
            {
                author: `User ${userCounter.current + 2}`,
                username: `@user${userCounter.current + 2}`,
                content: "Bài viết mới với 2 hình ảnh.",
                time: "3 phút trước",
                images: ["/123.jpg", "/1234.jpg"],
                hashcodeIDPost: uuidv4(),
            },
        ];

        // Tăng giá trị của userCounter sau khi sử dụng
        userCounter.current += 3;

        setPosts((prevPosts) => {
            const uniquePosts = newPosts.filter(
                (newPost) =>
                    !prevPosts.some((post) => post.hashcodeIDPost === newPost.hashcodeIDPost)
            );
            return [...prevPosts, ...uniquePosts];
        });

        // Khôi phục vị trí cuộn cũ
        setTimeout(() => {
            const newScrollHeight = document.documentElement.scrollHeight;
            window.scrollTo({
                top: scrollTop + (newScrollHeight - scrollHeight),
                behavior: "auto",
            });
        }, 0);

        setLoading(false);
    }, [loading]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Kiểm tra khi người dùng cuộn đến dưới cùng
            if (scrollTop + windowHeight >= documentHeight - 5 && !loading) {
                fetchMorePosts();
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [fetchMorePosts, loading]);

    // Tự động mở dialog nếu có username và hashcodeIDPost
    useEffect(() => {
        if (hashcodeIDPost) {
            const foundPost = posts.find((post) => post.hashcodeIDPost === hashcodeIDPost);

            if (foundPost) {
                setSelectedPost(foundPost); // Bài viết đã tồn tại trong danh sách
            } else {
                // Gọi API để lấy bài viết nếu không tìm thấy
                const fetchPostDetail = async () => {
                    const fetchedPost: PostType = {
                        author: username || "Unknown",
                        username: `@${username || "Unknown"}`,
                        content: `Bài viết từ API: ${hashcodeIDPost}`,
                        time: "1 phút trước",
                        images: [],
                        hashcodeIDPost: hashcodeIDPost,
                    };
                    setSelectedPost(fetchedPost);
                };
                fetchPostDetail();
            }
        }
    }, [hashcodeIDPost, posts, username]);

    const closeDialog = () => {
        setSelectedPost(null);
        window.history.pushState(null, "", "/");
    };

    // Handle khi chọn hoặc kéo thả ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (newPostImages.length + files.length > MAX_IMAGES) {
            toast.error(`Bạn chỉ được tải lên tối đa ${MAX_IMAGES} ảnh.`);
            return;
        }
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        setNewPostImages((prevImages) => [...prevImages, ...imageFiles]);
    };

    const handlePostContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewPostContent(e.target.value);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault(); // Ngăn trình duyệt mặc định mở tệp
    };

    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (newPostImages.length + files.length > MAX_IMAGES) {
            toast.error(`Bạn chỉ được tải lên tối đa ${MAX_IMAGES} ảnh.`);
            return;
        }

        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        setNewPostImages((prevImages) => [...prevImages, ...imageFiles]);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = Array.from(e.clipboardData.items);
        const imageItems = items.filter((item) => item.type.startsWith("image/"));
        const imageFiles = imageItems.map((item) => item.getAsFile()!);

        if (newPostImages.length + imageFiles.length > MAX_IMAGES) {
            toast.error(`Bạn chỉ được tải lên tối đa ${MAX_IMAGES} ảnh.`);
            return;
        }

        setNewPostImages((prevImages) => [...prevImages, ...imageFiles]);
    };

    const handleSubmitPost = () => {
        if (newPostContent.trim() === "" && newPostImages.length === 0) return;

        const newPost: PostType = {
            author: "Current User",
            username: "@currentUser",
            content: newPostContent,
            time: "Vừa xong",
            images: newPostImages.map((file) => URL.createObjectURL(file)),
            hashcodeIDPost: uuidv4(),
        };

        setPosts((prevPosts) => [newPost, ...prevPosts]);
        setNewPostContent("");
        setNewPostImages([]);
    };

    const removeImage = (index: number) => {
        setNewPostImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };
    return (
        <div className={styles.mainContent} ref={mainContentRef}>
            {/* Phần tạo bài viết mới */}
            <div className={styles.createPost}>
                <textarea
                    className={styles.postInput}
                    placeholder={t("create_post_placeholder")} // ✅ Dùng i18n cho placeholder
                    value={newPostContent}
                    onChange={handlePostContentChange}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                />

                <div className={styles.previewImages}>
                    {newPostImages.map((file, index) => (
                        <div key={index} className={styles.previewImageWrapper}>
                            <Image
                                src={URL.createObjectURL(file)}
                                alt={`preview-${index}`}
                                width={40}
                                height={40}
                                className={styles.previewImage}
                                loading={"lazy"}
                            />
                            <button
                                className={styles.removeImage}
                                onClick={() => removeImage(index)}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.actionBar}>
                    {/* Biểu tượng hình ảnh */}
                    <label htmlFor="fileInput" className={styles.imageIcon}>
                        <Image
                            src={"/icon/icon_choose_image.svg"}
                            alt={t("image_select_icon_alt")} // ✅ Thêm i18n cho alt text
                            width={40}
                            height={40}
                            className={styles.previewImage}
                            loading={"lazy"}
                        />
                    </label>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                    />

                    <button
                        className={styles.postButton}
                        onClick={handleSubmitPost}
                        disabled={newPostContent.trim() === "" && newPostImages.length === 0}
                    >
                        {t("post_button")}
                    </button>

                </div>
            </div>

            {/* Hiển thị bài viết */}
            {posts.map((post) => (
                <Post
                    key={post.hashcodeIDPost}
                    author={post.author}
                    username={post.username}
                    content={post.content}
                    time={post.time}
                    images={post.images}
                    hashcodeIDPost={post.hashcodeIDPost}
                    onClick={() => setSelectedPost(post)}
                />
            ))}

            {loading && (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}/>
                    <p>{t("loading_more_posts")}</p>
                </div>
            )}

            {selectedPost && (
                <DetailPostDialog
                    author={selectedPost.author}
                    username={selectedPost.username}
                    time={selectedPost.time}
                    content={selectedPost.content}
                    images={selectedPost.images}
                    hashcodeIDPost={selectedPost.hashcodeIDPost}
                    onClose={closeDialog}
                />
            )}
        </div>
    );
}
