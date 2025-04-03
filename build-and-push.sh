#!/bin/bash

# Đảm bảo đã đăng nhập vào Docker Hub
echo "Đảm bảo bạn đã đăng nhập vào Docker Hub với lệnh: docker login"

# Thông số người dùng Docker Hub (thay thế bằng username của bạn)
DOCKER_USERNAME="hoanhaouser"
VERSION="1.0.0"

# Build AuthService
echo "Building AuthService image..."
docker build -t $DOCKER_USERNAME/auth-service:$VERSION ./authservice

# Build Kong với config
echo "Building Kong custom image..."
docker build -t $DOCKER_USERNAME/kong-custom:$VERSION -f ./kong-config/Dockerfile.kong ./kong-config

# Push AuthService lên Docker Hub
echo "Pushing AuthService image to Docker Hub..."
docker push $DOCKER_USERNAME/auth-service:$VERSION

# Push Kong lên Docker Hub
echo "Pushing Kong custom image to Docker Hub..."
docker push $DOCKER_USERNAME/kong-custom:$VERSION

echo "Done! Images have been pushed to Docker Hub."
echo "AuthService: $DOCKER_USERNAME/auth-service:$VERSION"
echo "Kong custom: $DOCKER_USERNAME/kong-custom:$VERSION" 