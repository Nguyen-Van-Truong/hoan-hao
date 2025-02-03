// frontend/src/app/reset-password/page.tsx
"use client";

import {useState} from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import {useRouter, useSearchParams} from "next/navigation";
import {toast} from "react-toastify";
import styles from "./ResetPassword.module.css";
import {motion} from "framer-motion";
import {mockResetPassword} from "@/app/api/mockAuth";

interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "invalid-token"; // Mặc định token là không hợp lệ nếu không có trong URL
    const {register, handleSubmit, formState: {errors}, watch} = useForm<ResetPasswordFormData>();
    const [loading, setLoading] = useState(false);

    const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
        setLoading(true);
        try {
            const response = await mockResetPassword(token, data.newPassword);
            toast.success(response.message);
            router.push("/login");
        } catch (error) {
            toast.error((error as Error).message);
        }
        setLoading(false);
    };

    return (
        <motion.div className={styles.resetContainer} initial={{opacity: 0, scale: 0.95}}
                    animate={{opacity: 1, scale: 1}} transition={{duration: 0.5}}>
            <motion.div className={styles.resetBox} initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}}
                        transition={{duration: 0.6}}>
                <h2 className={styles.title}>Đặt Lại Mật Khẩu</h2>
                <p className={styles.description}>Nhập mật khẩu mới của bạn.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Mật khẩu mới</label>
                        <input type="password" {...register("newPassword", {
                            required: "Vui lòng nhập mật khẩu mới",
                            minLength: {value: 6, message: "Mật khẩu ít nhất 6 ký tự"}
                        })} className={styles.inputField}/>
                        {errors.newPassword?.message &&
                            <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Xác nhận mật khẩu</label>
                        <input type="password" {...register("confirmPassword", {
                            required: "Vui lòng nhập lại mật khẩu",
                            validate: (value) => value === watch("newPassword") || "Mật khẩu không khớp"
                        })} className={styles.inputField}/>
                        {errors.confirmPassword?.message &&
                            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                    </div>

                    <motion.button whileHover={{scale: 1.05}} whileTap={{scale: 0.97}} type="submit" disabled={loading}
                                   className={styles.submitButton}>
                        {loading ? "Đang đặt lại..." : "Xác nhận"}
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
}
