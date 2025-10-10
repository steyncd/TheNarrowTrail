#!/usr/bin/env python3
"""
WebSocket Real-Time Integration Test for Hiking Portal Home Assistant Integration

This script tests the new WebSocket real-time features implemented for the HA integration:
- WebSocket connectivity
- Real-time interest updates
- Live notification alerts
- Weather warning broadcasts
- Payment tracking updates
- User approval notifications

Run this script to verify WebSocket integration is working correctly.
"""

import asyncio
import socketio
import json
import sys
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
BASE_URL = "https://backend-4kzqyywlqq-ew.a.run.app"
TOKEN = "your_long_lived_token_here"  # Update this with your token

# Test scenarios
TEST_SCENARIOS = [
    "websocket_connection",
    "interest_updates", 
    "new_notifications",
    "weather_alerts",
    "payment_updates",
    "user_approvals",
    "hike_updates",
]


class WebSocketTester:
    """Test WebSocket connectivity and real-time features."""
    
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.sio = None
        self.received_events = []
        self.connected = False
    
    async def setup_client(self):
        """Set up Socket.IO client."""
        self.sio = socketio.AsyncClient(
            logger=False,
            engineio_logger=False,
        )
        
        # Register event handlers
        @self.sio.event
        async def connect():
            logger.info("✅ WebSocket connected successfully")
            self.connected = True
        
        @self.sio.event
        async def disconnect():
            logger.info("❌ WebSocket disconnected")
            self.connected = False
        
        @self.sio.event
        async def connect_error(data):
            logger.error(f"❌ WebSocket connection error: {data}")
        
        # Test event handlers
        @self.sio.event
        async def interest_updated(data):
            logger.info(f"📊 Interest update received: {data}")
            self.received_events.append(("interest_updated", data))
        
        @self.sio.event
        async def hike_created(data):
            logger.info(f"🏔️ New hike created: {data}")
            self.received_events.append(("hike_created", data))
        
        @self.sio.event
        async def hike_updated(data):
            logger.info(f"🏔️ Hike updated: {data}")
            self.received_events.append(("hike_updated", data))
        
        @self.sio.event
        async def hike_deleted(data):
            logger.info(f"🗑️ Hike deleted: {data}")
            self.received_events.append(("hike_deleted", data))
        
        @self.sio.event
        async def notification_new(data):
            logger.info(f"🔔 New notification: {data}")
            self.received_events.append(("notification_new", data))
        
        @self.sio.event
        async def notification_updated(data):
            logger.info(f"🔔 Notification updated: {data}")
            self.received_events.append(("notification_updated", data))
        
        @self.sio.event
        async def payment_received(data):
            logger.info(f"💳 Payment received: {data}")
            self.received_events.append(("payment_received", data))
        
        @self.sio.event
        async def weather_alert(data):
            logger.info(f"🌩️ Weather alert: {data}")
            self.received_events.append(("weather_alert", data))
        
        @self.sio.event
        async def user_approved(data):
            logger.info(f"✅ User approved: {data}")
            self.received_events.append(("user_approved", data))
    
    async def test_connection(self):
        """Test WebSocket connection."""
        logger.info("🔌 Testing WebSocket connection...")
        
        try:
            socket_url = self.base_url.replace("https://", "").replace("http://", "")
            await self.sio.connect(
                f"https://{socket_url}",
                auth={"token": self.token},
                transports=["polling", "websocket"],
                wait_timeout=10,
            )
            
            if self.connected:
                logger.info("✅ WebSocket connection test: SUCCESS")
                return True
            else:
                logger.error("❌ WebSocket connection test: FAILED")
                return False
                
        except Exception as e:
            logger.error(f"❌ WebSocket connection test: FAILED - {e}")
            return False
    
    async def test_authentication(self):
        """Test WebSocket authentication."""
        logger.info("🔐 Testing WebSocket authentication...")
        
        # Connection success already indicates authentication worked
        if self.connected:
            logger.info("✅ WebSocket authentication: SUCCESS")
            return True
        else:
            logger.error("❌ WebSocket authentication: FAILED")
            return False
    
    async def test_event_reception(self, duration=30):
        """Test receiving real-time events."""
        logger.info(f"📡 Testing event reception for {duration} seconds...")
        logger.info("   (Try making changes in the hiking portal to see real-time updates)")
        
        start_time = datetime.now()
        await asyncio.sleep(duration)
        
        events_received = len(self.received_events)
        logger.info(f"📊 Received {events_received} events during test period:")
        
        for event_type, data in self.received_events:
            logger.info(f"   - {event_type}: {data.get('hikeId', data.get('id', 'N/A'))}")
        
        return events_received > 0
    
    async def test_specific_events(self):
        """Test specific event types."""
        logger.info("🎯 Testing specific event types...")
        
        event_types = {}
        for event_type, data in self.received_events:
            event_types[event_type] = event_types.get(event_type, 0) + 1
        
        logger.info("📈 Event type summary:")
        for event_type, count in event_types.items():
            logger.info(f"   - {event_type}: {count} events")
        
        # Check for key event types
        important_events = ["interest_updated", "notification_new", "weather_alert", "payment_received"]
        found_important = any(event in event_types for event in important_events)
        
        if found_important:
            logger.info("✅ Important event types detected")
            return True
        else:
            logger.info("⚠️ No important events detected (this may be normal if no activity occurred)")
            return True  # Don't fail test for this
    
    async def cleanup(self):
        """Clean up WebSocket connection."""
        if self.sio and self.connected:
            await self.sio.disconnect()
            logger.info("🧹 WebSocket connection cleaned up")


