package request

import (
	"time"
	"userservice2/models"
)

// UserProfileRequest đại diện cho yêu cầu tạo profile từ authservice
type UserProfileRequest struct {
	Username    string `json:"username" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	FullName    string `json:"fullName" binding:"required"`
	DateOfBirth string `json:"dateOfBirth"`
	CountryCode string `json:"countryCode"`
	PhoneNumber string `json:"phoneNumber"`
	ID          int64  `json:"id" binding:"required"`
}

// ToUser chuyển đổi UserProfileRequest sang User
func (r *UserProfileRequest) ToUser() (*models.User, error) {
	user := &models.User{
		ID:         r.ID,
		Username:   r.Username,
		Email:      r.Email,
		FullName:   r.FullName,
		IsActive:   true,
		IsVerified: false,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Xử lý phone nếu có
	if r.CountryCode != "" && r.PhoneNumber != "" {
		user.Phone = r.CountryCode + r.PhoneNumber
	}

	// Xử lý date of birth nếu có
	if r.DateOfBirth != "" {
		dob, err := time.Parse("2006-01-02", r.DateOfBirth)
		if err != nil {
			return nil, err
		}
		user.DateOfBirth = dob
	}

	return user, nil
}
