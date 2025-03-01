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

# Bước 2: Đăng ký Services
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

# Bước 3: Đăng ký Routes
Write-Host "Adding route for AuthService..."
Invoke-RestMethod -Uri "http://localhost:8001/services/auth-service/routes" -Method Post -Body @{
    "paths[]"    = "/auth"
    name         = "auth-route"
    strip_path   = "false"  # Sửa từ "true" thành "false"
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding route for UserService..."
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]" = "/user"
    name      = "user-route"
    strip_path = "false"  # Sửa từ "true" thành "false"
} -ContentType "application/x-www-form-urlencoded"

# Bước 4: Kích hoạt JWT Plugin cho UserService
Write-Host "Enabling JWT plugin for UserService..."
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/plugins" -Method Post -Body @{
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