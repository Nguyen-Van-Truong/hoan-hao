package services

import (
	"context"
	"errors"
	"fmt"
	"time"
	"userservice2/dto/request"
	"userservice2/dto/response"
	"userservice2/models"
	"userservice2/repositories"
)

// GroupService xử lý logic liên quan đến nhóm
type GroupService interface {
	// Quản lý nhóm
	CreateGroup(ctx context.Context, userID int64, req *request.GroupCreateRequest) (*response.GroupResponse, error)
	GetGroupByID(ctx context.Context, userID, groupID int64) (*response.GroupDetailResponse, error)
	UpdateGroup(ctx context.Context, userID, groupID int64, req *request.GroupUpdateRequest) (*response.GroupResponse, error)
	DeleteGroup(ctx context.Context, userID, groupID int64) error
	ListGroups(ctx context.Context, req *request.GroupListRequest) (*response.GroupListResponse, error)
	ListUserGroups(ctx context.Context, userID int64, req *request.GroupListRequest) (*response.GroupListResponse, error)

	// Quản lý thành viên
	JoinGroup(ctx context.Context, userID int64, req *request.GroupJoinRequest) error
	LeaveGroup(ctx context.Context, userID, groupID int64) error
	InviteMember(ctx context.Context, userID, groupID int64, req *request.GroupMemberActionRequest) error
	ApproveJoinRequest(ctx context.Context, userID, groupID int64, req *request.GroupMemberActionRequest) error
	RejectJoinRequest(ctx context.Context, userID, groupID int64, req *request.GroupMemberActionRequest) error
	RemoveMember(ctx context.Context, userID, groupID int64, req *request.GroupMemberActionRequest) error
	UpdateMember(ctx context.Context, userID, groupID, memberID int64, req *request.GroupMemberUpdateRequest) (*response.GroupMemberResponse, error)
	GetGroupMemberByID(ctx context.Context, memberID int64) (*response.GroupMemberResponse, error)
	GetGroupMembers(ctx context.Context, groupID int64, req *request.GroupMemberListRequest) (*response.GroupMemberListResponse, error)

	// Quản lý vai trò
	CreateGroupRole(ctx context.Context, userID, groupID int64, req *request.GroupRoleCreateRequest) (*response.GroupRoleResponse, error)
	UpdateGroupRole(ctx context.Context, userID, groupID, roleID int64, req *request.GroupRoleUpdateRequest) (*response.GroupRoleResponse, error)
	DeleteGroupRole(ctx context.Context, userID, groupID, roleID int64) error
	GetGroupRoles(ctx context.Context, groupID int64) (*response.GroupRoleListResponse, error)
	AssignRoleToMember(ctx context.Context, userID, groupID, memberID int64, req *request.GroupMemberRoleRequest) error
	RemoveRoleFromMember(ctx context.Context, userID, groupID, memberID, roleID int64) error
}

// groupService triển khai GroupService
type groupService struct {
	groupRepo  repositories.UserGroupRepository
	memberRepo repositories.GroupMemberRepository
	userRepo   repositories.UserRepository
}

// NewGroupService tạo instance mới của GroupService
func NewGroupService(
	groupRepo repositories.UserGroupRepository,
	memberRepo repositories.GroupMemberRepository,
	userRepo repositories.UserRepository,
) GroupService {
	return &groupService{
		groupRepo:  groupRepo,
		memberRepo: memberRepo,
		userRepo:   userRepo,
	}
}

