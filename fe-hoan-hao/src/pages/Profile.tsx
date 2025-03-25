import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LazyThreeColumnLayout from "../components/layout/LazyThreeColumnLayout";
import { Avatar } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import PostFeed from "../components/post/PostFeed";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrentUserProfile,
  getPublicUserProfile,
  getFriends,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  blockUser,
  unblockUser
} from "@/api/services/userApi";
import {
  Camera,
  Image,
  MapPin,
  Briefcase,
  GraduationCap,
  Home,
  Heart,
  Mail,
  MoreHorizontal,
  UserPlus,
  MessageCircle,
  Pencil,
  Loader2,
  Upload,
  UserMinus,
  UserX,
  UserCheck,
  Ban,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileData {
  id?: number;
  username: string;
  full_name: string;
  email?: string;
  profile_picture_url?: string;
  cover_picture_url?: string;
  bio?: string;
  date_of_birth?: string;
  phone?: string;
  work?: string;
  education?: string;
  relationship?: string;
  location?: string;
  is_verified?: boolean;
  created_at?: string;
  // Thống kê cơ bản
  friend_count?: number;
  photos_count?: number;
  videos_count?: number;
}

interface UserPost {
  id: string;
  type: 'regular' | 'gallery';
  author: {
    name: string;
    avatar: string;
    timestamp: string;
  };
  content: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  images?: string[];
  totalImages?: number;
  commentsList: any[];
}

// Định nghĩa kiểu dữ liệu cho props của EditProfileDialog
interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate?: (updatedData: any) => void;
  initialData: {
    name: string;
    bio: string;
    location: string;
    work: string;
    education: string;
    relationship: string;
    avatar: string;
    coverPhoto: string;
  };
}

interface EditState {
  full_name: string;
  bio: string;
  location: string;
  work: string;
  education: string;
  relationship: string;
  profile_picture?: File | null;
  cover_picture?: File | null;
}

