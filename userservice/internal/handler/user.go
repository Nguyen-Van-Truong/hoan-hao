// userservice/internal/handler/user.go
package handler

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"userservice/internal/model"
	"userservice/internal/repository"
	"userservice/internal/service"

	"github.com/gin-gonic/gin"
)

// SetupRoutes đăng ký các route cho Gin với middleware
func SetupRoutes(r *gin.Engine, repo repository.UserRepository) {
	svc := service.NewUserService(repo)

	// Áp dụng JWTMiddleware cho tất cả route, nhưng không chặn nếu không có token
	r.Use(JWTMiddleware())

	// Endpoint nội bộ không yêu cầu xác thực
	r.POST("/user/createProfile", createProfile(svc))

	// Nhóm route yêu cầu xác thực JWT bắt buộc
	authGroup := r.Group("/user")
	authGroup.Use(func(c *gin.Context) {
		if _, exists := c.Get("userId"); !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}
		c.Next()
	})
	{
		authGroup.POST("/friend/request", sendFriendRequest(svc))
		authGroup.POST("/friend/cancel", cancelFriendRequest(svc))
		authGroup.POST("/friend/block", blockUser(svc))
		authGroup.POST("/friend/unblock", unblockUser(svc))
		authGroup.PUT("/friend/update", updateFriendRequest(svc))
		authGroup.GET("/profile/me", getMyProfile(svc))
		authGroup.POST("/profile/update", updateProfile(svc))
		authGroup.GET("/friends", getFriends(svc))
		authGroup.GET("/friends/suggestions", getFriendSuggestions(svc))
		authGroup.GET("/friend/requests/incoming", getIncomingFriendRequests(svc))
		authGroup.GET("/friend/requests/outgoing", getOutgoingFriendRequests(svc))
	}

	// Route công khai không bắt buộc xác thực
	r.GET("/user/profile/public/username/:username", getPublicProfileByUsername(svc))
}

// createProfile xử lý tạo hồ sơ người dùng
func createProfile(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req model.UserProfileRequestDto
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("Failed to bind JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		log.Printf("Received request: %+v", req)
		if err := svc.CreateProfile(req); err != nil {
			log.Printf("Failed to create profile: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User profile created successfully"})
	}
}

// sendFriendRequest gửi yêu cầu kết bạn
func sendFriendRequest(svc service.UserService) gin.HandlerFunc {
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

		var req struct {
			FriendID uint `json:"friendId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("Failed to bind JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friend ID"})
			return
		}

		if req.FriendID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Friend ID is required"})
			return
		}

		if err := svc.SendFriendRequest(userID, req.FriendID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Friend request sent successfully"})
	}
}

// cancelFriendRequest hủy yêu cầu kết bạn
func cancelFriendRequest(svc service.UserService) gin.HandlerFunc {
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

		var req struct {
			FriendID uint `json:"friendId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("Failed to bind JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friend ID"})
			return
		}

		if req.FriendID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Friend ID is required"})
			return
		}

		if err := svc.CancelFriendRequest(userID, req.FriendID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Friend request cancelled successfully"})
	}
}

// blockUser chặn người dùng
func blockUser(svc service.UserService) gin.HandlerFunc {
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

		var req struct {
			FriendID uint `json:"friendId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("Failed to bind JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friend ID"})
			return
		}

		if req.FriendID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Friend ID is required"})
			return
		}

		if err := svc.BlockUser(userID, req.FriendID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User blocked successfully"})
	}
}

// unblockUser hủy chặn người dùng
func unblockUser(svc service.UserService) gin.HandlerFunc {
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

		var req struct {
			FriendID uint `json:"friendId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("Failed to bind JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friend ID"})
			return
		}

		if req.FriendID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Friend ID is required"})
			return
		}

		if err := svc.UnblockUser(userID, req.FriendID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User unblocked successfully"})
	}
}

