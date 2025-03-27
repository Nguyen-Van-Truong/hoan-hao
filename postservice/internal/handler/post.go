package handler

import (
	"errors"
	"log"
	"mime/multipart"
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

	// Route công khai - Chuyển sang sử dụng UUID
	r.GET("/post/:uuid", GetPostByUUID(svc))
	r.GET("/post/:uuid/comments", GetCommentsByUUID(svc))
	r.GET("/post/:uuid/shares", GetSharesByUUID(svc))
	r.GET("/post/user/:user_id/posts", GetUserPosts(svc))

	// Giữ các route legacy tương thích ngược nếu cần
	r.GET("/post/id/:id", GetPostByID(svc))
	r.GET("/post/id/:id/comments", GetComments(svc))
	r.GET("/post/id/:id/shares", GetShares(svc))

	// Nhóm route yêu cầu xác thực JWT
	postGroup := r.Group("/post")
	postGroup.Use(JWTMiddleware())
	{
		postGroup.POST("", CreatePost(svc))
		postGroup.PUT("/:uuid", UpdatePostByUUID(svc))
		postGroup.DELETE("/:uuid", DeletePostByUUID(svc))
		postGroup.POST("/:uuid/comment", CreateCommentByUUID(svc))
		postGroup.POST("/:uuid/like", LikePostByUUID(svc))
		postGroup.DELETE("/:uuid/like", UnlikePostByUUID(svc))
		postGroup.POST("/:uuid/share", SharePostByUUID(svc))
		postGroup.GET("/feed", GetFeed(svc))

		// Giữ các route legacy tương thích ngược
		postGroup.PUT("/id/:id", UpdatePost(svc))
		postGroup.DELETE("/id/:id", DeletePost(svc))
		postGroup.POST("/id/:id/comment", CreateComment(svc))
		postGroup.POST("/id/:id/like", LikePost(svc))
		postGroup.DELETE("/id/:id/like", UnlikePost(svc))
		postGroup.POST("/id/:id/share", SharePost(svc))
	}

	commentGroup := r.Group("/comment")
	commentGroup.Use(JWTMiddleware())
	{
		commentGroup.POST("/:id/reply", ReplyComment(svc))
		commentGroup.PUT("/:id", UpdateComment(svc))
		commentGroup.DELETE("/:id", DeleteComment(svc))
		commentGroup.POST("/:id/like", LikeComment(svc))
		commentGroup.DELETE("/:id/like", UnlikeComment(svc))
	}
}

// Các handler mới sử dụng UUID
func GetPostByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		post, err := svc.GetPostByUUID(uuid)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}

		c.JSON(http.StatusOK, post)
	}
}

func UpdatePostByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		// Lấy dữ liệu từ multipart/form-data
		form, err := c.MultipartForm()
		if err != nil {
			log.Printf("Failed to parse multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
			return
		}

		// Lấy content và visibility từ form
		content := form.Value["content"]
		if len(content) == 0 || content[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		visibility := form.Value["visibility"]
		if len(visibility) == 0 || visibility[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Visibility is required"})
			return
		}

		req := model.CreatePostRequest{
			Content:    content[0],
			Visibility: visibility[0],
		}

		// Lấy media_urls nếu có
		if mediaURLs, exists := form.Value["media_urls"]; exists {
			req.MediaURLs = mediaURLs
		}

		// Lấy files từ form
		var files []interface{}
		fileHeaders, exists := form.File["images"]
		if exists {
			log.Printf("Received %d files", len(fileHeaders))
			for i, fh := range fileHeaders {
				file, err := fh.Open()
				if err != nil {
					log.Printf("Failed to open file %s: %v", fh.Filename, err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file " + fh.Filename + ": " + err.Error()})
					return
				}
				defer func(file multipart.File) {
					err := file.Close()
					if err != nil {
						log.Printf("Failed to close file %s: %v", fh.Filename, err)
					}
				}(file)
				log.Printf("File %d: %s, size: %d bytes", i, fh.Filename, fh.Size)
				files = append(files, file)
			}
		}

		// Gọi service để cập nhật post
		post, err := svc.UpdatePostByUUID(uuid, userID, req, files)
		if err != nil {
			log.Printf("Failed to update post: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, post)
	}
}

func DeletePostByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		if err := svc.DeletePostByUUID(uuid, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
	}
}

func CreateCommentByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		// Parse form
		form, err := c.MultipartForm()
		if err != nil {
			log.Printf("Failed to parse multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
			return
		}

		// Get content from form
		content := form.Value["content"]
		if len(content) == 0 || content[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		// Get parent_id from form if present
		var parentID *uint64
		if parentIDStr, ok := form.Value["parent_id"]; ok && len(parentIDStr) > 0 && parentIDStr[0] != "" {
			pid, err := strconv.ParseUint(parentIDStr[0], 10, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parent comment ID"})
				return
			}
			parentID = &pid
		}

		// Get files
		var files []interface{}
		fileHeaders, exists := form.File["image"]
		if exists && len(fileHeaders) > 0 {
			file, err := fileHeaders[0].Open()
			if err != nil {
				log.Printf("Failed to open file %s: %v", fileHeaders[0].Filename, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file " + fileHeaders[0].Filename + ": " + err.Error()})
				return
			}
			defer func(file multipart.File) {
				err := file.Close()
				if err != nil {
					log.Printf("Failed to close file %s: %v", fileHeaders[0].Filename, err)
				}
			}(file)
			files = append(files, file)
		}

		comment, err := svc.CreateCommentByUUID(uuid, userID, content[0], parentID, files)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, comment)
	}
}

func GetCommentsByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

		comments, total, err := svc.GetCommentsByPostUUID(uuid, limit, offset)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Failed to get comments: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"limit":    limit,
			"offset":   offset,
			"comments": comments,
			"total":    total,
		})
	}
}

func LikePostByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		if err := svc.LikePostByUUID(uuid, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like post: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Post liked"})
	}
}

func UnlikePostByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		if err := svc.UnlikePostByUUID(uuid, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike post: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Post unliked"})
	}
}

func SharePostByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		var req struct {
			Content string `json:"content"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		share, err := svc.SharePostByUUID(uuid, userID, req.Content)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to share post: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, share)
	}
}

func GetSharesByUUID(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uuid := c.Param("uuid")
		if uuid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post UUID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

		shares, total, err := svc.GetSharesByPostUUID(uuid, limit, offset)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Failed to get shares: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"limit":  limit,
			"offset": offset,
			"shares": shares,
			"total":  total,
		})
	}
}

// Giữ lại các handler cũ để tương thích ngược
// ... existing code ...

func getUserID(c *gin.Context) (uint64, error) {
	userIDInterface, exists := c.Get("userId")
	if !exists {
		return 0, errors.New("user ID not found in context")
	}

	switch v := userIDInterface.(type) {
	case uint:
		return uint64(v), nil
	case uint64:
		return v, nil
	case int:
		return uint64(v), nil
	case float64:
		return uint64(v), nil
	default:
		return 0, errors.New("invalid user ID type")
	}
}

// Handler legacy
func CreatePost(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Lấy dữ liệu từ multipart/form-data
		form, err := c.MultipartForm()
		if err != nil {
			log.Printf("Failed to parse multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
			return
		}

		// Lấy content và visibility từ form
		content := form.Value["content"]
		if len(content) == 0 || content[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		visibility := form.Value["visibility"]
		if len(visibility) == 0 || visibility[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Visibility is required"})
			return
		}

		req := model.CreatePostRequest{
			Content:    content[0],
			Visibility: visibility[0],
		}

		// Lấy files từ form
		var files []interface{}
		fileHeaders, exists := form.File["images"]
		if exists {
			log.Printf("Received %d files", len(fileHeaders))
			for i, fh := range fileHeaders {
				file, err := fh.Open()
				if err != nil {
					log.Printf("Failed to open file %s: %v", fh.Filename, err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file " + fh.Filename + ": " + err.Error()})
					return
				}
				defer func(file multipart.File) {
					err := file.Close()
					if err != nil {
						log.Printf("Failed to close file %s: %v", fh.Filename, err)
					}
				}(file)
				log.Printf("File %d: %s, size: %d bytes", i, fh.Filename, fh.Size)
				files = append(files, file)
			}
		} else {
			log.Println("No files received in request")
		}

		// Gọi service để tạo post
		post, err := svc.CreatePost(userID, req, files)
		if err != nil {
			log.Printf("Failed to create post: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, post)
	}
}

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

		// Lấy dữ liệu từ multipart/form-data
		form, err := c.MultipartForm()
		if err != nil {
			log.Printf("Failed to parse multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
			return
		}

		// Lấy content và visibility từ form
		content := form.Value["content"]
		if len(content) == 0 || content[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		visibility := form.Value["visibility"]
		if len(visibility) == 0 || visibility[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Visibility is required"})
			return
		}

		req := model.CreatePostRequest{
			Content:    content[0],
			Visibility: visibility[0],
		}

		// Lấy media_urls nếu có
		if mediaURLs, exists := form.Value["media_urls"]; exists {
			req.MediaURLs = mediaURLs
		}

		// Lấy files từ form
		var files []interface{}
		fileHeaders, exists := form.File["images"]
		if exists {
			log.Printf("Received %d files", len(fileHeaders))
			for i, fh := range fileHeaders {
				file, err := fh.Open()
				if err != nil {
					log.Printf("Failed to open file %s: %v", fh.Filename, err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file " + fh.Filename + ": " + err.Error()})
					return
				}
				defer func(file multipart.File) {
					err := file.Close()
					if err != nil {
						log.Printf("Failed to close file %s: %v", fh.Filename, err)
					}
				}(file)
				log.Printf("File %d: %s, size: %d bytes", i, fh.Filename, fh.Size)
				files = append(files, file)
			}
		}

		// Gọi service để cập nhật post
		post, err := svc.UpdatePost(postID, userID, req, files)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, post)
	}
}

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

		if err := svc.DeletePost(postID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
	}
}

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

		// Parse form
		form, err := c.MultipartForm()
		if err != nil {
			log.Printf("Failed to parse multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
			return
		}

		// Get content from form
		content := form.Value["content"]
		if len(content) == 0 || content[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		// Get parent_id from form if present
		var parentID *uint64
		if parentIDStr, ok := form.Value["parent_id"]; ok && len(parentIDStr) > 0 && parentIDStr[0] != "" {
			pid, err := strconv.ParseUint(parentIDStr[0], 10, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parent comment ID"})
				return
			}
			parentID = &pid
		}

		// Get files
		var files []interface{}
		fileHeaders, exists := form.File["image"]
		if exists && len(fileHeaders) > 0 {
			file, err := fileHeaders[0].Open()
			if err != nil {
				log.Printf("Failed to open file %s: %v", fileHeaders[0].Filename, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file " + fileHeaders[0].Filename + ": " + err.Error()})
				return
			}
			defer func(file multipart.File) {
				err := file.Close()
				if err != nil {
					log.Printf("Failed to close file %s: %v", fileHeaders[0].Filename, err)
				}
			}(file)
			files = append(files, file)
		}

		comment, err := svc.CreateComment(postID, userID, content[0], parentID, files)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, comment)
	}
}

func GetComments(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

		comments, total, err := svc.GetCommentsByPostID(postID, limit, offset)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Failed to get comments: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"limit":    limit,
			"offset":   offset,
			"comments": comments,
			"total":    total,
		})
	}
}

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

		if err := svc.LikePost(postID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like post: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Post liked"})
	}
}

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

		if err := svc.UnlikePost(postID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike post: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Post unliked"})
	}
}

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

		var req struct {
			Content string `json:"content"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		share, err := svc.SharePost(postID, userID, req.Content)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to share post: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, share)
	}
}

