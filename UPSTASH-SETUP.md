# Setting Up Upstash Redis for CitySamdhaan

## Why Upstash?
- ✅ **No installation required** - Cloud-based Redis
- ✅ **Free tier available** - 10,000 commands/day
- ✅ **Global edge network** - Low latency
- ✅ **REST API support** - Works everywhere
- ✅ **Perfect for development** - No Docker needed

---

## Step 1: Create Upstash Account

1. Go to https://upstash.com
2. Click **"Sign Up"** (free, no credit card required)
3. Sign up with GitHub or Email

---

## Step 2: Create Redis Database

1. After login, click **"Create Database"**
2. Configure:
   - **Name**: `citysamadhaan-dev`
   - **Region**: Choose closest to you (e.g., `us-east-1`, `eu-west-1`, `ap-south-1` for India)
   - **Type**: Regional (free tier)
   - **TLS**: Enabled (default)
3. Click **"Create"**

---

## Step 3: Get Connection URL

After database is created:

1. Click on your database name
2. Scroll to **"Connect your database"** section
3. Copy the **Redis URL** that looks like:
   ```
   redis://default:AbCdEf1234567890@apn1-caring-fish-12345.upstash.io:6379
   ```

---

## Step 4: Update Backend .env

Open `backend/.env` and paste your Upstash URL:

```env
# Upstash Redis (Cloud)
UPSTASH_REDIS_URL=redis://default:YOUR_PASSWORD@your-endpoint.upstash.io:6379
```

**Example:**
```env
UPSTASH_REDIS_URL=redis://default:AbCdEf1234567890@apn1-caring-fish-12345.upstash.io:6379
```

---

## Step 5: Test Connection

```powershell
cd backend
npm run dev
```

**✅ Success Output:**
```
✅ MongoDB Connected
✅ Redis Connected
✅ Redis client ready
🚀 Server running on port 5000
```

---

## Alternative: Using MongoDB Atlas (Cloud MongoDB)

If you don't have local MongoDB either:

### Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free tier available)
3. Create a **Free Cluster**:
   - Provider: AWS/Google/Azure
   - Region: Closest to you
   - Tier: M0 Sandbox (FREE)

### Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/citysamadhaan
   ```
4. Replace `<password>` with your database password

### Update .env

```env
MONGODB_URI=mongodb+srv://your_user:your_password@cluster0.xxxxx.mongodb.net/citysamadhaan
UPSTASH_REDIS_URL=redis://default:your_password@your-endpoint.upstash.io:6379
```

---

## Full Cloud Setup (No Local Databases)

With both Upstash + MongoDB Atlas:

```env
# Cloud MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/citysamadhaan

# Cloud Redis  
UPSTASH_REDIS_URL=redis://default:pass@endpoint.upstash.io:6379

# No Docker needed!
```

---

## Pricing (Free Tiers)

### Upstash Redis
- ✅ 10,000 commands/day FREE
- ✅ 256 MB storage
- ✅ Perfect for development

### MongoDB Atlas
- ✅ 512 MB storage FREE
- ✅ Shared cluster
- ✅ Good for small apps

---

## Benefits Over Local Setup

| Feature | Local (Docker) | Cloud (Upstash + Atlas) |
|---------|----------------|-------------------------|
| **Installation** | Required | None |
| **Setup Time** | 10-15 min | 5 min |
| **Portability** | Only your machine | Works anywhere |
| **Backup** | Manual | Automatic |
| **Scalability** | Limited | Easy |
| **Cost** | Free (but resource-heavy) | Free tier available |

---

## Verification

After setup, test your connection:

```powershell
cd backend

# Seed database (creates admin user)
npm run seed

# Start server
npm run dev
```

**Expected:**
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Redis Connected
✅ Redis client ready
🚀 Server running on port 5000
```

---

## Troubleshooting

### Error: "getaddrinfo ENOTFOUND"
**Solution:** Check your Upstash URL is correct in `.env`

### Error: "Authentication failed"
**Solution:** 
1. Verify password in Upstash URL
2. Make sure you copied the full URL including `redis://`

### Error: "MongooseServerSelectionError"
**Solution:**
1. Check MongoDB Atlas connection string
2. Ensure IP whitelist is set to `0.0.0.0/0` (allow all) in Atlas

---

## Next Steps

✅ Upstash configured  
✅ No Docker needed  
✅ Ready to develop  

Run your app:
```powershell
cd backend && npm run dev
cd frontend && npm run dev
```

🎉 **You're all set with cloud databases!**
