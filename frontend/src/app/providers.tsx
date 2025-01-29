// frontend/src/app/providers.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Các trang không yêu cầu đăng nhập
        const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

        if (!token && !publicRoutes.includes(pathname)) {
            toast.warn("Vui lòng đăng nhập để tiếp tục.");
            router.push("/login");
        } else {
            setIsLoading(false);
        }
    }, [pathname, router]);

    if (isLoading) return null; // Tránh hiển thị nội dung khi đang kiểm tra

    return (
        <>
            {children}
            <ToastContainer position="top-center" autoClose={3000} />
        </>
    );
}
