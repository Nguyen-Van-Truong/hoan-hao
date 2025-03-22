package routes

import (
	"github.com/gin-gonic/gin"
	"userservice2/controllers"
	"userservice2/middlewares"
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

	// API v1
	v1 := router.Group("/api/v1")

	// Protected routes - User
	userRoutes := v1.Group("/users")
	userRoutes.Use(middlewares.JWTMiddleware())
	{
		userRoutes.GET("", userController.GetUsers)
		userRoutes.GET("/me", userController.GetMe)
		userRoutes.GET("/:id", userController.GetUser)
		userRoutes.PUT("/me", userController.UpdateProfile)
		userRoutes.PUT("/me/password", userController.ChangePassword)
		userRoutes.PUT("/me/profile-picture", userController.UploadProfilePicture)
		userRoutes.PUT("/me/cover-picture", userController.UploadCoverPicture)
	}

	// Protected routes - Friendship
	friendRoutes := v1.Group("/friends")
	friendRoutes.Use(middlewares.JWTMiddleware())
	{
		friendRoutes.POST("/actions", friendshipController.PerformFriendshipAction)
		friendRoutes.GET("", friendshipController.GetFriends)
		friendRoutes.GET("/requests", friendshipController.GetFriendRequests)
		friendRoutes.GET("/suggestions", friendshipController.GetFriendSuggestions)
	}

	// Protected routes - Group
	groupRoutes := v1.Group("/groups")
	groupRoutes.Use(middlewares.JWTMiddleware())
	{
		// Group management
		//groupRoutes.GET("", groupController.ListGroups)

		// Group members

		// Group join requests

		// Group roles

		// Group member roles
	}

	// Healthcheck
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "UP"})
	})
}
