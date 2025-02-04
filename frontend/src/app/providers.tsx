// frontend/src/app/providers.tsx
"use client";

import {useEffect, useState, createContext, useContext} from "react";
import {useRouter, usePathname} from "next/navigation";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Tạo context để chia sẻ Locale
const LocaleContext = createContext<string>('vi'); // Mặc định ngôn ngữ là tiếng Việt

export const useLocale = () => useContext(LocaleContext);

export default function Providers({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [locale, setLocale] = useState<string>('vi'); // Mặc định ngôn ngữ là tiếng Việt

    // Định nghĩa các ngôn ngữ hỗ trợ
    const locales = ['en-US', 'vi', 'nl-NL', 'nl']; // Khai báo mảng locales

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

        // Nếu chưa đăng nhập và truy cập vào trang không phải publicRoutes thì chuyển hướng tới login
        if (!token && !publicRoutes.some(route => pathname.includes(route))) {
            toast.warn("Vui lòng đăng nhập để tiếp tục.");
            // Điều hướng đến trang login có locale (mặc định locale 'vi')
            router.push(`/vi/login`);
            return;
        }

        setIsLoading(false);

        // Lấy locale từ URL hoặc localStorage
        const pathLocale = pathname.split('/')[1]; // Lấy phần đầu tiên của pathname (locale)
        const savedLocale = localStorage.getItem("locale");

        // Nếu có locale trong URL và nó hợp lệ, cập nhật locale
        if (pathLocale && locales.includes(pathLocale)) {
            setLocale(pathLocale);
            localStorage.setItem("locale", pathLocale); // Lưu locale vào localStorage
        } else if (savedLocale) {
            // Nếu không có trong URL nhưng có trong localStorage, sử dụng giá trị đó
            setLocale(savedLocale);
            router.push(`/${savedLocale}${pathname.slice(3)}`); // Điều hướng tới URL với locale
        } else {
            // Nếu không có locale trong URL hoặc localStorage, mặc định là tiếng Việt
            setLocale('vi');
            router.push(`/vi${pathname}`); // Điều hướng tới URL với locale mặc định
        }
    }, [pathname, router, locales]);

    if (isLoading) return null; // Tránh hiển thị nội dung khi đang kiểm tra

    return (
        <LocaleContext.Provider value={locale}>
            {children}
            <ToastContainer position="top-center" autoClose={3000}/>
        </LocaleContext.Provider>
    );
}
