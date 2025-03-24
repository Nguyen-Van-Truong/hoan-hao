# API Nhóm (Groups) - Hoàn Hảo Social - CURL Commands

## Các lệnh CURL để test API

### 1. Tạo nhóm mới
```bash
curl -X POST "http://localhost:8083/groups" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nhóm Hoàn Hảo",
    "description": "Mô tả về nhóm Hoàn Hảo",
    "privacy": "public",
    "cover_image": "https://example.com/cover.jpg"
  }'
```

### 2. Lấy thông tin chi tiết của nhóm
```bash
curl -X GET "http://localhost:8083/groups/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Cập nhật thông tin nhóm
```bash
curl -X PUT "http://localhost:8083/groups/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nhóm Hoàn Hảo (Updated)",
    "description": "Mô tả mới về nhóm Hoàn Hảo",
    "privacy": "private"
  }'
```

### 4. Xóa nhóm
```bash
curl -X DELETE "http://localhost:8083/groups/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Lấy danh sách tất cả nhóm công khai
```bash
curl -X GET "http://localhost:8083/groups?privacy=public&page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Lấy danh sách nhóm của người dùng hiện tại
```bash
curl -X GET "http://localhost:8083/groups/me?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Xin tham gia nhóm
```bash
curl -X POST "http://localhost:8083/groups/join" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": 123,
    "nickname": "Nickname trong nhóm"
  }'
```

### 8. Rời khỏi nhóm
```bash
curl -X POST "http://localhost:8083/groups/123/leave" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Mời người dùng tham gia nhóm
```bash
curl -X POST "http://localhost:8083/groups/123/invite" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 456
  }'
```

### 10. Chấp nhận yêu cầu tham gia nhóm
```bash
curl -X POST "http://localhost:8083/groups/123/members/approve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 456
  }'
```

### 11. Từ chối yêu cầu tham gia nhóm
```bash
curl -X POST "http://localhost:8083/groups/123/members/reject" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 456
  }'
```

### 12. Xóa thành viên khỏi nhóm
```bash
curl -X DELETE "http://localhost:8083/groups/123/members" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 456
  }'
```

### 13. Cập nhật thông tin thành viên
```bash
curl -X PUT "http://localhost:8083/groups/123/members/789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "nickname": "Nickname mới",
    "is_muted": false
  }'
```

### 14. Lấy danh sách thành viên nhóm
```bash
curl -X GET "http://localhost:8083/groups/123/members?role=member&status=approved&page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Lưu ý: Thay `YOUR_JWT_TOKEN` bằng token JWT thực tế của bạn và thay đổi các giá trị ID (123, 456, 789) theo nhu cầu test. 