# 🚀 Deploy DigiKraft.shop to Vercel

## What is Vercel?

Vercel is a hosting platform that:
- ✅ Deploys your website automatically
- ✅ Includes global CDN (fast worldwide)
- ✅ Free SSL certificate (HTTPS)
- ✅ Perfect for Nuxt/Vue apps
- ✅ Free tier available

---

## Step-by-Step Guide

### Step 1: Create Vercel Account

1. Go to: https://vercel.com
2. Click "Sign Up"
3. Sign up with:
   - GitHub (recommended)
   - GitLab
   - Bitbucket
   - Or email

**Recommended: Use GitHub** (makes deployment easier)

---

### Step 2: Install Vercel CLI (Optional but Recommended)

Open PowerShell:
```powershell
npm install -g vercel
```

Then login:
```powershell
vercel login
```

Follow the prompts to authenticate.

---

### Step 3: Prepare Your Project

#### A. Make Sure Your Project Builds

Test locally first:
```powershell
cd G:\Digikraft\digikraft.shop\main-website
npm run build
```

If it builds successfully, you're ready!

#### B. Create `.vercelignore` File

This tells Vercel what to ignore:
```
node_modules
.nuxt
.output
.env
.env.local
*.log
```

#### C. Update Environment Variables

You'll need to set these in Vercel dashboard later:
- `NUXT_PUBLIC_API_BASE` - Your API URL
- `NUXT_PUBLIC_STRAPI_URL` - Your Strapi URL
- `STRAPI_API_TOKEN` - Your Strapi token

---

### Step 4: Deploy Using Vercel CLI (Easiest)

#### First Time Deployment:

```powershell
cd G:\Digikraft\digikraft.shop\main-website
vercel
```

Vercel will ask:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Your account
3. **Link to existing project?** → No
4. **Project name?** → digikraft-shop (or your choice)
5. **Directory?** → ./ (press Enter)
6. **Override settings?** → No

Vercel will:
- Upload your code
- Build your project
- Deploy to a preview URL
- Give you a URL like: `https://digikraft-shop-xxx.vercel.app`

#### Deploy to Production:

```powershell
vercel --prod
```

This deploys to your main domain!

---

### Step 5: Deploy Using GitHub (Alternative)

#### A. Push Code to GitHub

If you haven't already:
```powershell
cd G:\Digikraft\digikraft.shop\main-website
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/digikraft-shop.git
git push -u origin main
```

#### B. Import to Vercel

1. Go to: https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Select your GitHub repo
5. Configure:
   - **Framework Preset**: Nuxt.js
   - **Root Directory**: main-website
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output`
6. Click "Deploy"

Vercel will automatically deploy!

---

### Step 6: Configure Environment Variables

1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add these variables:

**For Production:**
```
NUXT_PUBLIC_API_BASE = https://your-api-domain.com/api
NUXT_PUBLIC_STRAPI_URL = https://your-strapi-domain.com
STRAPI_API_TOKEN = your_strapi_token_here
```

**For Development/Preview:**
```
NUXT_PUBLIC_API_BASE = http://localhost:8080/api
NUXT_PUBLIC_STRAPI_URL = http://localhost:1337
STRAPI_API_TOKEN = your_strapi_token_here
```

5. Click "Save"
6. Redeploy your project

---

### Step 7: Connect Custom Domain

#### If You Have a Domain:

1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Click "Add Domain"
5. Enter your domain: `digikraft.shop`
6. Follow DNS configuration instructions
7. Add these DNS records at your domain registrar:

**For Root Domain (digikraft.shop):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW (www.digikraft.shop):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

8. Wait for DNS propagation (5-60 minutes)
9. Vercel will automatically provision SSL certificate

#### If You Don't Have a Domain:

Use the free Vercel subdomain:
```
https://digikraft-shop.vercel.app
```

You can buy a domain later and connect it!

---

## Your Deployment URLs

After deployment, you'll have:

**Preview URL** (for testing):
```
https://digikraft-shop-xxx.vercel.app
```

**Production URL** (main site):
```
https://digikraft-shop.vercel.app
```

**Custom Domain** (if configured):
```
https://digikraft.shop
```

---

## Automatic Deployments

### With GitHub Integration:

Every time you push code to GitHub:
- **main branch** → Deploys to production
- **other branches** → Creates preview deployment

```powershell
git add .
git commit -m "Update homepage"
git push
```

Vercel automatically deploys! 🎉

---

## Deploy Strapi Separately

Your Strapi CMS needs separate hosting. Options:

### Option 1: Strapi Cloud (Easiest)
1. Go to: https://strapi.io/cloud
2. Sign up
3. Deploy your Strapi project
4. Get production URL: `https://your-project.strapiapp.com`

