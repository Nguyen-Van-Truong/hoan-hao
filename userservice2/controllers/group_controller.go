package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"userservice2/dto/request"
	"userservice2/services"
)

// GroupController xử lý các API liên quan đến nhóm người dùng
type GroupController struct {
	groupService services.GroupService
}

// NewGroupController tạo instance mới của GroupController
func NewGroupController(groupService services.GroupService) *GroupController {
	return &GroupController{
		groupService: groupService,
	}
}

// CreateGroup xử lý việc tạo nhóm mới
func (c *GroupController) CreateGroup(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req request.GroupCreateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	group, err := c.groupService.CreateGroup(ctx, userID.(int64), &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, group)
}

// GetGroup xử lý việc lấy thông tin nhóm
func (c *GroupController) GetGroup(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		userID = int64(0) // Không yêu cầu đăng nhập để xem nhóm công khai
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	group, err := c.groupService.GetGroupByID(ctx, userID.(int64), groupID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, group)
}

// UpdateGroup xử lý việc cập nhật thông tin nhóm
func (c *GroupController) UpdateGroup(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	var req request.GroupUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	group, err := c.groupService.UpdateGroup(ctx, userID.(int64), groupID, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, group)
}

// DeleteGroup xử lý việc xóa nhóm
func (c *GroupController) DeleteGroup(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	err = c.groupService.DeleteGroup(ctx, userID.(int64), groupID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Xóa nhóm thành công"})
}

// ListGroups xử lý việc lấy danh sách tất cả các nhóm
func (c *GroupController) ListGroups(ctx *gin.Context) {
	var req request.GroupListRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tham số không hợp lệ: " + err.Error()})
		return
	}

	groups, err := c.groupService.ListGroups(ctx, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, groups)
}

// ListMyGroups xử lý việc lấy danh sách nhóm của người dùng hiện tại
func (c *GroupController) ListMyGroups(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req request.GroupListRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tham số không hợp lệ: " + err.Error()})
		return
	}

	groups, err := c.groupService.ListUserGroups(ctx, userID.(int64), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, groups)
}

// JoinGroup xử lý việc xin tham gia nhóm
func (c *GroupController) JoinGroup(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	var req request.GroupJoinRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	err := c.groupService.JoinGroup(ctx, userID.(int64), &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Đã gửi yêu cầu tham gia nhóm"})
}

// LeaveGroup xử lý việc rời khỏi nhóm
func (c *GroupController) LeaveGroup(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	err = c.groupService.LeaveGroup(ctx, userID.(int64), groupID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Đã rời khỏi nhóm"})
}

// InviteMember xử lý việc mời người dùng tham gia nhóm
func (c *GroupController) InviteMember(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	var req request.GroupMemberActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	err = c.groupService.InviteMember(ctx, userID.(int64), groupID, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Đã gửi lời mời tham gia nhóm"})
}

// HandleMemberRequest xử lý việc chấp nhận/từ chối yêu cầu tham gia nhóm
func (c *GroupController) HandleMemberRequest(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	action := ctx.Param("action")
	if action != "approve" && action != "reject" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Hành động không hợp lệ"})
		return
	}

	var req request.GroupMemberActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	var actionErr error
	if action == "approve" {
		actionErr = c.groupService.ApproveJoinRequest(ctx, userID.(int64), groupID, &req)
	} else {
		actionErr = c.groupService.RejectJoinRequest(ctx, userID.(int64), groupID, &req)
	}

	if actionErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": actionErr.Error()})
		return
	}

	message := "Đã từ chối yêu cầu tham gia"
	if action == "approve" {
		message = "Đã chấp nhận yêu cầu tham gia"
	}

	ctx.JSON(http.StatusOK, gin.H{"message": message})
}

// RemoveMember xử lý việc xóa thành viên khỏi nhóm
func (c *GroupController) RemoveMember(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	var req request.GroupMemberActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	err = c.groupService.RemoveMember(ctx, userID.(int64), groupID, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Đã xóa thành viên khỏi nhóm"})
}

// UpdateMember xử lý việc cập nhật thông tin thành viên
func (c *GroupController) UpdateMember(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	memberID, err := strconv.ParseInt(ctx.Param("member_id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID thành viên không hợp lệ"})
		return
	}

	var req request.GroupMemberUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	member, err := c.groupService.UpdateMember(ctx, userID.(int64), groupID, memberID, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, member)
}

// GetGroupMembers xử lý việc lấy danh sách thành viên nhóm
func (c *GroupController) GetGroupMembers(ctx *gin.Context) {
	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	var req request.GroupMemberListRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tham số không hợp lệ: " + err.Error()})
		return
	}

	members, err := c.groupService.GetGroupMembers(ctx, groupID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, members)
}

// UploadGroupCoverImage xử lý việc tải lên ảnh bìa cho nhóm
func (c *GroupController) UploadGroupCoverImage(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	var req request.GroupImageUploadRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	// Cập nhật ảnh bìa cho nhóm
	updateReq := &request.GroupUpdateRequest{
		CoverImage: req.ImageURL,
	}

	group, err := c.groupService.UpdateGroup(ctx, userID.(int64), groupID, updateReq)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, group)
}

// UploadGroupAvatar xử lý việc tải lên ảnh đại diện cho nhóm
func (c *GroupController) UploadGroupAvatar(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực"})
		return
	}

	groupID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID nhóm không hợp lệ"})
		return
	}

	var req request.GroupImageUploadRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	// Cập nhật ảnh đại diện cho nhóm
	updateReq := &request.GroupUpdateRequest{
		Avatar: req.ImageURL,
	}

	group, err := c.groupService.UpdateGroup(ctx, userID.(int64), groupID, updateReq)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, group)
}
