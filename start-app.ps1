Write-Host "Starting MemoryOS Application..." -ForegroundColor Green

# Set environment variables
$env:OPENROUTER_API_KEY = "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"
$env:SUPABASE_DATABASE_URL = "postgresql://postgres.ucmclshrcpmylvsphzlx:howtotrainyourpetdragon123987*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
$env:NODE_ENV = "development"
$env:PORT = "3000"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "Starting server on http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan

# Start the application
npm run dev
