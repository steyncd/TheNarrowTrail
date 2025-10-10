# Private HACS Installation Guide

## **✅ Your Integration is Ready for Private HACS!**

I've prepared everything you need for a private HACS installation. Here's how to set it up:

---

## **Step 1: Push to Your Private Repository**

Since your repository is already private (`steyncd/TheNarrowTrail`), you just need to commit and push the enhanced integration files:

```bash
# Navigate to your repository root
cd C:\hiking-portal

# Add all the enhanced integration files
git add homeassistant/

# Commit the enhanced integration
git commit -m "feat: Enhanced Home Assistant integration v2.1.0 with notifications, weather, payments, and dashboard"

# Push to your private repository
git push origin master
```

---

## **Step 2: Add to HACS as Custom Repository**

1. **Open Home Assistant**
2. **Go to HACS** → **Integrations**
3. **Click the three dots (⋮)** in the top right
4. **Select "Custom repositories"**
5. **Add Repository**:
   - **Repository URL**: `https://github.com/steyncd/TheNarrowTrail`
   - **Category**: `Integration`
   - **Click "Add"**

---

## **Step 3: Install via HACS**

1. **In HACS Integrations**, search for **"The Narrow Trail Hiking Portal"**
2. **Click "Download"**
3. **Restart Home Assistant**

---

## **Step 4: Configure Integration**

1. **Go to Settings** → **Devices & Services**
2. **Click "Add Integration"**
3. **Search for "Hiking Portal"**
4. **Configure with**:
   - **Backend URL**: `https://backend-4kzqyywlqq-ew.a.run.app`
   - **Access Token**: Your long-lived JWT token

---

## **Step 5: Install Dashboard**

1. **Copy the dashboard YAML** from `hiking_portal_dashboard.yaml`
2. **In HA**: Settings → Dashboards → **Add Dashboard**
3. **Choose "Start with YAML mode"**
4. **Paste the configuration** and save as "Hiking Portal"

---

## **What You Get**

### **🔐 Private & Secure**
- ✅ Repository stays completely private
- ✅ Only you can access and install
- ✅ Full version control and updates
- ✅ Professional HACS integration experience

### **📦 Easy Updates**
- ✅ Push updates to your repo → HACS auto-detects
- ✅ One-click updates in HACS interface
- ✅ Version tracking and rollback capability

### **🚀 All Enhanced Features**
- ✅ Notification management with urgency alerts
- ✅ Weather integration with severe weather warnings
- ✅ Payment tracking and overdue monitoring
- ✅ Enhanced calendar with attendance status
- ✅ Complete interactive dashboard
- ✅ Smart binary sensors and automations

---

## **Files Ready for HACS**

I've created/updated these files for proper HACS compatibility:

✅ `hacs.json` - HACS metadata
✅ `manifest.json` - Updated to v2.1.0 with proper requirements
✅ `README.md` - Comprehensive documentation with installation guide
✅ All enhanced integration files with new features
✅ Dashboard configuration
✅ Setup documentation
✅ Test scripts

---

## **Repository Structure**
```
TheNarrowTrail/
├── homeassistant/
│   ├── hacs.json                    # HACS metadata
│   ├── README.md                    # Integration documentation
│   ├── custom_components/
│   │   └── hiking_portal/           # Enhanced integration
│   ├── hiking_portal_dashboard.yaml # Complete dashboard
│   ├── ENHANCED_INTEGRATION_SETUP.md
│   └── test_enhanced_integration.py
└── (rest of your project)
```

---

## **Next Steps**

1. **Commit and push** the enhanced integration files
2. **Add your repo to HACS** as a custom repository
3. **Install via HACS** (one-click!)
4. **Configure and enjoy** all the enhanced features

The integration will be **completely private** and only accessible through your GitHub account. You'll get all the benefits of HACS (easy updates, version management) while keeping everything secure!

Would you like me to help you commit and push these changes to your repository?