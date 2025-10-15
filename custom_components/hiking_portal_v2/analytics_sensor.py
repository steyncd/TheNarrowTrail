"""Analytics sensors for Hiking Portal."""
import logging
from typing import Any, Dict, Optional

from homeassistant.components.sensor import SensorEntity, SensorDeviceClass
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.const import PERCENTAGE

from .const import DOMAIN
from .analytics_coordinator import HikingPortalAnalyticsCoordinator

_LOGGER = logging.getLogger(__name__)


# This file is now imported by sensor.py and doesn't need its own async_setup_entry
# The sensor classes are used directly by the main sensor platform


class HikingPortalAnalyticsSensor(CoordinatorEntity, SensorEntity):
    """Base class for Hiking Portal analytics sensors."""
    
    def __init__(self, coordinator: HikingPortalAnalyticsCoordinator, sensor_type: str, name: str):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._attr_name = f"Hiking Portal {name}"
        self._attr_unique_id = f"hiking_portal_analytics_{sensor_type}"
        self._attr_icon = "mdi:chart-line"
        
    @property
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, "analytics")},
            "name": "Hiking Portal Analytics",
            "manufacturer": "Hiking Portal",
            "model": "Analytics Dashboard",
        }


class TotalUsersSensor(HikingPortalAnalyticsSensor):
    """Sensor for total users."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "total_users", "Total Users")
        self._attr_icon = "mdi:account-group"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        overview = self.coordinator.get_overview_data()
        return overview.get('total_users', 0)
    
    @property
    def extra_state_attributes(self):
        """Return additional attributes."""
        growth_rate = self.coordinator.get_user_growth_rate()
        attrs = {}
        if growth_rate is not None:
            attrs['growth_rate'] = f"{growth_rate}%"
        return attrs


class TotalHikesSensor(HikingPortalAnalyticsSensor):
    """Sensor for total hikes."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "total_hikes", "Total Hikes")
        self._attr_icon = "mdi:hiking"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        overview = self.coordinator.get_overview_data()
        return overview.get('total_hikes', 0)


class ActiveUsersSensor(HikingPortalAnalyticsSensor):
    """Sensor for active users."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "active_users", "Active Users")
        self._attr_icon = "mdi:account-check"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        overview = self.coordinator.get_overview_data()
        return overview.get('active_users', 0)


class UserGrowthRateSensor(HikingPortalAnalyticsSensor):
    """Sensor for user growth rate."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "user_growth_rate", "User Growth Rate")
        self._attr_icon = "mdi:trending-up"
        self._attr_device_class = SensorDeviceClass.POWER_FACTOR
        self._attr_native_unit_of_measurement = PERCENTAGE
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        growth_rate = self.coordinator.get_user_growth_rate()
        return growth_rate if growth_rate is not None else 0


class WeeklyActiveUsersSensor(HikingPortalAnalyticsSensor):
    """Sensor for weekly active users."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "weekly_active_users", "Weekly Active Users")
        self._attr_icon = "mdi:calendar-week"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        trends = self.coordinator.get_active_users_trend()
        return trends.get('last_7_days', 0)


class MonthlyActiveUsersSensor(HikingPortalAnalyticsSensor):
    """Sensor for monthly active users."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "monthly_active_users", "Monthly Active Users")
        self._attr_icon = "mdi:calendar-month"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        trends = self.coordinator.get_active_users_trend()
        return trends.get('last_30_days', 0)


class QuarterlyActiveUsersSensor(HikingPortalAnalyticsSensor):
    """Sensor for quarterly active users."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "quarterly_active_users", "Quarterly Active Users")
        self._attr_icon = "mdi:calendar-range"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        trends = self.coordinator.get_active_users_trend()
        return trends.get('last_90_days', 0)


class TopParticipantSensor(HikingPortalAnalyticsSensor):
    """Sensor for top participant."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "top_participant", "Top Participant")
        self._attr_icon = "mdi:trophy"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        participants = self.coordinator.get_top_participants()
        if participants:
            return participants[0].get('name', 'Unknown')
        return "No data"
    
    @property
    def extra_state_attributes(self):
        """Return additional attributes."""
        participants = self.coordinator.get_top_participants()
        attrs = {}
        if participants:
            top = participants[0]
            attrs['hike_count'] = top.get('hike_count', 0)
            attrs['email'] = top.get('email', '')
            
            # Add top 5 participants
            for i, participant in enumerate(participants[:5]):
                attrs[f'rank_{i+1}_name'] = participant.get('name', '')
                attrs[f'rank_{i+1}_count'] = participant.get('hike_count', 0)
        return attrs


class UpcomingHikesSensor(HikingPortalAnalyticsSensor):
    """Sensor for upcoming hikes."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "upcoming_hikes", "Upcoming Hikes")
        self._attr_icon = "mdi:calendar-clock"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        distribution = self.coordinator.get_hike_distribution()
        status_data = distribution.get('by_status', [])
        for status in status_data:
            if status.get('status') == 'upcoming':
                return status.get('count', 0)
        return 0


class CompletedHikesSensor(HikingPortalAnalyticsSensor):
    """Sensor for completed hikes."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "completed_hikes", "Completed Hikes")
        self._attr_icon = "mdi:check-circle"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        distribution = self.coordinator.get_hike_distribution()
        status_data = distribution.get('by_status', [])
        for status in status_data:
            if status.get('status') == 'completed':
                return status.get('count', 0)
        return 0


