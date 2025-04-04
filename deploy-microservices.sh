#!/bin/bash

# Script triển khai microservices cho Hoàn Hảo Social
set -e

echo "===== Triển khai Hoàn Hảo Microservices ====="

# 1. Cập nhật hệ thống và cài đặt Docker nếu chưa có
echo "Cập nhật hệ thống..."
sudo apt update
sudo apt upgrade -y

echo "Cài đặt Docker và Docker Compose..."
if ! command -v docker &> /dev/null; then
    sudo apt install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "Docker đã được cài đặt. Vui lòng đăng nhập lại để dùng Docker không cần sudo."
fi

if ! command -v docker-compose &> /dev/null; then
    sudo apt install -y docker-compose
fi

# 2. Build và chạy các container
echo "Build và khởi động các container..."
docker-compose -f docker-compose-microservices.yml up -d

# 3. Kiểm tra trạng thái
echo "Kiểm tra trạng thái các container..."
docker-compose -f docker-compose-microservices.yml ps

# 4. Hiển thị logs
echo "Hiển thị logs của các dịch vụ..."
docker-compose -f docker-compose-microservices.yml logs

echo "===== Triển khai hoàn tất ====="
echo "UserService chạy tại port: 8081 và 50051 (gRPC)"
echo "PostService chạy tại port: 8082"
echo "Nhớ mở các port này trong AWS Security Group!" 