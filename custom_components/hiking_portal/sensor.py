"""Sensor platform for Hiking Portal integration."""
from datetime import datetime
import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN, 
    SENSOR_TYPES,
    SENSOR_NOTIFICATION_SUMMARY,
    SENSOR_WEATHER_ALERTS,
    SENSOR_OUTSTANDING_PAYMENTS,
    SENSOR_PAYMENT_SUMMARY,
    SENSOR_MY_PAYMENT_STATUS,
    SENSOR_NEXT_HIKE_WEATHER,
)
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

        elif self._sensor_type == "days_until_next_hike":
            next_hike = self.coordinator.data.get("next_hike")
            if not next_hike or not next_hike.get("date"):
                return None

            try:
                from datetime import datetime, timezone
                hike_date = datetime.fromisoformat(
                    next_hike["date"].replace("Z", "+00:00")
                ).replace(tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                days_until = (hike_date - now).days
                return max(0, days_until)
            except (ValueError, KeyError):
                return None

        elif self._sensor_type == "next_hike_weather":
            # Placeholder - would integrate with weather service
            return "Unknown"

        elif self._sensor_type == "unread_notifications":
            unread = self.coordinator.data.get("unread_notifications", [])
            return len(unread)

        # NEW: Enhanced sensor values
        elif self._sensor_type == SENSOR_NOTIFICATION_SUMMARY:
            notifications = self.coordinator.data.get("notifications", [])
            unread = len([n for n in notifications if not n.get("read", False)])
            urgent = len([n for n in notifications if n.get("priority") == "urgent" and not n.get("read", False)])
            return f"{unread} unread ({urgent} urgent)"

        elif self._sensor_type == SENSOR_WEATHER_ALERTS:
            alerts = self.coordinator.data.get("weather_alerts", [])
            return len(alerts)

        elif self._sensor_type == SENSOR_OUTSTANDING_PAYMENTS:
            return self.coordinator.data.get("outstanding_payments", 0)

        elif self._sensor_type == SENSOR_PAYMENT_SUMMARY:
            summary = self.coordinator.data.get("payment_summary", {})
            total_due = summary.get("total_due", 0)
            total_paid = summary.get("total_paid", 0)
            return f"Paid: R{total_paid:.2f} / Due: R{total_due:.2f}"

        elif self._sensor_type == SENSOR_MY_PAYMENT_STATUS:
            payments = self.coordinator.data.get("my_payments", [])
            if not payments:
                return "No payments"
            pending = len([p for p in payments if p.get("status") == "pending"])
            paid = len([p for p in payments if p.get("status") == "paid"])
            return f"{paid} paid, {pending} pending"

        elif self._sensor_type == SENSOR_NEXT_HIKE_WEATHER:
            weather = self.coordinator.data.get("next_hike_weather", {})
            if not weather:
                return "No weather data"
            temp = weather.get("temperature", "?")
            condition = weather.get("condition", "Unknown")
            return f"{condition}, {temp}°C"

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

        # NEW: Enhanced attributes for new sensors
        elif self._sensor_type == SENSOR_NOTIFICATION_SUMMARY:
            notifications = self.coordinator.data.get("notifications", [])
            attributes["total_notifications"] = len(notifications)
            attributes["unread_count"] = len([n for n in notifications if not n.get("read", False)])
            attributes["urgent_count"] = len([n for n in notifications if n.get("priority") == "urgent" and not n.get("read", False)])
            attributes["recent_notifications"] = [
                {
                    "id": n.get("id"),
                    "title": n.get("title"),
                    "message": n.get("message")[:100],
                    "priority": n.get("priority"),
                    "created_at": n.get("created_at"),
                }
                for n in notifications[:5] if not n.get("read", False)
            ]

        elif self._sensor_type == SENSOR_WEATHER_ALERTS:
            alerts = self.coordinator.data.get("weather_alerts", [])
            attributes["alerts"] = [
                {
                    "title": alert.get("title"),
                    "description": alert.get("description"),
                    "severity": alert.get("severity"),
                    "start": alert.get("start"),
                    "end": alert.get("end"),
                }
                for alert in alerts[:5]
            ]

        elif self._sensor_type == SENSOR_OUTSTANDING_PAYMENTS:
            payments = self.coordinator.data.get("my_payments", [])
            outstanding = [p for p in payments if p.get("status") != "paid"]
            attributes["outstanding_payments"] = [
                {
                    "hike_name": p.get("hike_name"),
                    "amount_due": p.get("amount_due"),
                    "amount_paid": p.get("amount_paid"),
                    "due_date": p.get("due_date"),
                }
                for p in outstanding[:10]
            ]

        elif self._sensor_type == SENSOR_NEXT_HIKE_WEATHER:
            weather = self.coordinator.data.get("next_hike_weather", {})
            if weather:
                attributes.update({
                    "temperature": weather.get("temperature"),
                    "feels_like": weather.get("feels_like"),
                    "humidity": weather.get("humidity"),
                    "wind_speed": weather.get("wind_speed"),
                    "wind_direction": weather.get("wind_direction"),
                    "visibility": weather.get("visibility"),
                    "uv_index": weather.get("uv_index"),
                    "condition": weather.get("condition"),
                    "forecast": weather.get("forecast", [])[:3],  # 3-day forecast
                })

        return attributes

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success
