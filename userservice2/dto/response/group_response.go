package response

import (
	"time"
	"userservice2/models"
)

// GroupResponse là DTO cho thông tin cơ bản của một nhóm
type GroupResponse struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Privacy     string    `json:"privacy"`
	CoverImage  string    `json:"cover_image"`
	Avatar      string    `json:"avatar"`
	MemberCount int       `json:"member_count"`
	CreatedBy   int64     `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Creator     UserBrief `json:"creator,omitempty"`
}

// GroupDetailResponse là DTO cho thông tin chi tiết của một nhóm
type GroupDetailResponse struct {
	GroupResponse
	CurrentUserMember *GroupMemberResponse `json:"current_user_member,omitempty"`
}

// GroupListResponse là DTO cho danh sách nhóm
type GroupListResponse struct {
	Groups []GroupResponse `json:"groups"`
	Total  int64           `json:"total"`
	Page   int             `json:"page"`
	Size   int             `json:"size"`
}

// GroupMemberResponse là DTO cho thông tin thành viên nhóm
type GroupMemberResponse struct {
	ID       int64      `json:"id"`
	GroupID  int64      `json:"group_id"`
	UserID   int64      `json:"user_id"`
	Role     string     `json:"role"`
	Nickname string     `json:"nickname"`
	IsMuted  bool       `json:"is_muted"`
	Status   string     `json:"status"`
	JoinedAt time.Time  `json:"joined_at"`
	LeftAt   *time.Time `json:"left_at,omitempty"`
	User     UserBrief  `json:"user,omitempty"`
}

// GroupMemberListResponse là DTO cho danh sách thành viên nhóm
type GroupMemberListResponse struct {
	Members []GroupMemberResponse `json:"members"`
	Total   int64                 `json:"total"`
	Page    int                   `json:"page"`
	Size    int                   `json:"size"`
}

// GroupRoleResponse là DTO cho thông tin vai trò trong nhóm
type GroupRoleResponse struct {
	ID          int64           `json:"id"`
	GroupID     int64           `json:"group_id"`
	Name        string          `json:"name"`
	Permissions map[string]bool `json:"permissions"`
	CreatedAt   time.Time       `json:"created_at"`
}

// GroupRoleListResponse là DTO cho danh sách vai trò trong nhóm
type GroupRoleListResponse struct {
	Roles []GroupRoleResponse `json:"roles"`
	Total int64               `json:"total"`
	Page  int                 `json:"page"`
	Size  int                 `json:"size"`
}

// ConvertToGroupResponse chuyển đổi từ model sang response
func ConvertToGroupResponse(group *models.UserGroup) GroupResponse {
	return GroupResponse{
		ID:          group.ID,
		Name:        group.Name,
		Description: group.Description,
		Privacy:     string(group.Privacy),
		CoverImage:  group.CoverImage,
		Avatar:      group.Avatar,
		MemberCount: group.MemberCount,
		CreatedBy:   group.CreatedBy,
		CreatedAt:   group.CreatedAt,
		UpdatedAt:   group.UpdatedAt,
		Creator: UserBrief{
			ID:                group.Creator.ID,
			Username:          group.Creator.Username,
			FullName:          group.Creator.FullName,
			ProfilePictureURL: group.Creator.ProfilePictureURL,
		},
	}
}

// ConvertToGroupMemberResponse chuyển đổi từ model sang response
func ConvertToGroupMemberResponse(member *models.GroupMember) GroupMemberResponse {
	return GroupMemberResponse{
		ID:       member.ID,
		GroupID:  member.GroupID,
		UserID:   member.UserID,
		Role:     string(member.Role),
		Nickname: member.Nickname,
		IsMuted:  member.IsMuted,
		Status:   string(member.Status),
		JoinedAt: member.JoinedAt,
		LeftAt:   member.LeftAt,
		User: UserBrief{
			ID:                member.User.ID,
			Username:          member.User.Username,
			FullName:          member.User.FullName,
			ProfilePictureURL: member.User.ProfilePictureURL,
		},
	}
}

// ConvertToGroupRoleResponse chuyển đổi từ model sang response
func ConvertToGroupRoleResponse(role *models.GroupRole) GroupRoleResponse {
	return GroupRoleResponse{
		ID:          role.ID,
		GroupID:     role.GroupID,
		Name:        role.Name,
		Permissions: role.Permissions,
		CreatedAt:   role.CreatedAt,
	}
}
