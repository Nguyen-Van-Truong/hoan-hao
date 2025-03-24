package services

import (
	"context"
	"errors"
	"fmt"
	"userservice2/dto/request"
	"userservice2/dto/response"
	"userservice2/models"
	"userservice2/repositories"
)

// FriendshipService xử lý logic liên quan đến quan hệ bạn bè
type FriendshipService interface {
	SendFriendRequest(ctx context.Context, userID, friendID int64) error
	AcceptFriendRequest(ctx context.Context, userID, friendID int64) error
	RejectFriendRequest(ctx context.Context, userID, friendID int64) error
	CancelFriendRequest(ctx context.Context, userID, friendID int64) error
	Unfriend(ctx context.Context, userID, friendID int64) error
	BlockFriend(ctx context.Context, userID, friendID int64) error
	UnblockFriend(ctx context.Context, userID, friendID int64) error
	GetFriendshipStatus(ctx context.Context, userID, friendID int64) (models.FriendshipStatus, error)
	GetFriends(ctx context.Context, userID int64, req *request.FriendListRequest) (*response.FriendListResponse, error)
	GetFriendRequests(ctx context.Context, userID int64, req *request.FriendRequestsListRequest) (*response.FriendListResponse, error)
	GetFriendSuggestions(ctx context.Context, userID int64, req *request.FriendSuggestionsRequest) (*response.FriendSuggestionListResponse, error)
	GetMutualFriendsCount(ctx context.Context, userID, friendID int64) (int, error)
	GetUserByUsername(ctx context.Context, username string) (*response.UserResponse, error)
}

// friendshipService triển khai FriendshipService
type friendshipService struct {
	friendshipRepo repositories.FriendshipRepository
	userRepo       repositories.UserRepository
}

// NewFriendshipService tạo instance mới của FriendshipService
func NewFriendshipService(friendshipRepo repositories.FriendshipRepository, userRepo repositories.UserRepository) FriendshipService {
	return &friendshipService{
		friendshipRepo: friendshipRepo,
		userRepo:       userRepo,
	}
}

// SendFriendRequest gửi lời mời kết bạn
func (s *friendshipService) SendFriendRequest(ctx context.Context, userID, friendID int64) error {
	if userID == friendID {
		return errors.New("không thể gửi lời mời kết bạn cho chính mình")
	}

	// Kiểm tra người dùng có tồn tại không
	friend, err := s.userRepo.FindByID(ctx, friendID)
	if err != nil {
		return err
	}
	if friend == nil {
		return errors.New("người dùng không tồn tại")
	}

	// Kiểm tra quan hệ hiện tại
	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if friendship != nil {
		switch friendship.Status {
		case models.FriendshipStatusAccepted:
			return errors.New("đã là bạn bè rồi")
		case models.FriendshipStatusPending:
			// Nếu đã có lời mời từ bạn, chấp nhận luôn
			if friendship.FriendID == userID {
				return s.AcceptFriendRequest(ctx, userID, friendID)
			}
			return errors.New("đã gửi lời mời kết bạn rồi")
		case models.FriendshipStatusBlocked:
			// Nếu bị chặn bởi người dùng này hoặc chặn người dùng này
			return errors.New("không thể gửi lời mời kết bạn")
		}
	}

	// Tạo mới quan hệ bạn bè với trạng thái pending
	newFriendship := &models.Friendship{
		UserID:   userID,
		FriendID: friendID,
		Status:   models.FriendshipStatusPending,
	}

	return s.friendshipRepo.Create(ctx, newFriendship)
}

// AcceptFriendRequest chấp nhận lời mời kết bạn
func (s *friendshipService) AcceptFriendRequest(ctx context.Context, userID, friendID int64) error {
	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if friendship == nil {
		return errors.New("không tìm thấy lời mời kết bạn")
	}

	// Chỉ chấp nhận khi là người nhận lời mời và trạng thái đang là pending
	if friendship.FriendID != userID || friendship.Status != models.FriendshipStatusPending {
		return errors.New("không thể chấp nhận lời mời kết bạn này")
	}

	friendship.Status = models.FriendshipStatusAccepted
	return s.friendshipRepo.Update(ctx, friendship)
}

