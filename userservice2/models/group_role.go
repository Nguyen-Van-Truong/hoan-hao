package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// RolePermissions đại diện cho các quyền của vai trò
type RolePermissions map[string]bool

// Value chuyển đổi RolePermissions thành giá trị để lưu vào cơ sở dữ liệu
func (p RolePermissions) Value() (driver.Value, error) {
	return json.Marshal(p)
}

// Scan đọc dữ liệu từ cơ sở dữ liệu và chuyển đổi thành RolePermissions
func (p *RolePermissions) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(b, &p)
}

// GroupRole đại diện cho vai trò trong nhóm
type GroupRole struct {
	ID          int64           `json:"id" gorm:"primaryKey;autoIncrement"`
	GroupID     int64           `json:"group_id" gorm:"not null;index:idx_group_id"`
	Name        string          `json:"name" gorm:"size:50;not null"`
	Permissions RolePermissions `json:"permissions" gorm:"type:json"`
	CreatedAt   time.Time       `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time       `json:"updated_at" gorm:"autoUpdateTime"`
	Group       UserGroup       `json:"group" gorm:"foreignKey:GroupID"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (GroupRole) TableName() string {
	return "group_roles"
}

// GroupRoleCreateRequest đại diện cho yêu cầu tạo vai trò mới
type GroupRoleCreateRequest struct {
	GroupID     int64           `json:"group_id" binding:"required"`
	Name        string          `json:"name" binding:"required,min=2,max=50"`
	Permissions map[string]bool `json:"permissions" binding:"required"`
}

// GroupRoleUpdateRequest đại diện cho yêu cầu cập nhật vai trò
type GroupRoleUpdateRequest struct {
	Name        string          `json:"name" binding:"required,min=2,max=50"`
	Permissions map[string]bool `json:"permissions" binding:"required"`
}

// GroupRoleResponse đại diện cho thông tin phản hồi của một vai trò
type GroupRoleResponse struct {
	ID          int64           `json:"id"`
	GroupID     int64           `json:"group_id"`
	Name        string          `json:"name"`
	Permissions map[string]bool `json:"permissions"`
	CreatedAt   time.Time       `json:"created_at"`
}

// GroupRoleListResponse đại diện cho danh sách vai trò
type GroupRoleListResponse struct {
	Roles []GroupRoleResponse `json:"roles"`
	Total int64               `json:"total"`
}
