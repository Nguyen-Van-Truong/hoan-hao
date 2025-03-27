package utils

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"userservice2/proto"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	userClientOnce sync.Once
	userClient     proto.UserServiceClient
	userConn       *grpc.ClientConn
)

// initUserGRPCClient khởi tạo kết nối gRPC đến UserService
func initUserGRPCClient() {
	userClientOnce.Do(func() {
		// Lấy thông tin kết nối từ biến môi trường hoặc sử dụng giá trị mặc định
		grpcHost := os.Getenv("USER_GRPC_HOST")
		if grpcHost == "" {
			grpcHost = "localhost" // Mặc định localhost
		}

		grpcPortStr := os.Getenv("USER_GRPC_PORT")
		if grpcPortStr == "" {
			grpcPortStr = "50051" // Mặc định port 50051
		}

		grpcPort, err := strconv.Atoi(grpcPortStr)
		if err != nil {
			log.Printf("Invalid USER_GRPC_PORT: %s, using default 50051", grpcPortStr)
			grpcPort = 50051
		}

		addr := fmt.Sprintf("%s:%d", grpcHost, grpcPort)
		log.Printf("Connecting to UserService gRPC at %s", addr)

		// Tạo kết nối gRPC không bảo mật (chỉ cho môi trường phát triển)
		conn, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			log.Printf("Failed to connect to UserService gRPC: %v", err)
			return
		}

		userConn = conn
		userClient = proto.NewUserServiceClient(conn)
		log.Printf("Connected to UserService gRPC at %s", addr)
	})
}

// GetUserGRPCClient trả về client gRPC để gọi UserService
func GetUserGRPCClient() proto.UserServiceClient {
	if userClient == nil {
		initUserGRPCClient()
	}
	return userClient
}

// CloseUserGRPCConnection đóng kết nối gRPC
func CloseUserGRPCConnection() {
	if userConn != nil {
		userConn.Close()
		userConn = nil
		userClient = nil
	}
}

// GetUserIDByUsername gọi gRPC để lấy user_id từ username
func GetUserIDByUsername(ctx context.Context, username string) (int64, error) {
	client := GetUserGRPCClient()
	if client == nil {
		return 0, fmt.Errorf("failed to get user gRPC client")
	}

	// Tạo timeout context
	timeoutCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Gọi gRPC method
	request := &proto.GetUserIDByUsernameRequest{
		Username: username,
	}

	response, err := client.GetUserIDByUsername(timeoutCtx, request)
	if err != nil {
		log.Printf("Failed to call GetUserIDByUsername: %v", err)
		return 0, fmt.Errorf("failed to get user ID from username: %v", err)
	}

	// Chuyển đổi từ uint64 sang int64 (vì model sử dụng int64)
	return int64(response.UserId), nil
}
