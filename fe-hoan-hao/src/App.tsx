import { Suspense, useEffect, lazy } from "react";
import {
  Routes,
  Route,
  useLocation,
  useRoutes,
  Navigate,
} from "react-router-dom";
// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const Profile = lazy(() => import("./pages/Profile"));
const Friends = lazy(() => import("./pages/Friends"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Messages = lazy(() => import("./pages/Messages"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Games = lazy(() => import("./pages/Games"));
const Groups = lazy(() => import("./pages/Groups"));
const GroupDetail = lazy(() => import("./pages/GroupDetail"));
const GroupSettings = lazy(() => import("./pages/GroupSettings"));
const GroupEdit = lazy(() => import("./pages/GroupEdit"));
const MyGroups = lazy(() => import("./pages/MyGroups"));
const CreateGroup = lazy(() => import("./pages/CreateGroup"));
import routes from "tempo-routes";
import { useImageLazyLoading } from "./hooks/useImageLazyLoading";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import AuthLayout from "./components/auth/AuthLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import GameDetail from "./components/games/GameDetail";

function App() {
  const location = useLocation();

  // Apply image lazy loading across the app
  useImageLazyLoading();

  useEffect(() => {
    // Update page title based on current route
    let pageTitle = "Trang chủ";

    if (location.pathname === "/profile") {
      pageTitle = "Hồ sơ";
    } else if (location.pathname.startsWith("/friends")) {
      pageTitle = "Bạn bè";
    } else if (location.pathname === "/groups") {
      pageTitle = "Nhóm";
    } else if (location.pathname === "/games") {
      pageTitle = "Trò chơi";
    } else if (location.pathname === "/messages") {
      pageTitle = "Tin nhắn";
    } else if (location.pathname.startsWith("/post/")) {
      // Post detail pages will set their own title in the component
      return;
    } else if (location.pathname === "/search") {
      pageTitle = "Tìm kiếm";
    } else if (location.pathname === "/login") {
      pageTitle = "Đăng nhập";
    } else if (location.pathname === "/register") {
      pageTitle = "Đăng ký";
    } else if (location.pathname === "/forgot-password") {
      pageTitle = "Quên mật khẩu";
    } else if (location.pathname === "/reset-password") {
      pageTitle = "Đặt lại mật khẩu";
    }

    document.title = `${pageTitle} | Hoàn Hảo`;
  }, [location]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <LanguageProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <>
            {/* For the tempo routes */}
            {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/messages" element={<Messages />} />
                <Route
                  path="/messages/:conversationId"
                  element={<Messages />}
                />
                <Route
                  path="/profile"
                  element={<Profile isCurrentUser={true} />}
                />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/friends" element={<Friends />} />
                <Route
                  path="/friends/suggestions"
                  element={<Friends/>}
                />
                <Route
                  path="/friends/requests"
                  element={<Friends/>}
                />
                <Route path="/games" element={<Games />} />
                <Route path="/games/:gameId" element={<GameDetail />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/create" element={<CreateGroup />} />
                <Route path="/groups/my" element={<MyGroups />} />
                <Route path="/groups/:groupId" element={<GroupDetail />} />
                <Route
                  path="/groups/:groupId/settings"
                  element={<GroupSettings />}
                />
                <Route path="/groups/:groupId/edit" element={<GroupEdit />} />
                <Route
                  path="/post/:username/:postId"
                  element={<PostDetail />}
                />
                <Route path="/post/:username" element={<PostDetail />} />
                <Route path="/search" element={<SearchPage />} />
              </Route>

              {/* Add this before any catchall route */}
              {import.meta.env.VITE_TEMPO === "true" && (
                <Route path="/tempobook/*" />
              )}

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </>
        </AuthProvider>
      </LanguageProvider>
    </Suspense>
  );
}

export default App;
