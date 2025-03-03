// internal/model/post.go
package model

import "time"

// Post ánh xạ bảng posts
type Post struct {
	ID         uint64      `json:"id" gorm:"primary_key"`
	UserID     uint64      `json:"user_id" gorm:"not null"`
	Content    string      `json:"content" gorm:"type:text;not null"`
	Visibility string      `json:"visibility" gorm:"type:enum('PUBLIC','FRIENDS','PRIVATE');default:'PUBLIC'"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
	IsDeleted  bool        `json:"is_deleted" gorm:"default:0"`
	Media      []PostMedia `json:"media" gorm:"foreignKey:PostID"`    // Quan hệ 1-nhiều với PostMedia
	Comments   []Comment   `json:"comments" gorm:"foreignKey:PostID"` // Quan hệ 1-nhiều với Comment
	Shares     []PostShare `json:"shares" gorm:"foreignKey:PostID"`   // Quan hệ 1-nhiều với PostShare
	Likes      []PostLike  `json:"likes" gorm:"foreignKey:PostID"`    // Quan hệ 1-nhiều với PostLike
}

func (Post) TableName() string {
	return "posts"
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
	ParentCommentID *uint64       `json:"parent_comment_id"` // Có thể null nếu là bình luận gốc
	Content         string        `json:"content" gorm:"type:text;not null"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
	IsDeleted       bool          `json:"is_deleted" gorm:"default:0"`
	Likes           []CommentLike `json:"likes" gorm:"foreignKey:CommentID"` // Quan hệ 1-nhiều với CommentLike
}

func (Comment) TableName() string {
	return "comments"
}

// PostShare ánh xạ bảng post_shares
type PostShare struct {
	ID            uint64    `json:"id" gorm:"primary_key"`
	PostID        uint64    `json:"post_id" gorm:"not null"`
	UserID        uint64    `json:"user_id" gorm:"not null"`
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
	MediaURLs  []string `json:"media_urls"` // Danh sách URL media (ảnh hoặc video)
	Visibility string   `json:"visibility" binding:"oneof=PUBLIC FRIENDS PRIVATE"`
}
