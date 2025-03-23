package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"userservice2/dto/request"
	_ "userservice2/dto/response"
	"userservice2/services"
)

// FriendshipController xử lý các API liên quan đến bạn bè
type FriendshipController struct {
	friendshipService services.FriendshipService
}

// NewFriendshipController tạo instance mới của FriendshipController
func NewFriendshipController(friendshipService services.FriendshipService) *FriendshipController {
	return &FriendshipController{
		friendshipService: friendshipService,
	}
}

// GetFriendshipStatus trả về trạng thái mối quan hệ bạn bè với một người dùng
func (c *FriendshipController) GetFriendshipStatus(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	friendID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID người dùng không hợp lệ"})
		return
	}

	status, err := c.friendshipService.GetFriendshipStatus(ctx, userID.(int64), friendID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy trạng thái: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": string(status)})
}

// FriendshipActionHandler xử lý chung cho các hành động về bạn bè
func (c *FriendshipController) FriendshipActionHandler(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req request.FriendshipActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	action := ctx.Param("action")
	var err error

	switch action {
	case "send-request":
		err = c.friendshipService.SendFriendRequest(ctx, userID.(int64), req.FriendID)
	case "accept":
		err = c.friendshipService.AcceptFriendRequest(ctx, userID.(int64), req.FriendID)
	case "reject":
		err = c.friendshipService.RejectFriendRequest(ctx, userID.(int64), req.FriendID)
	case "cancel":
		err = c.friendshipService.CancelFriendRequest(ctx, userID.(int64), req.FriendID)
	case "unfriend":
		err = c.friendshipService.Unfriend(ctx, userID.(int64), req.FriendID)
	case "block":
		err = c.friendshipService.BlockFriend(ctx, userID.(int64), req.FriendID)
	case "unblock":
		err = c.friendshipService.UnblockFriend(ctx, userID.(int64), req.FriendID)
	default:
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Hành động không hợp lệ"})
		return
	}

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Thành công"})
}

// GetFriends lấy danh sách bạn bè
func (c *FriendshipController) GetFriends(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req request.FriendListRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tham số không hợp lệ: " + err.Error()})
		return
	}

	result, err := c.friendshipService.GetFriends(ctx, userID.(int64), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách bạn bè: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, result)
}

// GetFriendRequests lấy danh sách lời mời kết bạn
func (c *FriendshipController) GetFriendRequests(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req request.FriendRequestsListRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tham số không hợp lệ: " + err.Error()})
		return
	}

	result, err := c.friendshipService.GetFriendRequests(ctx, userID.(int64), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách lời mời kết bạn: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, result)
}

// GetFriendSuggestions lấy danh sách gợi ý kết bạn
func (c *FriendshipController) GetFriendSuggestions(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req request.FriendSuggestionsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tham số không hợp lệ: " + err.Error()})
		return
	}

	result, err := c.friendshipService.GetFriendSuggestions(ctx, userID.(int64), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy gợi ý kết bạn: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, result)
}

// GetUserFriends lấy danh sách bạn bè của một người dùng cụ thể
func (c *FriendshipController) GetUserFriends(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	targetUserID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID người dùng không hợp lệ"})
		return
	}

	var req request.FriendListRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tham số không hợp lệ: " + err.Error()})
		return
	}

	// Kiểm tra nếu đang xem danh sách bạn bè của chính mình
	if targetUserID == userID.(int64) {
		result, err := c.friendshipService.GetFriends(ctx, userID.(int64), &req)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách bạn bè: " + err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, result)
		return
	}

	// Nếu xem danh sách bạn bè của người khác, bắt buộc status phải là accepted
	req.Status = "accepted"
	result, err := c.friendshipService.GetFriends(ctx, targetUserID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách bạn bè: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, result)
}

// GetMutualFriends lấy số lượng bạn chung
func (c *FriendshipController) GetMutualFriends(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	friendID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID người dùng không hợp lệ"})
		return
	}

	count, err := c.friendshipService.GetMutualFriendsCount(ctx, userID.(int64), friendID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy số bạn chung: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"count": count})
}