// CreateGroup tạo nhóm mới và thêm người tạo làm admin
func (s *groupService) CreateGroup(ctx context.Context, userID int64, req *request.GroupCreateRequest) (*response.GroupResponse, error) {
	// Kiểm tra người dùng có tồn tại không
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("người dùng không tồn tại")
	}

	privacy := models.GroupPrivacyPublic
	if req.Privacy == "private" {
		privacy = models.GroupPrivacyPrivate
	}

	// Tạo nhóm mới
	group := &models.UserGroup{
		Name:        req.Name,
		Description: req.Description,
		Privacy:     privacy,
		CoverImage:  req.CoverImage,
		CreatedBy:   userID,
		MemberCount: 0, // Bắt đầu với số lượng thành viên là 0
	}

	err = s.groupRepo.Create(ctx, group)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi tạo nhóm: %v", err)
	}

	// Thêm người tạo làm admin của nhóm
	member := &models.GroupMember{
		GroupID:  group.ID,
		UserID:   userID,
		Role:     models.MemberRoleAdmin,
		Status:   models.GroupMemberStatusApproved,
		JoinedAt: time.Now(),
	}

	err = s.memberRepo.Create(ctx, member)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi thêm người tạo làm admin: %v", err)
	}

	// Cập nhật số lượng thành viên
	err = s.groupRepo.IncrementMemberCount(ctx, group.ID)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi cập nhật số lượng thành viên: %v", err)
	}

	// Load thông tin người tạo
	group.Creator = *user

	// Cập nhật member_count trong group để hiển thị đúng trong response
	group.MemberCount = 1

	// Chuyển đổi sang response
	resp := response.ConvertToGroupResponse(group)
	return &resp, nil
}

// GetGroupByID lấy thông tin chi tiết của nhóm
func (s *groupService) GetGroupByID(ctx context.Context, userID, groupID int64) (*response.GroupDetailResponse, error) {
	// Lấy thông tin nhóm
	group, err := s.groupRepo.FindByID(ctx, groupID)
	if err != nil {
		return nil, err
	}
	if group == nil {
		return nil, errors.New("nhóm không tồn tại")
	}

	// Kiểm tra quyền truy cập nếu là nhóm private
	if group.Privacy == models.GroupPrivacyPrivate {
		member, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
		if err != nil {
			return nil, err
		}
		if member == nil || member.Status != models.GroupMemberStatusApproved {
			return nil, errors.New("bạn không có quyền xem nhóm này")
		}
	}

	// Chuyển đổi sang response
	groupResp := response.ConvertToGroupResponse(group)
	result := &response.GroupDetailResponse{
		GroupResponse: groupResp,
	}

	// Thêm thông tin thành viên hiện tại nếu có
	if userID > 0 {
		member, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
		if err == nil && member != nil {
			memberResp := response.ConvertToGroupMemberResponse(member)
			result.CurrentUserMember = &memberResp
		}
	}

	return result, nil
}

// UpdateGroup cập nhật thông tin nhóm
func (s *groupService) UpdateGroup(ctx context.Context, userID, groupID int64, req *request.GroupUpdateRequest) (*response.GroupResponse, error) {
	// Lấy thông tin nhóm
	group, err := s.groupRepo.FindByID(ctx, groupID)
	if err != nil {
		return nil, err
	}
	if group == nil {
		return nil, errors.New("nhóm không tồn tại")
	}

	// Kiểm tra quyền admin
	member, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
	if err != nil {
		return nil, err
	}
	if member == nil || member.Status != models.GroupMemberStatusApproved || member.Role != models.MemberRoleAdmin {
		return nil, errors.New("bạn không có quyền chỉnh sửa nhóm này")
	}

	// Cập nhật thông tin nhóm
	if req.Name != "" {
		group.Name = req.Name
	}
	if req.Description != "" {
		group.Description = req.Description
	}
	if req.CoverImage != "" {
		group.CoverImage = req.CoverImage
	}
	if req.Privacy != "" {
		if req.Privacy == "public" {
			group.Privacy = models.GroupPrivacyPublic
		} else {
			group.Privacy = models.GroupPrivacyPrivate
		}
	}

	err = s.groupRepo.Update(ctx, group)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi cập nhật nhóm: %v", err)
	}

	// Chuyển đổi sang response
	resp := response.ConvertToGroupResponse(group)
	return &resp, nil
}

