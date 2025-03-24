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
	groupController *controllers.GroupController,
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
		userRoutes.GET("/:username", userController.GetUser)

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

	// Friendship routes
	friendshipRoutes := router.Group("/friends")
	{
		// Route có xác thực
		friendshipRoutes.Use(middlewares.JWTMiddleware())
		{
			// Lấy danh sách bạn bè và lời mời kết bạn
			friendshipRoutes.GET("", friendshipController.GetFriends)
			friendshipRoutes.GET("/requests", friendshipController.GetFriendRequests)
			friendshipRoutes.GET("/suggestions", friendshipController.GetFriendSuggestions)

			// Lấy danh sách bạn bè của người dùng khác
			friendshipRoutes.GET("/user/:username", friendshipController.GetUserFriends)

			// Lấy số lượng bạn chung
			friendshipRoutes.GET("/mutual/:username", friendshipController.GetMutualFriends)

			// API đa năng xử lý các hành động bạn bè theo action
			friendshipRoutes.POST("/:action", friendshipController.FriendshipActionHandler)

			// Lấy trạng thái bạn bè với một người dùng
			friendshipRoutes.GET("/status/:username", friendshipController.GetFriendshipStatus)
		}
	}

	// Group routes
	groupRoutes := router.Group("/groups")
	{
		// Các route không yêu cầu xác thực (chỉ cho nhóm public)
		groupRoutes.GET("", groupController.ListGroups)
		groupRoutes.GET("/:id", groupController.GetGroup)
		groupRoutes.GET("/:id/members", groupController.GetGroupMembers)

		// Các route yêu cầu xác thực
		protectedGroupRoutes := groupRoutes.Group("")
		protectedGroupRoutes.Use(middlewares.JWTMiddleware())
		{
			// Quản lý nhóm
			protectedGroupRoutes.POST("", groupController.CreateGroup)
			protectedGroupRoutes.PUT("/:id", groupController.UpdateGroup)
			protectedGroupRoutes.DELETE("/:id", groupController.DeleteGroup)
			protectedGroupRoutes.GET("/me", groupController.ListMyGroups)

			// Tham gia/rời nhóm
			protectedGroupRoutes.POST("/join", groupController.JoinGroup)
			protectedGroupRoutes.POST("/:id/leave", groupController.LeaveGroup)

			// Quản lý thành viên
			protectedGroupRoutes.POST("/:id/invite", groupController.InviteMember)
			protectedGroupRoutes.POST("/:id/members/:action", groupController.HandleMemberRequest) // action = approve/reject
			protectedGroupRoutes.DELETE("/:id/members", groupController.RemoveMember)
			protectedGroupRoutes.PUT("/:id/members/:member_id", groupController.UpdateMember)
		}
	}

	// Healthcheck
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "UP"})
	})
}
