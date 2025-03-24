package controllers

import (
	"net/http"
	_ "strconv"

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

	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username không hợp lệ"})
		return
	}

	// Tìm người dùng theo username
	friend, err := c.friendshipService.GetUserByUsername(ctx, username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng: " + err.Error()})
		return
	}

	if friend == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}

	status, err := c.friendshipService.GetFriendshipStatus(ctx, userID.(int64), friend.ID)
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

	// Tìm người dùng theo username
	friend, err := c.friendshipService.GetUserByUsername(ctx, req.FriendUsername)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng: " + err.Error()})
		return
	}

	if friend == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}

	action := ctx.Param("action")
	var actionErr error

	switch action {
	case "send-request":
		actionErr = c.friendshipService.SendFriendRequest(ctx, userID.(int64), friend.ID)
	case "accept":
		actionErr = c.friendshipService.AcceptFriendRequest(ctx, userID.(int64), friend.ID)
	case "reject":
		actionErr = c.friendshipService.RejectFriendRequest(ctx, userID.(int64), friend.ID)
	case "cancel":
		actionErr = c.friendshipService.CancelFriendRequest(ctx, userID.(int64), friend.ID)
	case "unfriend":
		actionErr = c.friendshipService.Unfriend(ctx, userID.(int64), friend.ID)
	case "block":
		actionErr = c.friendshipService.BlockFriend(ctx, userID.(int64), friend.ID)
	case "unblock":
		actionErr = c.friendshipService.UnblockFriend(ctx, userID.(int64), friend.ID)
	default:
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Hành động không hợp lệ"})
		return
	}

	if actionErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": actionErr.Error()})
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

	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username không hợp lệ"})
		return
	}

	// Tìm người dùng theo username
	targetUser, err := c.friendshipService.GetUserByUsername(ctx, username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng: " + err.Error()})
		return
	}

	if targetUser == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}

	var req request.FriendListRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tham số không hợp lệ: " + err.Error()})
		return
	}

	// Kiểm tra nếu đang xem danh sách bạn bè của chính mình
	if targetUser.ID == userID.(int64) {
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
	result, err := c.friendshipService.GetFriends(ctx, targetUser.ID, &req)
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

	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username không hợp lệ"})
		return
	}

	// Tìm người dùng theo username
	friend, err := c.friendshipService.GetUserByUsername(ctx, username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng: " + err.Error()})
		return
	}

	if friend == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}

	count, err := c.friendshipService.GetMutualFriendsCount(ctx, userID.(int64), friend.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy số bạn chung: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"count": count})
}
