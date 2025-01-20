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
    const [name, setName] = useState(currentName);
    const [description, setDescription] = useState(currentDescription);
    const [avatar, setAvatar] = useState(currentAvatar);

    const handleSave = () => {
        console.log("Lưu thông tin:", { name, description, avatar });
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
