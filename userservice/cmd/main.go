package main

import (
	"context"
	"log"
	"net"
	"userservice/internal/config"
	"userservice/internal/handler"
	"userservice/internal/repository"
	"userservice/internal/service"
	pb "userservice/proto"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
)

// grpcServer định nghĩa server gRPC cho UserService
type grpcServer struct {
	pb.UnimplementedUserServiceServer
	svc service.UserService
}

// GetUsersByIDs xử lý yêu cầu gRPC để lấy thông tin nhiều user
func (s *grpcServer) GetUsersByIDs(ctx context.Context, req *pb.GetUsersByIDsRequest) (*pb.GetUsersByIDsResponse, error) {
	var users []*pb.UserProfile
	for _, id := range req.UserIds {
		// Gọi service để lấy profile, không ép kiểu uint để tránh tràn số
		profile, err := s.svc.GetMyProfile(uint(id))
		if err != nil {
			log.Printf("User not found for ID %d: %v", id, err)
			continue // Bỏ qua user không tìm thấy thay vì dừng hoàn toàn
		}
		users = append(users, &pb.UserProfile{
			Id:                uint64(profile.ID), // Giữ uint64 để đồng bộ với proto
			Username:          profile.Username,
			FullName:          profile.FullName,
			ProfilePictureUrl: profile.ProfilePictureURL,
		})
	}
	return &pb.GetUsersByIDsResponse{Users: users}, nil
}

func main() {
	// Load cấu hình từ .env
	cfg := config.Load()

	// Khởi tạo kết nối database
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Cannot connect to database: %v", err)
	}
	// Đóng DB khi chương trình kết thúc, kiểm tra lỗi
	defer func() {
		if err := db.Close(); err != nil {
			log.Printf("Failed to close database: %v", err)
		}
	}()

	// Khởi tạo repository và service
	repo := repository.NewUserRepository(db)
	svc := service.NewUserService(repo)

	// Khởi tạo Gin router cho HTTP server
	r := gin.Default()
	handler.SetupRoutes(r, repo)

	// Chạy HTTP server trong goroutine
	go func() {
		log.Printf("Starting HTTP server on %s", cfg.ServerPort)
		if err := r.Run(cfg.ServerPort); err != nil {
			log.Fatalf("Failed to start HTTP server: %v", err)
		}
	}()

	// Khởi tạo gRPC server trên port 50051
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen on port 50051: %v", err)
	}
	grpcSvr := grpc.NewServer()
	pb.RegisterUserServiceServer(grpcSvr, &grpcServer{svc: svc})

	// Bắt đầu chạy gRPC server
	log.Println("Starting gRPC server on :50051")
	if err := grpcSvr.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC: %v", err)
	}
}
