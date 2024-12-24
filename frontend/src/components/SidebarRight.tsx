// frontend/src/components/SidebarRight.tsx
import styles from "./SidebarRight.module.css";

export default function SidebarRight() {
    return (
        <div className={styles.sidebarRight}>
            {/* Logo người dùng */}
            <div className={styles.userProfile}>
                <img
                    src="/user-logo.png"
                    alt="User Profile"
                    className={styles.userImage}
                />
            </div>

            {/* Quảng cáo */}
            <div className={styles.ads}>
                <h3 className={styles.adsTitle}>Quảng cáo</h3>
                <div className={styles.adBox}>
                    <div className={styles.adContent}>
                        <p>Nội dung quảng cáo</p>
                    </div>
                </div>
                <div className={styles.adBox}>
                    <div className={styles.adContent}>
                        <p>Nội dung quảng cáo</p>
                    </div>
                </div>
            </div>

            {/* Đề xuất bạn bè */}
            <div className={styles.suggestedFriends}>
                <div className={styles.friendsHeader}>
                    <h3>Đề xuất bạn bè</h3>
                    <a href="#" className={styles.viewAll}>
                        Xem tất cả →
                    </a>
                </div>
                <div className={styles.friendList}>
                    {[
                        { name: "Julia Smith", username: "@juliasmith" },
                        { name: "Vermillion D. Gray", username: "@vermilliongray" },
                        { name: "Mai Senpai", username: "@maisenpai" },
                        { name: "Azunyan U. Wu", username: "@azunyanudesu" },
                        { name: "Oarack Babama", username: "@obama21" },
                    ].map((friend, index) => (
                        <div className={styles.friendItem} key={index}>
                            <div className={styles.friendInfo}>
                                <img
                                    src="/user-logo.png"
                                    alt={friend.name}
                                    className={styles.friendAvatar}
                                />
                                <div>
                                    <p className={styles.friendName}>{friend.name}</p>
                                    <p className={styles.friendUsername}>
                                        {friend.username}
                                    </p>
                                </div>
                            </div>
                            <button className={styles.addFriendButton}>+</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
