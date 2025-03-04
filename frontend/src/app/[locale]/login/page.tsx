// frontend/src/app/[locale]/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import styles from "./Login.module.css";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { login, getCookie } from "../../api/authApi";

// Define form data types
interface LoginFormData {
    usernameOrEmailOrPhone: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const locale = useLocale();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    const [loading, setLoading] = useState(false);

    // Kiểm tra token khi load trang
    useEffect(() => {
        const accessToken = getCookie("accessToken");
        if (accessToken) {
            router.push(`/${locale}`);
        }
    }, [router, locale]);

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        setLoading(true);
        try {
            await login(data.usernameOrEmailOrPhone, data.password); // Gọi hàm login mà không gán biến
            toast.success("Đăng nhập thành công!");
            router.push(`/${locale}`);
        } catch (error) {
            toast.error((error as Error).message || "Đã xảy ra lỗi khi đăng nhập.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.loginContainer}
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={styles.loginBox}
            >
                <h2 className={styles.title}>Đăng Nhập</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Tên đăng nhập, Email hoặc Số điện thoại</label>
                        <input
                            type="text"
                            {...register("usernameOrEmailOrPhone", { required: "Vui lòng nhập thông tin đăng nhập" })}
                            className={styles.inputField}
                        />
                        {errors.usernameOrEmailOrPhone?.message && (
                            <p className="text-red-500 text-sm">{String(errors.usernameOrEmailOrPhone.message)}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Mật khẩu</label>
                        <input
                            type="password"
                            {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                            className={styles.inputField}
                        />
                        {errors.password?.message && (
                            <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
                        )}
                    </div>

                    <p className={styles.forgotPasswordText}>
                        <Link href={`/${locale}/forgot-password`} className={styles.forgotPasswordLink}>
                            Quên mật khẩu?
                        </Link>
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className={styles.loginButton}
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                    </motion.button>
                </form>

                <p className={styles.registerText}>
                    Chưa có tài khoản?{" "}
                    <Link href={`/${locale}/register`} className={styles.registerLink}>
                        Đăng ký ngay
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
}