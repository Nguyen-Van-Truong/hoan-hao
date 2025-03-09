import {useEffect, useRef, useState, useCallback} from "react";
import {v4 as uuidv4} from "uuid";
import {toast} from "react-toastify";
import {fetchFeed, type RawPost, type Media, Author} from "../api/postApi";
import Post from "./Post";
import DetailPostDialog from "./DetailPostDialog";
import styles from "./MainContent.module.css";
import Image from "next/image";
import {useTranslations} from "next-intl";

interface PostType {
    id?: number;
    user_id?: number;
    content: string;
    visibility?: string;
    created_at?: string;
    updated_at?: string;
    media?: Media[];
    total_likes?: number;
    total_comments?: number;
    total_shares?: number;
    author: Author | null;
    time: string;
    images: string[];
    hashcodeIDPost: string;
}

interface MainContentProps {
    hashcodeIDPost?: string;
}

const MAX_IMAGES = 6;
const LIMIT = 3;

export default function MainContent({hashcodeIDPost}: MainContentProps) {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
    const [mode, setMode] = useState<"latest" | "popular">("latest");
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImages, setNewPostImages] = useState<File[]>([]);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("MainContent");

    const transformPost = (post: RawPost): PostType => {
        const transformed = {
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            visibility: post.visibility,
            created_at: post.created_at,
            updated_at: post.updated_at,
            media: post.media,
            total_likes: post.total_likes,
            total_comments: post.total_comments,
            total_shares: post.total_shares,
            author: post.author,
            time: new Date(post.created_at).toLocaleString(),
            images: post.media?.map((m) => m.media_url) ?? [],
            hashcodeIDPost: `post-${post.id}`,
        };
        console.log("Transformed post:", transformed);
        return transformed;
    };

    const fetchPosts = useCallback(
        async (newOffset: number, reset = false) => {
            if (loading || (!reset && !hasMore)) return;

            setLoading(true);
            try {
                const {posts: fetchedPosts, total} = await fetchFeed(LIMIT, newOffset, mode);
                console.log(`Offset: ${newOffset}, Fetched: ${fetchedPosts.length}, Total: ${total}`);

                const newPosts = fetchedPosts.map(transformPost);
                setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
                setOffset(newOffset + LIMIT);
                setHasMore(fetchedPosts.length === LIMIT && newOffset + LIMIT < total);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                toast.error(`${t("fetch_error")}: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        },
        [mode, t]
    );

    useEffect(() => {
        setOffset(0);
        setHasMore(true);
        setPosts([]);
        fetchPosts(0, true);
    }, [mode, fetchPosts]);

    const scrollRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) clearTimeout(scrollRef.current);

            scrollRef.current = setTimeout(() => {
                if (
                    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
                    !loading &&
                    hasMore
                ) {
                    fetchPosts(offset);
                }
            }, 200);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollRef.current) clearTimeout(scrollRef.current);
        };
    }, [fetchPosts, offset, loading, hasMore]);

    useEffect(() => {
        if (!hashcodeIDPost) return;

        const foundPost = posts.find((p) => p.hashcodeIDPost === hashcodeIDPost);
        if (foundPost) {
            setSelectedPost(foundPost);
        } else {
            const fetchPostDetail = async () => {
                try {
                    const {posts: fetchedPosts} = await fetchFeed(1, 0, "latest");
                    const post = fetchedPosts.find((p) => `post-${p.id}` === hashcodeIDPost);
                    setSelectedPost(
                        post
                            ? transformPost(post)
                            : {
                                author: null,
                                content: `Post from API: ${hashcodeIDPost}`,
                                time: "Just now",
                                images: [],
                                hashcodeIDPost,
                            }
                    );
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    toast.error(`${t("fetch_error")}: ${errorMessage}`);
                }
            };
            fetchPostDetail();
        }
    }, [hashcodeIDPost, posts, t, fetchPosts]);

    const closeDialog = () => {
        setSelectedPost(null);
        window.history.pushState(null, "", "/");
    };

    const handleFiles = (files: File[]) => {
        if (newPostImages.length + files.length > MAX_IMAGES) {
            toast.error(t("max_images_error", {max: MAX_IMAGES}));
            return;
        }
        setNewPostImages((prev) => [...prev, ...files.filter((file) => file.type.startsWith("image/"))]);
    };

    const handlePostContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setNewPostContent(e.target.value);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFiles(Array.from(e.target.files ?? []));

    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        handleFiles(Array.from(e.dataTransfer.files));
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const imageFiles = Array.from(e.clipboardData.items)
            .filter((item) => item.type.startsWith("image/"))
            .map((item) => item.getAsFile())
            .filter((file): file is File => file !== null);
        handleFiles(imageFiles);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => e.preventDefault();

    const removeImage = (index: number) => setNewPostImages((prev) => prev.filter((_, i) => i !== index));

    const handleSubmitPost = () => {
        if (!newPostContent.trim() && newPostImages.length === 0) return;

        const newPost: PostType = {
            author: {id: 0, username: "currentUser", full_name: "Current User", profile_picture_url: ""},
            content: newPostContent,
            time: "Just now",
            images: newPostImages.map((file) => URL.createObjectURL(file)),
            hashcodeIDPost: uuidv4(),
        };

        setPosts((prev) => [newPost, ...prev]);
        setNewPostContent("");
        setNewPostImages([]);
    };

    return (
        <div className={styles.mainContent} ref={mainContentRef}>
            <div className={styles.createPost}>
                <textarea
                    className={styles.postInput}
                    placeholder={t("create_post_placeholder")}
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
                                width={60}
                                height={60}
                                className={styles.previewImage}
                                loading="lazy"
                            />
                            <button className={styles.removeImage} onClick={() => removeImage(index)}>
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <div className={styles.actionBar}>
                    <label htmlFor="fileInput" className={styles.imageIcon}>
                        <Image
                            src="/icon/icon_choose_image.svg"
                            alt={t("image_select_icon_alt")}
                            width={45}
                            height={45}
                            style={{width: "auto", height: "auto"}}
                            loading="lazy"
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
                        disabled={!newPostContent.trim() && newPostImages.length === 0}
                    >
                        {t("post_button")}
                    </button>
                </div>
            </div>

            <div className={styles.modeSelector}>
                <button
                    className={`${styles.modeButton} ${mode === "latest" ? styles.active : ""}`}
                    onClick={() => setMode("latest")}
                >
                    {t("mode_latest")}
                </button>
                <button
                    className={`${styles.modeButton} ${mode === "popular" ? styles.active : ""}`}
                    onClick={() => setMode("popular")}
                >
                    {t("mode_popular")}
                </button>
            </div>

            {posts.map((post) => (
                <Post
                    key={post.hashcodeIDPost}
                    author={post.author?.full_name ?? "Unknown"}
                    username={post.author?.username ?? "unknown"}
                    avatarUrl={post.author?.profile_picture_url ?? "/user-logo.png"} // Truyền profile_picture_url
                    content={post.content}
                    time={post.time}
                    images={post.images}
                    hashcodeIDPost={post.hashcodeIDPost}
                    total_likes={post.total_likes ?? 0}
                    total_comments={post.total_comments ?? 0}
                    total_shares={post.total_shares ?? 0}
                />
            ))}

            {loading && (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}/>
                    <p>{t("loading_more_posts")}</p>
                </div>
            )}

            {!loading && !hasMore && posts.length > 0 && (
                <div className={styles.noMorePosts}>
                    <p>{t("no_more_posts")}</p>
                </div>
            )}

            {selectedPost && (
                <DetailPostDialog
                    author={selectedPost.author?.full_name ?? "Unknown"}
                    username={selectedPost.author?.username ?? "unknown"}
                    avatarUrl={selectedPost.author?.profile_picture_url ?? "/user-logo.png"} // Truyền profile_picture_url
                    time={selectedPost.time}
                    content={selectedPost.content}
                    images={selectedPost.images}
                    hashcodeIDPost={selectedPost.hashcodeIDPost}
                    total_likes={selectedPost.total_likes ?? 0}
                    total_comments={selectedPost.total_comments ?? 0}
                    total_shares={selectedPost.total_shares ?? 0}
                    onClose={closeDialog}
                />
            )}
        </div>
    );
}