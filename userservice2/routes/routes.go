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
) {
	// Middleware global
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// API cho authservice - không yêu cầu JWT
	router.POST("/user/createProfile", userController.CreateProfile)

	// Protected routes - User
	userRoutes := router.Group("/users")
	{
		// Các route không yêu cầu xác thực
		userRoutes.GET("", userController.GetUsers)
		userRoutes.GET("/:id", userController.GetUser)

		// Các route yêu cầu xác thực
		protectedRoutes := userRoutes.Group("")
		protectedRoutes.Use(middlewares.JWTMiddleware())
		{
			protectedRoutes.GET("/me", userController.GetMe)
			protectedRoutes.PUT("/me", userController.UpdateProfile)
			protectedRoutes.PUT("/me/profile-picture", userController.UploadProfilePicture)
			protectedRoutes.PUT("/me/cover-picture", userController.UploadCoverPicture)
		}
	}

	// Healthcheck
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "UP"})
	})
}
