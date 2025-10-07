"""Constants for the Hiking Portal integration."""
from datetime import timedelta

DOMAIN = "hiking_portal"
CONF_API_URL = "api_url"
CONF_TOKEN = "token"

DEFAULT_API_URL = "https://hiking-portal-api-554106646136.us-central1.run.app"
DEFAULT_SCAN_INTERVAL = timedelta(minutes=5)

# Sensor types
SENSOR_NEXT_HIKE = "next_hike"
SENSOR_UPCOMING_HIKES = "upcoming_hikes"
SENSOR_MY_HIKES = "my_hikes"
SENSOR_PENDING_USERS = "pending_users"
SENSOR_TOTAL_HIKES = "total_hikes"
SENSOR_DAYS_UNTIL_NEXT = "days_until_next_hike"
SENSOR_NEXT_HIKE_WEATHER = "next_hike_weather"
SENSOR_UNREAD_NOTIFICATIONS = "unread_notifications"

SENSOR_TYPES = {
    SENSOR_NEXT_HIKE: {
        "name": "Next Hike",
        "icon": "mdi:hiking",
        "unit": None,
    },
    SENSOR_UPCOMING_HIKES: {
        "name": "Upcoming Hikes Count",
        "icon": "mdi:calendar-multiple",
        "unit": "hikes",
    },
    SENSOR_MY_HIKES: {
        "name": "My Hikes Count",
        "icon": "mdi:account-heart",
        "unit": "hikes",
    },
    SENSOR_PENDING_USERS: {
        "name": "Pending Users",
        "icon": "mdi:account-clock",
        "unit": "users",
    },
    SENSOR_TOTAL_HIKES: {
        "name": "Total Hikes",
        "icon": "mdi:format-list-numbered",
        "unit": "hikes",
    },
    SENSOR_DAYS_UNTIL_NEXT: {
        "name": "Days Until Next Hike",
        "icon": "mdi:calendar-clock",
        "unit": "days",
    },
    SENSOR_NEXT_HIKE_WEATHER: {
        "name": "Next Hike Weather Status",
        "icon": "mdi:weather-partly-cloudy",
        "unit": None,
    },
    SENSOR_UNREAD_NOTIFICATIONS: {
        "name": "Unread Notifications",
        "icon": "mdi:bell",
        "unit": "notifications",
    },
}

# Platforms
PLATFORMS = ["sensor", "calendar", "binary_sensor"]
