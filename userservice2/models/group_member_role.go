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

// GroupMemberRoleCreateRequest đại diện cho yêu cầu gán vai trò cho thành viên
type GroupMemberRoleCreateRequest struct {
	GroupMemberID int64 `json:"group_member_id" binding:"required"`
	GroupRoleID   int64 `json:"group_role_id" binding:"required"`
}

// GroupMemberRoleResponse đại diện cho thông tin phản hồi của việc gán vai trò
type GroupMemberRoleResponse struct {
	ID              int64           `json:"id"`
	GroupMemberID   int64           `json:"group_member_id"`
	GroupRoleID     int64           `json:"group_role_id"`
	UserID          int64           `json:"user_id"`
	Username        string          `json:"username"`
	FullName        string          `json:"full_name"`
	RoleName        string          `json:"role_name"`
	RolePermissions map[string]bool `json:"role_permissions"`
	CreatedAt       time.Time       `json:"created_at"`
}

// GroupMemberRoleListResponse đại diện cho danh sách vai trò của thành viên
type GroupMemberRoleListResponse struct {
	MemberRoles []GroupMemberRoleResponse `json:"member_roles"`
	Total       int64                     `json:"total"`
}

// GroupMemberWithRolesResponse đại diện cho thông tin thành viên và các vai trò của họ
type GroupMemberWithRolesResponse struct {
	MemberInfo GroupMemberResponse `json:"member_info"`
	Roles      []GroupRoleResponse `json:"roles"`
}
