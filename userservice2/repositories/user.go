package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/jinzhu/gorm"
	"userservice2/models"
)

// UserRepository đại diện cho tầng truy cập dữ liệu người dùng
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByID(ctx context.Context, id int64) (*models.User, error)
	FindByUsername(ctx context.Context, username string) (*models.User, error)
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, page, pageSize int) ([]models.User, int64, error)
	UpdateLastLogin(ctx context.Context, id int64) error
}

// userRepository triển khai UserRepository
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository tạo instance mới của UserRepository
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// Create tạo người dùng mới
func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.Create(user).Error
}

// FindByID tìm người dùng theo ID
func (r *userRepository) FindByID(ctx context.Context, id int64) (*models.User, error) {
	var user models.User
	if err := r.db.Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByUsername tìm người dùng theo tên đăng nhập
func (r *userRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByEmail tìm người dùng theo email
func (r *userRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// Update cập nhật thông tin người dùng
func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()
	return r.db.Save(user).Error
}

// Delete xóa người dùng
func (r *userRepository) Delete(ctx context.Context, id int64) error {
	return r.db.Delete(&models.User{}, id).Error
}

// List lấy danh sách người dùng với phân trang
func (r *userRepository) List(ctx context.Context, page, pageSize int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	if err := r.db.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := r.db.Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// UpdateLastLogin cập nhật thời gian đăng nhập cuối cùng
func (r *userRepository) UpdateLastLogin(ctx context.Context, id int64) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).
		Updates(map[string]interface{}{
			"last_login_at": time.Now(),
			"updated_at":    time.Now(),
		}).Error
}
