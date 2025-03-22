import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  aspectRatio?: string;
}

const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ className, src, alt, fallback, aspectRatio = "16/9", ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      // Reset states when src changes
      if (src) {
        setIsLoading(true);
        setError(false);
      }
    }, [src]);

    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setError(true);
    };

    // Calculate aspect ratio style
    const aspectRatioStyle = {
      aspectRatio,
    };

    return (
      <div
        className={cn("relative overflow-hidden bg-muted", className)}
        style={aspectRatioStyle}
      >
        {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}

        {error && fallback ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            {fallback}
          </div>
        ) : (
          <img
            ref={ref}
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
            )}
            {...props}
          />
        )}
      </div>
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";

export { OptimizedImage };