// RejectFriendRequest từ chối lời mời kết bạn
func (s *friendshipService) RejectFriendRequest(ctx context.Context, userID, friendID int64) error {
	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if friendship == nil {
		return errors.New("không tìm thấy lời mời kết bạn")
	}

	// Chỉ từ chối khi là người nhận lời mời và trạng thái đang là pending
	if friendship.FriendID != userID || friendship.Status != models.FriendshipStatusPending {
		return errors.New("không thể từ chối lời mời kết bạn này")
	}

	friendship.Status = models.FriendshipStatusRejected
	return s.friendshipRepo.Update(ctx, friendship)
}

// CancelFriendRequest hủy lời mời kết bạn đã gửi
func (s *friendshipService) CancelFriendRequest(ctx context.Context, userID, friendID int64) error {
	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if friendship == nil {
		return errors.New("không tìm thấy lời mời kết bạn")
	}

	// Chỉ hủy khi là người gửi lời mời và trạng thái đang là pending
	if friendship.UserID != userID || friendship.Status != models.FriendshipStatusPending {
		return errors.New("không thể hủy lời mời kết bạn này")
	}

	return s.friendshipRepo.Delete(ctx, friendship.ID)
}

// Unfriend hủy kết bạn
func (s *friendshipService) Unfriend(ctx context.Context, userID, friendID int64) error {
	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if friendship == nil {
		return errors.New("không phải là bạn bè")
	}

	if friendship.Status != models.FriendshipStatusAccepted {
		return errors.New("không phải là bạn bè")
	}

	return s.friendshipRepo.Delete(ctx, friendship.ID)
}

// BlockFriend chặn một người dùng
func (s *friendshipService) BlockFriend(ctx context.Context, userID, friendID int64) error {
	if userID == friendID {
		return errors.New("không thể chặn chính mình")
	}

	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return err
	}

	// Nếu chưa có quan hệ, tạo mới với trạng thái blocked
	if friendship == nil {
		newFriendship := &models.Friendship{
			UserID:   userID,
			FriendID: friendID,
			Status:   models.FriendshipStatusBlocked,
		}
		return s.friendshipRepo.Create(ctx, newFriendship)
	}

	// Nếu người dùng là người tạo friendship, cập nhật trạng thái
	if friendship.UserID == userID {
		friendship.Status = models.FriendshipStatusBlocked
		return s.friendshipRepo.Update(ctx, friendship)
	}

	// Nếu người dùng không phải là người tạo friendship ban đầu
	// Xóa quan hệ cũ và tạo mới với trạng thái blocked
	if err := s.friendshipRepo.Delete(ctx, friendship.ID); err != nil {
		return err
	}

	newFriendship := &models.Friendship{
		UserID:   userID,
		FriendID: friendID,
		Status:   models.FriendshipStatusBlocked,
	}
	return s.friendshipRepo.Create(ctx, newFriendship)
}

// UnblockFriend bỏ chặn một người dùng
func (s *friendshipService) UnblockFriend(ctx context.Context, userID, friendID int64) error {
	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return err
	}

	if friendship == nil {
		return errors.New("người dùng này chưa bị chặn")
	}

	// Chỉ bỏ chặn khi người dùng là người đã chặn và trạng thái là blocked
	if friendship.UserID != userID || friendship.Status != models.FriendshipStatusBlocked {
		return errors.New("người dùng này chưa bị chặn")
	}

	return s.friendshipRepo.Delete(ctx, friendship.ID)
}

// GetFriendshipStatus lấy trạng thái quan hệ bạn bè
func (s *friendshipService) GetFriendshipStatus(ctx context.Context, userID, friendID int64) (models.FriendshipStatus, error) {
	if userID == friendID {
		return models.FriendshipStatusNone, nil
	}

	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, friendID)
	if err != nil {
		return "", err
	}

	if friendship == nil {
		return models.FriendshipStatusNone, nil
	}

	// Nếu người dùng bị chặn, trả về none (để bảo vệ thông tin)
	if friendship.Status == models.FriendshipStatusBlocked && friendship.UserID != userID {
		return models.FriendshipStatusNone, nil
	}

	return friendship.Status, nil
}

