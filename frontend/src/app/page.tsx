// frontend/src/app/page.tsx
"use client";

import SidebarLeft from "./components/SidebarLeft";
import SidebarRight from "./components/SidebarRight";
import MainContent from "./components/MainContent";

export default function Home() {
    return (
        <div className="container">
            <SidebarLeft />
            <MainContent />
            <SidebarRight />
        </div>
    );
}
