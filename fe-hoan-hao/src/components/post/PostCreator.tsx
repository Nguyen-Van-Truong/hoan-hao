import React, { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
  DialogTitle,
  DialogDescription 
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Textarea } from "../ui/textarea";
import {
  ImageIcon,
  SmileIcon,
  VideoIcon,
  X,
  MapPin,
  TagIcon,
  Gift as GifIcon,
  Lock,
  Users,
  Globe,
  ChevronDown,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { createPost, CreatePostParams } from "@/api/services/postApi";
import { toast } from "react-hot-toast";

interface PostCreatorProps {
  placeholder?: string;
  onPost?: (content: string) => void;
  onPostCreated?: () => void; // Callback khi tạo bài viết thành công, để refresh feed
}

type VisibilityType = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

interface VisibilityOption {
  value: VisibilityType;
  label: string;
  icon: React.ReactNode;
}

const visibilityOptions: VisibilityOption[] = [
  {
    value: 'PUBLIC',
    label: 'Công khai',
    icon: <Globe className="h-4 w-4 mr-2" />,
  },
  {
    value: 'FRIENDS',
    label: 'Bạn bè',
    icon: <Users className="h-4 w-4 mr-2" />,
  },
  {
    value: 'PRIVATE',
    label: 'Chỉ mình tôi',
    icon: <Lock className="h-4 w-4 mr-2" />,
  },
];

const PostCreator = ({
  placeholder = "What's on your mind?",
  onPost = () => {},
  onPostCreated = () => {},
}: PostCreatorProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<VisibilityType>('PUBLIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nếu không có user, không hiển thị component
  if (!user) {
    return null;
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    // Reset form khi đóng dialog
    if (!isSubmitting) {
      setIsDialogOpen(false);
      setPostContent("");
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setVisibility('PUBLIC');
    }
  };

  const handlePostSubmit = async () => {
    if (postContent.trim()) {
      try {
        setIsSubmitting(true);
        
        // Tạo params để gọi API
        const params: CreatePostParams = {
          content: postContent,
          visibility: visibility,
          images: selectedImages
        };
        
        // Gọi API tạo bài viết
        await createPost(params);
        
        // Xử lý thành công
        toast.success("Đã đăng bài viết thành công");
        
        // Reset form
        setPostContent("");
        setSelectedImages([]);
        setImagePreviewUrls([]);
        
        // Đóng dialog
        setIsDialogOpen(false);
        
        // Gọi callback để refresh feed
        onPostCreated();
        
      } catch (error) {
        let errorMessage = "Không thể đăng bài viết";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Giới hạn số lượng ảnh tối đa là 8
      const fileList = Array.from(e.target.files);
      const totalImages = selectedImages.length + fileList.length;
      
      if (totalImages > 8) {
        toast.error("Bạn chỉ có thể tải lên tối đa 8 ảnh");
        return;
      }
      
      // Lưu file ảnh để gửi lên server
      setSelectedImages(prev => [...prev, ...fileList]);
      
      // Tạo URL preview cho ảnh
      const newImageUrls = fileList.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
    }
    
    // Reset input để có thể chọn lại cùng một file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Xóa file ảnh
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    
    // Xóa URL preview
    const newImageUrls = [...imagePreviewUrls];
    
    // Giải phóng URL object để tránh rò rỉ bộ nhớ
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImageUrls.splice(index, 1);
    setImagePreviewUrls(newImageUrls);
  };

  const getSelectedVisibilityOption = () => {
    return visibilityOptions.find(option => option.value === visibility) || visibilityOptions[0];
  };

  return (
    <>
      <div className="w-full rounded-lg shadow-md p-4 mb-4 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile_picture_url || "/avatardefaut.png"} alt={user.full_name} />
            <AvatarFallback className="bg-primary-light/20 text-primary">
              {user.full_name?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div
            className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-gray-500 cursor-pointer"
            onClick={handleOpenDialog}
          >
            {t("post.whatsOnYourMind") || "Bạn đang nghĩ gì?"}
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="flex-1 rounded-md text-gray-600 hover:bg-gray-100"
            size="sm"
            onClick={handleOpenDialog}
          >
            <VideoIcon className="mr-2 h-5 w-5 text-red-500" />
            {t("post.liveVideo") || "Video trực tiếp"}
          </Button>

          <Button
            variant="ghost"
            className="flex-1 rounded-md text-gray-600 hover:bg-gray-100"
            size="sm"
            onClick={handleOpenDialog}
          >
            <ImageIcon className="mr-2 h-5 w-5 text-green-500" />
            {t("post.photoVideo") || "Ảnh/Video"}
          </Button>

          <Button
            variant="ghost"
            className="flex-1 rounded-md text-gray-600 hover:bg-gray-100"
            size="sm"
            onClick={handleOpenDialog}
          >
            <SmileIcon className="mr-2 h-5 w-5 text-yellow-500" />
            {t("post.feelingActivity") || "Cảm xúc/Hoạt động"}
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-white max-h-[90vh] overflow-y-auto">
          <div className="border-b border-gray-200 p-4 relative">
            <DialogTitle className="text-xl font-semibold text-center">
              {t("post.createPost") || "Tạo bài viết"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("post.createPostDescription") || "Tạo và chia sẻ bài viết mới với bạn bè của bạn"}
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-3 rounded-full"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profile_picture_url || "/avatardefaut.png"} alt={user.full_name} />
                <AvatarFallback className="bg-primary-light/20 text-primary">
                  {user.full_name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.full_name}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 mt-1 rounded-md text-xs"
                    >
                      {getSelectedVisibilityOption().icon}
                      {getSelectedVisibilityOption().label}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {visibilityOptions.map((option) => (
                      <DropdownMenuItem 
                        key={option.value}
                        onClick={() => setVisibility(option.value)}
                        className="flex items-center cursor-pointer"
                      >
                        {option.icon}
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Textarea
              placeholder={t("post.whatsOnYourMind") || "Bạn đang nghĩ gì?"}
              className="min-h-[120px] border-0 focus-visible:ring-0 text-lg p-0 resize-none"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              autoFocus
            />

            {imagePreviewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {imagePreviewUrls.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="relative rounded-md overflow-hidden"
                  >
                    <img
                      src={imgUrl}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 bg-gray-800/60 hover:bg-gray-800/80 rounded-full h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <p className="font-semibold">{t("post.addToYourPost") || "Thêm vào bài viết của bạn"}</p>
                <div className="flex space-x-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="h-6 w-6 text-green-500" />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                  <TagIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
                  <SmileIcon className="h-6 w-6 text-yellow-500 cursor-pointer" />
                  <MapPin className="h-6 w-6 text-red-500 cursor-pointer" />
                  <GifIcon className="h-6 w-6 text-purple-500 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-200">
            <Button
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-md"
              disabled={!postContent.trim() || isSubmitting}
              onClick={handlePostSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("post.posting") || "Đang đăng..."}
                </>
              ) : (
                t("post.post") || "Đăng"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Simple Globe icon component
const GlobeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default PostCreator;
