# 🌟 Hoàn Hảo - Nền Tảng Mạng Xã Hội Với Kiến Trúc Microservices

<p align="center">
  <img src="fe-hoan-hao/public/logointab.png" alt="Hoàn Hảo Logo" width="200" />
</p>

<p align="center">
  <a href="#tổng-quan">Tổng Quan</a> •
  <a href="#kiến-trúc-microservices">Kiến Trúc</a> •
  <a href="#tính-năng-chính">Tính Năng</a> •
  <a href="#công-nghệ-sử-dụng">Công Nghệ</a> •
  <a href="#khởi-động-dự-án">Khởi Động</a> •
  <a href="#api-endpoints">API</a> •
  <a href="#liên-hệ-và-đóng-góp">Đóng Góp</a>
</p>

## 📋 Tổng Quan

**Hoàn Hảo** là một nền tảng mạng xã hội hiện đại được phát triển với kiến trúc microservices, cung cấp đầy đủ tính năng cho tương tác xã hội, quản lý profile người dùng và bài viết. Dự án này áp dụng các công nghệ và phương pháp tiên tiến nhất trong phát triển phần mềm hiện đại, với lộ trình phát triển thêm nhiều tính năng nâng cao.

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Golang%20%7C%20Spring%20Boot-blue" alt="Backend" />
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript-brightgreen" alt="Frontend" />
  <img src="https://img.shields.io/badge/Database-MySQL-orange" alt="Database" />
  <img src="https://img.shields.io/badge/API%20Gateway-Kong-red" alt="API Gateway" />
  <img src="https://img.shields.io/badge/Deployment-Docker-informational" alt="Deployment" />
</p>

## 🏗️ Kiến Trúc Microservices