func GetShares(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

		shares, total, err := svc.GetSharesByPostID(postID, limit, offset)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Failed to get shares: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"limit":  limit,
			"offset": offset,
			"shares": shares,
			"total":  total,
		})
	}
}

func GetUserPosts(svc service.PostService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.ParseUint(c.Param("user_id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

		posts, total, err := svc.GetPostsByUserID(userID, limit, offset)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Failed to get user posts: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"limit":  limit,
			"offset": offset,
			"posts":  posts,
			"total":  total,
		})
	}
}

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

		posts, total, err := svc.GetFeed(userID, mode, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch feed: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"limit":  limit,
			"offset": offset,
			"posts":  posts,
			"total":  total,
		})
	}
}

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

		// Get parent comment to find post ID
		parent, err := svc.GetCommentByID(parentID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Parent comment not found"})
			return
		}

		// Parse form
		form, err := c.MultipartForm()
		if err != nil {
			log.Printf("Failed to parse multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
			return
		}

		// Get content from form
		content := form.Value["content"]
		if len(content) == 0 || content[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		// Get files
		var files []interface{}
		fileHeaders, exists := form.File["image"]
		if exists && len(fileHeaders) > 0 {
			file, err := fileHeaders[0].Open()
			if err != nil {
				log.Printf("Failed to open file %s: %v", fileHeaders[0].Filename, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file " + fileHeaders[0].Filename + ": " + err.Error()})
				return
			}
			defer func(file multipart.File) {
				err := file.Close()
				if err != nil {
					log.Printf("Failed to close file %s: %v", fileHeaders[0].Filename, err)
				}
			}(file)
			files = append(files, file)
		}

		comment, err := svc.CreateComment(parent.PostID, userID, content[0], &parentID, files)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, comment)
	}
}

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

		var req struct {
			Content string `json:"content" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		comment, err := svc.UpdateComment(commentID, userID, req.Content)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update comment: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, comment)
	}
}

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

		if err := svc.DeleteComment(commentID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
	}
}

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

		if err := svc.LikeComment(commentID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like comment: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Comment liked"})
	}
}

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

		if err := svc.UnlikeComment(commentID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike comment: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Comment unliked"})
	}
}
