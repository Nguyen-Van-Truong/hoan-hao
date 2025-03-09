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

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load cấu hình
	cfg := config.Load()

	// Khởi tạo DB
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatal("Cannot connect to database:", err)
	}
	defer db.Close()

	// Khởi tạo repository
	repo := repository.NewPostRepository(db)

	// Khởi tạo gRPC client tới UserService
	grpcclient.InitUserServiceClient("localhost:50051") // Sửa từ "userservice:50051" sang "localhost:50051"

	// Khởi tạo router Gin
	r := gin.Default()

	// Thêm middleware CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	// Đăng ký route
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

	// Chờ tín hiệu dừng server
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan

	// Shutdown gracefully
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
