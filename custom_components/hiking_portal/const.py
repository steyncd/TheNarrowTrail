"""Constants for the Hiking Portal integration."""
from datetime import timedelta

DOMAIN = "hiking_portal"
CONF_API_URL = "api_url"
CONF_TOKEN = "token"

# Default backend API URL (updated to deployed Cloud Run service in europe-west1)
DEFAULT_API_URL = "https://backend-4kzqyywlqq-ew.a.run.app"
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

# NEW: Notification Management (Feature 1)
SENSOR_NOTIFICATION_SUMMARY = "notification_summary"
BINARY_SENSOR_HAS_URGENT_NOTIFICATIONS = "has_urgent_notifications"

# NEW: Weather Integration (Feature 2)  
SENSOR_WEATHER_ALERTS = "weather_alerts"
BINARY_SENSOR_WEATHER_WARNING = "weather_warning"

# NEW: Payment Tracking (Feature 3)
SENSOR_OUTSTANDING_PAYMENTS = "outstanding_payments"
SENSOR_PAYMENT_SUMMARY = "payment_summary"
SENSOR_MY_PAYMENT_STATUS = "my_payment_status"

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
    # NEW: Notification Management sensors
    SENSOR_NOTIFICATION_SUMMARY: {
        "name": "Notification Summary",
        "icon": "mdi:bell-outline",
        "unit": None,
    },
    # NEW: Weather Integration sensors
    SENSOR_WEATHER_ALERTS: {
        "name": "Weather Alerts",
        "icon": "mdi:weather-lightning",
        "unit": "alerts",
    },
    # NEW: Payment Tracking sensors
    SENSOR_OUTSTANDING_PAYMENTS: {
        "name": "Outstanding Payments",
        "icon": "mdi:currency-usd",
        "unit": "ZAR",
    },
    SENSOR_PAYMENT_SUMMARY: {
        "name": "Payment Summary",
        "icon": "mdi:chart-pie",
        "unit": None,
    },
    SENSOR_MY_PAYMENT_STATUS: {
        "name": "My Payment Status",
        "icon": "mdi:credit-card-check",
        "unit": None,
    },
}

# Platforms
PLATFORMS = ["sensor", "calendar", "binary_sensor"]

# Binary sensor types
BINARY_SENSOR_TYPES = {
    BINARY_SENSOR_HAS_URGENT_NOTIFICATIONS: {
        "name": "Has Urgent Notifications",
        "icon": "mdi:bell-alert",
        "device_class": "problem",
    },
    BINARY_SENSOR_WEATHER_WARNING: {
        "name": "Weather Warning",
        "icon": "mdi:weather-lightning-rainy",
        "device_class": "problem",
    },
}
