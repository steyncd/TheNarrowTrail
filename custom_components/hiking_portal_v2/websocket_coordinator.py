"""WebSocket coordinator for real-time updates from Hiking Portal."""
import asyncio
import json
import logging
from typing import Any, Dict, Optional

import aiohttp
import socketio
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class HikingPortalWebSocketCoordinator:
    """WebSocket coordinator for real-time updates from Hiking Portal."""

    def __init__(
        self,
        hass: HomeAssistant,
        base_url: str,
        token: str,
        data_coordinator: DataUpdateCoordinator,
    ) -> None:
        """Initialize the WebSocket coordinator."""
        self.hass = hass
        self.base_url = base_url
        self.token = token
        self.data_coordinator = data_coordinator
        self._sio = None
        self._connected = False
        self._reconnect_task = None
        self._listeners = {}

    async def async_connect(self) -> None:
        """Connect to the WebSocket server."""
        if self._connected:
            return

        try:
            # Create Socket.IO client
            self._sio = socketio.AsyncClient(
                logger=False,  # Disable socket.io logging to avoid spam
                engineio_logger=False,
            )

            # Register event handlers
            self._register_handlers()

            # Connect with authentication
            socket_url = self.base_url.replace("https://", "").replace("http://", "")
            await self._sio.connect(
                f"https://{socket_url}",
                auth={"token": self.token},
                transports=["polling", "websocket"],
                wait_timeout=10,
            )

            self._connected = True
            _LOGGER.info("Successfully connected to Hiking Portal WebSocket")

        except Exception as err:
            _LOGGER.error("Failed to connect to WebSocket: %s", err)
            self._connected = False
            # Schedule reconnection attempt
            if not self._reconnect_task:
                self._reconnect_task = asyncio.create_task(self._reconnect_loop())

    async def async_disconnect(self) -> None:
        """Disconnect from the WebSocket server."""
        if self._reconnect_task:
            self._reconnect_task.cancel()
            self._reconnect_task = None

        if self._sio and self._connected:
            await self._sio.disconnect()
            self._connected = False
            _LOGGER.info("Disconnected from Hiking Portal WebSocket")

    def _register_handlers(self) -> None:
        """Register WebSocket event handlers."""
        
        @self._sio.event
        async def connect():
            """Handle successful connection."""
            _LOGGER.info("WebSocket connected to Hiking Portal")
            self._connected = True
            # Cancel any reconnection attempts
            if self._reconnect_task:
                self._reconnect_task.cancel()
                self._reconnect_task = None

        @self._sio.event
        async def disconnect():
            """Handle disconnection."""
            _LOGGER.warning("WebSocket disconnected from Hiking Portal")
            self._connected = False
            # Start reconnection attempts
            if not self._reconnect_task:
                self._reconnect_task = asyncio.create_task(self._reconnect_loop())

        @self._sio.event
        async def connect_error(data):
            """Handle connection error."""
            _LOGGER.error("WebSocket connection error: %s", data)
            self._connected = False

        # Hike-related events
        @self._sio.event
        async def interest_updated(data):
            """Handle interest count updates."""
            _LOGGER.debug("Received interest update: %s", data)
            await self._handle_interest_update(data)

        @self._sio.event
        async def hike_created(data):
            """Handle new hike creation."""
            _LOGGER.debug("Received new hike: %s", data)
            await self._handle_hike_created(data)

        @self._sio.event
        async def hike_updated(data):
            """Handle hike updates."""
            _LOGGER.debug("Received hike update: %s", data)
            await self._handle_hike_updated(data)

        @self._sio.event
        async def hike_deleted(data):
            """Handle hike deletion."""
            _LOGGER.debug("Received hike deletion: %s", data)
            await self._handle_hike_deleted(data)

        # Notification events
        @self._sio.event
        async def notification_new(data):
            """Handle new notifications."""
            _LOGGER.debug("Received new notification: %s", data)
            await self._handle_new_notification(data)

        @self._sio.event
        async def notification_updated(data):
            """Handle notification updates."""
            _LOGGER.debug("Received notification update: %s", data)
            await self._handle_notification_updated(data)

        # Payment events
        @self._sio.event
        async def payment_received(data):
            """Handle payment received."""
            _LOGGER.debug("Received payment update: %s", data)
            await self._handle_payment_received(data)

        # Weather events
        @self._sio.event
        async def weather_alert(data):
            """Handle weather alerts."""
            _LOGGER.debug("Received weather alert: %s", data)
            await self._handle_weather_alert(data)

        # User events
        @self._sio.event
        async def user_approved(data):
            """Handle user approval."""
            _LOGGER.debug("Received user approval: %s", data)
            await self._handle_user_approved(data)

    async def _handle_interest_update(self, data: Dict[str, Any]) -> None:
        """Handle interest count updates."""
        # Update the coordinator's cached data
        if "hikeId" in data:
            hike_id = data["hikeId"]
            current_data = self.data_coordinator.data or {}
            
            # Update specific hike data
            if "hikes" in current_data:
                for hike in current_data["hikes"]:
                    if hike.get("id") == hike_id:
                        hike["interested_count"] = data.get("interestedCount", hike.get("interested_count", 0))
                        break
            
            # Update next hike if it's the same one
            if "next_hike" in current_data and current_data["next_hike"].get("id") == hike_id:
                current_data["next_hike"]["interested_count"] = data.get("interestedCount", 0)
            
            # Trigger coordinator update without API call
            await self._trigger_update(current_data)

    async def _handle_hike_created(self, data: Dict[str, Any]) -> None:
        """Handle new hike creation."""
        # Trigger a full data refresh for new hikes
        await self.data_coordinator.async_request_refresh()

    async def _handle_hike_updated(self, data: Dict[str, Any]) -> None:
        """Handle hike updates."""
        # Update specific hike data and refresh
        await self.data_coordinator.async_request_refresh()

    async def _handle_hike_deleted(self, data: Dict[str, Any]) -> None:
        """Handle hike deletion."""
        # Remove from cached data and refresh
        await self.data_coordinator.async_request_refresh()

    async def _handle_new_notification(self, data: Dict[str, Any]) -> None:
        """Handle new notifications."""
        # Update notification count in coordinator data
        current_data = self.data_coordinator.data or {}
        
        # Increment notification counts
        if "notifications" not in current_data:
            current_data["notifications"] = []
        
        # Add new notification to the list
        current_data["notifications"].insert(0, data)
        
        # Update notification summary
        if "notification_summary" not in current_data:
            current_data["notification_summary"] = {"total": 0, "unread": 0, "urgent": 0}
        
        current_data["notification_summary"]["total"] += 1
        current_data["notification_summary"]["unread"] += 1
        
        if data.get("priority") == "urgent":
            current_data["notification_summary"]["urgent"] += 1
            # Update urgent notifications list
            if "urgent_notifications" not in current_data:
                current_data["urgent_notifications"] = []
            current_data["urgent_notifications"].insert(0, data)

        await self._trigger_update(current_data)

        # Fire Home Assistant event for automation triggers
        self.hass.bus.async_fire(
            f"{DOMAIN}_notification_received",
            {
                "notification_id": data.get("id"),
                "title": data.get("title"),
                "priority": data.get("priority"),
                "type": data.get("type"),
            },
        )

    async def _handle_notification_updated(self, data: Dict[str, Any]) -> None:
        """Handle notification updates (like read status)."""
        current_data = self.data_coordinator.data or {}
        
        # Update notification in cached data
        if "notifications" in current_data:
            for i, notification in enumerate(current_data["notifications"]):
                if notification.get("id") == data.get("id"):
                    current_data["notifications"][i].update(data)
                    break
        
        # Recalculate summary
        await self._recalculate_notification_summary(current_data)
        await self._trigger_update(current_data)

    async def _handle_payment_received(self, data: Dict[str, Any]) -> None:
        """Handle payment received updates."""
        # Update payment data and refresh
        await self.data_coordinator.async_request_refresh()

        # Fire Home Assistant event
        self.hass.bus.async_fire(
            f"{DOMAIN}_payment_received",
            {
                "user_id": data.get("user_id"),
                "amount": data.get("amount"),
                "hike_id": data.get("hike_id"),
            },
        )

    async def _handle_weather_alert(self, data: Dict[str, Any]) -> None:
        """Handle weather alerts."""
        current_data = self.data_coordinator.data or {}
        
        # Update weather alert data
        if "weather_alerts" not in current_data:
            current_data["weather_alerts"] = []
        
        # Add or update weather alert
        alert_id = data.get("id")
        alert_found = False
        
        for i, alert in enumerate(current_data["weather_alerts"]):
            if alert.get("id") == alert_id:
                current_data["weather_alerts"][i] = data
                alert_found = True
                break
        
        if not alert_found:
            current_data["weather_alerts"].append(data)
        
        # Update weather warning status
        severe_alerts = [a for a in current_data["weather_alerts"] if a.get("severity") in ["severe", "extreme"]]
        current_data["weather_warning"] = len(severe_alerts) > 0

        await self._trigger_update(current_data)

        # Fire Home Assistant event for severe weather
        if data.get("severity") in ["severe", "extreme"]:
            self.hass.bus.async_fire(
                f"{DOMAIN}_weather_alert",
                {
                    "alert_id": data.get("id"),
                    "severity": data.get("severity"),
                    "title": data.get("title"),
                    "location": data.get("location"),
                },
            )

    async def _handle_user_approved(self, data: Dict[str, Any]) -> None:
        """Handle user approval updates."""
        # Refresh pending users data
        await self.data_coordinator.async_request_refresh()

        # Fire Home Assistant event
        self.hass.bus.async_fire(
            f"{DOMAIN}_user_approved",
            {
                "user_id": data.get("user_id"),
                "email": data.get("email"),
                "name": data.get("name"),
            },
        )

    async def _recalculate_notification_summary(self, data: Dict[str, Any]) -> None:
        """Recalculate notification summary counts."""
        if "notifications" not in data:
            return
        
        notifications = data["notifications"]
        total = len(notifications)
        unread = sum(1 for n in notifications if not n.get("is_read", False))
        urgent = sum(1 for n in notifications if n.get("priority") == "urgent" and not n.get("is_read", False))
        
        data["notification_summary"] = {
            "total": total,
            "unread": unread,
            "urgent": urgent,
        }
        
        # Update urgent notifications list
        data["urgent_notifications"] = [
            n for n in notifications 
            if n.get("priority") == "urgent" and not n.get("is_read", False)
        ]

    async def _trigger_update(self, new_data: Dict[str, Any]) -> None:
        """Trigger a coordinator update with new data."""
        # Update the coordinator's data without making an API call
        self.data_coordinator.data = new_data
        self.data_coordinator.last_update_success = True
        
        # Notify all listeners that data has been updated
        for update_callback in self.data_coordinator._listeners:
            update_callback()

    async def _reconnect_loop(self) -> None:
        """Handle automatic reconnection with exponential backoff."""
        reconnect_delay = 5  # Start with 5 seconds
        max_delay = 300  # Maximum 5 minutes
        
        while not self._connected:
            try:
                _LOGGER.info("Attempting to reconnect to WebSocket in %s seconds", reconnect_delay)
                await asyncio.sleep(reconnect_delay)
                
                await self.async_connect()
                
                if self._connected:
                    _LOGGER.info("Successfully reconnected to WebSocket")
                    break
                    
            except Exception as err:
                _LOGGER.error("Reconnection attempt failed: %s", err)
                
            # Exponential backoff with jitter
            reconnect_delay = min(reconnect_delay * 2, max_delay)
            
        self._reconnect_task = None

    @property
    def is_connected(self) -> bool:
        """Return True if WebSocket is connected."""
        return self._connected

    def add_listener(self, event: str, callback) -> None:
        """Add a listener for specific WebSocket events."""
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(callback)

    def remove_listener(self, event: str, callback) -> None:
        """Remove a listener for specific WebSocket events."""
        if event in self._listeners and callback in self._listeners[event]:
            self._listeners[event].remove(callback)