// DeleteGroup xóa nhóm
func (s *groupService) DeleteGroup(ctx context.Context, userID, groupID int64) error {
	// Lấy thông tin nhóm
	group, err := s.groupRepo.FindByID(ctx, groupID)
	if err != nil {
		return err
	}
	if group == nil {
		return errors.New("nhóm không tồn tại")
	}

	// Kiểm tra quyền admin hoặc người tạo
	if group.CreatedBy != userID {
		member, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
		if err != nil {
			return err
		}
		if member == nil || member.Status != models.GroupMemberStatusApproved || member.Role != models.MemberRoleAdmin {
			return errors.New("bạn không có quyền xóa nhóm này")
		}
	}

	return s.groupRepo.Delete(ctx, groupID)
}

// ListGroups lấy danh sách tất cả các nhóm công khai
func (s *groupService) ListGroups(ctx context.Context, req *request.GroupListRequest) (*response.GroupListResponse, error) {
	// TODO: Implement search by query and filter by privacy

	// Lấy danh sách nhóm có phân trang
	groups, total, err := s.groupRepo.List(ctx, req.Page, req.PageSize)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi lấy danh sách nhóm: %v", err)
	}

	// Chuyển đổi sang response
	resp := &response.GroupListResponse{
		Groups: make([]response.GroupResponse, len(groups)),
		Total:  total,
		Page:   req.Page,
		Size:   req.PageSize,
	}

	for i, group := range groups {
		resp.Groups[i] = response.ConvertToGroupResponse(&group)
	}

	return resp, nil
}

// ListUserGroups lấy danh sách nhóm của người dùng
func (s *groupService) ListUserGroups(ctx context.Context, userID int64, req *request.GroupListRequest) (*response.GroupListResponse, error) {
	// Lấy danh sách nhóm của người dùng có phân trang
	groups, total, err := s.groupRepo.ListUserGroups(ctx, userID, req.Page, req.PageSize)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi lấy danh sách nhóm: %v", err)
	}

	// Chuyển đổi sang response
	resp := &response.GroupListResponse{
		Groups: make([]response.GroupResponse, len(groups)),
		Total:  total,
		Page:   req.Page,
		Size:   req.PageSize,
	}

	for i, group := range groups {
		resp.Groups[i] = response.ConvertToGroupResponse(&group)
	}

	return resp, nil
}

// JoinGroup xin tham gia nhóm
func (s *groupService) JoinGroup(ctx context.Context, userID int64, req *request.GroupJoinRequest) error {
	// Kiểm tra nhóm có tồn tại không
	group, err := s.groupRepo.FindByID(ctx, req.GroupID)
	if err != nil {
		return err
	}
	if group == nil {
		return errors.New("nhóm không tồn tại")
	}

	// Kiểm tra người dùng đã là thành viên chưa
	existingMember, err := s.memberRepo.FindByUserAndGroup(ctx, userID, req.GroupID)
	if err != nil {
		return err
	}
	if existingMember != nil {
		return errors.New("bạn đã là thành viên hoặc đã gửi yêu cầu tham gia trước đó")
	}

	// Xác định trạng thái thành viên dựa vào loại nhóm
	status := models.GroupMemberStatusPending
	if group.Privacy == models.GroupPrivacyPublic {
		status = models.GroupMemberStatusApproved
	}

	// Tạo yêu cầu tham gia
	member := &models.GroupMember{
		GroupID:  req.GroupID,
		UserID:   userID,
		Role:     models.MemberRoleMember,
		Nickname: req.Nickname,
		Status:   status,
		JoinedAt: time.Now(),
	}

	err = s.memberRepo.Create(ctx, member)
	if err != nil {
		return fmt.Errorf("lỗi khi gửi yêu cầu tham gia: %v", err)
	}

	// Nếu là nhóm công khai, tăng số lượng thành viên
	if group.Privacy == models.GroupPrivacyPublic {
		err = s.groupRepo.IncrementMemberCount(ctx, group.ID)
		if err != nil {
			return fmt.Errorf("lỗi khi cập nhật số lượng thành viên: %v", err)
		}
	}

	return nil
}

