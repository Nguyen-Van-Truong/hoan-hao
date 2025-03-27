package grpc

import (
	"context"
	"fmt"
	"log"
	"net"
	_ "strconv"

	"userservice2/proto"
	"userservice2/services"

	"google.golang.org/grpc"
)

// UserGRPCServer triển khai interface của gRPC server
type UserGRPCServer struct {
	proto.UnimplementedUserServiceServer
	userService services.UserService
}

// NewUserGRPCServer tạo mới một instance của UserGRPCServer
func NewUserGRPCServer(userService services.UserService) *UserGRPCServer {
	return &UserGRPCServer{
		userService: userService,
	}
}

// GetUsersByIDs xử lý request lấy thông tin users theo danh sách IDs
func (s *UserGRPCServer) GetUsersByIDs(ctx context.Context, req *proto.GetUsersByIDsRequest) (*proto.GetUsersByIDsResponse, error) {
	log.Printf("Received gRPC request for GetUsersByIDs with %d ids", len(req.UserIds))

	response := &proto.GetUsersByIDsResponse{
		Users: make([]*proto.UserProfile, 0, len(req.UserIds)),
	}

	// Chuyển đổi từ uint64 sang int64 vì model User.ID là int64
	for _, id := range req.UserIds {
		// Chuyển đổi uint64 -> int64
		userID := int64(id)

		// Gọi service để lấy thông tin user
		user, err := s.userService.GetUserByID(ctx, userID)
		if err == nil && user != nil {
			// Tạo UserProfile từ thông tin user tìm được
			userProfile := &proto.UserProfile{
				Id:                uint64(user.ID),
				Username:          user.Username,
				FullName:          user.FullName,
				ProfilePictureUrl: user.ProfilePictureURL,
			}
			response.Users = append(response.Users, userProfile)
		} else {
			log.Printf("User with ID %d not found or error: %v", id, err)
		}
	}

	log.Printf("Returning %d users for gRPC request", len(response.Users))
	return response, nil
}

// GetUserIDByUsername xử lý request lấy user_id từ username
func (s *UserGRPCServer) GetUserIDByUsername(ctx context.Context, req *proto.GetUserIDByUsernameRequest) (*proto.GetUserIDByUsernameResponse, error) {
	log.Printf("Received gRPC request for GetUserIDByUsername with username: %s", req.Username)

	// Gọi service để lấy thông tin user từ username
	user, err := s.userService.GetUserByUsername(ctx, req.Username)
	if err != nil {
		log.Printf("Error getting user by username: %v", err)
		return nil, err
	}

	if user == nil {
		log.Printf("User with username %s not found", req.Username)
		return nil, fmt.Errorf("user with username %s not found", req.Username)
	}

	// Trả về user_id
	response := &proto.GetUserIDByUsernameResponse{
		UserId: uint64(user.ID),
	}

	log.Printf("Returning user_id %d for username %s", response.UserId, req.Username)
	return response, nil
}

// StartGRPCServer khởi động gRPC server
func StartGRPCServer(userService services.UserService, port int) {
	addr := fmt.Sprintf(":%d", port)
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("Failed to listen on %s: %v", addr, err)
	}

	grpcServer := grpc.NewServer()
	userGRPCServer := NewUserGRPCServer(userService)
	proto.RegisterUserServiceServer(grpcServer, userGRPCServer)

	log.Printf("gRPC server listening on %s", addr)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC server: %v", err)
	}
}
