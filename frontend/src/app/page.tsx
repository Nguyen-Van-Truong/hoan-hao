// frontend/src/app/page.tsx
"use client";

import { useEffect } from "react";
import SidebarLeft from "./components/SidebarLeft";
import SidebarRight from "./components/SidebarRight";
import MainContent from "./components/MainContent";

export default function Home() {
    // Đặt tiêu đề mặc định cho trang
    useEffect(() => {
        document.title = "Hoàn Hảo"; // Tiêu đề mặc định của trang
    }, []);

    return (
        <div className="container">
            <SidebarLeft />
            <MainContent />
            <SidebarRight />
        </div>
    );
}
