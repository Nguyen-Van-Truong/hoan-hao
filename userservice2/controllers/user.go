package controllers

import (
	"net/http"
	"strconv"
	"userservice2/dto/request"
	_ "userservice2/dto/response"

	"github.com/gin-gonic/gin"
	_ "userservice2/models"
	"userservice2/services"
)

// UserController xử lý các request liên quan đến người dùng
type UserController struct {
	userService services.UserService
}

// NewUserController tạo instance mới của UserController
func NewUserController(userService services.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

// CreateProfile xử lý tạo profile người dùng từ authservice
func (c *UserController) CreateProfile(ctx *gin.Context) {
	var req request.UserProfileRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Chuyển đổi từ request sang model User
	user, err := req.ToUser()
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Không thể xử lý thông tin ngày tháng: " + err.Error()})
		return
	}

	// Lưu user vào database
	err = c.userService.CreateUserProfileFromAuth(ctx, user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo profile người dùng: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Tạo profile người dùng thành công",
		"user_id": user.ID,
	})
}

// GetMe lấy thông tin người dùng hiện tại
func (c *UserController) GetMe(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	user, err := c.userService.GetUserByID(ctx, userID.(int64))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng"})
		return
	}

	ctx.JSON(http.StatusOK, user)
}

// GetUser lấy thông tin người dùng theo ID
func (c *UserController) GetUser(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	user, err := c.userService.GetUserByID(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng"})
		return
	}

	if user == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}

	ctx.JSON(http.StatusOK, user)
}

// GetUsers lấy danh sách người dùng
func (c *UserController) GetUsers(ctx *gin.Context) {
	page, err := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(ctx.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	users, err := c.userService.ListUsers(ctx, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách người dùng"})
		return
	}

	ctx.JSON(http.StatusOK, users)
}

// UpdateProfile cập nhật thông tin người dùng
func (c *UserController) UpdateProfile(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req request.UserProfileUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.userService.UpdateProfile(ctx, userID.(int64), &req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật thông tin người dùng"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Cập nhật thông tin thành công"})
}

// UploadProfilePicture tải lên ảnh đại diện
func (c *UserController) UploadProfilePicture(ctx *gin.Context) {
	// Triển khai sau
}

// UploadCoverPicture tải lên ảnh bìa
func (c *UserController) UploadCoverPicture(ctx *gin.Context) {
	// Triển khai sau
}
