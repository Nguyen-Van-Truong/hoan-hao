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

	// Route công khai
	r.GET("/post/:id", GetPostByID(svc))
	r.GET("/post/:id/comments", GetComments(svc))
	r.GET("/post/:id/shares", GetShares(svc))
	r.GET("/post/user/:user_id/posts", GetUserPosts(svc))

	// Nhóm route yêu cầu xác thực JWT
	postGroup := r.Group("/post")
	postGroup.Use(JWTMiddleware())
	{
		postGroup.POST("", CreatePost(svc))
		postGroup.PUT("/:id", UpdatePost(svc))
		postGroup.DELETE("/:id", DeletePost(svc))
		postGroup.POST("/:id/comment", CreateComment(svc))
		postGroup.POST("/:id/like", LikePost(svc))
		postGroup.DELETE("/:id/like", UnlikePost(svc))
		postGroup.POST("/:id/share", SharePost(svc))
		postGroup.GET("/feed", GetFeed(svc))
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

// CreatePost tạo bài đăng mới
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

// Các handler khác giữ nguyên
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
		} else {
			log.Println("No files received in request")
		}

		// Gọi service để cập nhật post
		post, err := svc.UpdatePost(postID, userID, req, files)
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

// CreateComment (cập nhật để hỗ trợ 1 ảnh)
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

		// Lấy dữ liệu từ multipart/form-data
		form, err := c.MultipartForm()
		if err != nil {
			log.Printf("Failed to parse multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
			return
		}

		content := form.Value["content"]
		if len(content) == 0 || content[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		var files []interface{}
		fileHeaders, exists := form.File["image"]
		if exists {
			log.Printf("Received %d files for comment", len(fileHeaders))
			if len(fileHeaders) > 1 { // Giới hạn 1 ảnh
				c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum of 1 image allowed for comment"})
				return
			}
			fh := fileHeaders[0]
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
			log.Printf("Comment file: %s, size: %d bytes", fh.Filename, fh.Size)
			files = append(files, file)
		}

		comment, err := svc.CreateComment(postID, userID, content[0], nil, files)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, comment)
	}
}

// ReplyComment (cập nhật để hỗ trợ 1 ảnh)
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

		// Lấy dữ liệu từ multipart/form-data
		form, err := c.MultipartForm()
		if err != nil {
			log.Printf("Failed to parse multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
			return
		}

		content := form.Value["content"]
		if len(content) == 0 || content[0] == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
			return
		}

		var files []interface{}
		fileHeaders, exists := form.File["image"]
		if exists {
			log.Printf("Received %d files for reply", len(fileHeaders))
			if len(fileHeaders) > 1 { // Giới hạn 1 ảnh
				c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum of 1 image allowed for reply"})
				return
			}
			fh := fileHeaders[0]
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
			log.Printf("Reply file: %s, size: %d bytes", fh.Filename, fh.Size)
			files = append(files, file)
		}

		parent, err := svc.GetCommentByID(parentID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Parent comment not found"})
			return
		}

		comment, err := svc.CreateComment(parent.PostID, userID, content[0], &parentID, files)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply: " + err.Error()})
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
