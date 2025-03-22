import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar } from "lucide-react";
import { RegisterRequest } from "@/api";
import { toast } from "react-hot-toast";

// Schema xác thực
const registerSchema = z
    .object({
      fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
      username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
      email: z.string().email("Email không hợp lệ"),
      password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
      confirmPassword: z
          .string()
          .min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
      dateOfBirth: z.string().min(1, "Ngày sinh không được để trống"),
      phoneNumber: z
          .string()
          .optional()
          .refine(
              (val) => !val || /^[0][0-9]{8,10}$/.test(val), // Kiểm tra định dạng số điện thoại (bắt đầu bằng 0, 9-11 số)
              { message: "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 9-11 số)" }
          ),
      countryCode: z.string().default("+84"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Mật khẩu không khớp",
      path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      phoneNumber: "",
      countryCode: "+84",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // Tạo dữ liệu để gửi đến API
      const userData: RegisterRequest = {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        countryCode: data.countryCode,
        // Chỉ gửi phoneNumber nếu nó không rỗng
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
      };

      // Gọi hàm đăng ký từ AuthContext
      const success = await registerAuth(userData);

      if (success) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi khi đăng ký");
      }
    } finally {
      setIsSubmitting(false); // Đặt lại trạng thái sau khi hoàn tất
    }
  };

  return (
      <div className="space-y-6 w-full max-w-md">
        <div className="text-center">
          <div className="flex flex-col items-center mb-2">
            <img
                src="/logointab.png"
                alt="Hoàn Hảo Logo"
                className="h-16 w-16 mb-4"
            />
            <h1 className="text-2xl font-bold">Tham gia Hoàn Hảo</h1>
            <p className="text-muted-foreground mt-2">
              Đăng ký để kết nối và chia sẻ những khoảnh khắc đáng nhớ
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Họ tên
            </label>
            <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                {...register("fullName")}
                className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
                <p className="text-destructive text-sm">
                  {errors.fullName.message}
                </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Tên đăng nhập
            </label>
            <Input
                id="username"
                placeholder="username123"
                {...register("username")}
                className={errors.username ? "border-destructive" : ""}
            />
            {errors.username && (
                <p className="text-destructive text-sm">
                  {errors.username.message}
                </p>
            )}
          </div>

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

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-medium">
              Ngày sinh
            </label>
            <div className="relative">
              <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className={errors.dateOfBirth ? "border-destructive" : ""}
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.dateOfBirth && (
                <p className="text-destructive text-sm">
                  {errors.dateOfBirth.message}
                </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Số điện thoại (tùy chọn)
            </label>
            <div className="flex">
              <div className="w-20 mr-2">
                <Input
                    id="countryCode"
                    defaultValue="+84"
                    {...register("countryCode")}
                />
              </div>
              <Input
                  id="phoneNumber"
                  placeholder="0987654321"
                  {...register("phoneNumber")}
                  className={errors.phoneNumber ? "border-destructive" : ""}
              />
            </div>
            {errors.phoneNumber && (
                <p className="text-destructive text-sm">
                  {errors.phoneNumber.message}
                </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </label>
            <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
            />
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
            <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
            />
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
                  Đang đăng ký...
                </>
            ) : (
                "Đăng ký"
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Hoặc đăng ký với
          </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
              variant="outline"
              className="w-full flex items-center"
              type="button"
          >
            <img src="/google.svg" alt="Google" className="h-4 w-4 mr-2" />
            Google
          </Button>
          <Button
              variant="outline"
              className="w-full flex items-center"
              type="button"
          >
            <img src="/facebook.svg" alt="Facebook" className="h-4 w-4 mr-2" />
            Facebook
          </Button>
        </div>
      </div>
  );
};

export default RegisterForm;