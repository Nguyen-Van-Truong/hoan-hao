package service

import (
	"fmt"
	"time"
	"userservice/internal/model"
	"userservice/internal/repository"
	"userservice/internal/util"

	"github.com/jinzhu/gorm"
)

type UserService interface {
	CreateProfile(req model.UserProfileRequestDto) error
	SendFriendRequest(userID, friendID uint) error
	CancelFriendRequest(userID, friendID uint) error
	BlockUser(userID, friendID uint) error
	UnblockUser(userID, friendID uint) error
	UpdateFriendRequest(userID, friendID uint, status string) error
	GetPublicProfileWithFriendStatus(username string, currentUserID uint) (*model.UserProfile, string, error)
	GetMyProfile(userID uint) (*model.UserProfile, error)
	GetFriends(userID uint) ([]model.Friend, error)
	GetFriendProfiles(userID uint, limit, offset int) ([]model.UserProfile, int64, error) // Cập nhật để hỗ trợ phân trang
	GetFriendSuggestions(userID uint, limit int) ([]model.UserProfile, error)
	GetIncomingFriendRequests(userID uint, limit, offset int) ([]model.Friend, int64, error)
	GetOutgoingFriendRequests(userID uint, limit, offset int) ([]model.Friend, int64, error)
	UpdateProfile(userID uint, req model.UpdateProfileRequestDto, avatarData, coverData interface{}) (*model.UserProfile, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) CreateProfile(req model.UserProfileRequestDto) error {
	if _, err := s.repo.FindByUsername(req.Username); err == nil {
		return fmt.Errorf("username already exists")
	}

	if req.CountryCode != "" && req.PhoneNumber != "" {
		exists, err := s.repo.ExistsByCountryCodeAndPhoneNumber(req.CountryCode, req.PhoneNumber)
		if err != nil {
			return fmt.Errorf("error checking phone number: %v", err)
		}
		if exists {
			return fmt.Errorf("phone number already exists")
		}
	}

	profile := &model.UserProfile{
		ID:                req.UserID,
		Username:          req.Username,
		FullName:          req.FullName,
		IsActive:          true,
		IsVerified:        false,
		Bio:               req.Bio,
		Location:          req.Location,
		Website:           req.Website,
		ProfilePictureURL: req.ProfilePictureURL,
		CoverPictureURL:   req.CoverPictureURL,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if req.DateOfBirth != "" {
		dob, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err != nil {
			return fmt.Errorf("invalid date format for date_of_birth, expected format: 2006-01-02")
		}
		profile.DateOfBirth = &dob
	}

	if req.CountryID != 0 {
		profile.CountryID = &req.CountryID
	}
	if req.ProvinceID != 0 {
		profile.ProvinceID = &req.ProvinceID
	}
	if req.DistrictID != 0 {
		profile.DistrictID = &req.DistrictID
	}

	if err := s.repo.SaveProfile(profile); err != nil {
		return fmt.Errorf("failed to save profile: %v", err)
	}

	email := &model.UserEmail{
		UserID:     profile.ID,
		Email:      req.Email,
		Visibility: "private",
	}
	if err := s.repo.SaveEmail(email); err != nil {
		return fmt.Errorf("failed to save email: %v", err)
	}

	if req.CountryCode != "" && req.PhoneNumber != "" {
		phone := &model.UserPhoneNumber{
			UserID:      profile.ID,
			CountryCode: req.CountryCode,
			PhoneNumber: req.PhoneNumber,
			Visibility:  "private",
		}
		if err := s.repo.SavePhoneNumber(phone); err != nil {
			return fmt.Errorf("failed to save phone number: %v", err)
		}
	}

	return nil
}

func (s *userService) SendFriendRequest(userID, friendID uint) error {
	if userID == friendID {
		return fmt.Errorf("cannot send friend request to yourself")
	}

	var existingFriend model.Friend
	err := s.repo.DB().Where("(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", userID, friendID, friendID, userID).
		First(&existingFriend).Error
	if err == nil {
		return fmt.Errorf("friend request already exists or users are already friends")
	}

	profile, err := s.repo.FindProfileByID(userID)
	if err != nil {
		return fmt.Errorf("user not found: %v", err)
	}
	friendProfile, err := s.repo.FindProfileByID(friendID)
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

func (s *userService) CancelFriendRequest(userID, friendID uint) error {
	if userID == friendID {
		return fmt.Errorf("cannot cancel friend request to yourself")
	}

	var friend model.Friend
	err := s.repo.DB().Where("(user_id = ? AND friend_id = ? AND status = ?) OR (user_id = ? AND friend_id = ? AND status = ?)",
		userID, friendID, "PENDING", friendID, userID, "PENDING").
		First(&friend).Error
	if err != nil {
		return fmt.Errorf("friend request not found or already cancelled: %v", err)
	}

	if err := s.repo.DB().Delete(&friend).Error; err != nil {
		return fmt.Errorf("failed to cancel friend request: %v", err)
	}

	return nil
}

func (s *userService) BlockUser(userID, friendID uint) error {
	if userID == friendID {
		return fmt.Errorf("cannot block yourself")
	}

	var friend model.Friend
	err := s.repo.DB().Where("(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
		userID, friendID, friendID, userID).
		First(&friend).Error

	if err == nil {
		friend.Status = "BLOCKED"
		friend.ActionBy = &userID
		return s.repo.DB().Save(&friend).Error
	}

	profile, err := s.repo.FindProfileByID(userID)
	if err != nil {
		return fmt.Errorf("user not found: %v", err)
	}
	friendProfile, err := s.repo.FindProfileByID(friendID)
	if err != nil {
		return fmt.Errorf("friend not found: %v", err)
	}

	newFriend := &model.Friend{
		UserID:         userID,
		UserUsername:   profile.Username,
		FriendID:       friendID,
		FriendUsername: friendProfile.Username,
		Status:         "BLOCKED",
		ActionBy:       &userID,
		CreatedAt:      time.Now(),
	}
	return s.repo.SaveFriend(newFriend)
}

func (s *userService) UnblockUser(userID, friendID uint) error {
	if userID == friendID {
		return fmt.Errorf("cannot unblock yourself")
	}

	var friend model.Friend
	err := s.repo.DB().Where("user_id = ? AND friend_id = ? AND status = ?", userID, friendID, "BLOCKED").
		First(&friend).Error
	if err != nil {
		return fmt.Errorf("block record not found or already unblocked: %v", err)
	}

	if err := s.repo.DB().Delete(&friend).Error; err != nil {
		return fmt.Errorf("failed to unblock user: %v", err)
	}

	return nil
}

func (s *userService) UpdateFriendRequest(userID, friendID uint, status string) error {
	if status != "ACCEPTED" && status != "BLOCKED" {
		return fmt.Errorf("invalid status, must be ACCEPTED or BLOCKED")
	}

	var friend model.Friend
	err := s.repo.DB().Where("user_id = ? AND friend_id = ? AND status = ?", friendID, userID, "PENDING").
		First(&friend).Error
	if err != nil {
		return fmt.Errorf("friend request not found or cannot be updated: %v", err)
	}

	if status == "ACCEPTED" && friend.FriendID != userID {
		return fmt.Errorf("only the recipient (friend_id) can accept the friend request")
	}

	friend.Status = status
	friend.ActionBy = &userID
	return s.repo.DB().Save(&friend).Error
}

func (s *userService) GetMyProfile(userID uint) (*model.UserProfile, error) {
	return s.repo.FindProfileByID(userID)
}

func (s *userService) GetPublicProfileWithFriendStatus(username string, currentUserID uint) (*model.UserProfile, string, error) {
	profile, err := s.repo.FindByUsername(username)
	if err != nil {
		return nil, "", fmt.Errorf("profile not found")
	}

	var friendStatus string
	if currentUserID == 0 {
		friendStatus = "NONE"
	} else if profile.ID == currentUserID {
		friendStatus = "SELF"
	} else {
		var friend model.Friend
		err := s.repo.DB().Where("(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
			currentUserID, profile.ID, profile.ID, currentUserID).
			First(&friend).Error
		if err == nil {
			switch friend.Status {
			case "ACCEPTED":
				friendStatus = "FRIENDS"
			case "PENDING":
				if friend.UserID == currentUserID {
					friendStatus = "PENDING"
				} else {
					friendStatus = "REQUESTED"
				}
			case "BLOCKED":
				friendStatus = "BLOCKED"
			}
		} else {
			friendStatus = "NONE"
		}
	}
	fmt.Printf("User ID: %d, Friend Status: %s\n", currentUserID, friendStatus)

	return profile, friendStatus, nil
}

func (s *userService) GetFriends(userID uint) ([]model.Friend, error) {
	fmt.Printf("User ID: %d\n", userID)
	return s.repo.GetFriends(userID)
}

func (s *userService) GetFriendProfiles(userID uint, limit, offset int) ([]model.UserProfile, int64, error) {
	return s.repo.GetFriendProfiles(userID, limit, offset)
}

func (s *userService) GetFriendSuggestions(userID uint, limit int) ([]model.UserProfile, error) {
	fmt.Printf("User ID: %d\n", userID)
	return s.repo.GetFriendSuggestions(userID, limit)
}

func (s *userService) GetIncomingFriendRequests(userID uint, limit, offset int) ([]model.Friend, int64, error) {
	var requests []model.Friend
	var total int64

	if err := s.repo.DB().Model(&model.Friend{}).
		Where("friend_id = ? AND status = ?", userID, "PENDING").
		Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count incoming requests: %v", err)
	}

	if err := s.repo.DB().Where("friend_id = ? AND status = ?", userID, "PENDING").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&requests).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to fetch incoming requests: %v", err)
	}

	return requests, total, nil
}

