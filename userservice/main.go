package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/joho/godotenv" // Thêm thư viện godotenv
	"log"
	"os"
	"time"
)

var db *gorm.DB
var err error

// Định nghĩa cấu trúc UserProfile
type UserProfile struct {
	ID         uint      `json:"id"`
	Username   string    `json:"username"`
	FullName   string    `json:"full_name"`
	IsActive   bool      `json:"is_active"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (UserProfile) TableName() string {
	return "user_profile" // Specify the exact table name
}

// Định nghĩa cấu trúc UserEmail
type UserEmail struct {
	ID     uint   `json:"id"`
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
}

// Định nghĩa DTO cho việc tạo hồ sơ người dùng
type UserProfileRequestDto struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"fullname"`
}

func initDB() {
	// Nạp các biến môi trường từ file .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Lấy thông tin kết nối từ môi trường
	DB_HOST := os.Getenv("DB_HOST")
	DB_PORT := os.Getenv("DB_PORT")
	DB_USERNAME := os.Getenv("DB_USERNAME")
	DB_PASSWORD := os.Getenv("DB_PASSWORD")
	DB_NAME := os.Getenv("DB_NAME")

	// Xây dựng chuỗi kết nối
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME)

	// Kết nối tới MySQL
	db, err = gorm.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Cannot connect to database:", err)
	}

	// Tự động tạo bảng cho UserProfile và UserEmail nếu chưa có
	db.AutoMigrate(&UserProfile{}, &UserEmail{})
}

func createProfile(c *gin.Context) {
	var userProfile UserProfileRequestDto
	if err := c.ShouldBindJSON(&userProfile); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	// Kiểm tra nếu tài khoản đã tồn tại
	var existingUser UserProfile
	if err := db.Where("username = ?", userProfile.Username).First(&existingUser).Error; err == nil {
		c.JSON(400, gin.H{"error": "Username already exists"})
		return
	}

	// Tạo đối tượng UserProfile và lưu vào cơ sở dữ liệu
	userProfileEntity := UserProfile{
		Username:   userProfile.Username,
		FullName:   userProfile.FullName,
		IsActive:   true,
		IsVerified: false,
		CreatedAt:  time.Now(),
	}

	// Lưu UserProfile vào DB (lưu vào bảng user_profile)
	if err := db.Create(&userProfileEntity).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user profile"})
		return
	}

	// Lưu Email vào bảng user_emails (sử dụng đúng user_id từ user_profile)
	userEmailEntity := UserEmail{
		UserID: userProfileEntity.ID, // Dùng ID của UserProfile vừa tạo
		Email:  userProfile.Email,
	}
	if err := db.Create(&userEmailEntity).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to save email"})
		return
	}

	c.JSON(200, gin.H{"message": "User profile created successfully"})
}

func main() {
	// Khởi tạo DB
	initDB()

	// Khởi tạo router Gin
	r := gin.Default()

	// API tạo hồ sơ người dùng
	r.POST("/api/user/createProfile", createProfile)

	// Chạy server
	r.Run(":8081")
}
