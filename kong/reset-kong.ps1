# reset-kong.ps1
# Script để xóa các cấu hình Kong hiện tại và thiết lập lại

# Đảm bảo Kong đang chạy
Write-Host "Checking Kong Admin API..."
$kongStatus = Invoke-WebRequest -Uri "http://localhost:8001" -Method Head -UseBasicParsing
if ($kongStatus.StatusCode -ne 200) {
    Write-Host "Error: Kong is not running. Please start Kong with 'docker-compose up -d' first."
    exit
}
Write-Host "Kong is running."

# Xóa tất cả các plugin CORS hiện tại
Write-Host "Removing existing CORS plugins..."
$plugins = Invoke-RestMethod -Uri "http://localhost:8001/plugins" -Method Get
foreach ($plugin in $plugins.data) {
    if ($plugin.name -eq "cors") {
        Write-Host "Removing CORS plugin with ID: $($plugin.id)"
        Invoke-RestMethod -Uri "http://localhost:8001/plugins/$($plugin.id)" -Method Delete
    }
}

Write-Host "Kong CORS plugins have been reset successfully!" 