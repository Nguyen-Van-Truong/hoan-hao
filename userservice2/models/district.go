package models

import (
	"time"
)

// District đại diện cho quận/huyện
type District struct {
	ID         int       `json:"id" gorm:"primaryKey;autoIncrement"`
	Name       string    `json:"name" gorm:"size:100;not null"`
	Code       string    `json:"code" gorm:"size:20;not null;uniqueIndex"`
	ProvinceID int       `json:"province_id" gorm:"not null;index:idx_province_id"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (District) TableName() string {
	return "districts"
}
