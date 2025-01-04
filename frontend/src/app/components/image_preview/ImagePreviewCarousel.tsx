import React from "react";
import Image from "next/image";
import styles from "./ImagePreviewCarousel.module.css";

interface ImagePreviewCarouselProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
}

const ImagePreviewCarousel: React.FC<ImagePreviewCarouselProps> = ({
                                                                       images,
                                                                       currentIndex,
                                                                       onClose,
                                                                       onNext,
                                                                       onPrevious,
                                                                   }) => {
    return (
        <div className={styles.previewOverlay}>
            <button className={styles.prevButton} onClick={onPrevious}>
                ◀
            </button>
            <div className={styles.imageWrapper}>
                <Image
                    src={images[currentIndex]}
                    alt={`Preview ${currentIndex + 1}`}
                    fill
                    unoptimized
                    style={{ objectFit: "contain" }}
                    className={styles.previewImage}
                />
            </div>
            <button className={styles.nextButton} onClick={onNext}>
                ▶
            </button>
            <button className={styles.closePreviewButton} onClick={onClose}>
                ✖
            </button>
        </div>
    );
};

export default ImagePreviewCarousel;
