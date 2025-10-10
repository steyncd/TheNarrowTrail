"""Binary sensor platform for Hiking Portal integration."""
from datetime import datetime, timezone, timedelta
import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorEntity,
    BinarySensorDeviceClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN, 
    BINARY_SENSOR_TYPES,
    BINARY_SENSOR_HAS_URGENT_NOTIFICATIONS,
    BINARY_SENSOR_WEATHER_WARNING,
)
from .coordinator import HikingPortalDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Hiking Portal binary sensors from a config entry."""
    coordinators = hass.data[DOMAIN][config_entry.entry_id]
    coordinators = hass.data[DOMAIN][config_entry.entry_id]
    coordinator: HikingPortalDataUpdateCoordinator = coordinators["coordinator"]

    entities = [
        NextHikeTodayBinarySensor(coordinator),
        TimeToLeaveBinarySensor(coordinator),
        MinParticipantsReachedBinarySensor(coordinator),
    ]

    # NEW: Add enhanced binary sensors
    for sensor_type in BINARY_SENSOR_TYPES:
        entities.append(HikingPortalBinarySensor(coordinator, sensor_type))

    async_add_entities(entities)


class NextHikeTodayBinarySensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor that indicates if next hike is today."""

    def __init__(self, coordinator: HikingPortalDataUpdateCoordinator) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self._attr_name = "Next Hike Today"
        self._attr_unique_id = f"{DOMAIN}_next_hike_today"
        self._attr_device_class = BinarySensorDeviceClass.OCCUPANCY

    @property
    def is_on(self) -> bool:
        """Return true if next hike is today."""
        next_hike = self.coordinator.data.get("next_hike")
        if not next_hike or not next_hike.get("date"):
            return False

        try:
            hike_date = datetime.fromisoformat(
                next_hike["date"].replace("Z", "+00:00")
            ).replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)

            return hike_date.date() == now.date()
        except (ValueError, KeyError):
            return False

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        next_hike = self.coordinator.data.get("next_hike")
        if not next_hike:
            return {}

        return {
            "hike_name": next_hike.get("name"),
            "location": next_hike.get("location"),
            "time": next_hike.get("date"),
        }


class TimeToLeaveBinarySensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor that indicates if it's time to leave for next hike."""

    def __init__(self, coordinator: HikingPortalDataUpdateCoordinator) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self._attr_name = "Time to Leave for Hike"
        self._attr_unique_id = f"{DOMAIN}_time_to_leave"
        self._attr_device_class = BinarySensorDeviceClass.OCCUPANCY

    @property
    def is_on(self) -> bool:
        """Return true if it's within 2 hours before the hike."""
        next_hike = self.coordinator.data.get("next_hike")
        if not next_hike or not next_hike.get("date"):
            return False

        try:
            hike_date = datetime.fromisoformat(
                next_hike["date"].replace("Z", "+00:00")
            ).replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)

            # Return true if hike is within 2 hours
            time_diff = hike_date - now
            return timedelta(0) <= time_diff <= timedelta(hours=2)
        except (ValueError, KeyError):
            return False

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        next_hike = self.coordinator.data.get("next_hike")
        if not next_hike:
            return {}

        try:
            hike_date = datetime.fromisoformat(
                next_hike["date"].replace("Z", "+00:00")
            ).replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            minutes_until = int((hike_date - now).total_seconds() / 60)

            return {
                "hike_name": next_hike.get("name"),
                "location": next_hike.get("location"),
                "minutes_until_hike": minutes_until,
            }
        except (ValueError, KeyError):
            return {}


class MinParticipantsReachedBinarySensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor that indicates if next hike has reached minimum participants."""

    def __init__(self, coordinator: HikingPortalDataUpdateCoordinator) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self._attr_name = "Next Hike Min Participants Reached"
        self._attr_unique_id = f"{DOMAIN}_min_participants_reached"
        self._attr_device_class = BinarySensorDeviceClass.OCCUPANCY

    @property
    def is_on(self) -> bool:
        """Return true if minimum participants reached."""
        next_hike = self.coordinator.data.get("next_hike")
        if not next_hike:
            return False

        min_participants = next_hike.get("min_participants", 0)
        interested_count = next_hike.get("interested_count", 0)

        if min_participants == 0:
            return True  # No minimum set

        return interested_count >= min_participants

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        next_hike = self.coordinator.data.get("next_hike")
        if not next_hike:
            return {}

        return {
            "hike_name": next_hike.get("name"),
            "interested_count": next_hike.get("interested_count", 0),
            "min_participants": next_hike.get("min_participants", 0),
        }


class HikingPortalBinarySensor(CoordinatorEntity, BinarySensorEntity):
    """Enhanced binary sensor for Hiking Portal features."""

    def __init__(
        self,
        coordinator: HikingPortalDataUpdateCoordinator,
        sensor_type: str,
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._attr_name = BINARY_SENSOR_TYPES[sensor_type]["name"]
        self._attr_unique_id = f"{DOMAIN}_{sensor_type}"
        self._attr_icon = BINARY_SENSOR_TYPES[sensor_type]["icon"]
        if "device_class" in BINARY_SENSOR_TYPES[sensor_type]:
            self._attr_device_class = BINARY_SENSOR_TYPES[sensor_type]["device_class"]

    @property
    def is_on(self) -> bool:
        """Return the state of the binary sensor."""
        if self._sensor_type == BINARY_SENSOR_HAS_URGENT_NOTIFICATIONS:
            urgent = self.coordinator.data.get("urgent_notifications", [])
            return len(urgent) > 0

        elif self._sensor_type == BINARY_SENSOR_WEATHER_WARNING:
            return self.coordinator.data.get("weather_warning", False)

        elif self._sensor_type == BINARY_SENSOR_WEBSOCKET_CONNECTED:
            return self.coordinator.is_websocket_connected

        return False

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        attributes = {}

        if self._sensor_type == BINARY_SENSOR_HAS_URGENT_NOTIFICATIONS:
            urgent = self.coordinator.data.get("urgent_notifications", [])
            attributes["urgent_count"] = len(urgent)
            attributes["urgent_notifications"] = [
                {
                    "id": n.get("id"),
                    "title": n.get("title"),
                    "message": n.get("message")[:100],
                    "created_at": n.get("created_at"),
                }
                for n in urgent[:3]
            ]

        elif self._sensor_type == BINARY_SENSOR_WEATHER_WARNING:
            alerts = self.coordinator.data.get("weather_alerts", [])
            severe_alerts = [a for a in alerts if a.get("severity") in ["severe", "extreme"]]
            attributes["severe_alerts_count"] = len(severe_alerts)
            attributes["alerts"] = [
                {
                    "title": a.get("title"),
                    "description": a.get("description")[:100],
                    "severity": a.get("severity"),
                    "start": a.get("start"),
                }
                for a in severe_alerts[:3]
            ]

        elif self._sensor_type == BINARY_SENSOR_WEBSOCKET_CONNECTED:
            ws_coord = self.coordinator.websocket_coordinator
            if ws_coord:
                attributes.update({
                    "connection_status": "Connected" if ws_coord.is_connected else "Disconnected",
                    "connection_url": ws_coord.base_url,
                    "last_connected": getattr(ws_coord, '_last_connected', None),
                    "reconnection_attempts": getattr(ws_coord, '_reconnection_attempts', 0),
                })

        return attributes
