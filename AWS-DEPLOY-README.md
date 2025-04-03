# Hướng dẫn Triển khai lên AWS EC2

## Các bước chuẩn bị

1. Đăng ký và đăng nhập vào AWS Console
2. Tạo một EC2 instance t2.micro với hệ điều hành Amazon Linux 2023 hoặc Ubuntu Server 22.04
3. Cấu hình Security Group cho phép:
   - SSH (port 22)
   - HTTP (port 80)
   - HTTPS (port 443)
   - Kong Gateway (port 8000, 8001)
   - AuthService (port 8080)

## Cài đặt Docker và Docker Compose trên EC2

1. Kết nối đến EC2 instance bằng SSH:
   ```
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. Cài đặt Docker (Amazon Linux 2023):
   ```
   sudo yum update -y
   sudo yum install docker -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -a -G docker ec2-user
   ```

   Cài đặt Docker (Ubuntu):
   ```
   sudo apt update
   sudo apt install docker.io -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -a -G docker ubuntu
   ```

3. Logout và login lại để áp dụng quyền Docker

4. Cài đặt Docker Compose (cho cả Amazon Linux và Ubuntu):
   ```
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

## Triển khai ứng dụng

1. Tạo thư mục để chứa các file cấu hình:
   ```
   mkdir -p ~/hoanhao/kong-config
   cd ~/hoanhao
   ```

2. Tải tập tin docker-compose.aws.yml:
   ```
   wget https://raw.githubusercontent.com/yourusername/hoanhao/main/docker-compose.aws.yml -O docker-compose.yml
   ```

3. Tải tập tin setup-kong.sh:
   ```
   mkdir -p kong-config
   cd kong-config
   wget https://raw.githubusercontent.com/yourusername/hoanhao/main/kong-config/setup-kong.sh
   chmod +x setup-kong.sh
   cd ..
   ```

4. Khởi động các dịch vụ:
   ```
   docker-compose up -d
   ```

5. Kiểm tra trạng thái các dịch vụ:
   ```
   docker-compose ps
   ```

## Kiểm tra

1. Kiểm tra Kong Gateway:
   ```
   curl http://localhost:8001
   ```

2. Kiểm tra AuthService:
   ```
   curl http://localhost:8080/health
   ```

3. Kiểm tra API thông qua Kong Gateway:
   ```
   curl http://localhost:8000/auth/health
   ```

## Khắc phục sự cố

- Kiểm tra logs:
  ```
  docker-compose logs -f kong
  docker-compose logs -f auth-service
  docker-compose logs -f kong-setup
  ```

- Khởi động lại dịch vụ:
  ```
  docker-compose restart kong
  docker-compose restart auth-service
  ```

- Khởi động lại toàn bộ stack:
  ```
  docker-compose down
  docker-compose up -d
  ```

## Cấu hình DNS và HTTPS

1. Đăng ký tên miền và trỏ đến địa chỉ IP của EC2 instance
2. Cài đặt Certbot để tạo chứng chỉ SSL miễn phí từ Let's Encrypt
3. Cấu hình Kong để sử dụng HTTPS 