package repository

import (
	"github.com/jinzhu/gorm"
	"userservice/internal/model"
)

type UserRepository interface {
	FindByUsername(username string) (*model.UserProfile, error)
	SaveProfile(profile *model.UserProfile) error
	SaveEmail(email *model.UserEmail) error
	SavePhoneNumber(phone *model.UserPhoneNumber) error // Thêm phương thức mới
}

type userRepository struct {
	db *gorm.DB
}

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

func (r *userRepository) SavePhoneNumber(phone *model.UserPhoneNumber) error {
	return r.db.Create(phone).Error
}
