import React, { useState } from "react";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import {
  ImageIcon,
  SmileIcon,
  VideoIcon,
  X,
  MapPin,
  TagIcon,
  Gift as GifIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PostCreatorProps {
  userAvatar?: string;
  userName?: string;
  placeholder?: string;
  onPost?: (content: string) => void;
}

const PostCreator = ({
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  userName = "Jane Doe",
  placeholder = "What's on your mind?",
  onPost = () => {},
}: PostCreatorProps) => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handlePostSubmit = () => {
    if (postContent.trim()) {
      onPost(postContent);
      setPostContent("");
      setSelectedImages([]);
      setIsDialogOpen(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // In a real app, you would upload these files to a server
      // Here we're just creating URLs for demo purposes
      const newImages = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file),
      );
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  return (
    <>
      <div className="w-full rounded-lg shadow-md p-4 mb-4 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <a href="/profile">
              <img src={userAvatar} alt={userName} />
            </a>
          </Avatar>
          <div
            className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-gray-500 cursor-pointer"
            onClick={handleOpenDialog}
          >
            {t("post.whatsOnYourMind")}
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
            {t("post.liveVideo")}
          </Button>

          <Button
            variant="ghost"
            className="flex-1 rounded-md text-gray-600 hover:bg-gray-100"
            size="sm"
            onClick={handleOpenDialog}
          >
            <ImageIcon className="mr-2 h-5 w-5 text-green-500" />
            {t("post.photoVideo")}
          </Button>

          <Button
            variant="ghost"
            className="flex-1 rounded-md text-gray-600 hover:bg-gray-100"
            size="sm"
            onClick={handleOpenDialog}
          >
            <SmileIcon className="mr-2 h-5 w-5 text-yellow-500" />
            {t("post.feelingActivity")}
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-white max-h-[90vh] overflow-y-auto">
          <div className="border-b border-gray-200 p-4 relative">
            <h2 className="text-xl font-semibold text-center">
              {t("post.createPost")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-3 rounded-full"
              onClick={handleCloseDialog}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <img src={userAvatar} alt={userName} />
              </Avatar>
              <div>
                <p className="font-semibold">{userName}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 mt-1 rounded-md text-xs"
                >
                  <GlobeIcon className="h-3 w-3 mr-1" /> {t("post.public")}
                </Button>
              </div>
            </div>

            <Textarea
              placeholder={t("post.whatsOnYourMind")}
              className="min-h-[120px] border-0 focus-visible:ring-0 text-lg p-0 resize-none"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              autoFocus
            />

            {selectedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {selectedImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative rounded-md overflow-hidden"
                  >
                    <img
                      src={img}
                      alt="Uploaded content"
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
                <p className="font-semibold">{t("post.addToYourPost")}</p>
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
              disabled={!postContent.trim()}
              onClick={handlePostSubmit}
            >
              {t("post.post")}
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