```
┌─────────────┐     
│   Browser   │     
│   Client    │     
└──────┬──────┘     
        │           
        │           
        │           
        ▼           
┌─────────────────────────────────┐
│                                 │
│       Kong API Gateway          │
│  (JWT Auth, Routing, Security)  │
│                                 │
└───────┬───────────┬─────────────┘
        │           │           │
        │           │           │
        ▼           ▼           ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│                 │ │                 │ │                 │
│   AuthService   │ │   UserService   │ │   PostService   │
│  (Spring Boot)  │ │  (Golang/Gin)   │ │  (Golang/Gin)   │
│                 │ │                 │ │                 │
└─────────┬───────┘ └─────────┬───────┘ └─────────┬───────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│                 │ │                 │ │                 │
│  Auth Database  │ │  User Database  │ │  Post Database  │
│     (MySQL)     │ │     (MySQL)     │ │     (MySQL)     │
│                 │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 🌐 Kong API Gateway [✓ Đã triển khai]
- **Ngôn ngữ/Công nghệ**: Kong Gateway, Docker
- **Chức năng**: Điểm truy cập duy nhất cho mọi yêu cầu API, xử lý xác thực và định tuyến đến các microservices phù hợp.
- **Tính năng chính**:
  - ✅ Định tuyến thông minh theo đường dẫn và HTTP methods
  - ✅ Xác thực JWT tập trung
  - ✅ Quản lý CORS toàn hệ thống
  - ✅ Rate limiting và bảo vệ API
  - ✅ Logging tập trung

### 🔐 AuthService [✓ Đã triển khai]
- **Ngôn ngữ/Công nghệ**: Spring Boot, Spring Security, MySQL, JWT
- **Chức năng**: Quản lý toàn bộ quá trình xác thực người dùng và bảo mật
- **Tính năng chính**:
  - ✅ Đăng ký, đăng nhập và quản lý phiên
  - ✅ Phát hành và làm mới JWT tokens
  - ✅ Quên mật khẩu và đặt lại mật khẩu qua email
  - ✅ Đổi mật khẩu và quản lý thông tin đăng nhập
  - 🔜 Xác thực hai yếu tố (2FA) [Đang phát triển]
  - 🔜 OAuth2 integration (Google, Facebook) [Đang phát triển]

### 👥 UserService [✓ Đã triển khai một phần]
- **Ngôn ngữ/Công nghệ**: Golang (Gin framework), MySQL
- **Chức năng**: Quản lý thông tin người dùng và mối quan hệ bạn bè
- **Tính năng chính**:
  - ✅ Quản lý hồ sơ người dùng (thông tin cá nhân, avatar, bìa)
  - ✅ Hệ thống bạn bè cơ bản (kết bạn, hủy kết bạn, chặn)
  - ✅ Tìm kiếm người dùng
  - 🔜 Tạo và quản lý nhóm với phân quyền [Đang phát triển]
  - 🔜 Gợi ý bạn bè thông minh [Đang phát triển]
  - 🔜 Caching với Redis cho truy vấn nhanh [Lên kế hoạch]

### 📝 PostService [✓ Đã triển khai]
- **Ngôn ngữ/Công nghệ**: Golang (Gin framework), MySQL
- **Chức năng**: Xử lý tất cả nội dung người dùng tạo ra (bài đăng, bình luận, reactions)
- **Tính năng chính**:
  - ✅ CRUD đầy đủ cho bài đăng với phân quyền riêng tư
  - ✅ Hệ thống bình luận với phản hồi
  - ✅ Tính năng thích/reactions
  - ✅ Chia sẻ bài đăng
  - ✅ Upload và quản lý media (hình ảnh)
  - 🔜 Thuật toán newsfeed cá nhân hóa [Đang phát triển]

### 💻 Frontend [✓ Đã triển khai]
- **Ngôn ngữ/Công nghệ**: React, TypeScript, Vite, Tailwind CSS
- **Chức năng**: Giao diện người dùng hiện đại và trải nghiệm mượt mà
- **Tính năng chính**:
  - ✅ UI/UX hiện đại với Tailwind và Shadcn UI
  - ✅ Responsive design cho mọi thiết bị
  - ✅ Quản lý trạng thái hiệu quả
  - 🔜 Tích hợp WebSocket cho tin nhắn và thông báo real-time [Lên kế hoạch]
  - 🔜 Lazy loading và code splitting cho hiệu suất tối ưu [Đang phát triển]
  - 🔜 Hỗ trợ đa ngôn ngữ (i18n) [Lên kế hoạch]

### 📱 Tính năng đang phát triển
- **💬 Chat Service**: Hệ thống tin nhắn real-time với WebSocket
- **🎮 Game Service**: Nền tảng trò chơi tích hợp cho người dùng
- **🔔 Notification Service**: Hệ thống thông báo real-time

## ✨ Tính Năng Chính

### 🔐 Xác Thực & Bảo Mật [✓ Đã triển khai]
- ✅ Luồng xác thực người dùng đầy đủ (Đăng nhập, Đăng ký, Quên mật khẩu)
- ✅ Bảo vệ routes và API cho người dùng đã xác thực
- ✅ Xác thực JWT tập trung thông qua Kong Gateway
- 🔜 Phiên bị khóa sau nhiều lần đăng nhập thất bại [Đang phát triển]
- 🔜 Xác thực OAuth2 với Google và Facebook [Đang phát triển]

### 🌐 Tương Tác Xã Hội [✓ Đã triển khai một phần]
- ✅ Tạo bài đăng với hỗ trợ media (ảnh)
- ✅ Hệ thống bình luận và reaction cơ bản
- ✅ Hồ sơ người dùng có thể tùy chỉnh
- 🔜 News feed với thuật toán cá nhân hóa [Đang phát triển]
- 🔜 Gợi ý bạn bè dựa trên mạng lưới [Đang phát triển]

### 👨‍👩‍👧‍👦 Nhóm & Cộng Đồng [🔜 Đang phát triển]
- 🔜 Tạo và tham gia nhóm với các tùy chọn riêng tư
- 🔜 Quản lý nhóm (cài đặt, thành viên, quy tắc nhóm)
- 🔜 Thảo luận trong nhóm
- 🔜 Phân quyền quản trị viên và người điều hành

### 💬 Nhắn Tin & Giao Tiếp [🔜 Lên kế hoạch]
- 🔜 Tin nhắn riêng tư
- 🔜 Chat nhóm và quản lý cuộc trò chuyện
- 🔜 Chia sẻ media và tệp đính kèm

### 🎮 Trò Chơi & Giải Trí [🔜 Lên kế hoạch]
- 🔜 Nền tảng trò chơi tích hợp
- 🔜 Nhiều loại trò chơi (casual, multiplayer)
- 🔜 Bảng xếp hạng
- 🔜 Tích hợp với hệ thống bạn bè để chơi cùng nhau

## 🚀 Công Nghệ Sử Dụng

### Backend
- **Kong Gateway**: API Gateway, xác thực và định tuyến
- **Spring Boot**: Dịch vụ xác thực, quản lý JWT với Spring Security
- **Golang (Gin)**: Microservices nhẹ và hiệu năng cao
- **MySQL**: Cơ sở dữ liệu chính cho mỗi microservice
- **Docker**: Containerization và triển khai
- 🔜 **Redis**: Caching và hỗ trợ messaging [Lên kế hoạch]
- 🔜 **gRPC**: Giao tiếp hiệu quả giữa các microservices [Lên kế hoạch]

### Frontend
- **React**: Thư viện UI hiện đại với Hooks
- **TypeScript**: Typed JavaScript cho phát triển an toàn
- **Vite**: Build tool siêu nhanh và hot module replacement
- **Tailwind CSS**: Framework CSS utility-first
- **Shadcn UI**: Thành phần UI có thể tùy chỉnh cao
- 🔜 **Redux Toolkit**: Quản lý state với cú pháp đơn giản [Lên kế hoạch]
- 🔜 **React Query**: Data fetching và caching [Lên kế hoạch]
- 🔜 **Socket.io Client**: WebSocket cho giao tiếp real-time [Lên kế hoạch]

## 🔧 Khởi Động Dự Án

### Yêu Cầu
- Docker và Docker Compose
- Node.js (v16 hoặc cao hơn)
- Go 1.16+
- JDK 17+
- MySQL 5.7+

### Cài Đặt & Chạy

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/hoan-hao.git
cd hoan-hao
```

