// frontend/src/app/[locale]/register/page.tsx
"use client";

import {useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import Link from "next/link";
import styles from "./Register.module.css";
import {motion} from "framer-motion";
import {useLocale} from "next-intl";
import {register} from "../../api/authApi";

// Define form data types
interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    dateOfBirth: string;
    countryCode: string;
    phoneNumber: string;
}

interface RegisterResponse {
    message: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const locale = useLocale();
    const {register: formRegister, handleSubmit, formState: {errors}, watch} = useForm<RegisterFormData>();
    const [loading, setLoading] = useState(false);

    const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
        setLoading(true);
        try {
            const response: RegisterResponse = await register(
                data.username,
                data.email,
                data.password,
                data.fullName,
                data.dateOfBirth,
                data.countryCode,
                data.phoneNumber
            );
            toast.success(response.message || "Đăng ký thành công!");
            router.push(`/${locale}/login`);
        } catch (error) {
            toast.error((error as Error).message || "Đã xảy ra lỗi khi đăng ký.");
        } finally {
            setLoading(false);
        }
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
                        <label className={styles.inputLabel}>Tên đăng nhập</label>
                        <input
                            type="text"
                            {...formRegister("username", {required: "Vui lòng nhập tên đăng nhập"})}
                            className={styles.inputField}
                        />
                        {errors.username?.message && (
                            <p className="text-red-500 text-sm">{String(errors.username.message)}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Email</label>
                        <input
                            type="email"
                            {...formRegister("email", {required: "Vui lòng nhập email"})}
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
                            {...formRegister("password", {
                                required: "Vui lòng nhập mật khẩu",
                                minLength: {value: 6, message: "Mật khẩu ít nhất 6 ký tự"},
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
                            {...formRegister("confirmPassword", {
                                required: "Vui lòng nhập lại mật khẩu",
                                validate: (value) => value === watch("password") || "Mật khẩu không khớp",
                            })}
                            className={styles.inputField}
                        />
                        {errors.confirmPassword?.message && (
                            <p className="text-red-500 text-sm">{String(errors.confirmPassword.message)}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Họ và tên</label>
                        <input
                            type="text"
                            {...formRegister("fullName", {required: "Vui lòng nhập họ và tên"})}
                            className={styles.inputField}
                        />
                        {errors.fullName?.message && (
                            <p className="text-red-500 text-sm">{String(errors.fullName.message)}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Ngày sinh</label>
                        <input
                            type="date"
                            {...formRegister("dateOfBirth", {required: "Vui lòng nhập ngày sinh"})}
                            className={styles.inputField}
                        />
                        {errors.dateOfBirth?.message && (
                            <p className="text-red-500 text-sm">{String(errors.dateOfBirth.message)}</p>
                        )}
                    </div>

                    {/*<div className={styles.inputGroup}>*/}
                    {/*    <label className={styles.inputLabel}>Mã quốc gia</label>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        {...formRegister("countryCode", {required: "Vui lòng nhập mã quốc gia"})}*/}
                    {/*        className={styles.inputField}*/}
                    {/*        placeholder="+84"*/}
                    {/*    />*/}
                    {/*    {errors.countryCode?.message && (*/}
                    {/*        <p className="text-red-500 text-sm">{String(errors.countryCode.message)}</p>*/}
                    {/*    )}*/}
                    {/*</div>*/}

                    {/*<div className={styles.inputGroup}>*/}
                    {/*    <label className={styles.inputLabel}>Số điện thoại</label>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        {...formRegister("phoneNumber", {required: "Vui lòng nhập số điện thoại"})}*/}
                    {/*        className={styles.inputField}*/}
                    {/*    />*/}
                    {/*    {errors.phoneNumber?.message && (*/}
                    {/*        <p className="text-red-500 text-sm">{String(errors.phoneNumber.message)}</p>*/}
                    {/*    )}*/}
                    {/*</div>*/}

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
                    <Link href={`/${locale}/login`} className={styles.loginLink}>Đăng nhập ngay</Link>
                </p>
            </motion.div>
        </motion.div>
    );
}