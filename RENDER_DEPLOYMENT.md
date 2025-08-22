# Render Deployment Guide

## Step-by-Step Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account (no credit card needed)
3. Authorize Render to access your repositories

### Step 3: Deploy Using Blueprint (Automatic)
1. **In Render Dashboard:** Click "New +"
2. **Select:** "Blueprint"
3. **Connect Repository:** Select your `grocademy` repository
4. **Render will detect:** the `render.yaml` file
5. **Click:** "Apply"
6. **Wait:** for automatic deployment (~5-10 minutes)

### Step 4: Configure Environment Variables
After deployment, go to your web service settings and add:

**Required R2 Variables:**
```
R2_ACCESS_KEY_ID=8ce4f34691d16e025d36802288d8f669
R2_SECRET_ACCESS_KEY=f52a839bfb777883b48b75cd8e57bd48be40ddd2e58b88b02e7fd60dea5790fc
R2_BUCKET_NAME=grocademy-media
R2_ENDPOINT=https://12bda686e7d9a30ceba49d12af89e1a5.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-8a6e1a65654a4cfc88a11cb73b88039a.r2.dev
```

**Update BASE_URL:**
Replace `https://grocademy.onrender.com` with your actual Render URL.

### Step 5: Alternative Manual Setup
If Blueprint doesn't work:

1. **Create PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `grocademy-db`
   - Plan: Free
   - Note the connection details

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Runtime: Docker
   - Plan: Free
   - Build Command: (leave default)
   - Start Command: (leave default)

3. **Set Environment Variables:**
   - All the variables from Step 4
   - DATABASE_URL from your PostgreSQL service

### Step 6: Access Your Application
- **Main App:** `https://your-app-name.onrender.com`
- **API Docs:** `https://your-app-name.onrender.com/api/docs`
- **Admin Login:** username: `admin`, password: `admin123`

## Important Notes

### Free Tier Limitations
- **Service sleeps** after 15 minutes of inactivity
- **First request** may take 30+ seconds to wake up
- **750 hours/month** limit (usually sufficient)
- **Database:** 1GB storage limit

### File Storage
- **Uploads persist** during service lifetime
- **Files lost** when service restarts (use R2 for persistence)
- **R2 integration** ensures files survive restarts

### Troubleshooting

**Build Fails:**
- Check Render build logs
- Verify all dependencies in package.json
- Ensure Dockerfile syntax is correct

**Database Connection Issues:**
- Verify DATABASE_URL is set correctly
- Check database is in same region
- Ensure database credentials are correct

**Environment Variable Issues:**
- Double-check all R2 variables are set
- Restart service after changing variables
- Check for typos in variable names

**Application Won't Start:**
- Check application logs in Render dashboard
- Verify PORT environment variable usage
- Ensure views are copied correctly

### Updating Your Application
1. Push changes to GitHub main branch
2. Render automatically redeploys
3. Monitor deployment in dashboard
4. Check logs for any errors

## Success Indicators
- ✅ Build completes successfully
- ✅ Database connection works
- ✅ Application starts without errors
- ✅ API documentation accessible
- ✅ File uploads work with R2
- ✅ Admin login functional

Your Grocademy application should be live! 🎉

## Support
If you encounter issues:
1. Check Render dashboard logs
2. Verify all environment variables
3. Test database connection
4. Confirm R2 bucket access
