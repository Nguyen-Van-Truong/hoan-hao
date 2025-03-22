package routes

import (
	"github.com/gin-gonic/gin"
	"userservice2/controllers"
)

// SetupRoutes cài đặt tất cả routes cho API
func SetupRoutes(
	router *gin.Engine,
	userController *controllers.UserController,
	friendshipController *controllers.FriendshipController,
) {
	// Middleware global
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// API cho authservice - không yêu cầu JWT
	router.POST("/user/createProfile", userController.CreateProfile)

	// Protected routes - User
	userRoutes := router.Group("/users")
	{
		userRoutes.GET("", userController.GetUsers)
		userRoutes.GET("/me", userController.GetMe)
		userRoutes.GET("/:id", userController.GetUser)
		userRoutes.PUT("/me", userController.UpdateProfile)
		userRoutes.PUT("/me/profile-picture", userController.UploadProfilePicture)
		userRoutes.PUT("/me/cover-picture", userController.UploadCoverPicture)
	}

	// Protected routes - Friendship
	friendRoutes := router.Group("/friends")
	{
		friendRoutes.POST("/actions", friendshipController.PerformFriendshipAction)
		friendRoutes.GET("", friendshipController.GetFriends)
		friendRoutes.GET("/requests", friendshipController.GetFriendRequests)
		friendRoutes.GET("/suggestions", friendshipController.GetFriendSuggestions)
	}

	// Healthcheck
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "UP"})
	})
}
