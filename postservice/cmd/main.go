package main

import (
	"log"
	"postservice/internal/config"
	"postservice/internal/handler"
	"postservice/internal/repository"

	"github.com/gin-contrib/cors" // Thêm package cors
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

	// Thêm middleware CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Origin của frontend
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 giờ
	}))

	// Đăng ký route
	handler.SetupRoutes(r, repo)

	// Chạy server
	r.Run(cfg.ServerPort)
}
