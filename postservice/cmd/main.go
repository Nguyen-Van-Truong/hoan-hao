package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"postservice/internal/config"
	"postservice/internal/grpcclient"
	"postservice/internal/handler"
	"postservice/internal/repository"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

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

	// Khởi tạo repository
	repo := repository.NewPostRepository(db)

	// Khởi tạo gRPC client tới UserService, lấy địa chỉ từ config
	userServiceAddr := os.Getenv("USER_SERVICE_ADDR")
	if userServiceAddr == "" {
		userServiceAddr = "localhost:50051" // Default nếu không có trong .env
	}
	if err := grpcclient.InitUserServiceClient(userServiceAddr); err != nil {
		log.Fatalf("Failed to initialize gRPC client: %v", err)
	}

	// Khởi tạo Gin router
	r := gin.Default()

	// Đăng ký các route HTTP
	handler.SetupRoutes(r, repo)

	// Khởi tạo HTTP server
	server := &http.Server{
		Addr:    cfg.ServerPort,
		Handler: r,
	}

	// Chạy server trong goroutine
	go func() {
		log.Printf("Starting PostService on %s", cfg.ServerPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Chờ tín hiệu dừng server (Ctrl+C hoặc SIGTERM)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan

	// Bắt đầu graceful shutdown
	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Đóng HTTP server
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
	}

	// Đóng gRPC connection
	grpcclient.Close()

	log.Println("Server stopped")
}
