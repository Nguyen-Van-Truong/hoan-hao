package repositories

import (
	"context"
	"github.com/jinzhu/gorm"
	"userservice2/models"
	"userservice2/utils"
)

// UserGroupRepository đại diện cho tầng truy cập dữ liệu nhóm
type UserGroupRepository interface {
	Create(ctx context.Context, group *models.UserGroup) error
	FindByID(ctx context.Context, id int64) (*models.UserGroup, error)
	Update(ctx context.Context, group *models.UserGroup) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, page, pageSize int) ([]models.UserGroup, int64, error)
	ListUserGroups(ctx context.Context, userID int64, page, pageSize int) ([]models.UserGroup, int64, error)
}

// userGroupRepository triển khai UserGroupRepository
type userGroupRepository struct {
	db *gorm.DB
}

// NewUserGroupRepository tạo instance mới của UserGroupRepository
func NewUserGroupRepository(db *gorm.DB) UserGroupRepository {
	return &userGroupRepository{db: db}
}

// Create tạo nhóm mới
func (r *userGroupRepository) Create(ctx context.Context, group *models.UserGroup) error {
	return r.db.Create(group).Error
}

// FindByID tìm nhóm theo ID
func (r *userGroupRepository) FindByID(ctx context.Context, id int64) (*models.UserGroup, error) {
	var group models.UserGroup
	err := r.db.First(&group, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &group, nil
}

// Update cập nhật thông tin nhóm
func (r *userGroupRepository) Update(ctx context.Context, group *models.UserGroup) error {
	return r.db.Save(group).Error
}

// Delete xóa nhóm
func (r *userGroupRepository) Delete(ctx context.Context, id int64) error {
	return r.db.Delete(&models.UserGroup{ID: id}).Error
}

// List lấy danh sách tất cả nhóm
func (r *userGroupRepository) List(ctx context.Context, page, pageSize int) ([]models.UserGroup, int64, error) {
	var groups []models.UserGroup
	var total int64

	offset, limit := utils.Pagination(page, pageSize)

	// Đếm tổng số record
	err := r.db.Model(&models.UserGroup{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Lấy danh sách có phân trang
	err = r.db.Offset(offset).Limit(limit).Find(&groups).Error
	if err != nil {
		return nil, 0, err
	}

	return groups, total, nil
}

// ListUserGroups lấy danh sách nhóm mà người dùng tham gia
func (r *userGroupRepository) ListUserGroups(ctx context.Context, userID int64, page, pageSize int) ([]models.UserGroup, int64, error) {
	var groups []models.UserGroup
	var total int64

	offset, limit := utils.Pagination(page, pageSize)

	// Đếm tổng số nhóm mà người dùng tham gia
	err := r.db.Model(&models.UserGroup{}).
		Joins("JOIN group_members ON group_members.group_id = user_groups.id").
		Where("group_members.user_id = ? AND group_members.status = ?", userID, "approved").
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Lấy danh sách nhóm mà người dùng tham gia
	err = r.db.
		Joins("JOIN group_members ON group_members.group_id = user_groups.id").
		Where("group_members.user_id = ? AND group_members.status = ?", userID, "approved").
		Offset(offset).Limit(limit).
		Find(&groups).Error
	if err != nil {
		return nil, 0, err
	}

	return groups, total, nil
}
