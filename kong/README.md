# Kong Gateway - Hướng dẫn sử dụng

## Cài đặt và khởi động

1. **Chuẩn bị Docker Compose file**:
Đảm bảo file `docker-compose.yml` đã được cấu hình đúng cho Kong Gateway và Postgres.

2. **Khởi động Kong**:
```bash
docker-compose up -d
```

3. **Kiểm tra Kong đã chạy**:
```bash
curl http://localhost:8001
```

## Cấu hình Kong

### Cấu hình tự động

Để cấu hình tự động Kong Gateway cho microservices:

```powershell
./setup-kong.ps1
```

Script này sẽ:
- Đăng ký services và routes
- Cấu hình plugin JWT
- Cấu hình CORS
- Tạo consumer và JWT credentials

### Reset cấu hình

Nếu cần xóa cấu hình CORS và cài đặt lại:

```powershell
./reset-kong.ps1
```

### Xử lý lỗi CORS

Xem hướng dẫn chi tiết tại [README-CORS.md](./README-CORS.md)

## Cấu trúc Routes

Kong Gateway đã được cấu hình với các routes sau:

1. **Auth Service** (localhost:8080)
   - `/auth/*` - Đăng nhập, đăng ký, quên mật khẩu, refresh token

2. **User Service** (localhost:8081)
   - `/users/me` - Lấy thông tin người dùng hiện tại (JWT protected)
   - `/users` - Danh sách người dùng (public)
   - `/users/:id` - Thông tin người dùng theo ID (public)
   - `/users/friends/*` - Các API về bạn bè (JWT protected)
   - `/users/groups/*` - Các API về nhóm (JWT protected)

3. **Post Service** (localhost:8082)
   - `/post` - GET (public), POST/PUT/DELETE (JWT protected)
   - `/comment` - CRUD comments (JWT protected)

## Các API endpoint

### Auth Endpoints
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh-token` - Làm mới token
- `POST /auth/forgot-password` - Yêu cầu reset password
- `POST /auth/reset-password` - Reset password

### User Endpoints
- `GET /users/me` - Lấy thông tin người dùng hiện tại
- `PUT /users/me` - Cập nhật thông tin người dùng
- `GET /users` - Danh sách người dùng
- `GET /users/:id` - Thông tin người dùng theo ID

### Xem thêm

Xem chi tiết về cách gọi API trong frontend tại các file:
- `fe-hoan-hao/src/api/services/authApi.ts`
- `fe-hoan-hao/src/api/services/userApi.ts` 