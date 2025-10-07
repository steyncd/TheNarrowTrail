"""Sensor platform for Hiking Portal integration."""
from datetime import datetime
import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, SENSOR_TYPES
from .coordinator import HikingPortalDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Hiking Portal sensors from a config entry."""
    coordinator: HikingPortalDataUpdateCoordinator = hass.data[DOMAIN][
        config_entry.entry_id
    ]

    entities = []

    # Create sensor for each type
    for sensor_type in SENSOR_TYPES:
        entities.append(HikingPortalSensor(coordinator, sensor_type))

    async_add_entities(entities)


class HikingPortalSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Hiking Portal sensor."""

    def __init__(
        self,
        coordinator: HikingPortalDataUpdateCoordinator,
        sensor_type: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._attr_name = SENSOR_TYPES[sensor_type]["name"]
        self._attr_icon = SENSOR_TYPES[sensor_type]["icon"]
        self._attr_native_unit_of_measurement = SENSOR_TYPES[sensor_type].get("unit")
        self._attr_unique_id = f"{DOMAIN}_{sensor_type}"

    @property
    def native_value(self) -> str | int | None:
        """Return the state of the sensor."""
        if self._sensor_type == "next_hike":
            next_hike = self.coordinator.data.get("next_hike")
            if next_hike:
                return next_hike.get("name")
            return "No upcoming hikes"

        elif self._sensor_type == "upcoming_hikes":
            return len(self.coordinator.data.get("upcoming_hikes", []))

        elif self._sensor_type == "my_hikes":
            return len(self.coordinator.data.get("my_hikes", []))

        elif self._sensor_type == "pending_users":
            return len(self.coordinator.data.get("pending_users", []))

        elif self._sensor_type == "total_hikes":
            return len(self.coordinator.data.get("hikes", []))

        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        attributes = {}

        if self._sensor_type == "next_hike":
            next_hike = self.coordinator.data.get("next_hike")
            if next_hike:
                attributes.update({
                    "hike_id": next_hike.get("id"),
                    "date": next_hike.get("date"),
                    "location": next_hike.get("location"),
                    "difficulty": next_hike.get("difficulty"),
                    "distance": next_hike.get("distance"),
                    "duration": next_hike.get("duration"),
                    "price": next_hike.get("price"),
                    "status": next_hike.get("status"),
                    "interested_count": next_hike.get("interested_count", 0),
                    "description": next_hike.get("description"),
                })

        elif self._sensor_type == "upcoming_hikes":
            upcoming = self.coordinator.data.get("upcoming_hikes", [])
            attributes["hikes"] = [
                {
                    "id": h.get("id"),
                    "name": h.get("name"),
                    "date": h.get("date"),
                    "location": h.get("location"),
                    "difficulty": h.get("difficulty"),
                }
                for h in upcoming[:5]  # Limit to 5 for attributes
            ]

        elif self._sensor_type == "my_hikes":
            my_hikes = self.coordinator.data.get("my_hikes", [])
            attributes["hikes"] = [
                {
                    "id": h.get("id"),
                    "name": h.get("name"),
                    "date": h.get("date"),
                    "location": h.get("location"),
                    "status": h.get("status"),
                }
                for h in my_hikes[:10]  # Limit to 10 for attributes
            ]

        elif self._sensor_type == "pending_users":
            pending = self.coordinator.data.get("pending_users", [])
            attributes["users"] = [
                {
                    "id": u.get("id"),
                    "name": u.get("name"),
                    "email": u.get("email"),
                    "phone": u.get("phone"),
                    "created_at": u.get("created_at"),
                }
                for u in pending[:10]  # Limit to 10 for attributes
            ]

        return attributes

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success