// LeaveGroup rời khỏi nhóm
func (s *groupService) LeaveGroup(ctx context.Context, userID, groupID int64) error {
	// Kiểm tra người dùng có phải là thành viên không
	member, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
	if err != nil {
		return err
	}
	if member == nil || member.Status != models.GroupMemberStatusApproved {
		return errors.New("bạn không phải là thành viên của nhóm này")
	}

	// Không cho phép người tạo nhóm rời nhóm, chỉ có thể xóa nhóm
	group, err := s.groupRepo.FindByID(ctx, groupID)
	if err != nil {
		return err
	}
	if group.CreatedBy == userID {
		return errors.New("người tạo nhóm không thể rời nhóm, chỉ có thể xóa nhóm")
	}

	// Xóa thành viên
	err = s.memberRepo.Delete(ctx, member.ID)
	if err != nil {
		return fmt.Errorf("lỗi khi rời nhóm: %v", err)
	}

	// Giảm số lượng thành viên
	err = s.groupRepo.DecrementMemberCount(ctx, groupID)
	if err != nil {
		return fmt.Errorf("lỗi khi cập nhật số lượng thành viên: %v", err)
	}

	return nil
}

// InviteMember mời người dùng tham gia nhóm
func (s *groupService) InviteMember(ctx context.Context, userID, groupID int64, req *request.GroupMemberActionRequest) error {
	// Kiểm tra quyền mời thành viên (phải là admin)
	member, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
	if err != nil {
		return err
	}
	if member == nil || member.Status != models.GroupMemberStatusApproved || member.Role != models.MemberRoleAdmin {
		return errors.New("bạn không có quyền mời thành viên")
	}

	// Kiểm tra người được mời có tồn tại không
	user, err := s.userRepo.FindByID(ctx, req.UserID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("người dùng không tồn tại")
	}

	// Kiểm tra người dùng đã là thành viên chưa
	existingMember, err := s.memberRepo.FindByUserAndGroup(ctx, req.UserID, groupID)
	if err != nil {
		return err
	}
	if existingMember != nil {
		return errors.New("người dùng đã là thành viên hoặc đã được mời trước đó")
	}

	// Tạo lời mời tham gia
	newMember := &models.GroupMember{
		GroupID:  groupID,
		UserID:   req.UserID,
		Role:     models.MemberRoleMember,
		Status:   models.GroupMemberStatusPending,
		JoinedAt: time.Now(),
	}

	return s.memberRepo.Create(ctx, newMember)
}

// ApproveJoinRequest chấp nhận yêu cầu tham gia
func (s *groupService) ApproveJoinRequest(ctx context.Context, userID, groupID int64, req *request.GroupMemberActionRequest) error {
	// Kiểm tra quyền phê duyệt (phải là admin)
	admin, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
	if err != nil {
		return err
	}
	if admin == nil || admin.Status != models.GroupMemberStatusApproved || admin.Role != models.MemberRoleAdmin {
		return errors.New("bạn không có quyền phê duyệt yêu cầu tham gia")
	}

	// Lấy thông tin yêu cầu tham gia
	member, err := s.memberRepo.FindByUserAndGroup(ctx, req.UserID, groupID)
	if err != nil {
		return err
	}
	if member == nil || member.Status != models.GroupMemberStatusPending {
		return errors.New("không tìm thấy yêu cầu tham gia")
	}

	// Cập nhật trạng thái thành viên
	member.Status = models.GroupMemberStatusApproved
	err = s.memberRepo.Update(ctx, member)
	if err != nil {
		return fmt.Errorf("lỗi khi chấp nhận yêu cầu: %v", err)
	}

	// Tăng số lượng thành viên
	err = s.groupRepo.IncrementMemberCount(ctx, groupID)
	if err != nil {
		return fmt.Errorf("lỗi khi cập nhật số lượng thành viên: %v", err)
	}

	return nil
}

