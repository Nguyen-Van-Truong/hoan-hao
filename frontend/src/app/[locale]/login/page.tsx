// frontend/src/app/[locale]/login/page.tsx
"use client";

import {useState, useEffect} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import Link from "next/link";
import {mockLogin} from "../../api/mockAuth";
import styles from "./Login.module.css";
import {motion} from "framer-motion";
import {useLocale} from "next-intl"; // ✅ Use useLocale to get current locale

// Define form data types
interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const locale = useLocale(); // Get the current locale
    const {register, handleSubmit, formState: {errors}} = useForm<LoginFormData>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push(`/${locale}`); // Include locale when redirecting
        }
    }, [router, locale]);

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        setLoading(true);
        try {
            const response = await mockLogin(data.email, data.password);
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            toast.success("Đăng nhập thành công!");
            router.push(`/${locale}`); // Include locale when redirecting
        } catch (error) {
            toast.error((error as Error).message);
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5}}
            className={styles.loginContainer}
        >
            <motion.div
                initial={{y: -20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{duration: 0.6}}
                className={styles.loginBox}
            >
                <h2 className={styles.title}>Đăng Nhập</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Email</label>
                        <input
                            type="email"
                            {...register("email", {required: "Vui lòng nhập email"})}
                            className={styles.inputField}
                        />
                        {errors.email?.message && (
                            <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Mật khẩu</label>
                        <input
                            type="password"
                            {...register("password", {required: "Vui lòng nhập mật khẩu"})}
                            className={styles.inputField}
                        />
                        {errors.password?.message && (
                            <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
                        )}
                    </div>

                    {/* Liên kết Quên mật khẩu */}
                    <p className={styles.forgotPasswordText}>
                        <Link href={`/${locale}/forgot-password`} className={styles.forgotPasswordLink}>Quên mật
                            khẩu?</Link>
                    </p>

                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.97}}
                        type="submit"
                        disabled={loading}
                        className={styles.loginButton}
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                    </motion.button>
                </form>

                <p className={styles.registerText}>
                    Chưa có tài khoản?{" "}
                    <Link href={`/${locale}/register`} className={styles.registerLink}>Đăng ký ngay</Link>
                </p>
            </motion.div>
        </motion.div>
    );
}
