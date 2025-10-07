"""Event platform for Hiking Portal integration."""
import logging
from typing import Any

from homeassistant.components.event import EventEntity, EventDeviceClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import HikingPortalDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

# Event types
EVENT_NEW_HIKE = "new_hike"
EVENT_HIKE_UPDATED = "hike_updated"
EVENT_INTEREST_ADDED = "interest_added"
EVENT_INTEREST_REMOVED = "interest_removed"
EVENT_HIKE_APPROACHING = "hike_approaching"
EVENT_MIN_PARTICIPANTS_REACHED = "min_participants_reached"
EVENT_NEW_COMMENT = "new_comment"
EVENT_ATTENDANCE_MARKED = "attendance_marked"


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Hiking Portal events from a config entry."""
    coordinator: HikingPortalDataUpdateCoordinator = hass.data[DOMAIN][
        config_entry.entry_id
    ]

    async_add_entities([
        HikingPortalEvents(coordinator),
    ])


class HikingPortalEvents(CoordinatorEntity, EventEntity):
    """Hiking Portal events entity."""

    _attr_device_class = EventDeviceClass.DOORBELL  # Generic event class
    _attr_event_types = [
        EVENT_NEW_HIKE,
        EVENT_HIKE_UPDATED,
        EVENT_INTEREST_ADDED,
        EVENT_INTEREST_REMOVED,
        EVENT_HIKE_APPROACHING,
        EVENT_MIN_PARTICIPANTS_REACHED,
        EVENT_NEW_COMMENT,
        EVENT_ATTENDANCE_MARKED,
    ]

    def __init__(self, coordinator: HikingPortalDataUpdateCoordinator) -> None:
        """Initialize the events entity."""
        super().__init__(coordinator)
        self._attr_name = "Hiking Portal Events"
        self._attr_unique_id = f"{DOMAIN}_events"
        self._previous_hikes = set()
        self._previous_interests = {}

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        hikes = self.coordinator.data.get("hikes", [])
        my_hikes = self.coordinator.data.get("my_hikes", [])
        upcoming_hikes = self.coordinator.data.get("upcoming_hikes", [])

        current_hikes = {h["id"] for h in hikes if h.get("id")}
        current_my_hikes = {h["id"] for h in my_hikes if h.get("id")}

        # Check for new hikes
        new_hikes = current_hikes - self._previous_hikes
        for hike_id in new_hikes:
            hike = next((h for h in hikes if h.get("id") == hike_id), None)
            if hike and self._previous_hikes:  # Don't trigger on first load
                self._trigger_event(EVENT_NEW_HIKE, {
                    "hike_id": hike_id,
                    "hike_name": hike.get("name"),
                    "date": hike.get("date"),
                    "location": hike.get("location"),
                })

        # Check for hikes approaching (within 7 days)
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        seven_days = now + timedelta(days=7)

        for hike in upcoming_hikes:
            try:
                hike_date = datetime.fromisoformat(
                    hike["date"].replace("Z", "+00:00")
                ).replace(tzinfo=timezone.utc)

                if now < hike_date <= seven_days:
                    days_until = (hike_date - now).days
                    if days_until in [7, 3, 1]:  # Alert at 7, 3, and 1 day
                        self._trigger_event(EVENT_HIKE_APPROACHING, {
                            "hike_id": hike.get("id"),
                            "hike_name": hike.get("name"),
                            "date": hike.get("date"),
                            "days_until": days_until,
                        })
            except (ValueError, KeyError):
                continue

        # Check for interest changes in my hikes
        for hike_id in current_my_hikes:
            hike = next((h for h in my_hikes if h.get("id") == hike_id), None)
            if hike:
                current_count = hike.get("interested_count", 0)
                previous_count = self._previous_interests.get(hike_id, current_count)

                if current_count > previous_count:
                    self._trigger_event(EVENT_INTEREST_ADDED, {
                        "hike_id": hike_id,
                        "hike_name": hike.get("name"),
                        "interested_count": current_count,
                    })

                # Check if minimum participants reached
                min_participants = hike.get("min_participants", 0)
                if min_participants > 0 and current_count >= min_participants and previous_count < min_participants:
                    self._trigger_event(EVENT_MIN_PARTICIPANTS_REACHED, {
                        "hike_id": hike_id,
                        "hike_name": hike.get("name"),
                        "interested_count": current_count,
                        "min_participants": min_participants,
                    })

                self._previous_interests[hike_id] = current_count

        # Update tracking sets
        self._previous_hikes = current_hikes

        super()._handle_coordinator_update()

    def _trigger_event(self, event_type: str, event_data: dict[str, Any]) -> None:
        """Trigger an event."""
        self._trigger_event(event_type, event_data)
        _LOGGER.debug("Triggered event %s with data: %s", event_type, event_data)
