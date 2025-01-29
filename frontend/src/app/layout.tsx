// src/app/layout.tsx
'use client';

import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <title>Hoàn Hảo</title>
            <link rel="icon" href="/h.png" type="image/png"/>
            <meta name="description" content="Trang web tuyệt vời"/>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
            <div className="layout">{children}</div>
        </Providers>
        </body>
        </html>
    );
}
