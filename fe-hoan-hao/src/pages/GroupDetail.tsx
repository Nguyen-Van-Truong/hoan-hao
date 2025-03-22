import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import PostCreator from "@/components/post/PostCreator";
import PostFeed from "@/components/post/PostFeed";
import {
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Info,
  Lock,
  Globe,
  UserPlus,
  Bell,
  BellOff,
  Share,
  MoreHorizontal,
  Plus,
  Image,
  FileText,
  Link,
  UserMinus,
  LogOut,
  Shield,
  Flag,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for the group
const mockGroup = {
  id: "1",
  name: "Những người yêu thích mèo",
  description:
    "Chia sẻ hình ảnh và câu chuyện về những chú mèo đáng yêu của bạn. Cùng nhau trao đổi kinh nghiệm chăm sóc và nuôi dưỡng mèo.",
  memberCount: 5243,
  privacy: "public" as const,
  coverImage:
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=80",
  avatar:
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&q=80",
  createdAt: "2022-05-15",
  isJoined: true,
  isAdmin: true, // Changed to true for demonstration purposes
  isModerator: false,
  rules: [
    "Tôn trọng tất cả thành viên trong nhóm",
    "Không đăng nội dung quảng cáo hoặc spam",
    "Chỉ đăng nội dung liên quan đến mèo",
    "Không đăng nội dung bạo lực hoặc ngược đãi động vật",
  ],
};

// Mock data for members
const mockMembers = [
  {
    id: "m1",
    name: "Nguyễn Văn A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyen",
    role: "admin",
    joinedAt: "2022-05-15",
  },
  {
    id: "m2",
    name: "Trần Thị B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tran",
    role: "moderator",
    joinedAt: "2022-06-20",
  },
  {
    id: "m3",
    name: "Lê Văn C",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=le",
    role: "member",
    joinedAt: "2022-07-10",
  },
  {
    id: "m4",
    name: "Phạm Thị D",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pham",
    role: "member",
    joinedAt: "2022-08-05",
  },
  {
    id: "m5",
    name: "Hoàng Văn E",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hoang",
    role: "member",
    joinedAt: "2022-09-12",
  },
  {
    id: "m6",
    name: "Đỗ Thị F",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=do",
    role: "member",
    joinedAt: "2022-10-18",
  },
];

// Mock data for events
const mockEvents = [
  {
    id: "e1",
    title: "Offline meeting - Hội những người yêu mèo",
    date: "2023-12-15T18:00:00",
    location: "Công viên Lê Văn Tám, TP.HCM",
    description:
      "Gặp gỡ trực tiếp và chia sẻ kinh nghiệm nuôi mèo. Mọi người có thể mang theo thú cưng của mình.",
    attendees: 45,
    coverImage:
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80",
  },
  {
    id: "e2",
    title: "Workshop online - Chăm sóc mèo con",
    date: "2023-12-20T10:00:00",
    location: "Zoom Meeting",
    description:
      "Bác sĩ thú y Nguyễn Văn X sẽ chia sẻ kinh nghiệm chăm sóc mèo con từ 0-3 tháng tuổi.",
    attendees: 120,
    coverImage:
      "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&q=80",
  },
];

// Mock data for photos
const mockPhotos = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&q=80",
  "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&q=80",
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80",
  "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80",
  "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&q=80",
  "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=400&q=80",
  "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400&q=80",
];

