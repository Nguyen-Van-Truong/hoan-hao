// userservice/internal/service/user.go
package service

import (
	"fmt"
	"time"
	"userservice/internal/model"
	"userservice/internal/repository"
)

type UserService interface {
	CreateProfile(req model.UserProfileRequestDto) error
	SendFriendRequest(userID, friendID uint) error
	UpdateFriendRequest(friendID uint, status string) error
	GetPublicProfile(userID uint) (*model.UserProfile, error)
	GetMyProfile(userID uint) (*model.UserProfile, error)
	GetFriends(userID uint) ([]model.Friend, error)
	GetFriendSuggestions(userID uint, limit int) ([]model.UserProfile, error)
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

	// Kiểm tra trùng số điện thoại
	if req.CountryCode != "" && req.PhoneNumber != "" {
		exists, err := s.repo.ExistsByCountryCodeAndPhoneNumber(req.CountryCode, req.PhoneNumber)
		if err != nil {
			return fmt.Errorf("error checking phone number: %v", err)
		}
		if exists {
			return fmt.Errorf("phone number already exists")
		}
	}

	// Tạo UserProfile
	profile := &model.UserProfile{
		UserID:         req.UserID,
		Username:       req.Username,
		FullName:       req.FullName,
		IsActive:       true,
		IsVerified:     false,
		Bio:            req.Bio,
		Location:       req.Location,
		Website:        req.Website,
		ProfilePicture: req.ProfilePicture,
		CoverPicture:   req.CoverPicture,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Parse DateOfBirth nếu có
	if req.DateOfBirth != "" {
		dob, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err != nil {
			return fmt.Errorf("invalid date format for date_of_birth, expected format: 2006-01-02")
		}
		profile.DateOfBirth = &dob
	}

	// Gán các ID địa lý nếu có
	if req.CountryID != 0 {
		profile.CountryID = &req.CountryID
	}
	if req.ProvinceID != 0 {
		profile.ProvinceID = &req.ProvinceID
	}
	if req.DistrictID != 0 {
		profile.DistrictID = &req.DistrictID
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

func (s *userService) SendFriendRequest(userID, friendID uint) error {
	if userID == friendID {
		return fmt.Errorf("cannot send friend request to yourself")
	}

	// Check if a friend relationship already exists
	friends, err := s.repo.GetFriends(userID)
	if err == nil {
		for _, f := range friends {
			if (f.UserID == userID && f.FriendID == friendID) || (f.UserID == friendID && f.FriendID == userID) {
				return fmt.Errorf("friend request already exists or users are already friends")
			}
		}
	}

	profile, err := s.repo.FindProfileByUserID(userID)
	if err != nil {
		return fmt.Errorf("user not found: %v", err)
	}
	friendProfile, err := s.repo.FindProfileByUserID(friendID)
	if err != nil {
		return fmt.Errorf("friend not found: %v", err)
	}

	friend := &model.Friend{
		UserID:         userID,
		UserUsername:   profile.Username,
		FriendID:       friendID,
		FriendUsername: friendProfile.Username,
		Status:         "PENDING",
		ActionBy:       &userID,
	}
	return s.repo.SaveFriend(friend)
}

func (s *userService) UpdateFriendRequest(friendID uint, status string) error {
	if status != "ACCEPTED" && status != "BLOCKED" {
		return fmt.Errorf("invalid status, must be ACCEPTED or BLOCKED")
	}
	return s.repo.UpdateFriendStatus(friendID, status)
}

func (s *userService) GetPublicProfile(userID uint) (*model.UserProfile, error) {
	return s.repo.FindProfileByID(userID)
}

func (s *userService) GetMyProfile(userID uint) (*model.UserProfile, error) {
	return s.repo.FindProfileByUserID(userID)
}

func (s *userService) GetFriends(userID uint) ([]model.Friend, error) {
	return s.repo.GetFriends(userID)
}

func (s *userService) GetFriendSuggestions(userID uint, limit int) ([]model.UserProfile, error) {
	return s.repo.GetFriendSuggestions(userID, limit)
}
