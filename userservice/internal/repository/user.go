// userservice/internal/repository/user.go
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
	GetFriendSuggestions(userID uint, limit int) ([]model.UserProfile, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
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

func (r *userRepository) GetFriendSuggestions(userID uint, limit int) ([]model.UserProfile, error) {
	var suggestions []model.UserProfile
	err := r.db.Raw(`
        SELECT * FROM user_profiles
        WHERE id NOT IN (
            SELECT friend_id FROM friends WHERE user_id = ? AND status = 'ACCEPTED'
            UNION
            SELECT user_id FROM friends WHERE friend_id = ? AND status = 'ACCEPTED'
        ) AND id != ?
        LIMIT ?`, userID, userID, userID, limit).
		Scan(&suggestions).Error
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
	return r.db.Create(profile).Error // Sử dụng Create để gán id thủ công
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
