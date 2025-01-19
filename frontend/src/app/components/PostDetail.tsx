// "use client";
//
// import { useEffect, useState } from "react";
// import Post from "./Post";
//
// export default function PostDetail({
//                                        username,
//                                        hashcodeIDPost,
//                                    }: {
//     username: string;
//     hashcodeIDPost: string;
// }) {
//     const [post, setPost] = useState<any>(null); // Dữ liệu bài viết
//
//     // Giả lập fetch dữ liệu bài viết
//     useEffect(() => {
//         const fetchPost = async () => {
//             // API giả lập (thay bằng API thực tế)
//             const postData = await new Promise((res) =>
//                 setTimeout(
//                     () =>
//                         res({
//                             author: username,
//                             role: "User",
//                             content: `Đây là nội dung chi tiết của bài viết với ID: ${hashcodeIDPost}. Nội dung bài viết có thể dài hơn.`,
//                             time: "1 giờ trước",
//                             images: ["/123.jpg", "/1234.jpg", "/logo.png"], // Hình ảnh bài viết
//                         }),
//                     1000
//                 )
//             );
//             setPost(postData);
//         };
//
//         fetchPost();
//     }, [username, hashcodeIDPost]);
//
//     if (!post) return <p>Đang tải bài viết...</p>;
//
//     return (
//         <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
//             <Post
//                 author={post.author}
//                 role={post.role}
//                 content={post.content}
//                 time={post.time}
//                 images={post.images}
//                 hashcodeIDPost={hashcodeIDPost} // Truyền ID bài viết
//             />
//         </div>
//     );
// }
