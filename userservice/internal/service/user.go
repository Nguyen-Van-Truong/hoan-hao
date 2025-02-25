package service

import (
	"fmt"
	"time"
	"userservice/internal/model"
	"userservice/internal/repository"
)

// UserService định nghĩa interface cho tầng service
type UserService interface {
	CreateProfile(req model.UserProfileRequestDto) error
}

// userService là struct triển khai interface
type userService struct {
	repo repository.UserRepository
}

// NewUserService tạo instance mới của service
func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) CreateProfile(req model.UserProfileRequestDto) error {
	// Kiểm tra username đã tồn tại
	if _, err := s.repo.FindByUsername(req.Username); err == nil {
		return fmt.Errorf("username already exists")
	}

	// Tạo UserProfile
	profile := &model.UserProfile{
		Username:   req.Username,
		FullName:   req.FullName,
		IsActive:   true,
		IsVerified: false,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Parse DateOfBirth từ string nếu có
	if req.DateOfBirth != "" {
		dob, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err != nil {
			return fmt.Errorf("invalid date format for date_of_birth, expected format: 2006-01-02")
		}
		profile.DateOfBirth = &dob
	}

	// Lưu profile
	if err := s.repo.SaveProfile(profile); err != nil {
		return err
	}

	// Lưu email
	email := &model.UserEmail{
		UserID: profile.ID,
		Email:  req.Email,
	}
	return s.repo.SaveEmail(email)
}
