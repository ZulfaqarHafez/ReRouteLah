# Vercel Deployment Guide 🚀

## Prerequisites ✅

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ Your code pushed to a GitHub repository
- ✅ Environment variables ready (LTA API key, Supabase credentials)

## Step 1: Prepare Your Repository 📦

### 1.1 Initialize Git (if not done already)

```bash
git init
git add .
git commit -m "Initial commit - ReRouteLah dementia navigation app"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `ReRouteLah`
3. **Don't** initialize with README (you already have code)
4. Click "Create repository"

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/ReRouteLah.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your GitHub username.

## Step 2: Deploy to Vercel 🌐

### Method A: Via Vercel Dashboard (Recommended)

1. **Go to [vercel.com/new](https://vercel.com/new)**
2. **Sign in** with GitHub (if not already)
3. **Import Git Repository**:
   - Click "Import Project"
   - Select your GitHub account
   - Find `ReRouteLah` repository
   - Click "Import"

4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install --legacy-peer-deps`

5. **Add Environment Variables** (IMPORTANT ⚠️):
   Click "Environment Variables" and add these:

   | Name | Value | Type |
   |------|-------|------|
   | `LTA_API_KEY` | `a4REgmRgRGCiMY1R5YjFJQ==` | Secret |
   | `ONEMAP_TOKEN` | `eyJhbGci...` (your full token) | Secret |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://gffjytzftoninuwwhddn.supabase.co` | Plaintext |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (your full key) | Plaintext |

   **Note**:
   - `NEXT_PUBLIC_*` variables are exposed to the browser
   - Other variables are kept secret on the server

6. **Click "Deploy"** 🚀

### Method B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name? ReRouteLah
# - Directory? ./
# - Override build settings? Y
# - Build command? next build
# - Output directory? .next
# - Development command? next dev
```

After deployment, add environment variables:

```bash
vercel env add LTA_API_KEY
# Paste: a4REgmRgRGCiMY1R5YjFJQ==
# Select: Production, Preview, Development

vercel env add ONEMAP_TOKEN
# Paste your token

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://gffjytzftoninuwwhddn.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your key
```

Then redeploy:

```bash
vercel --prod
```

## Step 3: Configure Build Settings ⚙️

### 3.1 Override Install Command (Important!)

Since you're using React 19 with some packages that expect React 18, you need to use `--legacy-peer-deps`:

1. Go to your project in Vercel dashboard
2. Click **Settings** → **General**
3. Scroll to **Build & Development Settings**
4. Override **Install Command**:
   ```bash
   npm install --legacy-peer-deps
   ```
5. Click **Save**

### 3.2 Environment Variables

Ensure all environment variables are set:
- Go to **Settings** → **Environment Variables**
- Verify all 4 variables are present
- Make sure they're enabled for Production, Preview, and Development

## Step 4: Configure Supabase 🗄️

### 4.1 Add Vercel Domain to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL to **Site URL**:
   ```
   https://reroutelah.vercel.app
   ```
5. Add to **Redirect URLs**:
   ```
   https://reroutelah.vercel.app/**
   https://reroutelah.vercel.app/auth/callback
   ```

### 4.2 Update CORS Settings (if needed)

1. Go to **Settings** → **API**
2. Scroll to **CORS**
3. Add your Vercel domain:
   ```
   https://reroutelah.vercel.app
   ```

## Step 5: Test Your Deployment ✅

### 5.1 Visit Your App

Your app will be available at:
```
https://reroutelah.vercel.app
```
(or your custom domain)

### 5.2 Test Critical Features

1. ✅ **Authentication**: Login as patient/caregiver
2. ✅ **Database**: Check if pairing code works
3. ✅ **Geolocation**: Allow location access
4. ✅ **Navigation**: Start a route
5. ✅ **Bus Timing**: Check LTA API integration
6. ✅ **AR Mode**: Test camera + compass (requires HTTPS ✅)
7. ✅ **Real-time Updates**: Test caregiver alerts

### 5.3 Check Logs

If something doesn't work:
1. Go to Vercel dashboard → your project
2. Click **Deployments** → latest deployment
3. Click **View Function Logs**
4. Look for errors

Common issues:
- ❌ Missing environment variables → Add them in Settings
- ❌ Supabase connection error → Check URL/key
- ❌ Camera not working → Vercel automatically uses HTTPS ✅
- ❌ LTA API error → Check API key is correct

## Step 6: Set Up Custom Domain (Optional) 🌍

### 6.1 Add Domain in Vercel

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `reroutelah.com`)
4. Follow DNS instructions

### 6.2 Update Supabase URLs

After adding custom domain:
1. Go to Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your custom domain
3. Add custom domain to **Redirect URLs**

## Step 7: Automatic Deployments 🔄

Vercel automatically deploys when you push to GitHub!

### Main Branch (Production)
```bash
git add .
git commit -m "Add new feature"
git push origin main
```
→ Deploys to `https://reroutelah.vercel.app`

