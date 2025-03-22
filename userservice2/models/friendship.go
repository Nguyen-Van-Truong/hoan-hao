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
	UserID    int64            `json:"user_id" gorm:"not null;index:idx_user_id"`
	FriendID  int64            `json:"friend_id" gorm:"not null;index:idx_friend_id"`
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

// FriendshipAction đại diện cho các hành động quản lý bạn bè
type FriendshipAction struct {
	Action   string `json:"action" binding:"required,oneof=request accept reject cancel unfriend block unblock"`
	FriendID int64  `json:"friend_id" binding:"required"`
}

// FriendshipRequest đại diện cho yêu cầu kết bạn
type FriendshipRequest struct {
	FriendID int64 `json:"friend_id" binding:"required"`
}

// FriendResponse đại diện cho thông tin phản hồi của một người bạn
type FriendResponse struct {
	ID                int64     `json:"id"`
	Username          string    `json:"username"`
	FullName          string    `json:"full_name"`
	ProfilePictureURL string    `json:"profile_picture_url,omitempty"`
	Status            string    `json:"status"`
	CreatedAt         time.Time `json:"created_at"`
}

// FriendshipListResponse đại diện cho danh sách bạn bè với phân trang
type FriendshipListResponse struct {
	Friends    []FriendResponse `json:"friends"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int64            `json:"total_pages"`
}

// FriendSuggestionResponse đại diện cho gợi ý kết bạn
type FriendSuggestionResponse struct {
	Suggestions []UserSuggestion `json:"suggestions"`
	Total       int64            `json:"total"`
}

// UserSuggestion đại diện cho thông tin gợi ý người dùng
type UserSuggestion struct {
	ID                int64  `json:"id"`
	Username          string `json:"username"`
	FullName          string `json:"full_name"`
	ProfilePictureURL string `json:"profile_picture_url,omitempty"`
	MutualFriends     int    `json:"mutual_friends"`
}
