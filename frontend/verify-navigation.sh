#!/bin/bash
# Quick Navigation Implementation Verification Script

echo "🔍 Navigation Implementation Verification"
echo "========================================"

# Check if key files exist and have correct structure
echo ""
echo "📁 Checking File Structure..."

# AdminPanel.js - Main hike list
if [ -f "src/components/admin/AdminPanel.js" ]; then
    echo "✅ AdminPanel.js exists"
    
    # Check for key navigation function
    if grep -q "navigate.*manage-hikes" "src/components/admin/AdminPanel.js"; then
        echo "✅ AdminPanel has navigation function"
    else
        echo "❌ AdminPanel missing navigation function"
    fi
    
    # Check for search and filter states
    if grep -q "searchTerm.*statusFilter.*dateFilter" "src/components/admin/AdminPanel.js"; then
        echo "✅ AdminPanel has search/filter state"
    else
        echo "❌ AdminPanel missing search/filter functionality"
    fi
else
    echo "❌ AdminPanel.js not found"
fi

# HikeManagementPage.js - Individual hike management
if [ -f "src/pages/HikeManagementPage.js" ]; then
    echo "✅ HikeManagementPage.js exists"
    
    # Check for back navigation
    if grep -q "navigate.*admin/manage-hikes" "src/pages/HikeManagementPage.js"; then
        echo "✅ HikeManagementPage has correct back navigation"
    else
        echo "❌ HikeManagementPage missing or incorrect back navigation"
    fi
    
    # Check for useParams
    if grep -q "useParams" "src/pages/HikeManagementPage.js"; then
        echo "✅ HikeManagementPage uses URL parameters"
    else
        echo "❌ HikeManagementPage missing URL parameter handling"
    fi
else
    echo "❌ HikeManagementPage.js not found"
fi

# App.js - Routing configuration
if [ -f "src/App.js" ]; then
    echo "✅ App.js exists"
    
    # Check for manage-hikes route
    if grep -q "/manage-hikes/:hikeId" "src/App.js"; then
        echo "✅ App.js has individual hike route"
    else
        echo "❌ App.js missing individual hike route"
    fi
    
    # Check for HikeManagementPage import
    if grep -q "HikeManagementPage" "src/App.js"; then
        echo "✅ App.js imports HikeManagementPage"
    else
        echo "❌ App.js missing HikeManagementPage import"
    fi
else
    echo "❌ App.js not found"
fi

echo ""
echo "🔧 Component Dependencies..."

# Check AdminPanel imports
if grep -q "useNavigate" "src/components/admin/AdminPanel.js"; then
    echo "✅ AdminPanel imports useNavigate"
else
    echo "❌ AdminPanel missing useNavigate import"
fi

# Check HikeManagementPage imports
if grep -q "useParams.*useNavigate" "src/pages/HikeManagementPage.js"; then
    echo "✅ HikeManagementPage imports routing hooks"
else
    echo "❌ HikeManagementPage missing routing imports"
fi

echo ""
echo "🎨 UI Component Checks..."

# Check for Search icon in AdminPanel
if grep -q "Search" "src/components/admin/AdminPanel.js"; then
    echo "✅ AdminPanel has Search icon/functionality"
else
    echo "❌ AdminPanel missing Search functionality"
fi

# Check for ArrowLeft icon in HikeManagementPage
if grep -q "ArrowLeft" "src/pages/HikeManagementPage.js"; then
    echo "✅ HikeManagementPage has back arrow icon"
else
    echo "❌ HikeManagementPage missing back arrow icon"
fi

echo ""
echo "📱 Build Status Check..."

# Check if build directory exists
if [ -d "build" ]; then
    echo "✅ Build directory exists"
    
    if [ -f "build/index.html" ]; then
        echo "✅ Build output contains index.html"
    else
        echo "❌ Build missing index.html"
    fi
else
    echo "❌ No build directory found - run 'npm run build'"
fi

echo ""
echo "🚀 Deployment Verification..."

# Check Firebase configuration
if [ -f "firebase.json" ]; then
    echo "✅ Firebase configuration exists"
else
    echo "❌ Firebase configuration missing"
fi

echo ""
echo "📋 Manual Testing URLs:"
echo "   Main Admin Panel: https://helloliam.web.app/admin/manage-hikes"
echo "   Example Individual Hike: https://helloliam.web.app/manage-hikes/1"
echo ""
echo "✨ Next Steps:"
echo "   1. Login as admin user"
echo "   2. Navigate to manage hikes page"
echo "   3. Test search and filter functionality"
echo "   4. Click 'Manage' button on a hike"
echo "   5. Verify individual hike management page loads"
echo "   6. Test tab navigation and modals"
echo "   7. Verify back navigation works"
echo ""
echo "🎯 Implementation Status: READY FOR TESTING"