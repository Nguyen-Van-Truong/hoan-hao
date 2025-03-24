package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/joho/godotenv"

	"userservice2/controllers"
	"userservice2/grpc"
	"userservice2/middlewares"
	"userservice2/repositories"
	"userservice2/routes"
	"userservice2/services"
	"userservice2/utils"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Khởi tạo kết nối database trực tiếp vì configs chưa hoàn thiện
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME"))

	db, err := gorm.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer func(db *gorm.DB) {
		err := db.Close()
		if err != nil {
			log.Fatalf("Failed to close database connection: %v", err)
		}
	}(db)

	// Auto migrate database
	if err := utils.SetupDatabase(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration completed")

	// Khởi tạo Cloudinary uploader
	cloudinaryUploader, err := utils.NewCloudinaryUploader()
	if err != nil {
		log.Printf("Warning: Failed to initialize Cloudinary uploader: %v", err)
		log.Println("Image upload features will not be available")
		cloudinaryUploader = nil
	}

	// Enable Gin release mode in production
	env := os.Getenv("ENV")
	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := gin.Default()

	// Thêm JWT middleware để trích xuất userId
	router.Use(middlewares.JWTMiddleware())

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	friendshipRepo := repositories.NewFriendshipRepository(db)
	userGroupRepo := repositories.NewUserGroupRepository(db)
	groupMemberRepo := repositories.NewGroupMemberRepository(db)

	// Initialize services
	userService := services.NewUserService(userRepo)
	friendshipService := services.NewFriendshipService(friendshipRepo, userRepo)
	groupService := services.NewGroupService(userGroupRepo, groupMemberRepo, userRepo)

	// Initialize controllers
	userController := controllers.NewUserController(userService, cloudinaryUploader)
	friendshipController := controllers.NewFriendshipController(friendshipService)
	groupController := controllers.NewGroupController(groupService)

	// Setup routes
	routes.SetupRoutes(router, userController, friendshipController, groupController)

	// Khởi động gRPC server trong một goroutine
	grpcPort := 50051 // Port mặc định
	if grpcPortStr := os.Getenv("GRPC_PORT"); grpcPortStr != "" {
		if portNum, err := strconv.Atoi(grpcPortStr); err == nil {
			grpcPort = portNum
		}
	}
	log.Printf("Starting gRPC server on port %d", grpcPort)
	go grpc.StartGRPCServer(userService, grpcPort)

	// Start HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	serverAddr := fmt.Sprintf(":%s", port)
	log.Printf("HTTP server running on %s in %s mode\n", serverAddr, env)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start HTTP server: %v", err)
	}
}
