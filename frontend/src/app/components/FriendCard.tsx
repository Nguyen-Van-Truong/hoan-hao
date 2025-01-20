"use client";

import { useRouter } from "next/navigation";
import styles from "./FriendCard.module.css";
import Image from "next/image";

interface FriendCardProps {
    name: string;
    username: string;
    avatar: string;
}

export default function FriendCard({ name, username, avatar }: FriendCardProps) {
    const router = useRouter();

    const navigateToProfile = () => {
        router.push(`/profile/${username}`);
    };

    return (
        <div className={styles.friendCard}>
            <Image
                src={avatar}
                alt={name}
                className={styles.avatar}
                width={120}
                height={120}
                unoptimized
                loading={"lazy"}
                onClick={navigateToProfile}
            />
            <p className={styles.name} onClick={navigateToProfile}>
                {name}
            </p>
            <p className={styles.username} onClick={navigateToProfile}>
                {username}
            </p>
            <button className={styles.addFriendButton}>Kết bạn</button>
        </div>
    );
}
