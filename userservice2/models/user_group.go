package models

import (
	"time"
)

// GroupPrivacy đại diện cho quyền riêng tư của nhóm
type GroupPrivacy string

const (
	// Các chế độ riêng tư của nhóm
	GroupPrivacyPublic  GroupPrivacy = "public"
	GroupPrivacyPrivate GroupPrivacy = "private"
)

// UserGroup đại diện cho nhóm người dùng
type UserGroup struct {
	ID          int64        `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string       `json:"name" gorm:"size:100;not null"`
	Description string       `json:"description" gorm:"type:text"`
	Privacy     GroupPrivacy `json:"privacy" gorm:"type:enum('public','private');default:'public';index:idx_privacy"`
	CoverImage  string       `json:"cover_image" gorm:"size:255"`
	Avatar      string       `json:"avatar" gorm:"size:255"`
	CreatedBy   int64        `json:"created_by" gorm:"not null;index:idx_created_by"`
	MemberCount int          `json:"member_count" gorm:"default:0"`
	CreatedAt   time.Time    `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time    `json:"updated_at" gorm:"autoUpdateTime"`
	Creator     User         `json:"creator" gorm:"foreignKey:CreatedBy"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (UserGroup) TableName() string {
	return "user_groups"
}
