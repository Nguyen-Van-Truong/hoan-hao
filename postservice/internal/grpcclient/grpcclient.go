package grpcclient

import (
	"log"
	pb "postservice/proto"
	"sync"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	UserServiceClient pb.UserServiceClient // Client gRPC để gọi UserService
	conn              *grpc.ClientConn     // Kết nối gRPC
	once              sync.Once            // Đảm bảo khởi tạo client chỉ một lần
)

// InitUserServiceClient khởi tạo gRPC client
func InitUserServiceClient(addr string) error {
	var err error
	once.Do(func() {
		// Tạo kết nối gRPC với UserService
		conn, err = grpc.Dial(
			addr,
			grpc.WithTransportCredentials(insecure.NewCredentials()), // Không dùng TLS (dev only)
			grpc.WithBlock(), // Chờ đến khi kết nối thành công
		)
		if err != nil {
			log.Printf("Failed to dial gRPC server at %s: %v", addr, err)
			return
		}
		UserServiceClient = pb.NewUserServiceClient(conn)
	})
	return err
}

// Close đóng kết nối gRPC
func Close() {
	if conn != nil {
		if err := conn.Close(); err != nil {
			log.Printf("Failed to close gRPC connection: %v", err)
		}
	}
}
