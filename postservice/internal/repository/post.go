package repository

import (
	"time"

	"postservice/internal/model"

	"github.com/jinzhu/gorm"
)

type PostRepository interface {
	FindByID(id uint64) (*model.PostResponse, error)
	FindByUUID(uuid string) (*model.PostResponse, error)
	CreatePost(post *model.Post) error
	UpdatePost(post *model.Post) error
	DeletePost(id uint64) error
	DeletePostByUUID(uuid string) error
	DeletePostMedia(postID uint64) error
	CreateComment(comment *model.Comment) error
	FindCommentsByPostID(postID uint64, limit, offset int) ([]model.Comment, int64, error)
	FindCommentsByPostUUID(uuid string, limit, offset int) ([]model.Comment, int64, error)
	FindCommentByID(id uint64, comment *model.Comment) error
	UpdateComment(comment *model.Comment) error
	DeleteComment(id uint64) error
	CreatePostLike(postID, userID uint64) error
	CreatePostLikeByUUID(uuid string, userID uint64) error
	DeletePostLike(postID, userID uint64) error
	DeletePostLikeByUUID(uuid string, userID uint64) error
	CreateCommentLike(commentID, userID uint64) error
	DeleteCommentLike(commentID, userID uint64) error
	CreateShare(share *model.PostShare) error
	CreateShareByUUID(uuid string, userID uint64, sharedContent string) error
	FindSharesByPostID(postID uint64, limit, offset int) ([]model.PostShare, int64, error)
	FindSharesByPostUUID(uuid string, limit, offset int) ([]model.PostShare, int64, error)
	FindPostsByUserID(userID uint64, limit, offset int) ([]model.PostResponse, int64, error)
	FindFeed(userID uint64, mode string, limit, offset int) ([]model.PostResponse, int64, error)
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) FindByID(id uint64) (*model.PostResponse, error) {
	var post model.Post
	if err := r.db.Preload("Media").Where("id = ? AND is_deleted = false", id).First(&post).Error; err != nil {
		return nil, err
	}

	var totalLikes, totalComments, totalShares int64
	r.db.Model(&model.PostLike{}).Where("post_id = ?", id).Count(&totalLikes)
	r.db.Model(&model.Comment{}).Where("post_id = ? AND is_deleted = false", id).Count(&totalComments)
	r.db.Model(&model.PostShare{}).Where("post_id = ?", id).Count(&totalShares)

	postResponse := &model.PostResponse{
		ID:            post.ID,
		UUID:          post.UUID,
		UserID:        post.UserID,
		Content:       post.Content,
		Visibility:    post.Visibility,
		CreatedAt:     post.CreatedAt,
		UpdatedAt:     post.UpdatedAt,
		Media:         post.Media,
		TotalLikes:    int(totalLikes),
		TotalComments: int(totalComments),
		TotalShares:   int(totalShares),
	}

	return postResponse, nil
}

func (r *postRepository) FindByUUID(uuid string) (*model.PostResponse, error) {
	var post model.Post
	if err := r.db.Preload("Media").Where("uuid = ? AND is_deleted = false", uuid).First(&post).Error; err != nil {
		return nil, err
	}

	var totalLikes, totalComments, totalShares int64
	r.db.Model(&model.PostLike{}).Where("post_id = ?", post.ID).Count(&totalLikes)
	r.db.Model(&model.Comment{}).Where("post_id = ? AND is_deleted = false", post.ID).Count(&totalComments)
	r.db.Model(&model.PostShare{}).Where("post_id = ?", post.ID).Count(&totalShares)

	postResponse := &model.PostResponse{
		ID:            post.ID,
		UUID:          post.UUID,
		UserID:        post.UserID,
		Content:       post.Content,
		Visibility:    post.Visibility,
		CreatedAt:     post.CreatedAt,
		UpdatedAt:     post.UpdatedAt,
		Media:         post.Media,
		TotalLikes:    int(totalLikes),
		TotalComments: int(totalComments),
		TotalShares:   int(totalShares),
	}

	return postResponse, nil
}

