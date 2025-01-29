// frontend/src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { mockForgotPassword } from "../api/mockAuth";
import styles from "./ForgotPassword.module.css";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const response = await mockForgotPassword(data.email);
            toast.success(response.message);
            router.push("/login");
        } catch (error: any) {
            toast.error(error.message);
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.forgotContainer}
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={styles.forgotBox}
            >
                <h2 className={styles.title}>Quên Mật Khẩu</h2>
                <p className={styles.description}>
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Email</label>
                        <input
                            type="email"
                            {...register("email", { required: "Vui lòng nhập email" })}
                            className={styles.inputField}
                        />
                        {errors.email?.message && (
                            <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? "Đang gửi..." : "Gửi Liên Kết"}
                    </motion.button>
                </form>

                <p className={styles.loginText}>
                    Quay lại{" "}
                    <Link href="/login" className={styles.loginLink}>Đăng nhập</Link>
                </p>
            </motion.div>
        </motion.div>
    );
}