#### 2. Khởi Động Toàn Bộ Hệ Thống với Docker Compose
```bash
# Cài đặt toàn bộ hệ thống với một lệnh
docker-compose up -d
```

#### 3. Hoặc Khởi Động Từng Dịch Vụ Riêng Biệt

**Kong Gateway**:
```bash
cd kong
docker-compose up -d
./setup-kong.ps1 # hoặc ./setup-kong.sh trên Linux/Mac
```

**AuthService**:
```bash
cd authservice
./gradlew bootRun
# Hoặc với Docker
docker build -t authservice .
docker run -p 8080:8080 authservice
```

**UserService**:
```bash
cd userservice2
go run cmd/main.go
# Hoặc với Docker
docker build -t userservice .
docker run -p 8081:8081 userservice
```

**PostService**:
```bash
cd postservice
go run cmd/server/main.go
# Hoặc với Docker
docker build -t postservice .
docker run -p 8082:8082 postservice
```

**Frontend**:
```bash
cd fe-hoan-hao
npm install
npm run dev
# Build production
npm run build
```

## 📘 API Endpoints

### 🔐 Auth API
- `POST /auth/register` - Đăng ký người dùng mới
- `POST /auth/login` - Đăng nhập và nhận JWT token
- `POST /auth/refresh-token` - Làm mới access token
- `POST /auth/forgot-password` - Yêu cầu reset password
- `POST /auth/reset-password` - Đặt lại mật khẩu
- `POST /auth/change-password` - Đổi mật khẩu

### 👤 User API
- `GET /users/me` - Lấy thông tin cá nhân (JWT protected)
- `PUT /users/me` - Cập nhật thông tin cá nhân
- `GET /users/:id` - Lấy thông tin người dùng theo ID
- `GET /users/search` - Tìm kiếm người dùng

