import Post from "./Post";

export default function MainContent() {
    const posts = [
        // 1 Image
        {
            author: "X_AE_A-13",
            role: "Product Designer, slothUI",
            content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id elit scelerisque, dapibus est ut, facilisis neque. 
            Proin tincidunt, libero a tristique suscipit, neque neque volutpat turpis, a tincidunt sapien velit in nulla. 
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.\n
            Nam id orci ut ex vehicula facilisis. Quisque vehicula accumsan odio nec dignissim. Phasellus vitae mauris felis. 
            Integer interdum orci velit, ac consectetur nunc porta vel.`,
            hashtags: ["uiux", "frontend", "developer"],
            time: "10 phút trước",
            images: ["/123.jpg"],  // 1 image
        },
        // 2 Images
        {
            author: "X_AE_A-13",
            role: "Product Designer, slothUI",
            content: `Hôm nay tôi cảm thấy rất vui vì dự án đang tiến triển rất tốt. 
            Đây là một cơ hội tuyệt vời để học hỏi và làm việc cùng nhau.\n
            Cảm ơn các bạn đã luôn hỗ trợ và đồng hành trong suốt hành trình này!`,
            hashtags: ["teamwork", "success", "developer"],
            time: "1 giờ trước",
            images: ["/123.jpg", "/1234.jpg"], // 2 images
        },
        // 3 Images
        {
            author: "X_AE_A-13",
            role: "Product Designer, slothUI",
            content:
                "Không có gì tuyệt vời hơn việc hoàn thành dự án đúng thời hạn!",
            hashtags: ["teamwork", "success", "developer"],
            time: "2 giờ trước",
            images: ["/123.jpg", "/1234.jpg", "/123.jpg"], // 3 images
        },
        // 4 Images
        {
            author: "X_AE_A-13",
            role: "Product Designer, slothUI",
            content:
                "Làm việc nhóm giúp tôi học hỏi được rất nhiều điều từ các đồng nghiệp!",
            hashtags: ["teamwork", "growth", "developer"],
            time: "3 giờ trước",
            images: ["/123.jpg", "/1234.jpg", "/123.jpg", "/1234.jpg"], // 4 images
        },
        // 5 Images
        {
            author: "X_AE_A-13",
            role: "Product Designer, slothUI",
            content:
                "Hoàn thành dự án này là một cột mốc lớn trong sự nghiệp của tôi.",
            hashtags: ["achievement", "success", "developer"],
            time: "4 giờ trước",
            images: ["/123.jpg", "/1234.jpg", "/123.jpg", "/1234.jpg", "/1234.jpg"], // 5 images
        },
        // 6+ Images
        {
            author: "X_AE_A-13",
            role: "Product Designer, slothUI",
            content:
                "Dự án này không chỉ giúp tôi nâng cao kỹ năng mà còn mở rộng các cơ hội hợp tác mới2.",
            hashtags: ["growth", "opportunity", "developer"],
            time: "5 giờ trước",
            images: [
                "/1234.jpg", "/123.jpg", "/123.jpg", "/1234.jpg", "/1234.jpg", "/123.jpg",
                "/1234.jpg"
            ], // 6+ images
        },
    ];

    return (
        <div className="main-content">
            {posts.map((post, index) => (
                <Post
                    key={index}
                    author={post.author}
                    role={post.role}
                    content={post.content}
                    hashtags={post.hashtags}
                    time={post.time}
                    images={post.images}  // Pass images as an array
                />
            ))}
        </div>
    );
}
