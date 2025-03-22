import React, { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

const PhotoViewer = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
}: PhotoViewerProps) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="relative flex flex-col h-full w-full">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="text-white font-medium">
              {currentIndex + 1} / {images.length}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-black/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <img
              src={images[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>

          {/* Navigation Controls */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 ml-2"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 mr-2"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-black/70 to-transparent overflow-x-auto">
            <div className="flex space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${currentIndex === index ? "border-[#f2a2d2] scale-105" : "border-transparent opacity-70"}`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoViewer;
