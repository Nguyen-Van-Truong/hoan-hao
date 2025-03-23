# API Bạn bè - Hoàn Hảo Social

Tài liệu này mô tả các API liên quan đến chức năng bạn bè trong hệ thống Hoàn Hảo Social.

## Yêu cầu chung

- Tất cả các API đều yêu cầu xác thực bằng JWT token.
- Token JWT phải được gửi trong header `Authorization` với format `Bearer <token>`.
- Response mặc định sẽ trả về dạng JSON.

## API Danh sách

### 1. Lấy danh sách bạn bè

```
GET /friends
```

**Tham số query**:
- `status` (tùy chọn): Lọc theo trạng thái (`accepted`, `pending`, `rejected`, `blocked`). Mặc định: `accepted`
- `page` (tùy chọn): Số trang (bắt đầu từ 1). Mặc định: 1
- `page_size` (tùy chọn): Kích thước trang (tối đa 100). Mặc định: 10

**Response**:
```json
{
  "friends": [
    {
      "id": 123,
      "user_id": 1,
      "friend_id": 2,
      "status": "accepted",
      "created_at": "2023-11-15T10:30:00Z",
      "updated_at": "2023-11-15T10:35:00Z",
      "friend": {
        "id": 2,
        "username": "user2",
        "full_name": "Người dùng 2",
        "profile_picture_url": "https://example.com/avatar.jpg"
      },
      "mutual_friends_count": 5
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 10
}
```

### 2. Lấy danh sách lời mời kết bạn

```
GET /friends/requests
```

**Tham số query**:
- `type` (tùy chọn): Kiểu yêu cầu (`incoming`, `outgoing`). Mặc định: `incoming`
- `page` (tùy chọn): Số trang (bắt đầu từ 1). Mặc định: 1
- `page_size` (tùy chọn): Kích thước trang (tối đa 100). Mặc định: 10

**Response**:
```json
{
  "friends": [
    {
      "id": 456,
      "user_id": 3,
      "friend_id": 1,
      "status": "pending",
      "created_at": "2023-11-15T11:30:00Z",
      "updated_at": "2023-11-15T11:30:00Z",
      "friend": {
        "id": 3,
        "username": "user3",
        "full_name": "Người dùng 3",
        "profile_picture_url": "https://example.com/avatar3.jpg"
      },
      "mutual_friends_count": 2
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 10
}
```

### 3. Lấy gợi ý kết bạn

```
GET /friends/suggestions
```

**Tham số query**:
- `limit` (tùy chọn): Số lượng gợi ý (tối đa 50). Mặc định: 10

**Response**:
```json
{
  "suggestions": [
    {
      "id": 4,
      "username": "user4",
      "full_name": "Người dùng 4",
      "profile_picture_url": "https://example.com/avatar4.jpg",
      "mutual_friends_count": 3
    }
  ]
}
```

### 4. Lấy danh sách bạn bè của người dùng khác

```
GET /friends/user/:id
```

**Tham số path**:
- `id`: ID của người dùng

**Tham số query**:
- `page` (tùy chọn): Số trang (bắt đầu từ 1). Mặc định: 1
- `page_size` (tùy chọn): Kích thước trang (tối đa 100). Mặc định: 10

**Response**: Tương tự như API lấy danh sách bạn bè.

### 5. Lấy số lượng bạn chung

```
GET /friends/mutual/:id
```

**Tham số path**:
- `id`: ID của người dùng cần so sánh

**Response**:
```json
{
  "count": 5
}
```

### 6. Lấy trạng thái bạn bè

```
GET /friends/status/:id
```

**Tham số path**:
- `id`: ID của người dùng cần kiểm tra

**Response**:
```json
{
  "status": "accepted"
}
```

## API Hành động

Tất cả các API hành động đều sử dụng endpoint chung, chỉ khác tham số `action` trong đường dẫn:

```
POST /friends/:action
```

**Tham số path**:
- `action`: Loại hành động cần thực hiện
  - `send-request`: Gửi lời mời kết bạn
  - `accept`: Chấp nhận lời mời
  - `reject`: Từ chối lời mời
  - `cancel`: Hủy lời mời đã gửi
  - `unfriend`: Hủy kết bạn
  - `block`: Chặn người dùng
  - `unblock`: Bỏ chặn người dùng

**Body request** (dạng JSON):
```json
{
  "friend_id": 123
}
```

**Response khi thành công**:
```json
{
  "message": "Thành công"
}
```

**Response khi lỗi**:
```json
{
  "error": "Lý do lỗi"
}
```

## Mã lỗi chung

- 401: Chưa xác thực
- 400: Dữ liệu yêu cầu không hợp lệ
- 404: Không tìm thấy người dùng
- 500: Lỗi server