#!/usr/bin/env python3
"""
Enhanced Integration Test Script for Hiking Portal Home Assistant Integration

This script tests all the new features implemented:
1. Notification Management
2. Weather Integration  
3. Payment Tracking
4. Enhanced Calendar Features
5. Interactive Dashboard

Run this script to verify the enhanced integration is working correctly.
"""

import asyncio
import aiohttp
import json
import sys
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
BASE_URL = "https://backend-4kzqyywlqq-ew.a.run.app"
TOKEN = "your_long_lived_token_here"  # Update this with your token

# Test endpoints for enhanced features
ENHANCED_ENDPOINTS = {
    # Existing endpoints
    "hikes": "/api/hikes",
    "my_hikes": "/api/my-hikes", 
    "pending_users": "/api/admin/pending-users",
    "auth_test": "/api/auth/test",
    
    # New endpoints for enhanced features
    "notifications": "/api/notifications",
    "weather_alerts": "/api/weather/alerts",
    "outstanding_payments": "/api/payments/outstanding",
    "weather_hike": "/api/weather/hike/1",  # Test with hike ID 1
    "user_profile": "/api/profile",
}

# Service test data
SERVICE_TESTS = {
    "mark_notification_read": {
        "endpoint": "/api/notifications/1/read",
        "method": "POST",
        "data": {}
    },
    "record_payment": {
        "endpoint": "/api/payments",
        "method": "POST", 
        "data": {
            "user_id": "test_user",
            "amount": 150.00,
            "payment_method": "card",
            "hike_id": "1"
        }
    }
}


async def test_api_endpoint(session, name, endpoint, method="GET", data=None):
    """Test a single API endpoint."""
    url = f"{BASE_URL}{endpoint}"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        if method.upper() == "GET":
            async with session.get(url, headers=headers, timeout=10) as response:
                result = await test_response(response, name)
                return result
        elif method.upper() == "POST":
            async with session.post(url, headers=headers, json=data, timeout=10) as response:
                result = await test_response(response, name)
                return result
    except asyncio.TimeoutError:
        logger.error(f"❌ {name}: Request timeout")
        return False
    except aiohttp.ClientError as e:
        logger.error(f"❌ {name}: Connection error - {e}")
        return False
    except Exception as e:
        logger.error(f"❌ {name}: Unexpected error - {e}")
        return False


async def test_response(response, name):
    """Test and analyze API response."""
    try:
        response_text = await response.text()
        
        if response.status == 200:
            try:
                data = json.loads(response_text)
                await analyze_endpoint_data(name, data)
                logger.info(f"✅ {name}: SUCCESS (Status: {response.status})")
                return True
            except json.JSONDecodeError:
                logger.warning(f"⚠️ {name}: Non-JSON response but status OK")
                return True
        else:
            logger.error(f"❌ {name}: HTTP {response.status}")
            if response_text:
                logger.error(f"   Response: {response_text[:200]}...")
            return False
            
    except Exception as e:
        logger.error(f"❌ {name}: Error processing response - {e}")
        return False


async def analyze_endpoint_data(endpoint_name, data):
    """Analyze response data for enhanced features."""
    if endpoint_name == "notifications":
        await analyze_notifications(data)
    elif endpoint_name == "weather_alerts":
        await analyze_weather_alerts(data)
    elif endpoint_name == "outstanding_payments":
        await analyze_payments(data)
    elif endpoint_name == "hikes":
        await analyze_enhanced_hikes(data)
    elif endpoint_name == "my_hikes":
        await analyze_my_hikes(data)


async def analyze_notifications(data):
    """Analyze notifications data for enhanced features."""
    if isinstance(data, list):
        total = len(data)
        unread = sum(1 for n in data if not n.get("is_read", True))
        urgent = sum(1 for n in data if n.get("priority") == "urgent")
        
        logger.info(f"   📧 Notifications: {total} total, {unread} unread, {urgent} urgent")
        
        if urgent > 0:
            logger.info("   🚨 Urgent notifications detected!")
            for notification in data:
                if notification.get("priority") == "urgent":
                    logger.info(f"      - {notification.get('title', 'No title')}")
    elif isinstance(data, dict):
        logger.info(f"   📧 Notification summary: {data}")


