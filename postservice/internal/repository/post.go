// postservice/internal/repository/post.go
package repository

import (
	"github.com/jinzhu/gorm"
	"postservice/internal/model"
)

type PostRepository interface {
	FindByID(id uint64) (*model.Post, error) // Đổi sang uint64
	CreatePost(post *model.Post) error
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) FindByID(id uint64) (*model.Post, error) {
	var post model.Post
	if err := r.db.Preload("Media").Where("id = ?", id).First(&post).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) CreatePost(post *model.Post) error {
	return r.db.Create(post).Error
}
