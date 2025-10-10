#!/usr/bin/env python3
"""
Home Assistant Integration Test Script
Tests the Hiking Portal backend API endpoints that the HA integration uses.
"""

import asyncio
import aiohttp
import json
from datetime import datetime, timezone

# Configuration
API_URL = "https://backend-4kzqyywlqq-ew.a.run.app"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdGV5bmNkQGdtYWlsLmNvbSIsIm5hbWUiOiJDaHJpc3RvIFN0ZXluIiwicm9sZSI6ImFkbWluIiwidHlwZSI6ImxvbmdfbGl2ZWQiLCJpYXQiOjE3NTk4NDM1NzMsImV4cCI6MTc5MTM3OTU3M30._9JQzO4HSE_m3c5KTTk9KWgKYon-iS_RozeWugNinLY"

class HAIntegrationTester:
    def __init__(self, api_url: str, token: str):
        self.api_url = api_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        self.results = []

    async def test_endpoint(self, session: aiohttp.ClientSession, endpoint: str, description: str, method: str = "GET", data: dict = None):
        """Test a single API endpoint."""
        url = f"{self.api_url}{endpoint}"
        
        try:
            if method == "GET":
                async with session.get(url, headers=self.headers, timeout=10) as response:
                    status = response.status
                    response_data = await response.json() if status < 400 else await response.text()
            elif method == "POST":
                async with session.post(url, headers=self.headers, json=data, timeout=10) as response:
                    status = response.status
                    response_data = await response.json() if status < 400 else await response.text()
            
            success = 200 <= status < 300
            result = {
                "endpoint": endpoint,
                "description": description,
                "status": status,
                "success": success,
                "data_preview": str(response_data)[:200] if success else response_data
            }
            
            self.results.append(result)
            
            status_icon = "✅" if success else "❌"
            print(f"{status_icon} {description}")
            print(f"   {method} {endpoint} → {status}")
            
            if success and isinstance(response_data, (list, dict)):
                if isinstance(response_data, list):
                    print(f"   📊 Returned {len(response_data)} items")
                elif isinstance(response_data, dict) and "length" in str(response_data):
                    print(f"   📊 Response: {type(response_data).__name__}")
                else:
                    print(f"   📊 Response: {type(response_data).__name__}")
            
            if not success:
                print(f"   🚨 Error: {response_data}")
                
            print()
            
        except Exception as e:
            result = {
                "endpoint": endpoint,
                "description": description,
                "status": "ERROR",
                "success": False,
                "error": str(e)
            }
            self.results.append(result)
            print(f"❌ {description}")
            print(f"   {method} {endpoint} → EXCEPTION: {e}")
            print()

    async def run_tests(self):
        """Run all Home Assistant integration tests."""
        print("🧪 Testing Home Assistant Integration Endpoints")
        print("=" * 50)
        print(f"API URL: {self.api_url}")
        print(f"Token: {TOKEN[:20]}...{TOKEN[-10:]}")
        print()

        async with aiohttp.ClientSession() as session:
            # Core endpoints that HA integration uses
            await self.test_endpoint(session, "/api/hikes", "All Hikes (core HA data)")
            await self.test_endpoint(session, "/api/my-hikes", "My Hikes (user's interested hikes)")
            await self.test_endpoint(session, "/api/admin/pending-users", "Pending Users (admin sensor)")
            
            # Test a specific hike endpoints (if we have hikes)
            hikes_result = next((r for r in self.results if r["endpoint"] == "/api/hikes"), None)
            if hikes_result and hikes_result["success"]:
                try:
                    # Try to get first hike ID for detailed testing
                    hike_data = eval(hikes_result["data_preview"])  # Simplified parsing
                    if isinstance(hike_data, list) and len(hike_data) > 0:
                        hike_id = hike_data[0].get("id")
                        if hike_id:
                            await self.test_endpoint(session, f"/api/hikes/{hike_id}", f"Hike Details (ID: {hike_id})")
                            await self.test_endpoint(session, f"/api/hikes/{hike_id}/attendees", f"Hike Attendees (ID: {hike_id})")
                except Exception as e:
                    print(f"⚠️  Could not parse hikes data for detailed testing: {e}")

            # Auth verification endpoint
            await self.test_endpoint(session, "/api/auth/verify", "Token Verification")

        # Summary
        print("\n" + "=" * 50)
        print("🏁 Test Summary")
        print("=" * 50)
        
        successful = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"✅ Successful: {successful}/{total}")
        print(f"❌ Failed: {total - successful}/{total}")
        
        if successful == total:
            print("\n🎉 All tests passed! Home Assistant integration should work correctly.")
        else:
            print(f"\n⚠️  {total - successful} test(s) failed. Check the errors above.")
            
        print(f"\n📋 Integration Status:")
        print(f"   • Backend API: {'🟢 ONLINE' if successful > 0 else '🔴 OFFLINE'}")
        print(f"   • Authentication: {'🟢 VALID' if any(r['endpoint'] == '/api/auth/verify' and r['success'] for r in self.results) else '🔴 INVALID'}")
        print(f"   • Core Data: {'🟢 AVAILABLE' if any(r['endpoint'] == '/api/hikes' and r['success'] for r in self.results) else '🔴 UNAVAILABLE'}")
        print(f"   • Admin Features: {'🟢 ENABLED' if any(r['endpoint'] == '/api/admin/pending-users' and r['success'] for r in self.results) else '🔴 DISABLED'}")

async def main():
    tester = HAIntegrationTester(API_URL, TOKEN)
    await tester.run_tests()

if __name__ == "__main__":
    asyncio.run(main())