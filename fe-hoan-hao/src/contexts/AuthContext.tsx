import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  RegisterRequest, 
  LoginRequest, 
  LoginResponse,
  UserProfile,
  TOKEN_STORAGE_KEY, 
  REFRESH_TOKEN_STORAGE_KEY
} from "@/api";
import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  requestPasswordReset as apiRequestPasswordReset,
  resetPassword as apiResetPassword,
  getCurrentUserProfile,
  updateUserProfile as apiUpdateUserProfile,
  updateProfilePicture as apiUpdateProfilePicture,
  updateCoverPicture as apiUpdateCoverPicture
} from "@/api";

// Định nghĩa kiểu dữ liệu cho context
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmailOrPhone: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  confirmResetPassword: (token: string, newPassword: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  updateProfilePicture: (imageFile: File) => Promise<string | null>;
  updateCoverPicture: (imageFile: File) => Promise<string | null>;
}

// Tạo context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra xem người dùng đã đăng nhập chưa khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        try {
          // Gọi API để lấy thông tin người dùng từ token
          const userProfile = await getCurrentUserProfile();
          setUser(userProfile);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
          // Nếu token không hợp lệ, đăng xuất người dùng
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Hàm đăng nhập
  const login = async (usernameOrEmailOrPhone: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Gọi API đăng nhập
      const response: LoginResponse = await apiLoginUser({ 
        usernameOrEmailOrPhone, 
        password 
      });
      
      // Lưu token vào localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);
      }
      
      // Sau khi đăng nhập thành công, lấy thông tin người dùng
      const userProfile = await getCurrentUserProfile();
      setUser(userProfile);
      
      toast.success("Đăng nhập thành công!");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi khi đăng nhập");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng ký
  const register = async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Gọi API đăng ký
      await apiRegisterUser(userData);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi khi đăng ký");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    setUser(null);
    navigate("/login");
    toast.success("Đã đăng xuất");
  };

  // Hàm khôi phục mật khẩu
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Gọi API khôi phục mật khẩu
      await apiRequestPasswordReset(email);
      toast.success("Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xác nhận đặt lại mật khẩu
  const confirmResetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Gọi API đặt lại mật khẩu
      await apiResetPassword(token, newPassword);
      toast.success("Mật khẩu đã được đặt lại thành công");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi khi đặt lại mật khẩu");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm cập nhật thông tin profile
  const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Gọi API cập nhật profile
      await apiUpdateUserProfile(profileData);
      
      // Sau khi cập nhật thành công, cập nhật lại state user
      if (user) {
        setUser({ ...user, ...profileData });
      }
      
      toast.success("Cập nhật thông tin thành công");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi khi cập nhật thông tin");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm cập nhật ảnh đại diện
  const updateProfilePicture = async (imageFile: File): Promise<string | null> => {
    setIsLoading(true);

    try {
      // Gọi API cập nhật ảnh đại diện
      const response = await apiUpdateProfilePicture(imageFile);
      
      // Sau khi cập nhật thành công, cập nhật lại state user
      if (user) {
        setUser({ ...user, profile_picture_url: response.url });
      }
      
      toast.success("Cập nhật ảnh đại diện thành công");
      return response.url;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi khi cập nhật ảnh đại diện");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm cập nhật ảnh bìa
  const updateCoverPicture = async (imageFile: File): Promise<string | null> => {
    setIsLoading(true);

    try {
      // Gọi API cập nhật ảnh bìa
      const response = await apiUpdateCoverPicture(imageFile);
      
      // Sau khi cập nhật thành công, cập nhật lại state user
      if (user) {
        setUser({ ...user, cover_picture_url: response.url });
      }
      
      toast.success("Cập nhật ảnh bìa thành công");
      return response.url;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi khi cập nhật ảnh bìa");
      }
      return null;
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
    confirmResetPassword,
    updateProfile,
    updateProfilePicture,
    updateCoverPicture,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để sử dụng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};
