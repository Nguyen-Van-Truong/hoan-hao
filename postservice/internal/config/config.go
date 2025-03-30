package config

import (
	"fmt"
	"os"
	"postservice/internal/model"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/joho/godotenv"
)

// Config chứa các thông tin cấu hình
type Config struct {
	DBHost          string
	DBPort          string
	DBUsername      string
	DBPassword      string
	DBName          string
	ServerPort      string
	UserServiceAddr string // Thêm địa chỉ UserService
}

// Load đọc cấu hình từ .env
func Load() *Config {
	// Load file .env, panic nếu không tìm thấy
	err := godotenv.Load()
	if err != nil {
		panic("Error loading .env file")
	}

	return &Config{
		DBHost:          os.Getenv("DB_HOST"),
		DBPort:          os.Getenv("DB_PORT"),
		DBUsername:      os.Getenv("DB_USERNAME"),
		DBPassword:      os.Getenv("DB_PASSWORD"),
		DBName:          os.Getenv("DB_NAME"),
		ServerPort:      getEnvOrDefault("SERVER_PORT", ":8082"),                 // Default port nếu không có
		UserServiceAddr: getEnvOrDefault("USER_SERVICE_ADDR", "localhost:50051"), // Default gRPC addr
	}
}

// getEnvOrDefault trả về giá trị từ env hoặc default nếu không tồn tại
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// InitDB khởi tạo kết nối đến MySQL
func InitDB(cfg *Config) (*gorm.DB, error) {
	// Chuỗi kết nối MySQL
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUsername, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	// Mở kết nối
	db, err := gorm.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	// Auto migrate bảng posts
	db.AutoMigrate(&model.Post{})
	return db, nil
}
