import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthLayoutProps {
  requireAuth?: boolean;
}

const AuthLayout = ({ requireAuth = false }: AuthLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Hiển thị màn hình loading khi đang kiểm tra trạng thái đăng nhập
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nếu yêu cầu đăng nhập nhưng chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập và đang truy cập trang đăng nhập/đăng ký, chuyển hướng đến trang chủ
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Phần bên trái - Hình ảnh và thông tin */}
      <div className="hidden lg:flex flex-col w-1/2 bg-primary p-10 text-primary-foreground justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logointab.png"
              alt="Hoàn Hảo Logo"
              className="h-10 w-10"
            />
            <h1 className="text-3xl font-bold">Hoàn Hảo</h1>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold">
            Chào mừng bạn đến với Hoàn Hảo!
          </h2>
          <p className="text-xl opacity-90">
            Chia sẻ khoảnh khắc, kết nối với bạn bè và khám phá những điều mới
            mẻ trên Hoàn Hảo - nơi mọi kết nối đều hoàn hảo.
          </p>
          <div className="flex space-x-4">
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-lg font-medium">+2 triệu</p>
              <p className="text-sm opacity-80">Người dùng</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-lg font-medium">+150</p>
              <p className="text-sm opacity-80">Quốc gia</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-lg font-medium">+10 triệu</p>
              <p className="text-sm opacity-80">Bài đăng mỗi ngày</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm opacity-70">
            © 2023 Hoàn Hảo. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>

      {/* Phần bên phải - Form đăng nhập/đăng ký */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
