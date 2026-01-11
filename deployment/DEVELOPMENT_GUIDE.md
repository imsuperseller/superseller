# 🚀 Development Server Guide
*Single source of truth for development environment*

## 🎯 **QUICK START**

### **Primary Development Command**
```bash
cd web/rensto-site
npm run dev:reliable
```

### **Alternative Commands**
```bash
# Simple development (no port management)
npm run dev:simple

# With specific port
npm run dev:port 3001

# Direct script
./scripts/start-dev.sh
```

## 🔧 **SERVER MANAGEMENT**

### **Port Management**
- **WAHA Pro**: 3000 (RESERVED)
- **Admin Hub**: 3001
- **Main Site**: 3002
- **Marketplace**: 3003
- **SaaS API**: 5000
- **Auto-Detection**: Script finds first available port
- **Error Handling**: Clear messages if no ports available

### **Automatic Features**
The `start-dev.sh` script automatically:
1. Kills existing Next.js processes
2. Finds the first available port starting from 3002
3. Displays all relevant URLs
4. Provides clear error messages

### **Manual Port Management**
```bash
# Check what's using a port
lsof -i :3000

# Kill processes using a port
pkill -f "next dev"

# Kill specific port
lsof -ti:3000 | xargs kill -9
```

## 🌐 **ACCESS URLs**

### **Development URLs**
When server starts, you'll see:
- **Admin Dashboard**: http://localhost:3001/admin
- **Main Site**: http://localhost:3002
- **Marketplace**: http://localhost:3003
- **SaaS API**: http://localhost:5000/health

### **Default Credentials**
- **Admin**: admin@rensto.com / admin123
- **Customer**: ben@tax4us.co.il / customer123

## 🛠️ **TROUBLESHOOTING**

### **Server Won't Start**
```bash
# Kill all Next.js processes
pkill -f "next dev"

# Clear Next.js cache
rm -rf .next

# Restart with reliable script
./scripts/start-dev.sh
```

### **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000

# Kill the process
pkill -f "process-name"

# Or use a different port
npm run dev:port 3001
```

### **Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
npm run dev
```

### **Terminal Process Failed (posix_spawnp failed)**
This is a system-level issue. **Bypass terminal commands** by:
1. Edit files directly in your IDE
2. Use documented solutions from codebase
3. Focus on code fixes over process management
4. Use alternative startup methods

## 📋 **QUICK REFERENCE**

### **Start Development**
```bash
npm run dev                    # Recommended
./scripts/start-dev.sh        # Direct script
npm run dev:simple            # Simple mode
```

### **Stop Development**
```bash
Ctrl+C                        # In terminal
pkill -f "next dev"          # Force kill
```

### **Check Status**
```bash
lsof -i :3000                # Check port usage
ps aux | grep "next dev"     # Check processes
```

## 🚨 **CRITICAL NOTES**

### **Terminal Issues**
If you encounter `posix_spawnp failed` errors:
- **Don't use terminal commands** for core fixes
- **Edit files directly** in your IDE
- **Use documented solutions** from this codebase
- **Focus on code changes** over process management

### **Server Stuck**
If the server gets stuck:
- **Don't use `sudo rm -rf .next`** (causes issues)
- **Use `npm run dev:reliable`** instead
- **Check port conflicts** manually
- **Edit configuration files** directly

## 📝 **ENVIRONMENT VARIABLES**

### **Development Environment**
```bash
export PORT=3002
export NEXTAUTH_URL="http://localhost:3002"
export NODE_ENV="development"
```

### **Required for Development**
- Node.js 18+
- npm 9+
- MongoDB connection (local or Atlas)
- Next.js dependencies installed

## 🎯 **BEST PRACTICES**

1. **Always use `npm run dev:reliable`** for most stable experience
2. **Check port conflicts** before starting
3. **Keep terminal open** to see error messages
4. **Use documented URLs** for accessing different parts
5. **Bypass terminal issues** by editing files directly

---

**🎯 This is the single source of truth for development server management. All other server management files should be deleted to avoid confusion.**
