import React, { useState, useEffect } from "react";
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
import { getPublicUserProfile } from "@/api/services/userApi";
import {
  Camera,
  Image,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Mail,
  MoreHorizontal,
  UserPlus,
  MessageCircle,
  Pencil,
} from "lucide-react";
import LazyEditProfileDialog from "../components/profile/LazyEditProfileDialog";
import { toast } from "react-hot-toast";

interface ProfileProps {
  isCurrentUser?: boolean;
}

interface UserProfileData {
  id?: number;
  username: string;
  full_name: string; 
  email?: string;
  profile_picture_url: string;
  cover_picture_url: string;
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
  friends_count?: number;
  photos_count?: number;
  videos_count?: number;
  // Status bạn bè
  friend_status?: string;
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

const Profile = ({ isCurrentUser = false }: ProfileProps) => {
  const { t } = useLanguage();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: authUser, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);

  // Xác định xem đây là profile của người dùng hiện tại hay người khác
  const isSelfProfile = !userId || isCurrentUser;
  
  // Load thông tin profile
  useEffect(() => {
    // Nếu là profile của người dùng hiện tại và đã có thông tin từ AuthContext
    if (isSelfProfile && authUser && !authLoading) {
      // Sử dụng trực tiếp thông tin từ authUser
      setUserProfile(authUser);
      setIsLoading(false);
      return;
    }
    
    // Nếu là profile của người khác hoặc chưa có authUser
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        if (userId) {
          // Nếu là profile của người khác
          const { profile, friend_status } = await getPublicUserProfile(userId);
          setUserProfile(profile);
          setFriendStatus(friend_status);
        } else if (!authUser && isSelfProfile) {
          // Nếu là profile cá nhân nhưng chưa có authUser (hiếm khi xảy ra)
          // Chuyển hướng đến trang đăng nhập
          navigate('/login', { state: { returnUrl: '/profile' } });
          toast.error("Vui lòng đăng nhập để xem profile cá nhân");
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin profile:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, isSelfProfile, authUser, authLoading, navigate]);

  // Handle profile update
  const handleProfileUpdate = async (updatedProfile: Partial<UserProfileData>) => {
    try {
      // API call to update profile would go here
      // For now, just update the local state
      setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      toast.success("Cập nhật hồ sơ thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  // Handle message button click
  const handleMessageClick = () => {
    if (!userProfile) return;
    
    navigate("/messages", {
      state: {
        newConversation: {
          user: {
            id: userProfile.id || userId || "unknown",
            name: userProfile.full_name,
            avatar: userProfile.profile_picture_url,
            status: "online", // Giả định online
          },
        },
      },
    });
  };

  // Handle add friend
  const handleAddFriend = async () => {
    try {
      // API call to add friend would go here
      toast.success(`Đã gửi lời mời kết bạn đến ${userProfile?.full_name}`);
    } catch (error) {
      toast.error("Không thể gửi lời mời kết bạn");
    }
  };

  // Mock user posts
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  
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
            avatar: userProfile.profile_picture_url,
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
            avatar: userProfile.profile_picture_url,
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

  // Mock photos for the photos tab
  const userPhotos = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=300&q=80",
    "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=300&q=80",
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=80",
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=300&q=80",
  ];

  // Mock friends for the friends tab
  const userFriends = [
    {
      id: "f1",
      name: "Alex Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    {
      id: "f2",
      name: "Sarah Miller",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
      id: "f3",
      name: "Michael Brown",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    {
      id: "f4",
      name: "Emily Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    },
  ];

  // Hiển thị trạng thái loading
  if (isLoading || (isSelfProfile && authLoading)) {
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
              src={userProfile.cover_picture_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80"}
              alt="Cover"
              className="w-full h-full object-cover"
              loading="lazy"
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
                  src={userProfile.profile_picture_url}
                  alt={userProfile.full_name}
                  className="rounded-full"
                  loading="lazy"
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
                      <Button 
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                        onClick={handleAddFriend}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {friendStatus === "none" && (t("profile.addFriend") || "Kết bạn")}
                        {friendStatus === "pending_sent" && (t("profile.pendingRequest") || "Đã gửi lời mời")}
                        {friendStatus === "pending_received" && (t("profile.acceptRequest") || "Xác nhận lời mời")}
                        {friendStatus === "friends" && (t("profile.friends") || "Bạn bè")}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-pink-300 text-pink-600 hover:bg-pink-50"
                        onClick={handleMessageClick}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {t("profile.message") || "Nhắn tin"}
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Profile Stats */}
            <div className="flex flex-wrap justify-around text-center">
              <div className="px-4 py-2">
                <div className="font-semibold">{userProfile.friends_count || 0}</div>
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
                        {userProfile.friends_count || 0} {t("profile.friends") || "Bạn bè"}
                      </h2>
                      <Button
                        variant="outline"
                        className="text-pink-500 border-pink-300 hover:bg-pink-50"
                      >
                        <a href="/friends">
                          {t("profile.seeAllFriends") || "Xem tất cả bạn bè"}
                        </a>
                      </Button>
                    </div>
                    {userFriends.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {userFriends.map((friend) => (
                          <a
                            key={friend.id}
                            href={`/profile/${friend.name.toLowerCase().replace(" ", "-")}`}
                            className="block group"
                          >
                            <div className="bg-gray-50 rounded-lg overflow-hidden transition-all group-hover:shadow-md">
                              <div className="aspect-square">
                                <img
                                  src={friend.avatar}
                                  alt={friend.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="p-2 text-center">
                                <div className="font-medium text-sm group-hover:text-pink-500 transition-colors">
                                  {friend.name}
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
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
                      <Button
                        variant="outline"
                        className="text-pink-500 border-pink-300 hover:bg-pink-50"
                      >
                        {t("profile.seeAllPhotos") || "Xem tất cả ảnh"}
                      </Button>
                    </div>
                    {userPhotos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {userPhotos.map((photo, index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-lg overflow-hidden"
                          >
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">Chưa có ảnh nào</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Edit Profile Dialog */}
          {isSelfProfile && userProfile && (
            <LazyEditProfileDialog
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
                avatar: userProfile.profile_picture_url,
                coverPhoto: userProfile.cover_picture_url,
              }}
            />
          )}
        </div>
      </LazyThreeColumnLayout>
    </div>
  );
};

export default Profile;
