// frontend/src/app/[locale]/forgot-password/page.tsx
"use client";

import {useState} from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import Link from "next/link";
import {mockForgotPassword} from "../../api/mockAuth";
import styles from "./ForgotPassword.module.css";
import {motion} from "framer-motion";
import {useLocale} from "next-intl"; // ✅ Import useLocale to get current locale

// Define form data types
interface ForgotPasswordFormData {
    email: string;
}

export default function ForgotPasswordPage() {
    const router = useRouter();
    const locale = useLocale(); // Get the current locale
    const {register, handleSubmit, formState: {errors}} = useForm<ForgotPasswordFormData>();
    const [loading, setLoading] = useState(false);

    // Submit handler for the form
    const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
        setLoading(true);
        try {
            const response = await mockForgotPassword(data.email);
            toast.success(response.message);
            router.push(`/${locale}/reset-password`); // Navigate with locale
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
            className={styles.forgotContainer}
        >
            <motion.div
                initial={{y: -20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{duration: 0.6}}
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
                            {...register("email", {required: "Vui lòng nhập email"})}
                            className={styles.inputField}
                        />
                        {errors.email?.message && (
                            <p className="text-red-500 text-sm">{errors.email.message}</p>
                        )}
                    </div>

                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.97}}
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? "Đang gửi..." : "Gửi Liên Kết"}
                    </motion.button>
                </form>

                <p className={styles.loginText}>
                    Quay lại{" "}
                    <Link href={`/${locale}/login`} className={styles.loginLink}>Đăng
                        nhập</Link> {/* Include locale in the link */}
                </p>
            </motion.div>
        </motion.div>
    );
}
