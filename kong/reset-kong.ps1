# reset-kong.ps1
# Script để xóa tất cả cấu hình Kong hiện tại

Write-Host "Checking Kong Admin API..."
try {
    $kongStatus = Invoke-WebRequest -Uri "http://localhost:8001" -Method Head -UseBasicParsing
    if ($kongStatus.StatusCode -ne 200) {
        Write-Host "Error: Kong is not running. Please start Kong with 'docker-compose up -d' first."
        exit
    }
} catch {
    Write-Host "Error: Kong is not running. Please start Kong with 'docker-compose up -d' first."
    exit
}
Write-Host "Kong is running."

# Lấy danh sách services
Write-Host "Getting list of Kong services..."
$services = Invoke-RestMethod -Uri "http://localhost:8001/services" -Method Get

# Xóa tất cả routes
Write-Host "Deleting all Kong routes..."
$routes = Invoke-RestMethod -Uri "http://localhost:8001/routes" -Method Get
foreach ($route in $routes.data) {
    Write-Host "Deleting route: $($route.name)"
    Invoke-RestMethod -Uri "http://localhost:8001/routes/$($route.id)" -Method Delete
}

# Xóa tất cả plugins
Write-Host "Deleting all Kong plugins..."
$plugins = Invoke-RestMethod -Uri "http://localhost:8001/plugins" -Method Get
foreach ($plugin in $plugins.data) {
    Write-Host "Deleting plugin: $($plugin.id)"
    Invoke-RestMethod -Uri "http://localhost:8001/plugins/$($plugin.id)" -Method Delete
}

# Xóa tất cả consumers
Write-Host "Deleting all Kong consumers..."
$consumers = Invoke-RestMethod -Uri "http://localhost:8001/consumers" -Method Get
foreach ($consumer in $consumers.data) {
    Write-Host "Deleting consumer: $($consumer.username)"
    Invoke-RestMethod -Uri "http://localhost:8001/consumers/$($consumer.id)" -Method Delete
}

# Xóa tất cả services
Write-Host "Deleting all Kong services..."
foreach ($service in $services.data) {
    Write-Host "Deleting service: $($service.name)"
    Invoke-RestMethod -Uri "http://localhost:8001/services/$($service.id)" -Method Delete
}

Write-Host "Kong configuration reset successfully!" 