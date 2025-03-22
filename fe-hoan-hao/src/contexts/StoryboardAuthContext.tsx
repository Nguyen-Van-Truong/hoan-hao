import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "react-hot-toast";

// Định nghĩa kiểu dữ liệu cho người dùng
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Định nghĩa kiểu dữ liệu cho context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

// Tạo context
const StoryboardAuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Mock user cho demo
const MOCK_USER: User = {
  id: "1",
  email: "1@gmail.com",
  name: "Người Dùng",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user123",
};

// Mock password cho demo
const MOCK_PASSWORD = "123456";

// Provider component cho storyboard (không sử dụng useNavigate)
export const StoryboardAuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(MOCK_USER); // Mặc định đã đăng nhập trong storyboard
  const [isLoading, setIsLoading] = useState(false);

  // Hàm đăng nhập
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Kiểm tra thông tin đăng nhập
      if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
        setUser(MOCK_USER);
        toast.success("Đăng nhập thành công!");
        return true;
      } else {
        toast.error("Email hoặc mật khẩu không đúng");
        return false;
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi đăng nhập");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng ký
  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Kiểm tra email đã tồn tại chưa
      if (email === MOCK_USER.email) {
        toast.error("Email đã được sử dụng");
        return false;
      }

      // Trong thực tế, bạn sẽ gửi thông tin đăng ký đến server
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return true;
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi đăng ký");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    toast.success("Đã đăng xuất");
  };

  // Hàm khôi phục mật khẩu
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Kiểm tra email có tồn tại không
      if (email === MOCK_USER.email) {
        toast.success(
          "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn",
        );
        return true;
      } else {
        toast.error("Email không tồn tại trong hệ thống");
        return false;
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Giá trị context
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <StoryboardAuthContext.Provider value={value}>
      {children}
    </StoryboardAuthContext.Provider>
  );
};

// Hook để sử dụng context
export const useStoryboardAuth = () => {
  const context = useContext(StoryboardAuthContext);
  if (context === undefined) {
    throw new Error(
      "useStoryboardAuth phải được sử dụng trong StoryboardAuthProvider",
    );
  }
  return context;
};
