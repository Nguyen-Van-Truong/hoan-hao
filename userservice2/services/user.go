package services

import (
	"context"
	"errors"
	"math"
	"time"

	"userservice2/dto/request"
	"userservice2/dto/response"
	"userservice2/models"
	"userservice2/repositories"
)

// Khai báo lỗi
var (
	ErrUserNotFound    = errors.New("người dùng không tồn tại")
	ErrInvalidPassword = errors.New("mật khẩu không đúng")
	ErrInvalidRequest  = errors.New("yêu cầu không hợp lệ")
)

// UserService cung cấp các chức năng quản lý người dùng
type UserService interface {
	GetUserByID(ctx context.Context, id int64) (*response.UserResponse, error)
	GetUserByUsername(ctx context.Context, username string) (*response.UserResponse, error)
	UpdateProfile(ctx context.Context, id int64, req *request.UserProfileUpdateRequest) error
	ChangePassword(ctx context.Context, id int64, currentPassword, newPassword string) error
	UploadProfilePicture(ctx context.Context, id int64, fileURL string) error
	UploadCoverPicture(ctx context.Context, id int64, fileURL string) error
	ListUsers(ctx context.Context, page, pageSize int) (*response.UserListResponse, error)
	CreateUserProfileFromAuth(ctx context.Context, user *models.User) error
}

// userService triển khai UserService
type userService struct {
	userRepo repositories.UserRepository
}

// NewUserService tạo instance mới của UserService
func NewUserService(userRepo repositories.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

// convertToUserResponse chuyển đổi từ User sang UserResponse
func convertToUserResponse(user *models.User) *response.UserResponse {
	if user == nil {
		return nil
	}

	var dateOfBirth string
	// Kiểm tra xem ngày sinh có giá trị không phải là zero value
	zeroTime := time.Time{}
	if user.DateOfBirth != zeroTime {
		dateOfBirth = user.DateOfBirth.Format("2006-01-02")
	}

	return &response.UserResponse{
		ID:                user.ID,
		Username:          user.Username,
		Email:             user.Email,
		Phone:             user.Phone,
		FullName:          user.FullName,
		Bio:               user.Bio,
		Location:          user.Location,
		Website:           user.Website,
		ProfilePictureURL: user.ProfilePictureURL,
		CoverPictureURL:   user.CoverPictureURL,
		DateOfBirth:       dateOfBirth,
		Work:              user.Work,
		Education:         user.Education,
		Relationship:      user.Relationship,
		IsVerified:        user.IsVerified,
		CreatedAt:         user.CreatedAt,
	}
}

// CreateUserProfileFromAuth tạo profile người dùng từ authservice
func (s *userService) CreateUserProfileFromAuth(ctx context.Context, user *models.User) error {
	if user == nil {
		return ErrInvalidRequest
	}

	// Kiểm tra xem user đã tồn tại chưa
	existingUser, err := s.userRepo.FindByID(ctx, user.ID)
	if err == nil && existingUser != nil {
		// Nếu đã tồn tại, không tạo mới mà trả về nil
		return nil
	}

	// Tạo user mới
	return s.userRepo.Create(ctx, user)
}

// GetUserByID lấy thông tin người dùng theo ID
func (s *userService) GetUserByID(ctx context.Context, id int64) (*response.UserResponse, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, ErrUserNotFound
	}

	return convertToUserResponse(user), nil
}

// GetUserByUsername lấy thông tin người dùng theo username
func (s *userService) GetUserByUsername(ctx context.Context, username string) (*response.UserResponse, error) {
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, ErrUserNotFound
	}

	return convertToUserResponse(user), nil
}

// UpdateProfile cập nhật thông tin cá nhân
func (s *userService) UpdateProfile(ctx context.Context, id int64, req *request.UserProfileUpdateRequest) error {
	if req == nil {
		return ErrInvalidRequest
	}

	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if user == nil {
		return ErrUserNotFound
	}

	// Cập nhật thông tin
	if req.FullName != "" {
		user.FullName = req.FullName
	}
	user.Bio = req.Bio
	user.Location = req.Location
	user.CountryID = req.CountryID
	user.ProvinceID = req.ProvinceID
	user.DistrictID = req.DistrictID
	user.Website = req.Website
	user.Work = req.Work
	user.Education = req.Education
	user.Relationship = req.Relationship

	// Xử lý ngày sinh
	if req.DateOfBirth != "" {
		dob, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err == nil {
			user.DateOfBirth = dob
		}
	}

	return s.userRepo.Update(ctx, user)
}

// ChangePassword thay đổi mật khẩu
func (s *userService) ChangePassword(ctx context.Context, id int64, currentPassword, newPassword string) error {
	// Triển khai sau, cần có tính năng xác thực và lưu trữ mật khẩu
	return nil
}

// UploadProfilePicture cập nhật ảnh đại diện
func (s *userService) UploadProfilePicture(ctx context.Context, id int64, fileURL string) error {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if user == nil {
		return ErrUserNotFound
	}

	user.ProfilePictureURL = fileURL

	return s.userRepo.Update(ctx, user)
}

// UploadCoverPicture cập nhật ảnh bìa
func (s *userService) UploadCoverPicture(ctx context.Context, id int64, fileURL string) error {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if user == nil {
		return ErrUserNotFound
	}

	user.CoverPictureURL = fileURL

	return s.userRepo.Update(ctx, user)
}

// ListUsers lấy danh sách người dùng
func (s *userService) ListUsers(ctx context.Context, page, pageSize int) (*response.UserListResponse, error) {
	users, total, err := s.userRepo.List(ctx, page, pageSize)
	if err != nil {
		return nil, err
	}

	userResponses := make([]response.UserResponse, 0, len(users))
	for _, user := range users {
		userCopy := user // Tạo bản sao để tránh vấn đề với biến trong vòng lặp
		userResponse := convertToUserResponse(&userCopy)
		userResponses = append(userResponses, *userResponse)
	}

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))

	return &response.UserListResponse{
		Users:      userResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}
