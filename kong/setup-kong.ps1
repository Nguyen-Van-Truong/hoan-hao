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
    "paths[]"   = "/users"
    name        = "users-list-route"
    "methods[]" = "GET"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "~/users/\d+"
    name        = "user-get-by-id-route"
    "methods[]" = "GET"
    strip_path  = "false"
    regex_priority = 200
} -ContentType "application/x-www-form-urlencoded"

Write-Host "Adding protected routes for UserService..."
# Route cho protected user endpoints
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/users/me"
    name        = "user-me-get-route"
    "methods[]" = "GET"
    strip_path  = "false"
    regex_priority = 1000  # Tăng mức độ ưu tiên cao hơn
} -ContentType "application/x-www-form-urlencoded"

Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/users/me"
    name        = "user-me-put-route"
    "methods[]" = "PUT"
    strip_path  = "false"
    regex_priority = 1000  # Tăng mức độ ưu tiên cao hơn
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
# Sửa route cho GET /groups (danh sách nhóm)
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups"
    name        = "groups-list-route"
    "methods[]" = "GET"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

# Sửa route cho GET /groups/{id} (xem chi tiết nhóm)
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "~/groups/\d+"
    name        = "group-get-by-id-route"
    "methods[]" = "GET"
    strip_path  = "false"
    regex_priority = 200
} -ContentType "application/x-www-form-urlencoded"

# Sửa route cho GET /groups/{id}/members (xem thành viên nhóm)
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "~/groups/\d+/members"
    name        = "group-members-route"
    "methods[]" = "GET"
    strip_path  = "false"
    regex_priority = 200
} -ContentType "application/x-www-form-urlencoded"

# Protected group routes
# Route cho POST /groups (tạo nhóm mới)
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups"
    name        = "groups-protected-route"
    "methods[]" = "POST"
    strip_path  = "false"
} -ContentType "application/x-www-form-urlencoded"

# Sửa route cho PUT /groups/{id} (cập nhật nhóm), cần sử dụng `~` để bắt đầu regex trong Kong
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "~/groups/\d+"
    name        = "group-update-route"
    "methods[]" = "PUT"
    strip_path  = "false"
    regex_priority = 200
} -ContentType "application/x-www-form-urlencoded"

# Sửa route cho DELETE /groups/{id} (xóa nhóm)
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "~/groups/\d+"
    name        = "group-delete-route"
    "methods[]" = "DELETE"
    strip_path  = "false"
    regex_priority = 200
} -ContentType "application/x-www-form-urlencoded"

# Route cho GET /groups/me (xem nhóm của tôi)
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/routes" -Method Post -Body @{
    "paths[]"   = "/groups/me"
    name        = "my-groups-route"
    "methods[]" = "GET"
    strip_path  = "false"
    regex_priority = 1000  # Tăng mức độ ưu tiên cao hơn
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

# Thêm hàm kiểm tra route tồn tại
function Wait-RouteCreation($routeName, $maxAttempts = 5) {
    Write-Host "Waiting for route $routeName to be created..."
    $attempts = 0
    $success = $false

    while ($attempts -lt $maxAttempts -and -not $success) {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8001/routes/$routeName" -Method Get -ErrorAction SilentlyContinue
            if ($response -ne $null -and $response.name -eq $routeName) {
                Write-Host "Route $routeName found."
                $success = $true
            }
        } catch {
            Write-Host "Route $routeName not found yet. Waiting..."
            Start-Sleep -Seconds 1
        }
        $attempts++
    }

    if (-not $success) {
        Write-Warning "Route $routeName not found after $maxAttempts attempts."
    }

    return $success
}

# Thêm sau phần định nghĩa tất cả các route
Write-Host "Waiting for routes to be created..."
Start-Sleep -Seconds 2

# Bước 3: Kích hoạt JWT Plugin cho các route cần xác thực
Write-Host "Enabling JWT plugin for UserService protected routes..."

# JWT cho user/me routes
if (Wait-RouteCreation "user-me-get-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/user-me-get-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for user-me-get-route"
}

if (Wait-RouteCreation "user-me-put-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/user-me-put-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for user-me-put-route"
}

# JWT cho friends route
if (Wait-RouteCreation "friends-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/friends-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for friends-route"
}

# JWT cho các protected group routes
if (Wait-RouteCreation "groups-protected-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/groups-protected-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for groups-protected-route"
}

# Sửa phần này để sử dụng tên route đúng
if (Wait-RouteCreation "group-update-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/group-update-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for group-update-route"
}

if (Wait-RouteCreation "group-delete-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/group-delete-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for group-delete-route"
}

if (Wait-RouteCreation "my-groups-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/my-groups-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for my-groups-route"
}

Write-Host "Enabling JWT plugin for PostService authenticated routes..."
if (Wait-RouteCreation "post-auth-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/post-auth-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for post-auth-route"
}

Write-Host "Enabling JWT plugin for Comment authenticated routes..."
if (Wait-RouteCreation "comment-auth-route") {
    Invoke-RestMethod -Uri "http://localhost:8001/routes/comment-auth-route/plugins" -Method Post -Body @{
        name = "jwt"
    } -ContentType "application/x-www-form-urlencoded"
} else {
    Write-Warning "Skipping JWT plugin for comment-auth-route"
}

# Bước 4: Thêm plugin CORS cho tất cả services
# Kích hoạt plugin CORS cho AuthService
Write-Host "Enabling CORS plugin for AuthService..."
$bodyCorsAuth = "name=cors&config.origins=*&config.methods[]=GET&config.methods[]=POST&config.methods[]=PUT&config.methods[]=DELETE&config.methods[]=OPTIONS&config.headers[]=Content-Type&config.headers[]=Authorization&config.credentials=true&config.preflight_continue=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/auth-service/plugins" -Method Post -Body $bodyCorsAuth -ContentType "application/x-www-form-urlencoded"

# Kích hoạt plugin CORS cho UserService
Write-Host "Enabling CORS plugin for UserService..."
$bodyCorsUser = "name=cors&config.origins=*&config.methods[]=GET&config.methods[]=POST&config.methods[]=PUT&config.methods[]=DELETE&config.methods[]=OPTIONS&config.headers[]=Content-Type&config.headers[]=Authorization&config.credentials=true&config.preflight_continue=false"
Invoke-RestMethod -Uri "http://localhost:8001/services/user-service/plugins" -Method Post -Body $bodyCorsUser -ContentType "application/x-www-form-urlencoded"

# Kích hoạt plugin CORS cho PostService
Write-Host "Enabling CORS plugin for PostService..."
$bodyCorsPost = "name=cors&config.origins=*&config.methods[]=GET&config.methods[]=POST&config.methods[]=PUT&config.methods[]=DELETE&config.methods[]=OPTIONS&config.headers[]=Content-Type&config.headers[]=Authorization&config.credentials=true&config.preflight_continue=false"
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