package models

import (
	"time"
)

// User đại diện cho người dùng trong hệ thống
type User struct {
	ID                int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	Username          string    `json:"username" gorm:"size:50;not null;index:idx_username"`
	Email             string    `json:"email" gorm:"size:100;not null;index:idx_email"`
	Phone             string    `json:"phone" gorm:"size:20"`
	FullName          string    `json:"full_name" gorm:"size:100;not null"`
	Bio               string    `json:"bio" gorm:"type:text"`
	Location          string    `json:"location" gorm:"size:100"`
	CountryID         int       `json:"country_id" gorm:"default:null;index:idx_country"`
	ProvinceID        int       `json:"province_id" gorm:"default:null;index:idx_province"`
	DistrictID        int       `json:"district_id" gorm:"default:null;index:idx_district"`
	Country           *Country  `json:"country,omitempty" gorm:"foreignKey:CountryID"`
	Province          *Province `json:"province,omitempty" gorm:"foreignKey:ProvinceID"`
	District          *District `json:"district,omitempty" gorm:"foreignKey:DistrictID"`
	Website           string    `json:"website" gorm:"size:255"`
	ProfilePictureURL string    `json:"profile_picture_url" gorm:"size:255"`
	CoverPictureURL   string    `json:"cover_picture_url" gorm:"size:255"`
	DateOfBirth       time.Time `json:"date_of_birth" gorm:"type:date"`
	Work              string    `json:"work" gorm:"size:100"`
	Education         string    `json:"education" gorm:"size:100"`
	Relationship      string    `json:"relationship" gorm:"size:50"`
	IsActive          bool      `json:"is_active" gorm:"default:true"`
	IsVerified        bool      `json:"is_verified" gorm:"default:false"`
	LastLoginAt       time.Time `json:"last_login_at" gorm:"default:null"`
	CreatedAt         time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt         time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName chỉ định tên bảng trong cơ sở dữ liệu
func (User) TableName() string {
	return "users"
}
