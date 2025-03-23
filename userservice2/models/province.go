package models

import (
	"time"
)

// Province đại diện cho tỉnh/thành phố
type Province struct {
	ID        int       `json:"id" gorm:"primaryKey;autoIncrement"`
	Name      string    `json:"name" gorm:"size:100;not null"`
	Code      string    `json:"code" gorm:"size:20;not null;uniqueIndex"`
	CountryID int       `json:"country_id" gorm:"not null;index:idx_country_id"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (Province) TableName() string {
	return "provinces"
}