func (r *postRepository) FindFeed(userID uint64, mode string, limit, offset int) ([]model.PostResponse, int64, error) {
	var posts []model.Post
	var total int64

	// Truy vấn tất cả bài đăng không bị xóa
	query := r.db.Preload("Media").Where("is_deleted = false")

	if err := query.Model(&model.Post{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Áp dụng các bộ lọc dựa trên mode
	switch mode {
	case "newest":
		// Sắp xếp theo thời gian tạo mới nhất (giống latest)
		query = query.Order("created_at DESC")
	case "popular_today":
		// Lấy bài đăng trong ngày hôm nay và sắp xếp theo độ phổ biến
		today := time.Now().Truncate(24 * time.Hour)
		query = query.Where("created_at >= ?", today)
		query = query.Order("created_at DESC") // Sắp xếp tạm thời, sẽ sắp xếp lại theo điểm số phổ biến
	case "popular_week":
		// Lấy bài đăng trong tuần và sắp xếp theo độ phổ biến
		weekAgo := time.Now().Add(-7 * 24 * time.Hour)
		query = query.Where("created_at >= ?", weekAgo)
		query = query.Order("created_at DESC") // Sắp xếp tạm thời
	case "popular_month":
		// Lấy bài đăng trong tháng và sắp xếp theo độ phổ biến
		monthAgo := time.Now().Add(-30 * 24 * time.Hour)
		query = query.Where("created_at >= ?", monthAgo)
		query = query.Order("created_at DESC") // Sắp xếp tạm thời
	case "popular_year":
		// Lấy bài đăng trong năm và sắp xếp theo độ phổ biến
		yearAgo := time.Now().Add(-365 * 24 * time.Hour)
		query = query.Where("created_at >= ?", yearAgo)
		query = query.Order("created_at DESC") // Sắp xếp tạm thời
	case "popular":
		// Lấy tất cả bài đăng và sắp xếp theo độ phổ biến
		query = query.Order("created_at DESC") // Sắp xếp tạm thời
	default:
		// Mặc định sắp xếp theo thời gian tạo mới nhất (legacy/latest)
		query = query.Order("created_at DESC")
	}

	if err := query.Limit(limit).Offset(offset).Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	// Chuyển đổi sang PostResponse
	var postResponses []model.PostResponse
	for _, post := range posts {
		var totalLikes, totalComments, totalShares int64
		r.db.Model(&model.PostLike{}).Where("post_id = ?", post.ID).Count(&totalLikes)
		r.db.Model(&model.Comment{}).Where("post_id = ? AND is_deleted = false", post.ID).Count(&totalComments)
		r.db.Model(&model.PostShare{}).Where("post_id = ?", post.ID).Count(&totalShares)

		postResponses = append(postResponses, model.PostResponse{
			ID:            post.ID,
			UUID:          post.UUID,
			UserID:        post.UserID,
			Content:       post.Content,
			Visibility:    post.Visibility,
			CreatedAt:     post.CreatedAt,
			UpdatedAt:     post.UpdatedAt,
			Media:         post.Media,
			TotalLikes:    int(totalLikes),
			TotalComments: int(totalComments),
			TotalShares:   int(totalShares),
		})
	}

	// Sắp xếp theo mức độ phổ biến cho các chế độ popular
	if mode == "popular" || mode == "popular_today" || mode == "popular_week" || mode == "popular_month" || mode == "popular_year" {
		for i := 0; i < len(postResponses)-1; i++ {
			for j := i + 1; j < len(postResponses); j++ {
				scoreI := postResponses[i].TotalLikes + postResponses[i].TotalComments*2 + postResponses[i].TotalShares*3
				scoreJ := postResponses[j].TotalLikes + postResponses[j].TotalComments*2 + postResponses[j].TotalShares*3
				if scoreI < scoreJ {
					postResponses[i], postResponses[j] = postResponses[j], postResponses[i]
				}
			}
		}
	}

	return postResponses, total, nil
}

// Các hàm khác giữ nguyên
func (r *postRepository) CreatePost(post *model.Post) error {
	return r.db.Create(post).Error
}

func (r *postRepository) UpdatePost(post *model.Post) error {
	return r.db.Save(post).Error
}

func (r *postRepository) DeletePost(id uint64) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).Update("is_deleted", true).Error
}

