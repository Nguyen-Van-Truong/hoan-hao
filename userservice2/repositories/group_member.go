package repositories

import (
	"context"
	"github.com/jinzhu/gorm"
	"userservice2/models"
	"userservice2/utils"
)

// GroupMemberRepository đại diện cho tầng truy cập dữ liệu thành viên nhóm
type GroupMemberRepository interface {
	Create(ctx context.Context, member *models.GroupMember) error
	FindByID(ctx context.Context, id int64) (*models.GroupMember, error)
	FindByUserAndGroup(ctx context.Context, userID, groupID int64) (*models.GroupMember, error)
	Update(ctx context.Context, member *models.GroupMember) error
	Delete(ctx context.Context, id int64) error
	ListByGroup(ctx context.Context, groupID int64, page, pageSize int) ([]models.GroupMember, int64, error)
	ListByUser(ctx context.Context, userID int64, page, pageSize int) ([]models.GroupMember, int64, error)
}

// groupMemberRepository triển khai GroupMemberRepository
type groupMemberRepository struct {
	db *gorm.DB
}

// NewGroupMemberRepository tạo instance mới của GroupMemberRepository
func NewGroupMemberRepository(db *gorm.DB) GroupMemberRepository {
	return &groupMemberRepository{db: db}
}

// Create tạo bản ghi thành viên nhóm mới
func (r *groupMemberRepository) Create(ctx context.Context, member *models.GroupMember) error {
	return r.db.Create(member).Error
}

// FindByID tìm thành viên nhóm theo ID
func (r *groupMemberRepository) FindByID(ctx context.Context, id int64) (*models.GroupMember, error) {
	var member models.GroupMember
	err := r.db.First(&member, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &member, nil
}

// FindByUserAndGroup tìm thành viên nhóm theo userID và groupID
func (r *groupMemberRepository) FindByUserAndGroup(ctx context.Context, userID, groupID int64) (*models.GroupMember, error) {
	var member models.GroupMember
	err := r.db.Where("user_id = ? AND group_id = ?", userID, groupID).First(&member).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &member, nil
}

// Update cập nhật thông tin thành viên nhóm
func (r *groupMemberRepository) Update(ctx context.Context, member *models.GroupMember) error {
	return r.db.Save(member).Error
}

// Delete xóa thành viên nhóm
func (r *groupMemberRepository) Delete(ctx context.Context, id int64) error {
	return r.db.Delete(&models.GroupMember{ID: id}).Error
}

// ListByGroup lấy danh sách thành viên trong nhóm
func (r *groupMemberRepository) ListByGroup(ctx context.Context, groupID int64, page, pageSize int) ([]models.GroupMember, int64, error) {
	var members []models.GroupMember
	var total int64

	offset, limit := utils.Pagination(page, pageSize)

	// Đếm tổng số thành viên
	err := r.db.Model(&models.GroupMember{}).
		Where("group_id = ?", groupID).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Lấy danh sách thành viên có phân trang
	err = r.db.
		Preload("User").
		Where("group_id = ?", groupID).
		Offset(offset).Limit(limit).
		Find(&members).Error
	if err != nil {
		return nil, 0, err
	}

	return members, total, nil
}

// ListByUser lấy danh sách nhóm mà người dùng tham gia
func (r *groupMemberRepository) ListByUser(ctx context.Context, userID int64, page, pageSize int) ([]models.GroupMember, int64, error) {
	var members []models.GroupMember
	var total int64

	offset, limit := utils.Pagination(page, pageSize)

	// Đếm tổng số nhóm mà người dùng tham gia
	err := r.db.Model(&models.GroupMember{}).
		Where("user_id = ?", userID).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Lấy danh sách nhóm mà người dùng tham gia có phân trang
	err = r.db.
		Preload("Group").
		Where("user_id = ?", userID).
		Offset(offset).Limit(limit).
		Find(&members).Error
	if err != nil {
		return nil, 0, err
	}

	return members, total, nil
}
