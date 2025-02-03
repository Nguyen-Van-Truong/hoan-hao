// frontend/src/app/providers.tsx
"use client";

import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Tạo context để chia sẻ Locale
const LocaleContext = createContext<string>('vi'); // Mặc định ngôn ngữ là tiếng Việt

export const useLocale = () => useContext(LocaleContext);

export default function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [locale, setLocale] = useState<string>('vi'); // Mặc định ngôn ngữ là tiếng Việt

    // Định nghĩa các ngôn ngữ hỗ trợ
    const locales = ['en-US', 'vi', 'nl-NL', 'nl']; // Khai báo mảng locales

    useEffect(() => {
        const token = localStorage.getItem("token");
        const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

        // Kiểm tra đăng nhập
        if (!token && !publicRoutes.includes(pathname)) {
            toast.warn("Vui lòng đăng nhập để tiếp tục.");
            router.push("/login");
        } else {
            setIsLoading(false);
        }

        // Lấy locale từ URL hoặc localStorage
        const pathLocale = pathname.split('/')[1]; // Lấy phần đầu tiên của pathname
        const savedLocale = localStorage.getItem("locale");

        if (pathLocale && locales.includes(pathLocale)) {
            setLocale(pathLocale);  // Nếu có locale trong URL thì cập nhật locale
        } else if (savedLocale) {
            setLocale(savedLocale);  // Nếu không có trong URL thì lấy từ localStorage
        } else {
            setLocale('vi');  // Mặc định là tiếng Việt
        }
    }, [pathname, router]);

    if (isLoading) return null; // Tránh hiển thị nội dung khi đang kiểm tra

    return (
        <LocaleContext.Provider value={locale}>
            {children}
            <ToastContainer position="top-center" autoClose={3000} />
        </LocaleContext.Provider>
    );
}
