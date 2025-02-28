package model

import "time"

// UserProfileRequestDto chứa dữ liệu nhận từ AuthService
type UserProfileRequestDto struct {
	Username       string `json:"username"`
	Email          string `json:"email"`
	FullName       string `json:"fullname"`
	DateOfBirth    string `json:"dateOfBirth"`
	CountryCode    string `json:"countryCode"`
	PhoneNumber    string `json:"phoneNumber"`
	UserID         uint   `json:"userId"`                   // Thêm userId để nhận từ AuthService
	Bio            string `json:"bio,omitempty"`            // Optional
	Location       string `json:"location,omitempty"`       // Optional
	CountryID      uint   `json:"countryId,omitempty"`      // Optional
	ProvinceID     uint   `json:"provinceId,omitempty"`     // Optional
	DistrictID     uint   `json:"districtId,omitempty"`     // Optional
	Website        string `json:"website,omitempty"`        // Optional
	ProfilePicture string `json:"profilePicture,omitempty"` // Optional
	CoverPicture   string `json:"coverPicture,omitempty"`   // Optional
}

// UserProfile ánh xạ bảng user_profiles trong hoanhao_user
type UserProfile struct {
	ID             uint       `json:"id"`      // Khóa chính của user_profiles
	UserID         uint       `json:"user_id"` // Foreign key đến hoanhao_auth.user.id
	Username       string     `json:"username"`
	FullName       string     `json:"full_name"`
	IsActive       bool       `json:"is_active"`
	IsVerified     bool       `json:"is_verified"`
	LastLoginAt    *time.Time `json:"last_login_at"` // Hỗ trợ NULL
	Bio            string     `json:"bio"`
	Location       string     `json:"location"`
	CountryID      *uint      `json:"country_id"`  // Hỗ trợ NULL
	ProvinceID     *uint      `json:"province_id"` // Hỗ trợ NULL
	DistrictID     *uint      `json:"district_id"` // Hỗ trợ NULL
	Website        string     `json:"website"`
	ProfilePicture string     `json:"profile_picture_url"`
	CoverPicture   string     `json:"cover_picture_url"`
	DateOfBirth    *time.Time `json:"date_of_birth"` // Hỗ trợ NULL
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

func (UserProfile) TableName() string {
	return "user_profiles" // Thêm "s"
}

// UserEmail ánh xạ bảng user_emails
type UserEmail struct {
	ID         uint   `json:"id"`
	UserID     uint   `json:"user_id"` // Liên kết với user_profiles.id
	Email      string `json:"email"`
	Visibility string `json:"visibility"`
}

func (UserEmail) TableName() string {
	return "user_emails" // Thêm "s"
}

// UserPhoneNumber ánh xạ bảng user_phone_numbers
type UserPhoneNumber struct {
	ID          uint   `json:"id"`
	UserID      uint   `json:"user_id"` // Liên kết với user_profiles.id
	CountryCode string `json:"country_code"`
	PhoneNumber string `json:"phone_number"`
	Visibility  string `json:"visibility"`
}

func (UserPhoneNumber) TableName() string {
	return "user_phone_numbers" // Thêm "s"
}

// Friend ánh xạ bảng friends
type Friend struct {
	ID             uint      `json:"id"`
	UserID         uint      `json:"user_id"` // Liên kết với user_profiles.id
	UserUsername   string    `json:"user_username"`
	FriendID       uint      `json:"friend_id"` // Liên kết với user_profiles.id
	FriendUsername string    `json:"friend_username"`
	Status         string    `json:"status"`    // enum: PENDING, ACCEPTED, BLOCKED
	ActionBy       *uint     `json:"action_by"` // Hỗ trợ NULL
	CreatedAt      time.Time `json:"created_at"`
}

func (Friend) TableName() string {
	return "friends" // Thêm "s"
}

// UserSetting ánh xạ bảng user_settings
type UserSetting struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`  // Liên kết với user_profiles.id
	Settings  string    `json:"settings"` // JSON được lưu dưới dạng string
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (UserSetting) TableName() string {
	return "user_settings" // Thêm "s"
}

// UserNotification ánh xạ bảng user_notifications
type UserNotification struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"` // Liên kết với user_profiles.id
	Content   string    `json:"content"`
	Type      string    `json:"type"`
	SourceID  *uint     `json:"source_id"` // Hỗ trợ NULL
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

func (UserNotification) TableName() string {
	return "user_notifications" // Thêm "s"
}
