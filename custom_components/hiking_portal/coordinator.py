"""DataUpdateCoordinator for Hiking Portal."""
import logging
from datetime import timedelta
from typing import Any, Optional

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)


class HikingPortalDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching Hiking Portal data."""

    def __init__(
        self,
        hass: HomeAssistant,
        session: aiohttp.ClientSession,
        api_url: str,
        token: str,
    ) -> None:
        """Initialize coordinator."""
        self.session = session
        self.api_url = api_url.rstrip("/")
        self.token = token
        self._headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        self._websocket_coordinator: Optional["HikingPortalWebSocketCoordinator"] = None

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=DEFAULT_SCAN_INTERVAL,
        )

    def set_websocket_coordinator(self, websocket_coordinator: "HikingPortalWebSocketCoordinator") -> None:
        """Set the WebSocket coordinator."""
        self._websocket_coordinator = websocket_coordinator

    @property
    def websocket_coordinator(self) -> Optional["HikingPortalWebSocketCoordinator"]:
        """Get the WebSocket coordinator."""
        return self._websocket_coordinator

    @property
    def is_websocket_connected(self) -> bool:
        """Return True if WebSocket is connected."""
        return self._websocket_coordinator is not None and self._websocket_coordinator.is_connected

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from API."""
        try:
            data = {}

            # Fetch all hikes
            data["hikes"] = await self._fetch_endpoint("/api/hikes")

            # Fetch my hikes (interested hikes)
            data["my_hikes"] = await self._fetch_endpoint("/api/my-hikes")

            # Fetch pending users (admin only, will return empty if not admin)
            try:
                data["pending_users"] = await self._fetch_endpoint("/api/admin/pending-users")
            except Exception:
                data["pending_users"] = []

            # NEW: Fetch notifications (Feature 1)
            try:
                data["notifications"] = await self._fetch_endpoint("/api/notifications")
                data["unread_notifications"] = [n for n in data["notifications"] if not n.get("read", False)]
                data["urgent_notifications"] = [n for n in data["notifications"] if n.get("priority") == "urgent" and not n.get("read", False)]
            except Exception:
                data["notifications"] = []
                data["unread_notifications"] = []
                data["urgent_notifications"] = []

            # NEW: Fetch payment data (Feature 3)  
            try:
                data["my_payments"] = await self._fetch_endpoint("/api/payments/my-payments")
                data["payment_summary"] = await self._fetch_endpoint("/api/payments/summary")
                # Calculate outstanding payments
                outstanding = sum(p.get("amount_due", 0) - p.get("amount_paid", 0) 
                                for p in data["my_payments"] if p.get("status") != "paid")
                data["outstanding_payments"] = outstanding
            except Exception:
                data["my_payments"] = []
                data["payment_summary"] = {}
                data["outstanding_payments"] = 0

            # Calculate upcoming hikes (future hikes only)
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            data["upcoming_hikes"] = [
                h for h in data["hikes"]
                if h.get("date") and datetime.fromisoformat(h["date"].replace("Z", "+00:00")).replace(tzinfo=timezone.utc) > now
            ]

            # Find next hike
            if data["upcoming_hikes"]:
                sorted_hikes = sorted(
                    data["upcoming_hikes"],
                    key=lambda x: datetime.fromisoformat(x["date"].replace("Z", "+00:00")).replace(tzinfo=timezone.utc)
                )
                data["next_hike"] = sorted_hikes[0]
                
                # NEW: Fetch weather for next hike (Feature 2)
                try:
                    if data["next_hike"].get("gps_coordinates"):
                        weather_data = await self._fetch_weather_for_hike(data["next_hike"])
                        data["next_hike_weather"] = weather_data
                        data["weather_alerts"] = weather_data.get("alerts", [])
                        data["weather_warning"] = any(alert.get("severity") in ["severe", "extreme"] for alert in data["weather_alerts"])
                    else:
                        data["next_hike_weather"] = None
                        data["weather_alerts"] = []
                        data["weather_warning"] = False
                except Exception as e:
                    _LOGGER.warning("Could not fetch weather data: %s", e)
                    data["next_hike_weather"] = None
                    data["weather_alerts"] = []
                    data["weather_warning"] = False
            else:
                data["next_hike"] = None
                data["next_hike_weather"] = None
                data["weather_alerts"] = []
                data["weather_warning"] = False

            return data

        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}") from err

    async def _fetch_endpoint(self, endpoint: str) -> Any:
        """Fetch data from an API endpoint."""
        url = f"{self.api_url}{endpoint}"

        try:
            async with self.session.get(url, headers=self._headers, timeout=10) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as err:
            _LOGGER.error("Error fetching data from %s: %s", url, err)
            raise UpdateFailed(f"Error fetching data from {endpoint}") from err

    async def express_interest(self, hike_id: int) -> None:
        """Express interest in a hike."""
        url = f"{self.api_url}/api/interest/{hike_id}"
        try:
            async with self.session.post(url, headers=self._headers, timeout=10) as response:
                response.raise_for_status()
                _LOGGER.info("Successfully expressed interest in hike %s", hike_id)
        except aiohttp.ClientError as err:
            _LOGGER.error("Error expressing interest in hike %s: %s", hike_id, err)
            raise

    async def remove_interest(self, hike_id: int) -> None:
        """Remove interest from a hike."""
        url = f"{self.api_url}/api/interest/{hike_id}"
        try:
            async with self.session.delete(url, headers=self._headers, timeout=10) as response:
                response.raise_for_status()
                _LOGGER.info("Successfully removed interest from hike %s", hike_id)
        except aiohttp.ClientError as err:
            _LOGGER.error("Error removing interest from hike %s: %s", hike_id, err)
            raise

    async def mark_attendance(self, hike_id: int, status: str) -> None:
        """Mark attendance for a hike."""
        url = f"{self.api_url}/api/hikes/{hike_id}/attendance"
        data = {"status": status}
        try:
            async with self.session.post(url, headers=self._headers, json=data, timeout=10) as response:
                response.raise_for_status()
                _LOGGER.info("Successfully marked attendance for hike %s as %s", hike_id, status)
        except aiohttp.ClientError as err:
            _LOGGER.error("Error marking attendance for hike %s: %s", hike_id, err)
            raise

    async def send_notification(self, hike_id: int, message: str) -> None:
        """Send notification to hike participants."""
        url = f"{self.api_url}/api/hikes/{hike_id}/notify"
        data = {"message": message}
        try:
            async with self.session.post(url, headers=self._headers, json=data, timeout=10) as response:
                response.raise_for_status()
                _LOGGER.info("Successfully sent notification for hike %s", hike_id)
        except aiohttp.ClientError as err:
            _LOGGER.error("Error sending notification for hike %s: %s", hike_id, err)
            raise

    async def mark_notification_read(self, notification_id: int) -> None:
        """Mark a notification as read."""
        url = f"{self.api_url}/api/notifications/{notification_id}/read"
        try:
            async with self.session.put(url, headers=self._headers, timeout=10) as response:
                response.raise_for_status()
                _LOGGER.info("Successfully marked notification %s as read", notification_id)
        except aiohttp.ClientError as err:
            _LOGGER.error("Error marking notification %s as read: %s", notification_id, err)
            raise

    async def record_payment(self, hike_id: int, user_id: int, amount: float, payment_method: str = "cash") -> None:
        """Record a payment for a hike."""
        url = f"{self.api_url}/api/hikes/{hike_id}/payments"
        data = {
            "user_id": user_id,
            "amount": amount,
            "payment_method": payment_method,
            "status": "paid"
        }
        try:
            async with self.session.post(url, headers=self._headers, json=data, timeout=10) as response:
                response.raise_for_status()
                _LOGGER.info("Successfully recorded payment for hike %s", hike_id)
        except aiohttp.ClientError as err:
            _LOGGER.error("Error recording payment for hike %s: %s", hike_id, err)
            raise

    async def get_hike_weather(self, hike_id: int) -> dict:
        """Get weather data for a specific hike."""
        url = f"{self.api_url}/api/hikes/{hike_id}/weather"
        try:
            async with self.session.get(url, headers=self._headers, timeout=10) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as err:
            _LOGGER.error("Error getting weather for hike %s: %s", hike_id, err)
            raise

    async def _fetch_weather_for_hike(self, hike: dict) -> dict:
        """Fetch weather data for a hike using GPS coordinates."""
        if not hike.get("gps_coordinates"):
            return {}
            
        # Use OpenWeatherMap API or backend weather endpoint
        url = f"{self.api_url}/api/weather/coordinates"
        data = {"coordinates": hike["gps_coordinates"], "date": hike["date"]}
        try:
            async with self.session.post(url, headers=self._headers, json=data, timeout=10) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {}
        except Exception:
            return {}
