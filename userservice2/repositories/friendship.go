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
	if err := r.db.Preload("User").Preload("Friend").Where("id = ?", id).First(&friendship).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &friendship, nil
}

// FindByUserAndFriend tìm mối quan hệ bạn bè giữa hai người dùng
func (r *friendshipRepository) FindByUserAndFriend(ctx context.Context, userID, friendID int64) (*models.Friendship, error) {
	var friendship models.Friendship
	err := r.db.Where(
		"(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
		userID, friendID, friendID, userID,
	).First(&friendship).Error

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
	var friendships []models.Friendship
	var total int64

	query := r.db.Model(&models.Friendship{}).
		Preload("User").
		Preload("Friend").
		Where("(user_id = ? OR friend_id = ?) AND status = ?",
			userID, userID, models.FriendshipStatusAccepted)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("updated_at DESC").Find(&friendships).Error; err != nil {
		return nil, 0, err
	}

	return friendships, total, nil
}

// GetFriendRequests lấy danh sách yêu cầu kết bạn
func (r *friendshipRepository) GetFriendRequests(ctx context.Context, userID int64, incoming bool, page, pageSize int) ([]models.Friendship, int64, error) {
	var friendships []models.Friendship
	var total int64

	var query *gorm.DB
	if incoming {
		// Yêu cầu đến
		query = r.db.Model(&models.Friendship{}).
			Preload("User").
			Preload("Friend").
			Where("friend_id = ? AND status = ?",
				userID, models.FriendshipStatusPending)
	} else {
		// Yêu cầu đi
		query = r.db.Model(&models.Friendship{}).
			Preload("User").
			Preload("Friend").
			Where("user_id = ? AND status = ?",
				userID, models.FriendshipStatusPending)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&friendships).Error; err != nil {
		return nil, 0, err
	}

	return friendships, total, nil
}

// GetFriendSuggestions lấy gợi ý kết bạn
func (r *friendshipRepository) GetFriendSuggestions(ctx context.Context, userID int64, limit int) ([]models.User, error) {
	var users []models.User

	err := r.db.Raw(`
		SELECT u.* FROM users u
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
	`, userID, userID, userID, limit).Scan(&users).Error

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