// GetFriends lấy danh sách bạn bè
func (s *friendshipService) GetFriends(ctx context.Context, userID int64, req *request.FriendListRequest) (*response.FriendListResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 10
	}

	// Mặc định lấy bạn bè đã chấp nhận
	status := models.FriendshipStatusAccepted
	if req.Status != "" {
		status = models.FriendshipStatus(req.Status)
	}

	var friendships []models.Friendship
	var total int64
	var err error

	// Lấy danh sách bạn bè theo status
	if status == models.FriendshipStatusPending {
		// Nếu status là pending, thì lấy cả incoming và outgoing
		friendships, total, err = s.friendshipRepo.GetFriendRequests(ctx, userID, true, req.Page, req.PageSize)
		if err != nil {
			return nil, err
		}
	} else {
		// Lấy danh sách bạn bè với status khác pending
		friendships, total, err = s.friendshipRepo.GetFriends(ctx, userID, req.Page, req.PageSize)
		if err != nil {
			return nil, err
		}
	}

	friendResponses := make([]response.FriendResponse, 0, len(friendships))
	for _, friendship := range friendships {
		// Tính số bạn chung
		var mutualCount int
		var friendID int64

		if friendship.UserID == userID {
			friendID = friendship.FriendID
		} else {
			friendID = friendship.UserID
		}

		mutualCount, _ = s.GetMutualFriendsCount(ctx, userID, friendID)
		friendResponses = append(friendResponses, response.ToFriendResponse(&friendship, userID, mutualCount))
	}

	return &response.FriendListResponse{
		Friends:  friendResponses,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, nil
}

// GetFriendRequests lấy danh sách lời mời kết bạn
func (s *friendshipService) GetFriendRequests(ctx context.Context, userID int64, req *request.FriendRequestsListRequest) (*response.FriendListResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 10
	}

	// Xác định kiểu yêu cầu kết bạn (đến/đi)
	incoming := true
	if req.Type == "outgoing" {
		incoming = false
	}

	friendships, total, err := s.friendshipRepo.GetFriendRequests(ctx, userID, incoming, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}

	friendResponses := make([]response.FriendResponse, 0, len(friendships))
	for _, friendship := range friendships {
		// Tính số bạn chung
		var mutualCount int
		var friendID int64

		if friendship.UserID == userID {
			friendID = friendship.FriendID
		} else {
			friendID = friendship.UserID
		}

		mutualCount, _ = s.GetMutualFriendsCount(ctx, userID, friendID)
		friendResponses = append(friendResponses, response.ToFriendResponse(&friendship, userID, mutualCount))
	}

	return &response.FriendListResponse{
		Friends:  friendResponses,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, nil
}

// GetFriendSuggestions lấy gợi ý kết bạn
func (s *friendshipService) GetFriendSuggestions(ctx context.Context, userID int64, req *request.FriendSuggestionsRequest) (*response.FriendSuggestionListResponse, error) {
	limit := req.Limit
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	suggestions, err := s.friendshipRepo.GetFriendSuggestions(ctx, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi lấy gợi ý kết bạn: %w", err)
	}

	suggestionResponses := make([]response.FriendSuggestionResponse, 0, len(suggestions))
	for _, user := range suggestions {
		// Tính số bạn chung cho mỗi gợi ý
		mutualCount, _ := s.GetMutualFriendsCount(ctx, userID, user.ID)
		suggestionResponses = append(suggestionResponses, response.ToFriendSuggestionResponse(&user, mutualCount))
	}

	return &response.FriendSuggestionListResponse{
		Suggestions: suggestionResponses,
	}, nil
}

// GetMutualFriendsCount lấy số lượng bạn chung
func (s *friendshipService) GetMutualFriendsCount(ctx context.Context, userID, friendID int64) (int, error) {
	return s.friendshipRepo.GetMutualFriendsCount(ctx, userID, friendID)
}

// GetUserByUsername lấy thông tin người dùng theo username
func (s *friendshipService) GetUserByUsername(ctx context.Context, username string) (*response.UserResponse, error) {
	// Tìm người dùng từ repository
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, nil
	}

	// Tạo UserResponse
	userResponse := &response.UserResponse{
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
		IsVerified:        user.IsVerified,
		CreatedAt:         user.CreatedAt,
	}

	// Định dạng ngày sinh nếu có
	if !user.DateOfBirth.IsZero() {
		userResponse.DateOfBirth = user.DateOfBirth.Format("2006-01-02")
	}

	return userResponse, nil
}
