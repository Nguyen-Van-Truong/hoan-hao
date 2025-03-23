# Hướng dẫn test API với CURL

## API Upload ảnh đại diện (Profile Picture)

```bash
curl -X PUT http://localhost:8083/users/me/profile-picture \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/profile_image.jpg"
```

Thay `YOUR_JWT_TOKEN` bằng token JWT hợp lệ và `/path/to/your/profile_image.jpg` bằng đường dẫn đến file ảnh cần upload.

## API Upload ảnh bìa (Cover Picture)

```bash
curl -X PUT http://localhost:8083/users/me/cover-picture \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/cover_image.jpg"
```

Thay `YOUR_JWT_TOKEN` bằng token JWT hợp lệ và `/path/to/your/cover_image.jpg` bằng đường dẫn đến file ảnh cần upload.

## API Bạn bè

### 1. Gửi lời mời kết bạn

```bash
curl -X POST http://localhost:8083/friends/send-request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"friend_id": 2}'
```

### 2. Chấp nhận lời mời kết bạn

```bash
curl -X POST http://localhost:8083/friends/accept \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"friend_id": 3}'
```

### 3. Lấy danh sách bạn bè

```bash
curl -X GET "http://localhost:8083/friends?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Lấy danh sách lời mời kết bạn

```bash
curl -X GET "http://localhost:8083/friends/requests?type=incoming&page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Lấy gợi ý kết bạn

```bash
curl -X GET "http://localhost:8083/friends/suggestions?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Lưu ý

- File ảnh phải có định dạng jpg, jpeg hoặc png
- Kích thước file ảnh đại diện không được vượt quá 5MB
- Kích thước file ảnh bìa không được vượt quá 10MB
- Token JWT phải còn hiệu lực
- Cần đảm bảo service đã được cấu hình đúng với Cloudinary

## Ví dụ thực tế (Windows PowerShell)

```powershell
$token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsYWdhMjEzNyIsInVzZXJJZCI6MTYsImlzcyI6ImhvYW5oYW8tYXV0aC1zZXJ2aWNlIiwiaWF0IjoxNzQyNzM3MDQzLCJleHAiOjE3NDI4MjM0NDN9.VMhZ8F_w5yTTIeI9KO9UvcsIDmAOM-QzHQju_zv7ib4"

curl -X PUT http://localhost:8083/users/me/profile-picture `
  -H "Authorization: Bearer $token" `
  -F "image=@D:\Images\profile.jpg"
```

## Ví dụ thực tế (Linux/macOS)

```bash
token="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsYWdhMjEzNyIsInVzZXJJZCI6MTYsImlzcyI6ImhvYW5oYW8tYXV0aC1zZXJ2aWNlIiwiaWF0IjoxNzQyNzM3MDQzLCJleHAiOjE3NDI4MjM0NDN9.VMhZ8F_w5yTTIeI9KO9UvcsIDmAOM-QzHQju_zv7ib4"

curl -X PUT http://localhost:8083/users/me/profile-picture \
  -H "Authorization: Bearer $token" \
  -F "image=@/path/to/your/profile.jpg"
```