package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/jinzhu/gorm"
	"userservice2/models"
)

// FriendshipRepository đại diện cho tầng truy cập dữ liệu friendship
type FriendshipRepository interface {
	Create(ctx context.Context, friendship *models.Friendship) error
	FindByID(ctx context.Context, id int64) (*models.Friendship, error)
	FindByUserAndFriend(ctx context.Context, userID, friendID int64) (*models.Friendship, error)
	Update(ctx context.Context, friendship *models.Friendship) error
	Delete(ctx context.Context, id int64) error
	GetFriends(ctx context.Context, userID int64, page, pageSize int) ([]models.Friendship, int64, error)
	GetFriendRequests(ctx context.Context, userID int64, incoming bool, page, pageSize int) ([]models.Friendship, int64, error)
	GetFriendSuggestions(ctx context.Context, userID int64, limit int) ([]models.User, error)
	GetMutualFriendsCount(ctx context.Context, userID, otherUserID int64) (int, error)
	GetFriendCount(ctx context.Context, userID int64) (int, error)
}

// friendshipRepository triển khai FriendshipRepository
type friendshipRepository struct {
	db *gorm.DB
}

// NewFriendshipRepository tạo instance mới của FriendshipRepository
func NewFriendshipRepository(db *gorm.DB) FriendshipRepository {
	return &friendshipRepository{db: db}
}

// Create tạo mối quan hệ bạn bè mới
func (r *friendshipRepository) Create(ctx context.Context, friendship *models.Friendship) error {
	return r.db.Create(friendship).Error
}

// FindByID tìm mối quan hệ bạn bè theo ID
func (r *friendshipRepository) FindByID(ctx context.Context, id int64) (*models.Friendship, error) {
	var friendship models.Friendship
	err := r.db.Preload("User").Preload("Friend").First(&friendship, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &friendship, nil
}

// FindByUserAndFriend tìm quan hệ giữa hai người dùng
func (r *friendshipRepository) FindByUserAndFriend(ctx context.Context, userID, friendID int64) (*models.Friendship, error) {
	var friendship models.Friendship
	err := r.db.Where(
		"(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
		userID, friendID, friendID, userID,
	).Preload("User").Preload("Friend").First(&friendship).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &friendship, nil
}

// Update cập nhật mối quan hệ bạn bè
func (r *friendshipRepository) Update(ctx context.Context, friendship *models.Friendship) error {
	friendship.UpdatedAt = time.Now()
	return r.db.Save(friendship).Error
}

// Delete xóa mối quan hệ bạn bè
func (r *friendshipRepository) Delete(ctx context.Context, id int64) error {
	return r.db.Delete(&models.Friendship{}, id).Error
}

// GetFriends lấy danh sách bạn bè của người dùng
func (r *friendshipRepository) GetFriends(ctx context.Context, userID int64, page, pageSize int) ([]models.Friendship, int64, error) {
	var total int64
	offset := (page - 1) * pageSize

	// Đếm tổng số bạn bè
	err := r.db.Model(&models.Friendship{}).
		Where("(user_id = ? OR friend_id = ?) AND status = ?", userID, userID, models.FriendshipStatusAccepted).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Lấy danh sách bạn bè với phân trang
	var friendships []models.Friendship
	err = r.db.
		Where("(user_id = ? OR friend_id = ?) AND status = ?", userID, userID, models.FriendshipStatusAccepted).
		Preload("User").
		Preload("Friend").
		Offset(offset).
		Limit(pageSize).
		Order("updated_at DESC").
		Find(&friendships).Error
	if err != nil {
		return nil, 0, err
	}

	return friendships, total, nil
}

// GetFriendRequests lấy danh sách lời mời kết bạn của người dùng
func (r *friendshipRepository) GetFriendRequests(ctx context.Context, userID int64, incoming bool, page, pageSize int) ([]models.Friendship, int64, error) {
	var total int64
	offset := (page - 1) * pageSize

	var condition string
	var args []interface{}

	if incoming {
		// Các yêu cầu đến (người khác gửi cho mình)
		condition = "friend_id = ? AND status = ?"
		args = []interface{}{userID, models.FriendshipStatusPending}
	} else {
		// Các yêu cầu đi (mình gửi cho người khác)
		condition = "user_id = ? AND status = ?"
		args = []interface{}{userID, models.FriendshipStatusPending}
	}

	// Đếm tổng số lời mời
	err := r.db.Model(&models.Friendship{}).Where(condition, args...).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Lấy danh sách lời mời với phân trang
	var friendships []models.Friendship
	err = r.db.Where(condition, args...).
		Preload("User").
		Preload("Friend").
		Offset(offset).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&friendships).Error
	if err != nil {
		return nil, 0, err
	}

	return friendships, total, nil
}

// GetFriendSuggestions lấy gợi ý kết bạn
func (r *friendshipRepository) GetFriendSuggestions(ctx context.Context, userID int64, limit int) ([]models.User, error) {
	// Tìm danh sách ID của người dùng tiềm năng
	var userIDs []int64
	err := r.db.Raw(`
		SELECT u.id FROM users u
		WHERE u.id != ? AND u.is_active = true
		AND u.id NOT IN (
			SELECT user_id FROM friendships 
			WHERE friend_id = ? AND (status = 'accepted' OR status = 'pending' OR status = 'blocked')
			UNION
			SELECT friend_id FROM friendships
			WHERE user_id = ? AND (status = 'accepted' OR status = 'pending' OR status = 'blocked')
		)
		ORDER BY RAND()
		LIMIT ?
	`, userID, userID, userID, limit).Pluck("id", &userIDs).Error

	if err != nil {
		return nil, err
	}

	if len(userIDs) == 0 {
		return []models.User{}, nil
	}

	// Lấy thông tin đầy đủ của người dùng bao gồm các preload cần thiết
	var users []models.User
	err = r.db.Where("id IN (?)", userIDs).
		Preload("Country").
		Preload("Province").
		Preload("District").
		Find(&users).Error

	if err != nil {
		return nil, err
	}

	return users, nil
}

// GetMutualFriendsCount lấy số lượng bạn chung
func (r *friendshipRepository) GetMutualFriendsCount(ctx context.Context, userID, otherUserID int64) (int, error) {
	var count int

	err := r.db.Raw(`
		SELECT COUNT(f1.friend_id) FROM
		(
			SELECT friend_id FROM friendships WHERE user_id = ? AND status = 'accepted'
			UNION
			SELECT user_id FROM friendships WHERE friend_id = ? AND status = 'accepted'
		) f1
		INNER JOIN
		(
			SELECT friend_id FROM friendships WHERE user_id = ? AND status = 'accepted'
			UNION
			SELECT user_id FROM friendships WHERE friend_id = ? AND status = 'accepted'
		) f2
		ON f1.friend_id = f2.friend_id
	`, userID, userID, otherUserID, otherUserID).Count(&count).Error

	if err != nil {
		return 0, err
	}

	return count, nil
}

// GetFriendCount lấy số lượng bạn bè của người dùng
func (r *friendshipRepository) GetFriendCount(ctx context.Context, userID int64) (int, error) {
	var count int
	err := r.db.Model(&models.Friendship{}).
		Where("(user_id = ? OR friend_id = ?) AND status = ?", userID, userID, models.FriendshipStatusAccepted).
		Count(&count).Error

	return count, err
}
