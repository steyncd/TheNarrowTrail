"""The Hiking Portal integration - Minimal version for debugging."""
import logging
from datetime import timedelta
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import homeassistant.helpers.config_validation as cv

# Inline constants to avoid import issues
DOMAIN = "hiking_portal"
PLATFORMS = ["sensor", "calendar", "binary_sensor"]
CONF_API_URL = "api_url"
CONF_TOKEN = "token"

from .coordinator import HikingPortalDataUpdateCoordinator
from .websocket_coordinator import HikingPortalWebSocketCoordinator

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

# NEW: Enhanced service schemas
SERVICE_MARK_NOTIFICATION_READ_SCHEMA = vol.Schema({
    vol.Required("notification_id"): cv.positive_int,
})

SERVICE_RECORD_PAYMENT_SCHEMA = vol.Schema({
    vol.Required("hike_id"): cv.positive_int,
    vol.Required("user_id"): cv.positive_int,
    vol.Required("amount"): vol.Coerce(float),
    vol.Optional("payment_method", default="cash"): cv.string,
})

SERVICE_GET_WEATHER_SCHEMA = vol.Schema({
    vol.Required("hike_id"): cv.positive_int,
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

    # Initialize WebSocket coordinator for real-time updates
    websocket_coordinator = HikingPortalWebSocketCoordinator(
        hass,
        base_url=api_url,
        token=token,
        data_coordinator=coordinator,
    )
    
    # Link coordinators
    coordinator.set_websocket_coordinator(websocket_coordinator)
    
    # Start WebSocket connection
    try:
        await websocket_coordinator.async_connect()
        _LOGGER.info("WebSocket coordinator initialized successfully")
    except Exception as err:
        _LOGGER.warning("Failed to initialize WebSocket coordinator: %s", err)

    hass.data.setdefault(DOMAIN, {})
    # Simplified coordinators structure
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "websocket_coordinator": websocket_coordinator,
    }

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

    # NEW: Enhanced service handlers
    async def handle_mark_notification_read(call: ServiceCall) -> None:
        """Handle mark notification read service call."""
        notification_id = call.data["notification_id"]
        try:
            await coordinator.mark_notification_read(notification_id)
            await coordinator.async_request_refresh()
        except Exception as err:
            _LOGGER.error("Error marking notification %s as read: %s", notification_id, err)

    async def handle_record_payment(call: ServiceCall) -> None:
        """Handle record payment service call."""
        hike_id = call.data["hike_id"]
        user_id = call.data["user_id"]
        amount = call.data["amount"]
        payment_method = call.data.get("payment_method", "cash")
        try:
            await coordinator.record_payment(hike_id, user_id, amount, payment_method)
            await coordinator.async_request_refresh()
        except Exception as err:
            _LOGGER.error("Error recording payment for hike %s: %s", hike_id, err)

    async def handle_get_weather(call: ServiceCall) -> None:
        """Handle get weather service call."""
        hike_id = call.data["hike_id"]
        try:
            weather_data = await coordinator.get_hike_weather(hike_id)
            _LOGGER.info("Weather for hike %s: %s", hike_id, weather_data)
        except Exception as err:
            _LOGGER.error("Error getting weather for hike %s: %s", hike_id, err)

    # Register all services
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
    hass.services.async_register(
        DOMAIN, "mark_notification_read", handle_mark_notification_read, schema=SERVICE_MARK_NOTIFICATION_READ_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, "record_payment", handle_record_payment, schema=SERVICE_RECORD_PAYMENT_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, "get_weather", handle_get_weather, schema=SERVICE_GET_WEATHER_SCHEMA
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        coordinators = hass.data[DOMAIN][entry.entry_id]
        websocket_coordinator = coordinators.get("websocket_coordinator")
        
        # Disconnect WebSocket coordinator if it exists
        if websocket_coordinator:
            try:
                await websocket_coordinator.async_disconnect()
                _LOGGER.info("WebSocket coordinator disconnected successfully")
            except Exception as err:
                _LOGGER.warning("Error disconnecting WebSocket coordinator: %s", err)
        
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok