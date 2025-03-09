package model

import "time"

// UserInfo chứa thông tin cơ bản của user
type UserInfo struct {
	ID                uint64 `json:"id"`
	Username          string `json:"username"`
	FullName          string `json:"full_name"`
	ProfilePictureURL string `json:"profile_picture_url"`
}

// Post ánh xạ bảng posts
type Post struct {
	ID         uint64      `json:"id" gorm:"primary_key"`
	UserID     uint64      `json:"user_id" gorm:"not null"`
	Content    string      `json:"content" gorm:"type:text;not null"`
	Visibility string      `json:"visibility" gorm:"type:enum('PUBLIC','FRIENDS','PRIVATE');default:'PUBLIC'"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
	IsDeleted  bool        `json:"is_deleted" gorm:"default:0"`
	Media      []PostMedia `json:"media" gorm:"foreignKey:PostID"`
}

func (Post) TableName() string {
	return "posts"
}

// PostResponse dùng để trả về dữ liệu bài đăng với thông tin bổ sung
type PostResponse struct {
	ID            uint64      `json:"id"`
	UserID        uint64      `json:"user_id"`
	Author        *UserInfo   `json:"author"` // Thêm thông tin user
	Content       string      `json:"content"`
	Visibility    string      `json:"visibility"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
	Media         []PostMedia `json:"media"`
	TotalLikes    int         `json:"total_likes"`
	TotalComments int         `json:"total_comments"`
	TotalShares   int         `json:"total_shares"`
}

// PostMedia ánh xạ bảng post_media
type PostMedia struct {
	ID        uint64    `json:"id" gorm:"primary_key"`
	PostID    uint64    `json:"post_id" gorm:"not null"`
	MediaURL  string    `json:"media_url" gorm:"type:varchar(255);not null"`
	MediaType string    `json:"media_type" gorm:"type:enum('IMAGE','VIDEO');default:'IMAGE'"`
	CreatedAt time.Time `json:"created_at"`
}

func (PostMedia) TableName() string {
	return "post_media"
}

// Comment ánh xạ bảng comments
type Comment struct {
	ID              uint64        `json:"id" gorm:"primary_key"`
	PostID          uint64        `json:"post_id" gorm:"not null"`
	UserID          uint64        `json:"user_id" gorm:"not null"`
	Author          *UserInfo     `json:"author"` // Thêm thông tin user
	ParentCommentID *uint64       `json:"parent_comment_id"`
	Content         string        `json:"content" gorm:"type:text;not null"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
	IsDeleted       bool          `json:"is_deleted" gorm:"default:0"`
	Likes           []CommentLike `json:"likes" gorm:"foreignKey:CommentID"`
}

func (Comment) TableName() string {
	return "comments"
}

// PostShare ánh xạ bảng post_shares
type PostShare struct {
	ID            uint64    `json:"id" gorm:"primary_key"`
	PostID        uint64    `json:"post_id" gorm:"not null"`
	UserID        uint64    `json:"user_id" gorm:"not null"`
	Author        *UserInfo `json:"author"` // Thêm thông tin user
	SharedContent string    `json:"shared_content" gorm:"type:text"`
	CreatedAt     time.Time `json:"created_at"`
}

func (PostShare) TableName() string {
	return "post_shares"
}

// PostLike ánh xạ bảng post_likes
type PostLike struct {
	PostID    uint64    `json:"post_id" gorm:"primary_key"`
	UserID    uint64    `json:"user_id" gorm:"primary_key"`
	CreatedAt time.Time `json:"created_at"`
}

func (PostLike) TableName() string {
	return "post_likes"
}

// CommentLike ánh xạ bảng comment_likes
type CommentLike struct {
	CommentID uint64    `json:"comment_id" gorm:"primary_key"`
	UserID    uint64    `json:"user_id" gorm:"primary_key"`
	CreatedAt time.Time `json:"created_at"`
}

func (CommentLike) TableName() string {
	return "comment_likes"
}

// CreatePostRequest dùng cho API tạo bài đăng
type CreatePostRequest struct {
	Content    string   `json:"content" binding:"required"`
	MediaURLs  []string `json:"media_urls"`
	Visibility string   `json:"visibility" binding:"oneof=PUBLIC FRIENDS PRIVATE"`
}
