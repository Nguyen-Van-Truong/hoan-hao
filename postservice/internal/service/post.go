// postservice/internal/service/post.go
package service

import (
	"postservice/internal/model"
	"postservice/internal/repository"
	"time"
)

type PostService interface {
	GetPostByID(id uint64) (*model.Post, error) // Đổi sang uint64 để đồng bộ
	CreatePost(userID uint, req model.CreatePostRequest) (*model.Post, error)
}

type postService struct {
	repo repository.PostRepository
}

func NewPostService(repo repository.PostRepository) PostService {
	return &postService{repo: repo}
}

func (s *postService) GetPostByID(id uint64) (*model.Post, error) {
	return s.repo.FindByID(id) // id đã là uint64
}

func (s *postService) CreatePost(userID uint, req model.CreatePostRequest) (*model.Post, error) {
	// Tạo bài đăng mới, ép kiểu userID từ uint sang uint64
	post := &model.Post{
		UserID:     uint64(userID), // Ép kiểu để khớp với uint64
		Content:    req.Content,
		Visibility: req.Visibility,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Thêm media nếu có
	for _, url := range req.MediaURLs {
		post.Media = append(post.Media, model.PostMedia{
			MediaURL:  url,
			MediaType: "IMAGE", // Giả định mặc định là IMAGE
			CreatedAt: time.Now(),
		})
	}

	// Lưu vào database
	if err := s.repo.CreatePost(post); err != nil {
		return nil, err
	}

	return post, nil
}