### Option 2: Railway
1. Go to: https://railway.app
2. Deploy Strapi
3. Free tier available

### Option 3: Heroku
1. Go to: https://heroku.com
2. Deploy Strapi
3. Free tier available

### Option 4: Your Own Server
- VPS (DigitalOcean, Linode, etc.)
- AWS, Google Cloud, Azure

**Important:** Update `NUXT_PUBLIC_STRAPI_URL` in Vercel with your production Strapi URL!

---

## Vercel Configuration File

Create `vercel.json` in your main-website folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "nuxt.config.ts",
      "use": "@vercel/static-build",
      "config": {
        "distDir": ".output/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/.*",
      "dest": "/"
    }
  ]
}
```

---

## Troubleshooting

### Build Fails

**Check build logs in Vercel dashboard**

Common issues:
- Missing dependencies: Run `npm install` locally
- TypeScript errors: Fix in your code
- Environment variables: Make sure they're set

### Site Loads But API Doesn't Work

**Check environment variables:**
- Make sure `NUXT_PUBLIC_API_BASE` is correct
- Make sure `NUXT_PUBLIC_STRAPI_URL` is correct
- Make sure Strapi is deployed and accessible

### Images Don't Load

**Update image URLs:**
- Use full URLs for images
- Or use Vercel's image optimization

---

## Cost

### Vercel Free Tier:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Perfect for starting

### Vercel Pro ($20/month):
- 1 TB bandwidth
- Advanced analytics
- Team collaboration
- Priority support

---

## Quick Commands

### Deploy to Preview:
```powershell
cd G:\Digikraft\digikraft.shop\main-website
vercel
```

### Deploy to Production:
```powershell
vercel --prod
```

### Check Deployment Status:
```powershell
vercel ls
```

### View Logs:
```powershell
vercel logs
```

### Remove Deployment:
```powershell
vercel rm digikraft-shop
```

---

## Complete Workflow

### Initial Setup:
1. Create Vercel account
2. Install Vercel CLI: `npm install -g vercel`
3. Login: `vercel login`
4. Deploy: `vercel`
5. Deploy to production: `vercel --prod`

### Daily Development:
1. Make changes locally
2. Test: `npm run dev`
3. Commit: `git commit -am "Update"`
4. Push: `git push`
5. Vercel auto-deploys!

### Or Manual Deploy:
1. Make changes
2. Run: `vercel --prod`
3. Done!

---

## What Gets Deployed

Vercel deploys your **static/generated site**:
- HTML pages
- CSS files
- JavaScript bundles
- Images and assets
- API routes (if any)

**Not deployed:**
- Backend API (deploy separately)
- Strapi CMS (deploy separately)
- Database (use cloud database)

---

## Next Steps After Deployment

1. **Deploy Strapi** to Strapi Cloud or Railway
2. **Update environment variables** in Vercel
3. **Connect custom domain** (optional)
4. **Set up analytics** (Vercel Analytics)
5. **Configure redirects** (if needed)
6. **Test everything** on production URL

---

## Summary

**To deploy to Vercel:**

1. Install CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Navigate: `cd main-website`
4. Deploy: `vercel --prod`
5. Done! 🚀

**Your site will be live at:**
```
https://digikraft-shop.vercel.app
```

**With automatic:**
- Global CDN
- SSL certificate
- Continuous deployment
- Preview deployments

---

**Ready to deploy? Run these commands:**

```powershell
npm install -g vercel
vercel login
cd G:\Digikraft\digikraft.shop\main-website
vercel --prod
```

🎉 Your site will be live in minutes!

