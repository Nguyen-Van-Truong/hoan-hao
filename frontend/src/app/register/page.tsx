// frontend/src/app/register/page.tsx
"use client";

import {useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import Link from "next/link";
import {mockRegister} from "../api/mockAuth";
import styles from "./Register.module.css";
import {motion} from "framer-motion";

interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const {register, handleSubmit, formState: {errors}, watch} = useForm<RegisterFormData>();
    const [loading, setLoading] = useState(false);

    const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
        setLoading(true);
        try {
            const response = await mockRegister(data.email, data.password);
            toast.success(response.message);
            router.push("/login");
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
            className={styles.registerContainer}
        >
            <motion.div
                initial={{y: -20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{duration: 0.6}}
                className={styles.registerBox}
            >
                <h2 className={styles.title}>Đăng Ký</h2>

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
                            {...register("password", {
                                required: "Vui lòng nhập mật khẩu",
                                minLength: {value: 6, message: "Mật khẩu ít nhất 6 ký tự"}
                            })}
                            className={styles.inputField}
                        />
                        {errors.password?.message && (
                            <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            {...register("confirmPassword", {
                                required: "Vui lòng nhập lại mật khẩu",
                                validate: (value) => value === watch("password") || "Mật khẩu không khớp",
                            })}
                            className={styles.inputField}
                        />
                        {errors.confirmPassword?.message && (
                            <p className="text-red-500 text-sm">{String(errors.confirmPassword.message)}</p>
                        )}
                    </div>

                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.97}}
                        type="submit"
                        disabled={loading}
                        className={styles.registerButton}
                    >
                        {loading ? "Đang đăng ký..." : "Đăng Ký"}
                    </motion.button>
                </form>

                <p className={styles.loginText}>
                    Đã có tài khoản?{" "}
                    <Link href="../login" className={styles.loginLink}>Đăng nhập ngay</Link>
                </p>
            </motion.div>
        </motion.div>
    );
}
