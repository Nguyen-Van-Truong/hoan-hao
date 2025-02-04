// frontend/src/app/[locale]/layout.tsx
import {Geist, Geist_Mono} from "next/font/google";
import "@/app/globals.css";
import Providers from "@/app/providers";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";
import {setRequestLocale} from "next-intl/server";
import {JSX} from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Kiểm tra locale hợp lệ
function isValidLocale(locale: string): locale is 'vi' | 'en' {
    return routing.locales.includes(locale as 'vi' | 'en');
}


export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: React.ReactNode;
    params: { locale: string }; // Định nghĩa rõ ràng kiểu params
}): Promise<JSX.Element> {
    const { locale } = params;

    // Kiểm tra locale hợp lệ
    if (!isValidLocale(locale)) {
        notFound();
    }

    // Đặt locale
    setRequestLocale(locale);

    // ✅ Lấy messages theo locale
    const messages = await getMessages({ locale });

    // ✅ Lấy metadata từ JSON dịch
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
                <div className="layout">{children}</div>
            </Providers>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