### 👥 Friends API
- `GET /users/friends` - Lấy danh sách bạn bè
- `GET /users/friends/suggestions` - Gợi ý bạn bè
- `GET /users/friends/requests` - Lấy lời mời kết bạn
- `POST /users/friends/request/:userId` - Gửi lời mời kết bạn
- `PUT /users/friends/accept/:userId` - Chấp nhận lời mời
- `DELETE /users/friends/:userId` - Hủy kết bạn
- `POST /users/friends/block/:userId` - Chặn người dùng

### 📝 Post API
- `GET /post` - Lấy danh sách bài đăng
- `POST /post` - Tạo bài đăng mới (JWT protected)
- `GET /post/:uuid` - Lấy bài đăng theo UUID
- `PUT /post/:uuid` - Cập nhật bài đăng
- `DELETE /post/:uuid` - Xóa bài đăng
- `POST /post/:uuid/like` - Thích bài đăng
- `DELETE /post/:uuid/like` - Bỏ thích
- `GET /post/:uuid/comments` - Lấy bình luận của bài đăng
- `POST /post/:uuid/comment` - Thêm bình luận
- `GET /post/user/:userId/posts` - Lấy bài đăng theo người dùng

## 🔮 Lộ Trình Phát Triển

Hoàn Hảo đang trong quá trình phát triển tích cực với lộ trình như sau:

### Giai đoạn 1: Nền tảng cơ bản ✓ [Hoàn thành]
- ✅ Xác thực người dùng
- ✅ Quản lý hồ sơ người dùng
- ✅ Quản lý bài đăng và tương tác cơ bản
- ✅ API Gateway và bảo mật

### Giai đoạn 2: Tính năng xã hội nâng cao 🔄 [Đang triển khai]
- 🔄 Tính năng nhóm và cộng đồng
- 🔄 Cải thiện thuật toán newsfeed
- 🔄 Gợi ý bạn bè thông minh
- 🔄 Tích hợp nâng cao và tối ưu hóa hiệu suất

### Giai đoạn 3: Mở rộng tính năng 📅 [Q3 2023]
- 📅 Hệ thống tin nhắn real-time
- 📅 Thông báo real-time
- 📅 Hỗ trợ đa ngôn ngữ
- 📅 Tích hợp OAuth2

### Giai đoạn 4: Trải nghiệm người dùng nâng cao 📅 [Q4 2023]
- 📅 Nền tảng trò chơi
- 📅 Nâng cao khả năng cá nhân hóa
- 📅 Tích hợp streaming
- 📅 Mobile app với React Native

## 🤝 Liên Hệ Và Đóng Góp

Dự án Hoàn Hảo được phát triển bởi đội ngũ các nhà phát triển chuyên nghiệp, luôn chào đón đóng góp từ cộng đồng!

### Quy Trình Đóng Góp
1. Fork repository
2. Tạo nhánh tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add: amazing feature'`)
4. Push lên nhánh của bạn (`git push origin feature/amazing-feature`)
5. Mở Pull Request với mô tả chi tiết

### Coding Standards
- Tuân thủ các quy tắc code style của từng ngôn ngữ
- Viết unit tests cho code mới
- Đảm bảo tất cả CI checks đều pass
- Cập nhật tài liệu khi cần thiết

## 📜 Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT - xem tệp LICENSE để biết chi tiết.

## 🙏 Cảm Ơn

Chúng tôi xin gửi lời cảm ơn đến tất cả các thư viện và công cụ mã nguồn mở đã giúp Hoàn Hảo trở thành hiện thực. Đặc biệt cảm ơn:

- [Kong](https://konghq.com/) cho API Gateway
- [Spring Boot](https://spring.io/projects/spring-boot) cho AuthService
- [Golang](https://golang.org/) và [Gin](https://gin-gonic.com/) cho các microservices
- [React](https://reactjs.org/) và [Tailwind CSS](https://tailwindcss.com/) cho frontend
- [Docker](https://www.docker.com/) cho container deployment