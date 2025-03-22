import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

// Schema xác thực
const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await resetPassword(data.email);
      if (success) {
        // Trong môi trường thực tế, email sẽ chứa một liên kết với token
        // Ở đây chúng ta giả lập bằng cách tạo một token ngẫu nhiên
        const demoToken = Math.random().toString(36).substring(2, 15);
        console.log(
          `Demo reset link: /reset-password?token=${demoToken}&email=${data.email}`,
        );
        setIsSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Kiểm tra email của bạn</h1>
          <img
            src="/logointab.png"
            alt="Hoàn Hảo Logo"
            className="h-12 w-12 my-3"
          />
          <p className="text-muted-foreground mt-4">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui
            lòng kiểm tra hộp thư đến và thư rác.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Nếu bạn không nhận được email trong vòng vài phút, hãy kiểm tra thư
            mục spam hoặc thử lại.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button asChild variant="outline">
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng nhập
            </Link>
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
          <h1 className="text-2xl font-bold">Quên mật khẩu?</h1>
          <p className="text-muted-foreground mt-2">
            Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt
            lại mật khẩu
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            placeholder="email@example.com"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
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
              Đang gửi...
            </>
          ) : (
            "Gửi hướng dẫn đặt lại"
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

      <div className="text-center text-xs text-muted-foreground">
        <p>
          Email demo để thử tính năng: <br />
          user@example.com
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
