"""The Hiking Portal integration."""
import logging
from datetime import timedelta
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, PLATFORMS, CONF_API_URL, CONF_TOKEN
from .coordinator import HikingPortalDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

# Service schemas
SERVICE_EXPRESS_INTEREST_SCHEMA = vol.Schema({
    vol.Required("hike_id"): cv.positive_int,
})

SERVICE_REMOVE_INTEREST_SCHEMA = vol.Schema({
    vol.Required("hike_id"): cv.positive_int,
})

SERVICE_MARK_ATTENDANCE_SCHEMA = vol.Schema({
    vol.Required("hike_id"): cv.positive_int,
    vol.Required("status"): vol.In(["present", "absent", "maybe"]),
})

SERVICE_SEND_NOTIFICATION_SCHEMA = vol.Schema({
    vol.Required("hike_id"): cv.positive_int,
    vol.Required("message"): cv.string,
})


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Hiking Portal from a config entry."""
    api_url = entry.data[CONF_API_URL]
    token = entry.data[CONF_TOKEN]

    session = async_get_clientsession(hass)
    coordinator = HikingPortalDataUpdateCoordinator(
        hass,
        session=session,
        api_url=api_url,
        token=token,
    )

    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register services
    async def handle_express_interest(call: ServiceCall) -> None:
        """Handle express interest service call."""
        hike_id = call.data["hike_id"]
        try:
            await coordinator.express_interest(hike_id)
            await coordinator.async_request_refresh()
        except Exception as err:
            _LOGGER.error("Error expressing interest in hike %s: %s", hike_id, err)

    async def handle_remove_interest(call: ServiceCall) -> None:
        """Handle remove interest service call."""
        hike_id = call.data["hike_id"]
        try:
            await coordinator.remove_interest(hike_id)
            await coordinator.async_request_refresh()
        except Exception as err:
            _LOGGER.error("Error removing interest from hike %s: %s", hike_id, err)

    async def handle_mark_attendance(call: ServiceCall) -> None:
        """Handle mark attendance service call."""
        hike_id = call.data["hike_id"]
        status = call.data["status"]
        try:
            await coordinator.mark_attendance(hike_id, status)
            await coordinator.async_request_refresh()
        except Exception as err:
            _LOGGER.error("Error marking attendance for hike %s: %s", hike_id, err)

    async def handle_send_notification(call: ServiceCall) -> None:
        """Handle send notification service call."""
        hike_id = call.data["hike_id"]
        message = call.data["message"]
        try:
            await coordinator.send_notification(hike_id, message)
        except Exception as err:
            _LOGGER.error("Error sending notification for hike %s: %s", hike_id, err)

    hass.services.async_register(
        DOMAIN, "express_interest", handle_express_interest, schema=SERVICE_EXPRESS_INTEREST_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, "remove_interest", handle_remove_interest, schema=SERVICE_REMOVE_INTEREST_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, "mark_attendance", handle_mark_attendance, schema=SERVICE_MARK_ATTENDANCE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, "send_notification", handle_send_notification, schema=SERVICE_SEND_NOTIFICATION_SCHEMA
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
