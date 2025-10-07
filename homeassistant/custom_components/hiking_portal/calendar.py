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
    coordinator: HikingPortalDataUpdateCoordinator = hass.data[DOMAIN][
        config_entry.entry_id
    ]

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
                hike_date = datetime.fromisoformat(
                    hike["date"].replace("Z", "+00:00")
                ).replace(tzinfo=None)

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

        # Assume 8-hour duration for hikes
        end_dt = start_dt + timedelta(hours=8)

        # Build description
        description_parts = []
        if hike.get("description"):
            description_parts.append(hike["description"])

        if hike.get("difficulty"):
            description_parts.append(f"Difficulty: {hike['difficulty']}")

        if hike.get("distance"):
            description_parts.append(f"Distance: {hike['distance']}km")

        if hike.get("duration"):
            description_parts.append(f"Duration: {hike['duration']} hours")

        if hike.get("price"):
            description_parts.append(f"Price: R{hike['price']}")

        if hike.get("interested_count"):
            description_parts.append(
                f"Interested: {hike['interested_count']} people"
            )

        description = "\n".join(description_parts)

        return CalendarEvent(
            start=start_dt,
            end=end_dt,
            summary=hike.get("name", "Hike"),
            description=description,
            location=hike.get("location"),
        )