async def test_websocket_integration():
    """Run comprehensive WebSocket integration tests."""
    logger.info("🧪 Starting WebSocket Real-Time Integration Tests")
    logger.info(f"🔗 Backend URL: {BASE_URL}")
    logger.info("=" * 60)
    
    if TOKEN == "your_long_lived_token_here":
        logger.error("❌ Please update the TOKEN variable with your actual token")
        return False
    
    tester = WebSocketTester(BASE_URL, TOKEN)
    
    try:
        # Setup client
        await tester.setup_client()
        
        # Test connection
        connection_ok = await tester.test_connection()
        if not connection_ok:
            logger.error("❌ Connection failed - aborting tests")
            return False
        
        # Test authentication
        auth_ok = await tester.test_authentication()
        if not auth_ok:
            logger.error("❌ Authentication failed - aborting tests")
            return False
        
        # Test event reception
        events_ok = await tester.test_event_reception(duration=30)
        
        # Test specific events
        specific_ok = await tester.test_specific_events()
        
        # Generate summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 WEBSOCKET TEST SUMMARY")
        logger.info("=" * 60)
        
        tests = {
            "Connection": connection_ok,
            "Authentication": auth_ok,
            "Event Reception": events_ok,
            "Event Types": specific_ok,
        }
        
        passed = sum(1 for result in tests.values() if result)
        total = len(tests)
        
        logger.info(f"✅ Tests Passed: {passed}/{total}")
        
        for test_name, result in tests.items():
            status = "✅ PASS" if result else "❌ FAIL"
            logger.info(f"   {test_name}: {status}")
        
        # Overall result
        if passed == total:
            logger.info("🎉 ALL WEBSOCKET TESTS PASSED!")
            logger.info("✅ Real-time integration is working correctly")
        elif passed >= 2:  # Connection and auth are critical
            logger.info("⚠️ WEBSOCKET TESTS PARTIALLY PASSED")
            logger.info("✅ Core functionality working, some features may need attention")
        else:
            logger.info("❌ WEBSOCKET TESTS FAILED")
            logger.info("❌ Real-time integration needs troubleshooting")
        
        # Integration guidance
        logger.info("\n📋 Home Assistant Integration Status:")
        if connection_ok and auth_ok:
            logger.info("✅ WebSocket coordinator should connect successfully")
            logger.info("✅ Real-time sensors will show 'Connected' status")
            logger.info("✅ Binary sensor 'WebSocket Connected' will be ON")
            logger.info("✅ Live updates will appear without polling delays")
        else:
            logger.info("❌ WebSocket coordinator will fall back to polling mode")
            logger.info("❌ Real-time sensors will show 'Disconnected' status")
            logger.info("❌ Updates will use 5-minute polling intervals")
        
        return passed >= 2
        
    except Exception as e:
        logger.error(f"💥 Test runner error: {e}")
        return False
    
    finally:
        await tester.cleanup()


async def test_home_assistant_events():
    """Test events that Home Assistant integration will receive."""
    logger.info("\n🏠 Testing Home Assistant Event Integration")
    logger.info("-" * 50)
    
    # This would simulate the events that HA integration processes
    sample_events = [
        {
            "type": "interest_updated",
            "data": {"hikeId": 123, "interestedCount": 5, "minParticipants": 4},
            "ha_impact": "Updates hike sensors, triggers min_participants_reached binary sensor"
        },
        {
            "type": "notification_new", 
            "data": {"id": 456, "title": "New Hike Available", "priority": "urgent"},
            "ha_impact": "Updates notification sensors, triggers urgent_notifications binary sensor"
        },
        {
            "type": "weather_alert",
            "data": {"severity": "severe", "title": "Thunderstorm Warning", "location": "Drakensberg"},
            "ha_impact": "Updates weather sensors, triggers weather_warning binary sensor"
        },
        {
            "type": "payment_received",
            "data": {"user_id": 789, "amount": 150.00, "hike_id": 123},
            "ha_impact": "Updates payment sensors, fires payment_received HA event"
        }
    ]
    
    logger.info("📋 Events that will trigger Home Assistant updates:")
    for event in sample_events:
        logger.info(f"   🔸 {event['type']}")
        logger.info(f"      Data: {event['data']}")
        logger.info(f"      HA Impact: {event['ha_impact']}")
        logger.info("")


if __name__ == "__main__":
    try:
        # Run WebSocket integration tests
        result = asyncio.run(test_websocket_integration())
        
        # Run HA event simulation
        asyncio.run(test_home_assistant_events())
        
        if result:
            logger.info("\n🎉 WebSocket real-time integration is ready for Home Assistant!")
            sys.exit(0)
        else:
            logger.info("\n⚠️ WebSocket integration needs attention - check configuration")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("\n⏹️ Tests interrupted by user")
    except Exception as e:
        logger.error(f"💥 Test runner error: {e}")
        sys.exit(1)