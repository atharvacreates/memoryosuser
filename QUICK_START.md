# MemoryOS Quick Start

## 🚀 Get Started in 30 Seconds

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application

#### Option A: Full Version (with Database & AI)
**Windows Batch File:**
```bash
start-app.bat
```

**PowerShell:**
```powershell
.\start-app.ps1
```

#### Option B: Demo Mode (No Database Required)
**Windows Batch File:**
```bash
start-demo.bat
```

**PowerShell:**
```powershell
.\start-demo.ps1
```

#### Option C: Manual Start (if you prefer)
```bash
npm run dev    # Full version
npm run demo   # Demo mode
```

### 3. Open Your Browser
Go to: http://localhost:3000

## 🎯 What You Can Do

- **Add Memories**: Store your thoughts, ideas, notes, and learnings
- **Search**: Find memories using natural language
- **Chat**: Ask AI questions about your stored memories
- **Organize**: Use tags and categories to organize your knowledge

## 🛑 How to Stop

Press `Ctrl + C` in the terminal where the server is running.

## 🔧 For Production Use

If you want to use a real database:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Get your database connection string
3. Create a `.env` file with: `SUPABASE_DATABASE_URL=your_connection_string`
4. Run: `npm run dev`

## 📁 Project Status

✅ **Fixed Issues:**
- TypeScript compilation errors
- Windows compatibility issues
- Database dependency for demo mode
- Port configuration

✅ **Working Features:**
- Demo mode with in-memory storage
- React frontend with modern UI
- Express backend API
- Memory management system
- AI-powered search and chat

## 🆘 Need Help?

Check the full `STARTUP_GUIDE.md` for detailed instructions and troubleshooting.
