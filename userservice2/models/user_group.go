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

// GroupCreateRequest đại diện cho yêu cầu tạo nhóm
type GroupCreateRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description"`
	Privacy     string `json:"privacy" binding:"required,oneof=public private"`
	CoverImage  string `json:"cover_image"`
}

// GroupUpdateRequest đại diện cho yêu cầu cập nhật nhóm
type GroupUpdateRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description"`
	Privacy     string `json:"privacy" binding:"required,oneof=public private"`
	CoverImage  string `json:"cover_image"`
}

// GroupResponse đại diện cho thông tin phản hồi của một nhóm
type GroupResponse struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Privacy      string    `json:"privacy"`
	CoverImage   string    `json:"cover_image,omitempty"`
	CreatedBy    int64     `json:"created_by"`
	CreatorName  string    `json:"creator_name"`
	MemberCount  int       `json:"member_count"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	IsMember     bool      `json:"is_member"`
	MemberRole   string    `json:"member_role,omitempty"`
	CanManage    bool      `json:"can_manage"`
	CanAddMember bool      `json:"can_add_member"`
}

// GroupListResponse đại diện cho danh sách nhóm với phân trang
type GroupListResponse struct {
	Groups     []GroupResponse `json:"groups"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int64           `json:"total_pages"`
}

// GroupJoinRequestListResponse đại diện cho danh sách yêu cầu tham gia nhóm với phân trang
type GroupJoinRequestListResponse struct {
	Requests   []GroupJoinRequestResponse `json:"requests"`
	Total      int64                      `json:"total"`
	Page       int                        `json:"page"`
	PageSize   int                        `json:"page_size"`
	TotalPages int64                      `json:"total_pages"`
}

// GroupJoinRequestResponse đại diện cho thông tin chi tiết của một yêu cầu tham gia nhóm
type GroupJoinRequestResponse struct {
	ID        int64     `json:"id"`
	GroupID   int64     `json:"group_id"`
	UserID    int64     `json:"user_id"`
	Username  string    `json:"username"`
	FullName  string    `json:"full_name"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
