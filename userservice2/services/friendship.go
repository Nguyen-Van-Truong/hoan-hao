package services

import (
	"context"
	"errors"
	"math"
	"time"

	"userservice2/models"
	"userservice2/repositories"
)

var (
	ErrInvalidAction         = errors.New("hành động không hợp lệ")
	ErrFriendshipNotFound    = errors.New("không tìm thấy mối quan hệ bạn bè")
	ErrSelfFriendship        = errors.New("không thể kết bạn với chính mình")
	ErrFriendshipExists      = errors.New("đã là bạn bè")
	ErrFriendRequestExists   = errors.New("yêu cầu kết bạn đã tồn tại")
	ErrNotFriendRequestOwner = errors.New("không phải người gửi yêu cầu kết bạn")
	ErrNotRequestRecipient   = errors.New("không phải người nhận yêu cầu kết bạn")
)

// FriendshipService cung cấp các chức năng quản lý bạn bè
type FriendshipService interface {
	PerformFriendshipAction(ctx context.Context, userID int64, action *models.FriendshipAction) error
	GetFriends(ctx context.Context, userID int64, page, pageSize int) (*models.FriendshipListResponse, error)
	GetFriendRequests(ctx context.Context, userID int64, incoming bool, page, pageSize int) (*models.FriendshipListResponse, error)
	GetFriendSuggestions(ctx context.Context, userID int64, limit int) (*models.FriendSuggestionResponse, error)
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

// PerformFriendshipAction xử lý các hành động kết bạn
func (s *friendshipService) PerformFriendshipAction(ctx context.Context, userID int64, action *models.FriendshipAction) error {
	if action == nil {
		return ErrInvalidRequest
	}

	// Kiểm tra userID và friendID có giống nhau không
	if userID == action.FriendID {
		return ErrSelfFriendship
	}

	// Kiểm tra friendID có tồn tại không
	friend, err := s.userRepo.FindByID(ctx, action.FriendID)
	if err != nil {
		return err
	}
	if friend == nil {
		return ErrUserNotFound
	}

	// Tìm mối quan hệ hiện tại
	friendship, err := s.friendshipRepo.FindByUserAndFriend(ctx, userID, action.FriendID)
	if err != nil {
		return err
	}

	switch action.Action {
	case "request":
		// Gửi yêu cầu kết bạn
		if friendship != nil {
			if friendship.Status == models.FriendshipStatusAccepted {
				return ErrFriendshipExists
			}
			if friendship.Status == models.FriendshipStatusPending &&
				((friendship.UserID == userID && friendship.FriendID == action.FriendID) ||
					(friendship.UserID == action.FriendID && friendship.FriendID == userID)) {
				return ErrFriendRequestExists
			}
		}

		// Tạo yêu cầu kết bạn mới
		newFriendship := &models.Friendship{
			UserID:    userID,
			FriendID:  action.FriendID,
			Status:    models.FriendshipStatusPending,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		return s.friendshipRepo.Create(ctx, newFriendship)

	case "accept":
		// Chấp nhận yêu cầu kết bạn
		if friendship == nil {
			return ErrFriendshipNotFound
		}

		// Kiểm tra người chấp nhận có phải là người nhận yêu cầu không
		if friendship.Status != models.FriendshipStatusPending || friendship.FriendID != userID {
			return ErrNotRequestRecipient
		}

		friendship.Status = models.FriendshipStatusAccepted
		return s.friendshipRepo.Update(ctx, friendship)

	case "reject":
		// Từ chối yêu cầu kết bạn
		if friendship == nil {
			return ErrFriendshipNotFound
		}

		// Kiểm tra người từ chối có phải là người nhận yêu cầu không
		if friendship.Status != models.FriendshipStatusPending || friendship.FriendID != userID {
			return ErrNotRequestRecipient
		}

		friendship.Status = models.FriendshipStatusRejected
		return s.friendshipRepo.Update(ctx, friendship)

	case "cancel":
		// Hủy yêu cầu kết bạn
		if friendship == nil {
			return ErrFriendshipNotFound
		}

		// Chỉ người gửi yêu cầu mới có thể hủy
		if friendship.Status != models.FriendshipStatusPending || friendship.UserID != userID {
			return ErrNotFriendRequestOwner
		}

		return s.friendshipRepo.Delete(ctx, friendship.ID)

	case "unfriend":
		// Hủy kết bạn
		if friendship == nil {
			return ErrFriendshipNotFound
		}

		if friendship.Status != models.FriendshipStatusAccepted {
			return ErrFriendshipNotFound
		}

		return s.friendshipRepo.Delete(ctx, friendship.ID)

	case "block":
		// Chặn người dùng
		if friendship == nil {
			// Tạo mối quan hệ mới với trạng thái block
			newFriendship := &models.Friendship{
				UserID:    userID,
				FriendID:  action.FriendID,
				Status:    models.FriendshipStatusBlocked,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}

			return s.friendshipRepo.Create(ctx, newFriendship)
		}

		// Cập nhật trạng thái thành block
		friendship.Status = models.FriendshipStatusBlocked
		return s.friendshipRepo.Update(ctx, friendship)

	case "unblock":
		// Bỏ chặn người dùng
		if friendship == nil {
			return ErrFriendshipNotFound
		}

		if friendship.Status != models.FriendshipStatusBlocked || friendship.UserID != userID {
			return ErrFriendshipNotFound
		}

		return s.friendshipRepo.Delete(ctx, friendship.ID)

	default:
		return ErrInvalidAction
	}
}

// GetFriends lấy danh sách bạn bè
func (s *friendshipService) GetFriends(ctx context.Context, userID int64, page, pageSize int) (*models.FriendshipListResponse, error) {
	friendships, total, err := s.friendshipRepo.GetFriends(ctx, userID, page, pageSize)
	if err != nil {
		return nil, err
	}

	friends := make([]models.FriendResponse, 0, len(friendships))
	for _, friendship := range friendships {
		var friend models.User
		if friendship.UserID == userID {
			friend = friendship.Friend
		} else {
			friend = friendship.User
		}

		friends = append(friends, models.FriendResponse{
			ID:                friend.ID,
			Username:          friend.Username,
			FullName:          friend.FullName,
			ProfilePictureURL: friend.ProfilePictureURL,
			Status:            string(friendship.Status),
			CreatedAt:         friendship.CreatedAt,
		})
	}

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))

	return &models.FriendshipListResponse{
		Friends:    friends,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetFriendRequests lấy danh sách yêu cầu kết bạn
func (s *friendshipService) GetFriendRequests(ctx context.Context, userID int64, incoming bool, page, pageSize int) (*models.FriendshipListResponse, error) {
	friendships, total, err := s.friendshipRepo.GetFriendRequests(ctx, userID, incoming, page, pageSize)
	if err != nil {
		return nil, err
	}

	friends := make([]models.FriendResponse, 0, len(friendships))
	for _, friendship := range friendships {
		var friend models.User
		if incoming {
			friend = friendship.User
		} else {
			friend = friendship.Friend
		}

		friends = append(friends, models.FriendResponse{
			ID:                friend.ID,
			Username:          friend.Username,
			FullName:          friend.FullName,
			ProfilePictureURL: friend.ProfilePictureURL,
			Status:            string(friendship.Status),
			CreatedAt:         friendship.CreatedAt,
		})
	}

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))

	return &models.FriendshipListResponse{
		Friends:    friends,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetFriendSuggestions lấy gợi ý kết bạn
func (s *friendshipService) GetFriendSuggestions(ctx context.Context, userID int64, limit int) (*models.FriendSuggestionResponse, error) {
	users, err := s.friendshipRepo.GetFriendSuggestions(ctx, userID, limit)
	if err != nil {
		return nil, err
	}

	suggestions := make([]models.UserSuggestion, 0, len(users))
	for _, user := range users {
		mutualCount, err := s.friendshipRepo.GetMutualFriendsCount(ctx, userID, user.ID)
		if err != nil {
			continue
		}

		suggestions = append(suggestions, models.UserSuggestion{
			ID:                user.ID,
			Username:          user.Username,
			FullName:          user.FullName,
			ProfilePictureURL: user.ProfilePictureURL,
			MutualFriends:     mutualCount,
		})
	}

	return &models.FriendSuggestionResponse{
		Suggestions: suggestions,
		Total:       int64(len(suggestions)),
	}, nil
}
