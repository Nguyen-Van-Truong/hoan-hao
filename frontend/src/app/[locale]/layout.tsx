// frontend/src/app/[locale]/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Providers from "@/app/providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { JSX } from "react";

// Khởi tạo font
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Hàm kiểm tra locale hợp lệ
function isValidLocale(locale: string): locale is "vi" | "en" {
    return routing.locales.includes(locale as "vi" | "en");
}

// Định nghĩa kiểu props cho layout, chấp nhận cả object hoặc Promise của object
type LayoutProps = {
    children: React.ReactNode;
    params: { locale: string } | Promise<{ locale: string }>;
};

export default async function RootLayout(props: LayoutProps): Promise<JSX.Element> {
    // Resolve params: nếu params là Promise thì await, nếu không thì nó vẫn trả về object
    const resolvedParams = await Promise.resolve(props.params);
    const { locale } = resolvedParams;

    // Kiểm tra locale hợp lệ
    if (!isValidLocale(locale)) {
        notFound();
    }

    // Đặt locale cho request hiện tại
    setRequestLocale(locale);

    // Lấy messages và metadata từ JSON dịch
    const messages = await getMessages({ locale });
    const t = await getTranslations({ locale, namespace: "Metadata" });
    const title = t("title");
    const description = t("description");

    return (
        <html lang={locale} suppressHydrationWarning>
        <head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="icon" href="/h.png" type="image/png" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Providers>
                <div className="layout">{props.children}</div>
            </Providers>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
