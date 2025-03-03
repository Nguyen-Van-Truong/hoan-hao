// frontend/src/app/components/profile/EditProfileDialog.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./EditProfileDialog.module.css";

interface EditProfileDialogProps {
    onClose: () => void;
    currentName: string;
    currentDescription: string;
    currentAvatar: string;
}

export default function EditProfileDialog({
                                              onClose,
                                              currentName,
                                              currentDescription,
                                              currentAvatar,
                                          }: EditProfileDialogProps) {
    // Trạng thái cho các trường từ user_profiles
    const [name, setName] = useState(currentName); // full_name
    const [description, setDescription] = useState(currentDescription); // bio
    const [avatar, setAvatar] = useState(currentAvatar); // profile_picture_url
    const [location, setLocation] = useState("Hà Nội"); // location
    const [website, setWebsite] = useState("https://example.com"); // website

    const handleSave = () => {
        // Dữ liệu giả lập được lưu (không gọi API)
        console.log("Lưu thông tin:", {
            full_name: name,
            bio: description,
            profile_picture_url: avatar,
            location: location,
            website: website,
        });
        onClose();
    };

    useEffect(() => {
        document.body.style.overflow = "hidden"; // Vô hiệu hóa cuộn trang khi mở dialog
        return () => {
            document.body.style.overflow = ""; // Khôi phục trạng thái cuộn khi đóng dialog
        };
    }, []);

    return (
        <div className={styles.dialog}>
            <div className={styles.dialogContent}>
                <div className={styles.header}>
                    <h2>Chỉnh sửa hồ sơ</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✖
                    </button>
                </div>
                <div className={styles.body}>
                    <div className={styles.field}>
                        <label>Tên</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Mô tả</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Vị trí</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Website</label>
                        <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Ảnh đại diện</label>
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => setAvatar(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <div className={styles.avatarPreview}>
                            <Image
                                src={avatar}
                                alt="Avatar Preview"
                                width={100}
                                height={100}
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.footer}>
                    <button className={styles.saveButton} onClick={handleSave}>
                        Lưu
                    </button>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}