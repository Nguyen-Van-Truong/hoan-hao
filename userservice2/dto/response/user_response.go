package response

import (
	"time"
)

// UserResponse đại diện cho dữ liệu phản hồi người dùng
type UserResponse struct {
	ID                int64             `json:"id"`
	Username          string            `json:"username"`
	Email             string            `json:"email,omitempty"`
	Phone             string            `json:"phone,omitempty"`
	FullName          string            `json:"full_name"`
	Bio               string            `json:"bio,omitempty"`
	Location          string            `json:"location,omitempty"`
	LocationDetail    *LocationResponse `json:"location_detail,omitempty"`
	Website           string            `json:"website,omitempty"`
	ProfilePictureURL string            `json:"profile_picture_url,omitempty"`
	CoverPictureURL   string            `json:"cover_picture_url,omitempty"`
	DateOfBirth       string            `json:"date_of_birth,omitempty"`
	Work              string            `json:"work,omitempty"`
	Education         string            `json:"education,omitempty"`
	Relationship      string            `json:"relationship,omitempty"`
	IsVerified        bool              `json:"is_verified"`
	CreatedAt         time.Time         `json:"created_at"`
}
