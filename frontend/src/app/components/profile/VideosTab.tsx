"use client";

import styles from "./VideosTab.module.css";

const mockVideos = ["/video1.mp4", "/video2.mp4", "/video3.mp4"];

export default function VideosTab() {
    return (
        <div className={styles.videos}>
            {mockVideos.map((video, index) => (
                <video
                    key={index}
                    src={video}
                    controls
                    className={styles.videoItem}
                />
            ))}
        </div>
    );
}
