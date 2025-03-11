package service

import (
	"errors"
	"log"
	"postservice/internal/model"
	"postservice/internal/repository"
	"postservice/internal/util"
	"time"
)

type PostService interface {
	GetPostByID(id uint64) (*model.PostResponse, error)
	CreatePost(userID uint64, req model.CreatePostRequest, files []interface{}) (*model.PostResponse, error)
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
	repo               repository.PostRepository
	cloudinaryUploader *util.CloudinaryUploader
}

func NewPostService(repo repository.PostRepository) PostService {
	uploader, err := util.NewCloudinaryUploader()
	if err != nil {
		log.Fatalf("Failed to initialize Cloudinary uploader: %v", err)
	}

	return &postService{
		repo:               repo,
		cloudinaryUploader: uploader,
	}
}

func (s *postService) CreatePost(userID uint64, req model.CreatePostRequest, files []interface{}) (*model.PostResponse, error) {
	post := &model.Post{
		UserID:     userID,
		Content:    req.Content,
		Visibility: req.Visibility,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Upload files lên Cloudinary nếu có
	if len(files) > 0 {
		urls, err := s.cloudinaryUploader.UploadImages(files)
		if err != nil {
			return nil, errors.New("failed to upload images: " + err.Error())
		}
		for _, url := range urls {
			post.Media = append(post.Media, model.PostMedia{
				MediaURL:  url,
				MediaType: "IMAGE",
				CreatedAt: time.Now(),
			})
		}
	}

	// Nếu không có file nhưng có MediaURLs từ request, dùng nó
	if len(files) == 0 && len(req.MediaURLs) > 0 {
		for _, url := range req.MediaURLs {
			post.Media = append(post.Media, model.PostMedia{
				MediaURL:  url,
				MediaType: "IMAGE",
				CreatedAt: time.Now(),
			})
		}
	}

	if err := s.repo.CreatePost(post); err != nil {
		return nil, err
	}

	resp, err := s.repo.FindByID(post.ID)
	if err != nil {
		return nil, err
	}

	result, err := util.PopulateSingleUserInfo(*resp, userID)
	if err != nil {
		log.Printf("Failed to populate user info: %v", err)
		return resp, nil
	}

	return &result, nil
}

// Các method khác giữ nguyên
func (s *postService) GetPostByID(id uint64) (*model.PostResponse, error) {
	post, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	result, err := util.PopulateSingleUserInfo(*post, post.UserID)
	if err != nil {
		return post, nil
	}
	return &result, nil
}

func (s *postService) UpdatePost(id uint64, userID uint64, req model.CreatePostRequest) (*model.PostResponse, error) {
	postResp, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if postResp.UserID != userID {
		return nil, errors.New("forbidden")
	}
	post := &model.Post{
		ID:         id,
		UserID:     postResp.UserID,
		Content:    req.Content,
		Visibility: req.Visibility,
		CreatedAt:  postResp.CreatedAt,
		UpdatedAt:  time.Now(),
		IsDeleted:  false,
	}
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
	resp, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	result, err := util.PopulateSingleUserInfo(*resp, userID)
	if err != nil {
		return resp, nil
	}
	return &result, nil
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
	result, err := util.PopulateSingleUserInfo(*comment, userID)
	if err != nil {
		return comment, nil
	}
	return &result, nil
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
	result, err := util.PopulateSingleUserInfo(*comment, userID)
	if err != nil {
		return comment, nil
	}
	return &result, nil
}

func (s *postService) GetCommentsByPostID(postID uint64, limit, offset int) ([]model.Comment, int64, error) {
	comments, total, err := s.repo.FindCommentsByPostID(postID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	result, err := util.PopulateUserInfo(comments, func(c model.Comment) uint64 { return c.UserID })
	if err != nil {
		return comments, total, nil
	}
	return result, total, nil
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
	result, err := util.PopulateSingleUserInfo(*share, userID)
	if err != nil {
		return share, nil
	}
	return &result, nil
}

func (s *postService) GetSharesByPostID(postID uint64, limit, offset int) ([]model.PostShare, int64, error) {
	shares, total, err := s.repo.FindSharesByPostID(postID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	result, err := util.PopulateUserInfo(shares, func(s model.PostShare) uint64 { return s.UserID })
	if err != nil {
		return shares, total, nil
	}
	return result, total, nil
}

func (s *postService) GetPostsByUserID(userID uint64, limit, offset int) ([]model.PostResponse, int64, error) {
	posts, total, err := s.repo.FindPostsByUserID(userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	result, err := util.PopulateUserInfo(posts, func(p model.PostResponse) uint64 { return p.UserID })
	if err != nil {
		return posts, total, nil
	}
	return result, total, nil
}

func (s *postService) GetCommentByID(id uint64) (*model.Comment, error) {
	var comment model.Comment
	if err := s.repo.FindCommentByID(id, &comment); err != nil {
		return nil, err
	}
	result, err := util.PopulateSingleUserInfo(comment, comment.UserID)
	if err != nil {
		return &comment, nil
	}
	return &result, nil
}

func (s *postService) GetFeed(userID uint64, mode string, limit, offset int) ([]model.PostResponse, int64, error) {
	posts, total, err := s.repo.FindFeed(userID, mode, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	result, err := util.PopulateUserInfo(posts, func(p model.PostResponse) uint64 { return p.UserID })
	if err != nil {
		return posts, total, nil
	}
	return result, total, nil
}
