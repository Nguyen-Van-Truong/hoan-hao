// frontend/src/app/components/Layout.tsx
"use client";

import React from "react";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import MainContent from "./MainContent";

interface LayoutProps {
    children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="container">
            <div className="sidebar-left">
                <SidebarLeft />
            </div>
            <div className="main-content">
                {children || <MainContent />}
            </div>
            <div className="sidebar-right">
                <SidebarRight />
            </div>
        </div>
    );
}
