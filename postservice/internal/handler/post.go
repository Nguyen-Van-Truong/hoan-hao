// postservice/internal/handler/post.go
package handler

import (
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

	// Nhóm route yêu cầu xác thực JWT
	authGroup := r.Group("/post")
	authGroup.Use(JWTMiddleware()) // Sử dụng middleware từ cùng package
	{
		authGroup.POST("", CreatePost(svc)) // API tạo bài đăng
	}

	// Route công khai để xem chi tiết bài đăng
	r.GET("/post/:id", GetPostByID(svc))
}

// GetPostByID lấy thông tin chi tiết của một bài đăng
func GetPostByID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		postID, err := strconv.ParseUint(c.Param("id"), 10, 64) // Parse sang uint64 thay vì 32-bit
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		post, err := svc.GetPostByID(postID) // Truyền postID kiểu uint64
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
		userIDInterface, exists := c.Get("userId")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID type"})
			return
		}

		var req model.CreatePostRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
			return
		}

		post, err := svc.CreatePost(userID, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, post)
	}
}
