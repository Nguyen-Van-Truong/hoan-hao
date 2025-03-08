package handler

import (
	"errors"
	"net/http"
	"postservice/internal/model"
	"postservice/internal/repository"
	"postservice/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SetupRoutes đăng ký các route cho Gin
func SetupRoutes(r *gin.Engine, repo repository.PostRepository) {
	svc := service.NewPostService(repo)

	// Route công khai
	r.GET("/post/:id", GetPostByID(svc))                  // Xem chi tiết bài đăng
	r.GET("/post/:id/comments", GetComments(svc))         // Lấy danh sách bình luận
	r.GET("/post/:id/shares", GetShares(svc))             // Lấy danh sách chia sẻ
	r.GET("/post/user/:user_id/posts", GetUserPosts(svc)) // Lấy danh sách bài đăng của người dùng

	// Nhóm route yêu cầu xác thực JWT
	postGroup := r.Group("/post")
	postGroup.Use(JWTMiddleware())
	{
		postGroup.POST("", CreatePost(svc))                // Tạo bài đăng mới
		postGroup.PUT("/:id", UpdatePost(svc))             // Cập nhật bài đăng
		postGroup.DELETE("/:id", DeletePost(svc))          // Xóa bài đăng
		postGroup.POST("/:id/comment", CreateComment(svc)) // Thêm bình luận
		postGroup.POST("/:id/like", LikePost(svc))         // Thích bài đăng
		postGroup.DELETE("/:id/like", UnlikePost(svc))     // Bỏ thích bài đăng
		postGroup.POST("/:id/share", SharePost(svc))       // Chia sẻ bài đăng
		postGroup.GET("/feed", GetFeed(svc))               // Lấy feed (thay vì /api/feed)
	}

	commentGroup := r.Group("/comment")
	commentGroup.Use(JWTMiddleware())
	{
		commentGroup.POST("/:id/reply", ReplyComment(svc))   // Thêm bình luận trả lời
		commentGroup.PUT("/:id", UpdateComment(svc))         // Cập nhật bình luận
		commentGroup.DELETE("/:id", DeleteComment(svc))      // Xóa bình luận
		commentGroup.POST("/:id/like", LikeComment(svc))     // Thích bình luận
		commentGroup.DELETE("/:id/like", UnlikeComment(svc)) // Bỏ thích bình luận
	}
}

// GetPostByID lấy thông tin chi tiết của một bài đăng
func GetPostByID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		post, err := svc.GetPostByID(postID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}

		c.JSON(http.StatusOK, post)
	}
}

// CreatePost tạo bài đăng mới
func CreatePost(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		var req model.CreatePostRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
			return
		}

		post, err := svc.CreatePost(uint(userID), req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, post)
	}
}

// UpdatePost cập nhật bài đăng
func UpdatePost(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		var req model.CreatePostRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
			return
		}

		post, err := svc.UpdatePost(postID, userID, req)
		if err != nil {
			if err.Error() == "forbidden" {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to update this post"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post: " + err.Error()})
			}
			return
		}

		c.JSON(http.StatusOK, post)
	}
}

// DeletePost xóa bài đăng (soft delete)
func DeletePost(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		err = svc.DeletePost(postID, userID)
		if err != nil {
			if err.Error() == "forbidden" {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to delete this post"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post: " + err.Error()})
			}
			return
		}

		c.Status(http.StatusNoContent)
	}
}

// CreateComment thêm bình luận vào bài đăng
func CreateComment(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		content := c.PostForm("content")
		if content == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		comment, err := svc.CreateComment(postID, userID, content, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, comment)
	}
}

// ReplyComment thêm bình luận trả lời
func ReplyComment(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		parentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parent comment ID"})
			return
		}

		content := c.PostForm("content")
		if content == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		parent, err := svc.GetCommentByID(parentID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Parent comment not found"})
			return
		}

		comment, err := svc.CreateComment(parent.PostID, userID, content, &parentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, comment)
	}
}

// GetComments lấy danh sách bình luận của bài đăng
func GetComments(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
		if limit < 1 {
			limit = 10
		}
		if offset < 0 {
			offset = 0
		}

		comments, total, err := svc.GetCommentsByPostID(postID, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"comments": comments,
			"total":    total,
			"limit":    limit,
			"offset":   offset,
		})
	}
}

// UpdateComment cập nhật bình luận
func UpdateComment(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
			return
		}

		content := c.PostForm("content")
		if content == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		comment, err := svc.UpdateComment(commentID, userID, content)
		if err != nil {
			if err.Error() == "forbidden" {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to update this comment"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update comment: " + err.Error()})
			}
			return
		}

		c.JSON(http.StatusOK, comment)
	}
}

// DeleteComment xóa bình luận (soft delete)
func DeleteComment(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
			return
		}

		err = svc.DeleteComment(commentID, userID)
		if err != nil {
			if err.Error() == "forbidden" {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to delete this comment"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment: " + err.Error()})
			}
			return
		}

		c.Status(http.StatusNoContent)
	}
}

// LikePost thích bài đăng
func LikePost(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		err = svc.LikePost(postID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like post: " + err.Error()})
			return
		}

		c.Status(http.StatusCreated)
	}
}

// UnlikePost bỏ thích bài đăng
func UnlikePost(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		err = svc.UnlikePost(postID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike post: " + err.Error()})
			return
		}

		c.Status(http.StatusNoContent)
	}
}

// LikeComment thích bình luận
func LikeComment(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
			return
		}

		err = svc.LikeComment(commentID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like comment: " + err.Error()})
			return
		}

		c.Status(http.StatusCreated)
	}
}

// UnlikeComment bỏ thích bình luận
func UnlikeComment(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
			return
		}

		err = svc.UnlikeComment(commentID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike comment: " + err.Error()})
			return
		}

		c.Status(http.StatusNoContent)
	}
}

// SharePost chia sẻ bài đăng
func SharePost(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		content := c.PostForm("shared_content")
		share, err := svc.SharePost(postID, userID, content)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to share post: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, share)
	}
}

// GetShares lấy danh sách chia sẻ của bài đăng
func GetShares(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
		if limit < 1 {
			limit = 10
		}
		if offset < 0 {
			offset = 0
		}

		shares, total, err := svc.GetSharesByPostID(postID, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch shares: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"shares": shares,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		})
	}
}

// GetUserPosts lấy danh sách bài đăng của người dùng
func GetUserPosts(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.ParseUint(c.Param("user_id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
		if limit < 1 {
			limit = 10
		}
		if offset < 0 {
			offset = 0
		}

		posts, total, err := svc.GetPostsByUserID(userID, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"posts":  posts,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		})
	}
}

// GetFeed lấy danh sách bài đăng cho trang chủ
func GetFeed(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		mode := c.DefaultQuery("mode", "latest")
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
		if limit < 1 {
			limit = 10
		}
		if offset < 0 {
			offset = 0
		}

		posts, total, err := svc.GetFeed(userID, mode, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch feed: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"posts":  posts,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		})
	}
}

// getUserID trích xuất userID từ context
func getUserID(c *gin.Context) (uint64, error) {
	userIDInterface, exists := c.Get("userId")
	if !exists {
		return 0, errors.New("user ID not found in context")
	}

	userID, ok := userIDInterface.(uint)
	if !ok {
		return 0, errors.New("invalid user ID type")
	}

	return uint64(userID), nil
}
