// cmd/main.go
package main

import (
	"log"
	"postservice/internal/config"
	"postservice/internal/handler"
	"postservice/internal/repository"

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

	// Khởi tạo router Gin
	r := gin.Default()

	// Đăng ký route
	handler.SetupRoutes(r, repo)

	// Chạy server
	r.Run(cfg.ServerPort)
}
