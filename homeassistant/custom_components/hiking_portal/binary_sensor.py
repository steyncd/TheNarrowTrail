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

from .const import DOMAIN
from .coordinator import HikingPortalDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Hiking Portal binary sensors from a config entry."""
    coordinator: HikingPortalDataUpdateCoordinator = hass.data[DOMAIN][
        config_entry.entry_id
    ]

    async_add_entities([
        NextHikeTodayBinarySensor(coordinator),
        TimeToLeaveBinarySensor(coordinator),
        MinParticipantsReachedBinarySensor(coordinator),
    ])


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
