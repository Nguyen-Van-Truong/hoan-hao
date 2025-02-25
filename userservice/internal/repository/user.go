package repository

import (
	"userservice/internal/model"

	"github.com/jinzhu/gorm"
)

// UserRepository định nghĩa interface cho tầng repository
type UserRepository interface {
	FindByUsername(username string) (*model.UserProfile, error)
	SaveProfile(profile *model.UserProfile) error
	SaveEmail(email *model.UserEmail) error
}

// userRepository là struct triển khai interface
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository tạo instance mới của repository
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByUsername(username string) (*model.UserProfile, error) {
	var user model.UserProfile
	if err := r.db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) SaveProfile(profile *model.UserProfile) error {
	return r.db.Create(profile).Error
}

func (r *userRepository) SaveEmail(email *model.UserEmail) error {
	return r.db.Create(email).Error
}
