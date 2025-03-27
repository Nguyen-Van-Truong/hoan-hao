package service

import (
	"errors"
	"fmt"
	"log"
	"postservice/internal/model"
	"postservice/internal/repository"
	"postservice/internal/util"
	"time"

	"github.com/google/uuid"
)

type PostService interface {
	GetPostByID(id uint64) (*model.PostResponse, error)
	GetPostByUUID(uuid string) (*model.PostResponse, error)
	CreatePost(userID uint64, req model.CreatePostRequest, files []interface{}) (*model.PostResponse, error)
	UpdatePost(id uint64, userID uint64, req model.CreatePostRequest, files []interface{}) (*model.PostResponse, error)
	UpdatePostByUUID(uuid string, userID uint64, req model.CreatePostRequest, files []interface{}) (*model.PostResponse, error)
	DeletePost(id uint64, userID uint64) error
	DeletePostByUUID(uuid string, userID uint64) error
	CreateComment(postID, userID uint64, content string, parentID *uint64, files []interface{}) (*model.Comment, error)
	CreateCommentByUUID(uuid string, userID uint64, content string, parentID *uint64, files []interface{}) (*model.Comment, error)
	UpdateComment(id uint64, userID uint64, content string) (*model.Comment, error)
	GetCommentsByPostID(postID uint64, limit, offset int) ([]model.Comment, int64, error)
	GetCommentsByPostUUID(uuid string, limit, offset int) ([]model.Comment, int64, error)
	DeleteComment(id uint64, userID uint64) error
	LikePost(postID, userID uint64) error
	LikePostByUUID(uuid string, userID uint64) error
	UnlikePost(postID, userID uint64) error
	UnlikePostByUUID(uuid string, userID uint64) error
	LikeComment(commentID, userID uint64) error
	UnlikeComment(commentID, userID uint64) error
	SharePost(postID, userID uint64, content string) (*model.PostShare, error)
	SharePostByUUID(uuid string, userID uint64, content string) (*model.PostShare, error)
	GetSharesByPostID(postID uint64, limit, offset int) ([]model.PostShare, int64, error)
	GetSharesByPostUUID(uuid string, limit, offset int) ([]model.PostShare, int64, error)
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
		UUID:       uuid.New().String(),
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

func (s *postService) UpdatePost(id uint64, userID uint64, req model.CreatePostRequest, files []interface{}) (*model.PostResponse, error) {
	// Tìm bài đăng hiện tại
	postResp, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if postResp.UserID != userID {
		return nil, errors.New("forbidden")
	}

	// Tạo đối tượng post mới để cập nhật
	post := &model.Post{
		ID:         id,
		UserID:     postResp.UserID,
		Content:    req.Content,
		Visibility: req.Visibility,
		CreatedAt:  postResp.CreatedAt,
		UpdatedAt:  time.Now(),
		IsDeleted:  false,
	}

	// Lấy danh sách media hiện tại
	currentMedia := postResp.Media

	// Nếu có file ảnh mới
	if len(files) > 0 {
		// Xóa toàn bộ media cũ trên Cloudinary
		for _, oldMedia := range currentMedia {
			if err := s.cloudinaryUploader.DeleteImage(oldMedia.MediaURL); err != nil {
				log.Printf("Failed to delete old image %s from Cloudinary: %v", oldMedia.MediaURL, err)
				// Tiếp tục xử lý dù có lỗi xóa Cloudinary, không return lỗi
			}
		}

		// Xóa toàn bộ media cũ trong database
		if err := s.repo.DeletePostMedia(id); err != nil {
			log.Printf("Failed to delete old media from database for post %d: %v", id, err)
			return nil, fmt.Errorf("failed to delete old media from database: %v", err)
		}

		// Upload ảnh mới lên Cloudinary
		urls, err := s.cloudinaryUploader.UploadImages(files)
		if err != nil {
			return nil, errors.New("failed to upload new images: " + err.Error())
		}
		for _, url := range urls {
			post.Media = append(post.Media, model.PostMedia{
				MediaURL:  url,
				MediaType: "IMAGE",
				CreatedAt: time.Now(),
			})
		}
	} else {
		// Nếu không có file mới, giữ nguyên media cũ hoặc dùng MediaURLs từ request
		if len(req.MediaURLs) > 0 {
			// Xóa media cũ trên Cloudinary nếu có MediaURLs mới
			for _, oldMedia := range currentMedia {
				if err := s.cloudinaryUploader.DeleteImage(oldMedia.MediaURL); err != nil {
					log.Printf("Failed to delete old image %s from Cloudinary: %v", oldMedia.MediaURL, err)
				}
			}

			// Xóa media cũ trong database
			if err := s.repo.DeletePostMedia(id); err != nil {
				log.Printf("Failed to delete old media from database for post %d: %v", id, err)
				return nil, fmt.Errorf("failed to delete old media from database: %v", err)
			}

			// Thêm MediaURLs mới
			for _, url := range req.MediaURLs {
				post.Media = append(post.Media, model.PostMedia{
					MediaURL:  url,
					MediaType: "IMAGE",
					CreatedAt: time.Now(),
				})
			}
		} else {
			// Không có file mới và không có MediaURLs, giữ nguyên media cũ
			post.Media = currentMedia
		}
	}

	// Cập nhật bài đăng trong database
	if err := s.repo.UpdatePost(post); err != nil {
		return nil, err
	}

	// Lấy lại bài đăng đã cập nhật
	resp, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Populate thông tin user
	result, err := util.PopulateSingleUserInfo(*resp, userID)
	if err != nil {
		log.Printf("Failed to populate user info: %v", err)
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

// CreateComment (cập nhật để hỗ trợ 1 ảnh)
func (s *postService) CreateComment(postID, userID uint64, content string, parentID *uint64, files []interface{}) (*model.Comment, error) {
	comment := &model.Comment{
		PostID:          postID,
		UserID:          userID,
		ParentCommentID: parentID,
		Content:         content,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Xử lý ảnh cho bình luận
	if len(files) > 0 {
		if len(files) > 1 {
			return nil, errors.New("maximum of 1 image allowed for comment")
		}
		urls, err := s.cloudinaryUploader.UploadImages(files)
		if err != nil {
			return nil, errors.New("failed to upload comment image: " + err.Error())
		}
		comment.MediaURL = &urls[0] // Chỉ lấy URL đầu tiên
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

// Các phương thức mới sử dụng UUID
func (s *postService) GetPostByUUID(uuid string) (*model.PostResponse, error) {
	post, err := s.repo.FindByUUID(uuid)
	if err != nil {
		return nil, err
	}
	result, err := util.PopulateSingleUserInfo(*post, post.UserID)
	if err != nil {
		return post, nil
	}
	return &result, nil
}

func (s *postService) UpdatePostByUUID(uuid string, userID uint64, req model.CreatePostRequest, files []interface{}) (*model.PostResponse, error) {
	// Tìm bài đăng hiện tại
	postResp, err := s.repo.FindByUUID(uuid)
	if err != nil {
		return nil, err
	}
	if postResp.UserID != userID {
		return nil, errors.New("forbidden")
	}

	// Tạo đối tượng post mới để cập nhật
	post := &model.Post{
		ID:         postResp.ID,
		UUID:       uuid,
		UserID:     postResp.UserID,
		Content:    req.Content,
		Visibility: req.Visibility,
		CreatedAt:  postResp.CreatedAt,
		UpdatedAt:  time.Now(),
		IsDeleted:  false,
	}

	// Lấy danh sách media hiện tại
	currentMedia := postResp.Media

	// Nếu có file ảnh mới
	if len(files) > 0 {
		// Xóa toàn bộ media cũ trên Cloudinary
		for _, oldMedia := range currentMedia {
			if err := s.cloudinaryUploader.DeleteImage(oldMedia.MediaURL); err != nil {
				log.Printf("Failed to delete old image %s from Cloudinary: %v", oldMedia.MediaURL, err)
				// Tiếp tục xử lý dù có lỗi xóa Cloudinary, không return lỗi
			}
		}

		// Xóa toàn bộ media cũ trong database
		if err := s.repo.DeletePostMedia(postResp.ID); err != nil {
			log.Printf("Failed to delete old media from database for post %s: %v", uuid, err)
			return nil, fmt.Errorf("failed to delete old media from database: %v", err)
		}

		// Upload ảnh mới lên Cloudinary
		urls, err := s.cloudinaryUploader.UploadImages(files)
		if err != nil {
			return nil, errors.New("failed to upload new images: " + err.Error())
		}
		for _, url := range urls {
			post.Media = append(post.Media, model.PostMedia{
				MediaURL:  url,
				MediaType: "IMAGE",
				CreatedAt: time.Now(),
			})
		}
	} else {
		// Nếu không có file mới, giữ nguyên media cũ hoặc dùng MediaURLs từ request
		if len(req.MediaURLs) > 0 {
			// Xóa media cũ trên Cloudinary nếu có MediaURLs mới
			for _, oldMedia := range currentMedia {
				if err := s.cloudinaryUploader.DeleteImage(oldMedia.MediaURL); err != nil {
					log.Printf("Failed to delete old image %s from Cloudinary: %v", oldMedia.MediaURL, err)
				}
			}

			// Xóa media cũ trong database
			if err := s.repo.DeletePostMedia(postResp.ID); err != nil {
				log.Printf("Failed to delete old media from database for post %s: %v", uuid, err)
				return nil, fmt.Errorf("failed to delete old media from database: %v", err)
			}

			// Thêm MediaURLs mới
			for _, url := range req.MediaURLs {
				post.Media = append(post.Media, model.PostMedia{
					MediaURL:  url,
					MediaType: "IMAGE",
					CreatedAt: time.Now(),
				})
			}
		} else {
			// Không có file mới và không có MediaURLs, giữ nguyên media cũ
			post.Media = currentMedia
		}
	}

	// Cập nhật bài đăng trong database
	if err := s.repo.UpdatePost(post); err != nil {
		return nil, err
	}

	// Lấy bài đăng đã cập nhật và trả về
	updatedPost, err := s.repo.FindByUUID(uuid)
	if err != nil {
		return nil, err
	}

	result, err := util.PopulateSingleUserInfo(*updatedPost, userID)
	if err != nil {
		log.Printf("Failed to populate user info: %v", err)
		return updatedPost, nil
	}

	return &result, nil
}

func (s *postService) DeletePostByUUID(uuid string, userID uint64) error {
	// Kiểm tra quyền
	post, err := s.repo.FindByUUID(uuid)
	if err != nil {
		return err
	}
	if post.UserID != userID {
		return errors.New("forbidden")
	}

	return s.repo.DeletePostByUUID(uuid)
}

func (s *postService) CreateCommentByUUID(uuid string, userID uint64, content string, parentID *uint64, files []interface{}) (*model.Comment, error) {
	// Tìm post theo UUID
	post, err := s.repo.FindByUUID(uuid)
	if err != nil {
		return nil, err
	}

	// Sử dụng ID nội bộ để tạo comment
	return s.CreateComment(post.ID, userID, content, parentID, files)
}

func (s *postService) GetCommentsByPostUUID(uuid string, limit, offset int) ([]model.Comment, int64, error) {
	comments, total, err := s.repo.FindCommentsByPostUUID(uuid, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	// Tương tự như GetCommentsByPostID, thêm thông tin user
	enrichedComments, err := util.PopulateCommentsUserInfo(comments)
	if err != nil {
		log.Printf("Failed to populate user info for comments: %v", err)
		return comments, total, nil
	}

	return enrichedComments, total, nil
}

func (s *postService) LikePostByUUID(uuid string, userID uint64) error {
	return s.repo.CreatePostLikeByUUID(uuid, userID)
}

func (s *postService) UnlikePostByUUID(uuid string, userID uint64) error {
	return s.repo.DeletePostLikeByUUID(uuid, userID)
}

func (s *postService) SharePostByUUID(uuid string, userID uint64, content string) (*model.PostShare, error) {
	// Kiểm tra xem post có tồn tại
	post, err := s.repo.FindByUUID(uuid)
	if err != nil {
		return nil, err
	}

	share := &model.PostShare{
		PostID:        post.ID,
		UserID:        userID,
		SharedContent: content,
		CreatedAt:     time.Now(),
	}

	if err := s.repo.CreateShare(share); err != nil {
		return nil, err
	}

	// Tìm share vừa tạo
	share.Author = &model.UserInfo{ID: userID}

	// Thêm thông tin user
	enrichedShare, err := util.PopulateSingleShareUserInfo(*share)
	if err != nil {
		log.Printf("Failed to populate user info for share: %v", err)
		return share, nil
	}

	return &enrichedShare, nil
}

func (s *postService) GetSharesByPostUUID(uuid string, limit, offset int) ([]model.PostShare, int64, error) {
	shares, total, err := s.repo.FindSharesByPostUUID(uuid, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	// Tương tự như GetSharesByPostID, thêm thông tin user
	enrichedShares, err := util.PopulateSharesUserInfo(shares)
	if err != nil {
		log.Printf("Failed to populate user info for shares: %v", err)
		return shares, total, nil
	}

	return enrichedShares, total, nil
}
