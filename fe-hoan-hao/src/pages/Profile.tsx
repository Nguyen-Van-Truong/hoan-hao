import React, { useState } from "react";
import { Comment, Reply } from "@/components/post/types";
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
} from "lucide-react";
import LazyEditProfileDialog from "../components/profile/LazyEditProfileDialog";

interface ProfileProps {
  isCurrentUser?: boolean;
}

const Profile = ({ isCurrentUser = false }: ProfileProps) => {
  const { t } = useLanguage();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Determine if this is the current user's profile or someone else's
  const isSelfProfile = !userId || isCurrentUser;

  // Mock user data - in a real app, you would fetch this based on userId
  const [user, setUser] = useState({
    name: isSelfProfile
      ? "Jane Doe"
      : userId
          ?.split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") || "User",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isSelfProfile ? "CurrentUser" : userId}`,
    coverPhoto:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    bio: "Photography enthusiast, travel lover, and coffee addict. Always looking for the next adventure!",
    location: "San Francisco, CA",
    work: "Product Designer at TechCorp",
    education: "Stanford University",
    relationship: "Single",
    joined: "January 2020",
    friends: 342,
    photos: 156,
    videos: 28,
  });

  // Handle profile update
  const handleProfileUpdate = (updatedProfile: any) => {
    setUser((prev) => ({
      ...prev,
      ...updatedProfile,
    }));
  };

  // Handle message button click
  const handleMessageClick = () => {
    if (isSelfProfile) return; // Don't message yourself

    navigate("/messages", {
      state: {
        newConversation: {
          user: {
            id: userId || "unknown",
            name: user.name,
            avatar: user.avatar,
            status: "online", // Assume online for simplicity
          },
        },
      },
    });
  };

  // Mock posts specific to this user
  const [userPosts, setUserPosts] = useState([
    {
      id: "u1",
      type: "gallery" as const,
      author: {
        name: user.name,
        avatar: user.avatar,
        timestamp: "2 hours ago",
      },
      content: "Beautiful day at the beach! #Weekend #Ocean",
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
      type: "regular" as const,
      author: {
        name: user.name,
        avatar: user.avatar,
        timestamp: "Yesterday",
      },
      content:
        "Just finished reading an amazing book! I highly recommend 'The Midnight Library' by Matt Haig. Has anyone else read it? #BookRecommendations #Reading",
      engagement: {
        likes: 42,
        comments: 15,
        shares: 3,
      },
      commentsList: [],
    },
    {
      id: "u3",
      type: "gallery" as const,
      author: {
        name: user.name,
        avatar: user.avatar,
        timestamp: "3 days ago",
      },
      content:
        "Coffee and art - perfect combination for a productive day! #CoffeeTime #Art",
      engagement: {
        likes: 65,
        comments: 8,
        shares: 2,
      },
      images: [
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&q=80",
      ],
      totalImages: 1,
      commentsList: [],
    },
  ]);

  // Mock photos for the photos tab
  const userPhotos = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=300&q=80",
    "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=300&q=80",
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=80",
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=300&q=80",
    "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=300&q=80",
    "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=300&q=80",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&q=80",
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
    {
      id: "f5",
      name: "David Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    {
      id: "f6",
      name: "Sophia Martinez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    },
    {
      id: "f7",
      name: "James Taylor",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    },
    {
      id: "f8",
      name: "Olivia Parker",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <LazyThreeColumnLayout>
        <div className="w-full max-w-[950px] mx-auto">
          {/* Cover Photo */}
          <div className="relative w-full h-[300px] rounded-b-lg overflow-hidden">
            <img
              src={user.coverPhoto}
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
                {t("profile.changeCover") || "Change Cover"}
              </Button>
            )}
          </div>

          {/* Profile Info */}
          <div className="relative bg-white rounded-lg shadow-sm -mt-16 mx-4 p-4">
            <div className="flex flex-col md:flex-row items-center md:items-end">
              <Avatar className="h-32 w-32 border-4 border-white -mt-20 md:-mt-24 mb-2 md:mb-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-full"
                  loading="lazy"
                />
              </Avatar>

              <div className="flex flex-col md:flex-row md:items-center justify-between w-full md:ml-4">
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-gray-500">{user.bio}</p>
                </div>

                <div className="flex mt-4 md:mt-0 space-x-2">
                  {isSelfProfile ? (
                    <>
                      <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                        <Image className="h-4 w-4 mr-1" />
                        {t("profile.addStory") || "Add Story"}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-pink-300 text-pink-600 hover:bg-pink-50"
                        onClick={() => setIsEditDialogOpen(true)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        {t("profile.editProfile") || "Edit Profile"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                        <UserPlus className="h-4 w-4 mr-1" />
                        {t("profile.addFriend") || "Add Friend"}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-pink-300 text-pink-600 hover:bg-pink-50"
                        onClick={handleMessageClick}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {t("profile.message") || "Message"}
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
                <div className="font-semibold">{user.friends}</div>
                <div className="text-sm text-gray-500">
                  {t("profile.friends") || "Friends"}
                </div>
              </div>
              <div className="px-4 py-2">
                <div className="font-semibold">{user.photos}</div>
                <div className="text-sm text-gray-500">
                  {t("profile.photos") || "Photos"}
                </div>
              </div>
              <div className="px-4 py-2">
                <div className="font-semibold">{user.videos}</div>
                <div className="text-sm text-gray-500">
                  {t("profile.videos") || "Videos"}
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
                  {t("profile.posts") || "Posts"}
                </TabsTrigger>
                <TabsTrigger value="about" className="flex-1">
                  {t("profile.about") || "About"}
                </TabsTrigger>
                <TabsTrigger value="friends" className="flex-1">
                  {t("profile.friends") || "Friends"}
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex-1">
                  {t("profile.photos") || "Photos"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-4">
                <PostFeed posts={userPosts} />
              </TabsContent>

              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      {t("profile.personalInfo") || "Personal Information"}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            {t("profile.livesIn") || "Lives in"}
                          </div>
                          <div>{user.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            {t("profile.works") || "Works at"}
                          </div>
                          <div>{user.work}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            {t("profile.studied") || "Studied at"}
                          </div>
                          <div>{user.education}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Home className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            {t("profile.from") || "From"}
                          </div>
                          <div>{user.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            {t("profile.relationship") || "Relationship"}
                          </div>
                          <div>{user.relationship}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            {t("profile.joined") || "Joined"}
                          </div>
                          <div>{user.joined}</div>
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
                        {user.friends} {t("profile.friends") || "Friends"}
                      </h2>
                      <Button
                        variant="outline"
                        className="text-pink-500 border-pink-300 hover:bg-pink-50"
                      >
                        <a href="/friends">
                          {t("profile.seeAllFriends") || "See All Friends"}
                        </a>
                      </Button>
                    </div>
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">
                        {user.photos} {t("profile.photos") || "Photos"}
                      </h2>
                      <Button
                        variant="outline"
                        className="text-pink-500 border-pink-300 hover:bg-pink-50"
                      >
                        {t("profile.seeAllPhotos") || "See All Photos"}
                      </Button>
                    </div>
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Edit Profile Dialog */}
          {isSelfProfile && (
            <LazyEditProfileDialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onProfileUpdate={handleProfileUpdate}
              initialData={{
                name: user.name,
                bio: user.bio,
                location: user.location,
                work: user.work,
                education: user.education,
                relationship: user.relationship,
                avatar: user.avatar,
                coverPhoto: user.coverPhoto,
              }}
            />
          )}
        </div>
      </LazyThreeColumnLayout>
    </div>
  );
};

export default Profile;