// RejectJoinRequest từ chối yêu cầu tham gia
func (s *groupService) RejectJoinRequest(ctx context.Context, userID, groupID int64, req *request.GroupMemberActionRequest) error {
	// Kiểm tra quyền từ chối (phải là admin)
	admin, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
	if err != nil {
		return err
	}
	if admin == nil || admin.Status != models.GroupMemberStatusApproved || admin.Role != models.MemberRoleAdmin {
		return errors.New("bạn không có quyền từ chối yêu cầu tham gia")
	}

	// Lấy thông tin yêu cầu tham gia
	member, err := s.memberRepo.FindByUserAndGroup(ctx, req.UserID, groupID)
	if err != nil {
		return err
	}
	if member == nil || member.Status != models.GroupMemberStatusPending {
		return errors.New("không tìm thấy yêu cầu tham gia")
	}

	// Cập nhật trạng thái thành viên
	member.Status = models.GroupMemberStatusRejected
	return s.memberRepo.Update(ctx, member)
}

// RemoveMember xóa thành viên khỏi nhóm
func (s *groupService) RemoveMember(ctx context.Context, userID, groupID int64, req *request.GroupMemberActionRequest) error {
	// Kiểm tra quyền xóa thành viên (phải là admin)
	admin, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
	if err != nil {
		return err
	}
	if admin == nil || admin.Status != models.GroupMemberStatusApproved || admin.Role != models.MemberRoleAdmin {
		return errors.New("bạn không có quyền xóa thành viên")
	}

	// Lấy thông tin người bị xóa
	member, err := s.memberRepo.FindByUserAndGroup(ctx, req.UserID, groupID)
	if err != nil {
		return err
	}
	if member == nil || member.Status != models.GroupMemberStatusApproved {
		return errors.New("không tìm thấy thành viên này")
	}

	// Không thể xóa người tạo nhóm
	group, err := s.groupRepo.FindByID(ctx, groupID)
	if err != nil {
		return err
	}
	if group.CreatedBy == req.UserID {
		return errors.New("không thể xóa người tạo nhóm")
	}

	// Xóa thành viên
	err = s.memberRepo.Delete(ctx, member.ID)
	if err != nil {
		return fmt.Errorf("lỗi khi xóa thành viên: %v", err)
	}

	// Giảm số lượng thành viên
	err = s.groupRepo.DecrementMemberCount(ctx, groupID)
	if err != nil {
		return fmt.Errorf("lỗi khi cập nhật số lượng thành viên: %v", err)
	}

	return nil
}

// UpdateMember cập nhật thông tin thành viên
func (s *groupService) UpdateMember(ctx context.Context, userID, groupID, memberID int64, req *request.GroupMemberUpdateRequest) (*response.GroupMemberResponse, error) {
	// Kiểm tra quyền cập nhật (phải là admin hoặc chính thành viên đó)
	isAdmin := false
	currentMember, err := s.memberRepo.FindByUserAndGroup(ctx, userID, groupID)
	if err != nil {
		return nil, err
	}

	if currentMember != nil && currentMember.Status == models.GroupMemberStatusApproved {
		if currentMember.Role == models.MemberRoleAdmin {
			isAdmin = true
		} else if currentMember.ID != memberID {
			return nil, errors.New("bạn không có quyền cập nhật thông tin thành viên khác")
		}
	} else {
		return nil, errors.New("bạn không có quyền cập nhật thông tin thành viên")
	}

	// Lấy thông tin thành viên cần cập nhật
	member, err := s.memberRepo.FindByID(ctx, memberID)
	if err != nil {
		return nil, err
	}
	if member == nil || member.GroupID != groupID {
		return nil, errors.New("không tìm thấy thành viên")
	}

	// Cập nhật thông tin
	if req.Nickname != "" {
		member.Nickname = req.Nickname
	}

	// Chỉ admin mới có thể cập nhật vai trò và trạng thái chặn
	if isAdmin {
		if req.Role != "" {
			if req.Role == "admin" {
				member.Role = models.MemberRoleAdmin
			} else {
				member.Role = models.MemberRoleMember
			}
		}

		if req.IsMuted != nil {
			member.IsMuted = *req.IsMuted
		}
	}

	// Lưu cập nhật
	err = s.memberRepo.Update(ctx, member)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi cập nhật thông tin thành viên: %v", err)
	}

	// Lấy thông tin đầy đủ
	updatedMember, err := s.memberRepo.FindByID(ctx, memberID)
	if err != nil {
		return nil, err
	}

	// Chuyển đổi sang response
	resp := response.ConvertToGroupMemberResponse(updatedMember)
	return &resp, nil
}

