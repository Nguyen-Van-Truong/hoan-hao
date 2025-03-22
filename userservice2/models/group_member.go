package models

import (
	"time"
)

// MemberRole đại diện cho vai trò của thành viên trong nhóm
type MemberRole string

const (
	// Các vai trò của thành viên
	MemberRoleMember MemberRole = "member"
	MemberRoleAdmin  MemberRole = "admin"
)

// GroupMemberStatus đại diện cho trạng thái của thành viên trong nhóm
type GroupMemberStatus string

const (
	// Các trạng thái thành viên
	GroupMemberStatusPending  GroupMemberStatus = "pending"
	GroupMemberStatusApproved GroupMemberStatus = "approved"
	GroupMemberStatusRejected GroupMemberStatus = "rejected"
)

// GroupMember đại diện cho thành viên trong nhóm
type GroupMember struct {
	ID       int64             `json:"id" gorm:"primaryKey;autoIncrement"`
	GroupID  int64             `json:"group_id" gorm:"not null;index:idx_group_id"`
	UserID   int64             `json:"user_id" gorm:"not null;index:idx_user_id"`
	Role     MemberRole        `json:"role" gorm:"type:enum('member','admin');default:'member';index:idx_role"`
	Nickname string            `json:"nickname" gorm:"size:50"`
	IsMuted  bool              `json:"is_muted" gorm:"default:false"`
	Status   GroupMemberStatus `json:"status" gorm:"type:enum('pending','approved','rejected');default:'pending';index:idx_status"`
	JoinedAt time.Time         `json:"joined_at" gorm:"autoCreateTime"`
	LeftAt   *time.Time        `json:"left_at" gorm:"default:null"`
	Group    UserGroup         `json:"group" gorm:"foreignKey:GroupID"`
	User     User              `json:"user" gorm:"foreignKey:UserID"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (GroupMember) TableName() string {
	return "group_members"
}

// GroupMemberCreateRequest đại diện cho yêu cầu thêm thành viên vào nhóm
type GroupMemberCreateRequest struct {
	UserID   int64  `json:"user_id" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=member admin"`
	Nickname string `json:"nickname"`
}

// GroupMemberUpdateRequest đại diện cho yêu cầu cập nhật thông tin thành viên
type GroupMemberUpdateRequest struct {
	Role     string `json:"role" binding:"required,oneof=member admin"`
	Nickname string `json:"nickname"`
	IsMuted  *bool  `json:"is_muted"`
}

// GroupMemberResponse đại diện cho thông tin phản hồi của một thành viên
type GroupMemberResponse struct {
	ID       int64     `json:"id"`
	GroupID  int64     `json:"group_id"`
	UserID   int64     `json:"user_id"`
	Username string    `json:"username"`
	FullName string    `json:"full_name"`
	Role     string    `json:"role"`
	Nickname string    `json:"nickname,omitempty"`
	IsMuted  bool      `json:"is_muted"`
	Status   string    `json:"status"`
	JoinedAt time.Time `json:"joined_at"`
}

// GroupMemberListResponse đại diện cho danh sách thành viên với phân trang
type GroupMemberListResponse struct {
	Members    []GroupMemberResponse `json:"members"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	PageSize   int                   `json:"page_size"`
	TotalPages int64                 `json:"total_pages"`
}
