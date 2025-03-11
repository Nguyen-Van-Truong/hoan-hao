package util

import (
	"context"
	"fmt"
	"log"
	"os"
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

	resp, err := u.client.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID:       publicID,
		Folder:         "posts",
		Overwrite:      api.Bool(true),
		ResourceType:   "image",
		UniqueFilename: api.Bool(false),
	})
	if err != nil {
		log.Printf("Upload to Cloudinary failed: %v", err)
		return "", fmt.Errorf("failed to upload image to Cloudinary: %v", err)
	}

	log.Printf("Upload response: %+v", resp) // Log toàn bộ response
	if resp.SecureURL == "" {
		log.Printf("Warning: SecureURL is empty in response")
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
