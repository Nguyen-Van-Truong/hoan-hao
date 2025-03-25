package controllers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"userservice2/dto/request"
	_ "userservice2/dto/response"
	"userservice2/utils"

	_ "userservice2/models"
	"userservice2/services"

	"github.com/gin-gonic/gin"
)

// UserController xử lý các request liên quan đến người dùng
type UserController struct {
	userService services.UserService
	cloudinary  *utils.CloudinaryUploader
}

// NewUserController tạo instance mới của UserController
func NewUserController(userService services.UserService, cloudinaryUploader *utils.CloudinaryUploader) *UserController {
	return &UserController{
		userService: userService,
		cloudinary:  cloudinaryUploader,
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

	log.Printf("GetMe - userID: %v, exists: %v, type: %T", userID, exists, userID)

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

// GetUser lấy thông tin người dùng theo username
func (c *UserController) GetUser(ctx *gin.Context) {
	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username không hợp lệ"})
		return
	}

	user, err := c.userService.GetUserByUsername(ctx, username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng"})
		return
	}

	if user == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}

	// Kiểm tra xem người dùng đã đăng nhập chưa
	currentUserID, exists := ctx.Get("userID")

	// Nếu người dùng đã đăng nhập, thêm thông tin về mối quan hệ bạn bè
	if exists && currentUserID != nil {
		loggedInUserID := currentUserID.(int64)

		// Nếu đang xem chính profile của mình
		if loggedInUserID == user.ID {
			// Trả về với friendship_status là "self"
			response := gin.H{
				"user":              user,
				"friendship_status": "self",
			}
			ctx.JSON(http.StatusOK, response)
			return
		}

		// Nếu đang xem profile của người khác, lấy trạng thái bạn bè
		friendshipStatus, err := c.userService.GetFriendshipStatus(ctx, loggedInUserID, user.ID)
		if err == nil {
			response := gin.H{
				"user":              user,
				"friendship_status": friendshipStatus,
			}
			ctx.JSON(http.StatusOK, response)
			return
		}
	}

	// Trường hợp người dùng chưa đăng nhập hoặc có lỗi khi lấy trạng thái bạn bè
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
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	// Lấy thông tin người dùng để kiểm tra URL ảnh hiện tại
	user, err := c.userService.GetUserByID(ctx, userID.(int64))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng"})
		return
	}

	// Lấy file từ request
	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Không thể đọc file ảnh: " + err.Error()})
		return
	}

	// Kiểm tra kích thước file (tối đa 5MB)
	const maxSize = 5 * 1024 * 1024 // 5MB
	if file.Size > maxSize {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Kích thước file quá lớn, tối đa 5MB"})
		return
	}

	// Kiểm tra định dạng file (chỉ cho phép jpg, jpeg, png)
	if !isValidImageFormat(file.Filename) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng file không hợp lệ, chỉ chấp nhận JPG, JPEG, PNG"})
		return
	}

	// Mở file để upload
	openedFile, err := file.Open()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể mở file: " + err.Error()})
		return
	}
	defer openedFile.Close()

	// Tạo public ID cho file (sử dụng userID để đảm bảo unique)
	publicID := fmt.Sprintf("user_%d_profile_%d", userID.(int64), time.Now().UnixNano())

	// Upload ảnh lên Cloudinary
	fileURL, err := c.cloudinary.UploadImage(openedFile, publicID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tải ảnh lên: " + err.Error()})
		return
	}

	// Xóa ảnh cũ nếu có
	if user.ProfilePictureURL != "" {
		// Xóa bất đồng bộ để không ảnh hưởng đến response
		go func(oldURL string) {
			if err := c.cloudinary.DeleteImage(oldURL); err != nil {
				log.Printf("Không thể xóa ảnh cũ: %v", err)
			}
		}(user.ProfilePictureURL)
	}

	// Cập nhật URL ảnh trong database
	if err := c.userService.UploadProfilePicture(ctx, userID.(int64), fileURL); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật ảnh đại diện: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Cập nhật ảnh đại diện thành công",
		"url":     fileURL,
	})
}

// UploadCoverPicture tải lên ảnh bìa
func (c *UserController) UploadCoverPicture(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	// Lấy thông tin người dùng để kiểm tra URL ảnh hiện tại
	user, err := c.userService.GetUserByID(ctx, userID.(int64))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng"})
		return
	}

	// Lấy file từ request
	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Không thể đọc file ảnh: " + err.Error()})
		return
	}

	// Kiểm tra kích thước file (tối đa 10MB cho ảnh bìa)
	const maxSize = 10 * 1024 * 1024 // 10MB
	if file.Size > maxSize {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Kích thước file quá lớn, tối đa 10MB"})
		return
	}

	// Kiểm tra định dạng file (chỉ cho phép jpg, jpeg, png)
	if !isValidImageFormat(file.Filename) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng file không hợp lệ, chỉ chấp nhận JPG, JPEG, PNG"})
		return
	}

	// Mở file để upload
	openedFile, err := file.Open()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể mở file: " + err.Error()})
		return
	}
	defer openedFile.Close()

	// Tạo public ID cho file (sử dụng userID để đảm bảo unique)
	publicID := fmt.Sprintf("user_%d_cover_%d", userID.(int64), time.Now().UnixNano())

	// Upload ảnh lên Cloudinary
	fileURL, err := c.cloudinary.UploadImage(openedFile, publicID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tải ảnh lên: " + err.Error()})
		return
	}

	// Xóa ảnh cũ nếu có
	if user.CoverPictureURL != "" {
		// Xóa bất đồng bộ để không ảnh hưởng đến response
		go func(oldURL string) {
			if err := c.cloudinary.DeleteImage(oldURL); err != nil {
				log.Printf("Không thể xóa ảnh cũ: %v", err)
			}
		}(user.CoverPictureURL)
	}

	// Cập nhật URL ảnh trong database
	if err := c.userService.UploadCoverPicture(ctx, userID.(int64), fileURL); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật ảnh bìa: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Cập nhật ảnh bìa thành công",
		"url":     fileURL,
	})
}

// isValidImageFormat kiểm tra định dạng file có hợp lệ không
func isValidImageFormat(filename string) bool {
	filename = strings.ToLower(filename)
	return strings.HasSuffix(filename, ".jpg") ||
		strings.HasSuffix(filename, ".jpeg") ||
		strings.HasSuffix(filename, ".png")
}
