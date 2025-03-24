package models

import (
	"time"
)

// JoinRequestStatus đại diện cho trạng thái của yêu cầu tham gia nhóm
type JoinRequestStatus string

const (
	// Các trạng thái yêu cầu tham gia
	JoinRequestStatusPending  JoinRequestStatus = "pending"
	JoinRequestStatusApproved JoinRequestStatus = "approved"
	JoinRequestStatusRejected JoinRequestStatus = "rejected"
)

// GroupJoinRequest đại diện cho yêu cầu tham gia nhóm
type GroupJoinRequest struct {
	ID        int64             `json:"id" gorm:"primaryKey;autoIncrement"`
	GroupID   int64             `json:"group_id" gorm:"not null;index:idx_group_id"`
	UserID    int64             `json:"user_id" gorm:"not null;index:idx_user_id"`
	Message   string            `json:"message" gorm:"type:text"`
	Status    JoinRequestStatus `json:"status" gorm:"type:enum('pending','approved','rejected');default:'pending';index:idx_status"`
	CreatedAt time.Time         `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time         `json:"updated_at" gorm:"autoUpdateTime"`
	Group     UserGroup         `json:"group" gorm:"foreignKey:GroupID"`
	User      User              `json:"user" gorm:"foreignKey:UserID"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (GroupJoinRequest) TableName() string {
	return "group_join_requests"
}
