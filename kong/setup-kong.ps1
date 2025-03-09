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

Write-Host "Adding route for UserService..."
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/user"
    name        = "user-route"
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
Write-Host "Enabling JWT plugin for UserService..."
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/plugins" -Method Post -Body @{
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

# Bước 4: Thêm plugin CORS cho tất cả services
Write-Host "Enabling CORS plugin for AuthService..."
$bodyCorsAuth = "name=cors&config.origins=http://localhost:3000&config.methods[]=GET&config.methods[]=POST&config.methods[]=PUT&config.methods[]=DELETE&config.methods[]=OPTIONS&config.headers[]=Content-Type&config.headers[]=Authorization&config.credentials=true&config.preflight_continue=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/auth-service/plugins" -Method Post -Body $bodyCorsAuth -ContentType "application/x-www-form-urlencoded"

Write-Host "Enabling CORS plugin for UserService..."
$bodyCorsUser = "name=cors&config.origins=http://localhost:3000&config.methods[]=GET&config.methods[]=POST&config.methods[]=PUT&config.methods[]=DELETE&config.methods[]=OPTIONS&config.headers[]=Content-Type&config.headers[]=Authorization&config.credentials=true&config.preflight_continue=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/plugins" -Method Post -Body $bodyCorsUser -ContentType "application/x-www-form-urlencoded"

Write-Host "Enabling CORS plugin for PostService..."
$bodyCorsPost = "name=cors&config.origins=http://localhost:3000&config.methods[]=GET&config.methods[]=POST&config.methods[]=PUT&config.methods[]=DELETE&config.methods[]=OPTIONS&config.headers[]=Content-Type&config.headers[]=Authorization&config.credentials=true&config.preflight_continue=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/post-service/plugins" -Method Post -Body $bodyCorsPost -ContentType "application/x-www-form-urlencoded"

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