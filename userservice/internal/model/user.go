package model

import "time"

type UserProfileRequestDto struct {
	Username    string `json:"username"`
	Email       string `json:"email"`
	FullName    string `json:"fullname"`
	DateOfBirth string `json:"dateOfBirth"`
	CountryCode string `json:"countryCode"` // Thêm countryCode
	PhoneNumber string `json:"phoneNumber"` // Thêm phoneNumber
}

type UserProfile struct {
	ID          uint       `json:"id"`
	Username    string     `json:"username"`
	FullName    string     `json:"full_name"`
	IsActive    bool       `json:"is_active"`
	IsVerified  bool       `json:"is_verified"`
	DateOfBirth *time.Time `json:"date_of_birth"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (UserProfile) TableName() string {
	return "user_profile"
}

type UserEmail struct {
	ID         uint   `json:"id"`
	UserID     uint   `json:"user_id"`
	Email      string `json:"email"`
	Visibility string `json:"visibility"`
}

type UserPhoneNumber struct {
	ID          uint   `json:"id"`
	UserID      uint   `json:"user_id"`
	CountryCode string `json:"country_code"`
	PhoneNumber string `json:"phone_number"`
	Visibility  string `json:"visibility"`
}
