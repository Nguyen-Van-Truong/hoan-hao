package utils

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/joho/godotenv"
)

// CloudinaryUploader là struct chứa client Cloudinary
type CloudinaryUploader struct {
	client *cloudinary.Cloudinary
}

// NewCloudinaryUploader khởi tạo Cloudinary client từ biến môi trường
func NewCloudinaryUploader() (*CloudinaryUploader, error) {
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found, relying on system environment variables: %v", err)
	}

	cloudinaryURL := os.Getenv("CLOUDINARY_URL")
	log.Printf("CLOUDINARY_URL: %s", cloudinaryURL)
	if cloudinaryURL == "" {
		return nil, fmt.Errorf("CLOUDINARY_URL environment variable is not set")
	}

	cld, err := cloudinary.NewFromURL(cloudinaryURL)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Cloudinary client: %v", err)
	}

	_, err = cld.Admin.Ping(context.Background())
	if err != nil {
		log.Printf("Cloudinary ping failed: %v", err)
	} else {
		log.Println("Cloudinary connection successful")
	}

	return &CloudinaryUploader{client: cld}, nil
}

// UploadImage upload một file ảnh lên Cloudinary và trả về URL
func (u *CloudinaryUploader) UploadImage(file interface{}, publicID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Printf("Starting upload for file with publicID: %s", publicID)

	// Xác định folder dựa trên publicID
	folder := "posts"
	if strings.Contains(publicID, "user_") {
		folder = "users"
	}

	resp, err := u.client.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID:       publicID,
		Folder:         folder,
		Overwrite:      api.Bool(true),
		ResourceType:   "image", // Chỉ hỗ trợ ảnh
		UniqueFilename: api.Bool(false),
	})
	if err != nil {
		log.Printf("Upload to Cloudinary failed: %v", err)
		return "", fmt.Errorf("failed to upload image to Cloudinary: %v", err)
	}

	log.Printf("Upload response: %+v", resp)
	if resp.Error.Message != "" {
		log.Printf("Cloudinary returned an error: %s", resp.Error.Message)
		return "", fmt.Errorf("Cloudinary error: %s", resp.Error.Message)
	}
	if resp.SecureURL == "" {
		log.Printf("Warning: SecureURL is empty in response")
		return "", fmt.Errorf("upload succeeded but no SecureURL returned")
	}

	log.Printf("Upload successful, SecureURL: %s", resp.SecureURL)
	return resp.SecureURL, nil
}

// UploadImages upload nhiều file ảnh và trả về danh sách URL
func (u *CloudinaryUploader) UploadImages(files []interface{}) ([]string, error) {
	if len(files) == 0 {
		log.Println("No files to upload")
		return nil, nil
	}

	// Giới hạn tối đa 8 ảnh
	const maxImages = 8
	if len(files) > maxImages {
		log.Printf("Too many files: %d, maximum allowed is %d", len(files), maxImages)
		return nil, fmt.Errorf("maximum of %d images allowed, got %d", maxImages, len(files))
	}

	var urls []string
	for i, file := range files {
		publicID := fmt.Sprintf("post_image_%d_%d", time.Now().UnixNano(), i)
		url, err := u.UploadImage(file, publicID)
		if err != nil {
			log.Printf("Failed to upload image %d: %v", i, err)
			return nil, err
		}
		urls = append(urls, url)
	}
	return urls, nil
}

// DeleteImage xóa một ảnh trên Cloudinary dựa trên URL
func (u *CloudinaryUploader) DeleteImage(mediaURL string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Lấy PublicID từ URL
	publicID := extractPublicIDFromURL(mediaURL)
	if publicID == "" {
		return fmt.Errorf("invalid media URL: %s", mediaURL)
	}

	log.Printf("Deleting image with PublicID: %s", publicID)
	_, err := u.client.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID:     publicID,
		ResourceType: "image",
	})
	if err != nil {
		return fmt.Errorf("failed to delete image from Cloudinary: %v", err)
	}

	log.Printf("Deleted image %s successfully", mediaURL)
	return nil
}

// extractPublicIDFromURL trích xuất PublicID từ SecureURL của Cloudinary
func extractPublicIDFromURL(url string) string {
	// Ví dụ URL:
	// - https://res.cloudinary.com/dgncir2mb/image/upload/v1234567890/posts/post_image_1234567890_0.jpg
	// - https://res.cloudinary.com/dgncir2mb/image/upload/v1234567890/users/user_1_profile_1234567890.jpg
	parts := strings.Split(url, "/")
	if len(parts) < 7 {
		return ""
	}

	// Xác định folder dựa vào URL
	var folder string
	var startIdx int

	if len(parts) > 7 {
		folder = parts[6]
		startIdx = 7

		// PublicID nằm ở phần sau folder
		publicID := strings.Join(parts[startIdx:], "/")
		// Loại bỏ extension (nếu có)
		if extIndex := strings.LastIndex(publicID, "."); extIndex != -1 {
			publicID = publicID[:extIndex]
		}
		return folder + "/" + publicID
	}

	return ""
}
