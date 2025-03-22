import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";

// Schema xác thực
const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
  const { confirmResetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy token từ URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token || !email) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await confirmResetPassword(email, token, data.password);
      if (success) {
        setIsSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logointab.png"
              alt="Hoàn Hảo Logo"
              className="h-16 w-16 mb-4"
            />
          </div>
          <h1 className="text-2xl font-bold">Liên kết không hợp lệ</h1>
          <p className="text-muted-foreground mt-4">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu
            cầu liên kết mới.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button asChild variant="outline">
            <Link to="/forgot-password">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại quên mật khẩu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Mật khẩu đã được đặt lại</h1>
          <img
            src="/logointab.png"
            alt="Hoàn Hảo Logo"
            className="h-12 w-12 my-3"
          />
          <p className="text-muted-foreground mt-4">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập
            bằng mật khẩu mới của mình.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button asChild className="bg-primary hover:bg-primary-dark">
            <Link to="/login">Đăng nhập ngay</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="text-center">
        <div className="flex flex-col items-center mb-2">
          <img
            src="/logointab.png"
            alt="Hoàn Hảo Logo"
            className="h-16 w-16 mb-4"
          />
          <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
          <p className="text-muted-foreground mt-2">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={
                errors.confirmPassword ? "border-destructive pr-10" : "pr-10"
              }
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Đặt lại mật khẩu"
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