const GroupDetail = () => {
  const { t } = useLanguage();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discussion");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditCoverDialog, setShowEditCoverDialog] = useState(false);
  const [showManageMembersDialog, setShowManageMembersDialog] = useState(false);

  // In a real app, you would fetch the group data based on the groupId
  const group = mockGroup;

  const handleLeaveGroup = () => {
    // In a real app, you would call an API to leave the group
    alert(t("groups.leaveConfirmation"));
    navigate("/groups");
  };

  return (
    <ThreeColumnLayout>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-64 overflow-hidden rounded-t-lg">
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          {group.isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setShowEditCoverDialog(true)}
            >
              <Image className="h-4 w-4 mr-2" />
              {t("groups.changeCover")}
            </Button>
          )}
          <div className="absolute bottom-4 left-4 flex items-end">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-white">
              <img
                src={group.avatar}
                alt={group.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="ml-4 bg-black bg-opacity-50 p-2 rounded-lg">
              <h1 className="text-2xl font-bold text-white">{group.name}</h1>
              <div className="flex items-center text-sm text-white">
                <Badge
                  variant={group.privacy === "public" ? "secondary" : "outline"}
                  className="mr-2"
                >
                  {group.privacy === "public" ? (
                    <Globe className="h-3 w-3 mr-1" />
                  ) : (
                    <Lock className="h-3 w-3 mr-1" />
                  )}
                  {t(
                    group.privacy === "public"
                      ? "groups.public"
                      : "groups.private",
                  )}
                </Badge>
                <Users className="h-4 w-4 mr-1" />
                <span>
                  {group.memberCount.toLocaleString()} {t("groups.members")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Group Actions */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex space-x-2">
            {group.isJoined ? (
              <>
                <Button variant="outline" className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  {t("groups.notifications")}
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Share className="h-4 w-4 mr-2" />
                  {t("groups.share")}
                </Button>
              </>
            ) : (
              <Button className="bg-pink-500 hover:bg-pink-600 flex items-center">
                <UserPlus className="h-4 w-4 mr-2" />
                {t("groups.join")}
              </Button>
            )}
          </div>

          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("groups.options")}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-2">
                    {group.isJoined && (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setShowInviteDialog(true)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t("groups.inviteFriends")}
                        </Button>

                        {group.isAdmin || group.isModerator ? (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() =>
                                navigate(`/groups/${groupId}/settings`)
                              }
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              {t("groups.groupSettings")}
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() =>
                                navigate(`/groups/${groupId}/edit`)
                              }
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              {t("groups.editGroup")}
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {t("groups.reviewPosts")}
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setShowManageMembersDialog(true)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              {t("groups.reviewMembers")}
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setShowCreateEventDialog(true)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              {t("groups.createEvent")}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            {t("groups.reportGroup")}
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <BellOff className="h-4 w-4 mr-2" />
                          {t("groups.muteNotifications")}
                        </Button>

                        <Separator />

                        {group.isAdmin && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            {t("groups.deleteGroup")}
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-500"
                          onClick={handleLeaveGroup}
                        >
                          {group.isAdmin ? (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              {t("groups.transferOwnership")}
                            </>
                          ) : (
                            <>
                              <LogOut className="h-4 w-4 mr-2" />
                              {t("groups.leaveGroup")}
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Admin actions are now only in the dropdown menu */}

        {/* Group Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger
                value="discussion"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-pink-500 py-4"
              >
                {t("groups.discussion")}
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-pink-500 py-4"
              >
                {t("groups.about")}
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-pink-500 py-4"
              >
                {t("groups.events")}
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-pink-500 py-4"
              >
                {t("groups.members")}
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-pink-500 py-4"
              >
                {t("groups.media")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Discussion Tab */}
          <TabsContent value="discussion" className="p-4">
            {group.isJoined && (
              <div className="mb-6">
                <PostCreator placeholder={t("groups.writePost")} />
              </div>
            )}
            <PostFeed />
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("groups.description")}
                </h3>
                <p className="text-gray-700">{group.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("groups.groupInfo")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-500 mr-2" />
                    <span>
                      {t(
                        group.privacy === "public"
                          ? "groups.publicGroup"
                          : "groups.privateGroup",
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <span>
                      {t("groups.created")}:{" "}
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span>
                      {group.memberCount.toLocaleString()} {t("groups.members")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("groups.rules")}
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {group.rules.map((rule, index) => (
                    <li key={index} className="text-gray-700">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {t("groups.upcomingEvents")}
              </h2>
              {group.isJoined && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateEventDialog(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("groups.createEvent")}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.date).toLocaleDateString()}{" "}
                      {new Date(event.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-700 mb-2">
                      {event.location}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>
                        {event.attendees} {t("groups.attending")}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      {t("groups.interested")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Create Event Dialog */}
            <Dialog
              open={showCreateEventDialog}
              onOpenChange={setShowCreateEventDialog}
            >
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{t("groups.createEvent")}</DialogTitle>
                  <DialogDescription>
                    {t("groups.createEventDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-title">
                      {t("groups.eventTitle")}
                    </Label>
                    <Input
                      id="event-title"
                      placeholder={t("groups.eventTitlePlaceholder")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-date">{t("groups.eventDate")}</Label>
                    <Input id="event-date" type="datetime-local" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-location">
                      {t("groups.eventLocation")}
                    </Label>
                    <Input
                      id="event-location"
                      placeholder={t("groups.eventLocationPlaceholder")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-description">
                      {t("groups.eventDescription")}
                    </Label>
                    <Textarea
                      id="event-description"
                      placeholder={t("groups.eventDescriptionPlaceholder")}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("groups.eventCover")}</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                      <Image className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {t("groups.uploadEventCover")}
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateEventDialog(false)}
                  >
                    {t("groups.cancel")}
                  </Button>
                  <Button
                    className="bg-pink-500 hover:bg-pink-600"
                    onClick={() => setShowCreateEventDialog(false)}
                  >
                    {t("groups.createEvent")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t("groups.members")}</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("groups.searchMembers")}
                    className="pl-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {group.isJoined && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInviteDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("groups.invite")}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockMembers.map((member) => (
                <Card key={member.id} className="flex items-center p-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <img src={member.avatar} alt={member.name} />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium">{member.name}</h3>
                      {member.role !== "member" && (
                        <Badge variant="outline" className="ml-2">
                          {member.role === "admin"
                            ? t("groups.admin")
                            : t("groups.moderator")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {t("groups.joined")}:{" "}
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {group.isJoined && (
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            {/* Invite Dialog */}
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("groups.inviteFriends")}</DialogTitle>
                  <DialogDescription>
                    {t("groups.inviteFriendsDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("groups.searchFriends")}
                      className="pl-9 w-full"
                    />
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {/* Mock friends list */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=friend${i}`}
                              alt="Friend"
                            />
                          </Avatar>
                          <span>Friend {i + 1}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          {t("groups.invite")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(false)}
                  >
                    {t("groups.done")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Cover Dialog */}
            <Dialog
              open={showEditCoverDialog}
              onOpenChange={setShowEditCoverDialog}
            >
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{t("groups.editGroupCover")}</DialogTitle>
                  <DialogDescription>
                    {t("groups.editGroupCoverDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="aspect-video rounded-md overflow-hidden border">
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
                    <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium">
                      {t("groups.uploadNewCover")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("groups.recommendedSize")}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-video rounded-md overflow-hidden border cursor-pointer hover:opacity-80"
                      >
                        <img
                          src={`https://images.unsplash.com/photo-${1514888286974 + i * 1000}-6c03e2ca1dba?w=400&q=80`}
                          alt={`Cover option ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditCoverDialog(false)}
                  >
                    {t("groups.cancel")}
                  </Button>
                  <Button
                    className="bg-pink-500 hover:bg-pink-600"
                    onClick={() => setShowEditCoverDialog(false)}
                  >
                    {t("groups.save")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Manage Members Dialog */}
            <Dialog
              open={showManageMembersDialog}
              onOpenChange={setShowManageMembersDialog}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{t("groups.manageMembers")}</DialogTitle>
                  <DialogDescription>
                    {t("groups.manageMembersDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t("groups.searchMembers")}
                        className="pl-9"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {t("groups.filter")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          {t("groups.allMembers")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {t("groups.admins")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {t("groups.moderators")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {t("groups.recentlyJoined")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {mockMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md border"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <img src={member.avatar} alt={member.name} />
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium">{member.name}</span>
                              {member.role !== "member" && (
                                <Badge variant="outline" className="ml-2">
                                  {member.role === "admin"
                                    ? t("groups.admin")
                                    : t("groups.moderator")}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {t("groups.joined")}:{" "}
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== "admin" && (
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                {member.role === "moderator"
                                  ? t("groups.removeAsModerator")
                                  : t("groups.makeAsModerator")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {t("groups.sendMessage")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <UserMinus className="h-4 w-4 mr-2" />
                              {t("groups.removeMember")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowManageMembersDialog(false)}
                  >
                    {t("groups.done")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t("groups.photos")}</h2>
              {group.isJoined && (
                <Button variant="outline" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  {t("groups.addPhotos")}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-md overflow-hidden"
                >
                  <img
                    src={photo}
                    alt={`Group photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                {t("groups.files")}
              </h2>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="flex items-center p-3">
                    <FileText className="h-8 w-8 mr-3 text-blue-500" />
                    <div className="flex-1">
                      <h3 className="font-medium">Document-{i + 1}.pdf</h3>
                      <p className="text-xs text-gray-500">
                        Added on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Link className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ThreeColumnLayout>
  );
};

export default GroupDetail;