async def analyze_weather_alerts(data):
    """Analyze weather alerts data."""
    if isinstance(data, dict):
        alerts = data.get("alerts", [])
        conditions = data.get("current_conditions", {})
        
        logger.info(f"   🌤️ Weather: {len(alerts)} alerts, current: {conditions.get('description', 'N/A')}")
        
        severe_alerts = [a for a in alerts if a.get("severity") in ["severe", "extreme"]]
        if severe_alerts:
            logger.info(f"   ⚠️ {len(severe_alerts)} severe weather alerts!")
    elif isinstance(data, list):
        logger.info(f"   🌤️ Weather alerts: {len(data)} total")


async def analyze_payments(data):
    """Analyze outstanding payments data."""
    if isinstance(data, dict):
        total_amount = data.get("total_amount", 0)
        overdue = data.get("overdue_count", 0)
        payments = data.get("payments", [])
        
        logger.info(f"   💳 Payments: R{total_amount} outstanding, {overdue} overdue, {len(payments)} total")
    elif isinstance(data, list):
        logger.info(f"   💳 Outstanding payments: {len(data)} items")


async def analyze_enhanced_hikes(data):
    """Analyze hikes data for enhanced calendar features."""
    if isinstance(data, list) and data:
        hike = data[0]  # Analyze first hike
        interested = hike.get("interested_count", 0)
        min_participants = hike.get("min_participants", 0)
        weather_warning = hike.get("weather_warning", False)
        requires_payment = hike.get("requires_payment", False)
        
        logger.info(f"   🏔️ Next hike: {hike.get('name', 'Unknown')}")
        logger.info(f"      Participants: {interested}/{min_participants}")
        
        if weather_warning:
            logger.info("      ⚠️ Weather warning active")
        if requires_payment:
            logger.info("      💰 Payment required")


async def analyze_my_hikes(data):
    """Analyze user's hikes for enhanced tracking."""
    if isinstance(data, list):
        confirmed = sum(1 for h in data if h.get("status") == "confirmed")
        pending = sum(1 for h in data if h.get("status") == "pending") 
        paid = sum(1 for h in data if h.get("payment_status") == "paid")
        
        logger.info(f"   🥾 My hikes: {len(data)} total, {confirmed} confirmed, {pending} pending, {paid} paid")


