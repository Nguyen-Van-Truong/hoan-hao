package services

import (
	"context"
	"errors"
	"log"
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
	GetFriendshipStatus(ctx context.Context, userID, friendID int64) (string, error)
}

// userService triển khai UserService
type userService struct {
	userRepo       repositories.UserRepository
	friendshipRepo repositories.FriendshipRepository
}

// NewUserService tạo instance mới của UserService
func NewUserService(userRepo repositories.UserRepository, friendshipRepo repositories.FriendshipRepository) UserService {
	return &userService{
		userRepo:       userRepo,
		friendshipRepo: friendshipRepo,
	}
}

// convertToLocationResponse chuyển đổi thông tin địa lý
func convertToLocationResponse(country *models.Country, province *models.Province, district *models.District) *response.LocationResponse {
	locationResp := &response.LocationResponse{}

	if country != nil {
		locationResp.Country = &response.CountryResponse{
			ID:        country.ID,
			Name:      country.Name,
			Code:      country.Code,
			PhoneCode: country.PhoneCode,
		}
	}

	if province != nil {
		locationResp.Province = &response.ProvinceResponse{
			ID:        province.ID,
			Name:      province.Name,
			Code:      province.Code,
			CountryID: province.CountryID,
		}
	}

	if district != nil {
		locationResp.District = &response.DistrictResponse{
			ID:         district.ID,
			Name:       district.Name,
			Code:       district.Code,
			ProvinceID: district.ProvinceID,
		}
	}

	return locationResp
}

// convertToUserResponse chuyển đổi từ User sang UserResponse
func (s *userService) convertToUserResponse(ctx context.Context, user *models.User) *response.UserResponse {
	if user == nil {
		return nil
	}

	var dateOfBirth string
	// Kiểm tra xem ngày sinh có giá trị không phải là zero value
	zeroTime := time.Time{}
	if user.DateOfBirth != zeroTime {
		dateOfBirth = user.DateOfBirth.Format("2006-01-02")
	}

	userResp := &response.UserResponse{
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

	// Thêm thông tin chi tiết về vị trí nếu có
	if user.Country != nil || user.Province != nil || user.District != nil {
		userResp.LocationDetail = convertToLocationResponse(user.Country, user.Province, user.District)
	}

	// Thêm số lượng bạn bè
	friendCount, err := s.friendshipRepo.GetFriendCount(ctx, user.ID)
	if err == nil {
		userResp.FriendCount = friendCount
	}

	return userResp
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

	// Chuyển đổi sang UserResponse
	return s.convertToUserResponse(ctx, user), nil
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

	return s.convertToUserResponse(ctx, user), nil
}

// UpdateProfile cập nhật thông tin cá nhân
func (s *userService) UpdateProfile(ctx context.Context, id int64, req *request.UserProfileUpdateRequest) error {
	if req == nil {
		return ErrInvalidRequest
	}

	log.Printf("UpdateProfile: Bắt đầu cập nhật cho userID=%d", id)
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		log.Printf("UpdateProfile: Lỗi khi tìm user: %v", err)
		return err
	}

	if user == nil {
		log.Printf("UpdateProfile: Không tìm thấy user ID=%d", id)
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
		} else {
			log.Printf("UpdateProfile: Lỗi parse ngày sinh: %v", err)
		}
	}

	log.Printf("UpdateProfile: Gọi update repo cho user ID=%d", id)
	err = s.userRepo.Update(ctx, user)
	if err != nil {
		log.Printf("UpdateProfile: Lỗi khi update user: %v", err)
	}
	return err
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
		userResponse := s.convertToUserResponse(ctx, &userCopy)
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

// GetFriendshipStatus lấy trạng thái quan hệ bạn bè giữa hai người dùng
func (s *userService) GetFriendshipStatus(ctx context.Context, userID, friendID int64) (string, error) {
	if userID == friendID {
		return "self", nil
	}

	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return "", err
	}

	if friendship == nil {
		return string(models.FriendshipStatusNone), nil
	}

	// Nếu người dùng bị chặn, trả về none (để bảo vệ thông tin)
	if friendship.Status == models.FriendshipStatusBlocked && friendship.UserID != userID {
		return string(models.FriendshipStatusNone), nil
	}

	// Nếu trạng thái là pending, xác định ai là người gửi lời mời
	if friendship.Status == models.FriendshipStatusPending {
		if friendship.UserID == userID {
			// Người dùng hiện tại là người gửi lời mời
			return "pending_outgoing", nil
		} else {
			// Người dùng hiện tại là người nhận lời mời
			return "pending_incoming", nil
		}
	}

	return string(friendship.Status), nil
}
