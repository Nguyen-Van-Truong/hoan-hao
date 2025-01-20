"use client";

import styles from "./PhotosTab.module.css";
import Image from "next/image";

const mockPhotos = ["/123.jpg", "/boji2.webp", "/1234.jpg"];

export default function PhotosTab() {
    return (
        <div className={styles.photos}>
            {mockPhotos.map((photo, index) => (
                <Image
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    width={100}
                    height={100}
                    className={styles.photoItem}
                    unoptimized
                    loading="lazy"
                />
            ))}
        </div>
    );
}