func (r *postRepository) DeletePostMedia(postID uint64) error {
	result := r.db.Where("post_id = ?", postID).Delete(&model.PostMedia{})
	if result.Error != nil {
		return result.Error
	}
	return nil
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

func (r *postRepository) FindPostsByUserID(userID uint64, limit, offset int) ([]model.PostResponse, int64, error) {
	var posts []model.Post
	var total int64

	if err := r.db.Model(&model.Post{}).Where("user_id = ? AND is_deleted = false", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.Preload("Media").Where("user_id = ? AND is_deleted = false", userID).
		Order("created_at DESC").Limit(limit).Offset(offset).Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	var postResponses []model.PostResponse
	for _, post := range posts {
		var totalLikes, totalComments, totalShares int64
		r.db.Model(&model.PostLike{}).Where("post_id = ?", post.ID).Count(&totalLikes)
		r.db.Model(&model.Comment{}).Where("post_id = ? AND is_deleted = false", post.ID).Count(&totalComments)
		r.db.Model(&model.PostShare{}).Where("post_id = ?", post.ID).Count(&totalShares)

		postResponses = append(postResponses, model.PostResponse{
			ID:            post.ID,
			UUID:          post.UUID,
			UserID:        post.UserID,
			Content:       post.Content,
			Visibility:    post.Visibility,
			CreatedAt:     post.CreatedAt,
			UpdatedAt:     post.UpdatedAt,
			Media:         post.Media,
			TotalLikes:    int(totalLikes),
			TotalComments: int(totalComments),
			TotalShares:   int(totalShares),
		})
	}

	return postResponses, total, nil
}

// Triển khai các phương thức mới
func (r *postRepository) DeletePostByUUID(uuid string) error {
	var post model.Post
	if err := r.db.Where("uuid = ?", uuid).First(&post).Error; err != nil {
		return err
	}
	return r.db.Model(&model.Post{}).Where("uuid = ?", uuid).Update("is_deleted", true).Error
}

func (r *postRepository) FindCommentsByPostUUID(uuid string, limit, offset int) ([]model.Comment, int64, error) {
	var post model.Post
	if err := r.db.Where("uuid = ? AND is_deleted = false", uuid).First(&post).Error; err != nil {
		return nil, 0, err
	}
	return r.FindCommentsByPostID(post.ID, limit, offset)
}

func (r *postRepository) CreatePostLikeByUUID(uuid string, userID uint64) error {
	var post model.Post
	if err := r.db.Where("uuid = ? AND is_deleted = false", uuid).First(&post).Error; err != nil {
		return err
	}
	return r.CreatePostLike(post.ID, userID)
}

func (r *postRepository) DeletePostLikeByUUID(uuid string, userID uint64) error {
	var post model.Post
	if err := r.db.Where("uuid = ? AND is_deleted = false", uuid).First(&post).Error; err != nil {
		return err
	}
	return r.DeletePostLike(post.ID, userID)
}

func (r *postRepository) CreateShareByUUID(uuid string, userID uint64, sharedContent string) error {
	var post model.Post
	if err := r.db.Where("uuid = ? AND is_deleted = false", uuid).First(&post).Error; err != nil {
		return err
	}
	share := &model.PostShare{
		PostID:        post.ID,
		UserID:        userID,
		SharedContent: sharedContent,
		CreatedAt:     time.Now(),
	}
	return r.db.Create(share).Error
}

func (r *postRepository) FindSharesByPostUUID(uuid string, limit, offset int) ([]model.PostShare, int64, error) {
	var post model.Post
	if err := r.db.Where("uuid = ? AND is_deleted = false", uuid).First(&post).Error; err != nil {
		return nil, 0, err
	}
	return r.FindSharesByPostID(post.ID, limit, offset)
}
