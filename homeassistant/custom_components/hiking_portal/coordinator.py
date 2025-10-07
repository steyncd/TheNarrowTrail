"""DataUpdateCoordinator for Hiking Portal."""
import logging
from datetime import timedelta
from typing import Any

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

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=DEFAULT_SCAN_INTERVAL,
        )

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
            else:
                data["next_hike"] = None

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
