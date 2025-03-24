package request

// FriendshipActionRequest là DTO cho các hành động về quan hệ bạn bè
type FriendshipActionRequest struct {
	FriendUsername string `json:"friend_username" binding:"required"`
}

// FriendListRequest là DTO cho việc lấy danh sách bạn bè
type FriendListRequest struct {
	Status   string `form:"status" binding:"omitempty,oneof=pending accepted rejected blocked"`
	Page     int    `form:"page,default=1" binding:"omitempty,min=1"`
	PageSize int    `form:"page_size,default=10" binding:"omitempty,min=1,max=100"`
}

// FriendRequestsListRequest là DTO cho việc lấy danh sách lời mời kết bạn
type FriendRequestsListRequest struct {
	Type     string `form:"type,default=incoming" binding:"omitempty,oneof=incoming outgoing"`
	Page     int    `form:"page,default=1" binding:"omitempty,min=1"`
	PageSize int    `form:"page_size,default=10" binding:"omitempty,min=1,max=100"`
}

// FriendSuggestionsRequest là DTO cho việc lấy gợi ý kết bạn
type FriendSuggestionsRequest struct {
	Limit int `form:"limit,default=10" binding:"omitempty,min=1,max=50"`
}
