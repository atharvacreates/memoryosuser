@echo off
echo Starting MemoryOS Application...

REM Set environment variables
set OPENROUTER_API_KEY=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
set SUPABASE_DATABASE_URL=postgresql://postgres.ucmclshrcpmylvsphzlx:howtotrainyourpetdragon123987*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
set NODE_ENV=development
set PORT=3000

echo Environment variables set successfully!
echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop the server

REM Start the application
npm run dev