// GetGroupMemberByID lấy thông tin thành viên nhóm theo ID
func (s *groupService) GetGroupMemberByID(ctx context.Context, memberID int64) (*response.GroupMemberResponse, error) {
	member, err := s.memberRepo.FindByID(ctx, memberID)
	if err != nil {
		return nil, err
	}
	if member == nil {
		return nil, errors.New("không tìm thấy thành viên")
	}

	resp := response.ConvertToGroupMemberResponse(member)
	return &resp, nil
}

// GetGroupMembers lấy danh sách thành viên nhóm
func (s *groupService) GetGroupMembers(ctx context.Context, groupID int64, req *request.GroupMemberListRequest) (*response.GroupMemberListResponse, error) {
	// Lấy danh sách thành viên có phân trang
	members, total, err := s.memberRepo.ListByGroup(ctx, groupID, req.Page, req.PageSize)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi lấy danh sách thành viên: %v", err)
	}

	// Chuyển đổi sang response
	resp := &response.GroupMemberListResponse{
		Members: make([]response.GroupMemberResponse, len(members)),
		Total:   total,
		Page:    req.Page,
		Size:    req.PageSize,
	}

	for i, member := range members {
		resp.Members[i] = response.ConvertToGroupMemberResponse(&member)
	}

	return resp, nil
}

// CreateGroupRole tạo vai trò mới trong nhóm
func (s *groupService) CreateGroupRole(ctx context.Context, userID, groupID int64, req *request.GroupRoleCreateRequest) (*response.GroupRoleResponse, error) {
	// TODO: Implement when needed
	return nil, errors.New("chức năng này chưa được triển khai")
}

// UpdateGroupRole cập nhật vai trò trong nhóm
func (s *groupService) UpdateGroupRole(ctx context.Context, userID, groupID, roleID int64, req *request.GroupRoleUpdateRequest) (*response.GroupRoleResponse, error) {
	// TODO: Implement when needed
	return nil, errors.New("chức năng này chưa được triển khai")
}

// DeleteGroupRole xóa vai trò trong nhóm
func (s *groupService) DeleteGroupRole(ctx context.Context, userID, groupID, roleID int64) error {
	// TODO: Implement when needed
	return errors.New("chức năng này chưa được triển khai")
}

// GetGroupRoles lấy danh sách vai trò trong nhóm
func (s *groupService) GetGroupRoles(ctx context.Context, groupID int64) (*response.GroupRoleListResponse, error) {
	// TODO: Implement when needed
	return nil, errors.New("chức năng này chưa được triển khai")
}

// AssignRoleToMember gán vai trò cho thành viên
func (s *groupService) AssignRoleToMember(ctx context.Context, userID, groupID, memberID int64, req *request.GroupMemberRoleRequest) error {
	// TODO: Implement when needed
	return errors.New("chức năng này chưa được triển khai")
}

// RemoveRoleFromMember gỡ bỏ vai trò khỏi thành viên
func (s *groupService) RemoveRoleFromMember(ctx context.Context, userID, groupID, memberID, roleID int64) error {
	// TODO: Implement when needed
	return errors.New("chức năng này chưa được triển khai")
}
