import React from "react";
import { useStoryboardAuth } from "@/contexts/StoryboardAuthContext";

interface AuthLayoutProps {
  requireAuth?: boolean;
  children: React.ReactNode;
}

const StoryboardAuthLayout = ({
  requireAuth = false,
  children,
}: AuthLayoutProps) => {
  const { isAuthenticated, isLoading } = useStoryboardAuth();

  // Hiển thị màn hình loading khi đang kiểm tra trạng thái đăng nhập
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Trong storyboard, chúng ta chỉ hiển thị nội dung mà không chuyển hướng
  return (
    <div className="min-h-screen bg-background flex">
      {/* Phần bên trái - Hình ảnh và thông tin */}
      <div className="hidden lg:flex flex-col w-1/2 bg-primary p-10 text-primary-foreground justify-between">
        <div>
          <h1 className="text-3xl font-bold">PinkSocial</h1>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold">
            Kết nối với bạn bè và thế giới xung quanh bạn.
          </h2>
          <p className="text-xl opacity-90">
            Chia sẻ khoảnh khắc, kết nối với bạn bè và khám phá những điều mới
            mẻ trên PinkSocial.
          </p>
          <div className="flex space-x-4">
            <div className="bg-primary-foreground/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-lg font-medium">+2 triệu</p>
              <p className="text-sm opacity-80">Người dùng</p>
            </div>
            <div className="bg-primary-foreground/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-lg font-medium">+150</p>
              <p className="text-sm opacity-80">Quốc gia</p>
            </div>
            <div className="bg-primary-foreground/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-lg font-medium">+10 triệu</p>
              <p className="text-sm opacity-80">Bài đăng mỗi ngày</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm opacity-70">
            © 2023 PinkSocial. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>

      {/* Phần bên phải - Form đăng nhập/đăng ký */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
};

export default StoryboardAuthLayout;
