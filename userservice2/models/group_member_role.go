package models

import (
	"time"
)

// GroupMemberRole đại diện cho việc gán vai trò cho thành viên nhóm
type GroupMemberRole struct {
	ID            int64       `json:"id" gorm:"primaryKey;autoIncrement"`
	GroupMemberID int64       `json:"group_member_id" gorm:"not null"`
	GroupRoleID   int64       `json:"group_role_id" gorm:"not null"`
	CreatedAt     time.Time   `json:"created_at" gorm:"autoCreateTime"`
	GroupMember   GroupMember `json:"group_member" gorm:"foreignKey:GroupMemberID"`
	GroupRole     GroupRole   `json:"group_role" gorm:"foreignKey:GroupRoleID"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (GroupMemberRole) TableName() string {
	return "group_member_roles"
}