async def test_enhanced_features():
    """Test all enhanced Home Assistant integration features."""
    logger.info("🧪 Testing Enhanced Hiking Portal HA Integration")
    logger.info(f"🔗 Backend URL: {BASE_URL}")
    logger.info("=" * 60)
    
    results = {}
    
    async with aiohttp.ClientSession() as session:
        # Test existing endpoints
        logger.info("Testing Core Endpoints...")
        for name, endpoint in ENHANCED_ENDPOINTS.items():
            if name in ["notifications", "weather_alerts", "outstanding_payments", "weather_hike"]:
                continue  # Test these separately as enhanced features
            result = await test_api_endpoint(session, name, endpoint)
            results[name] = result
        
        logger.info("\nTesting Enhanced Feature Endpoints...")
        
        # Test notifications endpoint
        result = await test_api_endpoint(session, "notifications", "/api/notifications")
        results["notifications"] = result
        
        # Test weather alerts endpoint  
        result = await test_api_endpoint(session, "weather_alerts", "/api/weather/alerts")
        results["weather_alerts"] = result
        
        # Test outstanding payments endpoint
        result = await test_api_endpoint(session, "outstanding_payments", "/api/payments/outstanding")
        results["outstanding_payments"] = result
        
        # Test weather for specific hike
        result = await test_api_endpoint(session, "weather_hike", "/api/weather/hike/1")
        results["weather_hike"] = result
        
        logger.info("\nTesting Enhanced Services...")
        
        # Test service endpoints (these might not exist yet)
        for service_name, config in SERVICE_TESTS.items():
            logger.info(f"   Testing {service_name} service...")
            result = await test_api_endpoint(
                session, 
                service_name, 
                config["endpoint"], 
                config["method"], 
                config.get("data")
            )
            results[f"service_{service_name}"] = result
    
    # Generate summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 TEST SUMMARY")
    logger.info("=" * 60)
    
    successful_tests = sum(1 for result in results.values() if result)
    total_tests = len(results)
    
    logger.info(f"✅ Successful: {successful_tests}/{total_tests}")
    
    # Core features status
    core_endpoints = ["hikes", "my_hikes", "pending_users", "auth_test"]
    core_success = sum(1 for name in core_endpoints if results.get(name, False))
    logger.info(f"🔧 Core Features: {core_success}/{len(core_endpoints)} working")
    
    # Enhanced features status
    enhanced_endpoints = ["notifications", "weather_alerts", "outstanding_payments", "weather_hike"]
    enhanced_success = sum(1 for name in enhanced_endpoints if results.get(name, False))
    logger.info(f"✨ Enhanced Features: {enhanced_success}/{len(enhanced_endpoints)} working")
    
    # Service endpoints status
    service_endpoints = [f"service_{name}" for name in SERVICE_TESTS.keys()]
    service_success = sum(1 for name in service_endpoints if results.get(name, False))
    logger.info(f"⚙️ Services: {service_success}/{len(service_endpoints)} working")
    
    if successful_tests == total_tests:
        logger.info("🎉 ALL TESTS PASSED - Enhanced integration ready!")
    elif core_success == len(core_endpoints):
        logger.info("✅ Core integration working - Enhanced features partially available")
    else:
        logger.warning("⚠️ Some core features not working - Check configuration")
    
    logger.info("\n📋 Next Steps:")
    logger.info("1. Install enhanced integration files in Home Assistant")
    logger.info("2. Restart Home Assistant")
    logger.info("3. Install the dashboard configuration")
    logger.info("4. Create automations for notifications and alerts")
    
    return results


async def test_integration_compatibility():
    """Test Home Assistant integration compatibility."""
    logger.info("\n🏠 Testing Home Assistant Integration Compatibility")
    logger.info("-" * 50)
    
    # Test data structure compatibility
    async with aiohttp.ClientSession() as session:
        headers = {"Authorization": f"Bearer {TOKEN}"}
        
        # Test hikes endpoint for calendar compatibility
        try:
            async with session.get(f"{BASE_URL}/api/hikes", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list) and data:
                        hike = data[0]
                        
                        # Check required fields for calendar
                        required_fields = ["id", "name", "date", "location"]
                        missing_fields = [field for field in required_fields if field not in hike]
                        
                        if not missing_fields:
                            logger.info("✅ Calendar integration: Compatible")
                        else:
                            logger.warning(f"⚠️ Calendar integration: Missing fields {missing_fields}")
                        
                        # Check enhanced fields
                        enhanced_fields = ["interested_count", "min_participants", "difficulty", "distance", "duration", "price"]
                        available_enhanced = [field for field in enhanced_fields if field in hike]
                        logger.info(f"✨ Enhanced calendar fields: {len(available_enhanced)}/{len(enhanced_fields)} available")
                        
        except Exception as e:
            logger.error(f"❌ Calendar compatibility test failed: {e}")


if __name__ == "__main__":
    if TOKEN == "your_long_lived_token_here":
        logger.error("❌ Please update the TOKEN variable with your actual token")
        sys.exit(1)
    
    try:
        # Run the enhanced integration tests
        results = asyncio.run(test_enhanced_features())
        
        # Run compatibility tests
        asyncio.run(test_integration_compatibility())
        
    except KeyboardInterrupt:
        logger.info("\n⏹️ Tests interrupted by user")
    except Exception as e:
        logger.error(f"💥 Test runner error: {e}")
        sys.exit(1)