func (s *userService) GetOutgoingFriendRequests(userID uint, limit, offset int) ([]model.Friend, int64, error) {
	var requests []model.Friend
	var total int64

	if err := s.repo.DB().Model(&model.Friend{}).
		Where("user_id = ? AND status = ?", userID, "PENDING").
		Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count outgoing requests: %v", err)
	}

	if err := s.repo.DB().Where("user_id = ? AND status = ?", userID, "PENDING").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&requests).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to fetch outgoing requests: %v", err)
	}

	return requests, total, nil
}

func (s *userService) UpdateProfile(userID uint, req model.UpdateProfileRequestDto, avatarData, coverData interface{}) (*model.UserProfile, error) {
	profile, err := s.repo.FindProfileByID(userID)
	if err != nil {
		return nil, fmt.Errorf("user profile not found: %v", err)
	}

	// Cập nhật các thông tin cơ bản
	if req.FullName != "" {
		profile.FullName = req.FullName
	}

	if req.Bio != "" {
		profile.Bio = req.Bio
	}

	if req.Location != "" {
		profile.Location = req.Location
	}

	if req.CountryID != nil {
		profile.CountryID = req.CountryID
	}

	if req.ProvinceID != nil {
		profile.ProvinceID = req.ProvinceID
	}

	if req.DistrictID != nil {
		profile.DistrictID = req.DistrictID
	}

	if req.Website != "" {
		profile.Website = req.Website
	}

	if req.DateOfBirth != "" {
		dob, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err != nil {
			return nil, fmt.Errorf("invalid date format for date_of_birth, expected format: 2006-01-02")
		}
		profile.DateOfBirth = &dob
	}

	// Xử lý tải lên ảnh avatar
	if avatarData != nil {
		cloudinary, err := util.NewCloudinaryUploader()
		if err != nil {
			return nil, fmt.Errorf("failed to initialize cloudinary: %v", err)
		}

		// Xóa ảnh avatar cũ (nếu có)
		if profile.ProfilePictureURL != "" {
			_ = cloudinary.DeleteImage(profile.ProfilePictureURL)
		}

		// Tải lên ảnh avatar mới
		publicID := fmt.Sprintf("user_%d_avatar_%d", userID, time.Now().UnixNano())
		url, err := cloudinary.UploadImage(avatarData, publicID)
		if err != nil {
			return nil, fmt.Errorf("failed to upload avatar: %v", err)
		}
		profile.ProfilePictureURL = url
	}

	// Xử lý tải lên ảnh bìa
	if coverData != nil {
		cloudinary, err := util.NewCloudinaryUploader()
		if err != nil {
			return nil, fmt.Errorf("failed to initialize cloudinary: %v", err)
		}

		// Xóa ảnh bìa cũ (nếu có)
		if profile.CoverPictureURL != "" {
			_ = cloudinary.DeleteImage(profile.CoverPictureURL)
		}

		// Tải lên ảnh bìa mới
		publicID := fmt.Sprintf("user_%d_cover_%d", userID, time.Now().UnixNano())
		url, err := cloudinary.UploadImage(coverData, publicID)
		if err != nil {
			return nil, fmt.Errorf("failed to upload cover image: %v", err)
		}
		profile.CoverPictureURL = url
	}

	profile.UpdatedAt = time.Now()

	// Lưu thông tin profile vào database
	if err := s.repo.UpdateProfile(profile); err != nil {
		return nil, fmt.Errorf("failed to update profile: %v", err)
	}

	return profile, nil
}

func (s *userService) DB() *gorm.DB {
	return s.repo.DB()
}
