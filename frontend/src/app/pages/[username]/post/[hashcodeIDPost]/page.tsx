// // frontend/src/app/pages/[username]/post/[hashcodeIDPost]/page.tsx
// "use client";
//
// import { useParams } from "next/navigation";
// import SidebarLeft from "../../../../components/SidebarLeft";
// import SidebarRight from "../../../../components/SidebarRight";
// import PostDetail from "../../../../components/PostDetail";
//
// export default function PostDetailPage() {
//     const params = useParams();
//     const username = params?.username as string; // Ép kiểu về string
//     const hashcodeIDPost = params?.hashcodeIDPost as string; // Ép kiểu về string
//
//     return (
//         <div className="container">
//             <SidebarLeft />
//             <main className="main">
//                 {/* Truyền username và hashcodeIDPost vào PostDetail */}
//                 <PostDetail username={username} hashcodeIDPost={hashcodeIDPost} />
//             </main>
//             <SidebarRight />
//         </div>
//     );
// }
