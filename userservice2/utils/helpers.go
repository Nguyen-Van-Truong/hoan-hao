package utils

import (
	"fmt"
	"math/rand"
	"regexp"
	"strings"
	"time"
)

// InitializeRandom khởi tạo bộ sinh số ngẫu nhiên
func InitializeRandom() {
	rand.Seed(time.Now().UnixNano())
}

// GenerateRandomString tạo một chuỗi ngẫu nhiên với độ dài cho trước
func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

// IsValidEmail kiểm tra email hợp lệ
func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	return emailRegex.MatchString(email)
}

// IsValidUsername kiểm tra tên người dùng hợp lệ
func IsValidUsername(username string) bool {
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]{3,20}$`)
	return usernameRegex.MatchString(username)
}

// NormalizeUsername chuẩn hóa tên người dùng
func NormalizeUsername(username string) string {
	return strings.ToLower(strings.TrimSpace(username))
}

// FormatPaginationLinks tạo liên kết phân trang
func FormatPaginationLinks(baseURL string, page, pageSize, totalPages int) map[string]string {
	links := make(map[string]string)

	// Link trang hiện tại
	links["self"] = fmt.Sprintf("%s?page=%d&pageSize=%d", baseURL, page, pageSize)

	// Link trang đầu tiên
	links["first"] = fmt.Sprintf("%s?page=1&pageSize=%d", baseURL, pageSize)

	// Link trang cuối cùng
	links["last"] = fmt.Sprintf("%s?page=%d&pageSize=%d", baseURL, totalPages, pageSize)

	// Link trang trước
	if page > 1 {
		links["prev"] = fmt.Sprintf("%s?page=%d&pageSize=%d", baseURL, page-1, pageSize)
	}

	// Link trang tiếp theo
	if page < totalPages {
		links["next"] = fmt.Sprintf("%s?page=%d&pageSize=%d", baseURL, page+1, pageSize)
	}

	return links
}

// CalculateTotalPages tính tổng số trang
func CalculateTotalPages(totalItems, pageSize int64) int64 {
	if pageSize == 0 {
		return 0
	}
	return (totalItems + pageSize - 1) / pageSize
}
