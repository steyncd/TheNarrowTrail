"""Analytics data coordinator for Hiking Portal."""
import logging
from datetime import timedelta
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

ANALYTICS_UPDATE_INTERVAL = timedelta(minutes=15)  # Analytics update every 15 minutes


class HikingPortalAnalyticsCoordinator(DataUpdateCoordinator):
    """Analytics data update coordinator."""

    def __init__(self, hass: HomeAssistant, base_url: str, token: str):
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name="hiking_portal_analytics",
            update_interval=ANALYTICS_UPDATE_INTERVAL,
        )
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.session = async_get_clientsession(hass)

    async def _async_update_data(self) -> Dict[str, Any]:
        """Fetch analytics data from API."""
        try:
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }

            # Fetch all analytics endpoints in parallel
            overview_task = self._fetch_endpoint('/api/analytics/overview', headers)
            users_task = self._fetch_endpoint('/api/analytics/users', headers)
            hikes_task = self._fetch_endpoint('/api/analytics/hikes', headers)
            engagement_task = self._fetch_endpoint('/api/analytics/engagement', headers)

            # Wait for all requests to complete
            import asyncio
            overview, users, hikes, engagement = await asyncio.gather(
                overview_task, users_task, hikes_task, engagement_task,
                return_exceptions=True
            )

            # Check for exceptions
            for result, name in [(overview, 'overview'), (users, 'users'), 
                               (hikes, 'hikes'), (engagement, 'engagement')]:
                if isinstance(result, Exception):
                    _LOGGER.error(f"Failed to fetch {name} analytics: {result}")
                    result = {}

            data = {
                'overview': overview if not isinstance(overview, Exception) else {},
                'users': users if not isinstance(users, Exception) else {},
                'hikes': hikes if not isinstance(hikes, Exception) else {},
                'engagement': engagement if not isinstance(engagement, Exception) else {},
                'last_updated': self.last_update_success_time
            }

            _LOGGER.debug(f"Analytics data updated: {list(data.keys())}")
            return data

        except Exception as err:
            _LOGGER.error(f"Failed to update analytics data: {err}")
            raise UpdateFailed(f"Error communicating with API: {err}")

    async def _fetch_endpoint(self, endpoint: str, headers: dict) -> dict:
        """Fetch data from a specific analytics endpoint."""
        url = f"{self.base_url}{endpoint}"
        try:
            async with self.session.get(url, headers=headers, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()
                    _LOGGER.debug(f"Successfully fetched {endpoint}")
                    return data
                else:
                    error_text = await response.text()
                    _LOGGER.error(f"API error for {endpoint}: {response.status} - {error_text}")
                    return {}
        except asyncio.TimeoutError:
            _LOGGER.error(f"Timeout fetching {endpoint}")
            return {}
        except Exception as err:
            _LOGGER.error(f"Error fetching {endpoint}: {err}")
            return {}

    def get_overview_data(self) -> dict:
        """Get overview analytics data."""
        return self.data.get('overview', {}) if self.data else {}

    def get_user_analytics(self) -> dict:
        """Get user analytics data."""
        return self.data.get('users', {}) if self.data else {}

    def get_hike_analytics(self) -> dict:
        """Get hike analytics data."""
        return self.data.get('hikes', {}) if self.data else {}

    def get_engagement_metrics(self) -> dict:
        """Get engagement metrics data."""
        return self.data.get('engagement', {}) if self.data else {}

    def get_user_growth_rate(self) -> Optional[float]:
        """Get current user growth rate."""
        users = self.get_user_analytics()
        growth_trends = users.get('growth_trends', [])
        if len(growth_trends) >= 2:
            current = growth_trends[-1].get('user_count', 0)
            previous = growth_trends[-2].get('user_count', 0)
            if previous > 0:
                return round(((current - previous) / previous) * 100, 2)
        return None

    def get_active_users_trend(self) -> dict:
        """Get active users trend data."""
        users = self.get_user_analytics()
        return {
            'last_7_days': users.get('activity_levels', {}).get('last_7_days', 0),
            'last_30_days': users.get('activity_levels', {}).get('last_30_days', 0),
            'last_90_days': users.get('activity_levels', {}).get('last_90_days', 0)
        }

    def get_top_participants(self) -> list:
        """Get top participants data."""
        users = self.get_user_analytics()
        return users.get('top_participants', [])

    def get_hike_distribution(self) -> dict:
        """Get hike distribution by difficulty and type."""
        hikes = self.get_hike_analytics()
        return {
            'by_difficulty': hikes.get('byDifficulty', []),
            'by_type': hikes.get('byType', []),
            'by_status': hikes.get('byStatus', [])
        }

    def get_attendance_stats(self) -> dict:
        """Get average attendance statistics."""
        hikes = self.get_hike_analytics()
        attendance = hikes.get('attendance', {})
        return {
            'avg_confirmed': attendance.get('avg_confirmed', 0),
            'avg_interested': attendance.get('avg_interested', 0)
        }

    def get_conversion_rate(self) -> int:
        """Get interest to confirmation conversion rate."""
        engagement = self.get_engagement_metrics()
        return engagement.get('conversion_rate', 0)

    def get_monthly_trends(self) -> list:
        """Get monthly hike trends."""
        hikes = self.get_hike_analytics()
        return hikes.get('trends', [])