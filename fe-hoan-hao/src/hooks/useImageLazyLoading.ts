import { useEffect } from "react";

/**
 * Hook to implement lazy loading for images across the application
 */
export function useImageLazyLoading() {
  useEffect(() => {
    // Find all images that should be lazy loaded
    const images = document.querySelectorAll("img:not([loading])");

    // Add loading="lazy" attribute to all images that don't have it
    images.forEach((img) => {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
    });

    // Optional: Set up Intersection Observer for more advanced lazy loading
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const dataSrc = img.getAttribute("data-src");

            if (dataSrc) {
              img.src = dataSrc;
              img.removeAttribute("data-src");
            }

            observer.unobserve(img);
          }
        });
      });

      // Find all images with data-src attribute
      const lazyImages = document.querySelectorAll("img[data-src]");
      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });
    }

    return () => {
      // Clean up if needed
    };
  }, []);
}
