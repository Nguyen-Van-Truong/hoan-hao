package model

import "time"

// UserProfileRequestDto định nghĩa DTO cho request
type UserProfileRequestDto struct {
	Username    string `json:"username"`
	Email       string `json:"email"`
	FullName    string `json:"fullname"`
	DateOfBirth string `json:"dateOfBirth"` // Giữ là string
}

// UserProfile định nghĩa cấu trúc hồ sơ người dùng
type UserProfile struct {
	ID          uint       `json:"id"`
	Username    string     `json:"username"`
	FullName    string     `json:"full_name"`
	IsActive    bool       `json:"is_active"`
	IsVerified  bool       `json:"is_verified"`
	DateOfBirth *time.Time `json:"date_of_birth"` // Giữ *time.Time để hỗ trợ NULL
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (UserProfile) TableName() string {
	return "user_profile"
}

// UserEmail định nghĩa cấu trúc email người dùng
type UserEmail struct {
	ID     uint   `json:"id"`
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
}
