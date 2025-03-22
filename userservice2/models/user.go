package models

import (
	"time"
)

// User đại diện cho người dùng trong hệ thống
type User struct {
	ID                int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	Username          string    `json:"username" gorm:"size:50;not null;index:idx_username"`
	Email             string    `json:"email" gorm:"size:100;not null;index:idx_email"`
	Phone             string    `json:"phone" gorm:"size:20"`
	FullName          string    `json:"full_name" gorm:"size:100;not null"`
	Bio               string    `json:"bio" gorm:"type:text"`
	Location          string    `json:"location" gorm:"size:100"`
	CountryID         int       `json:"country_id" gorm:"default:null"`
	ProvinceID        int       `json:"province_id" gorm:"default:null"`
	DistrictID        int       `json:"district_id" gorm:"default:null"`
	Website           string    `json:"website" gorm:"size:255"`
	ProfilePictureURL string    `json:"profile_picture_url" gorm:"size:255"`
	CoverPictureURL   string    `json:"cover_picture_url" gorm:"size:255"`
	DateOfBirth       time.Time `json:"date_of_birth" gorm:"type:date"`
	Work              string    `json:"work" gorm:"size:100"`
	Education         string    `json:"education" gorm:"size:100"`
	Relationship      string    `json:"relationship" gorm:"size:50"`
	IsActive          bool      `json:"is_active" gorm:"default:true"`
	IsVerified        bool      `json:"is_verified" gorm:"default:false"`
	LastLoginAt       time.Time `json:"last_login_at" gorm:"default:null"`
	CreatedAt         time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt         time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (User) TableName() string {
	return "users"
}

// UserResponse đại diện cho dữ liệu phản hồi người dùng
type UserResponse struct {
	ID                int64     `json:"id"`
	Username          string    `json:"username"`
	Email             string    `json:"email,omitempty"`
	Phone             string    `json:"phone,omitempty"`
	FullName          string    `json:"full_name"`
	Bio               string    `json:"bio,omitempty"`
	Location          string    `json:"location,omitempty"`
	Website           string    `json:"website,omitempty"`
	ProfilePictureURL string    `json:"profile_picture_url,omitempty"`
	CoverPictureURL   string    `json:"cover_picture_url,omitempty"`
	DateOfBirth       string    `json:"date_of_birth,omitempty"`
	Work              string    `json:"work,omitempty"`
	Education         string    `json:"education,omitempty"`
	Relationship      string    `json:"relationship,omitempty"`
	IsVerified        bool      `json:"is_verified"`
	CreatedAt         time.Time `json:"created_at"`
}

// UserProfileUpdateRequest đại diện cho yêu cầu cập nhật thông tin người dùng
type UserProfileUpdateRequest struct {
	FullName     string `json:"full_name"`
	Bio          string `json:"bio"`
	Location     string `json:"location"`
	CountryID    int    `json:"country_id"`
	ProvinceID   int    `json:"province_id"`
	DistrictID   int    `json:"district_id"`
	Website      string `json:"website"`
	DateOfBirth  string `json:"date_of_birth"` // Format: YYYY-MM-DD
	Work         string `json:"work"`
	Education    string `json:"education"`
	Relationship string `json:"relationship"`
}

// UserListResponse đại diện cho danh sách người dùng với phân trang
type UserListResponse struct {
	Users      []UserResponse `json:"users"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
	TotalPages int64          `json:"total_pages"`
}
