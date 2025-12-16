Write-Host "Setting up Node.js environment..." -ForegroundColor Green
$env:Path += ";C:\Program Files\nodejs"
Write-Host "Node.js has been added to the PATH for this terminal session." -ForegroundColor Green
Write-Host ""
Write-Host "Node version:" -ForegroundColor Cyan
node -v
Write-Host ""
Write-Host "npm version:" -ForegroundColor Cyan
npm -v
Write-Host ""
Write-Host "You can now use npm commands in this terminal session." -ForegroundColor Green 