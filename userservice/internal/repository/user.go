package repository

import (
	"github.com/jinzhu/gorm"
	"userservice/internal/model"
)

type UserRepository interface {
	FindByUsername(username string) (*model.UserProfile, error)
	SaveProfile(profile *model.UserProfile) error
	SaveEmail(email *model.UserEmail) error
	SavePhoneNumber(phone *model.UserPhoneNumber) error
	ExistsByCountryCodeAndPhoneNumber(countryCode, phoneNumber string) (bool, error)
	FindProfileByID(id uint) (*model.UserProfile, error)
	SaveFriend(friend *model.Friend) error
	UpdateFriendStatus(friendID uint, status string) error
	GetFriends(userID uint) ([]model.Friend, error)
	GetFriendProfiles(userID uint, limit, offset int) ([]model.UserProfile, int64, error) // Thêm phương thức mới với phân trang
	GetFriendSuggestions(userID uint, limit int) ([]model.UserProfile, error)
	DB() *gorm.DB
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) DB() *gorm.DB {
	return r.db
}

func (r *userRepository) FindProfileByID(id uint) (*model.UserProfile, error) {
	var profile model.UserProfile
	if err := r.db.Where("id = ?", id).First(&profile).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *userRepository) SaveFriend(friend *model.Friend) error {
	return r.db.Create(friend).Error
}

func (r *userRepository) UpdateFriendStatus(friendID uint, status string) error {
	return r.db.Model(&model.Friend{}).
		Where("id = ?", friendID).
		Update("status", status).Error
}

func (r *userRepository) GetFriends(userID uint) ([]model.Friend, error) {
	var friends []model.Friend
	err := r.db.Where("user_id = ? AND status = ?", userID, "ACCEPTED").
		Or("friend_id = ? AND status = ?", userID, "ACCEPTED").
		Find(&friends).Error
	return friends, err
}

func (r *userRepository) GetFriendProfiles(userID uint, limit, offset int) ([]model.UserProfile, int64, error) {
	var friendProfiles []model.UserProfile
	var total int64

	// Đếm tổng số bạn bè
	err := r.db.Model(&model.Friend{}).
		Where("user_id = ? AND status = ?", userID, "ACCEPTED").
		Or("friend_id = ? AND status = ?", userID, "ACCEPTED").
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Lấy danh sách bạn bè với thông tin chi tiết từ user_profiles
	err = r.db.Raw(`
        SELECT up.*
        FROM user_profiles up
        INNER JOIN friends f ON (f.user_id = ? AND f.friend_id = up.id AND f.status = 'ACCEPTED')
            OR (f.friend_id = ? AND f.user_id = up.id AND f.status = 'ACCEPTED')
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
    `, userID, userID, limit, offset).Scan(&friendProfiles).Error
	if err != nil {
		return nil, 0, err
	}

	return friendProfiles, total, nil
}

func (r *userRepository) GetFriendSuggestions(userID uint, limit int) ([]model.UserProfile, error) {
	var suggestions []model.UserProfile
	err := r.db.Raw(`
        SELECT * FROM user_profiles
        WHERE id NOT IN (
            SELECT friend_id FROM friends WHERE user_id = ? AND status = 'ACCEPTED'
            UNION
            SELECT user_id FROM friends WHERE friend_id = ? AND status = 'ACCEPTED'
        ) AND id != ?
        LIMIT ?
    `, userID, userID, userID, limit).Scan(&suggestions).Error
	if err != nil {
		return nil, err
	}
	return suggestions, nil
}

func (r *userRepository) FindByUsername(username string) (*model.UserProfile, error) {
	var profile model.UserProfile
	if err := r.db.Where("username = ?", username).First(&profile).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *userRepository) SaveProfile(profile *model.UserProfile) error {
	return r.db.Create(profile).Error
}

func (r *userRepository) SaveEmail(email *model.UserEmail) error {
	return r.db.Create(email).Error
}

func (r *userRepository) SavePhoneNumber(phone *model.UserPhoneNumber) error {
	return r.db.Create(phone).Error
}

func (r *userRepository) ExistsByCountryCodeAndPhoneNumber(countryCode, phoneNumber string) (bool, error) {
	var count int64
	err := r.db.Model(&model.UserPhoneNumber{}).
		Where("country_code = ? AND phone_number = ?", countryCode, phoneNumber).
		Count(&count).Error
	return count > 0, err
}
