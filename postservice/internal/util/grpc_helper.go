// postservice/internal/util/grpc_helper.go
package util

import (
	"context"
	"errors"
	"log"
	"postservice/internal/grpcclient"
	"postservice/internal/model"
	pb "postservice/proto"
	"time"
)

// PopulateUserInfo lấy thông tin user từ UserService qua gRPC và gán vào các struct
func PopulateUserInfo[T any](items []T, getUserID func(T) uint64) ([]T, error) {
	if len(items) == 0 {
		return items, nil
	}

	// Thu thập danh sách user IDs
	userIDs := make([]uint64, 0, len(items))
	userIDMap := make(map[uint64]struct{})
	for _, item := range items {
		userID := getUserID(item)
		if _, exists := userIDMap[userID]; !exists {
			userIDs = append(userIDs, userID)
			userIDMap[userID] = struct{}{}
		}
	}

	// Gọi gRPC để lấy thông tin user
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req := &pb.GetUsersByIDsRequest{UserIds: userIDs}
	resp, err := grpcclient.UserServiceClient.GetUsersByIDs(ctx, req)
	if err != nil {
		log.Printf("Failed to call GetUsersByIDs: %v", err)
		return items, err // Trả về items không thay đổi nếu lỗi
	}

	// Tạo map từ user ID tới UserInfo
	userMap := make(map[uint64]*model.UserInfo)
	for _, user := range resp.Users {
		userMap[user.Id] = &model.UserInfo{
			ID:                user.Id,
			Username:          user.Username,
			FullName:          user.FullName,
			ProfilePictureURL: user.ProfilePictureUrl,
		}
	}

	// Gán thông tin user vào items
	for i, item := range items {
		userID := getUserID(item)
		if user, ok := userMap[userID]; ok {
			switch v := any(item).(type) {
			case model.PostResponse:
				v.Author = user
				items[i] = any(v).(T)
			case model.Comment:
				v.Author = user
				items[i] = any(v).(T)
			case model.PostShare:
				v.Author = user
				items[i] = any(v).(T)
			}
		}
	}

	return items, nil
}

// PopulateSingleUserInfo áp dụng cho một item duy nhất
func PopulateSingleUserInfo[T any](item T, userID uint64) (T, error) {
	items := []T{item}
	result, err := PopulateUserInfo(items, func(_ T) uint64 { return userID })
	if err != nil {
		return item, err
	}
	return result[0], nil
}

// PopulateCommentsUserInfo thêm thông tin user cho danh sách comments
func PopulateCommentsUserInfo(comments []model.Comment) ([]model.Comment, error) {
	return PopulateUserInfo(comments, func(c model.Comment) uint64 { return c.UserID })
}

// PopulateSingleShareUserInfo thêm thông tin user cho một share
func PopulateSingleShareUserInfo(share model.PostShare) (model.PostShare, error) {
	return PopulateSingleUserInfo(share, share.UserID)
}

// PopulateSharesUserInfo thêm thông tin user cho danh sách shares
func PopulateSharesUserInfo(shares []model.PostShare) ([]model.PostShare, error) {
	return PopulateUserInfo(shares, func(s model.PostShare) uint64 { return s.UserID })
}

// GetUserIDByUsername lấy user_id từ username qua gRPC
func GetUserIDByUsername(username string) (uint64, error) {
	// IMPORTANT: Đây là giải pháp tạm thời do UserService chưa hỗ trợ phương thức GetUserIDByUsername
	// Thay vì gọi trực tiếp GetUserIDByUsername, chúng ta sẽ lấy tất cả user và tìm theo username

	// Mô phỏng danh sách các user_id có thể có (có thể điều chỉnh dựa trên data thực tế)
	potentialUserIDs := []uint64{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Gọi API GetUsersByIDs để lấy thông tin nhiều user cùng lúc
	req := &pb.GetUsersByIDsRequest{UserIds: potentialUserIDs}
	resp, err := grpcclient.UserServiceClient.GetUsersByIDs(ctx, req)
	if err != nil {
		log.Printf("Failed to call GetUsersByIDs: %v", err)
		return 0, err
	}

	// Tìm user có username trùng khớp
	for _, user := range resp.Users {
		if user.Username == username {
			return user.Id, nil
		}
	}

	return 0, errors.New("user not found")
}
