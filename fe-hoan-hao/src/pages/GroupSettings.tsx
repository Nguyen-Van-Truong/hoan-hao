import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Settings,
  Shield,
  Bell,
  Lock,
  Globe,
  Camera,
  Trash,
  UserMinus,
  UserPlus,
  AlertTriangle,
  X,
  Plus,
} from "lucide-react";

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
  isAdmin: true,
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
];

// Mock data for reported content
const mockReports = [
  {
    id: "r1",
    reportedBy: "Lê Văn C",
    reporterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=le",
    contentType: "post",
    reason: "Spam",
    date: "2023-11-20T10:30:00",
    status: "pending",
  },
  {
    id: "r2",
    reportedBy: "Phạm Thị D",
    reporterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pham",
    contentType: "comment",
    reason: "Inappropriate content",
    date: "2023-11-18T14:15:00",
    status: "reviewed",
  },
  {
    id: "r3",
    reportedBy: "Hoàng Văn E",
    reporterAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hoang",
    contentType: "post",
    reason: "Off-topic",
    date: "2023-11-15T09:45:00",
    status: "pending",
  },
];

const GroupSettings = () => {
  const { t } = useLanguage();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [groupName, setGroupName] = useState(mockGroup.name);
  const [groupDescription, setGroupDescription] = useState(
    mockGroup.description,
  );
  const [groupPrivacy, setGroupPrivacy] = useState<"public" | "private">(
    mockGroup.privacy,
  );
  const [rules, setRules] = useState<string[]>(mockGroup.rules);
  const [newRule, setNewRule] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // In a real app, you would fetch the group data based on the groupId
  const group = mockGroup;

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = [...rules];
    updatedRules.splice(index, 1);
    setRules(updatedRules);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    // In a real app, you would call an API to save the changes
    alert(t("groups.changesSaved"));
  };

  const handleDeleteGroup = () => {
    // In a real app, you would call an API to delete the group
    alert(t("groups.groupDeleted"));
    navigate("/groups");
  };

  const handleTransferOwnership = () => {
    // In a real app, you would call an API to transfer ownership
    alert(t("groups.ownershipTransferred"));
    setShowTransferDialog(false);
  };

  return (
    <ThreeColumnLayout>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t("groups.settings")}</h1>
            <Button
              variant="outline"
              onClick={() => navigate(`/groups/${groupId}`)}
            >
              {t("groups.backToGroup")}
            </Button>
          </div>
          <p className="text-gray-600">{t("groups.settingsDescription")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex border-b">
            <div className="w-1/4 border-r">
              <TabsList className="flex flex-col w-full h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="general"
                  className="justify-start px-4 py-3 rounded-none data-[state=active]:bg-gray-100 data-[state=active]:border-l-2 data-[state=active]:border-pink-500"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t("groups.general")}
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="justify-start px-4 py-3 rounded-none data-[state=active]:bg-gray-100 data-[state=active]:border-l-2 data-[state=active]:border-pink-500"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t("groups.members")}
                </TabsTrigger>
                <TabsTrigger
                  value="moderation"
                  className="justify-start px-4 py-3 rounded-none data-[state=active]:bg-gray-100 data-[state=active]:border-l-2 data-[state=active]:border-pink-500"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {t("groups.moderation")}
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="justify-start px-4 py-3 rounded-none data-[state=active]:bg-gray-100 data-[state=active]:border-l-2 data-[state=active]:border-pink-500"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {t("groups.notifications")}
                </TabsTrigger>
                <TabsTrigger
                  value="danger"
                  className="justify-start px-4 py-3 rounded-none data-[state=active]:bg-gray-100 data-[state=active]:border-l-2 data-[state=active]:border-red-500 text-red-500"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {t("groups.dangerZone")}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="w-3/4 p-6">
              {/* General Settings */}
              <TabsContent value="general" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      {t("groups.basicInfo")}
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="group-name">{t("groups.name")}</Label>
                        <Input
                          id="group-name"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="group-description">
                          {t("groups.description")}
                        </Label>
                        <Textarea
                          id="group-description"
                          value={groupDescription}
                          onChange={(e) => setGroupDescription(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("groups.privacy")}</Label>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="public"
                              name="privacy"
                              value="public"
                              checked={groupPrivacy === "public"}
                              onChange={() => setGroupPrivacy("public")}
                            />
                            <Label htmlFor="public" className="cursor-pointer">
                              <div className="flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                {t("groups.public")}
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="private"
                              name="privacy"
                              value="private"
                              checked={groupPrivacy === "private"}
                              onChange={() => setGroupPrivacy("private")}
                            />
                            <Label htmlFor="private" className="cursor-pointer">
                              <div className="flex items-center gap-1">
                                <Lock className="h-4 w-4" />
                                {t("groups.private")}
                              </div>
                            </Label>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("groups.privacyDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      {t("groups.groupImages")}
                    </h2>
                    <div className="space-y-4">
                      {/* Avatar Upload */}
                      <div className="space-y-2">
                        <Label>{t("groups.groupAvatar")}</Label>
                        <div className="flex items-center gap-4">
                          <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary bg-gray-100">
                            <img
                              src={avatarPreview || group.avatar}
                              alt="Group Avatar"
                              className="h-full w-full object-cover"
                            />
                            <label
                              htmlFor="avatar-upload"
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Camera className="h-8 w-8 text-white" />
                            </label>
                          </div>
                          <div>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="avatar-upload"
                              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary-dark transition-colors"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              {t("groups.uploadPhoto")}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Cover Photo Upload */}
                      <div className="space-y-2">
                        <Label>{t("groups.coverPhoto")}</Label>
                        <div className="space-y-3">
                          <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img
                              src={coverPreview || group.coverImage}
                              alt="Cover"
                              className="h-full w-full object-cover"
                            />
                            <label
                              htmlFor="cover-upload"
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Camera className="h-8 w-8 text-white" />
                            </label>
                          </div>
                          <div>
                            <input
                              id="cover-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleCoverChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="cover-upload"
                              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary-dark transition-colors"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              {t("groups.uploadCover")}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      {t("groups.rules")}
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {rules.map((rule, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <span>{rule}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRule(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t("groups.addRule")}
                          value={newRule}
                          onChange={(e) => setNewRule(e.target.value)}
                        />
                        <Button onClick={handleAddRule}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t("groups.add")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-pink-500 hover:bg-pink-600"
                      onClick={handleSaveChanges}
                    >
                      {t("groups.saveChanges")}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Members Management */}
              <TabsContent value="members" className="mt-0">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">
                    {t("groups.manageMembers")}
                  </h2>
                  <p className="text-gray-600">
                    {t("groups.manageMembersDescription")}
                  </p>

                  <div className="space-y-4">
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
                        <div className="flex gap-2">
                          {member.id !== "m1" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  {member.role === "moderator"
                                    ? t("groups.removeMod")
                                    : t("groups.makeMod")}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {member.role === "moderator"
                                      ? t("groups.removeModTitle")
                                      : t("groups.makeModTitle")}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {member.role === "moderator"
                                      ? t("groups.removeModDescription")
                                      : t("groups.makeModDescription")}
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">
                                    {t("groups.cancel")}
                                  </Button>
                                  <Button className="bg-pink-500 hover:bg-pink-600">
                                    {member.role === "moderator"
                                      ? t("groups.removeMod")
                                      : t("groups.makeMod")}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          {member.id !== "m1" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500"
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  {t("groups.remove")}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {t("groups.removeMemberTitle")}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {t("groups.removeMemberDescription")}
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">
                                    {t("groups.cancel")}
                                  </Button>
                                  <Button variant="destructive">
                                    {t("groups.remove")}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t("groups.inviteMembers")}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Moderation Settings */}
              <TabsContent value="moderation" className="mt-0">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">
                    {t("groups.contentModeration")}
                  </h2>
                  <p className="text-gray-600">
                    {t("groups.contentModerationDescription")}
                  </p>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("groups.approvalSettings")}</CardTitle>
                        <CardDescription>
                          {t("groups.approvalSettingsDescription")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">
                                {t("groups.approveNewMembers")}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {t("groups.approveNewMembersDescription")}
                              </p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">
                                {t("groups.approveNewPosts")}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {t("groups.approveNewPostsDescription")}
                              </p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{t("groups.reportedContent")}</CardTitle>
                        <CardDescription>
                          {t("groups.reportedContentDescription")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {mockReports.map((report) => (
                            <div
                              key={report.id}
                              className="p-4 border rounded-md"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <img
                                      src={report.reporterAvatar}
                                      alt={report.reportedBy}
                                    />
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {t("groups.reportedBy")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(report.date).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    report.status === "pending"
                                      ? "outline"
                                      : "secondary"
                                  }
                                >
                                  {report.status === "pending"
                                    ? t("groups.pending")
                                    : t("groups.reviewed")}
                                </Badge>
                              </div>
                              <div className="mb-2">
                                <p className="text-sm">
                                  <span className="font-medium">
                                    {t("groups.contentType")}:
                                  </span>{" "}
                                  {report.contentType === "post"
                                    ? t("groups.post")
                                    : t("groups.comment")}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">
                                    {t("groups.reason")}:
                                  </span>{" "}
                                  {report.reason}
                                </p>
                              </div>
                              {report.status === "pending" && (
                                <div className="flex gap-2 mt-2">
                                  <Button variant="outline" size="sm">
                                    {t("groups.ignore")}
                                  </Button>
                                  <Button variant="destructive" size="sm">
                                    {t("groups.removeContent")}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="mt-0">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">
                    {t("groups.notificationSettings")}
                  </h2>
                  <p className="text-gray-600">
                    {t("groups.notificationSettingsDescription")}
                  </p>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {t("groups.newMemberNotifications")}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t("groups.newMemberNotificationsDescription")}
                            </p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {t("groups.newPostNotifications")}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t("groups.newPostNotificationsDescription")}
                            </p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {t("groups.commentNotifications")}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t("groups.commentNotificationsDescription")}
                            </p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {t("groups.eventNotifications")}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t("groups.eventNotificationsDescription")}
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      className="bg-pink-500 hover:bg-pink-600"
                      onClick={handleSaveChanges}
                    >
                      {t("groups.saveChanges")}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Danger Zone */}
              <TabsContent value="danger" className="mt-0">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-red-500">
                    {t("groups.dangerZone")}
                  </h2>
                  <p className="text-gray-600">
                    {t("groups.dangerZoneDescription")}
                  </p>

                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-500">
                        {t("groups.transferOwnership")}
                      </CardTitle>
                      <CardDescription>
                        {t("groups.transferOwnershipDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="text-amber-600 border-amber-200"
                        onClick={() => setShowTransferDialog(true)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {t("groups.transferOwnership")}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-500">
                        {t("groups.deleteGroup")}
                      </CardTitle>
                      <CardDescription>
                        {t("groups.deleteGroupDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        {t("groups.deleteGroup")}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Transfer Ownership Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("groups.transferOwnershipTitle")}</DialogTitle>
            <DialogDescription>
              {t("groups.transferOwnershipDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {mockMembers.slice(1).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                >
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <img src={member.avatar} alt={member.name} />
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTransferOwnership}
                  >
                    {t("groups.transfer")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransferDialog(false)}
            >
              {t("groups.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("groups.deleteGroupTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("groups.deleteGroupConfirmation")}
              <p className="mt-2 font-semibold text-red-500">
                {t("groups.deleteGroupWarning")}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("groups.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteGroup}
            >
              {t("groups.deleteGroup")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThreeColumnLayout>
  );
};

export default GroupSettings;
