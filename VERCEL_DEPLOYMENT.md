# 🚀 Vercel Deployment Guide for MemoryOS

This guide will help you deploy MemoryOS to Vercel with the exact same functionality as your localhost setup.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be on GitHub (already done)
3. **Supabase Database**: Your database should be set up and running
4. **OpenRouter API Key**: Your AI API key should be active

## 🔧 Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository: `https://github.com/atharvacreates/memoryosuser.git`
4. Click **"Import"**

## ⚙️ Step 2: Configure Environment Variables

**CRITICAL**: You must set these environment variables in Vercel for the app to work:

### **Required Environment Variables:**

1. **OpenRouter API Key**
   - Name: `OPENROUTER_API_KEY`
   - Value: `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`

2. **Supabase Database URL**
   - Name: `SUPABASE_DATABASE_URL`
   - Value: `postgresql://postgres.ucmclshrcpmylvsphzlx:howtotrainyourpetdragon123987*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`

3. **Node Environment**
   - Name: `NODE_ENV`
   - Value: `production`

### **How to Set Environment Variables in Vercel:**

1. In your Vercel project dashboard, go to **"Settings"**
2. Click on **"Environment Variables"**
3. Add each variable:
   - Click **"Add New"**
   - Enter the **Name** and **Value**
   - Select **"Production"** environment
   - Click **"Save"**
4. Repeat for all 3 variables

## 🏗️ Step 3: Configure Build Settings

Vercel should automatically detect the settings from `vercel.json`, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🚀 Step 4: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at: `https://your-project-name.vercel.app`

## 🔍 Step 5: Verify Deployment

After deployment, test these features:

1. **Frontend**: Visit your Vercel URL
2. **API Endpoints**: Test `/api/memories` endpoint
3. **Database**: Try adding a memory
4. **AI Chat**: Test the chat functionality
5. **Authentication**: Test user login/signup

## 🛠️ Troubleshooting

### **Common Issues:**

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version (18.x recommended)

2. **API Errors**
   - Verify environment variables are set correctly
   - Check Supabase connection string
   - Ensure OpenRouter API key is valid

3. **Database Connection Issues**
   - Verify Supabase database is running
   - Check database URL format
   - Ensure database tables exist

4. **AI Not Working**
   - Check OpenRouter API key
   - Verify API credits are available
   - Check API rate limits

### **Debug Steps:**

1. **Check Vercel Logs**:
   - Go to your project dashboard
   - Click on the latest deployment
   - Check "Functions" tab for API errors
   - Check "Build" tab for build errors

2. **Test Environment Variables**:
   - Add a test API endpoint to verify variables
   - Check if variables are accessible in your code

3. **Database Migration**:
   - Run `npm run db:push` locally to ensure schema is up to date
   - Verify all tables exist in Supabase

## 🔄 Step 6: Continuous Deployment

Once deployed, every push to your GitHub repository will automatically trigger a new deployment.

## 📱 Step 7: Custom Domain (Optional)

1. Go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Configure DNS settings as instructed

## 🎯 Expected Behavior

Your deployed app should work exactly like localhost:

- ✅ **Memory Management**: Add, edit, delete memories
- ✅ **AI Chat**: Natural conversations with memory context
- ✅ **Search**: Find memories by content and tags
- ✅ **Authentication**: User login and session management
- ✅ **Database**: Persistent storage in Supabase
- ✅ **Real-time**: Live updates and notifications

## 🔐 Security Notes

- Environment variables are encrypted in Vercel
- API keys are not exposed in client-side code
- Database connection uses SSL
- All API endpoints are properly secured

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check Supabase dashboard for database issues

---

**🎉 Congratulations!** Your MemoryOS application is now live on Vercel with full functionality!
