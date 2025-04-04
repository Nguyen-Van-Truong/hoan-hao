#!/bin/bash
# Script để tự động cấu hình Kong Gateway cho dự án hoan-hao

# Đợi Kong Admin API sẵn sàng
echo "Waiting for Kong Admin API..."
while ! curl -s http://kong:8001 > /dev/null; do
    sleep 5
    echo "Waiting for Kong Admin API..."
done
echo "Kong is running."

# Đợi Auth Service sẵn sàng (sử dụng check đơn giản với nhiều thử lại hơn)
echo "Waiting for Auth Service..."
max_retries=20
retry_count=0
while ! curl -s --connect-timeout 5 http://auth-service:8080 > /dev/null && [ $retry_count -lt $max_retries ]; do
    sleep 10
    echo "Waiting for Auth Service... ($(($retry_count + 1))/$max_retries)"
    retry_count=$((retry_count + 1))
done

if [ $retry_count -ge $max_retries ]; then
    echo "WARNING: Could not connect to Auth Service after $max_retries attempts, proceeding anyway..."
else
    echo "Auth Service is reachable."
fi

# Bước 0: Kích hoạt CORS plugin ở cấp global
echo "Enabling CORS plugin globally..."

curl -s -X POST http://kong:8001/plugins \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.methods=GET" \
  --data "config.methods=POST" \
  --data "config.methods=PUT" \
  --data "config.methods=DELETE" \
  --data "config.methods=OPTIONS" \
  --data "config.methods=PATCH" \
  --data "config.headers=Accept" \
  --data "config.headers=Accept-Version" \
  --data "config.headers=Content-Length" \
  --data "config.headers=Content-MD5" \
  --data "config.headers=Content-Type" \
  --data "config.headers=Date" \
  --data "config.headers=X-Auth-Token" \
  --data "config.headers=Authorization" \
  --data "config.headers=Origin" \
  --data "config.exposed_headers=Authorization" \
  --data "config.credentials=true" \
  --data "config.max_age=3600" \
  --data "config.preflight_continue=false"

# Bước 1: Đăng ký Services
echo "Registering AuthService..."
curl -s -X POST http://kong:8001/services \
  --data "name=auth-service" \
  --data "url=http://auth-service:8080"

echo "Registering UserService..."
curl -s -X POST http://kong:8001/services \
  --data "name=user-service" \
  --data "url=http://user-service:8081"

echo "Registering PostService..."
curl -s -X POST http://kong:8001/services \
  --data "name=post-service" \
  --data "url=http://post-service:8082"

# Bước 2: Đăng ký Routes
echo "Adding route for AuthService..."
curl -s -X POST http://kong:8001/services/auth-service/routes \
  --data "paths[]=/auth" \
  --data "paths[]=/auth/" \
  --data "paths[]=/auth/login" \
  --data "paths[]=/auth/register" \
  --data "name=auth-route" \
  --data "strip_path=false" \
  --data "preserve_host=true"

# Thêm health check endpoint cho AuthService - comment out nếu không có
# echo "Adding health check route for AuthService..."
# curl -s -X POST http://kong:8001/services/auth-service/routes \
#   --data "paths[]=/auth/actuator/health" \
#   --data "name=auth-health-route" \
#   --data "strip_path=false"

echo "Adding public routes for UserService..."
# Route cho public user endpoints
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/user/createProfile" \
  --data "name=user-create-profile-route" \
  --data "strip_path=false"

echo "Adding routes for public user profile access..."
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/users" \
  --data "name=users-list-route" \
  --data "methods[]=GET" \
  --data "strip_path=false"

curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=~/users/\d+" \
  --data "name=user-get-by-id-route" \
  --data "methods[]=GET" \
  --data "strip_path=false" \
  --data "regex_priority=200"

echo "Adding protected routes for UserService..."
# Route cho protected user endpoints
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/users/me" \
  --data "name=user-me-get-route" \
  --data "methods[]=GET" \
  --data "strip_path=false" \
  --data "regex_priority=1000"

curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/users/me" \
  --data "name=user-me-put-route" \
  --data "methods[]=PUT" \
  --data "strip_path=false" \
  --data "regex_priority=1000"

# Route cho friends API
echo "Adding routes for friends API..."
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/friends" \
  --data "name=friends-route" \
  --data "strip_path=false"

# Route cho groups API
echo "Adding routes for groups API..."
# Route cho GET /groups (danh sách nhóm)
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/groups" \
  --data "name=groups-list-route" \
  --data "methods[]=GET" \
  --data "strip_path=false"

