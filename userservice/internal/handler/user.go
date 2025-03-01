package handler

import (
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

	// Nhóm route yêu cầu xác thực JWT
	authGroup := r.Group("/user")
	authGroup.Use(JWTMiddleware()) // Giả định JWTMiddleware đã được định nghĩa trong package handler
	{
		authGroup.POST("/createProfile", createProfile(svc))
		authGroup.POST("/friend/request", sendFriendRequest(svc))
		authGroup.PUT("/friend/update", updateFriendRequest(svc))
		authGroup.GET("/profile/me", getMyProfile(svc))
		authGroup.GET("/friends", getFriends(svc))
		authGroup.GET("/friends/suggestions", getFriendSuggestions(svc))
	}

	// Route công khai không cần xác thực
	r.GET("/user/profile/public/:userId", getPublicProfile(svc)) // userId là hoanhao_auth.user.id
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
		userIDInterface, exists := c.Get("userId") // userId từ JWT là hoanhao_auth.user.id
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID type"})
			return
		}

		// Lấy profile của user từ userId
		userProfile, err := svc.GetMyProfile(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User profile not found"})
			return
		}
		userProfileID := userProfile.ID // userProfileID là user_profiles.id

		// friendId từ form là hoanhao_auth.user.id
		friendUserID, err := strconv.ParseUint(c.PostForm("friendId"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friend ID"})
			return
		}

		// Lấy profile của friend từ friendUserID
		friendProfile, err := svc.GetMyProfile(uint(friendUserID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Friend profile not found"})
			return
		}
		friendProfileID := friendProfile.ID // friendProfileID là user_profiles.id

		if err := svc.SendFriendRequest(userProfileID, friendProfileID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Friend request sent successfully"})
	}
}

// updateFriendRequest cập nhật trạng thái yêu cầu kết bạn
func updateFriendRequest(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		friendID, err := strconv.ParseUint(c.PostForm("friendId"), 10, 32) // friendId là id của bản ghi trong friends
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friend ID"})
			return
		}
		status := c.PostForm("status")
		if status != "ACCEPTED" && status != "BLOCKED" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
			return
		}
		if err := svc.UpdateFriendRequest(uint(friendID), status); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Friend request updated successfully"})
	}
}

// getPublicProfile lấy thông tin hồ sơ công khai
func getPublicProfile(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.ParseUint(c.Param("userId"), 10, 32) // userId là hoanhao_auth.user.id
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}
		profile, err := svc.GetPublicProfile(uint(userID)) // Tìm theo user_id
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}
		c.JSON(http.StatusOK, profile)
	}
}

// getMyProfile lấy thông tin hồ sơ của bản thân
func getMyProfile(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDInterface, exists := c.Get("userId") // userId là hoanhao_auth.user.id
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID type"})
			return
		}

		profile, err := svc.GetMyProfile(userID) // Tìm theo user_id
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}
		c.JSON(http.StatusOK, profile)
	}
}

// getFriends lấy danh sách bạn bè
func getFriends(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDInterface, exists := c.Get("userId") // userId là hoanhao_auth.user.id
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID type"})
			return
		}

		// Lấy profile từ userId
		profile, err := svc.GetMyProfile(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User profile not found"})
			return
		}
		profileID := profile.ID // profileID là user_profiles.id

		friends, err := svc.GetFriends(profileID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve friends"})
			return
		}
		c.JSON(http.StatusOK, friends)
	}
}

// getFriendSuggestions lấy danh sách gợi ý kết bạn
func getFriendSuggestions(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDInterface, exists := c.Get("userId") // userId là hoanhao_auth.user.id
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID type"})
			return
		}

		// Lấy profile từ userId
		profile, err := svc.GetMyProfile(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User profile not found"})
			return
		}
		profileID := profile.ID // profileID là user_profiles.id

		limit, _ := strconv.Atoi(c.Query("limit"))
		if limit <= 0 {
			limit = 10 // Mặc định trả về 10 gợi ý
		}
		suggestions, err := svc.GetFriendSuggestions(profileID, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve suggestions"})
			return
		}
		c.JSON(http.StatusOK, suggestions)
	}
}
