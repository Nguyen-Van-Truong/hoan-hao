# Hoàn Hảo - Nền tảng Mạng xã hội dựa trên Kiến trúc Microservices

<p align="center">
  <img src="fe-hoan-hao/public/logointab.png" alt="Hoàn Hảo Logo" width="200" />
</p>

## Tổng quan

Hoàn Hảo là một nền tảng mạng xã hội hiện đại được phát triển với kiến trúc microservices, cung cấp các tính năng toàn diện cho tương tác xã hội, quản lý nhóm, nhắn tin và trò chơi. Dự án này được xây dựng với các công nghệ tiên tiến và các phương pháp tốt nhất trong phát triển phần mềm.

## Kiến trúc Microservices

<p align="center">
  <img src="https://miro.medium.com/v2/resize:fit:1400/1*d6YkPXrGm4MXIf6BHsu3Rw.png" alt="Microservices Architecture" width="700" />
</p>

### Kong API Gateway
- **Ngôn ngữ/Công nghệ**: Kong Gateway, Docker
- **Chức năng**: Quản lý và điều phối các yêu cầu API đến các microservices, xử lý xác thực JWT, CORS, và định tuyến.
- **Tính năng chính**:
  - Định tuyến API dựa trên đường dẫn
  - Xác thực JWT
  - Quản lý CORS
  - Logging và monitoring

### AuthService
- **Ngôn ngữ/Công nghệ**: Spring Boot, MySQL
- **Chức năng**: Xử lý xác thực người dùng, đăng nhập, đăng ký, quản lý token.
- **Tính năng chính**:
  - Đăng ký và đăng nhập người dùng
  - Quản lý JWT (phát hành và làm mới token)
  - Quên mật khẩu và đặt lại mật khẩu
  - Đổi mật khẩu

### UserService
- **Ngôn ngữ/Công nghệ**: Golang (Gin framework), MySQL
- **Chức năng**: Quản lý thông tin người dùng, mối quan hệ bạn bè, và nhóm.
- **Tính năng chính**:
  - Quản lý hồ sơ người dùng
  - Quản lý mối quan hệ bạn bè (kết bạn, hủy kết bạn, chặn)
  - Tạo và quản lý nhóm
  - Gợi ý bạn bè

### PostService
- **Ngôn ngữ/Công nghệ**: Golang (Gin framework), MySQL
- **Chức năng**: Quản lý bài đăng, bình luận, thích và chia sẻ.
- **Tính năng chính**:
  - Tạo, cập nhật, xóa bài đăng
  - Quản lý bình luận và phản hồi
  - Tính năng thích và chia sẻ bài đăng
  - Tải lên và quản lý phương tiện (hình ảnh, video)

### Frontend
- **Ngôn ngữ/Công nghệ**: React, TypeScript, Vite, Tailwind CSS
- **Chức năng**: Giao diện người dùng tương tác và phản hồi.
- **Tính năng chính**:
  - Giao diện người dùng hiện đại và trực quan
  - Tương thích với nhiều thiết bị
  - Tích hợp với các API microservices
  - Quản lý trạng thái và xác thực người dùng

## Tính năng chính

### Xác thực & Bảo mật
- Luồng xác thực người dùng đầy đủ (Đăng nhập, Đăng ký, Quên mật khẩu, Đặt lại mật khẩu)
- Bảo vệ các tuyến đường cho người dùng đã xác thực
- Xác thực JWT thông qua Kong Gateway

### Tương tác xã hội
- Bảng tin với bài đăng và phương tiện
- Tạo bài đăng với hỗ trợ phương tiện phong phú
- Bình luận và phản ứng
- Hồ sơ người dùng với tùy chọn tùy chỉnh
- Gợi ý bạn bè thông minh

### Nhóm
- Tạo và tham gia nhóm
- Tùy chọn nhóm công khai và riêng tư
- Quản lý nhóm (cài đặt, thành viên, quy tắc)
- Các sự kiện và thảo luận trong nhóm
- Kiểm soát quản trị viên và người điều hành

### Nhắn tin
- Nhắn tin riêng tư thời gian thực
- Quản lý cuộc trò chuyện
- Khả năng chia sẻ phương tiện

### Trò chơi
- Nền tảng trò chơi tích hợp
- Nhiều loại trò chơi (trình duyệt, nhúng, máy tính để bàn)
- Theo dõi trạng thái trò chơi
- Bảng xếp hạng

## Công nghệ sử dụng

### Backend
- **Kong Gateway**: API Gateway, xác thực và định tuyến
- **Spring Boot**: Dịch vụ xác thực, quản lý JWT
- **Golang (Gin)**: Dịch vụ người dùng và bài đăng
- **MySQL**: Lưu trữ dữ liệu chính
- **Docker & Docker Compose**: Containerization và triển khai

### Frontend
- **React & TypeScript**: Phát triển giao diện người dùng
- **Vite**: Build tool và server phát triển
- **Tailwind CSS**: Styling dựa trên utility-first
- **Shadcn UI**: Các thành phần UI có thể tùy chỉnh
- **React Router**: Định tuyến phía máy khách
- **React Hook Form & Zod**: Xử lý biểu mẫu và xác thực

## Khởi động dự án

### Yêu cầu
- Docker và Docker Compose
- Node.js (v16 hoặc cao hơn)
- Go 1.16+
- JDK 17+
- MySQL 5.7+

### Cài đặt và chạy

1. **Cài đặt Kong Gateway**:
```bash
cd kong
docker-compose up -d
./setup-kong.ps1 # hoặc ./setup-kong.sh trên Linux/Mac
```

2. **Khởi động AuthService**:
```bash
cd authservice
./gradlew bootRun
```

3. **Khởi động UserService**:
```bash
cd userservice2
go run cmd/main.go
```

4. **Khởi động PostService**:
```bash
cd postservice
go run cmd/server/main.go
```

5. **Khởi động Frontend**:
```bash
cd fe-hoan-hao
npm install
npm run dev
```

## Liên hệ và đóng góp

Dự án Hoàn Hảo được phát triển bởi một nhóm các nhà phát triển đam mê. Chúng tôi luôn chào đón đóng góp và phản hồi!

1. Fork repository
2. Tạo nhánh tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi của bạn (`git commit -m 'Add some amazing feature'`)
4. Push lên nhánh (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## Giấy phép

Dự án này được cấp phép theo Giấy phép MIT - xem tệp LICENSE để biết chi tiết.