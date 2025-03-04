// frontend/src/app/providers.tsx
"use client";

import { useEffect, useState, createContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SUPPORTED_LOCALES, PUBLIC_ROUTES, APP_CONFIG } from "@/config/config";
import { getCookie } from "./api/authApi";

const LocaleContext = createContext<string>(APP_CONFIG.defaultLocale);

export default function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [locale, setLocale] = useState<string>(APP_CONFIG.defaultLocale);

    useEffect(() => {
        const locales = SUPPORTED_LOCALES;
        const accessToken = getCookie("accessToken"); // Dùng cookie thay vì localStorage

        if (!accessToken && !PUBLIC_ROUTES.some((route) => pathname.includes(route))) {
            toast.warn("Vui lòng đăng nhập để tiếp tục.");
            router.push(`/${APP_CONFIG.defaultLocale}/login`);
            return;
        }

        setIsLoading(false);

        const pathLocale = pathname.split("/")[1];
        const savedLocale = localStorage.getItem("locale");

        if (pathLocale && locales.includes(pathLocale)) {
            setLocale(pathLocale);
            localStorage.setItem("locale", pathLocale);
        } else if (savedLocale && savedLocale !== pathLocale) {
            setLocale(savedLocale);
            router.push(`/${savedLocale}${pathname.slice(pathLocale.length + 1)}`);
        } else {
            setLocale(APP_CONFIG.defaultLocale);
            router.push(`/${APP_CONFIG.defaultLocale}${pathname}`);
        }
    }, [pathname, router]);

    if (isLoading) return null;

    return (
        <LocaleContext.Provider value={locale}>
            {children}
            <ToastContainer position="top-center" autoClose={3000} />
        </LocaleContext.Provider>
    );
}