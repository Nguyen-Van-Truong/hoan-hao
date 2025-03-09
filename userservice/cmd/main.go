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

type grpcServer struct {
	pb.UnimplementedUserServiceServer
	svc service.UserService
}

func (s *grpcServer) GetUsersByIDs(ctx context.Context, req *pb.GetUsersByIDsRequest) (*pb.GetUsersByIDsResponse, error) {
	var users []*pb.UserProfile
	for _, id := range req.UserIds {
		profile, err := s.svc.GetMyProfile(uint(id)) // Ép kiểu uint64 sang uint
		if err == nil {
			users = append(users, &pb.UserProfile{
				Id:                uint64(profile.ID),
				Username:          profile.Username,
				FullName:          profile.FullName,
				ProfilePictureUrl: profile.ProfilePictureURL,
			})
		} else {
			log.Printf("User not found for ID %d: %v", id, err)
		}
	}
	return &pb.GetUsersByIDsResponse{Users: users}, nil
}

func main() {
	// Load cấu hình
	cfg := config.Load()

	// Khởi tạo DB
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatal("Cannot connect to database:", err)
	}
	defer db.Close()

	// Khởi tạo repository và service
	repo := repository.NewUserRepository(db)
	svc := service.NewUserService(repo)

	// Khởi tạo router Gin
	r := gin.Default()

	// Đăng ký route HTTP
	handler.SetupRoutes(r, repo)

	// Chạy HTTP server trong goroutine
	go func() {
		log.Printf("Starting HTTP server on %s", cfg.ServerPort)
		if err := r.Run(cfg.ServerPort); err != nil {
			log.Fatalf("Failed to start HTTP server: %v", err)
		}
	}()

	// Khởi động gRPC server
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen on port 50051: %v", err)
	}
	grpcSvr := grpc.NewServer()
	pb.RegisterUserServiceServer(grpcSvr, &grpcServer{svc: svc})

	log.Println("Starting gRPC server on :50051")
	if err := grpcSvr.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC: %v", err)
	}
}