// updateFriendRequest cập nhật trạng thái yêu cầu kết bạn
func updateFriendRequest(svc service.UserService) gin.HandlerFunc {
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

		var req struct {
			FriendID uint   `json:"friendId"`
			Status   string `json:"status"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("Failed to bind JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		if req.FriendID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Friend ID is required"})
			return
		}
		if req.Status != "ACCEPTED" && req.Status != "BLOCKED" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
			return
		}

		if err := svc.UpdateFriendRequest(userID, req.FriendID, req.Status); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Friend request updated successfully"})
	}
}

// getPublicProfileByUsername lấy thông tin hồ sơ công khai bằng username
func getPublicProfileByUsername(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")
		if username == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
			return
		}

		var userID uint
		userIDInterface, exists := c.Get("userId")
		fmt.Println("userId in handler:", userIDInterface)
		if exists {
			if id, ok := userIDInterface.(uint); ok {
				userID = id
			} else {
				log.Printf("Invalid user ID type in context: %v", userIDInterface)
			}
		}

		profile, status, err := svc.GetPublicProfileWithFriendStatus(username, userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}

		response := gin.H{
			"profile":       profile,
			"friend_status": status,
		}
		c.JSON(http.StatusOK, response)
	}
}

// getMyProfile lấy thông tin hồ sơ của bản thân
func getMyProfile(svc service.UserService) gin.HandlerFunc {
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

		profile, err := svc.GetMyProfile(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}
		c.JSON(http.StatusOK, profile)
	}
}

// getFriends lấy danh sách bạn bè với thông tin chi tiết từ user_profiles và phân trang
func getFriends(svc service.UserService) gin.HandlerFunc {
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

		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 10
		}
		offset := (page - 1) * limit

		friendProfiles, total, err := svc.GetFriendProfiles(userID, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve friends"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"friends": friendProfiles,
			"total":   total,
			"page":    page,
			"limit":   limit,
			"pages":   (total + int64(limit) - 1) / int64(limit),
		})
	}
}

// getFriendSuggestions lấy danh sách gợi ý kết bạn
func getFriendSuggestions(svc service.UserService) gin.HandlerFunc {
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

		limit, _ := strconv.Atoi(c.Query("limit"))
		if limit <= 0 {
			limit = 10
		}
		suggestions, err := svc.GetFriendSuggestions(userID, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve suggestions"})
			return
		}
		c.JSON(http.StatusOK, suggestions)
	}
}

// getIncomingFriendRequests lấy danh sách lời mời kết bạn gửi tới người dùng
func getIncomingFriendRequests(svc service.UserService) gin.HandlerFunc {
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

		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 10
		}
		offset := (page - 1) * limit

		requests, total, err := svc.GetIncomingFriendRequests(userID, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve incoming friend requests: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"requests": requests,
			"total":    total,
			"page":     page,
			"limit":    limit,
			"pages":    (total + int64(limit) - 1) / int64(limit),
		})
	}
}

// getOutgoingFriendRequests lấy danh sách lời mời kết bạn đã gửi đi
func getOutgoingFriendRequests(svc service.UserService) gin.HandlerFunc {
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

		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 10
		}
		offset := (page - 1) * limit

		requests, total, err := svc.GetOutgoingFriendRequests(userID, limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve outgoing friend requests: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"requests": requests,
			"total":    total,
			"page":     page,
			"limit":    limit,
			"pages":    (total + int64(limit) - 1) / int64(limit),
		})
	}
}

// updateProfile cập nhật thông tin profile của người dùng
func updateProfile(svc service.UserService) gin.HandlerFunc {
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

		// Parse multipart form
		if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10MB max
			log.Printf("Error parsing multipart form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form data"})
			return
		}

		// Đọc dữ liệu profile từ form
		var req model.UpdateProfileRequestDto
		if c.PostForm("fullName") != "" {
			req.FullName = c.PostForm("fullName")
		}
		if c.PostForm("bio") != "" {
			req.Bio = c.PostForm("bio")
		}
		if c.PostForm("location") != "" {
			req.Location = c.PostForm("location")
		}
		if c.PostForm("website") != "" {
			req.Website = c.PostForm("website")
		}
		if c.PostForm("dateOfBirth") != "" {
			req.DateOfBirth = c.PostForm("dateOfBirth")
		}
		if c.PostForm("countryId") != "" {
			countryID, err := strconv.ParseUint(c.PostForm("countryId"), 10, 32)
			if err == nil {
				countryIDUint := uint(countryID)
				req.CountryID = &countryIDUint
			}
		}
		if c.PostForm("provinceId") != "" {
			provinceID, err := strconv.ParseUint(c.PostForm("provinceId"), 10, 32)
			if err == nil {
				provinceIDUint := uint(provinceID)
				req.ProvinceID = &provinceIDUint
			}
		}
		if c.PostForm("districtId") != "" {
			districtID, err := strconv.ParseUint(c.PostForm("districtId"), 10, 32)
			if err == nil {
				districtIDUint := uint(districtID)
				req.DistrictID = &districtIDUint
			}
		}

		// Xử lý file ảnh avatar
		var avatarFile interface{}
		avatar, avatarHeader, err := c.Request.FormFile("avatar")
		if err == nil && avatarHeader != nil {
			defer avatar.Close()
			log.Printf("Avatar file received: %s, size: %d", avatarHeader.Filename, avatarHeader.Size)
			avatarFile = avatar
		}

		// Xử lý file ảnh bìa
		var coverFile interface{}
		cover, coverHeader, err := c.Request.FormFile("cover")
		if err == nil && coverHeader != nil {
			defer cover.Close()
			log.Printf("Cover file received: %s, size: %d", coverHeader.Filename, coverHeader.Size)
			coverFile = cover
		}

		// Cập nhật profile
		updatedProfile, err := svc.UpdateProfile(userID, req, avatarFile, coverFile)
		if err != nil {
			log.Printf("Failed to update profile: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update profile: %v", err)})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Profile updated successfully",
			"profile": updatedProfile,
		})
	}
}
