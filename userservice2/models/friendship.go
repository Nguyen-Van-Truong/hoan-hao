package models

import (
	"time"
)

// FriendshipStatus đại diện cho trạng thái mối quan hệ bạn bè
type FriendshipStatus string

const (
	// Các trạng thái friendship
	FriendshipStatusNone     FriendshipStatus = "none"
	FriendshipStatusPending  FriendshipStatus = "pending"
	FriendshipStatusAccepted FriendshipStatus = "accepted"
	FriendshipStatusRejected FriendshipStatus = "rejected"
	FriendshipStatusBlocked  FriendshipStatus = "blocked"
)

// Friendship đại diện cho mối quan hệ bạn bè giữa hai người dùng
type Friendship struct {
	ID        int64            `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    int64            `json:"user_id" gorm:"not null;index:idx_user_id;uniqueIndex:unique_friendship"`
	FriendID  int64            `json:"friend_id" gorm:"not null;index:idx_friend_id;uniqueIndex:unique_friendship"`
	Status    FriendshipStatus `json:"status" gorm:"type:enum('none','pending','accepted','rejected','blocked');default:'pending';index:idx_status"`
	CreatedAt time.Time        `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time        `json:"updated_at" gorm:"autoUpdateTime"`
	User      User             `json:"user" gorm:"foreignKey:UserID"`
	Friend    User             `json:"friend" gorm:"foreignKey:FriendID"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (Friendship) TableName() string {
	return "friendships"
}
