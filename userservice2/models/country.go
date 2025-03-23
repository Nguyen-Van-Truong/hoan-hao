package models

import (
	"time"
)

// Country đại diện cho quốc gia
type Country struct {
	ID        int       `json:"id" gorm:"primaryKey;autoIncrement"`
	Name      string    `json:"name" gorm:"size:100;not null"`
	Code      string    `json:"code" gorm:"size:10;not null;uniqueIndex"`
	PhoneCode string    `json:"phone_code" gorm:"size:10"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (Country) TableName() string {
	return "countries"
}
