
# UserService2

UserService2 là một microservice quản lý người dùng cho mạng xã hội Hoàn Hảo, được xây dựng bằng Golang và Gin Framework.

## Cấu trúc project
userservice2/
├── cmd/
│   └── main.go                   // Entry point
├── configs/
│   └── config.go                 // Load cấu hình từ file hoặc biến môi trường
├── controllers/
│   ├── auth.go                   // Xử lý đăng nhập, đăng ký...
│   ├── friendship.go             // Handler cho friendship
│   ├── user.go                   // Xử lý thông tin người dùng
│   └── group.go                  // Xử lý logic nhóm
├── models/
│   ├── user.go                   // Struct User
│   ├── friendship.go             // Struct Friendship
│   ├── user_group.go             // Struct UserGroup
│   ├── group_member.go           // Struct GroupMember
│   ├── group_join_request.go     // Struct GroupJoinRequest
│   ├── group_role.go             // Struct GroupRole
│   └── group_member_role.go      // Struct GroupMemberRole
├── routes/
│   └── routes.go                 // Định nghĩa routes
├── repositories/
│   ├── user.go                   // Thao tác DB user
│   ├── friendship.go             // Thao tác DB friendship
│   ├── user_group.go             // Thao tác DB nhóm
│   └── group_member.go           // Thao tác DB member nhóm
├── services/
│   ├── auth.go                   // Nghiệp vụ auth
│   ├── friendship.go             // Logic Friendship
│   ├── user.go                   // Nghiệp vụ user
│   └── group.go                  // Nghiệp vụ group
├── utils/
│   └── helpers.go                // Hàm helper chung
├── go.mod
├── go.sum
├── .env


## Tính năng

- Quản lý hồ sơ người dùng
- Quản lý mối quan hệ bạn bè
- Quản lý nhóm

## Yêu cầu

- Go 1.16+
- MySQL 5.7+
- Git

## Cài đặt

1. Clone repository:

```bash
git clone https://github.com/hoanhaosocial/userservice2.git
cd userservice2
```

2. Cài đặt các dependency:

```bash
go mod download
```

3. Cấu hình môi trường:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` để phù hợp với môi trường của bạn.

4. Tạo cơ sở dữ liệu:

```bash
mysql -u your_username -p < database/schema.sql
```

5. Khởi chạy ứng dụng:

```bash
go run cmd/server/main.go
```

## Cấu trúc dự án

```
userservice2/
├── cmd/
│   └── server/           # Điểm khởi chạy ứng dụng
├── internal/
│   ├── config/           # Cấu hình ứng dụng
│   ├── model/            # Định nghĩa dữ liệu
│   ├── repository/       # Tương tác với cơ sở dữ liệu
│   ├── service/          # Logic nghiệp vụ
│   ├── handler/          # Xử lý HTTP request/response
│   └── middleware/       # Middleware HTTP
├── pkg/
│   └── util/             # Các tiện ích, hàm tiện ích
└── .env                  # Biến môi trường
```

## API Endpoints

### User API

- `GET /api/v1/users/profile/:username` - Lấy thông tin profile người dùng theo username
- `GET /api/v1/users/me` - Lấy thông tin profile người dùng đang đăng nhập
- `PUT /api/v1/users/profile` - Cập nhật thông tin profile người dùng

### Friend API

- `GET /api/v1/friends` - Lấy danh sách bạn bè
- `GET /api/v1/friends/suggestions` - Lấy danh sách gợi ý bạn bè
- `GET /api/v1/friends/requests/incoming` - Lấy danh sách lời mời kết bạn đã nhận
- `GET /api/v1/friends/requests/outgoing` - Lấy danh sách lời mời kết bạn đã gửi
- `POST /api/v1/friendship` - Quản lý quan hệ bạn bè với các tham số:
  - `{ "action": "request", "friendId": 123 }` - Gửi lời mời kết bạn
  - `{ "action": "cancel", "friendId": 123 }` - Hủy lời mời kết bạn đã gửi
  - `{ "action": "accept", "friendId": 123 }` - Chấp nhận lời mời kết bạn
  - `{ "action": "reject", "friendId": 123 }` - Từ chối lời mời kết bạn
  - `{ "action": "block", "friendId": 123 }` - Chặn người dùng
  - `{ "action": "unblock", "friendId": 123 }` - Bỏ chặn người dùng

### Group API

- `GET /api/v1/groups` - Lấy danh sách nhóm
- `GET /api/v1/groups/:id` - Lấy thông tin nhóm theo ID
- `POST /api/v1/groups` - Tạo nhóm mới
- `PUT /api/v1/groups/:id` - Cập nhật thông tin nhóm
- `DELETE /api/v1/groups/:id` - Xóa nhóm
- `GET /api/v1/groups/my` - Lấy danh sách nhóm của người dùng đang đăng nhập
- `GET /api/v1/groups/:id/members` - Lấy danh sách thành viên nhóm
- `POST /api/v1/groups/:id/members` - Thêm thành viên vào nhóm
- `DELETE /api/v1/groups/:id/members/:userId` - Xóa thành viên khỏi nhóm
- `PUT /api/v1/groups/:id/members/:userId/role` - Cập nhật vai trò thành viên trong nhóm
- `POST /api/v1/groups/:id/join` - Gửi yêu cầu tham gia nhóm
- `GET /api/v1/groups/join-requests` - Lấy danh sách yêu cầu tham gia nhóm
- `PUT /api/v1/groups/join-requests/:id` - Xử lý yêu cầu tham gia nhóm

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi của bạn (`git commit -m 'Add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request 