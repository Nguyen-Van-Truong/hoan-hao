package request

// GroupCreateRequest là DTO cho việc tạo nhóm mới
type GroupCreateRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description" binding:"max=1000"`
	Privacy     string `json:"privacy" binding:"omitempty,oneof=public private"`
	CoverImage  string `json:"cover_image" binding:"omitempty,url"`
}

// GroupUpdateRequest là DTO cho việc cập nhật thông tin nhóm
type GroupUpdateRequest struct {
	Name        string `json:"name" binding:"omitempty,min=3,max=100"`
	Description string `json:"description" binding:"omitempty,max=1000"`
	Privacy     string `json:"privacy" binding:"omitempty,oneof=public private"`
	CoverImage  string `json:"cover_image" binding:"omitempty,url"`
}

// GroupListRequest là DTO cho việc lấy danh sách nhóm
type GroupListRequest struct {
	Query    string `form:"query" binding:"omitempty,max=100"`
	Privacy  string `form:"privacy" binding:"omitempty,oneof=public private"`
	Page     int    `form:"page,default=1" binding:"omitempty,min=1"`
	PageSize int    `form:"page_size,default=10" binding:"omitempty,min=1,max=100"`
}

// GroupMemberListRequest là DTO cho việc lấy danh sách thành viên nhóm
type GroupMemberListRequest struct {
	Role     string `form:"role" binding:"omitempty,oneof=member admin"`
	Status   string `form:"status" binding:"omitempty,oneof=pending approved rejected"`
	Page     int    `form:"page,default=1" binding:"omitempty,min=1"`
	PageSize int    `form:"page_size,default=10" binding:"omitempty,min=1,max=100"`
}

// GroupJoinRequest là DTO cho việc xin tham gia nhóm
type GroupJoinRequest struct {
	GroupID  int64  `json:"group_id" binding:"required"`
	Nickname string `json:"nickname" binding:"omitempty,max=50"`
}

// GroupMemberActionRequest là DTO cho các hành động liên quan đến thành viên nhóm
type GroupMemberActionRequest struct {
	UserID int64 `json:"user_id" binding:"required"`
}

// GroupMemberUpdateRequest là DTO cho việc cập nhật thông tin thành viên
type GroupMemberUpdateRequest struct {
	Role     string `json:"role" binding:"omitempty,oneof=member admin"`
	Nickname string `json:"nickname" binding:"omitempty,max=50"`
	IsMuted  *bool  `json:"is_muted" binding:"omitempty"`
}

// GroupRoleCreateRequest là DTO cho việc tạo vai trò mới trong nhóm
type GroupRoleCreateRequest struct {
	Name        string          `json:"name" binding:"required,min=3,max=50"`
	Permissions map[string]bool `json:"permissions" binding:"required"`
}

// GroupRoleUpdateRequest là DTO cho việc cập nhật vai trò trong nhóm
type GroupRoleUpdateRequest struct {
	Name        string          `json:"name" binding:"omitempty,min=3,max=50"`
	Permissions map[string]bool `json:"permissions" binding:"omitempty"`
}

// GroupMemberRoleRequest là DTO cho việc gán vai trò cho thành viên
type GroupMemberRoleRequest struct {
	RoleID int64 `json:"role_id" binding:"required"`
}
