# Hướng dẫn khắc phục lỗi CORS trong Kong Gateway

## Vấn đề

Lỗi CORS phổ biến khi làm việc với frontend và microservices, đặc biệt là khi:
- Frontend (localhost:5173) gọi API từ Kong Gateway (localhost:8000)
- Preflight requests (OPTIONS) không được xử lý đúng cách
- Headers cần thiết không được thêm vào response

Thông báo lỗi thường gặp:
```
Access to fetch at 'http://localhost:8000/users/me' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

## Giải pháp

1. **Xóa các plugin CORS hiện tại**:
```powershell
./reset-kong.ps1
```

2. **Cài đặt lại Kong với cấu hình CORS cải thiện**:
```powershell
./setup-kong.ps1
```

3. **Đảm bảo các API trong frontend có cấu hình đúng**:
```typescript
// Cách gọi API đúng cách
const response = await fetch('http://localhost:8000/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}` // Chỉ thêm header này
  },
  credentials: 'include' // Quan trọng để xử lý CORS
});
```

## Cấu hình script đã thực hiện

1. **Plugin CORS toàn cục** đã được cấu hình với:
   - `origins=*` - Cho phép tất cả origins
   - Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
   - Headers: Accept, Content-Type, Authorization, Origin, ...
   - `credentials=true` - Cho phép gửi credentials như cookies, JWT
   - `preflight_continue=false` - Trả về 200 OK cho OPTIONS requests

2. **Routes riêng cho OPTIONS requests** có mức độ ưu tiên cao hơn
   
3. **Xóa bỏ headers không cần thiết** trong frontend code

## Ghi chú

- Nếu vẫn gặp lỗi CORS, kiểm tra:
  - Đường dẫn API trong frontend có đúng không (ví dụ: `/users/me` thay vì `/user/me`)
  - API backend có xử lý đúng phương thức HTTP không
  - Headers gửi đi có đúng không (tránh gửi nhiều headers không cần thiết)
  
- CORS phải được cấu hình cả ở Kong Gateway và có thể cả ở backend microservices 