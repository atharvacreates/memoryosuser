Write-Host "Starting MemoryOS Application in Demo Mode..." -ForegroundColor Green

# Set environment variables for demo mode
$env:DEMO_MODE = "true"
$env:NODE_ENV = "development"
$env:PORT = "3000"

Write-Host "Demo mode enabled - no database or API keys required!" -ForegroundColor Green
Write-Host "Starting server on http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan

# Start the application in demo mode
npm run demo
