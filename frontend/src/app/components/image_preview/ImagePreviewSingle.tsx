import React from "react";
import Image from "next/image";
import styles from "./ImagePreviewSingle.module.css";

interface ImagePreviewSingleProps {
    imageSrc: string;
    onClose: () => void;
}

const ImagePreviewSingle: React.FC<ImagePreviewSingleProps> = ({ imageSrc, onClose }) => {
    return (
        <div className={styles.previewOverlay}>
            <div className={styles.imageWrapper}>
                <Image
                    src={imageSrc}
                    alt="Preview"
                    fill
                    unoptimized
                    className={styles.previewImage}
                    style={{ objectFit: "contain" }}
                />
            </div>
            <button className={styles.closePreviewButton} onClick={onClose}>
                ✖
            </button>
        </div>
    );
};

export default ImagePreviewSingle;
