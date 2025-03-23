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
