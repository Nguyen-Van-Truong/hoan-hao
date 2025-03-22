import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe, Lock, Camera, Plus, X, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data for the group
const mockGroups = [
  {
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
    isOwner: true,
    isAdmin: true,
    rules: [
      "Tôn trọng tất cả thành viên trong nhóm",
      "Không đăng nội dung quảng cáo hoặc spam",
      "Chỉ đăng nội dung liên quan đến mèo",
      "Không đăng nội dung bạo lực hoặc ngược đãi động vật",
    ],
  },
  {
    id: "2",
    name: "Ẩm thực Việt Nam",
    description: "Chia sẻ công thức nấu ăn và địa điểm ăn uống ngon",
    memberCount: 12876,
    privacy: "public" as const,
    coverImage:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
    createdAt: "2022-06-20",
    isOwner: true,
    isAdmin: true,
    rules: [
      "Tôn trọng tất cả thành viên trong nhóm",
      "Không đăng nội dung quảng cáo hoặc spam",
      "Chỉ đăng nội dung liên quan đến ẩm thực",
      "Chia sẻ công thức phải đầy đủ và chi tiết",
    ],
  },
  {
    id: "3",
    name: "Lập trình viên Việt Nam",
    description:
      "Cộng đồng chia sẻ kiến thức và cơ hội việc làm trong ngành IT",
    memberCount: 8765,
    privacy: "private" as const,
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
    avatar:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200&q=80",
    createdAt: "2022-07-10",
    isOwner: false,
    isAdmin: true,
    rules: [
      "Tôn trọng tất cả thành viên trong nhóm",
      "Không đăng nội dung quảng cáo hoặc spam",
      "Chỉ đăng nội dung liên quan đến lập trình và IT",
      "Không chia sẻ nội dung vi phạm bản quyền",
    ],
  },
];

const GroupEdit = () => {
  const { t } = useLanguage();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Find the group from mock data
  const group = mockGroups.find((g) => g.id === groupId);

  // Form state
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState<"public" | "private">(
    "public",
  );
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Initialize form with group data
  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description);
      setGroupPrivacy(group.privacy);
      setRules(group.rules || []);
    }
  }, [group]);

  // If group not found or user doesn't have permission
  if (!group || (!group.isOwner && !group.isAdmin)) {
    return (
      <ThreeColumnLayout>
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{t("groups.noPermission")}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate("/groups")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("groups.backToGroups")}
            </Button>
          </div>
        </div>
      </ThreeColumnLayout>
    );
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(false);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <ThreeColumnLayout>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(`/groups/${groupId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("groups.editGroup")}
          </h1>
        </div>

        {saveSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{t("groups.changesSaved")}</AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{t("groups.savingError")}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t("groups.basicInfo")}</CardTitle>
                <CardDescription>
                  {t("groups.basicInfoDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">
                    {t("groups.name")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="group-name"
                    placeholder={t("groups.namePlaceholder")}
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">
                    {t("groups.description")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="group-description"
                    placeholder={t("groups.descriptionPlaceholder")}
                    className="min-h-[100px]"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("groups.privacy")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="public"
                        name="privacy"
                        value="public"
                        checked={groupPrivacy === "public"}
                        onChange={() => setGroupPrivacy("public")}
                        required
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("groups.groupImages")}</CardTitle>
                <CardDescription>
                  {t("groups.groupImagesDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label>{t("groups.groupAvatar")}</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Group Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : group.avatar ? (
                        <img
                          src={group.avatar}
                          alt="Group Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-gray-400" />
                      )}
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
                    <div className="relative h-40 w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Cover"
                          className="h-full w-full object-cover"
                        />
                      ) : group.coverImage ? (
                        <img
                          src={group.coverImage}
                          alt="Cover"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-12 w-12 text-gray-400" />
                      )}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("groups.rules")}</CardTitle>
                <CardDescription>
                  {t("groups.rulesDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {rules.length > 0 ? (
                    rules.map((rule, index) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {t("groups.noRulesYet")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("groups.addRule")}
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("groups.add")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/groups/${groupId}`)}
              >
                {t("groups.cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600"
                disabled={isSaving || !groupName || !groupDescription}
              >
                {isSaving ? t("groups.saving") : t("groups.saveChanges")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ThreeColumnLayout>
  );
};

export default GroupEdit;
