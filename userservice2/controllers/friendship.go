package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"userservice2/models"
	"userservice2/services"
)

// FriendshipController xử lý các request liên quan đến kết bạn
type FriendshipController struct {
	friendshipService services.FriendshipService
}

// NewFriendshipController tạo instance mới của FriendshipController
func NewFriendshipController(friendshipService services.FriendshipService) *FriendshipController {
	return &FriendshipController{
		friendshipService: friendshipService,
	}
}

// PerformFriendshipAction xử lý các hành động kết bạn (gửi lời mời, hủy lời mời, chấp nhận, từ chối, chặn, bỏ chặn)
func (c *FriendshipController) PerformFriendshipAction(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req models.FriendshipAction
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := c.friendshipService.PerformFriendshipAction(ctx, userID.(int64), &req)
	if err != nil {
		switch err {
		case services.ErrInvalidAction:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Hành động không hợp lệ"})
		case services.ErrSelfFriendship:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Không thể kết bạn với chính mình"})
		case services.ErrFriendshipExists:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Đã là bạn bè"})
		case services.ErrFriendRequestExists:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Lời mời kết bạn đã tồn tại"})
		case services.ErrFriendshipNotFound:
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy mối quan hệ bạn bè"})
		case services.ErrNotFriendRequestOwner:
			ctx.JSON(http.StatusForbidden, gin.H{"error": "Không phải chủ sở hữu lời mời kết bạn"})
		case services.ErrNotRequestRecipient:
			ctx.JSON(http.StatusForbidden, gin.H{"error": "Không phải người nhận lời mời kết bạn"})
		default:
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể xử lý yêu cầu kết bạn"})
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Thực hiện hành động thành công"})
}

// GetFriends lấy danh sách bạn bè
func (c *FriendshipController) GetFriends(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	page, err := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(ctx.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	friends, err := c.friendshipService.GetFriends(ctx, userID.(int64), page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách bạn bè"})
		return
	}

	ctx.JSON(http.StatusOK, friends)
}

// GetFriendRequests lấy danh sách lời mời kết bạn
func (c *FriendshipController) GetFriendRequests(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	page, err := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(ctx.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	incoming := ctx.DefaultQuery("type", "incoming") == "incoming"

	requests, err := c.friendshipService.GetFriendRequests(ctx, userID.(int64), incoming, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách lời mời kết bạn"})
		return
	}

	ctx.JSON(http.StatusOK, requests)
}

// GetFriendSuggestions lấy danh sách gợi ý kết bạn
func (c *FriendshipController) GetFriendSuggestions(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	limit, err := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	suggestions, err := c.friendshipService.GetFriendSuggestions(ctx, userID.(int64), limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy gợi ý kết bạn"})
		return
	}

	ctx.JSON(http.StatusOK, suggestions)
}
