# setup-kong.ps1
# Script để tự động cấu hình Kong Gateway cho dự án hoan-hao

# Đảm bảo Kong đang chạy
Write-Host "Checking Kong Admin API..."
$kongStatus = Invoke-WebRequest -Uri "http://localhost:8001" -Method Head -UseBasicParsing
if ($kongStatus.StatusCode -ne 200) {
    Write-Host "Error: Kong is not running. Please start Kong with 'docker-compose up -d' first."
    exit
}
Write-Host "Kong is running."

# Bước 0: Kích hoạt CORS plugin ở cấp global
Write-Host "Enabling CORS plugin globally..."

# Tạo form data cho CORS plugin với mảng các methods
$formData = "name=cors&config.origins=*&config.credentials=true&config.max_age=3600&config.preflight_continue=false"
$formData += "&config.methods=GET&config.methods=POST&config.methods=PUT&config.methods=DELETE&config.methods=OPTIONS"
$formData += "&config.headers=Accept&config.headers=Accept-Version&config.headers=Content-Length&config.headers=Content-MD5"
$formData += "&config.headers=Content-Type&config.headers=Date&config.headers=X-Auth-Token&config.headers=Authorization"
$formData += "&config.exposed_headers=Authorization"

Invoke-RestMethod -Uri "http://localhost:8001/plugins" -Method Post -Body $formData -ContentType "application/x-www-form-urlencoded"

# Bước 1: Đăng ký Services
Write-Host "Registering AuthService..."
Invoke-RestMethod -Uri "http://localhost:8001/services" -Method Post -Body @{
    name = "auth-service"
    url  = "http://host.docker.internal:8080"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Registering UserService..."
Invoke-RestMethod -Uri "http://localhost:8001/services" -Method Post -Body @{
    name = "user-service"
    url  = "http://host.docker.internal:8081"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Registering PostService..."
Invoke-RestMethod -Uri "http://localhost:8001/services" -Method Post -Body @{
    name = "post-service"
    url  = "http://host.docker.internal:8082"
} -ContentType "application/x-www-form-urlencoded"

# Bước 2: Đăng ký Routes
Write-Host "Adding route for AuthService..."
Invoke-RestMethod -Uri "http://localhost:8001/services/auth-service/routes" -Method Post -Body @{
    "paths[]"   = "/auth"
    name        = "auth-route"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding public routes for UserService..."
# Route cho public user endpoints
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/user/createProfile"
    name        = "user-create-profile-route"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding routes for public user profile access..."
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/users$"
    name        = "users-list-route"
    "methods[]" = "GET"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/users/[0-9]+$"
    name        = "user-get-by-id-route"
    "methods[]" = "GET"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding protected routes for UserService..."
# Route cho protected user endpoints
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/users/me"
    name        = "user-me-route"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

# Route cho friends API
Write-Host "Adding routes for friends API..."
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/friends"
    name        = "friends-route"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

# Route cho groups API
Write-Host "Adding routes for groups API..."
# Public group routes
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups$"
    name        = "groups-list-route"
    "methods[]" = "GET"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups/[0-9]+$"
    name        = "group-get-by-id-route"
    "methods[]" = "GET"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups/[0-9]+/members"
    name        = "group-members-route"
    "methods[]" = "GET"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

# Protected group routes
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups"
    name        = "groups-protected-route"
    "methods[]" = "POST"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

# Tạo hai route riêng biệt cho PUT và DELETE thay vì kết hợp chúng
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups/[0-9]+"
    name        = "group-update-route"
    "methods[]" = "PUT"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups/[0-9]+"
    name        = "group-delete-route"
    "methods[]" = "DELETE"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups/me"
    name        = "my-groups-route"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

# Health check route
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/health"
    name        = "user-service-health-route"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding route for PostService (public routes - /post)..."
$bodyPostPublic = "paths[]=/post&name=post-public-route&methods[]=GET&methods[]=OPTIONS&strip_path=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/post-service/routes" -Method Post -Body $bodyPostPublic -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding route for PostService (authenticated routes - /post)..."
$bodyPostAuth = "paths[]=/post&name=post-auth-route&methods[]=POST&methods[]=PUT&methods[]=DELETE&methods[]=OPTIONS&strip_path=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/post-service/routes" -Method Post -Body $bodyPostAuth -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding route for Comment in PostService (authenticated routes)..."
$bodyCommentAuth = "paths[]=/comment&name=comment-auth-route&methods[]=POST&methods[]=PUT&methods[]=DELETE&methods[]=OPTIONS&strip_path=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/post-service/routes" -Method Post -Body $bodyCommentAuth -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding route for PostService (public routes - /post/user)..."
$bodyUserPublic = "paths[]=/post/user&name=user-public-route&methods[]=GET&methods[]=OPTIONS&strip_path=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/post-service/routes" -Method Post -Body $bodyUserPublic -ContentType "application/x-www-form-urlencoded"

# Bước 3: Kích hoạt JWT Plugin cho các route cần xác thực
Write-Host "Enabling JWT plugin for UserService protected routes..."
# JWT cho user/me route
Invoke-RestMethod -Uri "http://localhost:8001/routes/user-me-route/plugins" -Method Post -Body @{
    name = "jwt"
} -ContentType "application/x-www-form-urlencoded"

# JWT cho friends route
Invoke-RestMethod -Uri "http://localhost:8001/routes/friends-route/plugins" -Method Post -Body @{
    name = "jwt"
} -ContentType "application/x-www-form-urlencoded"

# JWT cho các protected group routes
Invoke-RestMethod -Uri "http://localhost:8001/routes/groups-protected-route/plugins" -Method Post -Body @{
    name = "jwt"
} -ContentType "application/x-www-form-urlencoded"

# Sửa phần này để sử dụng tên route đúng
Invoke-RestMethod -Uri "http://localhost:8001/routes/group-update-route/plugins" -Method Post -Body @{
    name = "jwt"
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/routes/group-delete-route/plugins" -Method Post -Body @{
    name = "jwt"
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/routes/my-groups-route/plugins" -Method Post -Body @{
    name = "jwt"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Enabling JWT plugin for PostService authenticated routes..."
Invoke-RestMethod -Uri "http://localhost:8001/routes/post-auth-route/plugins" -Method Post -Body @{
    name = "jwt"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Enabling JWT plugin for Comment authenticated routes..."
Invoke-RestMethod -Uri "http://localhost:8001/routes/comment-auth-route/plugins" -Method Post -Body @{
    name = "jwt"
} -ContentType "application/x-www-form-urlencoded"

# Bước 5: Tạo Consumer và JWT Credential
Write-Host "Creating consumer 'test-user'..."
Invoke-RestMethod -Uri "http://localhost:8001/consumers" -Method Post -Body @{
    username = "test-user"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Creating JWT credential for 'test-user'..."
Invoke-RestMethod -Uri "http://localhost:8001/consumers/test-user/jwt" -Method Post -Body @{
    key    = "hoanhao-auth-service"  # Sửa key để khớp với iss trong token
    secret = "mysecretkeyforhs256whichislongenough" # Phải giống với JWT Secret trong application.yml hiện tại
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Kong configuration completed successfully!"