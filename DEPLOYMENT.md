# 🚀 RideMate Deployment Guide

This guide will help you deploy RideMate with CI/CD using GitHub Actions, Vercel (Frontend), and Render (Backend).

---

## 📋 Prerequisites

### Required Accounts
1. **GitHub Account** - For code hosting and CI/CD
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (Free tier)
3. **Render Account** - Sign up at [render.com](https://render.com) (Free tier)
4. **MongoDB Atlas** - For production database

---

## 🗂️ Step 1: Prepare Your GitHub Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - RideMate app"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `ridemate`
3. **Do NOT** initialize with README (we already have code)

### 1.3 Push Code to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/ridemate.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2: Set Up MongoDB Atlas (Production Database)

### 2.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Create a **FREE M0 cluster**
4. Choose a cloud provider and region (closest to you)
5. Click "Create Cluster"

### 2.2 Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **Confirm**

### 2.3 Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Set username and password (save these!)
3. Grant **Read and Write** access
4. Click **Add User**

### 2.4 Get Connection String
1. Click **Connect** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ridemate?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your credentials
5. **Save this connection string** - you'll need it!

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your `ridemate` repository
5. Click **"Import"**

### 3.2 Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Set Environment Variables
Click **"Environment Variables"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | (We'll get this in Step 4) |
| `VITE_APP_ENV` | `production` | |

**Note**: Leave `VITE_API_URL` as placeholder for now. We'll update it after deploying the backend.

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. Your frontend will be live at: `https://your-app.vercel.app`
4. **Save this URL!**

---

## ⚙️ Step 4: Deploy Backend to Render

### 4.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `ridemate` repository

### 4.2 Configure Service Settings
- **Name**: `ridemate-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

### 4.3 Set Environment Variables
Click **"Environment"** and add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | Render will override this |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 2 |
| `JWT_SECRET` | `your-super-secret-key-123456` | Generate a strong random string |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel URL from Step 3 |

**Generate JWT Secret:**
```bash
# Run this command to generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (~3-5 minutes)
3. Your backend will be live at: `https://ridemate-backend-xxxx.onrender.com`
4. **Save this URL!**

### 4.5 Get Deploy Hook URL
1. Go to your service **Settings**
2. Scroll to **"Deploy Hook"**
3. Click **"Create Deploy Hook"**
4. Name it `github-actions`
5. Copy the webhook URL
6. **Save this URL!**

---

## 🔄 Step 5: Update Frontend Environment Variable

### 5.1 Update Vercel Environment Variable
1. Go back to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Edit `VITE_API_URL`
5. Change value to: `https://ridemate-backend-xxxx.onrender.com/api` (your Render URL)
6. Click **"Save"**

### 5.2 Redeploy Frontend
1. Go to **Deployments** tab
2. Click the 3 dots on the latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment

---

## 🔐 Step 6: Set Up GitHub Secrets for CI/CD

### 6.1 Get Vercel Credentials
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token named `github-actions`
3. Copy the token

### 6.2 Get Vercel Project IDs
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
cd frontend
vercel link

# Get Project ID and Org ID
cat .vercel/project.json
```

This will show:
```json
{
  "projectId": "prj_...",
  "orgId": "team_..."
}
```

### 6.3 Add GitHub Secrets
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `VERCEL_TOKEN` | Your Vercel token | From Step 6.1 |
| `VERCEL_ORG_ID` | Your orgId | From `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your projectId | From `.vercel/project.json` |
| `RENDER_DEPLOY_HOOK_URL` | Your Render webhook URL | From Step 4.5 |
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | Your Render backend URL |

---

## ✅ Step 7: Test Your Deployment

### 7.1 Test Backend
Visit: `https://your-backend.onrender.com/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "RideMate API is running",
  "timestamp": "2025-10-29..."
}
```

### 7.2 Test Frontend
1. Visit: `https://your-app.vercel.app`
2. Try to sign up
3. Try to login
4. Create a ride
5. Test all features

### 7.3 Test CI/CD
1. Make a small change in `frontend/src/pages/Home.jsx`
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push
   ```
3. Go to **GitHub Actions** tab to see the workflow running
4. Your changes should automatically deploy!

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: Backend not connecting to MongoDB**
- Check `MONGODB_URI` in Render environment variables
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check Render logs for specific errors

**Issue: CORS errors**
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check backend logs for CORS-related errors

### Frontend Issues

**Issue: Frontend can't connect to backend**
- Verify `VITE_API_URL` in Vercel environment variables
- Ensure backend is deployed and running
- Check browser console for API errors

**Issue: White screen after deployment**
- Check Vercel build logs for errors
- Ensure build completed successfully
- Check for JavaScript errors in browser console

### CI/CD Issues

**Issue: GitHub Actions failing**
- Check GitHub Actions logs for specific errors
- Verify all secrets are added correctly
- Ensure secret names match exactly

---

## 📊 Monitoring

### Render Monitoring
- View logs: Render Dashboard → Your Service → Logs
- View metrics: Render Dashboard → Your Service → Metrics

### Vercel Monitoring
- View deployments: Vercel Dashboard → Your Project → Deployments
- View analytics: Vercel Dashboard → Your Project → Analytics

---

## 💰 Cost Breakdown

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | ✅ Free | 100 GB bandwidth/month, unlimited deployments |
| **Render** | ✅ Free | 750 hours/month, auto-sleep after 15 min inactivity |
| **MongoDB Atlas** | ✅ Free | 512 MB storage, shared RAM |
| **GitHub Actions** | ✅ Free | 2,000 minutes/month |

**Total Cost: $0/month** 🎉

---

## 🚀 What's Next?

1. **Custom Domain**: Add your custom domain in Vercel settings
2. **Environment Staging**: Create dev/staging environments
3. **Monitoring**: Set up error tracking (Sentry, LogRocket)
4. **Analytics**: Add Google Analytics or similar
5. **Performance**: Enable Vercel Edge caching
6. **Security**: Enable Vercel DDoS protection

---

## 📝 Important URLs to Save

- **Frontend (Vercel)**: https://your-app.vercel.app
- **Backend (Render)**: https://ridemate-backend-xxxx.onrender.com
- **GitHub Repo**: https://github.com/YOUR_USERNAME/ridemate
- **MongoDB Atlas**: https://cloud.mongodb.com

---

## 🎉 Congratulations!

Your RideMate app is now live with:
- ✅ Automatic deployments on push
- ✅ Production-grade infrastructure
- ✅ Scalable architecture
- ✅ Zero cost (free tiers)

Share your app with friends and start ride-sharing! 🚗💨

