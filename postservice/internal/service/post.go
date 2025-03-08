package service

import (
	"errors"
	"postservice/internal/model"
	"postservice/internal/repository"
	"time"
)

type PostService interface {
	GetPostByID(id uint64) (*model.PostResponse, error)
	CreatePost(userID uint, req model.CreatePostRequest) (*model.PostResponse, error)
	UpdatePost(id uint64, userID uint64, req model.CreatePostRequest) (*model.PostResponse, error)
	DeletePost(id uint64, userID uint64) error
	CreateComment(postID, userID uint64, content string, parentID *uint64) (*model.Comment, error)
	UpdateComment(id uint64, userID uint64, content string) (*model.Comment, error)
	GetCommentsByPostID(postID uint64, limit, offset int) ([]model.Comment, int64, error)
	DeleteComment(id uint64, userID uint64) error
	LikePost(postID, userID uint64) error
	UnlikePost(postID, userID uint64) error
	LikeComment(commentID, userID uint64) error
	UnlikeComment(commentID, userID uint64) error
	SharePost(postID, userID uint64, content string) (*model.PostShare, error)
	GetSharesByPostID(postID uint64, limit, offset int) ([]model.PostShare, int64, error)
	GetPostsByUserID(userID uint64, limit, offset int) ([]model.PostResponse, int64, error)
	GetCommentByID(id uint64) (*model.Comment, error)
	GetFeed(userID uint64, mode string, limit, offset int) ([]model.PostResponse, int64, error)
}

type postService struct {
	repo repository.PostRepository
}

func NewPostService(repo repository.PostRepository) PostService {
	return &postService{repo: repo}
}

func (s *postService) GetPostByID(id uint64) (*model.PostResponse, error) {
	return s.repo.FindByID(id)
}

func (s *postService) CreatePost(userID uint, req model.CreatePostRequest) (*model.PostResponse, error) {
	// Sử dụng model.Post để tạo bài đăng trong DB
	post := &model.Post{
		UserID:     uint64(userID),
		Content:    req.Content,
		Visibility: req.Visibility,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	for _, url := range req.MediaURLs {
		post.Media = append(post.Media, model.PostMedia{
			MediaURL:  url,
			MediaType: "IMAGE",
			CreatedAt: time.Now(),
		})
	}

	if err := s.repo.CreatePost(post); err != nil {
		return nil, err
	}

	// Sau khi tạo, lấy dữ liệu đầy đủ bằng FindByID để trả về PostResponse
	return s.repo.FindByID(post.ID)
}

func (s *postService) UpdatePost(id uint64, userID uint64, req model.CreatePostRequest) (*model.PostResponse, error) {
	// Lấy bài đăng từ DB bằng FindByID (trả về PostResponse)
	postResp, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if postResp.UserID != userID {
		return nil, errors.New("forbidden")
	}

	// Chuyển đổi sang model.Post để cập nhật
	post := &model.Post{
		ID:         id,
		UserID:     postResp.UserID,
		Content:    req.Content,
		Visibility: req.Visibility,
		CreatedAt:  postResp.CreatedAt,
		UpdatedAt:  time.Now(),
		IsDeleted:  false, // Đảm bảo không thay đổi trạng thái xóa
	}

	// Xóa media cũ và thêm media mới
	post.Media = nil
	for _, url := range req.MediaURLs {
		post.Media = append(post.Media, model.PostMedia{
			MediaURL:  url,
			MediaType: "IMAGE",
			CreatedAt: time.Now(),
		})
	}

	if err := s.repo.UpdatePost(post); err != nil {
		return nil, err
	}

	// Sau khi cập nhật, lấy dữ liệu đầy đủ để trả về
	return s.repo.FindByID(id)
}

func (s *postService) DeletePost(id uint64, userID uint64) error {
	post, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	if post.UserID != userID {
		return errors.New("forbidden")
	}
	return s.repo.DeletePost(id)
}

func (s *postService) CreateComment(postID, userID uint64, content string, parentID *uint64) (*model.Comment, error) {
	comment := &model.Comment{
		PostID:          postID,
		UserID:          userID,
		ParentCommentID: parentID,
		Content:         content,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
	if err := s.repo.CreateComment(comment); err != nil {
		return nil, err
	}
	return comment, nil
}

func (s *postService) UpdateComment(id uint64, userID uint64, content string) (*model.Comment, error) {
	comment, err := s.GetCommentByID(id)
	if err != nil {
		return nil, err
	}
	if comment.UserID != userID {
		return nil, errors.New("forbidden")
	}

	comment.Content = content
	comment.UpdatedAt = time.Now()
	if err := s.repo.UpdateComment(comment); err != nil {
		return nil, err
	}
	return comment, nil
}

func (s *postService) GetCommentsByPostID(postID uint64, limit, offset int) ([]model.Comment, int64, error) {
	return s.repo.FindCommentsByPostID(postID, limit, offset)
}

func (s *postService) DeleteComment(id uint64, userID uint64) error {
	comment, err := s.GetCommentByID(id)
	if err != nil {
		return err
	}
	if comment.UserID != userID {
		return errors.New("forbidden")
	}
	return s.repo.DeleteComment(id)
}

func (s *postService) LikePost(postID, userID uint64) error {
	return s.repo.CreatePostLike(postID, userID)
}

func (s *postService) UnlikePost(postID, userID uint64) error {
	return s.repo.DeletePostLike(postID, userID)
}

func (s *postService) LikeComment(commentID, userID uint64) error {
	return s.repo.CreateCommentLike(commentID, userID)
}

func (s *postService) UnlikeComment(commentID, userID uint64) error {
	return s.repo.DeleteCommentLike(commentID, userID)
}

func (s *postService) SharePost(postID, userID uint64, content string) (*model.PostShare, error) {
	share := &model.PostShare{
		PostID:        postID,
		UserID:        userID,
		SharedContent: content,
		CreatedAt:     time.Now(),
	}
	if err := s.repo.CreateShare(share); err != nil {
		return nil, err
	}
	return share, nil
}

func (s *postService) GetSharesByPostID(postID uint64, limit, offset int) ([]model.PostShare, int64, error) {
	return s.repo.FindSharesByPostID(postID, limit, offset)
}

func (s *postService) GetPostsByUserID(userID uint64, limit, offset int) ([]model.PostResponse, int64, error) {
	return s.repo.FindPostsByUserID(userID, limit, offset)
}

func (s *postService) GetCommentByID(id uint64) (*model.Comment, error) {
	var comment model.Comment
	if err := s.repo.FindCommentByID(id, &comment); err != nil {
		return nil, err
	}
	return &comment, nil
}

func (s *postService) GetFeed(userID uint64, mode string, limit, offset int) ([]model.PostResponse, int64, error) {
	return s.repo.FindFeed(userID, mode, limit, offset)
}