// Component EditProfileDialog được nhúng trực tiếp vào file
const EditProfileDialog = ({
                             open,
                             onOpenChange,
                             onProfileUpdate,
                             initialData,
                           }: EditProfileDialogProps) => {
  const { t } = useLanguage();
  const { updateProfile, updateProfilePicture, updateCoverPicture } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [editData, setEditData] = useState<EditState>({
    full_name: initialData.name,
    bio: initialData.bio || "",
    location: initialData.location || "",
    work: initialData.work || "",
    education: initialData.education || "",
    relationship: initialData.relationship || "",
    profile_picture: null,
    cover_picture: null,
  });

  const [previewAvatar, setPreviewAvatar] = useState<string>(initialData.avatar);
  const [previewCover, setPreviewCover] = useState<string>(initialData.coverPhoto);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý thay đổi select
  const handleSelectChange = (value: string, name: string) => {
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn file ảnh đại diện
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData((prev) => ({ ...prev, profile_picture: file }));
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  // Xử lý chọn file ảnh bìa
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData((prev) => ({ ...prev, cover_picture: file }));
      setPreviewCover(URL.createObjectURL(file));
    }
  };

  // Xử lý cập nhật ảnh đại diện
  const handleUpdateAvatar = async () => {
    if (!editData.profile_picture) return;

    setIsUploadingAvatar(true);
    try {
      const newUrl = await updateProfilePicture(editData.profile_picture);
      if (newUrl) {
        setPreviewAvatar(newUrl);
        // Xóa file sau khi đã upload thành công
        setEditData(prev => ({ ...prev, profile_picture: null }));
        if (onProfileUpdate) {
          onProfileUpdate({ avatar: newUrl });
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh đại diện:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Xử lý cập nhật ảnh bìa
  const handleUpdateCover = async () => {
    if (!editData.cover_picture) return;

    setIsUploadingCover(true);
    try {
      const newUrl = await updateCoverPicture(editData.cover_picture);
      if (newUrl) {
        setPreviewCover(newUrl);
        // Xóa file sau khi đã upload thành công
        setEditData(prev => ({ ...prev, cover_picture: null }));
        if (onProfileUpdate) {
          onProfileUpdate({ coverPhoto: newUrl });
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh bìa:", error);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Tạo object chỉ chứa thông tin cần cập nhật (không có files)
      const profileDataToUpdate = {
        full_name: editData.full_name,
        bio: editData.bio,
        location: editData.location,
        work: editData.work,
        education: editData.education,
        relationship: editData.relationship,
      };

      // Nếu có ảnh đại diện mới nhưng chưa upload
      if (editData.profile_picture) {
        try {
          setIsUploadingAvatar(true);
          const newAvatarUrl = await updateProfilePicture(editData.profile_picture);
          if (newAvatarUrl && onProfileUpdate) {
            onProfileUpdate({ avatar: newAvatarUrl });
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật ảnh đại diện:", error);
          toast.error("Không thể cập nhật ảnh đại diện");
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Nếu có ảnh bìa mới nhưng chưa upload
      if (editData.cover_picture) {
        try {
          setIsUploadingCover(true);
          const newCoverUrl = await updateCoverPicture(editData.cover_picture);
          if (newCoverUrl && onProfileUpdate) {
            onProfileUpdate({ coverPhoto: newCoverUrl });
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật ảnh bìa:", error);
          toast.error("Không thể cập nhật ảnh bìa");
        } finally {
          setIsUploadingCover(false);
        }
      }

      // Gọi API cập nhật thông tin
      const success = await updateProfile(profileDataToUpdate);

      if (success) {
        // Cập nhật thành công, đóng dialog
        if (onProfileUpdate) {
          onProfileUpdate({
            name: editData.full_name,
            bio: editData.bio,
            location: editData.location,
            work: editData.work,
            education: editData.education,
            relationship: editData.relationship,
          });
        }
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile") || "Chỉnh sửa hồ sơ"}</DialogTitle>
            <DialogDescription>
              {t("profile.editProfileDesc") || "Cập nhật thông tin hồ sơ cá nhân của bạn"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phần ảnh bìa */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              <img
                  src={previewCover || "/coverphotodefault.png"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/coverphotodefault.png";
                  }}
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => coverInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  {t("profile.changeCover") || "Chọn ảnh"}
                </Button>
                {editData.cover_picture && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                        onClick={handleUpdateCover}
                        disabled={isUploadingCover}
                    >
                      {isUploadingCover ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                          <Upload className="h-4 w-4 mr-1" />
                      )}
                      {t("profile.uploadCover") || "Tải lên"}
                    </Button>
                )}
                <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverChange}
                    accept="image/*"
                    className="hidden"
                />
              </div>
            </div>

            {/* Phần ảnh đại diện */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img
                      src={previewAvatar || "/avatardefaut.png"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/avatardefaut.png";
                      }}
                  />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 p-0"
                    onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                />
              </div>
              {editData.profile_picture&& (
                  <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateAvatar}
                      disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                        <Upload className="h-4 w-4 mr-1" />
                    )}
                    {t("profile.uploadProfilePicture") || "Cập nhật ảnh đại diện"}
                  </Button>
              )}
            </div>

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("profile.fullName") || "Họ và tên"}</Label>
                <Input
                    id="full_name"
                    name="full_name"
                    value={editData.full_name}
                    onChange={handleChange}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t("profile.location") || "Địa điểm"}</Label>
                <Input
                    id="location"
                    name="location"
                    value={editData.location}
                    onChange={handleChange}
                    placeholder={t("profile.enterLocation") || "Nhập địa điểm"}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">{t("profile.bio") || "Giới thiệu"}</Label>
              <Textarea
                  id="bio"
                  name="bio"
                  value={editData.bio}
                  onChange={handleChange}
                  placeholder={t("profile.enterBio") || "Giới thiệu về bản thân..."}
                  rows={3}
              />
            </div>

            {/* Thông tin khác */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work">{t("profile.work") || "Công việc"}</Label>
                <Input
                    id="work"
                    name="work"
                    value={editData.work}
                    onChange={handleChange}
                    placeholder={t("profile.enterWork") || "Công việc hiện tại..."}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">{t("profile.education") || "Học vấn"}</Label>
                <Input
                    id="education"
                    name="education"
                    value={editData.education}
                    onChange={handleChange}
                    placeholder={t("profile.enterEducation") || "Trường học..."}
                />
              </div>
            </div>

            {/* Tình trạng quan hệ */}
            <div className="space-y-2">
              <Label htmlFor="relationship">{t("profile.relationship") || "Tình trạng quan hệ"}</Label>
              <Input
                  id="relationship"
                  name="relationship"
                  value={editData.relationship}
                  onChange={handleChange}
                  placeholder={t("profile.relationshipPlaceholder") || "Nhập tình trạng mối quan hệ của bạn"}
              />
            </div>

            <DialogFooter>
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
              >
                {t("common.cancel") || "Hủy"}
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploadingAvatar || isUploadingCover}>
                {isSubmitting || isUploadingAvatar || isUploadingCover ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      {t("common.saving") || "Đang lưu..."}
                    </>
                ) : (
                    t("common.save") || "Lưu"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
};

interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  friend: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    profile_picture_url?: string;
    cover_picture_url?: string;
  };
}

interface ProfileProps {
  isCurrentUser?: boolean;
}

const Profile = ({ isCurrentUser = false }: ProfileProps) => {
  const { username } = useParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Basic states
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [userFriends, setUserFriends] = useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const friendsPerPage = 8;

  // Xác định xem đây là profile của người dùng hiện tại hay người khác
  const isSelfProfile = !username || (username === user?.username) || isCurrentUser;

  // Load thông tin profile
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        if (isSelfProfile) {
          // Nếu là profile của người dùng hiện tại
          const profileData = await getCurrentUserProfile();
          setUserProfile(profileData);
          setFriendshipStatus("self");
        } else if (username) {
          // Nếu là profile của người khác
          const response = await getPublicUserProfile(username);
          if (response && response.user) {
            setUserProfile(response.user);
            setFriendshipStatus(response.friendship_status || "none");
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin profile:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username, isSelfProfile, user]);

  // Handle profile update
  const handleProfileUpdate = async (updatedProfile: Partial<UserProfileData>) => {
    setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
  };

  // Handle message button click
  const handleMessageClick = () => {
    if (!userProfile) return;

    navigate("/messages", {
      state: {
        newConversation: {
          user: {
            id: userProfile.id,
            name: userProfile.full_name,
            avatar: userProfile.profile_picture_url,
            status: "online", // Giả định online
          },
        },
      },
    });
  };

  // Xử lý chặn/bỏ chặn người dùng
  const handleBlockUser = async () => {
    if (!userProfile) return;
    
    try {
      if (friendshipStatus === "blocked") {
        // Bỏ chặn người dùng
        await unblockUser(userProfile.username);
        setFriendshipStatus("none");
        toast.success(`Đã bỏ chặn ${userProfile.full_name}`);
      } else {
        // Chặn người dùng
        await blockUser(userProfile.username);
        setFriendshipStatus("blocked");
        toast.success(`Đã chặn ${userProfile.full_name}`);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái chặn:", error);
      toast.error("Không thể thực hiện hành động này");
    }
  };

  // Xử lý hủy kết bạn
  const handleUnfriend = async () => {
    if (!userProfile) return;
    
    try {
      await unfriend(userProfile.username);
      setFriendshipStatus("none");
      toast.success(`Đã hủy kết bạn với ${userProfile.full_name}`);
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      toast.error("Không thể hủy kết bạn");
    }
  };

  // Xử lý từ chối lời mời kết bạn
  const handleRejectFriendRequest = async () => {
    if (!userProfile) return;
    
    try {
      await rejectFriendRequest(userProfile.username);
      setFriendshipStatus("none");
      toast.success(`Đã từ chối lời mời kết bạn từ ${userProfile.full_name}`);
    } catch (error) {
      console.error("Lỗi khi từ chối lời mời kết bạn:", error);
      toast.error("Không thể từ chối lời mời kết bạn");
    }
  };

  // Xử lý chấp nhận lời mời kết bạn
  const handleAcceptFriendRequest = async () => {
    if (!userProfile) return;
    
    try {
      await acceptFriendRequest(userProfile.username);
      setFriendshipStatus("accepted");
      toast.success(`Đã chấp nhận lời mời kết bạn từ ${userProfile.full_name}`);
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
      toast.error("Không thể chấp nhận lời mời kết bạn");
    }
  };

  // Handle friend actions
  const handleFriendAction = async () => {
    if (!userProfile) return;

    try {
      switch (friendshipStatus) {
        case "none":
          // Gửi lời mời kết bạn
          await sendFriendRequest(userProfile.username);
          toast.success(`Đã gửi lời mời kết bạn đến ${userProfile.full_name}`);
          setFriendshipStatus("pending_outgoing");
          break;
        case "pending_outgoing":
          // Hủy lời mời kết bạn đã gửi
          await cancelFriendRequest(userProfile.username);
          toast.success(`Đã hủy lời mời kết bạn với ${userProfile.full_name}`);
          setFriendshipStatus("none");
          break;
        case "pending_incoming":
          // Chấp nhận lời mời kết bạn
          await acceptFriendRequest(userProfile.username);
          toast.success(`Đã chấp nhận lời mời kết bạn từ ${userProfile.full_name}`);
          setFriendshipStatus("accepted");
          break;
        case "rejected":
          // Gửi lại lời mời kết bạn
          await sendFriendRequest(userProfile.username);
          toast.success(`Đã gửi lời mời kết bạn đến ${userProfile.full_name}`);
          setFriendshipStatus("pending_outgoing");
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động kết bạn:", error);
      toast.error("Không thể thực hiện hành động này");
    }
  };

  // Load bài viết của user
  useEffect(() => {
    if (userProfile) {
      // Ở đây sẽ gọi API để lấy bài viết của user
      // Mock data cho demo
      setUserPosts([
        {
          id: "u1",
          type: "gallery",
          author: {
            name: userProfile.full_name,
            avatar: userProfile.profile_picture_url || "/avatardefaut.png",
            timestamp: "2 giờ trước",
          },
          content: "Một ngày đẹp trời tại bãi biển! #Weekend #Ocean",
          engagement: {
            likes: 87,
            comments: 23,
            shares: 7,
          },
          images: [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
            "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&q=80",
            "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=500&q=80",
          ],
          totalImages: 3,
          commentsList: [],
        },
        {
          id: "u2",
          type: "regular",
          author: {
            name: userProfile.full_name,
            avatar: userProfile.profile_picture_url || "/avatardefaut.png",
            timestamp: "Hôm qua",
          },
          content:
              "Vừa đọc xong một cuốn sách tuyệt vời! Tôi rất khuyên các bạn đọc 'The Midnight Library' của Matt Haig. Ai đã đọc cuốn này chưa? #BookRecommendations #Reading",
          engagement: {
            likes: 42,
            comments: 15,
            shares: 3,
          },
          commentsList: [],
        },
      ]);
    }
  }, [userProfile]);

  // Load danh sách bạn bè khi chuyển đến tab bạn bè
  useEffect(() => {
    const loadFriends = async () => {
      if (activeTab === "friends" && userProfile) {
        setIsLoadingFriends(true);
        try {
          const response = await getFriends('accepted', currentPage, friendsPerPage);
          setUserFriends(response.friends || []);
          setTotalPages(Math.ceil((response.total || 0) / friendsPerPage));
        } catch (error) {
          console.error("Lỗi khi tải danh sách bạn bè:", error);
          toast.error("Không thể tải danh sách bạn bè");
        } finally {
          setIsLoadingFriends(false);
        }
      }
    };

    loadFriends();
  }, [activeTab, userProfile, currentPage]);

  // Xử lý khi thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
    );
  }

  // Nếu không tìm thấy user
  if (!userProfile) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy người dùng</h2>
            <p className="text-gray-600 mb-4">Người dùng này không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => navigate('/')}>Quay về trang chủ</Button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-100">
        <LazyThreeColumnLayout>
          <div className="w-full max-w-[950px] mx-auto">
            {/* Cover Photo */}
            <div className="relative w-full h-[300px] rounded-b-lg overflow-hidden">
              <img
                  src={userProfile.cover_picture_url || "/coverphotodefault.png"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/coverphotodefault.png";
                  }}
              />
              {isSelfProfile && (
                  <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-4 right-4 bg-white/80 hover:bg-white"
                      onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    {t("profile.changeCover") || "Đổi ảnh bìa"}
                  </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="relative bg-white rounded-lg shadow-sm -mt-16 mx-4 p-4">
              <div className="flex flex-col md:flex-row items-center md:items-end">
                <Avatar className="h-32 w-32 border-4 border-white -mt-20 md:-mt-24 mb-2 md:mb-0">
                  <img
                      src={userProfile.profile_picture_url || "/avatardefaut.png"}
                      alt={userProfile.full_name}
                      className="rounded-full"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/avatardefaut.png";
                      }}
                  />
                </Avatar>

                <div className="flex flex-col md:flex-row md:items-center justify-between w-full md:ml-4">
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold">{userProfile.full_name}</h1>
                    <p className="text-gray-500">{userProfile.bio || "Chưa có thông tin giới thiệu"}</p>
                  </div>

                  <div className="flex mt-4 md:mt-0 space-x-2">
                    {isSelfProfile ? (
                        <>
                          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                            <Image className="h-4 w-4 mr-1" />
                            {t("profile.addStory") || "Thêm story"}
                          </Button>
                          <Button
                              variant="outline"
                              className="border-pink-300 text-pink-600 hover:bg-pink-50"
                              onClick={() => setIsEditDialogOpen(true)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            {t("profile.editProfile") || "Chỉnh sửa hồ sơ"}
                          </Button>
                        </>
                    ) : (
                        <>
                          {friendshipStatus === "accepted" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  className="bg-pink-500 hover:bg-pink-600 text-white"
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  {t("profile.friends") || "Bạn bè"}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleUnfriend}>
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  {t("profile.unfriend") || "Hủy kết bạn"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : friendshipStatus === "pending_incoming" ? (
                            <div className="flex space-x-2">
                              <Button
                                className="bg-pink-500 hover:bg-pink-600 text-white"
                                onClick={handleAcceptFriendRequest}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                {t("profile.acceptFriend") || "Chấp nhận"}
                              </Button>
                              <Button
                                variant="outline"
                                className="border-pink-300 text-pink-600 hover:bg-pink-50"
                                onClick={handleRejectFriendRequest}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                {t("profile.rejectFriend") || "Từ chối"}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              className="bg-pink-500 hover:bg-pink-600 text-white"
                              onClick={handleFriendAction}
                            >
                              {friendshipStatus === "none" && (
                                <>
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  {t("profile.addFriend") || "Kết bạn"}
                                </>
                              )}
                              {friendshipStatus === "pending_outgoing" && (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  {t("profile.cancelRequest") || "Hủy lời mời"}
                                </>
                              )}
                              {friendshipStatus === "rejected" && (
                                <>
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  {t("profile.sendRequest") || "Gửi lời mời kết bạn"}
                                </>
                              )}
                              {friendshipStatus === "blocked" && (
                                <>
                                  <Ban className="h-4 w-4 mr-1" />
                                  {t("profile.blocked") || "Đã chặn"}
                                </>
                              )}
                            </Button>
                          )}
                          
                          {friendshipStatus !== "blocked" && friendshipStatus !== "pending_incoming" && (
                            <Button
                              variant="outline"
                              className="border-pink-300 text-pink-600 hover:bg-pink-50"
                              onClick={handleMessageClick}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {t("profile.message") || "Nhắn tin"}
                            </Button>
                          )}
                        </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("profile.options") || "Tùy chọn"}</DropdownMenuLabel>
                        {!isSelfProfile && (
                          <>
                            {friendshipStatus !== "blocked" ? (
                              <DropdownMenuItem onClick={handleBlockUser}>
                                <Ban className="h-4 w-4 mr-2" />
                                {t("profile.blockUser") || "Chặn người dùng này"}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={handleBlockUser}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                {t("profile.unblockUser") || "Bỏ chặn người dùng này"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          {t("profile.reportUser") || "Báo cáo vi phạm"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Profile Stats */}
              <div className="flex flex-wrap justify-around text-center">
                <div className="px-4 py-2">
                  <div className="font-semibold">{userProfile.friend_count || 0}</div>
                  <div className="text-sm text-gray-500">
                    {t("profile.friends") || "Bạn bè"}
                  </div>
                </div>
                <div className="px-4 py-2">
                  <div className="font-semibold">{userProfile.photos_count || 0}</div>
                  <div className="text-sm text-gray-500">
                    {t("profile.photos") || "Ảnh"}
                  </div>
                </div>
                <div className="px-4 py-2">
                  <div className="font-semibold">{userProfile.videos_count || 0}</div>
                  <div className="text-sm text-gray-500">
                    {t("profile.videos") || "Video"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-4 mx-4">
              <Tabs
                  defaultValue="posts"
                  value={activeTab}
                  onValueChange={setActiveTab}
              >
                <TabsList className="w-full bg-white rounded-lg shadow-sm">
                  <TabsTrigger value="posts" className="flex-1">
                    {t("profile.posts") || "Bài viết"}
                  </TabsTrigger>
                  <TabsTrigger value="about" className="flex-1">
                    {t("profile.about") || "Giới thiệu"}
                  </TabsTrigger>
                  <TabsTrigger value="friends" className="flex-1">
                    {t("profile.friends") || "Bạn bè"}
                  </TabsTrigger>
                  <TabsTrigger value="photos" className="flex-1">
                    {t("profile.photos") || "Ảnh"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-4">
                  {userPosts.length > 0 ? (
                      <PostFeed posts={userPosts} />
                  ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-gray-500">Chưa có bài viết nào</p>
                        </CardContent>
                      </Card>
                  )}
                </TabsContent>

                <TabsContent value="about" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        {t("profile.personalInfo") || "Thông tin cá nhân"}
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">
                              {t("profile.livesIn") || "Sống tại"}
                            </div>
                            <div>{userProfile.location || "Chưa cập nhật"}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">
                              {t("profile.works") || "Làm việc tại"}
                            </div>
                            <div>{userProfile.work || "Chưa cập nhật"}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">
                              {t("profile.studied") || "Học tại"}
                            </div>
                            <div>{userProfile.education || "Chưa cập nhật"}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">
                              {t("profile.relationship") || "Tình trạng quan hệ"}
                            </div>
                            <div>{userProfile.relationship || "Chưa cập nhật"}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">
                              {t("profile.joined") || "Tham gia"}
                            </div>
                            <div>{new Date(userProfile.created_at || "").toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="friends" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                          {userProfile.friend_count || 0} {t("profile.friends") || "Bạn bè"}
                        </h2>
                      </div>
                      {isLoadingFriends ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                          </div>
                      ) : userFriends.length > 0 ? (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {userFriends.map((friend) => (
                                  <a
                                      key={friend.id}
                                      href={`/profile/${friend.friend.username}`}
                                      className="block group"
                                  >
                                    <div className="bg-gray-50 rounded-lg overflow-hidden transition-all group-hover:shadow-md">
                                      <div className="aspect-square">
                                        <img
                                            src={friend.friend.profile_picture_url || "/avatardefaut.png"}
                                            alt={friend.friend.full_name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                              e.currentTarget.src = "/avatardefaut.png";
                                            }}
                                        />
                                      </div>
                                      <div className="p-2 text-center">
                                        <div className="font-medium text-sm group-hover:text-pink-500 transition-colors">
                                          {friend.friend.full_name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          @{friend.friend.username}
                                        </div>
                                      </div>
                                    </div>
                                  </a>
                              ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-6">
                                  <Pagination
                                      currentPage={currentPage}
                                      totalPages={totalPages}
                                      onPageChange={handlePageChange}
                                  />
                                </div>
                            )}
                          </>
                      ) : (
                          <p className="text-center text-gray-500">Chưa có bạn bè</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="photos" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                          {userProfile.photos_count || 0} {t("profile.photos") || "Ảnh"}
                        </h2>
                      </div>
                      {/* User photos content */}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Edit Profile Dialog */}
            {isSelfProfile && userProfile && (
                <EditProfileDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onProfileUpdate={handleProfileUpdate}
                    initialData={{
                      name: userProfile.full_name,
                      bio: userProfile.bio || "",
                      location: userProfile.location || "",
                      work: userProfile.work || "",
                      education: userProfile.education || "",
                      relationship: userProfile.relationship || "",
                      avatar: userProfile.profile_picture_url || "",
                      coverPhoto: userProfile.cover_picture_url || "",
                    }}
                />
            )}
          </div>
        </LazyThreeColumnLayout>
      </div>
  );
};

export default Profile;
