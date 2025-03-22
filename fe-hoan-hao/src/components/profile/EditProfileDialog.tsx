import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Camera, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (updatedProfile: any) => void;
  initialData?: {
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

const EditProfileDialog = ({
  open,
  onOpenChange,
  onProfileUpdate,
  initialData = {
    name: "",
    bio: "",
    location: "",
    work: "",
    education: "",
    relationship: "",
    avatar: "",
    coverPhoto: "",
  },
}: EditProfileDialogProps) => {
  const { t } = useLanguage();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    name: initialData.name || auth.user?.full_name || "",
    bio: initialData.bio || "",
    location: initialData.location || "",
    work: initialData.work || "",
    education: initialData.education || "",
    relationship: initialData.relationship || "",
    avatar: initialData.avatar || auth.user?.profile_picture_url || "",
    coverPhoto: initialData.coverPhoto || "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a server
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
      // In a real app, you would upload this to a server
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you would send this data to your backend
    const updatedProfile = {
      ...formData,
      avatar: avatarPreview || formData.avatar,
      coverPhoto: coverPreview || formData.coverPhoto,
    };

    onProfileUpdate(updatedProfile);
    toast.success(t("profile.updateSuccess") || "Profile updated successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("profile.editProfile") || "Edit Profile"}
          </DialogTitle>
          <DialogDescription>
            {t("profile.editProfileDesc") ||
              "Update your personal information and profile pictures."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">
                {t("profile.basicInfo") || "Basic Info"}
              </TabsTrigger>
              <TabsTrigger value="details">
                {t("profile.details") || "Details"}
              </TabsTrigger>
              <TabsTrigger value="photos">
                {t("profile.photos") || "Photos"}
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.name") || "Name"}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("profile.namePlaceholder") || "Your full name"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t("profile.bio") || "Bio"}</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder={
                    t("profile.bioPlaceholder") || "Tell us about yourself"
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  {t("profile.location") || "Location"}
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={
                    t("profile.locationPlaceholder") || "City, Country"
                  }
                />
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="work">{t("profile.work") || "Work"}</Label>
                <Input
                  id="work"
                  name="work"
                  value={formData.work}
                  onChange={handleInputChange}
                  placeholder={
                    t("profile.workPlaceholder") || "Company or occupation"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">
                  {t("profile.education") || "Education"}
                </Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder={
                    t("profile.educationPlaceholder") || "School or university"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">
                  {t("profile.relationship") || "Relationship Status"}
                </Label>
                <select
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange as any}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">
                    {t("profile.selectStatus") || "Select status"}
                  </option>
                  <option value="single">
                    {t("profile.single") || "Single"}
                  </option>
                  <option value="relationship">
                    {t("profile.inRelationship") || "In a relationship"}
                  </option>
                  <option value="engaged">
                    {t("profile.engaged") || "Engaged"}
                  </option>
                  <option value="married">
                    {t("profile.married") || "Married"}
                  </option>
                  <option value="complicated">
                    {t("profile.complicated") || "It's complicated"}
                  </option>
                </select>
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-6 py-4">
              {/* Avatar Upload */}
              <div className="space-y-4">
                <Label>
                  {t("profile.profilePicture") || "Profile Picture"}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary bg-gray-100">
                    <img
                      src={
                        avatarPreview ||
                        formData.avatar ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                      }
                      alt="Profile"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </label>
                  </div>
                  <div className="flex-1">
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
                      {t("profile.uploadPhoto") || "Upload Photo"}
                    </label>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => setAvatarPreview(null)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t("profile.cancel") || "Cancel"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Photo Upload */}
              <div className="space-y-4">
                <Label>{t("profile.coverPhoto") || "Cover Photo"}</Label>
                <div className="space-y-3">
                  <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={
                        coverPreview ||
                        formData.coverPhoto ||
                        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80"
                      }
                      alt="Cover"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </label>
                  </div>
                  <div className="flex items-center">
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
                      {t("profile.uploadCover") || "Upload Cover"}
                    </label>
                    {coverPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => setCoverPreview(null)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t("profile.cancel") || "Cancel"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("profile.cancel") || "Cancel"}
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark">
              {t("profile.saveChanges") || "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
