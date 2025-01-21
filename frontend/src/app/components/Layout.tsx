// frontend/src/app/components/Layout.tsx
"use client";

import React from "react";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import MainContent from "./MainContent";
import {ToastContainer} from "react-toastify";

interface LayoutProps {
    children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="container">
            <ToastContainer position="top-center" autoClose={3000} />

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
