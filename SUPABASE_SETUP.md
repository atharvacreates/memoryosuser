# Supabase Database Setup for MemoryOS

## Why Supabase?
- **Free Tier**: No cost for up to 50,000 rows and 500MB database
- **PostgreSQL**: Full PostgreSQL compatibility with vector extensions
- **No Replit Dependencies**: Works on any platform, including Replit free plan

## Setup Instructions

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Get Database Connection String
1. In your Supabase dashboard, click the **"Connect"** button
2. Select **"Connection string"** tab
3. Choose **"Transaction pooler"** (recommended for applications)
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### 3. Add to Replit Secrets
1. In your Replit project, click the **lock icon** (Secrets) in the sidebar
2. Add a new secret:
   - **Key**: `DATABASE_URL`
   - **Value**: Your complete Supabase connection string

### 4. Database Migration
The system will automatically create all necessary tables when you start the application:
- `users` - User accounts with authentication data
- `memories` - Your stored thoughts, notes, ideas, etc.
- `chat_sessions` - AI conversation history
- `searches` - Search history for analytics
- `sessions` - Authentication session storage

### 5. Verify Connection
Once you've added the DATABASE_URL secret, restart your Replit application. You should see:
```
Created demo user: { id: 'demo-user', email: 'demo@example.com', ... }
[express] serving on port 5000
```

## Benefits of Supabase
- **Real-time subscriptions** (if needed later)
- **Built-in authentication** (alternative to Replit auth)
- **Row Level Security** for data protection
- **Automatic backups**
- **SQL editor** for direct database access
- **REST API** auto-generated from your schema

## Troubleshooting
- **Connection fails**: Double-check your password in the connection string
- **Permission denied**: Ensure you're using the "Transaction pooler" connection string
- **Tables not created**: Check the application logs for any schema errors

The system is now completely independent of Replit's paid features and will work on any hosting platform!