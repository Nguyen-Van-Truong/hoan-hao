package service

import (
	"fmt"
	"time"
	"userservice/internal/model"
	"userservice/internal/repository"
)

type UserService interface {
	CreateProfile(req model.UserProfileRequestDto) error
}

type userService struct {
	repo repository.UserRepository
}

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
		UserID:     profile.ID,
		Email:      req.Email,
		Visibility: "private",
	}
	if err := s.repo.SaveEmail(email); err != nil {
		return err
	}

	// Lưu số điện thoại nếu có
	if req.CountryCode != "" && req.PhoneNumber != "" {
		phone := &model.UserPhoneNumber{
			UserID:      profile.ID,
			CountryCode: req.CountryCode,
			PhoneNumber: req.PhoneNumber,
			Visibility:  "private",
		}
		if err := s.repo.SavePhoneNumber(phone); err != nil {
			return err
		}
	}

	return nil
}
