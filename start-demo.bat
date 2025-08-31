@echo off
echo Starting MemoryOS Application in Demo Mode...

REM Set environment variables for demo mode
set DEMO_MODE=true
set NODE_ENV=development
set PORT=3000

echo Demo mode enabled - no database or API keys required!
echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop the server

REM Start the application in demo mode
npm run demo
