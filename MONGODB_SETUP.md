# MongoDB Atlas Setup Guide

## 🔐 **Setting Up MongoDB Authentication**

### **Step 1: Create MongoDB Atlas User**

1. **Log into MongoDB Atlas:**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com)
   - Sign in to your account

2. **Navigate to Database Access:**
   - Click on your cluster
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"

3. **Create Database User:**
   - **Authentication Method:** Password
   - **Username:** Create a unique username (e.g., `trustpilot_user`)
   - **Password:** Generate a strong password
   - **Database User Privileges:** 
     - Select "Built-in Role"
     - Choose "Read and write to any database"
   - Click "Add User"

### **Step 2: Get Your Cluster Host**

1. **Find Your Cluster Host:**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the host part from the connection string
   - Example: `cluster0.lyxhd6q.mongodb.net`

### **Step 3: Configure Environment Variables**

1. **Create `.env.local` file** (if it doesn't exist):
   ```bash
   cp env.example .env.local
   ```

2. **Update the MongoDB variables:**
   ```env
   # MongoDB Atlas Configuration
   MONGODB_HOST=cluster0.lyxhd6q.mongodb.net
   MONGODB_USERNAME=trustpilot_user
   MONGODB_PASSWORD=your-strong-password-here
   MONGODB_DATABASE=trustpilot
   ```

### **Step 4: Test Connection**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the console** for MongoDB connection messages:
   - ✅ Success: "MongoDB connected successfully"
   - ❌ Error: Check credentials and network access

### **Step 5: Network Access (If Needed)**

If you get connection errors:

1. **Go to Network Access in Atlas:**
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"

2. **Add Your IP:**
   - **Option 1:** Click "Add Current IP Address"
   - **Option 2:** Add `0.0.0.0/0` for access from anywhere (less secure)

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Authentication failed"**
   - Double-check username and password
   - Ensure user has correct permissions

2. **"Connection timeout"**
   - Check if your IP is whitelisted
   - Verify cluster is running

3. **"SSL/TLS error" (Windows)**
   - Set `FORCE_FILE_STORAGE=true` in development
   - Use file storage locally, MongoDB in production

### **Security Best Practices:**

1. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
2. **Limit IP access** to your application servers only
3. **Use environment variables** (never commit credentials to git)
4. **Regular credential rotation** (change passwords periodically)

## 📊 **Monitoring Your Database**

### **Check Database Status:**
- **Atlas Dashboard:** Monitor connections, operations, storage
- **Database Metrics:** Watch for performance issues
- **Alerts:** Set up notifications for unusual activity

### **Backup Strategy:**
- **Atlas Backups:** Automatic daily backups (paid tiers)
- **Manual Backups:** Use the `/api/backup` endpoint
- **Data Export:** Regular exports for critical data

## 🚀 **Production Deployment**

### **Vercel Environment Variables:**
1. Go to your Vercel project
2. Navigate to Settings → Environment Variables
3. Add the same MongoDB variables:
   ```
   MONGODB_HOST=cluster0.lyxhd6q.mongodb.net
   MONGODB_USERNAME=trustpilot_user
   MONGODB_PASSWORD=your-production-password
   MONGODB_DATABASE=trustpilot
   ```

### **Security Notes:**
- Use different credentials for development and production
- Never use the same password across environments
- Consider using MongoDB Atlas App Users for production

---

**Need Help?** Check the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) or contact support.
