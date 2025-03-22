package utils

import (
	"userservice2/models"

	"github.com/jinzhu/gorm"
)

// SetupDatabase thực hiện auto migrate cho các model trong database
func SetupDatabase(db *gorm.DB) error {
	// Thực hiện auto migrate
	return db.AutoMigrate(
		&models.User{},
		&models.Friendship{},
		&models.UserGroup{},
		&models.GroupMember{},
		&models.GroupRole{},
		&models.GroupMemberRole{},
	).Error
}

// Pagination tính toán offset và limit cho phân trang
func Pagination(page, pageSize int) (offset, limit int) {
	if page <= 0 {
		page = 1
	}

	if pageSize <= 0 {
		pageSize = 10
	}

	offset = (page - 1) * pageSize
	limit = pageSize

	return offset, limit
}