# Route cho GET /groups/{id} (xem chi tiết nhóm)
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=~/groups/\d+" \
  --data "name=group-get-by-id-route" \
  --data "methods[]=GET" \
  --data "strip_path=false" \
  --data "regex_priority=200"

# Route cho GET /groups/{id}/members (xem thành viên nhóm)
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=~/groups/\d+/members" \
  --data "name=group-members-route" \
  --data "methods[]=GET" \
  --data "strip_path=false" \
  --data "regex_priority=200"

# Protected group routes
# Route cho POST /groups (tạo nhóm mới)
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/groups" \
  --data "name=groups-protected-route" \
  --data "methods[]=POST" \
  --data "strip_path=false"

# Route cho PUT /groups/{id} (cập nhật nhóm)
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=~/groups/\d+" \
  --data "name=group-update-route" \
  --data "methods[]=PUT" \
  --data "strip_path=false" \
  --data "regex_priority=200"

# Route cho DELETE /groups/{id} (xóa nhóm)
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=~/groups/\d+" \
  --data "name=group-delete-route" \
  --data "methods[]=DELETE" \
  --data "strip_path=false" \
  --data "regex_priority=200"

# Route cho GET /groups/me (xem nhóm của tôi)
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/groups/me" \
  --data "name=my-groups-route" \
  --data "methods[]=GET" \
  --data "strip_path=false" \
  --data "regex_priority=1000"

# Health check route
curl -s -X POST http://kong:8001/services/user-service/routes \
  --data "paths[]=/health" \
  --data "name=user-service-health-route" \
  --data "strip_path=false"

echo "Adding route for PostService (public routes - /post)..."
curl -s -X POST http://kong:8001/services/post-service/routes \
  --data "paths[]=/post" \
  --data "name=post-public-route" \
  --data "methods[]=GET" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false"

echo "Adding route for PostService (authenticated routes - /post)..."
curl -s -X POST http://kong:8001/services/post-service/routes \
  --data "paths[]=/post" \
  --data "name=post-auth-route" \
  --data "methods[]=POST" \
  --data "methods[]=PUT" \
  --data "methods[]=DELETE" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false"

echo "Adding route for Comment in PostService (authenticated routes)..."
curl -s -X POST http://kong:8001/services/post-service/routes \
  --data "paths[]=/comment" \
  --data "name=comment-auth-route" \
  --data "methods[]=POST" \
  --data "methods[]=PUT" \
  --data "methods[]=DELETE" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false"

echo "Adding route for PostService (public routes - /post/user)..."
curl -s -X POST http://kong:8001/services/post-service/routes \
  --data "paths[]=/post/user" \
  --data "name=user-public-route" \
  --data "methods[]=GET" \
  --data "methods[]=OPTIONS" \
  --data "strip_path=false"

# Đợi route được tạo
echo "Waiting for routes to be created..."
sleep 5

# Bước 3: Kích hoạt JWT Plugin cho các route cần xác thực
echo "Enabling JWT plugin for UserService protected routes..."

# JWT cho user/me routes
echo "Enabling JWT for user-me-get-route..."
curl -s -X POST http://kong:8001/routes/user-me-get-route/plugins \
  --data "name=jwt"

echo "Enabling JWT for user-me-put-route..."
curl -s -X POST http://kong:8001/routes/user-me-put-route/plugins \
  --data "name=jwt"

# JWT cho friends route
echo "Enabling JWT for friends-route..."
curl -s -X POST http://kong:8001/routes/friends-route/plugins \
  --data "name=jwt"

# JWT cho protected group routes
echo "Enabling JWT for groups-protected-route..."
curl -s -X POST http://kong:8001/routes/groups-protected-route/plugins \
  --data "name=jwt"

echo "Enabling JWT for group-update-route..."
curl -s -X POST http://kong:8001/routes/group-update-route/plugins \
  --data "name=jwt"

echo "Enabling JWT for group-delete-route..."
curl -s -X POST http://kong:8001/routes/group-delete-route/plugins \
  --data "name=jwt"

echo "Enabling JWT for my-groups-route..."
curl -s -X POST http://kong:8001/routes/my-groups-route/plugins \
  --data "name=jwt"

# JWT cho Post Service protected routes
echo "Enabling JWT for post-auth-route..."
curl -s -X POST http://kong:8001/routes/post-auth-route/plugins \
  --data "name=jwt"

echo "Enabling JWT for comment-auth-route..."
curl -s -X POST http://kong:8001/routes/comment-auth-route/plugins \
  --data "name=jwt"

echo "Kong configuration completed!" 