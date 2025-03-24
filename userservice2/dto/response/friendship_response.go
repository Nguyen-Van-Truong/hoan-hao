package response

import (
	"time"
	"userservice2/models"
)

// FriendResponse là DTO cho thông tin bạn bè
type FriendResponse struct {
	ID                 int64     `json:"id"`
	UserID             int64     `json:"user_id"`
	FriendID           int64     `json:"friend_id"`
	Status             string    `json:"status"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
	Friend             UserBasic `json:"friend"`
	MutualFriendsCount int       `json:"mutual_friends_count,omitempty"`
}

// UserBasic là DTO cho thông tin cơ bản của người dùng
type UserBasic struct {
	ID                int64  `json:"id"`
	Username          string `json:"username"`
	Email             string `json:"email,omitempty"`
	FullName          string `json:"full_name"`
	ProfilePictureURL string `json:"profile_picture_url,omitempty"`
	CoverPictureURL   string `json:"cover_picture_url,omitempty"`
}

// FriendListResponse là DTO cho danh sách bạn bè
type FriendListResponse struct {
	Friends  []FriendResponse `json:"friends"`
	Total    int64            `json:"total"`
	Page     int              `json:"page"`
	PageSize int              `json:"page_size"`
}

// FriendSuggestionResponse là DTO cho gợi ý kết bạn
type FriendSuggestionResponse struct {
	ID                 int64  `json:"id"`
	Username           string `json:"username"`
	Email              string `json:"email,omitempty"`
	FullName           string `json:"full_name"`
	ProfilePictureURL  string `json:"profile_picture_url,omitempty"`
	CoverPictureURL    string `json:"cover_picture_url,omitempty"`
	MutualFriendsCount int    `json:"mutual_friends_count,omitempty"`
}

// FriendSuggestionListResponse là DTO cho danh sách gợi ý kết bạn
type FriendSuggestionListResponse struct {
	Suggestions []FriendSuggestionResponse `json:"suggestions"`
}

// ToFriendResponse chuyển đổi từ model Friendship sang FriendResponse
func ToFriendResponse(friendship *models.Friendship, userID int64, mutualCount int) FriendResponse {
	var friend models.User
	if friendship.UserID == userID {
		friend = friendship.Friend
	} else {
		friend = friendship.User
	}

	return FriendResponse{
		ID:                 friendship.ID,
		UserID:             friendship.UserID,
		FriendID:           friendship.FriendID,
		Status:             string(friendship.Status),
		CreatedAt:          friendship.CreatedAt,
		UpdatedAt:          friendship.UpdatedAt,
		Friend:             ToUserBasic(&friend),
		MutualFriendsCount: mutualCount,
	}
}

// ToUserBasic chuyển đổi từ model User sang UserBasic
func ToUserBasic(user *models.User) UserBasic {
	return UserBasic{
		ID:                user.ID,
		Username:          user.Username,
		Email:             user.Email,
		FullName:          user.FullName,
		ProfilePictureURL: user.ProfilePictureURL,
		CoverPictureURL:   user.CoverPictureURL,
	}
}

// ToFriendSuggestionResponse chuyển đổi từ model User sang FriendSuggestionResponse
func ToFriendSuggestionResponse(user *models.User, mutualCount int) FriendSuggestionResponse {
	return FriendSuggestionResponse{
		ID:                 user.ID,
		Username:           user.Username,
		Email:              user.Email,
		FullName:           user.FullName,
		ProfilePictureURL:  user.ProfilePictureURL,
		CoverPictureURL:    user.CoverPictureURL,
		MutualFriendsCount: mutualCount,
	}
}
