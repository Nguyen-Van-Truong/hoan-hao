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

// SetupRoutes đăng ký các route cho Gin
func SetupRoutes(r *gin.Engine, repo repository.UserRepository) {
	svc := service.NewUserService(repo)
	r.POST("/api/user/createProfile", createProfile(svc))
	r.POST("/api/user/friend/request", sendFriendRequest(svc))
	r.PUT("/api/user/friend/update", updateFriendRequest(svc))
	r.GET("/api/user/profile/public/:userId", getPublicProfile(svc))
	r.GET("/api/user/profile/me", getMyProfile(svc))
	r.GET("/api/user/friends", getFriends(svc))
	r.GET("/api/user/friends/suggestions", getFriendSuggestions(svc))
}

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

func sendFriendRequest(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.ParseUint(c.GetHeader("User-ID"), 10, 32)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			return
		}
		friendID, err := strconv.ParseUint(c.PostForm("friendId"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friend ID"})
			return
		}
		if err := svc.SendFriendRequest(uint(userID), uint(friendID)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Friend request sent successfully"})
	}
}

func updateFriendRequest(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		friendID, err := strconv.ParseUint(c.PostForm("friendId"), 10, 32)
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

func getPublicProfile(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}
		profile, err := svc.GetPublicProfile(uint(userID))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusOK, profile)
	}
}

func getMyProfile(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.ParseUint(c.GetHeader("User-ID"), 10, 32)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			return
		}
		profile, err := svc.GetMyProfile(uint(userID))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}
		c.JSON(http.StatusOK, profile)
	}
}

func getFriends(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.ParseUint(c.GetHeader("User-ID"), 10, 32)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			return
		}
		friends, err := svc.GetFriends(uint(userID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve friends"})
			return
		}
		c.JSON(http.StatusOK, friends)
	}
}

func getFriendSuggestions(svc service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.ParseUint(c.GetHeader("User-ID"), 10, 32)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			return
		}
		limit, _ := strconv.Atoi(c.Query("limit"))
		if limit <= 0 {
			limit = 10 // Mặc định trả về 10 gợi ý
		}
		suggestions, err := svc.GetFriendSuggestions(uint(userID), limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve suggestions"})
			return
		}
		c.JSON(http.StatusOK, suggestions)
	}
}