class CancelledHikesSensor(HikingPortalAnalyticsSensor):
    """Sensor for cancelled hikes."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "cancelled_hikes", "Cancelled Hikes")
        self._attr_icon = "mdi:cancel"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        distribution = self.coordinator.get_hike_distribution()
        status_data = distribution.get('by_status', [])
        for status in status_data:
            if status.get('status') == 'cancelled':
                return status.get('count', 0)
        return 0


class AvgConfirmedAttendanceSensor(HikingPortalAnalyticsSensor):
    """Sensor for average confirmed attendance."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "avg_confirmed_attendance", "Avg Confirmed Attendance")
        self._attr_icon = "mdi:account-check-outline"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        attendance = self.coordinator.get_attendance_stats()
        return round(attendance.get('avg_confirmed', 0), 1)


class AvgInterestedAttendanceSensor(HikingPortalAnalyticsSensor):
    """Sensor for average interested attendance."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "avg_interested_attendance", "Avg Interested Attendance")
        self._attr_icon = "mdi:account-question-outline"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        attendance = self.coordinator.get_attendance_stats()
        return round(attendance.get('avg_interested', 0), 1)


class ConversionRateSensor(HikingPortalAnalyticsSensor):
    """Sensor for interest to confirmation conversion rate."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "conversion_rate", "Conversion Rate")
        self._attr_icon = "mdi:swap-horizontal"
        self._attr_device_class = SensorDeviceClass.POWER_FACTOR
        self._attr_native_unit_of_measurement = PERCENTAGE
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        return self.coordinator.get_conversion_rate()


class TotalCommentsSensor(HikingPortalAnalyticsSensor):
    """Sensor for total comments."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "total_comments", "Total Comments")
        self._attr_icon = "mdi:comment-multiple"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        engagement = self.coordinator.get_engagement_metrics()
        return engagement.get('total_comments', 0)


class CommentingUsersSensor(HikingPortalAnalyticsSensor):
    """Sensor for users who commented."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "commenting_users", "Commenting Users")
        self._attr_icon = "mdi:account-voice"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        engagement = self.coordinator.get_engagement_metrics()
        return engagement.get('users_who_commented', 0)


class AvgCommentsPerHikeSensor(HikingPortalAnalyticsSensor):
    """Sensor for average comments per hike."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "avg_comments_per_hike", "Avg Comments per Hike")
        self._attr_icon = "mdi:comment-processing"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        engagement = self.coordinator.get_engagement_metrics()
        return round(engagement.get('avg_comments_per_hike', 0), 1)


class EasyHikesSensor(HikingPortalAnalyticsSensor):
    """Sensor for easy difficulty hikes."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "easy_hikes", "Easy Hikes")
        self._attr_icon = "mdi:walk"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        distribution = self.coordinator.get_hike_distribution()
        difficulty_data = distribution.get('by_difficulty', [])
        for difficulty in difficulty_data:
            if difficulty.get('difficulty') == 'easy':
                return difficulty.get('count', 0)
        return 0


class ModerateHikesSensor(HikingPortalAnalyticsSensor):
    """Sensor for moderate difficulty hikes."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "moderate_hikes", "Moderate Hikes")
        self._attr_icon = "mdi:hiking"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        distribution = self.coordinator.get_hike_distribution()
        difficulty_data = distribution.get('by_difficulty', [])
        for difficulty in difficulty_data:
            if difficulty.get('difficulty') == 'moderate':
                return difficulty.get('count', 0)
        return 0


class HardHikesSensor(HikingPortalAnalyticsSensor):
    """Sensor for hard difficulty hikes."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "hard_hikes", "Hard Hikes")
        self._attr_icon = "mdi:mountain"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        distribution = self.coordinator.get_hike_distribution()
        difficulty_data = distribution.get('by_difficulty', [])
        for difficulty in difficulty_data:
            if difficulty.get('difficulty') == 'hard':
                return difficulty.get('count', 0)
        return 0


class MonthlyHikeTrendSensor(HikingPortalAnalyticsSensor):
    """Sensor for monthly hike trends."""
    
    def __init__(self, coordinator):
        super().__init__(coordinator, "monthly_hike_trend", "Monthly Hike Trend")
        self._attr_icon = "mdi:trending-up"
        
    @property
    def native_value(self):
        """Return the state of the sensor."""
        trends = self.coordinator.get_monthly_trends()
        if trends:
            return trends[-1].get('hike_count', 0)  # Latest month
        return 0
    
    @property
    def extra_state_attributes(self):
        """Return additional attributes."""
        trends = self.coordinator.get_monthly_trends()
        attrs = {}
        
        if trends:
            # Add last 6 months of data
            for i, trend in enumerate(trends[-6:]):
                month_name = trend.get('month', '').split('-')[1] if trend.get('month') else f'month_{i}'
                attrs[f'month_{i+1}_count'] = trend.get('hike_count', 0)
                attrs[f'month_{i+1}_cost'] = trend.get('total_cost', 0)
                attrs[f'month_{i+1}_name'] = month_name
                
            # Calculate trend direction
            if len(trends) >= 2:
                current = trends[-1].get('hike_count', 0)
                previous = trends[-2].get('hike_count', 0)
                if current > previous:
                    attrs['trend'] = 'increasing'
                elif current < previous:
                    attrs['trend'] = 'decreasing'
                else:
                    attrs['trend'] = 'stable'
        
        return attrs