### Preview Deployments (for testing)
```bash
git checkout -b feature/new-feature
git add .
git commit -m "Testing new feature"
git push origin feature/new-feature
```
→ Creates preview deployment at `https://reroutelah-[random].vercel.app`

## Troubleshooting 🔧

### Issue 1: Build Fails with Peer Dependency Error

**Error**: `ERESOLVE could not resolve`

**Solution**: Override install command:
```bash
npm install --legacy-peer-deps
```

Add this in **Settings** → **General** → **Build & Development Settings**

### Issue 2: Environment Variables Not Working

**Symptoms**:
- LTA API returns 401
- Supabase connection fails

**Solution**:
1. Check variables are spelled correctly (case-sensitive!)
2. Ensure `NEXT_PUBLIC_*` prefix for client-side variables
3. Redeploy after adding variables:
   - Go to **Deployments** → latest
   - Click **⋯** → **Redeploy**

### Issue 3: Camera Not Working

**Symptoms**: AR mode shows "Camera access denied"

**Cause**: Camera API requires HTTPS

**Solution**: ✅ Vercel automatically uses HTTPS - should work!

If still broken:
- Check browser permissions
- Test on mobile device (works better than desktop)

### Issue 4: Geolocation Not Working

**Symptoms**: Map doesn't show user location

**Solution**:
1. ✅ HTTPS is required → Vercel provides this
2. User must grant location permission
3. Check browser console for errors

### Issue 5: API Routes Return 500

**Symptoms**: Bus timing not loading, train info missing

**Debug Steps**:
1. Go to Vercel dashboard → **Functions**
2. Click on failing function (e.g., `/api/lta/bus-arrival`)
3. Check **Logs** tab
4. Look for error messages

**Common causes**:
- Missing `LTA_API_KEY` environment variable
- API key expired/invalid
- Rate limit exceeded (LTA API limit)

### Issue 6: Supabase Real-time Not Working

**Symptoms**: Caregiver doesn't receive alerts

**Solution**:
1. Check Supabase project is not paused (free tier pauses after inactivity)
2. Verify database RLS policies allow real-time subscriptions
3. Check Vercel domain is in Supabase CORS settings

## Performance Optimization 🚀

### Enable Edge Runtime (Optional)

For faster API responses, you can use Edge Runtime for API routes:

1. Edit your API route files (e.g., `app/api/lta/bus-arrival/route.js`)
2. Add this at the top:
   ```javascript
   export const runtime = 'edge';
   ```

**Note**: Not all Node.js APIs work on Edge runtime. Test thoroughly!

### Enable Caching

For LTA API responses that don't change often:

```javascript
export async function GET(request) {
  // ... your code

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

This caches responses for 60 seconds.

## Monitoring 📊

### Vercel Analytics (Free)

1. Go to **Analytics** tab in Vercel dashboard
2. View:
   - Page views
   - Visitors
   - Top pages
   - Performance metrics

### Function Logs

Track API errors:
1. **Functions** → Select function
2. **Logs** → Filter by errors
3. Set up **Log Drains** for persistent logging (paid feature)

## Environment Variable Management 🔐

### Production vs Preview vs Development

Vercel has 3 environments:

1. **Production**: Main branch deployment
2. **Preview**: Feature branch deployments
3. **Development**: Local development

Set different values per environment if needed:
- LTA API key (same for all)
- Supabase URL (same for all)
- Debug flags (different per environment)

### Sensitive Variables

Never commit to Git:
- ✅ `.env.local` is in `.gitignore`
- ✅ Add secrets only in Vercel dashboard
- ✅ Use `NEXT_PUBLIC_*` only for non-sensitive data

## Summary Checklist ✅

Before going live:

- [ ] Push code to GitHub
- [ ] Import repository to Vercel
- [ ] Add all 4 environment variables
- [ ] Override install command to `npm install --legacy-peer-deps`
- [ ] Deploy successfully
- [ ] Add Vercel URL to Supabase allowed domains
- [ ] Test login (patient + caregiver)
- [ ] Test navigation + bus timing
- [ ] Test AR mode (camera + compass)
- [ ] Test caregiver alerts (real-time)
- [ ] Check mobile responsiveness
- [ ] Test on actual mobile device (not just desktop)

## Your URLs

After deployment:

| Environment | URL |
|-------------|-----|
| **Production** | `https://reroutelah.vercel.app` |
| **Preview** | `https://reroutelah-[branch].vercel.app` |
| **Local** | `http://localhost:3000` |

## Next Steps

1. **Custom Domain**: Buy `reroutelah.com` and connect it
2. **Analytics**: Enable Vercel Analytics for usage stats
3. **Monitoring**: Set up error tracking (e.g., Sentry)
4. **PWA**: Add service worker for offline support
5. **App Store**: Package as mobile app (React Native wrapper)

---

**Your app is ready to deploy! 🎉**

Run this command to check everything is ready:
```bash
npm run build
```

If build succeeds locally, it will succeed on Vercel!
