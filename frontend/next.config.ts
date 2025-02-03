// frontend/next.config.ts
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const nextConfig: NextConfig = withNextIntl({
    reactStrictMode: true,
});

export default nextConfig;
