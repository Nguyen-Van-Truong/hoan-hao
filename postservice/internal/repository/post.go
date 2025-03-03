package repository

import (
	"github.com/jinzhu/gorm"
	"postservice/internal/model"
	"time"
)

type PostRepository interface {
	FindByID(id uint64) (*model.Post, error)
	CreatePost(post *model.Post) error
	UpdatePost(post *model.Post) error
	DeletePost(id uint64) error
	CreateComment(comment *model.Comment) error
	FindCommentsByPostID(postID uint64, limit, offset int) ([]model.Comment, int64, error)
	FindCommentByID(id uint64, comment *model.Comment) error // Thêm phương thức mới
	UpdateComment(comment *model.Comment) error
	DeleteComment(id uint64) error
	CreatePostLike(postID, userID uint64) error
	DeletePostLike(postID, userID uint64) error
	CreateCommentLike(commentID, userID uint64) error
	DeleteCommentLike(commentID, userID uint64) error
	CreateShare(share *model.PostShare) error
	FindSharesByPostID(postID uint64, limit, offset int) ([]model.PostShare, int64, error)
	FindPostsByUserID(userID uint64, limit, offset int) ([]model.Post, int64, error)
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) FindByID(id uint64) (*model.Post, error) {
	var post model.Post
	if err := r.db.Preload("Media").Where("id = ? AND is_deleted = false", id).First(&post).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) CreatePost(post *model.Post) error {
	return r.db.Create(post).Error
}

func (r *postRepository) UpdatePost(post *model.Post) error {
	return r.db.Save(post).Error
}

func (r *postRepository) DeletePost(id uint64) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).Update("is_deleted", true).Error
}

func (r *postRepository) CreateComment(comment *model.Comment) error {
	return r.db.Create(comment).Error
}

func (r *postRepository) FindCommentsByPostID(postID uint64, limit, offset int) ([]model.Comment, int64, error) {
	var comments []model.Comment
	var total int64

	if err := r.db.Model(&model.Comment{}).Where("post_id = ? AND is_deleted = false", postID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.Preload("Likes").Where("post_id = ? AND is_deleted = false", postID).
		Order("created_at DESC").Limit(limit).Offset(offset).Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

func (r *postRepository) FindCommentByID(id uint64, comment *model.Comment) error {
	return r.db.Where("id = ? AND is_deleted = false", id).First(comment).Error
}

func (r *postRepository) UpdateComment(comment *model.Comment) error {
	return r.db.Save(comment).Error
}

func (r *postRepository) DeleteComment(id uint64) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).Update("is_deleted", true).Error
}

func (r *postRepository) CreatePostLike(postID, userID uint64) error {
	like := &model.PostLike{PostID: postID, UserID: userID, CreatedAt: time.Now()}
	return r.db.Create(like).Error
}

func (r *postRepository) DeletePostLike(postID, userID uint64) error {
	return r.db.Where("post_id = ? AND user_id = ?", postID, userID).Delete(&model.PostLike{}).Error
}

func (r *postRepository) CreateCommentLike(commentID, userID uint64) error {
	like := &model.CommentLike{CommentID: commentID, UserID: userID, CreatedAt: time.Now()}
	return r.db.Create(like).Error
}

func (r *postRepository) DeleteCommentLike(commentID, userID uint64) error {
	return r.db.Where("comment_id = ? AND user_id = ?", commentID, userID).Delete(&model.CommentLike{}).Error
}

func (r *postRepository) CreateShare(share *model.PostShare) error {
	return r.db.Create(share).Error
}

func (r *postRepository) FindSharesByPostID(postID uint64, limit, offset int) ([]model.PostShare, int64, error) {
	var shares []model.PostShare
	var total int64

	if err := r.db.Model(&model.PostShare{}).Where("post_id = ?", postID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.Where("post_id = ?", postID).Order("created_at DESC").Limit(limit).Offset(offset).Find(&shares).Error; err != nil {
		return nil, 0, err
	}

	return shares, total, nil
}

func (r *postRepository) FindPostsByUserID(userID uint64, limit, offset int) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	if err := r.db.Model(&model.Post{}).Where("user_id = ? AND is_deleted = false", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.Preload("Media").Where("user_id = ? AND is_deleted = false", userID).
		Order("created_at DESC").Limit(limit).Offset(offset).Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	return posts, total, nil
}
