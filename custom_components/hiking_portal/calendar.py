"""Calendar platform for Hiking Portal integration."""
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
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
    """Set up Hiking Portal calendar from a config entry."""
    coordinators = hass.data[DOMAIN][config_entry.entry_id]
    coordinator: HikingPortalDataUpdateCoordinator = coordinators["coordinator"]

    async_add_entities([HikingPortalCalendar(coordinator)])


class HikingPortalCalendar(CoordinatorEntity, CalendarEntity):
    """Representation of a Hiking Portal calendar."""

    def __init__(self, coordinator: HikingPortalDataUpdateCoordinator) -> None:
        """Initialize the calendar."""
        super().__init__(coordinator)
        self._attr_name = "Hiking Portal Events"
        self._attr_unique_id = f"{DOMAIN}_calendar"

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next upcoming event."""
        next_hike = self.coordinator.data.get("next_hike")
        if not next_hike:
            return None

        return self._create_calendar_event(next_hike)

    async def async_get_events(
        self,
        hass: HomeAssistant,
        start_date: datetime,
        end_date: datetime,
    ) -> list[CalendarEvent]:
        """Return calendar events within a datetime range."""
        events = []

        hikes = self.coordinator.data.get("hikes", [])

        for hike in hikes:
            try:
                hike_date_str = hike.get("date")
                if not hike_date_str:
                    continue

                hike_date = datetime.fromisoformat(
                    hike_date_str.replace("Z", "+00:00")
                )

                # Ensure both dates are timezone-aware for comparison
                if start_date.tzinfo is None:
                    hike_date = hike_date.replace(tzinfo=None)

                # Only include hikes within the requested date range
                if start_date <= hike_date <= end_date:
                    events.append(self._create_calendar_event(hike))

            except (ValueError, KeyError) as err:
                _LOGGER.warning("Error parsing hike date: %s", err)
                continue

        return sorted(events, key=lambda x: x.start)

    def _create_calendar_event(self, hike: dict[str, Any]) -> CalendarEvent:
        """Create a CalendarEvent from a hike."""
        try:
            start_dt = datetime.fromisoformat(
                hike["date"].replace("Z", "+00:00")
            ).replace(tzinfo=None)
        except ValueError:
            start_dt = datetime.now()

        # Use actual duration if available, otherwise assume 8 hours
        duration_hours = 8
        if hike.get("duration"):
            try:
                duration_hours = float(hike["duration"])
            except (ValueError, TypeError):
                duration_hours = 8

        end_dt = start_dt + timedelta(hours=duration_hours)

        # Build enhanced description with attendance tracking
        description_parts = []
        
        # Basic hike info
        if hike.get("description"):
            description_parts.append(f"📝 {hike['description']}")

        if hike.get("difficulty"):
            difficulty_icons = {"easy": "🟢", "moderate": "🟡", "hard": "🟠", "extreme": "🔴"}
            icon = difficulty_icons.get(hike.get("difficulty", "").lower(), "⚪")
            description_parts.append(f"{icon} Difficulty: {hike['difficulty']}")

        if hike.get("distance"):
            description_parts.append(f"📏 Distance: {hike['distance']}km")

        if hike.get("duration"):
            description_parts.append(f"⏰ Duration: {hike['duration']} hours")

        if hike.get("price"):
            description_parts.append(f"💰 Price: R{hike['price']}")

        # Enhanced attendance information
        interested_count = hike.get("interested_count", 0)
        min_participants = hike.get("min_participants", 0)
        
        if interested_count > 0:
            attendance_status = "✅" if interested_count >= min_participants else "⚠️"
            description_parts.append(f"{attendance_status} Interested: {interested_count}/{min_participants} people")
        
        # Show attendance status
        if min_participants > 0:
            if interested_count >= min_participants:
                description_parts.append("🎯 Event confirmed - minimum participants reached!")
            else:
                needed = min_participants - interested_count
                description_parts.append(f"📢 Need {needed} more participants to confirm")

        # Add weather warning if available
        if hike.get("weather_warning"):
            description_parts.append("⚠️ Weather warning active - check conditions!")

        # Add payment tracking
        if hike.get("requires_payment"):
            paid_count = hike.get("paid_count", 0)
            description_parts.append(f"💳 Payments: {paid_count}/{interested_count} received")

        # Add organizer information
        if hike.get("organizer"):
            description_parts.append(f"👤 Organizer: {hike['organizer']}")

        # Add links if available
        if hike.get("external_link"):
            description_parts.append(f"🔗 More info: {hike['external_link']}")

        description = "\n".join(description_parts)

        # Enhanced summary with status indicators
        summary_parts = [hike.get("name", "Hike")]
        
        if interested_count >= min_participants and min_participants > 0:
            summary_parts.append("✅")
        elif min_participants > 0:
            summary_parts.append(f"({interested_count}/{min_participants})")

        summary = " ".join(summary_parts)

        return CalendarEvent(
            start=start_dt,
            end=end_dt,
            summary=summary,
            description=description,
            location=hike.get("location"),
        )
