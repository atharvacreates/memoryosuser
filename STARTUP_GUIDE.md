# MemoryOS Startup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Supabase account (for database)

## Quick Start (Development Mode)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database (Required)
You need a Supabase database connection. Follow these steps:

1. **Create a Supabase Account**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Database URL**:
   - In your Supabase dashboard, click "Connect"
   - Select "Connection string" tab
   - Choose "Transaction pooler" (recommended)
   - Copy the connection string

3. **Set Environment Variable**:
   Create a `.env` file in the project root with:
   ```
   SUPABASE_DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   Replace `[YOUR-PASSWORD]` with your actual database password.

### 3. Start the Development Server

#### Option A: With Database (Production)
```bash
npm run dev
```

#### Option B: Demo Mode (No Database Required)
```bash
npm run demo
```

The application will be available at: http://localhost:3000

## Production Build

### 1. Build the Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Stopping the Application

### Development Mode
- Press `Ctrl + C` in the terminal where the server is running

### Production Mode
- Press `Ctrl + C` in the terminal where the server is running
- Or kill the process: `taskkill /F /IM node.exe` (Windows)

## Troubleshooting

### Common Issues

1. **"SUPABASE_DATABASE_URL must be set"**
   - Make sure you have created a `.env` file with your database URL
   - Verify the connection string is correct

2. **Port 3000 already in use**
   - Change the port in `server/index.ts` or kill the process using port 3000
   - Use: `netstat -ano | findstr :3000` to find the process ID

3. **TypeScript errors**
   - Run `npm run check` to see all type errors
   - Fix any type issues before starting the server

4. **Database connection fails**
   - Check your Supabase connection string
   - Ensure your database is active in Supabase dashboard
   - Verify your password is correct

### Environment Variables

Required environment variables:
- `SUPABASE_DATABASE_URL` - Your Supabase database connection string

Optional environment variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DEMO_MODE` - Set to 'true' to run without database (uses in-memory storage)

## Project Structure

```
memoryos-main/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schema
├── api/             # API routes
└── attached_assets/ # Static assets
```

## Features

- Personal knowledge management system
- AI-powered memory search and organization
- Chat interface for querying memories
- Tag-based organization
- Semantic search capabilities

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify your database connection
3. Ensure all dependencies are installed
4. Check the TypeScript compilation with `npm run check`
