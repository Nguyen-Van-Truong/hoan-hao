# Hướng dẫn Test API UserService2 thông qua Kong Gateway

Tài liệu này cung cấp các lệnh curl để test API của UserService2 thông qua Kong Gateway.

## Cấu hình và Biến Môi trường

```bash
# Địa chỉ Kong Gateway
KONG_ADDR=http://localhost:8000

# Token JWT để xác thực (cần thay thế bằng token thực tế từ AuthService)
JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 1. Các API Không Yêu Cầu Xác Thực

### 1.1. Tạo Hồ Sơ Người Dùng

```bash
curl -X POST $KONG_ADDR/user/createProfile \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "phone": "0987654321"
  }'
```

### 1.2. Lấy Danh Sách Người Dùng

```bash
# Lấy danh sách người dùng (có phân trang)
curl -X GET "$KONG_ADDR/users?page=1&page_size=10"
```

### 1.3. Xem Hồ Sơ Người Dùng

```bash
# Lấy thông tin người dùng theo ID
curl -X GET $KONG_ADDR/users/1
```

### 1.4. Xem Danh Sách Nhóm

```bash
# Lấy danh sách nhóm (có phân trang)
curl -X GET "$KONG_ADDR/groups?page=1&page_size=10"
```

### 1.5. Xem Thông Tin Nhóm

```bash
# Lấy thông tin nhóm theo ID
curl -X GET $KONG_ADDR/groups/1
```

### 1.6. Xem Thành Viên Nhóm

```bash
# Lấy danh sách thành viên của nhóm
curl -X GET $KONG_ADDR/groups/1/members
```

### 1.7. Kiểm Tra Trạng Thái Service

```bash
curl -X GET $KONG_ADDR/health
```

## 2. Các API Yêu Cầu Xác Thực JWT

### 2.1. Quản Lý Hồ Sơ Cá Nhân

```bash
# Lấy thông tin cá nhân
curl -X GET $KONG_ADDR/users/me \
  -H "Authorization: Bearer $JWT_TOKEN"

# Cập nhật hồ sơ cá nhân
curl -X PUT $KONG_ADDR/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "full_name": "Updated Name",
    "bio": "My updated bio",
    "location": "Ho Chi Minh City",
    "website": "https://example.com",
    "work": "Developer",
    "education": "University"
  }'

# Tải lên ảnh đại diện
curl -X PUT $KONG_ADDR/users/me/profile-picture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "file_url": "https://example.com/image.jpg"
  }'

# Tải lên ảnh bìa
curl -X PUT $KONG_ADDR/users/me/cover-picture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "file_url": "https://example.com/cover.jpg"
  }'
```

### 2.2. API Bạn Bè

```bash
# Lấy danh sách bạn bè
curl -X GET $KONG_ADDR/friends \
  -H "Authorization: Bearer $JWT_TOKEN"

# Lấy danh sách lời mời kết bạn
curl -X GET $KONG_ADDR/friends/requests \
  -H "Authorization: Bearer $JWT_TOKEN"

# Lấy gợi ý kết bạn
curl -X GET $KONG_ADDR/friends/suggestions \
  -H "Authorization: Bearer $JWT_TOKEN"

# Lấy danh sách bạn bè của người dùng khác
curl -X GET $KONG_ADDR/friends/user/2 \
  -H "Authorization: Bearer $JWT_TOKEN"

# Lấy danh sách bạn chung
curl -X GET $KONG_ADDR/friends/mutual/2 \
  -H "Authorization: Bearer $JWT_TOKEN"

# Gửi lời mời kết bạn
curl -X POST $KONG_ADDR/friends/send-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "user_id": 2
  }'

# Chấp nhận lời mời kết bạn
curl -X POST $KONG_ADDR/friends/accept-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "user_id": 2
  }'

# Từ chối lời mời kết bạn
curl -X POST $KONG_ADDR/friends/reject-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "user_id": 2
  }'

# Hủy kết bạn
curl -X POST $KONG_ADDR/friends/unfriend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "user_id": 2
  }'

# Kiểm tra trạng thái bạn bè
curl -X GET $KONG_ADDR/friends/status/2 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 2.3. API Nhóm

```bash
# Tạo nhóm mới
curl -X POST $KONG_ADDR/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "My Group",
    "description": "This is a test group",
    "privacy": "PUBLIC"
  }'

# Cập nhật thông tin nhóm
curl -X PUT $KONG_ADDR/groups/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Updated Group Name",
    "description": "Updated description",
    "privacy": "PRIVATE"
  }'

# Xóa nhóm
curl -X DELETE $KONG_ADDR/groups/1 \
  -H "Authorization: Bearer $JWT_TOKEN"

# Lấy danh sách nhóm của tôi
curl -X GET $KONG_ADDR/groups/me \
  -H "Authorization: Bearer $JWT_TOKEN"

# Tham gia nhóm
curl -X POST $KONG_ADDR/groups/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "group_id": 1
  }'

# Rời nhóm
curl -X POST $KONG_ADDR/groups/1/leave \
  -H "Authorization: Bearer $JWT_TOKEN"

# Mời thành viên vào nhóm
curl -X POST $KONG_ADDR/groups/1/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "user_ids": [2, 3, 4]
  }'

# Phê duyệt yêu cầu tham gia nhóm
curl -X POST $KONG_ADDR/groups/1/members/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "user_id": 2
  }'

# Từ chối yêu cầu tham gia nhóm
curl -X POST $KONG_ADDR/groups/1/members/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "user_id": 2
  }'

# Xóa thành viên khỏi nhóm
curl -X DELETE $KONG_ADDR/groups/1/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "user_id": 2
  }'

# Cập nhật vai trò thành viên
curl -X PUT $KONG_ADDR/groups/1/members/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "role": "ADMIN"
  }'
```

## 3. Test gRPC API

gRPC API không thể test trực tiếp qua curl. Bạn cần sử dụng một gRPC client như grpc-curl, grpcurl, hoặc BloomRPC. Dưới đây là ví dụ sử dụng grpcurl:

```bash
# Cài đặt grpcurl (nếu chưa có)
# Linux/Mac: brew install grpcurl (hoặc tải từ https://github.com/fullstorydev/grpcurl/releases)
# Windows: tải từ https://github.com/fullstorydev/grpcurl/releases

# Test GetUsersByIDs RPC
grpcurl -plaintext -d '{"user_ids": [1, 2, 3]}' localhost:9000 user.UserService/GetUsersByIDs
```

## 4. Xác thực JWT

Để lấy JWT token từ AuthService (cần chạy AuthService):

```bash
# Đăng nhập để lấy token
curl -X POST $KONG_ADDR/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'

# Kết quả sẽ trả về JWT token
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refreshToken": "..."
# }
```

Sau khi nhận được token, sử dụng nó trong biến `JWT_TOKEN` để gọi các API yêu cầu xác thực.

## Lưu ý

1. Đảm bảo Kong Gateway và các service đã được khởi động
2. Port mặc định cho Kong API Gateway là 8000
3. Thay thế `$JWT_TOKEN` bằng token thực tế từ AuthService
4. Các ID trong ví dụ (user_id, group_id) cần được thay thế bằng ID thực tế 